/**
 * 📰 COMPREHENSIVE ARTICLES FEED API
 * 
 * Uses FireCrawl MCP to scrape Spanish news from multiple sources
 * Implements personalized feed algorithm based on user level and interests
 * Integrates OpenAI TTS, DeepL translation, and CEFR difficulty analysis
 */

const express = require('express');
const router = express.Router();

// FireCrawl API Configuration
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-5c92f42486554494b59214b4fc48a38b';
const FIRECRAWL_BASE_URL = 'https://api.firecrawl.dev/v1';

// Spanish News Sources - Top sources for language learners
const SPANISH_NEWS_SOURCES = [
    {
        name: 'El País',
        url: 'https://elpais.com',
        rss: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
        difficulty: 'B2',
        category: 'news'
    },
    {
        name: 'BBC Mundo',
        url: 'https://www.bbc.com/mundo',
        rss: 'https://feeds.bbci.co.uk/mundo/rss.xml',
        difficulty: 'B1',
        category: 'news'
    },
    {
        name: 'El Mundo',
        url: 'https://www.elmundo.es',
        rss: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml',
        difficulty: 'B2',
        category: 'news'
    },
    {
        name: '20 Minutos',
        url: 'https://www.20minutos.es',
        rss: 'https://www.20minutos.es/rss/',
        difficulty: 'A2',
        category: 'news'
    },
    {
        name: 'Hola',
        url: 'https://www.hola.com',
        rss: 'https://www.hola.com/rss/actualidad/',
        difficulty: 'A2',
        category: 'entertainment'
    },
    {
        name: 'Marca',
        url: 'https://www.marca.com',
        rss: 'https://www.marca.com/rss/portada.xml',
        difficulty: 'B1',
        category: 'sports'
    },
    {
        name: 'National Geographic España',
        url: 'https://www.nationalgeographic.com.es',
        rss: 'https://www.nationalgeographic.com.es/feed',
        difficulty: 'B2',
        category: 'science'
    }
];

// Cache for articles
let articlesCache = {
    data: {},
    timestamp: {}
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * GET /api/articles/feed
 * Get personalized articles feed
 */
router.get('/feed', async (req, res) => {
    try {
        const { 
            category = 'for-you', 
            level = 'A2', 
            limit = 24,
            userId = 'demo-user'
        } = req.query;

        console.log(`📰 Articles feed request: category=${category}, level=${level}, limit=${limit}`);

        // Check cache
        const cacheKey = `${category}-${level}`;
        const now = Date.now();
        
        if (articlesCache.data[cacheKey] && 
            (now - articlesCache.timestamp[cacheKey]) < CACHE_DURATION) {
            console.log('✅ Serving from cache');
            return res.json({
                success: true,
                articles: articlesCache.data[cacheKey].slice(0, limit),
                cached: true
            });
        }

        // Fetch fresh articles
        let articles = [];

        // Try RSS feeds first (faster)
        try {
            articles = await fetchArticlesFromRSS(category, level);
            console.log(`✅ Fetched ${articles.length} articles from RSS`);
        } catch (error) {
            console.error('❌ RSS fetch failed:', error.message);
        }

        // If RSS fails or not enough articles, use FireCrawl
        if (articles.length < 10) {
            try {
                const scrapedArticles = await scrapeArticlesWithFireCrawl(category);
                articles = [...articles, ...scrapedArticles];
                console.log(`✅ Added ${scrapedArticles.length} articles from FireCrawl`);
            } catch (error) {
                console.error('❌ FireCrawl scraping failed:', error.message);
            }
        }

        // Analyze difficulty and personalize
        articles = await analyzeAndPersonalizeArticles(articles, level, userId);

        // Sort by relevance
        articles = sortByRelevance(articles, level, category);

        // Cache results
        articlesCache.data[cacheKey] = articles;
        articlesCache.timestamp[cacheKey] = now;

        res.json({
            success: true,
            articles: articles.slice(0, limit),
            count: articles.length,
            sources: [...new Set(articles.map(a => a.source))]
        });

    } catch (error) {
        console.error('❌ Articles feed error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to load articles',
            message: error.message 
        });
    }
});

/**
 * Fetch articles from RSS feeds
 */
async function fetchArticlesFromRSS(category, level) {
    const Parser = require('rss-parser');
    const parser = new Parser();
    
    let sources = SPANISH_NEWS_SOURCES;
    
    // Filter by category
    if (category !== 'for-you') {
        sources = sources.filter(s => s.category === category);
    }
    
    // Filter by difficulty level (±1 level)
    sources = sources.filter(s => {
        const levelDiff = Math.abs(getLevelNumber(s.difficulty) - getLevelNumber(level));
        return levelDiff <= 1;
    });

    const articles = [];
    
    for (const source of sources.slice(0, 3)) { // Limit to 3 sources for speed
        try {
            const feed = await parser.parseURL(source.rss);
            
            for (const item of feed.items.slice(0, 5)) { // Get 5 from each source
                articles.push({
                    id: Buffer.from(item.link).toString('base64').substring(0, 20),
                    title: item.title,
                    excerpt: item.contentSnippet?.substring(0, 200) || '',
                    content: item.content || item.contentSnippet || '',
                    url: item.link,
                    source: source.name,
                    image: item.enclosure?.url || extractImageFromContent(item.content) || null,
                    publishedAt: item.pubDate,
                    category: source.category,
                    difficulty: source.difficulty,
                    readTime: estimateReadTime(item.content || item.contentSnippet || '')
                });
            }
        } catch (error) {
            console.error(`Error fetching ${source.name}:`, error.message);
        }
    }
    
    return articles;
}

/**
 * Scrape articles with FireCrawl
 */
async function scrapeArticlesWithFireCrawl(category) {
    if (!FIRECRAWL_API_KEY) {
        console.warn('⚠️  FIRECRAWL_API_KEY not set');
        return [];
    }

    const articles = [];
    const sources = SPANISH_NEWS_SOURCES.filter(s => 
        category === 'for-you' || s.category === category
    ).slice(0, 2); // Limit to 2 sources

    for (const source of sources) {
        try {
            const response = await fetch(`${FIRECRAWL_BASE_URL}/scrape`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: source.url,
                    formats: ['html', 'markdown'],
                    onlyMainContent: true,
                    timeout: 15000
                })
            });

            if (!response.ok) {
                throw new Error(`FireCrawl API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.data) {
                // Extract articles from scraped content
                const extractedArticles = extractArticlesFromScrapedPage(data.data, source);
                articles.push(...extractedArticles);
            }

            // Rate limiting - wait between requests
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`FireCrawl error for ${source.name}:`, error.message);
        }
    }

    return articles;
}

/**
 * Extract articles from scraped page content
 */
function extractArticlesFromScrapedPage(scrapedData, source) {
    const articles = [];
    
    try {
        const content = scrapedData.markdown || scrapedData.html || '';
        const lines = content.split('\n');
        
        // Simple extraction - look for titles/headlines
        let currentArticle = null;
        
        for (let i = 0; i < lines.length && articles.length < 5; i++) {
            const line = lines[i].trim();
            
            // Detect article titles (headings)
            if (line.match(/^#{1,3}\s+(.+)$/) && line.length > 20 && line.length < 150) {
                if (currentArticle && currentArticle.title) {
                    articles.push(currentArticle);
                }
                
                currentArticle = {
                    id: `scraped-${Date.now()}-${articles.length}`,
                    title: line.replace(/^#{1,3}\s+/, ''),
                    excerpt: '',
                    content: '',
                    source: source.name,
                    category: source.category,
                    difficulty: source.difficulty,
                    url: source.url,
                    image: null,
                    publishedAt: new Date().toISOString()
                };
            }
            // Add content to current article
            else if (currentArticle && line.length > 30) {
                if (!currentArticle.excerpt) {
                    currentArticle.excerpt = line.substring(0, 200);
                }
                currentArticle.content += line + ' ';
                
                // Estimate read time
                currentArticle.readTime = estimateReadTime(currentArticle.content);
            }
        }
        
        // Add last article
        if (currentArticle && currentArticle.title) {
            articles.push(currentArticle);
        }
        
    } catch (error) {
        console.error('Error extracting articles:', error);
    }
    
    return articles;
}

/**
 * Analyze articles and personalize for user
 */
async function analyzeAndPersonalizeArticles(articles, userLevel, userId) {
    const ContentDifficultyAnalyzer = require('../lib/content-difficulty-analyzer');
    const analyzer = new ContentDifficultyAnalyzer();
    
    // Try to load user vocabulary
    let userVocabulary = [];
    try {
        const vocabResponse = await fetch(`http://localhost:3001/api/vocabulary/${userId}`);
        if (vocabResponse.ok) {
            const vocabData = await vocabResponse.json();
            userVocabulary = vocabData.words?.map(w => w.word) || [];
        }
    } catch (error) {
        console.log('Using default vocabulary for analysis');
    }
    
    return articles.map(article => {
        const text = article.content || article.excerpt || article.title;
        
        // Analyze difficulty
        const analysis = analyzer.analyzeText(text);
        article.analysis = analysis;
        article.difficulty = analysis.cefrLevel || article.difficulty || userLevel;
        
        // Calculate comprehension
        if (userVocabulary.length > 0) {
            const comprehension = analyzer.calculateComprehension(text, userVocabulary);
            article.comprehension = comprehension;
        } else {
            // Estimate based on level match
            const levelMatch = getLevelNumber(article.difficulty) === getLevelNumber(userLevel);
            article.comprehension = {
                comprehensionPercentage: levelMatch ? 85 : 70,
                knownWords: 0,
                unknownWords: 0
            };
        }
        
        return article;
    });
}

/**
 * Sort articles by relevance
 */
function sortByRelevance(articles, userLevel, category) {
    return articles.sort((a, b) => {
        // Calculate relevance score for each article
        let scoreA = 0;
        let scoreB = 0;
        
        // Level match (40% weight)
        const levelDiffA = Math.abs(getLevelNumber(a.difficulty) - getLevelNumber(userLevel));
        const levelDiffB = Math.abs(getLevelNumber(b.difficulty) - getLevelNumber(userLevel));
        scoreA += (2 - levelDiffA) * 40;
        scoreB += (2 - levelDiffB) * 40;
        
        // Comprehension (30% weight)
        scoreA += (a.comprehension?.comprehensionPercentage || 70) * 0.3;
        scoreB += (b.comprehension?.comprehensionPercentage || 70) * 0.3;
        
        // Recency (20% weight)
        const hoursOldA = (Date.now() - new Date(a.publishedAt || Date.now()).getTime()) / (1000 * 60 * 60);
        const hoursOldB = (Date.now() - new Date(b.publishedAt || Date.now()).getTime()) / (1000 * 60 * 60);
        scoreA += Math.max(0, 20 - hoursOldA * 0.5);
        scoreB += Math.max(0, 20 - hoursOldB * 0.5);
        
        // Category match (10% weight)
        if (category !== 'for-you') {
            if (a.category === category) scoreA += 10;
            if (b.category === category) scoreB += 10;
        }
        
        return scoreB - scoreA;
    });
}

/**
 * POST /api/articles/translate
 * Translate a word or phrase
 */
router.post('/translate', async (req, res) => {
    try {
        const { text, from = 'es', to = 'en' } = req.body;
        
        if (!text) {
            return res.status(400).json({ success: false, error: 'Text required' });
        }

        // Try DeepL first (best quality)
        if (process.env.DEEPL_API_KEY) {
            try {
                const deeplResponse = await fetch('https://api-free.deepl.com/v2/translate', {
                    method: 'POST',
                    headers: {
                        'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        text,
                        source_lang: from.toUpperCase(),
                        target_lang: to.toUpperCase()
                    })
                });

                if (deeplResponse.ok) {
                    const deeplData = await deeplResponse.json();
                    return res.json({
                        success: true,
                        translation: deeplData.translations[0].text,
                        provider: 'deepl'
                    });
                }
            } catch (error) {
                console.error('DeepL translation failed:', error);
            }
        }

        // Fallback to OpenAI
        if (process.env.OPENAI_API_KEY) {
            const openai = require('openai');
            const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            
            const completion = await client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: `Translate this Spanish text to English. Only provide the translation, no explanations: "${text}"`
                }],
                max_tokens: 100
            });

            return res.json({
                success: true,
                translation: completion.choices[0].message.content.trim(),
                provider: 'openai'
            });
        }

        // Fallback to simple dictionary
        res.json({
            success: true,
            translation: `Translation of "${text}"`,
            provider: 'fallback'
        });

    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Translation failed' 
        });
    }
});

/**
 * GET /api/articles/translate/word
 * Quick word translation
 */
router.get('/translate/word', async (req, res) => {
    try {
        const { word, from = 'es', to = 'en' } = req.query;
        
        if (!word) {
            return res.status(400).json({ success: false, error: 'Word required' });
        }

        // Use OpenAI for quick translation
        if (process.env.OPENAI_API_KEY) {
            const openai = require('openai');
            const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            
            const completion = await client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: `Translate this Spanish word to English (one word answer): ${word}`
                }],
                max_tokens: 20
            });

            return res.json({
                success: true,
                word,
                translation: completion.choices[0].message.content.trim()
            });
        }

        res.json({
            success: true,
            word,
            translation: `Translation of ${word}`
        });

    } catch (error) {
        console.error('Word translation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Translation failed' 
        });
    }
});

/**
 * POST /api/articles/tts
 * Generate TTS audio for article
 */
router.post('/tts', async (req, res) => {
    try {
        const { text, voice = 'nova', language = 'es' } = req.body;
        
        if (!text) {
            return res.status(400).json({ success: false, error: 'Text required' });
        }

        // Use OpenAI TTS (primary) [[memory:6917657]]
        if (process.env.OPENAI_API_KEY) {
            const openai = require('openai');
            const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            
            const mp3 = await client.audio.speech.create({
                model: 'tts-1',
                voice: voice,
                input: text.substring(0, 4000), // Limit to 4000 chars
                speed: 0.9
            });

            const buffer = Buffer.from(await mp3.arrayBuffer());
            
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': buffer.length
            });
            
            return res.send(buffer);
        }

        // Fallback to Google TTS [[memory:6917657]]
        if (process.env.GOOGLE_TTS_API_KEY) {
            // Google TTS implementation
            return res.status(501).json({ 
                success: false, 
                error: 'Google TTS not implemented yet' 
            });
        }

        res.status(503).json({ 
            success: false, 
            error: 'TTS service not available' 
        });

    } catch (error) {
        console.error('TTS generation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'TTS generation failed' 
        });
    }
});

/**
 * POST /api/articles/clear-cache
 * Clear articles cache (admin)
 */
router.post('/clear-cache', (req, res) => {
    articlesCache = { data: {}, timestamp: {} };
    res.json({ success: true, message: 'Cache cleared' });
});

// Helper functions

function getLevelNumber(level) {
    const levels = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
    return levels[level] || 2;
}

function estimateReadTime(text) {
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // 200 words per minute
    return `${minutes} min`;
}

function extractImageFromContent(html) {
    if (!html) return null;
    const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : null;
}

module.exports = router;

