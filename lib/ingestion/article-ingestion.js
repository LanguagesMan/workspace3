/**
 * 📰 ARTICLE INGESTION PIPELINE
 * 
 * Ingests Spanish articles from news sources:
 * - Fetches articles from RSS feeds (BBC Mundo, El País, DW Español)
 * - Uses Firecrawl for deep content extraction
 * - Generates difficulty variants (simplified & advanced)
 * - Extracts vocabulary and topics
 * - Stores in Article table
 */

const Parser = require('rss-parser');
const FirecrawlScraper = require('../firecrawl-scraper');
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const parser = new Parser({
    customFields: {
        item: ['media:content', 'media:thumbnail', 'enclosure']
    }
});

class ArticleIngestionPipeline {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        // Spanish news RSS feeds
        this.RSS_FEEDS = [
            {
                name: 'BBC Mundo',
                url: 'https://www.bbc.com/mundo/topics/cj48lp6k8d2t/rss.xml',
                level: 'B2',
                topics: ['news', 'world']
            },
            {
                name: 'El País',
                url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
                level: 'C1',
                topics: ['news', 'spain']
            },
            {
                name: 'DW Español',
                url: 'https://rss.dw.com/xml/rss-sp-all',
                level: 'B2',
                topics: ['news', 'world']
            },
            {
                name: 'BBC Mundo - América Latina',
                url: 'https://www.bbc.com/mundo/topics/cyzxw19r18qt/rss.xml',
                level: 'B2',
                topics: ['news', 'latinamerica']
            },
            {
                name: 'CNN en Español',
                url: 'http://rss.cnn.com/rss/cnn_spanish.rss',
                level: 'B2',
                topics: ['news', 'world']
            },
            {
                name: 'National Geographic en Español',
                url: 'https://www.nationalgeographic.es/feed',
                level: 'C1',
                topics: ['science', 'nature', 'culture']
            }
        ];
    }

    /**
     * Fetch articles from RSS feed
     */
    async fetchRSSFeed(feedConfig) {
        try {
            console.log(`   📡 Fetching ${feedConfig.name}...`);
            
            const feed = await parser.parseURL(feedConfig.url);
            
            const articles = feed.items.map(item => ({
                title: item.title,
                description: item.contentSnippet || item.description || '',
                url: item.link,
                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                sourceName: feedConfig.name,
                sourceUrl: feedConfig.url,
                thumbnail: this.extractThumbnail(item),
                suggestedLevel: feedConfig.level,
                suggestedTopics: feedConfig.topics
            }));

            console.log(`   ✅ Found ${articles.length} articles`);
            return articles;

        } catch (error) {
            console.error(`   ❌ Error fetching ${feedConfig.name}:`, error.message);
            return [];
        }
    }

    /**
     * Extract thumbnail from RSS item
     */
    extractThumbnail(item) {
        // Try various thumbnail fields
        if (item['media:thumbnail']) {
            return item['media:thumbnail'].$.url || item['media:thumbnail'];
        }
        if (item['media:content']) {
            return item['media:content'].$.url || item['media:content'];
        }
        if (item.enclosure && item.enclosure.url) {
            return item.enclosure.url;
        }
        return null;
    }

    /**
     * Scrape full article content using Firecrawl
     */
    async scrapeArticleContent(url) {
        try {
            const result = await FirecrawlScraper.default.scrapeArticle(url);
            
            if (result.success && result.fullContent) {
                return {
                    success: true,
                    content: result.fullContent,
                    metadata: result.metadata,
                    wordCount: result.wordCount
                };
            }

            return { success: false, error: 'No content extracted' };

        } catch (error) {
            console.error(`   ⚠️  Scraping failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Analyze article difficulty
     */
    async analyzeArticleDifficulty(content) {
        try {
            // Count words
            const words = content.split(/\s+/).filter(w => w.length > 0);
            const wordCount = words.length;
            const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
            const vocabularyDensity = uniqueWords / wordCount;

            // Calculate average sentence length
            const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const avgSentenceLength = wordCount / sentences.length;

            // Map to CEFR level based on metrics
            let level = 'B1';
            if (avgSentenceLength < 10 && vocabularyDensity < 0.6) level = 'A2';
            else if (avgSentenceLength < 12 && vocabularyDensity < 0.65) level = 'B1';
            else if (avgSentenceLength < 15 && vocabularyDensity < 0.72) level = 'B2';
            else if (avgSentenceLength < 20) level = 'C1';
            else level = 'C2';

            return {
                level,
                wordCount,
                uniqueWords,
                vocabularyDensity,
                avgSentenceLength,
                readingTime: Math.ceil(wordCount / 200) // 200 words per minute
            };

        } catch (error) {
            console.error('Error analyzing difficulty:', error);
            return { level: 'B1', wordCount: 0 };
        }
    }

    /**
     * Generate simplified version for lower levels
     */
    async generateSimplifiedVersion(originalContent, targetLevel = 'A2') {
        try {
            const prompt = `Rewrite this Spanish article for ${targetLevel} learners (simplified vocabulary and shorter sentences). Keep the main ideas but make it easier to understand. Only respond with the rewritten text, no explanations.

Original article:
${originalContent.substring(0, 2000)}`;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 1500
            });

            return response.choices[0].message.content.trim();

        } catch (error) {
            console.error('Error generating simplified version:', error.message);
            return null;
        }
    }

    /**
     * Generate advanced version for higher levels
     */
    async generateAdvancedVersion(originalContent, targetLevel = 'C1') {
        try {
            const prompt = `Rewrite this Spanish article for ${targetLevel} learners (more sophisticated vocabulary and complex sentences). Expand on the ideas with more detail. Only respond with the rewritten text, no explanations.

Original article:
${originalContent.substring(0, 2000)}`;

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 2000
            });

            return response.choices[0].message.content.trim();

        } catch (error) {
            console.error('Error generating advanced version:', error.message);
            return null;
        }
    }

    /**
     * Extract topics from article content
     */
    extractTopics(article, content) {
        const topics = [...(article.suggestedTopics || [])];
        const text = (article.title + ' ' + article.description + ' ' + content).toLowerCase();

        const topicKeywords = {
            'politics': ['política', 'gobierno', 'presidente', 'elecciones', 'parlamento'],
            'economy': ['economía', 'mercado', 'empresa', 'negocio', 'finanzas'],
            'technology': ['tecnología', 'internet', 'digital', 'app', 'innovación'],
            'science': ['ciencia', 'científico', 'investigación', 'estudio'],
            'health': ['salud', 'medicina', 'hospital', 'enfermedad', 'tratamiento'],
            'sports': ['deporte', 'fútbol', 'equipo', 'partido', 'campeonato'],
            'culture': ['cultura', 'arte', 'música', 'cine', 'teatro'],
            'environment': ['medio ambiente', 'clima', 'naturaleza', 'ecología', 'sostenible'],
            'education': ['educación', 'universidad', 'estudiante', 'escuela']
        };

        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => text.includes(keyword)) && !topics.includes(topic)) {
                topics.push(topic);
            }
        }

        return topics.slice(0, 5); // Limit to 5 topics
    }

    /**
     * Process and store a single article
     */
    async processArticle(article, generateVariants = true) {
        try {
            // Check if already exists
            const articleId = Buffer.from(article.url).toString('base64').substring(0, 32);
            const existing = await prisma.article.findUnique({
                where: { id: articleId }
            });

            if (existing) {
                console.log(`   ⏭️  Skipping (already exists): ${article.title.substring(0, 50)}...`);
                return { success: true, skipped: true };
            }

            // Scrape full content
            console.log(`   🔍 Scraping: ${article.title.substring(0, 50)}...`);
            const scraped = await this.scrapeArticleContent(article.url);

            if (!scraped.success || !scraped.content || scraped.content.length < 200) {
                console.log(`   ⚠️  Insufficient content, skipping`);
                return { success: false, error: 'Insufficient content' };
            }

            // Analyze difficulty
            const analysis = await this.analyzeArticleDifficulty(scraped.content);

            // Extract topics
            const topics = this.extractTopics(article, scraped.content);

            // Generate difficulty variants if enabled
            let simplifiedContent = null;
            let advancedContent = null;

            if (generateVariants && this.openai.apiKey) {
                if (analysis.level !== 'A2') {
                    console.log(`   ✍️  Generating simplified version...`);
                    simplifiedContent = await this.generateSimplifiedVersion(scraped.content);
                }
                
                if (analysis.level !== 'C1' && analysis.level !== 'C2') {
                    console.log(`   ✍️  Generating advanced version...`);
                    advancedContent = await this.generateAdvancedVersion(scraped.content);
                }
            }

            // Store in database
            const thumbnail = article.thumbnail || scraped.metadata?.ogImage || null;
            
            await prisma.article.create({
                data: {
                    id: articleId,
                    title: article.title,
                    description: article.description.substring(0, 500),
                    content: scraped.content,
                    level: analysis.level,
                    topics: JSON.stringify(topics),
                    sourceUrl: article.url,
                    sourceName: article.sourceName,
                    hasAudio: false // Will be generated later by TTS service
                }
            });

            // Store variants if generated (would need additional table/field)
            // For now, just log success
            console.log(`   ✅ Stored: ${article.title.substring(0, 50)}... (${analysis.level}, ${analysis.wordCount} words)`);

            return {
                success: true,
                articleId,
                level: analysis.level,
                wordCount: analysis.wordCount,
                hasVariants: !!(simplifiedContent || advancedContent)
            };

        } catch (error) {
            console.error(`   ❌ Error processing article:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Ingest articles from a single RSS feed
     */
    async ingestFeed(feedConfig, limit = 10) {
        console.log(`\n📰 Ingesting from ${feedConfig.name}...`);

        try {
            // Fetch RSS feed
            const articles = await this.fetchRSSFeed(feedConfig);
            
            if (articles.length === 0) {
                return { ingested: 0, skipped: 0, failed: 0 };
            }

            let ingested = 0;
            let skipped = 0;
            let failed = 0;

            // Process articles (limit to specified number)
            for (const article of articles.slice(0, limit)) {
                const result = await this.processArticle(article, true);
                
                if (result.success && !result.skipped) {
                    ingested++;
                } else if (result.skipped) {
                    skipped++;
                } else {
                    failed++;
                }

                // Rate limiting: wait 3 seconds between articles (Firecrawl limit)
                await this.sleep(3000);
            }

            console.log(`   📊 Feed complete: ${ingested} ingested, ${skipped} skipped, ${failed} failed`);
            return { ingested, skipped, failed };

        } catch (error) {
            console.error(`Error ingesting feed ${feedConfig.name}:`, error.message);
            return { ingested: 0, skipped: 0, failed: 0 };
        }
    }

    /**
     * Ingest articles from all configured feeds
     */
    async ingestAll(articlesPerFeed = 10, generateVariants = true) {
        console.log('📰 ARTICLE INGESTION PIPELINE - STARTING\n');
        console.log(`Target: ${this.RSS_FEEDS.length} feeds, ${articlesPerFeed} articles each\n`);

        if (!FirecrawlScraper.default || !process.env.FIRECRAWL_API_KEY) {
            console.warn('⚠️  FIRECRAWL_API_KEY not configured - scraping may be limited\n');
        }

        let totalIngested = 0;
        let totalSkipped = 0;
        let totalFailed = 0;

        for (const feed of this.RSS_FEEDS) {
            const result = await this.ingestFeed(feed, articlesPerFeed);
            totalIngested += result.ingested;
            totalSkipped += result.skipped;
            totalFailed += result.failed;

            // Wait 5 seconds between feeds
            await this.sleep(5000);
        }

        console.log('\n✅ ARTICLE INGESTION COMPLETE');
        console.log(`   📊 Total: ${totalIngested} ingested, ${totalSkipped} skipped, ${totalFailed} failed`);
        
        const total = totalIngested + totalSkipped + totalFailed;
        if (total > 0) {
            console.log(`   🎯 Success rate: ${((totalIngested / total) * 100).toFixed(1)}%`);
        }

        return {
            success: true,
            totalIngested,
            totalSkipped,
            totalFailed,
            feeds: this.RSS_FEEDS.length
        };
    }

    /**
     * Get ingestion statistics
     */
    async getStats() {
        try {
            const totalArticles = await prisma.article.count();
            const withAudio = await prisma.article.count({
                where: { hasAudio: true }
            });

            const byLevel = await prisma.article.groupBy({
                by: ['level'],
                _count: true
            });

            const recentArticles = await prisma.article.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                }
            });

            return {
                success: true,
                stats: {
                    total: totalArticles,
                    withAudio: withAudio,
                    withoutAudio: totalArticles - withAudio,
                    lastWeek: recentArticles,
                    byLevel: byLevel.reduce((acc, item) => {
                        acc[item.level] = item._count;
                        return acc;
                    }, {})
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
const articleIngestionPipeline = new ArticleIngestionPipeline();
module.exports = articleIngestionPipeline;

// CLI usage
if (require.main === module) {
    const articlesPerFeed = parseInt(process.argv[2]) || 10;
    
    articleIngestionPipeline.ingestAll(articlesPerFeed)
        .then(result => {
            console.log('\n📈 Final Results:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Fatal error:', error);
            process.exit(1);
        });
}


