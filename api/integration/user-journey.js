/**
 * COMPLETE USER JOURNEY API
 * Handles entire user flow from first visit to mastery
 */

const integration = require('../../lib/unified-integration-controller');

const router = require('express').Router();

/**
 * POST /api/integration/first-visit
 * Initialize first-time user journey
 */
router.post('/first-visit', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }
    
    const result = await integration.handleFirstVisit(userId);
    res.json(result);
    
  } catch (error) {
    console.error('Error handling first visit:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integration/placement-complete
 * Handle placement test completion
 */
router.post('/placement-complete', async (req, res) => {
  try {
    const { userId, testResults } = req.body;
    
    if (!userId || !testResults) {
      return res.status(400).json({
        success: false,
        error: 'userId and testResults are required'
      });
    }
    
    const result = await integration.handlePlacementTestComplete(userId, testResults);
    res.json(result);
    
  } catch (error) {
    console.error('Error handling placement test:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integration/beginner-skip
 * Handle "I'm a beginner" button click
 */
router.post('/beginner-skip', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }
    
    const result = await integration.handleBeginnerSkip(userId);
    res.json(result);
    
  } catch (error) {
    console.error('Error handling beginner skip:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integration/action
 * Track any user action and adjust in real-time
 */
router.post('/action', async (req, res) => {
  try {
    const { userId, action } = req.body;
    
    if (!userId || !action) {
      return res.status(400).json({
        success: false,
        error: 'userId and action are required'
      });
    }
    
    const result = await integration.handleUserAction(userId, action);
    res.json(result);
    
  } catch (error) {
    console.error('Error handling user action:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/integration/feed/:userId
 * Get personalized content feed
 */
router.get('/feed/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { topics, hideWatched, forceRefresh } = req.query;
    
    const options = {
      topics: topics ? topics.split(',') : undefined,
      hideWatched: hideWatched === 'true',
      forceRefresh: forceRefresh === 'true'
    };
    
    const feed = await integration.getPersonalizedFeed(userId, options);
    res.json({
      success: true,
      feed
    });
    
  } catch (error) {
    console.error('Error getting personalized feed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integration/refresh-feed
 * Force refresh feed (after level adjustment)
 */
router.post('/refresh-feed', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }
    
    const feed = await integration.refreshFeedRealTime(userId);
    res.json({
      success: true,
      feed,
      refreshed: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error refreshing feed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/integration/profile/:userId
 * Get complete user profile with all data
 */
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await integration.getUserProfile(userId);
    res.json(profile);
    
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integration/track-session
 * Track complete user session
 */
router.post('/track-session', async (req, res) => {
  try {
    const { userId, sessionData } = req.body;
    
    if (!userId || !sessionData) {
      return res.status(400).json({
        success: false,
        error: 'userId and sessionData are required'
      });
    }
    
    const result = await integration.trackSession(userId, sessionData);
    res.json(result);
    
  } catch (error) {
    console.error('Error tracking session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/integration/progression/:userId
 * Check if user is ready to progress
 */
router.get('/progression/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const progression = await integration.checkProgression(userId);
    res.json({
      success: true,
      ...progression
    });
    
  } catch (error) {
    console.error('Error checking progression:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integration/milestone
 * Check and celebrate milestone
 */
router.post('/milestone', async (req, res) => {
  try {
    const { userId, wordCount } = req.body;
    
    if (!userId || wordCount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'userId and wordCount are required'
      });
    }
    
    const milestone = await integration.checkAndCelebrateMilestone(userId, wordCount);
    res.json({
      success: true,
      milestone,
      hasMilestone: !!milestone
    });
    
  } catch (error) {
    console.error('Error checking milestone:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

