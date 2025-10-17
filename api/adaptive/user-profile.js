/**
 * GET /api/adaptive/user-profile/:userId
 * Get complete user adaptive profile with signals and recommendations
 */

const geniusAdaptive = require('../../lib/genius-adaptive-system');
const behavioralTracker = require('../../lib/behavioral-tracker');

module.exports = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }
    
    // Get behavioral signals
    const signals = behavioralTracker.calculateUserSignals(userId);
    
    // Get session stats
    const sessionStats = behavioralTracker.getSessionStats(userId);
    
    // Get beginner mode settings
    const beginnerMode = geniusAdaptive.getBeginnerModeSettings(userId);
    
    // Check for next milestone
    let nextMilestone = null;
    if (beginnerMode.milestone) {
      nextMilestone = beginnerMode.milestone;
    }
    
    res.json({
      success: true,
      userId,
      profile: {
        signals,
        sessionStats,
        beginnerMode,
        nextMilestone,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

