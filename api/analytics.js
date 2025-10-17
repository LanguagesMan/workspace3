/**
 * 📊 ANALYTICS API
 * 
 * Endpoints for analytics and metrics
 */

const express = require('express');
const router = express.Router();
const analyticsSystem = require('../lib/analytics-system');
const { requireAuth, requireAdmin } = require('../middleware/auth');

/**
 * POST /api/analytics/track
 * Track an event
 */
router.post('/track', requireAuth, async (req, res) => {
    try {
        const { event, properties } = req.body;
        const result = await analyticsSystem.trackEvent(req.userId, event, properties);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/analytics/engagement/:userId
 * Get user engagement metrics
 */
router.get('/engagement/:userId', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;

        // Users can only view their own metrics unless admin
        if (req.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Forbidden'
            });
        }

        const metrics = await analyticsSystem.getUserEngagement(userId, parseInt(days));
        res.json({
            success: true,
            metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/analytics/learning/:userId
 * Get learning effectiveness metrics
 */
router.get('/learning/:userId', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Forbidden'
            });
        }

        const metrics = await analyticsSystem.getLearningEffectiveness(userId);
        res.json({
            success: true,
            metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/analytics/content/:contentType/:contentId
 * Get content performance metrics
 */
router.get('/content/:contentType/:contentId', requireAdmin, async (req, res) => {
    try {
        const { contentType, contentId } = req.params;
        const metrics = await analyticsSystem.getContentPerformance(contentType, contentId);
        res.json({
            success: true,
            metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/analytics/system
 * Get system-wide metrics (admin only)
 */
router.get('/system', requireAdmin, async (req, res) => {
    try {
        const metrics = await analyticsSystem.getSystemMetrics();
        res.json({
            success: true,
            metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/analytics/funnel
 * Get funnel metrics (admin only)
 */
router.get('/funnel', requireAdmin, async (req, res) => {
    try {
        const metrics = await analyticsSystem.getFunnelMetrics();
        res.json({
            success: true,
            metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
