/**
 * 🎯 ADAPTIVE FEED API
 * Endpoints for the intelligent, adaptive feed system
 */

const express = require('express');
const router = express.Router();
const unifiedFeedV2 = require('../lib/unified-feed-algorithm-v2');
const learningGraph = require('../lib/learning-graph-persistence');
const personalizationSignals = require('../lib/personalization-signals-tracker');
const multiArmedBandit = require('../lib/multi-armed-bandit');

/**
 * GET /api/adaptive-feed
 * Get personalized adaptive feed
 */
router.get('/', async (req, res) => {
    try {
        const { userId, limit = 50, sessionPosition = 0, includeSRS = 'true' } = req.query;

        if (!userId) {
            return res.status(400).json({
                error: 'userId is required'
            });
        }

        console.log(`📱 Adaptive feed request: userId=${userId}, limit=${limit}, session=${sessionPosition}`);

        const feed = await unifiedFeedV2.generateUnifiedFeed(userId, {
            limit: parseInt(limit),
            sessionPosition: parseInt(sessionPosition),
            includeSRS: includeSRS === 'true'
        });

        res.json({
            success: true,
            items: feed,
            count: feed.length,
            sessionPosition: parseInt(sessionPosition)
        });

    } catch (error) {
        console.error('Error getting adaptive feed:', error);
        res.status(500).json({
            error: 'Failed to generate adaptive feed',
            details: error.message
        });
    }
});

/**
 * POST /api/adaptive-feed/interaction
 * Record user interaction with feed item
 */
router.post('/interaction', async (req, res) => {
    try {
        const { userId, interaction } = req.body;

        if (!userId || !interaction) {
            return res.status(400).json({
                error: 'userId and interaction are required'
            });
        }

        // Record interaction and update bandit
        const result = await unifiedFeedV2.recordFeedInteraction(userId, interaction);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Error recording interaction:', error);
        res.status(500).json({
            error: 'Failed to record interaction',
            details: error.message
        });
    }
});

/**
 * POST /api/adaptive-feed/signals/time-spent
 * Track time spent on content
 */
router.post('/signals/time-spent', async (req, res) => {
    try {
        const { userId, contentId, contentType, timeSpent, totalDuration } = req.body;

        const result = await personalizationSignals.trackTimeSpent(
            userId,
            contentId,
            contentType,
            timeSpent,
            totalDuration
        );

        res.json({ success: true, ...result });

    } catch (error) {
        console.error('Error tracking time spent:', error);
        res.status(500).json({
            error: 'Failed to track time spent',
            details: error.message
        });
    }
});

/**
 * POST /api/adaptive-feed/signals/skip
 * Track content skip
 */
router.post('/signals/skip', async (req, res) => {
    try {
        const { userId, contentId, contentType, skipPosition, totalDuration } = req.body;

        const result = await personalizationSignals.trackSkip(
            userId,
            contentId,
            contentType,
            skipPosition,
            totalDuration
        );

        res.json({ success: true, ...result });

    } catch (error) {
        console.error('Error tracking skip:', error);
        res.status(500).json({
            error: 'Failed to track skip',
            details: error.message
        });
    }
});

/**
 * POST /api/adaptive-feed/signals/engagement
 * Track like/save/share
 */
router.post('/signals/engagement', async (req, res) => {
    try {
        const { userId, contentId, contentType, action } = req.body;

        if (!['like', 'save', 'share'].includes(action)) {
            return res.status(400).json({
                error: 'Invalid action. Must be like, save, or share'
            });
        }

        const result = await personalizationSignals.trackEngagement(
            userId,
            contentId,
            contentType,
            action
        );

        res.json({ success: true, ...result });

    } catch (error) {
        console.error('Error tracking engagement:', error);
        res.status(500).json({
            error: 'Failed to track engagement',
            details: error.message
        });
    }
});

/**
 * POST /api/adaptive-feed/signals/rating
 * Track content difficulty rating
 */
router.post('/signals/rating', async (req, res) => {
    try {
        const { userId, contentId, contentType, rating } = req.body;

        if (!['too_hard', 'too_easy', 'just_right'].includes(rating)) {
            return res.status(400).json({
                error: 'Invalid rating. Must be too_hard, too_easy, or just_right'
            });
        }

        const result = await personalizationSignals.trackContentRating(
            userId,
            contentId,
            contentType,
            rating
        );

        res.json({ success: true, ...result });

    } catch (error) {
        console.error('Error tracking rating:', error);
        res.status(500).json({
            error: 'Failed to track rating',
            details: error.message
        });
    }
});

/**
 * POST /api/adaptive-feed/signals/word-lookup
 * Track word lookup
 */
router.post('/signals/word-lookup', async (req, res) => {
    try {
        const { userId, word, context, contentId } = req.body;

        const result = await personalizationSignals.trackWordLookup(
            userId,
            word,
            context,
            contentId
        );

        res.json({ success: true, ...result });

    } catch (error) {
        console.error('Error tracking word lookup:', error);
        res.status(500).json({
            error: 'Failed to track word lookup',
            details: error.message
        });
    }
});

/**
 * POST /api/adaptive-feed/signals/performance
 * Track quiz/game performance
 */
router.post('/signals/performance', async (req, res) => {
    try {
        const { userId, activityType, activityId, score, maxScore, difficulty } = req.body;

        const result = await personalizationSignals.trackPerformance(
            userId,
            activityType,
            activityId,
            score,
            maxScore,
            difficulty
        );

        res.json({ success: true, ...result });

    } catch (error) {
        console.error('Error tracking performance:', error);
        res.status(500).json({
            error: 'Failed to track performance',
            details: error.message
        });
    }
});

/**
 * GET /api/adaptive-feed/profile/:userId
 * Get personalization profile
 */
router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const profile = await personalizationSignals.getPersonalizationProfile(userId);

        res.json({
            success: true,
            profile
        });

    } catch (error) {
        console.error('Error getting personalization profile:', error);
        res.status(500).json({
            error: 'Failed to get personalization profile',
            details: error.message
        });
    }
});

/**
 * GET /api/adaptive-feed/stats/:userId
 * Get feed statistics and bandit performance
 */
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const stats = await unifiedFeedV2.getFeedStats(userId);

        res.json({
            success: true,
            ...stats
        });

    } catch (error) {
        console.error('Error getting feed stats:', error);
        res.status(500).json({
            error: 'Failed to get feed stats',
            details: error.message
        });
    }
});

/**
 * GET /api/adaptive-feed/bandit/:userId
 * Get multi-armed bandit statistics
 */
router.get('/bandit/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const banditStats = multiArmedBandit.getUserStats(userId);

        res.json({
            success: true,
            stats: banditStats
        });

    } catch (error) {
        console.error('Error getting bandit stats:', error);
        res.status(500).json({
            error: 'Failed to get bandit stats',
            details: error.message
        });
    }
});

/**
 * POST /api/adaptive-feed/bandit/:userId/reset
 * Reset bandit for user (testing/debugging)
 */
router.post('/bandit/:userId/reset', async (req, res) => {
    try {
        const { userId } = req.params;

        multiArmedBandit.resetUser(userId);

        res.json({
            success: true,
            message: 'Bandit reset successfully'
        });

    } catch (error) {
        console.error('Error resetting bandit:', error);
        res.status(500).json({
            error: 'Failed to reset bandit',
            details: error.message
        });
    }
});

/**
 * GET /api/adaptive-feed/learning-graph/:userId
 * Get learning graph statistics
 */
router.get('/learning-graph/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 7 } = req.query;

        const patterns = await learningGraph.getInteractionPatterns(userId);
        const comprehensionScore = await learningGraph.calculateComprehensionScore(
            userId,
            parseInt(days)
        );
        const successRates = await learningGraph.getSuccessRateByDifficulty(userId);

        res.json({
            success: true,
            patterns,
            comprehensionScore,
            successRates
        });

    } catch (error) {
        console.error('Error getting learning graph:', error);
        res.status(500).json({
            error: 'Failed to get learning graph',
            details: error.message
        });
    }
});

/**
 * POST /api/adaptive-feed/update-interests
 * Manually update user interests (can also be done automatically)
 */
router.post('/update-interests', async (req, res) => {
    try {
        const { userId } = req.body;

        const result = await learningGraph.updateInterestWeights(userId);

        res.json({
            success: true,
            interests: result
        });

    } catch (error) {
        console.error('Error updating interests:', error);
        res.status(500).json({
            error: 'Failed to update interests',
            details: error.message
        });
    }
});

module.exports = router;


