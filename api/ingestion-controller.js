/**
 * 🎬 INGESTION API CONTROLLER
 * 
 * Express API endpoints for triggering content ingestion pipelines
 */

const express = require('express');
const router = express.Router();

// Import ingestion pipelines
const videoIngestion = require('../lib/ingestion/video-ingestion');
const articleIngestion = require('../lib/ingestion/article-ingestion');
const podcastIngestion = require('../lib/ingestion/podcast-ingestion');
const enrichmentPipeline = require('../lib/ingestion/enrichment-pipeline');

/**
 * Middleware: Verify internal API key
 */
const verifyInternalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const internalKey = process.env.INTERNAL_API_KEY || 'dev-internal-key';
    
    if (!authHeader || authHeader !== `Bearer ${internalKey}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    next();
};

/**
 * POST /api/ingestion/videos
 * Ingest YouTube videos
 */
router.post('/videos', verifyInternalAuth, async (req, res) => {
    try {
        const { videosPerChannel = 10 } = req.body;
        
        console.log(`📺 API: Starting video ingestion (${videosPerChannel} per channel)...`);
        
        const result = await videoIngestion.ingestAll(videosPerChannel);
        
        return res.json({
            success: true,
            ...result,
            message: `Ingested ${result.totalIngested} videos`
        });
        
    } catch (error) {
        console.error('Video ingestion API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/ingestion/articles
 * Ingest articles from RSS feeds
 */
router.post('/articles', verifyInternalAuth, async (req, res) => {
    try {
        const { articlesPerFeed = 10 } = req.body;
        
        console.log(`📰 API: Starting article ingestion (${articlesPerFeed} per feed)...`);
        
        const result = await articleIngestion.ingestAll(articlesPerFeed);
        
        return res.json({
            success: true,
            ...result,
            message: `Ingested ${result.totalIngested} articles`
        });
        
    } catch (error) {
        console.error('Article ingestion API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/ingestion/podcasts
 * Ingest podcast episodes
 */
router.post('/podcasts', verifyInternalAuth, async (req, res) => {
    try {
        const { episodesPerFeed = 3 } = req.body;
        
        console.log(`🎙️ API: Starting podcast ingestion (${episodesPerFeed} per feed)...`);
        
        const result = await podcastIngestion.ingestAll(episodesPerFeed);
        
        return res.json({
            success: true,
            ...result,
            message: `Ingested ${result.totalIngested} episodes with ${result.totalClips} clips`
        });
        
    } catch (error) {
        console.error('Podcast ingestion API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/ingestion/enrich
 * Enrich content with vocabulary, questions, etc.
 */
router.post('/enrich', verifyInternalAuth, async (req, res) => {
    try {
        const { articles = 10, videos = 10, clips = 10 } = req.body;
        
        console.log(`🎯 API: Starting content enrichment...`);
        
        const result = await enrichmentPipeline.enrichAll({
            articles,
            videos,
            clips
        });
        
        return res.json({
            success: true,
            ...result,
            message: `Enriched ${result.totalProcessed} items`
        });
        
    } catch (error) {
        console.error('Enrichment API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/ingestion/run-all
 * Run full ingestion pipeline (videos + articles + podcasts + enrichment)
 */
router.post('/run-all', verifyInternalAuth, async (req, res) => {
    try {
        const config = {
            videosPerChannel: req.body.videosPerChannel || 5,
            articlesPerFeed: req.body.articlesPerFeed || 5,
            episodesPerFeed: req.body.episodesPerFeed || 2,
            enrichContent: req.body.enrichContent !== false
        };
        
        console.log('🚀 API: Starting FULL ingestion pipeline...\n');
        
        const results = {
            startTime: new Date().toISOString(),
            videos: null,
            articles: null,
            podcasts: null,
            enrichment: null,
            endTime: null,
            duration: null
        };
        
        const startTime = Date.now();
        
        // Run ingestion pipelines
        try {
            console.log('📺 Running video ingestion...');
            results.videos = await videoIngestion.ingestAll(config.videosPerChannel);
        } catch (error) {
            console.error('Video ingestion failed:', error);
            results.videos = { success: false, error: error.message };
        }
        
        try {
            console.log('\n📰 Running article ingestion...');
            results.articles = await articleIngestion.ingestAll(config.articlesPerFeed);
        } catch (error) {
            console.error('Article ingestion failed:', error);
            results.articles = { success: false, error: error.message };
        }
        
        try {
            console.log('\n🎙️ Running podcast ingestion...');
            results.podcasts = await podcastIngestion.ingestAll(config.episodesPerFeed);
        } catch (error) {
            console.error('Podcast ingestion failed:', error);
            results.podcasts = { success: false, error: error.message };
        }
        
        // Enrich content if enabled
        if (config.enrichContent) {
            try {
                console.log('\n🎯 Running content enrichment...');
                results.enrichment = await enrichmentPipeline.enrichAll({
                    articles: results.articles?.totalIngested || 0,
                    videos: results.videos?.totalIngested || 0,
                    clips: results.podcasts?.totalClips || 0
                });
            } catch (error) {
                console.error('Enrichment failed:', error);
                results.enrichment = { success: false, error: error.message };
            }
        }
        
        results.endTime = new Date().toISOString();
        results.duration = Date.now() - startTime;
        
        console.log('\n✅ FULL PIPELINE COMPLETE');
        console.log(`   Duration: ${(results.duration / 1000).toFixed(1)}s`);
        console.log(`   Videos: ${results.videos?.totalIngested || 0}`);
        console.log(`   Articles: ${results.articles?.totalIngested || 0}`);
        console.log(`   Podcasts: ${results.podcasts?.totalIngested || 0} (${results.podcasts?.totalClips || 0} clips)`);
        if (results.enrichment) {
            console.log(`   Enriched: ${results.enrichment.totalProcessed || 0}`);
        }
        
        return res.json({
            success: true,
            results,
            message: 'Full ingestion pipeline completed'
        });
        
    } catch (error) {
        console.error('Full pipeline API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/ingestion/stats
 * Get ingestion statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const [videoStats, articleStats, podcastStats, enrichmentStats] = await Promise.all([
            videoIngestion.getStats(),
            articleIngestion.getStats(),
            podcastIngestion.getStats(),
            enrichmentPipeline.getStats()
        ]);
        
        return res.json({
            success: true,
            stats: {
                videos: videoStats.stats,
                articles: articleStats.stats,
                podcasts: podcastStats.stats,
                totalContent: enrichmentStats.stats.totalContent
            }
        });
        
    } catch (error) {
        console.error('Stats API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;


