/**
 * 📰 COMPLETE ARTICLES API
 * 
 * Provides comprehensive articles feed with:
 * - Real Spanish articles from RSS feeds
 * - Beautiful images for each article
 * - Line-by-line translations
 * - Clickable word translations
 * - Difficulty-based personalization
 * - Category filtering
 */

const express = require('express');
const router = express.Router();
const { ArticlesFeedAPI } = require('../../lib/articles-feed-api');
const translationService = require('../../lib/translation-service-fast');

const articlesFeedAPI = new ArticlesFeedAPI();

/**
 * GET /api/articles/feed
 * Get personalized articles feed with images and translations
 */
router.get('/feed', async (req, res) => {
    try {
        const {
            userId = 'guest',
            category = 'all',
            limit = 20,
            difficulty = null,
            offset = 0
        } = req.query;

        console.log(`📰 Articles feed request: userId=${userId}, category=${category}, limit=${limit}`);

        // Get articles from feed API
        const articles = await articlesFeedAPI.getPersonalizedFeed(userId, {
            category,
            limit: parseInt(limit),
            difficulty,
            withAnalysis: true,
            includeTranslations: true
        });

        // Ensure all articles have proper structure
        const formattedArticles = articles.map(article => ({
            id: article.id,
            title: article.title || '',
            titleEnglish: article.titleEnglish || '',
            content: article.content || article.excerpt || '',
            contentEnglish: article.contentEnglish || article.excerptEnglish || '',
            excerpt: article.excerpt || '',
            excerptEnglish: article.excerptEnglish || '',
            image: article.image || getDefaultImage(article.category),
            category: article.category || 'news',
            source: article.source || 'Spanish News',
            sourceUrl: article.sourceUrl || '',
            articleUrl: article.articleUrl || '',
            difficulty: article.difficulty || difficulty || 'B1',
            publishedAt: article.publishedAt || new Date().toISOString(),
            author: article.author || article.source || 'Unknown',
            readTime: article.readTime || estimateReadTime(article.content || article.excerpt),
            analysis: article.analysis || null,
            comprehension: article.comprehension || null
        }));

        res.json({
            success: true,
            articles: formattedArticles,
            count: formattedArticles.length,
            userId,
            category,
            hasMore: formattedArticles.length >= parseInt(limit)
        });

    } catch (error) {
        console.error('❌ Error getting articles feed:', error);
        
        // Return fallback articles on error
        const fallbackArticles = getFallbackArticles(parseInt(req.query.limit) || 20);
        
        res.json({
            success: true,
            articles: fallbackArticles,
            count: fallbackArticles.length,
            fallback: true,
            error: error.message
        });
    }
});

/**
 * GET /api/articles/:id
 * Get single article with full content and translations
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId = 'guest' } = req.query;

        console.log(`📄 Single article request: id=${id}, userId=${userId}`);

        // Try to get article from database or cache
        // For now, return a formatted response
        res.json({
            success: true,
            message: 'Article detail - to be implemented with database',
            articleId: id
        });

    } catch (error) {
        console.error('❌ Error getting article:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get article',
            message: error.message
        });
    }
});

/**
 * POST /api/articles/translate-word
 * Translate a single Spanish word to English
 */
router.post('/translate-word', async (req, res) => {
    try {
        const { word, context } = req.body;

        if (!word) {
            return res.status(400).json({
                success: false,
                error: 'Word is required'
            });
        }

        console.log(`🔤 Translating word: "${word}"`);

        // Clean the word (remove punctuation)
        const cleanWord = word.trim().replace(/[.,;:!?¿¡()"""''-]/g, '');

        // Translate using fast translation service
        const translation = await translationService.translateText(cleanWord, 'es', 'en');

        res.json({
            success: true,
            word: cleanWord,
            translation: translation,
            context: context || null
        });

    } catch (error) {
        console.error('❌ Error translating word:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to translate word',
            message: error.message,
            word: req.body.word,
            translation: '(translation unavailable)'
        });
    }
});

/**
 * POST /api/articles/translate-sentence
 * Translate a Spanish sentence to English
 */
router.post('/translate-sentence', async (req, res) => {
    try {
        const { sentence } = req.body;

        if (!sentence) {
            return res.status(400).json({
                success: false,
                error: 'Sentence is required'
            });
        }

        console.log(`📝 Translating sentence: "${sentence.substring(0, 50)}..."`);

        const translation = await translationService.translateText(sentence, 'es', 'en');

        res.json({
            success: true,
            spanish: sentence,
            english: translation
        });

    } catch (error) {
        console.error('❌ Error translating sentence:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to translate sentence',
            message: error.message
        });
    }
});

/**
 * POST /api/articles/track-reading
 * Track article reading for analytics
 */
router.post('/track-reading', async (req, res) => {
    try {
        const {
            userId,
            articleId,
            timeSpent,
            wordsClicked,
            percentageRead
        } = req.body;

        if (!userId || !articleId) {
            return res.status(400).json({
                success: false,
                error: 'userId and articleId are required'
            });
        }

        console.log(`📊 Tracking reading: user=${userId}, article=${articleId}, time=${timeSpent}s`);

        // TODO: Store in database/analytics
        // For now, just acknowledge
        res.json({
            success: true,
            message: 'Reading tracked'
        });

    } catch (error) {
        console.error('❌ Error tracking reading:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track reading',
            message: error.message
        });
    }
});

/**
 * Helper Functions
 */

function getDefaultImage(category) {
    const images = {
        news: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop',
        sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop',
        technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
        culture: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop',
        entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop',
        international: 'https://images.unsplash.com/photo-1526666923127-b2970f64b422?w=800&auto=format&fit=crop',
        food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop',
        travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop'
    };

    return images[category] || images.news;
}

function estimateReadTime(content) {
    if (!content) return '1 min';
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // 200 WPM
    return `${minutes} min`;
}

function getFallbackArticles(limit = 20) {
    // Fallback articles with real Spanish content
    const fallbackArticles = [
        {
            id: 'fallback-1',
            title: 'La inteligencia artificial transforma la educación',
            titleEnglish: 'Artificial intelligence transforms education',
            content: 'La inteligencia artificial está revolucionando la forma en que aprendemos idiomas. Las nuevas aplicaciones utilizan algoritmos avanzados para personalizar la experiencia de aprendizaje según el nivel de cada estudiante.',
            contentEnglish: 'Artificial intelligence is revolutionizing the way we learn languages. New applications use advanced algorithms to personalize the learning experience according to each student\'s level.',
            excerpt: 'La inteligencia artificial está revolucionando la forma en que aprendemos idiomas.',
            excerptEnglish: 'Artificial intelligence is revolutionizing the way we learn languages.',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop',
            category: 'technology',
            source: 'Tech News ES',
            difficulty: 'B1',
            publishedAt: new Date().toISOString(),
            author: 'María García',
            readTime: '2 min'
        },
        {
            id: 'fallback-2',
            title: 'El fútbol español brilla en Europa',
            titleEnglish: 'Spanish football shines in Europe',
            content: 'Los equipos españoles continúan dominando las competiciones europeas. El Real Madrid y el Barcelona muestran un nivel excepcional en la Champions League.',
            contentEnglish: 'Spanish teams continue to dominate European competitions. Real Madrid and Barcelona show exceptional level in the Champions League.',
            excerpt: 'Los equipos españoles continúan dominando las competiciones europeas.',
            excerptEnglish: 'Spanish teams continue to dominate European competitions.',
            image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop',
            category: 'sports',
            source: 'Deportes Hoy',
            difficulty: 'A2',
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            author: 'Juan Pérez',
            readTime: '2 min'
        },
        {
            id: 'fallback-3',
            title: 'La gastronomía española conquista el mundo',
            titleEnglish: 'Spanish gastronomy conquers the world',
            content: 'La cocina española es reconocida internacionalmente por su calidad y variedad. Chefs españoles ganan premios importantes en competiciones mundiales.',
            contentEnglish: 'Spanish cuisine is internationally recognized for its quality and variety. Spanish chefs win important awards in world competitions.',
            excerpt: 'La cocina española es reconocida internacionalmente por su calidad y variedad.',
            excerptEnglish: 'Spanish cuisine is internationally recognized for its quality and variety.',
            image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop',
            category: 'culture',
            source: 'Cultura ES',
            difficulty: 'B1',
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            author: 'Ana Martínez',
            readTime: '2 min'
        },
        {
            id: 'fallback-4',
            title: 'Turismo sostenible en España',
            titleEnglish: 'Sustainable tourism in Spain',
            content: 'España apuesta por el turismo sostenible y responsable. Nuevas iniciativas promueven el respeto al medio ambiente y la cultura local.',
            contentEnglish: 'Spain commits to sustainable and responsible tourism. New initiatives promote respect for the environment and local culture.',
            excerpt: 'España apuesta por el turismo sostenible y responsable.',
            excerptEnglish: 'Spain commits to sustainable and responsible tourism.',
            image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&auto=format&fit=crop',
            category: 'travel',
            source: 'Viajes ES',
            difficulty: 'B2',
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            author: 'Carlos López',
            readTime: '3 min'
        },
        {
            id: 'fallback-5',
            title: 'La música latina domina las listas',
            titleEnglish: 'Latin music dominates the charts',
            content: 'Artistas latinos continúan liderando las listas de éxitos mundiales. El reggaetón y el pop latino son los géneros más escuchados.',
            contentEnglish: 'Latin artists continue to lead world success charts. Reggaeton and Latin pop are the most listened to genres.',
            excerpt: 'Artistas latinos continúan liderando las listas de éxitos mundiales.',
            excerptEnglish: 'Latin artists continue to lead world success charts.',
            image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop',
            category: 'entertainment',
            source: 'Música Latina',
            difficulty: 'A2',
            publishedAt: new Date(Date.now() - 14400000).toISOString(),
            author: 'Laura Sánchez',
            readTime: '2 min'
        }
    ];

    return fallbackArticles.slice(0, limit);
}

module.exports = router;


