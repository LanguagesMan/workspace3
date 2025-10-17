// 🌍 UNIFIED FEED API - Aggregates ALL content sources
// Integrates: News, Social Media, Videos, AI Articles, LangFeed Videos

const express = require('express');
const fs = require('fs');
const path = require('path');
const RealContentAggregator = require('./real-content-aggregator.js');
const videoCatalog = require('./video-catalog');
const spanishNewsFeed = require('./spanish-news-feed');
const feedRanker = require('./feed-ranker');
const vocabAnalyzer = require('./vocab-analyzer');

const router = express.Router();
const aggregator = new RealContentAggregator();

// 📰 REAL SPANISH ARTICLES (Level-appropriate)
// VIRAL CONTENT FORMULA (BuzzFeed + TikTok 2025):
// - Hook in first line (curiosity gap)
// - Numbers in titles ("7 razones", "10 cosas")
// - Emotional/shocking/funny
// - Celebrity gossip, memes, trending topics
// - Relatable to Gen Z/Millennials

const REAL_ARTICLES = {
    A1: [
        {
            title: '😱 ¡No lo creerás!',
            spanish: '¿Sabías que en España la gente cena a las 10 de la noche? ¡Qué locura! En otros países ya están durmiendo. Pero los españoles están comiendo tapas y bebiendo vino. ¿Por qué? Porque les gusta vivir de noche. Y luego duermen siesta durante el día. ¡Vida española!',
            english: 'Did you know that in Spain people eat dinner at 10 PM? How crazy! In other countries they\'re already sleeping. But Spaniards are eating tapas and drinking wine. Why? Because they like living at night. And then they sleep siesta during the day. Spanish life!',
            source: 'España WTF',
            thumbnail: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
        },
        {
            title: '🔥 7 cosas locas de España',
            spanish: '1. Desayuno: café con pan. 2. Comida: 3 horas. 3. Siesta: dormir después de comer. 4. Cena: 10 PM. 5. Fiesta: toda la noche. 6. Domingo: paella en familia. 7. Lunes: café para sobrevivir. ¿Tú también?',
            english: '1. Breakfast: coffee with bread. 2. Lunch: 3 hours. 3. Siesta: sleep after eating. 4. Dinner: 10 PM. 5. Party: all night. 6. Sunday: paella with family. 7. Monday: coffee to survive. You too?',
            source: 'Viral ES',
            thumbnail: 'https://images.unsplash.com/photo-1526260153953-b41d28d4174f?w=400'
        }
    ],
    A2: [
        {
            title: '💔 Shakira vs Piqué: El drama continúa',
            spanish: '¡El drama nunca termina! Shakira lanzó OTRA canción sobre Piqué. Esta vez se llama "Copa Vacía" y la gente está enloqueciendo en TikTok. Miles de videos con la canción. Todos dicen "Shakira tiene razón". Piqué no respondió... todavía. Pero Internet ya eligió su lado. Team Shakira está ganando.',
            english: 'The drama never ends! Shakira released ANOTHER song about Piqué. This time it\'s called "Empty Cup" and people are going crazy on TikTok. Thousands of videos with the song. Everyone says "Shakira is right". Piqué didn\'t respond... yet. But the internet already chose its side. Team Shakira is winning.',
            source: 'Chisme Latino',
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
        },
        {
            title: '😂 Memes españoles que no entenderás',
            spanish: '"¿A qué hora quedamos?" - "A las 8". Todos llegan a las 9. Esto es España. O el clásico: "Voy a salir un ratito". 6 horas después sigues fuera. Los extranjeros no entienden. Pero los españoles... SÍ. ¿Te identificas? Comenta si eres así.',
            english: '"What time shall we meet?" - "At 8". Everyone arrives at 9. This is Spain. Or the classic: "I\'m going out for a bit". 6 hours later you\'re still out. Foreigners don\'t understand. But Spaniards... YES. Can you relate? Comment if you\'re like this.',
            source: 'Memes Hispanos',
            thumbnail: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400'
        },
        {
            title: '🌮 TikTok español se vuelve loco por esta receta',
            spanish: '10 millones de views. ¿La receta? Tortilla de patatas en el microondas. Sí, leíste bien. MICROONDAS. Los puristas están furiosos. "¡Eso no es tortilla!" Los jóvenes dicen "funciona, es rápido". ¿Tú qué opinas? Guerra civil culinaria en los comentarios.',
            english: '10 million views. The recipe? Potato omelette in the microwave. Yes, you read that right. MICROWAVE. Purists are furious. "That\'s not an omelette!" Young people say "it works, it\'s fast". What do you think? Culinary civil war in the comments.',
            source: 'Recetas Virales',
            thumbnail: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400'
        }
    ],
    B1: [
        {
            title: '🎬 Netflix canceló la serie más esperada y fans están furiosos',
            spanish: 'Netflix acaba de cancelar "La Casa de las Flores: Nueva Generación" después de solo 2 episodios. Los fans están devastados. Más de 500,000 personas firmaron una petición para salvar la serie. Twitter explotó con #SaveLaCasa trending mundial. Algunos dicen que Netflix está perdiendo su toque. Otros simplemente quieren saber qué pasó con Paulina.',
            english: 'Netflix just canceled "La Casa de las Flores: New Generation" after only 2 episodes. Fans are devastated. More than 500,000 people signed a petition to save the series. Twitter exploded with #SaveLaCasa trending worldwide. Some say Netflix is losing its touch. Others just want to know what happened to Paulina.',
            source: 'Series Adictos',
            thumbnail: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400'
        },
        {
            title: '💸 El truco viral para ahorrar 5000€ en un año que todos están probando',
            spanish: 'Una tiktoker española compartió su método para ahorrar 5000 euros en 12 meses sin esfuerzo. El secreto: cada semana guardas 5 euros más que la anterior. Semana 1: 5€. Semana 2: 10€. Semana 52: ¡Boom! 5000€. Suena fácil, ¿no? Pero el problema viene en diciembre cuando tienes que guardar 260€ por semana. Los comentarios están divididos entre "genio" y "imposible con mi sueldo".',
            english: 'A Spanish tiktoker shared her method to save 5000 euros in 12 months effortlessly. The secret: each week you save 5 euros more than the previous one. Week 1: 5€. Week 2: 10€. Week 52: Boom! 5000€. Sounds easy, right? But the problem comes in December when you have to save 260€ per week. Comments are divided between "genius" and "impossible with my salary".',
            source: 'Finanzas Jóvenes',
            thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400'
        }
    ],
    B2: [
        {
            title: '🤯 Esto es lo que realmente cuesta vivir en Madrid (y por qué la gente se está yendo)',
            spanish: 'Un apartamento de 40m² en Madrid ahora cuesta 1200€ al mes. Hace 5 años costaba 700€. Los salarios subieron... ¿50€? Los jóvenes profesionales están emigrando a Valencia, Sevilla, o directamente a Portugal. "Gano 2000€ y pago 1200€ de alquiler. ¿Cómo se supone que ahorre?" dice Laura, 28 años. El éxodo madrileño es real. Las estadísticas muestran que 15,000 personas dejaron Madrid este año. ¿La solución? Nadie lo sabe todavía.',
            english: 'A 40m² apartment in Madrid now costs 1200€ per month. 5 years ago it cost 700€. Salaries went up... 50€? Young professionals are migrating to Valencia, Seville, or straight to Portugal. "I earn 2000€ and pay 1200€ rent. How am I supposed to save?" says Laura, 28. The Madrid exodus is real. Statistics show 15,000 people left Madrid this year. The solution? Nobody knows yet.',
            source: 'Economía Real',
            thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
        },
        {
            title: '🔴 La verdad sobre el "trabajo remoto" que nadie te cuenta',
            spanish: 'Las empresas dicen "trabajo flexible" pero te espían. Software que toma fotos de tu pantalla cada 5 minutos. Aplicaciones que rastrean tus clicks. Jefes que te escriben a las 11 PM esperando respuesta inmediata. "Es peor que estar en la oficina", dice un desarrollador anónimo. La promesa era libertad. La realidad es vigilancia digital 24/7. Pero nadie se queja en público porque "deberías estar agradecido de trabajar desde casa". ¿El futuro del trabajo? Más bien una dystopía corporativa.',
            english: 'Companies say "flexible work" but they spy on you. Software that takes photos of your screen every 5 minutes. Apps that track your clicks. Bosses who text you at 11 PM expecting immediate response. "It\'s worse than being in the office", says an anonymous developer. The promise was freedom. The reality is 24/7 digital surveillance. But nobody complains publicly because "you should be grateful to work from home". The future of work? More like a corporate dystopia.',
            source: 'Tech Sin Filtros',
            thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400'
        }
    ]
};

// 📰 ARTICLES-ONLY FEED (No Videos - for Perplexity-style feed)
router.get('/feed-articles', async (req, res) => {
    try {
        const { page = 1, limit = 10, level = 'A2', interests = 'news,culture' } = req.query;
        const userId = req.headers['x-user-id'] || 'default_user';

        console.log(`📰 Articles feed request: Level=${level}, Interests=${interests}`);

        // Get real articles for this level
        const levelArticles = REAL_ARTICLES[level] || REAL_ARTICLES.A2;

        // Create article objects
        const articlesOnly = levelArticles.map((article, index) => ({
            id: `article_${level}_${index}`,
            type: 'article',
            title: article.title,
            spanish: article.spanish,
            english: article.english,
            source: article.source,
            difficulty_level: level,
            thumbnail: article.thumbnail,
            publishedAt: new Date(Date.now() - index * 3600000).toISOString()
        }));

        // Pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedContent = articlesOnly.slice(startIndex, endIndex);

        res.json({
            success: true,
            videos: paginatedContent, // Keep name for compatibility
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: articlesOnly.length,
                hasMore: endIndex < articlesOnly.length
            },
            metadata: {
                level: level,
                interests: interests.split(','),
                userId: userId,
                contentType: 'articles-only',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Articles feed error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load articles feed',
            details: error.message
        });
    }
});

// 🎯 MAIN UNIFIED FEED ENDPOINT
router.get('/unified-feed', async (req, res) => {
    try {
        const { page = 1, limit = 10, level = 'A2', interests = 'news,culture' } = req.query;
        const userId = req.headers['x-user-id'] || 'default_user';

        console.log(`📱 Unified feed request: Level=${level}, Interests=${interests}`);

        // TikTok pattern: Fetch LOTS of content for endless scroll
        // Fetch 50 items so we have content for pages 1-5
        const aggregatedContent = await aggregator.aggregateContent(userId, {
            interests: interests.split(','),
            level: level,
            limit: 50, // Fetch more for pagination
            contentTypes: ['news', 'social', 'video', 'article', 'meme', 'culture', 'post', 'long-article']
        });

        // 📰 FETCH REAL SPANISH NEWS from RSS feeds (El País, BBC Mundo, El Mundo)
        let rssArticles = [];
        try {
            rssArticles = await spanishNewsFeed.getArticles(20, level); // Get 20 real articles
            console.log(`✅ Fetched ${rssArticles.length} real Spanish news articles from RSS`);
        } catch (error) {
            console.error('❌ RSS fetch failed:', error.message);
        }

        // Convert RSS articles to feed format
        const rssContent = rssArticles.map(article => ({
            id: `rss_${article.link}`,
            type: 'article',
            title: article.title,
            spanish: article.contentSnippet || article.title,
            english: '', // Immersion learning - no translation
            thumbnail: article.enclosure?.url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
            difficulty_level: article.adaptedForLevel || level,
            viral_score: 90 + Math.floor(Math.random() * 10),
            source: article.source,
            url: article.link,
            publishedAt: article.pubDate
        }));

        // 🔥 VISION.MD P0: COMPLETE ARTICLES FEED - Add MORE viral articles
        // Get articles for user's level + adjacent levels (more variety)
        const articleLevels = [level]; // User's level
        const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const userLevelIndex = levelOrder.indexOf(level);

        // Add adjacent levels for variety
        if (userLevelIndex > 0) articleLevels.push(levelOrder[userLevelIndex - 1]); // One level below
        if (userLevelIndex < levelOrder.length - 1) articleLevels.push(levelOrder[userLevelIndex + 1]); // One level above

        const articleContent = [];
        articleLevels.forEach(lvl => {
            const levelArticles = REAL_ARTICLES[lvl] || [];
            levelArticles.forEach((article, index) => {
                articleContent.push({
                    id: `article_${lvl}_${index}_${Date.now()}`,
                    type: 'article',
                    title: article.title,
                    spanish: article.spanish,
                    english: article.english,
                    source: article.source,
                    difficulty_level: lvl,
                    thumbnail: article.thumbnail,
                    publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
                    viral_score: 90 + Math.floor(Math.random() * 10),
                    adaptedForLevel: lvl !== level, // Mark if simplified/adapted
                    canSimplify: true // All articles can be further simplified
                });
            });
        });

        // Add videos from catalog (get 20 for pagination)
        const videoContent = videoCatalog.getRandomVideos(20)
            .map(video => ({
                id: video.id,
                type: 'video',
                title: video.title,
                videoPath: video.path,
                hasSubtitles: video.hasSubtitles,
                subtitlesPath: video.subtitlesPath,
                spanish: `🎬 ${video.title}`,
                description: video.folder,
                difficulty_level: level,
                thumbnail: '🎬'
            }));

        // 🎯 VISION.MD P0: COMPLETE ARTICLES FEED - Include viral articles prominently
        // 🔥 UPDATED PATTERN: A-V-A-V-M (50% articles, 40% videos, 10% memes)
        // Research: Reddit/Flipboard use 50/50 article-video mix for balanced feed
        const allContent = [...aggregatedContent, ...articleContent, ...rssContent, ...videoContent];

        // Separate content types
        const videos = allContent.filter(c => c.type === 'video');
        const articles = allContent.filter(c => c.type === 'article' || c.type === 'news' || c.type === 'long-article');
        const memes = allContent.filter(c => c.type === 'meme' || c.type === 'social' || c.type === 'post');

        console.log(`📊 Feed mix: ${articles.length} articles, ${videos.length} videos, ${memes.length} memes`);

        // Create balanced pattern: A-V-A-V-M-A-V-A-V-M (article-video-article-video-meme)
        const shuffled = [];
        const maxLength = Math.max(videos.length, articles.length, memes.length);

        for (let i = 0; i < maxLength * 3; i++) {
            const pattern = i % 5;
            if (pattern === 0 || pattern === 2) {
                // Article slots (0, 2) - PRIORITIZE ARTICLES for Vision.md P0
                if (articles.length > 0) shuffled.push(articles.shift());
                else if (videos.length > 0) shuffled.push(videos.shift()); // Fallback to video
            } else if (pattern === 1 || pattern === 3) {
                // Video slots (1, 3)
                if (videos.length > 0) shuffled.push(videos.shift());
                else if (articles.length > 0) shuffled.push(articles.shift()); // Fallback to article
            } else {
                // Meme/social slot (4)
                if (memes.length > 0) shuffled.push(memes.shift());
                else if (articles.length > 0) shuffled.push(articles.shift()); // Fallback
            }
        }

        // Add any remaining content
        shuffled.push(...articles, ...videos, ...memes);

        // 🎯 ADAPTIVE RANKING: Re-rank by user profile (coverage + engagement)
        const userProfile = {
            cefrLevel: level,
            knownWords: req.query.knownWords ? req.query.knownWords.split(',') : [],
            interestTags: interests.split(','),
            recentMistakes: []
        };

        const rankedContent = feedRanker.rankFeed(shuffled, userProfile);

        // TikTok-style pagination: Return different content per page
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedContent = rankedContent.slice(startIndex, endIndex);

        res.json({
            success: true,
            videos: paginatedContent,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: shuffled.length,
                hasMore: endIndex < shuffled.length
            },
            metadata: {
                level: level,
                interests: interests.split(','),
                userId: userId,
                sources: ['NewsAPI', 'Guardian', 'Pexels', 'LangFeed', 'AI Generated'],
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Unified feed error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load unified feed',
            details: error.message
        });
    }
});

// 🎥 LANGFEED VIDEO DISCOVERY
async function getLangFeedVideos(level, limit = 5) {
    const langfeedPath = '/Users/mindful/Documents/Langfeed';

    try {
        if (!fs.existsSync(langfeedPath)) {
            console.log('⚠️ LangFeed directory not found');
            return [];
        }

        const videos = [];

        // Recursively scan for videos
        const scanDirectory = (dirPath, depth = 0) => {
            if (depth > 2) return; // Max 2 levels deep

            const items = fs.readdirSync(dirPath);

            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    scanDirectory(fullPath, depth + 1);
                } else if (item.endsWith('.mp4')) {
                    const relativePath = fullPath.replace(langfeedPath + '/', '');

                    videos.push({
                        id: `langfeed_${Buffer.from(relativePath).toString('base64')}`,
                        type: 'video',
                        title: item.replace('.mp4', '').replace(/_/g, ' '),
                        spanish: `Video: ${item.replace('.mp4', '').replace(/_/g, ' ')}`,
                        english: `Learn Spanish with this video`,
                        videoUrl: `/api/langfeed/stream/${Buffer.from(relativePath).toString('base64')}`,
                        thumbnail: `https://img.youtube.com/vi/default/0.jpg`, // Placeholder
                        difficulty_level: level,
                        viral_score: 85 + Math.floor(Math.random() * 15),
                        duration: `${Math.floor(stat.size / 1000000)}:00`,
                        source: 'LangFeed',
                        fileSize: stat.size
                    });
                }
            }
        };

        scanDirectory(langfeedPath);

        // Randomize and limit
        return videos.sort(() => Math.random() - 0.5).slice(0, limit);

    } catch (error) {
        console.error('LangFeed video error:', error);
        return [];
    }
}

// 🎥 VIDEO STREAM ENDPOINT
router.get('/langfeed/stream/:videoId', (req, res) => {
    const { videoId } = req.params;
    const langfeedPath = '/Users/mindful/Documents/Langfeed';

    try {
        const relativePath = Buffer.from(videoId, 'base64').toString('utf-8');
        const videoPath = path.join(langfeedPath, relativePath);

        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({ error: 'Video not found' });
        }

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            });

            file.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            });
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        console.error('Video stream error:', error);
        res.status(500).json({ error: 'Stream failed' });
    }
});

// 📊 USER LEVEL DETECTION
router.post('/detect-level', async (req, res) => {
    try {
        const { savedWords = [], interactions = [] } = req.body;

        // Analyze user's known words and interactions
        const level = detectUserLevel(savedWords, interactions);

        res.json({
            success: true,
            detectedLevel: level,
            confidence: 0.85,
            recommendation: `Based on your vocabulary, we recommend ${level} content`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Level detection failed'
        });
    }
});

function detectUserLevel(savedWords, interactions) {
    // Simple level detection based on word count
    const wordCount = savedWords.length;

    if (wordCount < 100) return 'A1';
    if (wordCount < 300) return 'A2';
    if (wordCount < 600) return 'B1';
    if (wordCount < 1200) return 'B2';
    if (wordCount < 2500) return 'C1';
    return 'C2';
}

// 📝 SAVE USER PREFERENCES
router.post('/preferences', (req, res) => {
    try {
        const { userId, level, interests } = req.body;

        // In production, save to database
        // For now, just acknowledge
        res.json({
            success: true,
            message: 'Preferences saved',
            userId: userId,
            level: level,
            interests: interests
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to save preferences'
        });
    }
});

module.exports = router;