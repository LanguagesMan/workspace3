/**
 * 🎯 ENGAGEMENT API
 * Powers the addictive scrolling experience
 * 
 * Endpoints:
 * - POST /api/engagement/reward - Trigger variable reward
 * - POST /api/engagement/celebrate - Trigger celebration
 * - GET /api/engagement/social-proof - Get social proof message
 * - GET /api/engagement/fomo - Get FOMO trigger
 * - POST /api/engagement/track - Track micro-interaction
 * - GET /api/engagement/experiments - Get user's A/B test variants
 * - POST /api/engagement/metric - Track A/B test metric
 */

const express = require('express');
const router = express.Router();
const dopamineEngine = require('../../lib/dopamine-engine');
const abTestingEngine = require('../../lib/ab-testing-engine');
const behavioralTracker = require('../../lib/behavioral-tracker');

/**
 * 🎁 TRIGGER VARIABLE REWARD
 * POST /api/engagement/reward
 * Body: { userId, contentType }
 */
router.post('/reward', (req, res) => {
    try {
        const { userId, contentType = 'content' } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }
        
        const reward = dopamineEngine.triggerVariableReward(userId, contentType);
        
        res.json({
            success: true,
            reward
        });
        
    } catch (error) {
        console.error('Error triggering reward:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 🎉 TRIGGER CELEBRATION
 * POST /api/engagement/celebrate
 * Body: { userId, actionType, metadata }
 */
router.post('/celebrate', (req, res) => {
    try {
        const { userId, actionType, metadata = {} } = req.body;
        
        if (!userId || !actionType) {
            return res.status(400).json({
                success: false,
                error: 'userId and actionType are required'
            });
        }
        
        const celebration = dopamineEngine.triggerCelebration(userId, actionType, metadata);
        
        res.json({
            success: true,
            celebration
        });
        
    } catch (error) {
        console.error('Error triggering celebration:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 👥 GET SOCIAL PROOF MESSAGE
 * GET /api/engagement/social-proof
 */
router.get('/social-proof', (req, res) => {
    try {
        const socialProof = dopamineEngine.getSocialProofMessage();
        
        res.json({
            success: true,
            socialProof
        });
        
    } catch (error) {
        console.error('Error getting social proof:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * ⏰ GET FOMO TRIGGER
 * GET /api/engagement/fomo
 */
router.get('/fomo', (req, res) => {
    try {
        const fomo = dopamineEngine.getFOMOTrigger();
        
        res.json({
            success: true,
            fomo
        });
        
    } catch (error) {
        console.error('Error getting FOMO trigger:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 📊 CHECK SESSION MILESTONE
 * POST /api/engagement/milestone
 * Body: { userId, sessionStats }
 */
router.post('/milestone', (req, res) => {
    try {
        const { userId, sessionStats } = req.body;
        
        if (!userId || !sessionStats) {
            return res.status(400).json({
                success: false,
                error: 'userId and sessionStats are required'
            });
        }
        
        const milestones = dopamineEngine.checkSessionMilestone(userId, sessionStats);
        
        res.json({
            success: true,
            milestones
        });
        
    } catch (error) {
        console.error('Error checking milestones:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 🔥 CALCULATE ADDICTION SCORE
 * POST /api/engagement/addiction-score
 * Body: { userId, analytics }
 */
router.post('/addiction-score', (req, res) => {
    try {
        const { userId, analytics = {} } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }
        
        const addictionScore = dopamineEngine.calculateAddictionScore(userId, analytics);
        
        res.json({
            success: true,
            addictionScore
        });
        
    } catch (error) {
        console.error('Error calculating addiction score:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 🎯 TRACK MICRO-INTERACTION
 * POST /api/engagement/track-micro
 * Body: { userId, videoId, interactions }
 */
router.post('/track-micro', (req, res) => {
    try {
        const { userId, videoId, interactions } = req.body;
        
        if (!userId || !videoId || !interactions) {
            return res.status(400).json({
                success: false,
                error: 'userId, videoId, and interactions are required'
            });
        }
        
        const result = behavioralTracker.trackMicroInteractions(userId, videoId, interactions);
        
        res.json({
            success: true,
            result
        });
        
    } catch (error) {
        console.error('Error tracking micro-interactions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * ⏱️ TRACK WATCH TIME INTERVAL
 * POST /api/engagement/track-watch-time
 * Body: { userId, contentId, currentTime, totalDuration }
 */
router.post('/track-watch-time', (req, res) => {
    try {
        const { userId, contentId, currentTime, totalDuration } = req.body;
        
        if (!userId || !contentId || currentTime === undefined || !totalDuration) {
            return res.status(400).json({
                success: false,
                error: 'userId, contentId, currentTime, and totalDuration are required'
            });
        }
        
        const result = behavioralTracker.trackWatchTimeInterval(userId, contentId, currentTime, totalDuration);
        
        res.json({
            success: true,
            result
        });
        
    } catch (error) {
        console.error('Error tracking watch time:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 🔄 DETECT REWATCH
 * POST /api/engagement/detect-rewatch
 * Body: { userId, contentId }
 */
router.post('/detect-rewatch', (req, res) => {
    try {
        const { userId, contentId } = req.body;
        
        if (!userId || !contentId) {
            return res.status(400).json({
                success: false,
                error: 'userId and contentId are required'
            });
        }
        
        const result = behavioralTracker.detectRewatch(userId, contentId);
        
        res.json({
            success: true,
            result
        });
        
    } catch (error) {
        console.error('Error detecting rewatch:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * ⚡ DETECT SKIP PATTERN
 * POST /api/engagement/detect-skip
 * Body: { userId, contentId, watchTime, totalDuration }
 */
router.post('/detect-skip', (req, res) => {
    try {
        const { userId, contentId, watchTime, totalDuration } = req.body;
        
        if (!userId || !contentId || watchTime === undefined || !totalDuration) {
            return res.status(400).json({
                success: false,
                error: 'userId, contentId, watchTime, and totalDuration are required'
            });
        }
        
        const result = behavioralTracker.detectSkipPattern(userId, contentId, watchTime, totalDuration);
        
        res.json({
            success: true,
            result
        });
        
    } catch (error) {
        console.error('Error detecting skip:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== A/B TESTING ENDPOINTS ====================

/**
 * 🧪 GET USER'S EXPERIMENT VARIANTS
 * GET /api/engagement/experiments/:userId
 */
router.get('/experiments/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        
        const experiments = abTestingEngine.getUserExperiments(userId);
        
        res.json({
            success: true,
            experiments
        });
        
    } catch (error) {
        console.error('Error getting experiments:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 🧪 GET SPECIFIC VARIANT
 * GET /api/engagement/variant/:experimentId/:userId
 */
router.get('/variant/:experimentId/:userId', (req, res) => {
    try {
        const { experimentId, userId } = req.params;
        
        const variant = abTestingEngine.getVariant(userId, experimentId);
        
        res.json({
            success: true,
            experimentId,
            variant
        });
        
    } catch (error) {
        console.error('Error getting variant:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 📊 TRACK A/B TEST METRIC
 * POST /api/engagement/track-metric
 * Body: { userId, experimentId, metricName, value }
 */
router.post('/track-metric', (req, res) => {
    try {
        const { userId, experimentId, metricName, value } = req.body;
        
        if (!userId || !experimentId || !metricName || value === undefined) {
            return res.status(400).json({
                success: false,
                error: 'userId, experimentId, metricName, and value are required'
            });
        }
        
        abTestingEngine.trackMetric(userId, experimentId, metricName, value);
        
        res.json({
            success: true,
            message: 'Metric tracked'
        });
        
    } catch (error) {
        console.error('Error tracking metric:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 📝 TRACK A/B TEST EVENT
 * POST /api/engagement/track-event
 * Body: { userId, experimentId, eventType, metadata }
 */
router.post('/track-event', (req, res) => {
    try {
        const { userId, experimentId, eventType, metadata = {} } = req.body;
        
        if (!userId || !experimentId || !eventType) {
            return res.status(400).json({
                success: false,
                error: 'userId, experimentId, and eventType are required'
            });
        }
        
        abTestingEngine.trackEvent(userId, experimentId, eventType, metadata);
        
        res.json({
            success: true,
            message: 'Event tracked'
        });
        
    } catch (error) {
        console.error('Error tracking event:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 📈 GET EXPERIMENT RESULTS
 * GET /api/engagement/results/:experimentId
 */
router.get('/results/:experimentId', (req, res) => {
    try {
        const { experimentId } = req.params;
        
        const results = abTestingEngine.getResults(experimentId);
        
        if (!results) {
            return res.status(404).json({
                success: false,
                error: 'Experiment not found'
            });
        }
        
        res.json({
            success: true,
            results
        });
        
    } catch (error) {
        console.error('Error getting results:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 📋 GET ALL ACTIVE EXPERIMENTS
 * GET /api/engagement/experiments
 */
router.get('/experiments', (req, res) => {
    try {
        const experiments = abTestingEngine.getActiveExperiments();
        
        res.json({
            success: true,
            experiments
        });
        
    } catch (error) {
        console.error('Error getting experiments:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;


