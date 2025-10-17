/**
 * 🎯 CONTENT ENRICHMENT PIPELINE
 * 
 * Enriches ingested content with:
 * - Vocabulary lists (key words and phrases)
 * - CEFR level tags (A1-C2)
 * - Topics and categories
 * - Comprehension questions
 * - Word frequency analysis
 */

const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

class EnrichmentPipeline {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        // Load Spanish frequency data
        this.frequencyData = this.loadFrequencyData();
    }

    /**
     * Load Spanish word frequency data
     */
    loadFrequencyData() {
        try {
            const dataPath = path.join(__dirname, '../../data/spanish-frequency-10k.json');
            if (fs.existsSync(dataPath)) {
                const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                return data.words || {};
            }
        } catch (error) {
            console.warn('⚠️  Spanish frequency data not found, using basic analysis');
        }
        return {};
    }

    /**
     * Extract vocabulary from Spanish text
     */
    extractVocabulary(text, targetLevel = 'B1', limit = 20) {
        // Tokenize and clean text
        const words = text
            .toLowerCase()
            .replace(/[¿¡.,!?;:()"«»]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2 && /^[a-záéíóúñü]+$/.test(w));

        // Count word frequencies
        const wordCounts = {};
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

        // Get unique words with frequency data
        const vocabulary = Object.entries(wordCounts)
            .map(([word, count]) => {
                const freqData = this.frequencyData[word];
                return {
                    word,
                    count,
                    rank: freqData?.rank || 10000,
                    cefrLevel: freqData?.cefrLevel || 'C1',
                    frequency: freqData?.frequency || 0
                };
            })
            .filter(item => {
                // Filter for learning value: not too common, not too rare
                return item.rank > 100 && item.rank < 8000;
            })
            .sort((a, b) => {
                // Sort by learning value (combination of frequency and level)
                const aScore = a.count * 2 + (8000 - a.rank) / 1000;
                const bScore = b.count * 2 + (8000 - b.rank) / 1000;
                return bScore - aScore;
            })
            .slice(0, limit);

        return vocabulary;
    }

    /**
     * Generate comprehension questions using GPT-4
     */
    async generateComprehensionQuestions(content, level = 'B1', count = 5) {
        try {
            const prompt = `Create ${count} comprehension questions in Spanish for this ${level} level text. Format as JSON array with structure: [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..."}]

Text:
${content.substring(0, 1500)}

Only respond with valid JSON, no other text.`;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 1000
            });

            const jsonMatch = response.choices[0].message.content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return [];

        } catch (error) {
            console.error('Error generating questions:', error.message);
            return [];
        }
    }

    /**
     * Extract key phrases and expressions
     */
    async extractKeyPhrases(text, limit = 10) {
        try {
            const prompt = `Extract the ${limit} most useful Spanish phrases/expressions for language learners from this text. Format as JSON array: ["phrase 1", "phrase 2", ...]

Text:
${text.substring(0, 1000)}

Only respond with valid JSON array.`;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 300
            });

            const jsonMatch = response.choices[0].message.content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return [];

        } catch (error) {
            console.error('Error extracting phrases:', error.message);
            return [];
        }
    }

    /**
     * Identify grammatical structures in text
     */
    identifyGrammarStructures(text) {
        const structures = [];
        const lowerText = text.toLowerCase();

        const grammarPatterns = {
            'present_tense': /\b(soy|eres|es|somos|sois|son|tengo|tienes|tiene)\b/,
            'preterite': /\b(fui|fue|fueron|hice|hizo|dije|dijo)\b/,
            'imperfect': /\b(era|eras|iba|ibas|tenía|tenías)\b/,
            'subjunctive': /\b(sea|seas|vaya|vayas|tenga|tengas|haga|hagas)\b/,
            'conditional': /\b(sería|serías|haría|harías|tendría|tendrías)\b/,
            'imperative': /\b(habla|come|escribe|lee|estudia)\b/,
            'reflexive': /\b(me|te|se|nos|os)\s+(\w+o|as?|an?)\b/
        };

        for (const [structure, pattern] of Object.entries(grammarPatterns)) {
            if (pattern.test(lowerText)) {
                structures.push(structure);
            }
        }

        return structures;
    }

    /**
     * Calculate detailed CEFR metrics
     */
    calculateCEFRMetrics(text) {
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        const wordCount = words.length;
        const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
        const vocabularyDensity = uniqueWords / wordCount;
        const avgSentenceLength = wordCount / sentences.length;
        
        // Analyze word difficulty distribution
        const levelCounts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
        
        words.forEach(word => {
            const clean = word.toLowerCase().replace(/[^a-záéíóúñü]/g, '');
            const freqData = this.frequencyData[clean];
            if (freqData && freqData.cefrLevel) {
                levelCounts[freqData.cefrLevel]++;
            }
        });

        // Calculate dominant level
        const totalKnownWords = Object.values(levelCounts).reduce((a, b) => a + b, 0);
        const levelPercentages = {};
        Object.entries(levelCounts).forEach(([level, count]) => {
            levelPercentages[level] = totalKnownWords > 0 ? (count / totalKnownWords * 100).toFixed(1) : 0;
        });

        // Determine CEFR level
        let cefrLevel = 'B1';
        if (avgSentenceLength < 10 && vocabularyDensity < 0.6) cefrLevel = 'A1';
        else if (avgSentenceLength < 12 && vocabularyDensity < 0.65) cefrLevel = 'A2';
        else if (avgSentenceLength < 15 && vocabularyDensity < 0.7) cefrLevel = 'B1';
        else if (avgSentenceLength < 18 && vocabularyDensity < 0.75) cefrLevel = 'B2';
        else if (avgSentenceLength < 22) cefrLevel = 'C1';
        else cefrLevel = 'C2';

        return {
            cefrLevel,
            wordCount,
            uniqueWords,
            vocabularyDensity: vocabularyDensity.toFixed(3),
            avgSentenceLength: avgSentenceLength.toFixed(1),
            levelDistribution: levelPercentages,
            readingTime: Math.ceil(wordCount / 200) // minutes
        };
    }

    /**
     * Enrich a single article
     */
    async enrichArticle(articleId) {
        try {
            const article = await prisma.article.findUnique({
                where: { id: articleId }
            });

            if (!article) {
                throw new Error('Article not found');
            }

            console.log(`\n📰 Enriching article: ${article.title.substring(0, 50)}...`);

            // Extract vocabulary
            console.log('   📚 Extracting vocabulary...');
            const vocabulary = this.extractVocabulary(article.content, article.level, 25);

            // Extract key phrases
            console.log('   💬 Extracting key phrases...');
            const keyPhrases = this.openai.apiKey ? 
                await this.extractKeyPhrases(article.content, 10) : [];

            // Generate comprehension questions
            console.log('   ❓ Generating comprehension questions...');
            const questions = this.openai.apiKey ? 
                await this.generateComprehensionQuestions(article.content, article.level, 5) : [];

            // Identify grammar structures
            const grammarStructures = this.identifyGrammarStructures(article.content);

            // Calculate CEFR metrics
            const cefrMetrics = this.calculateCEFRMetrics(article.content);

            // Store enrichment data (would need additional table or JSONB field)
            // For now, we'll use a content_features pattern similar to the Supabase schema
            
            const enrichmentData = {
                vocabulary: vocabulary.map(v => v.word),
                keyPhrases,
                questions,
                grammarStructures,
                cefrMetrics,
                topWords: vocabulary.slice(0, 10)
            };

            console.log(`   ✅ Enriched with:`);
            console.log(`      - ${vocabulary.length} vocabulary words`);
            console.log(`      - ${keyPhrases.length} key phrases`);
            console.log(`      - ${questions.length} comprehension questions`);
            console.log(`      - ${grammarStructures.length} grammar structures`);
            console.log(`      - CEFR: ${cefrMetrics.cefrLevel} (${cefrMetrics.wordCount} words)`);

            return {
                success: true,
                articleId,
                enrichmentData
            };

        } catch (error) {
            console.error(`   ❌ Enrichment failed:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Enrich a YouTube video
     */
    async enrichYouTubeVideo(videoId) {
        try {
            const video = await prisma.youTubeVideo.findUnique({
                where: { youtubeId: videoId }
            });

            if (!video) {
                throw new Error('Video not found');
            }

            console.log(`\n📺 Enriching video: ${video.title.substring(0, 50)}...`);

            // For videos, we would need the transcript
            // Assuming transcript is stored somewhere or can be fetched
            
            // Extract topics from title and existing data
            const topics = JSON.parse(video.topics || '[]');
            
            console.log(`   ✅ Video enrichment complete`);
            console.log(`      - Level: ${video.level}`);
            console.log(`      - Topics: ${topics.join(', ')}`);

            return {
                success: true,
                videoId,
                level: video.level,
                topics
            };

        } catch (error) {
            console.error(`   ❌ Enrichment failed:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Enrich a podcast clip
     */
    async enrichPodcastClip(clipId) {
        try {
            const clip = await prisma.podcastClip.findUnique({
                where: { id: clipId },
                include: { podcast: true }
            });

            if (!clip) {
                throw new Error('Clip not found');
            }

            console.log(`\n🎙️ Enriching podcast clip ${clip.clipNumber}...`);

            // Extract vocabulary
            const vocabulary = this.extractVocabulary(clip.transcript, clip.level, 15);

            // Extract key phrases
            const keyPhrases = this.openai.apiKey ? 
                await this.extractKeyPhrases(clip.transcript, 5) : [];

            // Generate questions
            const questions = this.openai.apiKey ? 
                await this.generateComprehensionQuestions(clip.transcript, clip.level, 3) : [];

            console.log(`   ✅ Enriched with:`);
            console.log(`      - ${vocabulary.length} vocabulary words`);
            console.log(`      - ${keyPhrases.length} key phrases`);
            console.log(`      - ${questions.length} questions`);

            return {
                success: true,
                clipId,
                vocabulary: vocabulary.map(v => v.word),
                keyPhrases,
                questions
            };

        } catch (error) {
            console.error(`   ❌ Enrichment failed:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Batch enrich all unenriched content
     */
    async enrichAll(limits = { articles: 10, videos: 10, clips: 10 }) {
        console.log('🎯 CONTENT ENRICHMENT PIPELINE - STARTING\n');

        const results = {
            articles: { processed: 0, failed: 0 },
            videos: { processed: 0, failed: 0 },
            clips: { processed: 0, failed: 0 }
        };

        // Enrich articles
        console.log('📰 Enriching articles...');
        const articles = await prisma.article.findMany({
            take: limits.articles,
            orderBy: { createdAt: 'desc' }
        });

        for (const article of articles) {
            const result = await this.enrichArticle(article.id);
            if (result.success) results.articles.processed++;
            else results.articles.failed++;
            
            await this.sleep(1000);
        }

        // Enrich videos
        console.log('\n📺 Enriching videos...');
        const videos = await prisma.youTubeVideo.findMany({
            take: limits.videos,
            orderBy: { createdAt: 'desc' }
        });

        for (const video of videos) {
            const result = await this.enrichYouTubeVideo(video.youtubeId);
            if (result.success) results.videos.processed++;
            else results.videos.failed++;
            
            await this.sleep(500);
        }

        // Enrich podcast clips
        console.log('\n🎙️ Enriching podcast clips...');
        const clips = await prisma.podcastClip.findMany({
            take: limits.clips,
            orderBy: { createdAt: 'desc' }
        });

        for (const clip of clips) {
            const result = await this.enrichPodcastClip(clip.id);
            if (result.success) results.clips.processed++;
            else results.clips.failed++;
            
            await this.sleep(1000);
        }

        console.log('\n✅ ENRICHMENT COMPLETE');
        console.log(`   📰 Articles: ${results.articles.processed} processed, ${results.articles.failed} failed`);
        console.log(`   📺 Videos: ${results.videos.processed} processed, ${results.videos.failed} failed`);
        console.log(`   🎙️ Clips: ${results.clips.processed} processed, ${results.clips.failed} failed`);

        const totalProcessed = results.articles.processed + results.videos.processed + results.clips.processed;
        const totalFailed = results.articles.failed + results.videos.failed + results.clips.failed;

        console.log(`   🎯 Total: ${totalProcessed} enriched, ${totalFailed} failed`);

        return {
            success: true,
            results,
            totalProcessed,
            totalFailed
        };
    }

    /**
     * Get enrichment statistics
     */
    async getStats() {
        try {
            const articleCount = await prisma.article.count();
            const videoCount = await prisma.youTubeVideo.count();
            const clipCount = await prisma.podcastClip.count();

            return {
                success: true,
                stats: {
                    totalContent: articleCount + videoCount + clipCount,
                    articles: articleCount,
                    videos: videoCount,
                    clips: clipCount
                }
            };

        } catch (error) {
            console.error('Error getting stats:', error);
            return { success: false };
        }
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton
const enrichmentPipeline = new EnrichmentPipeline();
module.exports = enrichmentPipeline;

// CLI usage
if (require.main === module) {
    const limits = {
        articles: parseInt(process.argv[2]) || 10,
        videos: parseInt(process.argv[3]) || 10,
        clips: parseInt(process.argv[4]) || 10
    };
    
    enrichmentPipeline.enrichAll(limits)
        .then(result => {
            console.log('\n📈 Final Results:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Fatal error:', error);
            process.exit(1);
        });
}


