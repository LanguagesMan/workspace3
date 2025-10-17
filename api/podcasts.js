/**
 * 🎙️ PODCAST API
 * 
 * Endpoints for podcast discovery, playback, and clip management
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const podcastAggregator = require('../lib/podcast-feed-aggregator');
const transcriptionService = require('../lib/podcast-transcription-service');

const prisma = new PrismaClient();

/**
 * GET /api/podcasts/discover
 * Get podcasts by level and topic
 */
router.get('/discover', async (req, res) => {
    try {
        const {
            level = null,
            topic = null,
            limit = 20,
            offset = 0
        } = req.query;

        const where = {};
        
        if (level) {
            where.level = level;
        }

        const podcasts = await prisma.podcast.findMany({
            where,
            orderBy: { pubDate: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        res.json({
            success: true,
            podcasts,
            count: podcasts.length
        });

    } catch (error) {
        console.error('Error discovering podcasts:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/podcasts/:podcastId
 * Get podcast details
 */
router.get('/:podcastId', async (req, res) => {
    try {
        const { podcastId } = req.params;

        const podcast = await prisma.podcast.findUnique({
            where: { id: podcastId },
            include: {
                clips: {
                    orderBy: { clipNumber: 'asc' }
                }
            }
        });

        if (!podcast) {
            return res.status(404).json({
                success: false,
                error: 'Podcast not found'
            });
        }

        res.json({
            success: true,
            podcast
        });

    } catch (error) {
        console.error('Error getting podcast:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/podcasts/clips/by-level
 * Get podcast clips filtered by level
 */
router.get('/clips/by-level', async (req, res) => {
    try {
        const { level = 'B1', limit = 20 } = req.query;

        const clips = await transcriptionService.getClipsByLevel(level);

        res.json({
            success: true,
            clips: clips.slice(0, parseInt(limit)),
            count: clips.length
        });

    } catch (error) {
        console.error('Error getting clips:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/podcasts/clips/:clipId
 * Get clip details
 */
router.get('/clips/:clipId', async (req, res) => {
    try {
        const { clipId } = req.params;

        const clip = await prisma.podcastClip.findUnique({
            where: { id: clipId },
            include: {
                podcast: true
            }
        });

        if (!clip) {
            return res.status(404).json({
                success: false,
                error: 'Clip not found'
            });
        }

        res.json({
            success: true,
            clip
        });

    } catch (error) {
        console.error('Error getting clip:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/podcasts/transcribe/:podcastId
 * Trigger transcription for a podcast
 */
router.post('/transcribe/:podcastId', async (req, res) => {
    try {
        const { podcastId } = req.params;

        const result = await transcriptionService.transcribePodcast(podcastId);

        res.json(result);

    } catch (error) {
        console.error('Error transcribing podcast:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/podcasts/aggregate
 * Aggregate new podcasts from RSS feeds
 */
router.post('/aggregate', async (req, res) => {
    try {
        const result = await podcastAggregator.aggregateAll();

        res.json({
            success: true,
            result
        });

    } catch (error) {
        console.error('Error aggregating podcasts:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/podcasts/stats/overview
 * Get podcast statistics
 */
router.get('/stats/overview', async (req, res) => {
    try {
        const totalPodcasts = await prisma.podcast.count();
        const transcribed = await prisma.podcast.count({
            where: { transcribed: true }
        });
        const totalClips = await prisma.podcastClip.count();

        const byLevel = {};
        for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
            byLevel[level] = await prisma.podcastClip.count({
                where: { level }
            });
        }

        res.json({
            success: true,
            stats: {
                totalPodcasts,
                transcribed,
                untranscribed: totalPodcasts - transcribed,
                totalClips,
                byLevel
            }
        });

    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

