/**
 * Analytics API Router
 * Handles all analytics-related endpoints
 */

const AnalyticsEngine = require('../../lib/analytics-engine');

const analytics = new AnalyticsEngine();

/**
 * Main analytics router
 */
module.exports = async (req, res) => {
    const { method, url } = req;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Parse URL path
        const urlParts = url.split('?')[0].split('/').filter(Boolean);
        
        // Remove 'api' and 'analytics' from path
        const pathParts = urlParts.slice(2);

        // POST /api/analytics/track - Track user action
        if (method === 'POST' && pathParts[0] === 'track') {
            return await handleTrack(req, res);
        }

        // GET /api/analytics/:userId/daily - Get daily stats
        if (method === 'GET' && pathParts[1] === 'daily') {
            return await handleDaily(req, res, pathParts[0]);
        }

        // GET /api/analytics/:userId/weekly - Get weekly summary
        if (method === 'GET' && pathParts[1] === 'weekly') {
            return await handleWeekly(req, res, pathParts[0]);
        }

        // GET /api/analytics/:userId/progress - Get learning progress
        if (method === 'GET' && pathParts[1] === 'progress') {
            return await handleProgress(req, res, pathParts[0]);
        }

        // GET /api/analytics/:userId/interests - Get interest breakdown
        if (method === 'GET' && pathParts[1] === 'interests') {
            return await handleInterests(req, res, pathParts[0]);
        }

        // GET /api/analytics/:userId/insights - Get insights and predictions
        if (method === 'GET' && pathParts[1] === 'insights') {
            return await handleInsights(req, res, pathParts[0]);
        }

        // GET /api/analytics/:userId/engagement - Get content engagement
        if (method === 'GET' && pathParts[1] === 'engagement') {
            return await handleEngagement(req, res, pathParts[0]);
        }

        // Fallback
        res.status(404).json({ error: 'Endpoint not found' });
    } catch (error) {
        console.error('Analytics API error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};

/**
 * POST /api/analytics/track
 * Track user action
 */
async function handleTrack(req, res) {
    try {
        const { userId, action } = req.body;

        if (!userId || !action) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['userId', 'action']
            });
        }

        const result = await analytics.trackAction(userId, action);
        
        if (!result.success) {
            return res.status(500).json({ 
                error: 'Failed to track action',
                message: result.error
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Action tracked successfully',
            activity: result.activity
        });
    } catch (error) {
        console.error('Track error:', error);
        res.status(500).json({ 
            error: 'Failed to track action',
            message: error.message 
        });
    }
}

/**
 * GET /api/analytics/:userId/daily
 * Get daily statistics
 */
async function handleDaily(req, res, userId) {
    try {
        // Parse date from query params
        const url = new URL(req.url, `http://${req.headers.host}`);
        const date = url.searchParams.get('date');

        const stats = await analytics.getDailyStats(userId, date);

        if (!stats) {
            return res.status(404).json({ 
                error: 'No activity found',
                userId,
                date: date || 'today'
            });
        }

        res.status(200).json({ 
            success: true,
            stats
        });
    } catch (error) {
        console.error('Daily stats error:', error);
        res.status(500).json({ 
            error: 'Failed to get daily stats',
            message: error.message 
        });
    }
}

/**
 * GET /api/analytics/:userId/weekly
 * Get weekly summary
 */
async function handleWeekly(req, res, userId) {
    try {
        const summary = await analytics.getWeeklySummary(userId);

        if (!summary) {
            return res.status(404).json({ 
                error: 'No activity found',
                userId
            });
        }

        res.status(200).json({ 
            success: true,
            summary
        });
    } catch (error) {
        console.error('Weekly summary error:', error);
        res.status(500).json({ 
            error: 'Failed to get weekly summary',
            message: error.message 
        });
    }
}

/**
 * GET /api/analytics/:userId/progress
 * Get learning progress over time
 */
async function handleProgress(req, res, userId) {
    try {
        // Parse days from query params
        const url = new URL(req.url, `http://${req.headers.host}`);
        const days = parseInt(url.searchParams.get('days') || '30');

        const progress = await analytics.getLearningProgress(userId, days);

        if (!progress) {
            return res.status(404).json({ 
                error: 'No progress data found',
                userId
            });
        }

        res.status(200).json({ 
            success: true,
            progress
        });
    } catch (error) {
        console.error('Progress error:', error);
        res.status(500).json({ 
            error: 'Failed to get progress',
            message: error.message 
        });
    }
}

/**
 * GET /api/analytics/:userId/interests
 * Get user interest breakdown
 */
async function handleInterests(req, res, userId) {
    try {
        const interests = await analytics.getUserInterests(userId);

        res.status(200).json({ 
            success: true,
            interests
        });
    } catch (error) {
        console.error('Interests error:', error);
        res.status(500).json({ 
            error: 'Failed to get interests',
            message: error.message 
        });
    }
}

/**
 * GET /api/analytics/:userId/insights
 * Get insights and predictions
 */
async function handleInsights(req, res, userId) {
    try {
        const insights = await analytics.generateInsights(userId);

        if (!insights) {
            return res.status(404).json({ 
                error: 'Could not generate insights',
                userId
            });
        }

        res.status(200).json({ 
            success: true,
            insights: insights.insights,
            predictions: insights.predictions,
            skillRadar: insights.skillRadar
        });
    } catch (error) {
        console.error('Insights error:', error);
        res.status(500).json({ 
            error: 'Failed to generate insights',
            message: error.message 
        });
    }
}

/**
 * GET /api/analytics/:userId/engagement
 * Get content engagement history
 */
async function handleEngagement(req, res, userId) {
    try {
        // Parse query params
        const url = new URL(req.url, `http://${req.headers.host}`);
        const contentType = url.searchParams.get('contentType');
        const days = parseInt(url.searchParams.get('days') || '30');

        const engagement = await analytics.getContentEngagement(userId, contentType, days);

        if (!engagement) {
            return res.status(404).json({ 
                error: 'No engagement data found',
                userId
            });
        }

        res.status(200).json({ 
            success: true,
            engagement
        });
    } catch (error) {
        console.error('Engagement error:', error);
        res.status(500).json({ 
            error: 'Failed to get engagement data',
            message: error.message 
        });
    }
}


