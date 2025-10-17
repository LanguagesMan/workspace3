/**
 * 📊 ANALYTICS API
 * 
 * API endpoints for analytics dashboards and metrics
 */

const express = require('express');
const router = express.Router();
const mixpanel = require('./mixpanel-analytics');
const errorTracking = require('./comprehensive-error-tracking');
const AnalyticsEngine = require('./analytics-engine');
const analyticsSystem = require('./analytics-system');
const { createLogger } = require('./logger');

const logger = createLogger('AnalyticsAPI');
const analyticsEngine = new AnalyticsEngine();

// ==================== USER ANALYTICS ====================

/**
 * GET /api/analytics/user/:userId/summary
 * Get comprehensive user analytics summary
 */
router.get('/user/:userId/summary', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;

        const [
            dailyStats,
            weeklyStats,
            progress,
            insights,
            engagement
        ] = await Promise.all([
            analyticsEngine.getDailyStats(userId),
            analyticsEngine.getWeeklySummary(userId),
            analyticsEngine.getLearningProgress(userId, parseInt(days)),
            analyticsEngine.generateInsights(userId),
            analyticsSystem.getUserEngagement(userId, parseInt(days))
        ]);

        res.json({
            success: true,
            data: {
                dailyStats,
                weeklyStats,
                progress,
                insights,
                engagement
            }
        });
    } catch (error) {
        logger.error('User analytics error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/analytics/user/:userId/daily
 * Get daily statistics for a user
 */
router.get('/user/:userId/daily', async (req, res) => {
    try {
        const { userId } = req.params;
        const { date } = req.query;

        const stats = await analyticsEngine.getDailyStats(userId, date);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Daily stats error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/analytics/user/:userId/weekly
 * Get weekly summary for a user
 */
router.get('/user/:userId/weekly', async (req, res) => {
    try {
        const { userId } = req.params;

        const summary = await analyticsEngine.getWeeklySummary(userId);

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        logger.error('Weekly summary error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/analytics/user/:userId/progress
 * Get learning progress over time
 */
router.get('/user/:userId/progress', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;

        const progress = await analyticsEngine.getLearningProgress(userId, parseInt(days));

        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        logger.error('Progress error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/analytics/user/:userId/insights
 * Get personalized insights and predictions
 */
router.get('/user/:userId/insights', async (req, res) => {
    try {
        const { userId } = req.params;

        const insights = await analyticsEngine.generateInsights(userId);

        res.json({
            success: true,
            data: insights
        });
    } catch (error) {
        logger.error('Insights error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/analytics/user/:userId/interests
 * Get user interest breakdown
 */
router.get('/user/:userId/interests', async (req, res) => {
    try {
        const { userId } = req.params;

        const interests = await analyticsEngine.getUserInterests(userId);

        res.json({
            success: true,
            data: interests
        });
    } catch (error) {
        logger.error('Interests error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/analytics/user/:userId/effectiveness
 * Get learning effectiveness metrics
 */
router.get('/user/:userId/effectiveness', async (req, res) => {
    try {
        const { userId } = req.params;

        const effectiveness = await analyticsSystem.getLearningEffectiveness(userId);

        res.json({
            success: true,
            data: effectiveness
        });
    } catch (error) {
        logger.error('Effectiveness error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== SYSTEM ANALYTICS ====================

/**
 * GET /api/analytics/system/metrics
 * Get system-wide metrics
 */
router.get('/system/metrics', async (req, res) => {
    try {
        const metrics = await analyticsSystem.getSystemMetrics();

        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        logger.error('System metrics error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/analytics/system/funnel
 * Get funnel conversion metrics
 */
router.get('/system/funnel', async (req, res) => {
    try {
        const funnel = await analyticsSystem.getFunnelMetrics();

        res.json({
            success: true,
            data: funnel
        });
    } catch (error) {
        logger.error('Funnel metrics error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/analytics/system/performance
 * Get system performance metrics
 */
router.get('/system/performance', async (req, res) => {
    try {
        const performance = errorTracking.getPerformanceMetrics();
        const errors = errorTracking.getErrorSummary();

        res.json({
            success: true,
            data: {
                performance,
                errors
            }
        });
    } catch (error) {
        logger.error('Performance metrics error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== CONTENT ANALYTICS ====================

/**
 * GET /api/analytics/content/:contentType/:contentId
 * Get content performance metrics
 */
router.get('/content/:contentType/:contentId', async (req, res) => {
    try {
        const { contentType, contentId } = req.params;

        const performance = await analyticsSystem.getContentPerformance(contentType, contentId);

        res.json({
            success: true,
            data: performance
        });
    } catch (error) {
        logger.error('Content performance error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/analytics/content/:userId/engagement
 * Get user content engagement history
 */
router.get('/content/:userId/engagement', async (req, res) => {
    try {
        const { userId } = req.params;
        const { contentType, days = 30 } = req.query;

        const engagement = await analyticsEngine.getContentEngagement(
            userId,
            contentType,
            parseInt(days)
        );

        res.json({
            success: true,
            data: engagement
        });
    } catch (error) {
        logger.error('Content engagement error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== EVENT TRACKING ====================

/**
 * POST /api/analytics/track
 * Track custom event
 */
router.post('/track', async (req, res) => {
    try {
        const { userId, event, properties } = req.body;

        if (!userId || !event) {
            return res.status(400).json({
                success: false,
                error: 'userId and event are required'
            });
        }

        // Track in Mixpanel
        mixpanel.track(userId, event, properties);

        // Track in analytics engine if it's a learning action
        if (event.includes('Video') || event.includes('Word') || event.includes('Game')) {
            await analyticsEngine.trackAction(userId, {
                type: event.toLowerCase().split(' ')[0],
                ...properties
            });
        }

        res.json({
            success: true,
            message: 'Event tracked'
        });
    } catch (error) {
        logger.error('Track event error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/analytics/user/:userId/properties
 * Update user properties
 */
router.post('/user/:userId/properties', async (req, res) => {
    try {
        const { userId } = req.params;
        const properties = req.body;

        mixpanel.updateUserProfile(userId, properties);

        res.json({
            success: true,
            message: 'User properties updated'
        });
    } catch (error) {
        logger.error('Update properties error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== DASHBOARD DATA ====================

/**
 * GET /api/analytics/dashboard/:userId
 * Get complete dashboard data
 */
router.get('/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get comprehensive dashboard data
        const [
            dailyStats,
            weeklyStats,
            progress,
            insights,
            engagement,
            effectiveness,
            interests
        ] = await Promise.all([
            analyticsEngine.getDailyStats(userId),
            analyticsEngine.getWeeklySummary(userId),
            analyticsEngine.getLearningProgress(userId, 30),
            analyticsEngine.generateInsights(userId),
            analyticsSystem.getUserEngagement(userId, 30),
            analyticsSystem.getLearningEffectiveness(userId),
            analyticsEngine.getUserInterests(userId)
        ]);

        res.json({
            success: true,
            data: {
                today: dailyStats,
                week: weeklyStats,
                progress,
                insights,
                engagement,
                effectiveness,
                interests
            }
        });
    } catch (error) {
        logger.error('Dashboard data error:', error);
        errorTracking.captureAPIError(error, req);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

