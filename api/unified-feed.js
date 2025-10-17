/**
 * 🎯 UNIFIED FEED API
 * The Netflix algorithm for language learning
 */

const express = require('express');
const router = express.Router();
const unifiedFeedAlgorithm = require('../lib/unified-feed-algorithm');

/**
 * GET /api/feed/unified
 * Get personalized unified feed for user
 * 
 * Query params:
 * - userId: User ID (required)
 * - limit: Number of items (default: 50)
 * - offset: Pagination offset (default: 0)
 */
router.get('/unified', async (req, res) => {
    try {
        const { userId, limit = 50, offset = 0 } = req.query;

        if (!userId) {
            return res.status(400).json({
                error: 'userId is required'
            });
        }

        console.log(`📱 Unified feed request: userId=${userId}, limit=${limit}`);

        // Generate feed
        const feed = await unifiedFeedAlgorithm.generateUnifiedFeed(
            userId,
            parseInt(limit) + parseInt(offset)
        );

        // Apply pagination
        const paginated = feed.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

        res.json({
            success: true,
            items: paginated,
            total: feed.length,
            offset: parseInt(offset),
            limit: parseInt(limit),
            hasMore: feed.length > parseInt(offset) + parseInt(limit)
        });

    } catch (error) {
        console.error('Error getting unified feed:', error);
        res.status(500).json({
            error: 'Failed to generate feed',
            details: error.message
        });
    }
});

/**
 * GET /api/feed/stats/:userId
 * Get feed statistics for user
 */
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const stats = await unifiedFeedAlgorithm.getFeedStats(userId);

        res.json({
            success: true,
            ...stats
        });

    } catch (error) {
        console.error('Error getting feed stats:', error);
        res.status(500).json({
            error: 'Failed to get stats',
            details: error.message
        });
    }
});

/**
 * POST /api/feed/refresh
 * Refresh feed with new content
 */
router.post('/refresh', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                error: 'userId is required'
            });
        }

        // Clear any cached feed data (if implemented)
        // For now, just generate fresh feed
        const feed = await unifiedFeedAlgorithm.generateUnifiedFeed(userId, 50);

        res.json({
            success: true,
            items: feed,
            message: 'Feed refreshed'
        });

    } catch (error) {
        console.error('Error refreshing feed:', error);
        res.status(500).json({
            error: 'Failed to refresh feed',
            details: error.message
        });
    }
});

module.exports = router;

