/**
 * 🎯 ADAPTIVE LEVEL API
 * Dynamic difficulty adjustment and level progression
 * 
 * Endpoints:
 * - GET /assess - Assess user's current level
 * - POST /upgrade - Upgrade user to next level
 * - POST /downgrade - Downgrade user to previous level
 * - POST /award-points - Award points to user
 * - GET /analytics - Get learning analytics
 * - GET /recommendations - Get recommended content difficulty
 */

const express = require('express');
const router = express.Router();
const adaptiveLevelSystem = require('../lib/adaptive-level-system');

/**
 * GET /api/level/assess
 * Assess user's current level based on performance
 */
router.get('/assess', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const assessment = await adaptiveLevelSystem.assessLevel(userId);

        res.json({
            success: true,
            assessment
        });

    } catch (error) {
        console.error('Error assessing level:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to assess level',
            details: error.message
        });
    }
});

/**
 * POST /api/level/upgrade
 * Upgrade user to next level
 */
router.post('/upgrade', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const result = await adaptiveLevelSystem.upgradeLevel(userId);

        res.json(result);

    } catch (error) {
        console.error('Error upgrading level:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upgrade level',
            details: error.message
        });
    }
});

/**
 * POST /api/level/downgrade
 * Downgrade user to previous level
 */
router.post('/downgrade', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const result = await adaptiveLevelSystem.downgradeLevel(userId);

        res.json(result);

    } catch (error) {
        console.error('Error downgrading level:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to downgrade level',
            details: error.message
        });
    }
});

/**
 * POST /api/level/award-points
 * Award points to user
 */
router.post('/award-points', async (req, res) => {
    try {
        const { userId, points, activityType } = req.body;

        if (!userId || !points) {
            return res.status(400).json({
                success: false,
                error: 'userId and points are required'
            });
        }

        const result = await adaptiveLevelSystem.awardPoints(
            userId,
            parseInt(points),
            activityType || 'general'
        );

        res.json(result);

    } catch (error) {
        console.error('Error awarding points:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to award points',
            details: error.message
        });
    }
});

/**
 * GET /api/level/analytics
 * Get learning analytics for user
 */
router.get('/analytics', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const analytics = await adaptiveLevelSystem.getAnalytics(userId);

        res.json({
            success: true,
            analytics
        });

    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get analytics',
            details: error.message
        });
    }
});

/**
 * GET /api/level/recommendations
 * Get recommended content difficulty for user
 */
router.get('/recommendations', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        // Get user profile to determine level
        const profile = await adaptiveLevelSystem.getUserProfile(userId);
        const recommendations = adaptiveLevelSystem.getRecommendedDifficulty(
            profile.proficiency_level
        );

        res.json({
            success: true,
            userLevel: profile.proficiency_level,
            recommendations
        });

    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get recommendations',
            details: error.message
        });
    }
});

module.exports = router;

