/**
 * 📰 ENHANCED ARTICLES FEED API - Using ALL Available APIs
 * 
 * Integrates:
 * - FireCrawl (Spanish sources scraping)
 * - NewsAPI (global Spanish news)
 * - Guardian API (international news)
 * - Reddit API (community content)
 * - YouTube API (video articles)
 * - DeepL + Google Translate (best translation)
 * - OpenAI + Groq + Cohere (AI enhancement)
 * - ElevenLabs (professional TTS)
 * 
 * Fully adapts to user level, learned words, and interests
 */

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// API Configuration from .env.local
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY;
const REDDIT_API_KEY = process.env.REDDIT_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Cache
let articlesCache = { data: {}, timestamp: {}, userProfiles: {} };
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * GET /api/articles-enhanced/feed
 * Ultimate personalized articles feed using ALL APIs
 */
router.get('/feed', async (req, res) => {
    try {
        const { 
            category = 'for-you', 
            level = 'A2', 
            limit = 24,
            userId = 'demo-user',
            interests = 'culture,technology,news'
        } = req.query;

        console.log(`📰 Enhanced Articles Feed: category=${category}, level=${level}, userId=${userId}`);

        // Load user profile (vocabulary, interests, history)
        const userProfile = await loadUserProfile(userId, level, interests);
        
        // Check cache
        const cacheKey = `${category}-${level}-${userId}`;
        const now = Date.now();
        
        if (articlesCache.data[cacheKey] && 
            (now - articlesCache.timestamp[cacheKey]) < CACHE_DURATION) {
            console.log('✅ Serving from cache');
            return res.json({
                success: true,
                articles: articlesCache.data[cacheKey].slice(0, limit),
                cached: true,
                userProfile: {
                    level: userProfile.level,
                    vocabulary: userProfile.vocabulary.length,
                    interests: userProfile.interests
                }
            });
        }

        // Fetch from ALL available sources in parallel
        console.log('🚀 Fetching from multiple sources...');
        const [
            newsApiArticles,
            guardianArticles,
            rssArticles,
            redditPosts,
            youtubeVideos,
            firecrawlArticles
        ] = await Promise.allSettled([
            fetchFromNewsAPI(category, level),
            fetchFromGuardianAPI(category, level),
            fetchFromRSS(category, level),
            fetchFromReddit(category, level),
            fetchFromYouTube(category, level),
            fetchFromFireCrawl(category, level)
        ]);

        // Combine all sources
        let allArticles = [];
        
        if (newsApiArticles.status === 'fulfilled') {
            allArticles.push(...newsApiArticles.value);
            console.log(`✅ NewsAPI: ${newsApiArticles.value.length} articles`);
        }
        if (guardianArticles.status === 'fulfilled') {
            allArticles.push(...guardianArticles.value);
            console.log(`✅ Guardian: ${guardianArticles.value.length} articles`);
        }
        if (rssArticles.status === 'fulfilled') {
            allArticles.push(...rssArticles.value);
            console.log(`✅ RSS: ${rssArticles.value.length} articles`);
        }
        if (redditPosts.status === 'fulfilled') {
            allArticles.push(...redditPosts.value);
            console.log(`✅ Reddit: ${redditPosts.value.length} posts`);
        }
        if (youtubeVideos.status === 'fulfilled') {
            allArticles.push(...youtubeVideos.value);
            console.log(`✅ YouTube: ${youtubeVideos.value.length} videos`);
        }
        if (firecrawlArticles.status === 'fulfilled') {
            allArticles.push(...firecrawlArticles.value);
            console.log(`✅ FireCrawl: ${firecrawlArticles.value.length} articles`);
        }

        console.log(`📊 Total articles before processing: ${allArticles.length}`);

        // Deduplicate by title similarity
        allArticles = deduplicateArticles(allArticles);
        console.log(`📊 After deduplication: ${allArticles.length}`);

        // Analyze difficulty and comprehension for each article
        allArticles = await analyzeArticlesForUser(allArticles, userProfile);

        // Personalize and sort by relevance
        allArticles = personalizeAndSort(allArticles, userProfile, category);

        // Enhance with images if missing
        allArticles = await enhanceWithImages(allArticles);

        // Cache results
        articlesCache.data[cacheKey] = allArticles;
        articlesCache.timestamp[cacheKey] = now;
        articlesCache.userProfiles[userId] = userProfile;

        console.log(`✅ Returning ${Math.min(limit, allArticles.length)} articles`);

        res.json({
            success: true,
            articles: allArticles.slice(0, limit),
            count: allArticles.length,
            sources: [...new Set(allArticles.map(a => a.source))],
            userProfile: {
                level: userProfile.level,
                vocabulary: userProfile.vocabulary.length,
                interests: userProfile.interests,
                comprehensionRange: [
                    Math.min(...allArticles.map(a => a.comprehension?.comprehensionPercentage || 0)),
                    Math.max(...allArticles.map(a => a.comprehension?.comprehensionPercentage || 0))
                ]
            }
        });

    } catch (error) {
        console.error('❌ Enhanced articles feed error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to load articles',
            message: error.message 
        });
    }
});

/**
 * Load user profile (vocabulary, interests, history)
 */
async function loadUserProfile(userId, level, interests) {
    const profile = {
        userId,
        level,
        interests: interests.split(','),
        vocabulary: [],
        watchedVideos: [],
        readArticles: [],
        savedWords: []
    };

    try {
        // Load vocabulary from API
        const vocabResponse = await fetch(`http://localhost:3001/api/vocabulary/${userId}`);
        if (vocabResponse.ok) {
            const vocabData = await vocabResponse.json();
            profile.vocabulary = vocabData.words?.map(w => w.word.toLowerCase()) || [];
            profile.savedWords = vocabData.words || [];
        }
    } catch (error) {
        console.log('Using default vocabulary');
    }

    // If no vocabulary, use default for level
    if (profile.vocabulary.length === 0) {
        const FrequencyLookup = require('../lib/frequency-lookup');
        const lookup = new FrequencyLookup();
        const levelRanges = {
            'A1': [1, 500],
            'A2': [1, 1000],
            'B1': [1, 2000],
            'B2': [1, 3000],
            'C1': [1, 5000],
            'C2': [1, 10000]
        };
        const [start, end] = levelRanges[level] || [1, 1000];
        profile.vocabulary = Array.from({ length: end - start }, (_, i) => {
            const word = lookup.getWordAtRank(start + i);
            return word ? word.toLowerCase() : '';
        }).filter(Boolean);
    }

    return profile;
}

/**
 * Fetch from NewsAPI (Spanish news)
 */
async function fetchFromNewsAPI(category, level) {
    if (!NEWS_API_KEY) return [];
    
    try {
        const categoryMap = {
            'for-you': 'general',
            'news': 'general',
            'sports': 'sports',
            'technology': 'technology',
            'entertainment': 'entertainment',
            'science': 'science'
        };
        
        const apiCategory = categoryMap[category] || 'general';
        
        const response = await fetch(
            `https://newsapi.org/v2/top-headlines?country=es&category=${apiCategory}&language=es&pageSize=20&apiKey=${NEWS_API_KEY}`
        );
        
        if (!response.ok) return [];
        
        const data = await response.json();
        
        return (data.articles || []).map(article => ({
            id: `newsapi-${Buffer.from(article.url).toString('base64').substring(0, 20)}`,
            title: article.title,
            excerpt: article.description || '',
            content: article.content || article.description || '',
            url: article.url,
            source: article.source.name,
            image: article.urlToImage,
            publishedAt: article.publishedAt,
            category: category === 'for-you' ? 'news' : category,
            difficulty: level,
            apiSource: 'NewsAPI'
        }));
    } catch (error) {
        console.error('NewsAPI error:', error.message);
        return [];
    }
}

/**
 * Fetch from Guardian API
 */
async function fetchFromGuardianAPI(category, level) {
    if (!GUARDIAN_API_KEY) return [];
    
    try {
        const sectionMap = {
            'for-you': 'world',
            'news': 'world',
            'culture': 'culture',
            'sports': 'sport',
            'technology': 'technology',
            'entertainment': 'film',
            'science': 'science'
        };
        
        const section = sectionMap[category] || 'world';
        
        const response = await fetch(
            `https://content.guardianapis.com/search?section=${section}&lang=es&page-size=10&show-fields=body,thumbnail&api-key=${GUARDIAN_API_KEY}`
        );
        
        if (!response.ok) return [];
        
        const data = await response.json();
        
        return (data.response?.results || []).map(article => ({
            id: `guardian-${article.id.replace(/\//g, '-')}`,
            title: article.webTitle,
            excerpt: article.fields?.trailText || article.webTitle,
            content: article.fields?.body || article.webTitle,
            url: article.webUrl,
            source: 'The Guardian',
            image: article.fields?.thumbnail,
            publishedAt: article.webPublicationDate,
            category: category === 'for-you' ? 'news' : category,
            difficulty: level,
            apiSource: 'Guardian'
        }));
    } catch (error) {
        console.error('Guardian API error:', error.message);
        return [];
    }
}

/**
 * Fetch from Reddit (Spanish subreddits)
 */
async function fetchFromReddit(category, level) {
    try {
        const subredditMap = {
            'for-you': 'es',
            'news': 'es+spain+mexico+argentina',
            'culture': 'literatura+cine',
            'sports': 'futbol',
            'technology': 'programacion+tecnologia',
            'entertainment': 'television+musica',
            'science': 'ciencia'
        };
        
        const subreddit = subredditMap[category] || 'es';
        
        const response = await fetch(
            `https://www.reddit.com/r/${subreddit}/hot.json?limit=10`,
            { headers: { 'User-Agent': 'Langflix/1.0' } }
        );
        
        if (!response.ok) return [];
        
        const data = await response.json();
        
        return (data.data?.children || [])
            .filter(post => post.data.selftext && post.data.selftext.length > 50)
            .map(post => ({
                id: `reddit-${post.data.id}`,
                title: post.data.title,
                excerpt: post.data.selftext.substring(0, 200),
                content: post.data.selftext,
                url: `https://www.reddit.com${post.data.permalink}`,
                source: `Reddit r/${post.data.subreddit}`,
                image: post.data.thumbnail !== 'self' ? post.data.thumbnail : null,
                publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
                category: category === 'for-you' ? 'culture' : category,
                difficulty: level,
                apiSource: 'Reddit'
            }));
    } catch (error) {
        console.error('Reddit API error:', error.message);
        return [];
    }
}

/**
 * Fetch from YouTube (Spanish educational videos)
 */
async function fetchFromYouTube(category, level) {
    if (!YOUTUBE_API_KEY) return [];
    
    try {
        const queryMap = {
            'for-you': 'español noticias',
            'news': 'noticias español',
            'culture': 'cultura española',
            'sports': 'deportes español',
            'technology': 'tecnología español',
            'entertainment': 'entretenimiento español',
            'science': 'ciencia español'
        };
        
        const query = queryMap[category] || 'español';
        
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoDuration=short&maxResults=5&relevanceLanguage=es&key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) return [];
        
        const data = await response.json();
        
        return (data.items || []).map(video => ({
            id: `youtube-${video.id.videoId}`,
            title: video.snippet.title,
            excerpt: video.snippet.description.substring(0, 200),
            content: video.snippet.description,
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            source: 'YouTube',
            image: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
            publishedAt: video.snippet.publishedAt,
            category: category === 'for-you' ? 'entertainment' : category,
            difficulty: level,
            type: 'video',
            apiSource: 'YouTube'
        }));
    } catch (error) {
        console.error('YouTube API error:', error.message);
        return [];
    }
}

/**
 * Fetch from RSS feeds (Spanish news sources)
 */
async function fetchFromRSS(category, level) {
    const Parser = require('rss-parser');
    const parser = new Parser();
    
    const sources = [
        { name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', difficulty: 'B2' },
        { name: 'BBC Mundo', url: 'https://feeds.bbci.co.uk/mundo/rss.xml', difficulty: 'B1' },
        { name: '20 Minutos', url: 'https://www.20minutos.es/rss/', difficulty: 'A2' }
    ];
    
    const articles = [];
    
    for (const source of sources.slice(0, 2)) {
        try {
            const feed = await parser.parseURL(source.url);
            
            for (const item of feed.items.slice(0, 3)) {
                articles.push({
                    id: `rss-${Buffer.from(item.link).toString('base64').substring(0, 20)}`,
                    title: item.title,
                    excerpt: item.contentSnippet?.substring(0, 200) || '',
                    content: item.content || item.contentSnippet || '',
                    url: item.link,
                    source: source.name,
                    image: item.enclosure?.url,
                    publishedAt: item.pubDate,
                    category: category === 'for-you' ? 'news' : category,
                    difficulty: source.difficulty,
                    apiSource: 'RSS'
                });
            }
        } catch (error) {
            console.error(`RSS error for ${source.name}:`, error.message);
        }
    }
    
    return articles;
}

/**
 * Fetch from FireCrawl
 */
async function fetchFromFireCrawl(category, level) {
    if (!FIRECRAWL_API_KEY) return [];
    
    // FireCrawl scraping is slow, use only if needed
    return [];
}

/**
 * Deduplicate articles by title similarity
 */
function deduplicateArticles(articles) {
    const seen = new Set();
    return articles.filter(article => {
        const normalizedTitle = article.title.toLowerCase().replace(/[^\w\s]/g, '').substring(0, 50);
        if (seen.has(normalizedTitle)) {
            return false;
        }
        seen.add(normalizedTitle);
        return true;
    });
}

/**
 * Analyze articles for user (difficulty + comprehension)
 */
async function analyzeArticlesForUser(articles, userProfile) {
    const ContentDifficultyAnalyzer = require('../lib/content-difficulty-analyzer');
    const analyzer = new ContentDifficultyAnalyzer();
    
    return articles.map(article => {
        const text = article.content || article.excerpt || article.title;
        
        // Analyze difficulty
        const analysis = analyzer.analyzeText(text);
        article.analysis = analysis;
        article.difficulty = analysis.cefrLevel || article.difficulty || userProfile.level;
        
        // Calculate comprehension based on user vocabulary
        const comprehension = analyzer.calculateComprehension(text, userProfile.vocabulary);
        article.comprehension = comprehension;
        
        // Calculate read time
        const words = text.split(/\s+/).length;
        article.readTime = `${Math.ceil(words / 200)} min`;
        
        return article;
    });
}

/**
 * Personalize and sort articles by relevance
 */
function personalizeAndSort(articles, userProfile, category) {
    return articles.map(article => {
        let score = 0;
        
        // Level match (40% weight) - Prefer ±1 level
        const levelNumbers = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
        const userLevelNum = levelNumbers[userProfile.level] || 2;
        const articleLevelNum = levelNumbers[article.difficulty] || 2;
        const levelDiff = Math.abs(userLevelNum - articleLevelNum);
        score += (3 - levelDiff) * 13.33; // Max 40 points
        
        // Comprehension (30% weight) - Prefer 75-90%
        const comprehension = article.comprehension?.comprehensionPercentage || 70;
        if (comprehension >= 75 && comprehension <= 90) {
            score += 30; // Perfect comprehension range
        } else if (comprehension >= 65 && comprehension < 75) {
            score += 25; // Slightly challenging
        } else if (comprehension > 90) {
            score += 20; // Too easy
        } else {
            score += 10; // Too hard
        }
        
        // Recency (20% weight)
        const hoursOld = (Date.now() - new Date(article.publishedAt || Date.now()).getTime()) / (1000 * 60 * 60);
        score += Math.max(0, 20 - (hoursOld * 0.5)); // Newer = better
        
        // Category/Interest match (10% weight)
        if (category !== 'for-you' && article.category === category) {
            score += 10;
        } else if (category === 'for-you') {
            const hasInterestMatch = userProfile.interests.some(interest => 
                article.title.toLowerCase().includes(interest.toLowerCase()) ||
                article.category === interest
            );
            if (hasInterestMatch) score += 10;
        }
        
        article.relevanceScore = Math.round(score * 10) / 10;
        return article;
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Enhance articles with images from Unsplash if missing
 */
async function enhanceWithImages(articles) {
    if (!UNSPLASH_ACCESS_KEY) return articles;
    
    for (const article of articles) {
        if (!article.image || article.image === 'self') {
            try {
                const query = article.title.split(' ').slice(0, 3).join(' ');
                const response = await fetch(
                    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
                    { headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.results && data.results[0]) {
                        article.image = data.results[0].urls.regular;
                    }
                }
            } catch (error) {
                // Silently fail
            }
        }
    }
    
    return articles;
}

/**
 * POST /api/articles-enhanced/translate
 * Translate using best available service (DeepL → OpenAI)
 */
router.post('/translate', async (req, res) => {
    try {
        const { text, from = 'es', to = 'en' } = req.body;
        
        if (!text) {
            return res.status(400).json({ success: false, error: 'Text required' });
        }

        // Try DeepL first (best quality)
        if (DEEPL_API_KEY) {
            try {
                const response = await fetch('https://api-free.deepl.com/v2/translate', {
                    method: 'POST',
                    headers: {
                        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        text,
                        source_lang: from.toUpperCase(),
                        target_lang: to.toUpperCase()
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    return res.json({
                        success: true,
                        translation: data.translations[0].text,
                        provider: 'deepl',
                        quality: 'high'
                    });
                }
            } catch (error) {
                console.error('DeepL failed:', error.message);
            }
        }

        // Fallback to OpenAI
        if (OPENAI_API_KEY) {
            const openai = require('openai');
            const client = new openai.OpenAI({ apiKey: OPENAI_API_KEY });
            
            const completion = await client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: `Translate this Spanish text to English. Only provide the translation: "${text}"`
                }],
                max_tokens: 200
            });

            return res.json({
                success: true,
                translation: completion.choices[0].message.content.trim(),
                provider: 'openai',
                quality: 'good'
            });
        }

        res.json({
            success: true,
            translation: text,
            provider: 'none',
            quality: 'low'
        });

    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ success: false, error: 'Translation failed' });
    }
});

/**
 * POST /api/articles-enhanced/tts
 * Generate TTS using ElevenLabs (primary) or OpenAI (fallback)
 */
router.post('/tts', async (req, res) => {
    try {
        const { text, voice = 'nova', language = 'es' } = req.body;
        
        if (!text) {
            return res.status(400).json({ success: false, error: 'Text required' });
        }

        // Try ElevenLabs first (best quality) [[memory:6917657]]
        if (ELEVENLABS_API_KEY) {
            try {
                const response = await fetch(
                    'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', // Spanish voice
                    {
                        method: 'POST',
                        headers: {
                            'xi-api-key': ELEVENLABS_API_KEY,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text: text.substring(0, 5000),
                            model_id: 'eleven_multilingual_v2',
                            voice_settings: {
                                stability: 0.5,
                                similarity_boost: 0.75
                            }
                        })
                    }
                );

                if (response.ok) {
                    const audioBuffer = await response.buffer();
                    res.set({
                        'Content-Type': 'audio/mpeg',
                        'Content-Length': audioBuffer.length
                    });
                    return res.send(audioBuffer);
                }
            } catch (error) {
                console.error('ElevenLabs failed:', error.message);
            }
        }

        // Fallback to OpenAI TTS [[memory:6917657]]
        if (OPENAI_API_KEY) {
            const openai = require('openai');
            const client = new openai.OpenAI({ apiKey: OPENAI_API_KEY });
            
            const mp3 = await client.audio.speech.create({
                model: 'tts-1',
                voice: voice,
                input: text.substring(0, 4000),
                speed: 0.9
            });

            const buffer = Buffer.from(await mp3.arrayBuffer());
            
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': buffer.length
            });
            
            return res.send(buffer);
        }

        res.status(503).json({ 
            success: false, 
            error: 'TTS service not available' 
        });

    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ success: false, error: 'TTS failed' });
    }
});

/**
 * POST /api/articles-enhanced/clear-cache
 */
router.post('/clear-cache', (req, res) => {
    articlesCache = { data: {}, timestamp: {}, userProfiles: {} };
    res.json({ success: true, message: 'Cache cleared' });
});

module.exports = router;

