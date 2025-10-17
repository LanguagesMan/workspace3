/**
 * OpenAI Article Adapter
 * 
 * Adapts articles to user's level and vocabulary using GPT-4o-mini
 * Cost-optimized: ~$0.002 per article
 * 
 * Smart Features:
 * - Simplifies to exact CEFR level
 * - Injects user's learning vocabulary naturally
 * - Maintains engaging style (TikTok/Instagram-style)
 * - Preserves original meaning
 */

const OpenAI = require('openai');
require('dotenv').config();

class OpenAIArticleAdapter {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.model = 'gpt-4o-mini'; // Cost-effective
        this.cache = new Map(); // Cache adapted articles
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    }

    /**
     * Adapt article to user's profile (SMARTEST approach)
     * Uses user's learning words and CEFR level
     */
    async adaptToUser(article, userProfile) {
        try {
            // Generate cache key
            const cacheKey = `${article.id}_${userProfile.userId}_${userProfile.cefrLevel}`;
            
            // Check cache first
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheExpiry) {
                    console.log(`✅ Using cached adaptation for ${article.title}`);
                    return cached.data;
                }
            }

            console.log(`🔄 Adapting article: "${article.title}" for ${userProfile.cefrLevel} level`);

            // Build smart prompt
            const prompt = this.buildSmartPrompt(article, userProfile);

            // Call OpenAI
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert Spanish language teacher who adapts content for learners. Keep the engaging, conversational style of modern social media.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            });

            const adaptedContent = response.choices[0].message.content;

            // Parse response
            const result = {
                adaptedTitle: this.extractTitle(adaptedContent, article.title),
                adaptedContent: this.extractContent(adaptedContent),
                originalArticle: article,
                userLevel: userProfile.cefrLevel,
                vocabularyUsed: this.countVocabularyUsage(adaptedContent, userProfile.learningWords),
                tokensUsed: response.usage?.total_tokens || 0,
                cost: this.calculateCost(response.usage?.total_tokens || 0),
                adaptedAt: new Date().toISOString()
            };

            // Cache result
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            console.log(`✅ Adapted successfully! Tokens: ${result.tokensUsed}, Cost: $${result.cost.toFixed(4)}`);

            return result;

        } catch (error) {
            console.error('Error adapting article:', error);
            // Fallback: return original article
            return {
                adaptedTitle: article.title,
                adaptedContent: article.content,
                originalArticle: article,
                error: error.message,
                fallback: true
            };
        }
    }

    /**
     * Build smart prompt (TikTok/Instagram style)
     */
    buildSmartPrompt(article, userProfile) {
        const learningWordsStr = userProfile.learningWords?.slice(0, 15).join(', ') || '';
        const interests = userProfile.interests?.join(', ') || 'general topics';

        return `Adapt this Spanish article for a ${userProfile.cefrLevel} level Spanish learner.

ORIGINAL ARTICLE:
Title: ${article.title}
Content: ${article.content}

USER PROFILE:
- Level: ${userProfile.cefrLevel}
- Learning vocabulary: ${learningWordsStr}
- Interests: ${interests}
- Style preference: Engaging, conversational (like TikTok/Instagram captions)

ADAPTATION RULES:
1. Simplify vocabulary and grammar to ${userProfile.cefrLevel} level
2. Use the user's learning words naturally (when they fit): ${learningWordsStr}
3. Keep sentences shorter and more digestible
4. Maintain engaging, conversational tone (like social media posts)
5. Keep the core message and interesting facts
6. Add line breaks for readability
7. Use emojis sparingly (1-2 max) if appropriate
8. Make it feel personal and relevant

Format your response as:
TÍTULO: [adapted title]

CONTENIDO:
[adapted content with natural vocabulary usage]

Keep it around ${this.getTargetLength(userProfile.cefrLevel)} words.`;
    }

    /**
     * Get target length based on CEFR level
     */
    getTargetLength(level) {
        const lengths = {
            'A1': 100,
            'A2': 150,
            'B1': 200,
            'B2': 250,
            'C1': 300,
            'C2': 350
        };
        return lengths[level] || 200;
    }

    /**
     * Extract title from response
     */
    extractTitle(response, fallback) {
        const titleMatch = response.match(/TÍTULO:\s*(.+?)(?:\n|$)/i);
        return titleMatch ? titleMatch[1].trim() : fallback;
    }

    /**
     * Extract content from response
     */
    extractContent(response) {
        const contentMatch = response.match(/CONTENIDO:\s*([\s\S]+)/i);
        if (contentMatch) {
            return contentMatch[1].trim();
        }
        // Fallback: remove title section
        return response.replace(/TÍTULO:.*?\n\n?/i, '').trim();
    }

    /**
     * Count how many learning words were used
     */
    countVocabularyUsage(content, learningWords) {
        if (!learningWords || learningWords.length === 0) return 0;
        
        const contentLower = content.toLowerCase();
        let count = 0;
        
        learningWords.forEach(word => {
            if (contentLower.includes(word.toLowerCase())) {
                count++;
            }
        });
        
        return count;
    }

    /**
     * Calculate cost (GPT-4o-mini pricing)
     */
    calculateCost(tokens) {
        // GPT-4o-mini: $0.15 per 1M input tokens, $0.60 per 1M output tokens
        // Rough estimate: ~50% input, 50% output
        const inputCost = (tokens * 0.5) * (0.15 / 1000000);
        const outputCost = (tokens * 0.5) * (0.60 / 1000000);
        return inputCost + outputCost;
    }

    /**
     * Batch adapt multiple articles
     */
    async adaptBatch(articles, userProfile, maxConcurrent = 3) {
        const results = [];
        
        for (let i = 0; i < articles.length; i += maxConcurrent) {
            const batch = articles.slice(i, i + maxConcurrent);
            console.log(`📦 Adapting batch ${Math.floor(i / maxConcurrent) + 1} (${batch.length} articles)...`);
            
            const batchResults = await Promise.all(
                batch.map(article => this.adaptToUser(article, userProfile))
            );
            
            results.push(...batchResults);
            
            // Small delay between batches to avoid rate limits
            if (i + maxConcurrent < articles.length) {
                await this.sleep(500);
            }
        }
        
        return results;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('✅ Cache cleared');
    }

    /**
     * Get cache stats
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            items: Array.from(this.cache.keys())
        };
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton
const adapter = new OpenAIArticleAdapter();
module.exports = adapter;
module.exports.OpenAIArticleAdapter = OpenAIArticleAdapter;


