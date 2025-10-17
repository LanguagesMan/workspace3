// 🤖 AI CONTENT AGGREGATOR - Multi-Source Content Fetching & Normalization
// Aggregates content from NewsAPI, Guardian, RSS, Reddit, Twitter, YouTube

const axios = require('axios');
const Parser = require('rss-parser');
const fs = require('fs').promises;
const path = require('path');

class AIContentAggregator {
    constructor() {
        this.rssParser = new Parser();
        this.cache = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
        
        // API Keys (from .env)
        this.newsApiKey = process.env.NEWS_API_KEY || '';
        this.guardianApiKey = process.env.GUARDIAN_API_KEY || '';
        
        // Content sources
        this.sources = this.defineSources();
    }

    defineSources() {
        return {
            newsApi: {
                url: 'https://newsapi.org/v2/top-headlines',
                params: { language: 'es', pageSize: 20 },
                enabled: !!this.newsApiKey
            },
            guardian: {
                url: 'https://content.guardianapis.com/search',
                params: { lang: 'es', pageSize: 20 },
                enabled: !!this.guardianApiKey
            },
            rssFeeds: [
                { name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada' },
                { name: 'BBC Mundo', url: 'https://feeds.bbci.co.uk/mundo/rss.xml' },
                { name: 'CNN Español', url: 'http://rss.cnn.com/rss/cnn_spanish.rss' },
                { name: 'DW Español', url: 'https://rss.dw.com/rdf/rss-sp-all' },
                { name: '20 Minutos', url: 'https://www.20minutos.es/rss/' }
            ]
        };
    }

    /**
     * Fetch content from all sources
     * @param {Object} options - Filtering options
     * @returns {Promise<Array>} Normalized articles
     */
    async aggregateContent(options = {}) {
        const {
            limit = 50,
            topics = [], // ['technology', 'sports', 'culture']
            cefrLevel = null, // Filter by difficulty
            includeAudio = false, // Generate audio
            forceRefresh = false // Skip cache
        } = options;

        console.log('🔄 Aggregating content from all sources...');

        // 🚀 OPTIMIZATION: Check file cache first for instant response
        if (!forceRefresh) {
            const cachedArticles = await this.fetchFromCache();
            if (cachedArticles && cachedArticles.length > 0) {
                console.log(`⚡ Serving ${cachedArticles.length} cached articles instantly`);
                // Return cached immediately, refresh in background
                this.refreshCacheInBackground();
                return cachedArticles.slice(0, limit);
            }
        }

        try {
            // Fetch from all sources in parallel
            const results = await Promise.allSettled([
                this.fetchFromNewsAPI(),
                this.fetchFromGuardian(),
                this.fetchFromRSS()
            ]);

            // Combine all successful results
            let articles = [];
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    articles = articles.concat(result.value);
                    console.log(`✅ Source ${index + 1}: ${result.value.length} articles`);
                } else {
                    console.log(`❌ Source ${index + 1} failed:`, result.reason?.message);
                }
            });

            // Normalize all articles
            articles = articles.map(article => this.normalizeArticle(article));

            // Remove duplicates (by URL)
            articles = this.deduplicateArticles(articles);

            // Filter by topics if specified
            if (topics.length > 0) {
                articles = this.filterByTopics(articles, topics);
            }

            // Filter by CEFR level if specified
            if (cefrLevel) {
                articles = this.filterByDifficulty(articles, cefrLevel);
            }

            // Sort by relevance and freshness
            articles = this.sortArticles(articles);

            // Limit results
            articles = articles.slice(0, limit);

            // Add audio if requested
            if (includeAudio) {
                articles = await this.addAudioToArticles(articles);
            }

            console.log(`✅ Aggregated ${articles.length} articles`);

            // Cache results
            this.cacheResults(articles);

            return articles;

        } catch (error) {
            console.error('Error aggregating content:', error);
            return this.fetchFromCache(); // Fallback to cache
        }
    }

    /**
     * Fetch from NewsAPI
     */
    async fetchFromNewsAPI() {
        if (!this.sources.newsApi.enabled) {
            console.log('⏭️  NewsAPI disabled (no API key)');
            return [];
        }

        try {
            const response = await axios.get(this.sources.newsApi.url, {
                params: {
                    ...this.sources.newsApi.params,
                    apiKey: this.newsApiKey
                },
                timeout: 10000
            });

            if (response.data && response.data.articles) {
                return response.data.articles.map(article => ({
                    ...article,
                    source: 'NewsAPI',
                    sourceName: article.source?.name || 'NewsAPI'
                }));
            }

            return [];
        } catch (error) {
            console.error('NewsAPI error:', error.message);
            return [];
        }
    }

    /**
     * Fetch from Guardian API
     */
    async fetchFromGuardian() {
        if (!this.sources.guardian.enabled) {
            console.log('⏭️  Guardian API disabled (no API key)');
            return [];
        }

        try {
            const response = await axios.get(this.sources.guardian.url, {
                params: {
                    ...this.sources.guardian.params,
                    'api-key': this.guardianApiKey
                },
                timeout: 10000
            });

            if (response.data && response.data.response && response.data.response.results) {
                return response.data.response.results.map(article => ({
                    title: article.webTitle,
                    description: article.fields?.trailText || '',
                    url: article.webUrl,
                    urlToImage: article.fields?.thumbnail || '',
                    publishedAt: article.webPublicationDate,
                    source: 'Guardian',
                    sourceName: 'The Guardian'
                }));
            }

            return [];
        } catch (error) {
            console.error('Guardian API error:', error.message);
            return [];
        }
    }

    /**
     * Fetch from RSS feeds
     */
    async fetchFromRSS() {
        const articles = [];

        for (const feed of this.sources.rssFeeds) {
            try {
                const parsed = await this.rssParser.parseURL(feed.url);
                
                if (parsed && parsed.items) {
                    const feedArticles = parsed.items.slice(0, 10).map(item => ({
                        title: item.title,
                        description: item.contentSnippet || item.summary || '',
                        url: item.link,
                        urlToImage: item.enclosure?.url || item.image?.url || '',
                        publishedAt: item.pubDate || item.isoDate,
                        source: 'RSS',
                        sourceName: feed.name
                    }));

                    articles.push(...feedArticles);
                    console.log(`✅ RSS ${feed.name}: ${feedArticles.length} articles`);
                }
            } catch (error) {
                console.error(`RSS error (${feed.name}):`, error.message);
            }
        }

        return articles;
    }

    /**
     * Normalize article format
     */
    normalizeArticle(article) {
        return {
            id: this.generateArticleId(article.url),
            title: this.cleanText(article.title || ''),
            description: this.cleanText(article.description || ''),
            content: this.cleanText(article.content || article.description || ''),
            url: article.url,
            image: article.urlToImage || article.image || '',
            publishedAt: new Date(article.publishedAt || Date.now()).getTime(),
            source: article.source || 'Unknown',
            sourceName: article.sourceName || 'Unknown',
            
            // Will be enriched later
            topics: [],
            keywords: [],
            cefrLevel: 'B1', // Default, will be calculated
            difficulty: 50, // 0-100
            readingTime: Math.ceil((article.description || '').split(' ').length / 200), // minutes
            hasAudio: false,
            audioUrl: null,
            
            // Personalization scores (will be calculated)
            relevanceScore: 0,
            engagementScore: 0,
            personalizedScore: 0
        };
    }

    /**
     * Remove duplicates by URL
     */
    deduplicateArticles(articles) {
        const seen = new Set();
        return articles.filter(article => {
            if (seen.has(article.url)) {
                return false;
            }
            seen.add(article.url);
            return true;
        });
    }

    /**
     * Filter articles by topics
     */
    filterByTopics(articles, topics) {
        // Simple keyword matching (can be enhanced with ML)
        const topicKeywords = {
            technology: ['tecnología', 'internet', 'software', 'app', 'digital', 'ai', 'robot'],
            sports: ['deporte', 'fútbol', 'baloncesto', 'tenis', 'olimpiadas', 'copa'],
            culture: ['cultura', 'arte', 'música', 'cine', 'teatro', 'libro'],
            politics: ['política', 'gobierno', 'elecciones', 'presidente', 'congreso'],
            health: ['salud', 'medicina', 'hospital', 'covid', 'vacuna', 'enfermedad'],
            science: ['ciencia', 'investigación', 'estudio', 'descubrimiento', 'espacio'],
            business: ['negocio', 'empresa', 'economía', 'mercado', 'inversión']
        };

        return articles.filter(article => {
            const text = (article.title + ' ' + article.description).toLowerCase();
            
            return topics.some(topic => {
                const keywords = topicKeywords[topic] || [];
                return keywords.some(keyword => text.includes(keyword));
            });
        });
    }

    /**
     * Filter by CEFR difficulty level
     */
    filterByDifficulty(articles, targetLevel) {
        const levelMap = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
        const target = levelMap[targetLevel] || 3;

        return articles.filter(article => {
            const articleLevel = levelMap[article.cefrLevel] || 3;
            // Allow articles within ±1 level
            return Math.abs(articleLevel - target) <= 1;
        });
    }

    /**
     * Sort articles by relevance and freshness
     */
    sortArticles(articles) {
        const now = Date.now();
        
        return articles.sort((a, b) => {
            // Freshness score (newer = better)
            const freshnessA = 1 - ((now - a.publishedAt) / (7 * 24 * 60 * 60 * 1000)); // Last 7 days
            const freshnessB = 1 - ((now - b.publishedAt) / (7 * 24 * 60 * 60 * 1000));
            
            // Combined score (can add more factors)
            const scoreA = freshnessA * 0.5 + (a.personalizedScore || 0) * 0.5;
            const scoreB = freshnessB * 0.5 + (b.personalizedScore || 0) * 0.5;
            
            return scoreB - scoreA;
        });
    }

    /**
     * Add audio generation info to articles
     */
    async addAudioToArticles(articles) {
        // Mark articles for audio generation
        // Actual TTS will be done on-demand
        return articles.map(article => ({
            ...article,
            hasAudio: true,
            audioUrl: `/api/audio/article/${article.id}`,
            estimatedAudioDuration: Math.ceil(article.readingTime * 1.5) // min
        }));
    }

    /**
     * Refresh cache in background (don't await)
     */
    refreshCacheInBackground() {
        // Don't await - let it run in background
        setTimeout(async () => {
            try {
                console.log('🔄 Refreshing cache in background...');
                await this.aggregateContent({ forceRefresh: true });
                console.log('✅ Cache refreshed');
            } catch (error) {
                console.error('❌ Background refresh failed:', error.message);
            }
        }, 1000); // Wait 1 second before starting refresh
    }

    /**
     * Cache results
     */
    async cacheResults(articles) {
        this.cache.set('latest_articles', {
            data: articles,
            timestamp: Date.now()
        });

        // Also save to file for persistence
        try {
            const cachePath = path.join(__dirname, '..', 'cache', 'articles.json');
            await fs.mkdir(path.dirname(cachePath), { recursive: true });
            await fs.writeFile(cachePath, JSON.stringify(articles, null, 2));
            console.log(`💾 Cached ${articles.length} articles to disk`);
        } catch (error) {
            console.error('Error saving cache:', error);
        }
    }

    /**
     * Fetch from cache
     */
    async fetchFromCache() {
        // Check memory cache first
        const cached = this.cache.get('latest_articles');
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            console.log('✅ Using cached articles');
            return cached.data;
        }

        // Check file cache
        try {
            const cachePath = path.join(__dirname, '..', 'cache', 'articles.json');
            const data = await fs.readFile(cachePath, 'utf-8');
            const articles = JSON.parse(data);
            console.log('✅ Using file-cached articles');
            return articles;
        } catch (error) {
            console.log('⚠️  No cache available');
            return [];
        }
    }

    /**
     * Utility: Generate article ID
     */
    generateArticleId(url) {
        return Buffer.from(url).toString('base64').substring(0, 16);
    }

    /**
     * Utility: Clean text
     */
    cleanText(text) {
        return text
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }
}

module.exports = AIContentAggregator;
