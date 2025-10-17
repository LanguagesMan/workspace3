/**
 * 🎯 LEVEL PROGRESSION API
 * 
 * Endpoints for tracking user level advancement and progress
 */

const express = require('express');
const router = express.Router();
const levelProgression = require('../lib/level-progression');

/**
 * GET /api/level-progression/current
 * Get user's current level and progress
 */
router.get('/current', async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';
        
        const levelData = await levelProgression.calculateCurrentLevel(userId);
        
        res.json({
            success: true,
            data: levelData
        });

    } catch (error) {
        console.error('Error getting current level:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/level-progression/breakdown
 * Get detailed progress breakdown
 */
router.get('/breakdown', async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';
        
        const breakdown = await levelProgression.getProgressBreakdown(userId);
        
        res.json({
            success: true,
            data: breakdown
        });

    } catch (error) {
        console.error('Error getting progress breakdown:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/level-progression/eligibility
 * Check if user can level up
 */
router.get('/eligibility', async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';
        
        const eligibility = await levelProgression.checkLevelUpEligibility(userId);
        
        res.json({
            success: true,
            data: eligibility
        });

    } catch (error) {
        console.error('Error checking eligibility:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/level-progression/level-up
 * Perform level up if eligible
 */
router.post('/level-up', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }
        
        const result = await levelProgression.performLevelUp(userId);
        
        if (result.success) {
            res.json({
                success: true,
                data: result
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }

    } catch (error) {
        console.error('Error performing level up:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/level-progression/velocity
 * Get learning velocity metrics
 */
router.get('/velocity', async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';
        const days = parseInt(req.query.days) || 30;
        
        const velocity = await levelProgression.getLearningVelocity(userId, days);
        
        res.json({
            success: true,
            data: velocity
        });

    } catch (error) {
        console.error('Error getting velocity:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/level-progression/prediction
 * Predict time to next level
 */
router.get('/prediction', async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';
        
        const prediction = await levelProgression.predictTimeToNextLevel(userId);
        
        res.json({
            success: true,
            data: prediction
        });

    } catch (error) {
        console.error('Error getting prediction:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/level-progression/recommendations
 * Get personalized improvement recommendations
 */
router.get('/recommendations', async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';
        
        const recommendations = await levelProgression.getImprovementRecommendations(userId);
        
        res.json({
            success: true,
            data: recommendations
        });

    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

