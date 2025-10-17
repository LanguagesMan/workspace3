/**
 * 🔥 INTELLIGENT ARTICLES FEED API
 * 
 * ChatGPT Pulse + Perplexity News Style Feed
 * Features:
 * - Real-time news scraping with Firecrawl
 * - AI-powered content curation
 * - Difficulty-based personalization
 * - Multi-source aggregation
 * - Translation and comprehension analysis
 */

const express = require('express');
const router = express.Router();
const articleAnalyzer = require('./article-difficulty-analyzer');
const recommendationEngine = require('./recommendation-engine-enhanced');
const { supabase, isConfigured } = require('./supabase-client');
const translationService = require('./translation-service-fast');

// Import personalization engine
let personalizationEngine;
try {
    personalizationEngine = require('./article-personalization-engine');
    console.log('✅ Personalization engine loaded');
} catch (error) {
    console.warn('⚠️ Personalization engine not available:', error.message);
}

// Import Firecrawl scraper and queue (ES modules)
let firecrawlScraper, scrapingQueue;
(async () => {
    try {
        const scraperModule = await import('./firecrawl-scraper.js');
        const queueModule = await import('./article-scraping-queue.js');
        firecrawlScraper = scraperModule.default;
        scrapingQueue = queueModule.default;
        console.log('✅ Firecrawl integration loaded');
    } catch (error) {
        console.warn('⚠️ Firecrawl not available:', error.message);
    }
})();

// Article sources configuration
const ARTICLE_SOURCES = {
    spanish: [
        {
            name: 'El País',
            url: 'https://elpais.com',
            rss: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
            category: 'news',
            difficulty: 'B2'
        },
        {
            name: 'El Mundo',
            url: 'https://elmundo.es',
            rss: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml',
            category: 'news',
            difficulty: 'B2'
        },
        {
            name: 'BBC Mundo',
            url: 'https://bbc.com/mundo',
            rss: 'https://feeds.bbci.co.uk/mundo/rss.xml',
            category: 'international',
            difficulty: 'B1'
        },
        {
            name: '20 Minutos',
            url: 'https://20minutos.es',
            rss: 'https://www.20minutos.es/rss/',
            category: 'news',
            difficulty: 'A2'
        },
        {
            name: 'CNN Español',
            url: 'https://cnnespanol.cnn.com',
            rss: 'https://cnnespanol.cnn.com/feed/',
            category: 'international',
            difficulty: 'B2'
        }
    ],
    topics: {
        technology: [
            { url: 'https://hipertextual.com', difficulty: 'B2' },
            { url: 'https://wwwhatsnew.com', difficulty: 'B1' }
        ],
        sports: [
            { url: 'https://marca.com', difficulty: 'B1' },
            { url: 'https://as.com', difficulty: 'B1' }
        ],
        culture: [
            { url: 'https://elpais.com/cultura', difficulty: 'C1' },
            { url: 'https://abc.es/cultura', difficulty: 'B2' }
        ],
        entertainment: [
            { url: 'https://sensacine.com', difficulty: 'B1' },
            { url: 'https://hobbyconsolas.com', difficulty: 'A2' }
        ]
    }
};

class ArticlesFeedAPI {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = 15 * 60 * 1000; // 15 minutes
        this.Parser = require('rss-parser');
        this.parser = new this.Parser({
            customFields: {
                item: [
                    ['media:content', 'mediaContent'],
                    ['media:thumbnail', 'mediaThumbnail'],
                    ['content:encoded', 'contentEncoded']
                ]
            }
        });
    }

    /**
     * Get personalized articles feed
     */
    async getPersonalizedFeed(userId, options = {}) {
        const {
            category = 'all',
            limit = 20,
            difficulty = null,
            withAnalysis = true,
            includeTranslations = true
        } = options;

        try {
            console.log(`📰 Fetching personalized feed for user ${userId}...`);

            // Get user preferences and level
            const userProfile = await this.getUserProfile(userId);
            const userLevel = userProfile?.cefrLevel || difficulty || 'B1';

            // Check cache
            const cacheKey = `feed_${userId}_${category}_${userLevel}_${limit}`;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheExpiry) {
                    console.log('✅ Returning cached feed');
                    return cached.data;
                }
            }

            // Fetch articles from multiple sources
            const articles = await this.fetchArticlesFromSources(category, userLevel);

            // Analyze difficulty for each article
            if (withAnalysis) {
                for (const article of articles) {
                    if (article.content) {
                        const analysis = await articleAnalyzer.analyzeArticle(article.content);
                        const comprehension = await articleAnalyzer.calculateUserComprehension(
                            article.content,
                            userId
                        );
                        
                        article.analysis = analysis;
                        article.comprehension = comprehension;
                        article.difficulty = analysis.cefrLevel;
                    }
                }
            }

            // Apply personalization
            const personalized = await this.personalizeArticles(articles, userProfile, limit);

            // Add translations if requested
            if (includeTranslations) {
                for (const article of personalized) {
                    if (!article.titleEnglish && article.title) {
                        article.titleEnglish = await this.translateText(article.title);
                    }
                    if (!article.excerptEnglish && article.excerpt) {
                        article.excerptEnglish = await this.translateText(article.excerpt);
                    }
                }
            }

            // Cache results
            this.cache.set(cacheKey, {
                data: personalized,
                timestamp: Date.now()
            });

            console.log(`✅ Returned ${personalized.length} personalized articles`);
            return personalized;

        } catch (error) {
            console.error('Error getting personalized feed:', error);
            return this.getFallbackArticles(userId, limit);
        }
    }

    /**
     * Fetch articles from multiple sources
     */
    async fetchArticlesFromSources(category, userLevel) {
        // Try to get cached articles from Supabase first
        if (isConfigured()) {
            const cachedArticles = await this.getCachedArticles(category, userLevel);
            if (cachedArticles.length > 0) {
                console.log(`✅ Using ${cachedArticles.length} cached articles from database`);
                return cachedArticles;
            }
        }

        console.log('📡 Fetching fresh articles from sources...');
        const articles = [];

        // Determine sources based on category
        const sources = category === 'all' 
            ? ARTICLE_SOURCES.spanish 
            : this.getSourcesByCategory(category);

        // Fetch from each source in parallel
        const fetchPromises = sources.map(source => 
            this.fetchFromSource(source).catch(err => {
                console.error(`Error fetching from ${source.name}:`, err.message);
                return [];
            })
        );

        const results = await Promise.all(fetchPromises);
        
        // Flatten results
        results.forEach(sourceArticles => {
            articles.push(...sourceArticles);
        });

        // Store in Supabase for caching
        if (isConfigured() && articles.length > 0) {
            await this.storeArticlesInDatabase(articles);
        }

        // Filter by difficulty appropriateness
        const filteredArticles = this.filterByDifficultyRange(articles, userLevel);

        // Sort by publication date
        filteredArticles.sort((a, b) => 
            new Date(b.publishedAt) - new Date(a.publishedAt)
        );

        return filteredArticles;
    }

    /**
     * Fetch articles from a single RSS source
     */
    async fetchFromSource(source) {
        try {
            const feed = await this.parser.parseURL(source.rss);
            
            const articles = feed.items.slice(0, 10).map((item, idx) => {
                const content = this.extractContent(item);
                const excerpt = this.extractExcerpt(item);
                
                const article = {
                    id: `${source.name.toLowerCase().replace(/\s/g, '-')}-${idx}-${Date.now()}`,
                    title: this.cleanText(item.title || 'Sin título'),
                    titleEnglish: '',
                    content,
                    contentEnglish: '',
                    excerpt,
                    excerptEnglish: '',
                    image: this.extractImage(item) || this.getDefaultImage(source.category),
                    category: source.category || 'news',
                    source: source.name,
                    sourceUrl: source.url,
                    articleUrl: item.link,
                    difficulty: source.difficulty || 'B1',
                    publishedAt: item.pubDate || new Date().toISOString(),
                    author: item.creator || item.author || source.name,
                    readTime: this.estimateReadTime(item.contentSnippet || item.content || ''),
                    verified: true,
                    needsFullContent: false
                };

                // Check if article needs deep scraping with Firecrawl
                if (this.needsDeepScraping(content, excerpt)) {
                    article.needsFullContent = true;
                    // Queue for background scraping (don't wait for it)
                    this.queueForDeepScraping(article).catch(err => {
                        console.error('Error queuing article:', err);
                    });
                }

                return article;
            });

            return articles;

        } catch (error) {
            console.error(`Error fetching from ${source.name}:`, error.message);
            return [];
        }
    }

    /**
     * Extract clean content from RSS item
     */
    extractContent(item) {
        // Try different content fields in order of preference
        const contentSources = [
            item.contentEncoded,
            item['content:encoded'],
            item.content,
            item.contentSnippet,
            item.summary,
            item.description
        ];

        for (const source of contentSources) {
            if (source) {
                const cleaned = this.cleanText(source);
                if (cleaned.length > 100) {
                    return cleaned.substring(0, 2000); // Limit to 2000 chars
                }
            }
        }

        return item.title || '';
    }

    /**
     * Extract excerpt from content
     */
    extractExcerpt(item) {
        const content = this.extractContent(item);
        const cleaned = this.cleanText(content);
        
        // Get first 200 characters
        let excerpt = cleaned.substring(0, 200);
        
        // Try to cut at sentence end
        const sentenceEnd = excerpt.lastIndexOf('.');
        if (sentenceEnd > 100) {
            excerpt = excerpt.substring(0, sentenceEnd + 1);
        } else {
            excerpt += '...';
        }

        return excerpt;
    }

    /**
     * Check if article needs deep scraping (Firecrawl)
     * Triggered when excerpt is too short
     */
    needsDeepScraping(content, excerpt) {
        const MIN_CONTENT_LENGTH = 300;
        const MIN_EXCERPT_LENGTH = 100;

        return (
            content.length < MIN_CONTENT_LENGTH || 
            excerpt.length < MIN_EXCERPT_LENGTH
        );
    }

    /**
     * Queue article for Firecrawl scraping if content is insufficient
     */
    async queueForDeepScraping(article) {
        if (!firecrawlScraper || !scrapingQueue) {
            console.log('⚠️ Firecrawl not available for deep scraping');
            return;
        }

        try {
            console.log(`🔥 Queuing article for Firecrawl: ${article.title}`);
            await scrapingQueue.addToQueue({
                id: article.id,
                url: article.articleUrl,
                title: article.title,
            });
        } catch (error) {
            console.error('Error queuing for Firecrawl:', error);
        }
    }

    /**
     * Extract image from RSS item
     */
    extractImage(item) {
        // Try various image fields
        if (item.enclosure && item.enclosure.url && this.isImageUrl(item.enclosure.url)) {
            return item.enclosure.url;
        }

        if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
            return item.mediaContent.$.url;
        }

        if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
            return item.mediaThumbnail.$.url;
        }

        // Try to extract from content HTML
        if (item.content || item.contentEncoded) {
            const html = item.content || item.contentEncoded;
            const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch && imgMatch[1]) {
                return imgMatch[1];
            }
        }

        return null;
    }

    /**
     * Check if URL is an image
     */
    isImageUrl(url) {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    }

    /**
     * Get default image for category
     */
    getDefaultImage(category) {
        const images = {
            news: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
            sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
            technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
            culture: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
            entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
            international: 'https://images.unsplash.com/photo-1526666923127-b2970f64b422?w=800'
        };

        return images[category] || images.news;
    }

    /**
     * Clean HTML tags and extra whitespace from text
     */
    cleanText(text) {
        if (!text) return '';

        return text
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/&nbsp;/g, ' ') // Replace nbsp
            .replace(/&amp;/g, '&') // Replace amp
            .replace(/&lt;/g, '<') // Replace lt
            .replace(/&gt;/g, '>') // Replace gt
            .replace(/&quot;/g, '"') // Replace quot
            .trim();
    }

    /**
     * Estimate reading time in minutes
     */
    estimateReadTime(content) {
        const words = content.split(/\s+/).length;
        const minutes = Math.ceil(words / 200); // 200 WPM
        return `${minutes} min`;
    }

    /**
     * Get sources by category
     */
    getSourcesByCategory(category) {
        if (ARTICLE_SOURCES.topics[category]) {
            return ARTICLE_SOURCES.topics[category].map(topic => ({
                name: category,
                url: topic.url,
                category: category,
                difficulty: topic.difficulty
            }));
        }

        // Return general sources
        return ARTICLE_SOURCES.spanish;
    }

    /**
     * Filter articles by difficulty range (user level ± 1)
     */
    filterByDifficultyRange(articles, userLevel) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const userLevelIndex = levels.indexOf(userLevel);

        // Allow ±1 level
        const minLevel = Math.max(0, userLevelIndex - 1);
        const maxLevel = Math.min(levels.length - 1, userLevelIndex + 1);
        const allowedLevels = levels.slice(minLevel, maxLevel + 1);

        return articles.filter(article => 
            allowedLevels.includes(article.difficulty)
        );
    }

    /**
     * Personalize articles based on user profile
     */
    async personalizeArticles(articles, userProfile, limit) {
        // Use recommendation engine for personalization
        if (!userProfile) {
            return articles.slice(0, limit);
        }

        // Add personalization scores
        const scored = articles.map(article => {
            const topicMatch = this.calculateTopicMatch(article, userProfile);
            const difficultyMatch = this.calculateDifficultyMatch(article, userProfile);
            const recencyScore = this.calculateRecency(article);

            const score = (topicMatch * 0.4) + (difficultyMatch * 0.4) + (recencyScore * 0.2);

            return {
                ...article,
                personalizationScore: score
            };
        });

        // Sort by score and return top N
        scored.sort((a, b) => b.personalizationScore - a.personalizationScore);

        // Apply 70/20/10 difficulty split (Duolingo pattern)
        return this.apply70_20_10Split(scored, userProfile.cefrLevel, limit);
    }

    /**
     * Apply 70/20/10 difficulty split
     */
    apply70_20_10Split(articles, userLevel, limit) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const userLevelIndex = levels.indexOf(userLevel);

        const atLevel = articles.filter(a => a.difficulty === userLevel);
        const easier = articles.filter(a => levels.indexOf(a.difficulty) < userLevelIndex);
        const harder = articles.filter(a => levels.indexOf(a.difficulty) > userLevelIndex);

        const atLevelCount = Math.floor(limit * 0.7);
        const easierCount = Math.floor(limit * 0.2);
        const harderCount = limit - atLevelCount - easierCount;

        return [
            ...atLevel.slice(0, atLevelCount),
            ...easier.slice(0, easierCount),
            ...harder.slice(0, harderCount)
        ].slice(0, limit);
    }

    /**
     * Calculate topic match score
     */
    calculateTopicMatch(article, userProfile) {
        if (!userProfile.interests) return 0.5;

        const interests = Object.keys(userProfile.interests);
        if (interests.includes(article.category)) {
            return 1.0;
        }

        return 0.3;
    }

    /**
     * Calculate difficulty match score
     */
    calculateDifficultyMatch(article, userProfile) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const userLevelIndex = levels.indexOf(userProfile.cefrLevel || 'B1');
        const articleLevelIndex = levels.indexOf(article.difficulty);

        const diff = Math.abs(userLevelIndex - articleLevelIndex);

        if (diff === 0) return 1.0;
        if (diff === 1) return 0.7;
        if (diff === 2) return 0.4;
        return 0.1;
    }

    /**
     * Calculate recency score
     */
    calculateRecency(article) {
        const now = new Date();
        const published = new Date(article.publishedAt);
        const hoursDiff = (now - published) / (1000 * 60 * 60);

        if (hoursDiff < 6) return 1.0;
        if (hoursDiff < 24) return 0.8;
        if (hoursDiff < 48) return 0.6;
        if (hoursDiff < 168) return 0.4;
        return 0.2;
    }

    /**
     * Get user profile
     */
    async getUserProfile(userId) {
        if (!isConfigured()) {
            return {
                userId,
                cefrLevel: 'B1',
                interests: {}
            };
        }

        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            return profile || {
                userId,
                cefrLevel: 'B1',
                interests: {}
            };

        } catch (error) {
            console.error('Error getting user profile:', error);
            return {
                userId,
                cefrLevel: 'B1',
                interests: {}
            };
        }
    }

    /**
     * Translate text using real LibreTranslate API
     */
    async translateText(text, sourceLang = 'es', targetLang = 'en') {
        return await translationService.translateText(text, sourceLang, targetLang);
    }

    /**
     * Get fallback articles
     */
    getFallbackArticles(userId, limit) {
        // Return static curated articles as fallback
        return require('../public/content/articles.json').slice(0, limit);
    }

    /**
     * Get cached articles from Supabase
     */
    async getCachedArticles(category, userLevel) {
        try {
            // Get articles from last 24 hours
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            
            let query = supabase
                .from('articles')
                .select('*')
                .gte('fetch_time', oneDayAgo)
                .order('published_at', { ascending: false })
                .limit(50);

            // Filter by category if specified
            if (category !== 'all') {
                query = query.eq('category', category);
            }

            // Filter by difficulty range
            if (userLevel) {
                const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                const userLevelIndex = levels.indexOf(userLevel);
                const minLevel = Math.max(0, userLevelIndex - 1);
                const maxLevel = Math.min(levels.length - 1, userLevelIndex + 1);
                const allowedLevels = levels.slice(minLevel, maxLevel + 1);
                
                query = query.in('difficulty', allowedLevels);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching cached articles:', error);
                return [];
            }

            return data || [];

        } catch (error) {
            console.error('Error in getCachedArticles:', error);
            return [];
        }
    }

    /**
     * Store articles in Supabase database
     */
    async storeArticlesInDatabase(articles) {
        try {
            console.log(`💾 Storing ${articles.length} articles in database...`);

            // Prepare articles for database insertion
            const articlesForDb = articles.map(article => ({
                id: article.id,
                title: article.title,
                title_english: article.titleEnglish || null,
                content: article.content,
                content_english: article.contentEnglish || null,
                excerpt: article.excerpt,
                excerpt_english: article.excerptEnglish || null,
                source: article.source,
                source_url: article.sourceUrl,
                article_url: article.articleUrl,
                category: article.category,
                image_url: article.image,
                difficulty: article.difficulty,
                analysis: article.analysis || null,
                author: article.author,
                published_at: article.publishedAt,
                fetch_time: new Date().toISOString(),
                read_time: article.readTime,
                verified: article.verified || false
            }));

            // Use upsert to handle duplicates (based on article_url unique constraint)
            const { data, error } = await supabase
                .from('articles')
                .upsert(articlesForDb, { 
                    onConflict: 'article_url',
                    ignoreDuplicates: false 
                });

            if (error) {
                console.error('Error storing articles:', error);
            } else {
                console.log(`✅ Stored ${articles.length} articles in database`);
            }

        } catch (error) {
            console.error('Error in storeArticlesInDatabase:', error);
        }
    }

    /**
     * Clear cache (both memory and database)
     */
    clearCache() {
        this.cache.clear();
        console.log('✅ Memory cache cleared');
        
        // Optionally clear old articles from database
        if (isConfigured()) {
            this.clearOldArticlesFromDatabase();
        }
    }

    /**
     * Clear old articles from database (older than 7 days)
     */
    async clearOldArticlesFromDatabase() {
        try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
            
            const { error } = await supabase
                .from('articles')
                .delete()
                .lt('fetch_time', sevenDaysAgo);

            if (error) {
                console.error('Error clearing old articles:', error);
            } else {
                console.log('✅ Cleared old articles from database');
            }
        } catch (error) {
            console.error('Error in clearOldArticlesFromDatabase:', error);
        }
    }
}

// Create singleton instance
const articlesFeedAPI = new ArticlesFeedAPI();

/**
 * API Routes
 */

// Get personalized articles feed
router.get('/articles/feed', async (req, res) => {
    try {
        const {
            userId = 'guest',
            category = 'all',
            limit = 20,
            difficulty = null,
            withAnalysis = 'true',
            includeTranslations = 'true'
        } = req.query;

        const articles = await articlesFeedAPI.getPersonalizedFeed(userId, {
            category,
            limit: parseInt(limit),
            difficulty,
            withAnalysis: withAnalysis === 'true',
            includeTranslations: includeTranslations === 'true'
        });

        res.json({
            success: true,
            articles,
            count: articles.length,
            userId,
            category
        });

    } catch (error) {
        console.error('Error getting articles feed:', error);
        res.status(500).json({
            error: 'Failed to get articles feed',
            details: error.message
        });
    }
});

// Get SMART personalized feed (TikTok-style)
router.get('/articles/personalized', async (req, res) => {
    try {
        const {
            userId = 'guest',
            category = null,
            limit = 20,
            forceRefresh = 'false'
        } = req.query;

        if (!personalizationEngine) {
            return res.status(503).json({
                error: 'Personalization engine not available',
                fallback: true
            });
        }

        console.log(`🎯 Getting personalized feed for ${userId}`);

        const articles = await personalizationEngine.generatePersonalizedFeed(userId, {
            limit: parseInt(limit),
            category,
            forceRefresh: forceRefresh === 'true'
        });

        res.json({
            success: true,
            articles,
            count: articles.length,
            userId,
            personalized: true
        });

    } catch (error) {
        console.error('Error getting personalized feed:', error);
        res.status(500).json({
            error: 'Failed to get personalized feed',
            details: error.message
        });
    }
});

// Track article engagement
router.post('/articles/engagement', async (req, res) => {
    try {
        const {
            userId,
            articleId,
            timeSpent,
            saved,
            liked,
            shared
        } = req.body;

        if (!userId || !articleId) {
            return res.status(400).json({ error: 'userId and articleId required' });
        }

        if (personalizationEngine) {
            await personalizationEngine.trackEngagement(userId, articleId, {
                timeSpent,
                saved,
                liked,
                shared
            });
        }

        res.json({
            success: true,
            message: 'Engagement tracked'
        });

    } catch (error) {
        console.error('Error tracking engagement:', error);
        res.status(500).json({
            error: 'Failed to track engagement',
            details: error.message
        });
    }
});

// Get single article with full analysis
router.get('/articles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId = 'guest' } = req.query;

        // TODO: Implement article detail fetch
        res.json({
            success: true,
            message: 'Article detail endpoint - to be implemented'
        });

    } catch (error) {
        console.error('Error getting article:', error);
        res.status(500).json({
            error: 'Failed to get article',
            details: error.message
        });
    }
});

// Get article analysis
router.post('/articles/analyze', async (req, res) => {
    try {
        const { articleText, userId } = req.body;

        if (!articleText) {
            return res.status(400).json({ error: 'articleText is required' });
        }

        const analysis = await articleAnalyzer.analyzeArticle(articleText);
        
        let comprehension = null;
        if (userId) {
            comprehension = await articleAnalyzer.calculateUserComprehension(
                articleText,
                userId
            );
        }

        res.json({
            success: true,
            analysis,
            comprehension
        });

    } catch (error) {
        console.error('Error analyzing article:', error);
        res.status(500).json({
            error: 'Failed to analyze article',
            details: error.message
        });
    }
});

// Clear cache endpoint
router.post('/articles/clear-cache', (req, res) => {
    try {
        articlesFeedAPI.clearCache();
        res.json({
            success: true,
            message: 'Articles cache cleared'
        });
    } catch (error) {
        console.error('Error clearing cache:', error);
        res.status(500).json({
            error: 'Failed to clear cache',
            details: error.message
        });
    }
});

// Get article with full content (from Firecrawl)
router.get('/articles/:id/full', async (req, res) => {
    try {
        const { id } = req.params;

        if (!isConfigured()) {
            return res.status(503).json({
                error: 'Database not configured'
            });
        }

        // Get article from database
        const { data: article, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !article) {
            return res.status(404).json({
                error: 'Article not found'
            });
        }

        // Check if has full content
        if (article.full_content) {
            return res.json({
                success: true,
                article: {
                    ...article,
                    hasFullContent: true
                }
            });
        }

        // If not, trigger immediate scraping
        if (firecrawlScraper && article.article_url) {
            console.log(`🔥 Scraping article on-demand: ${article.title}`);
            const result = await firecrawlScraper.scrapeArticle(article.article_url);

            if (result.success) {
                // Update database
                await supabase
                    .from('articles')
                    .update({
                        full_content: result.fullContent,
                        full_content_images: result.images,
                        full_content_metadata: result.metadata,
                        word_count: result.wordCount,
                        scraped_at: result.scrapedAt,
                        scrape_status: 'success'
                    })
                    .eq('id', id);

                return res.json({
                    success: true,
                    article: {
                        ...article,
                        full_content: result.fullContent,
                        full_content_images: result.images,
                        full_content_metadata: result.metadata,
                        word_count: result.wordCount,
                        hasFullContent: true
                    }
                });
            }
        }

        // Return without full content
        res.json({
            success: true,
            article: {
                ...article,
                hasFullContent: false
            }
        });

    } catch (error) {
        console.error('Error getting full article:', error);
        res.status(500).json({
            error: 'Failed to get full article',
            details: error.message
        });
    }
});

// Manually trigger scraping for an article
router.post('/articles/:id/scrape', async (req, res) => {
    try {
        const { id } = req.params;

        if (!firecrawlScraper || !scrapingQueue) {
            return res.status(503).json({
                error: 'Firecrawl not available'
            });
        }

        if (!isConfigured()) {
            return res.status(503).json({
                error: 'Database not configured'
            });
        }

        // Get article from database
        const { data: article, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !article) {
            return res.status(404).json({
                error: 'Article not found'
            });
        }

        // Queue for scraping
        await scrapingQueue.addToQueue({
            id: article.id,
            url: article.article_url,
            title: article.title
        });

        res.json({
            success: true,
            message: 'Article queued for scraping',
            articleId: id
        });

    } catch (error) {
        console.error('Error triggering scrape:', error);
        res.status(500).json({
            error: 'Failed to trigger scrape',
            details: error.message
        });
    }
});

// Get scraping queue status
router.get('/articles/queue/status', (req, res) => {
    try {
        if (!scrapingQueue) {
            return res.status(503).json({
                error: 'Scraping queue not available'
            });
        }

        const status = scrapingQueue.getStatus();
        res.json({
            success: true,
            ...status
        });

    } catch (error) {
        console.error('Error getting queue status:', error);
        res.status(500).json({
            error: 'Failed to get queue status',
            details: error.message
        });
    }
});

module.exports = router;
module.exports.ArticlesFeedAPI = ArticlesFeedAPI;

