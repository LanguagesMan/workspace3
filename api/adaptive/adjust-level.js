/**
 * POST /api/adaptive/adjust-level
 * Adjust user level based on behavioral signal
 */

const geniusAdaptive = require('../../lib/genius-adaptive-system');
const behavioralTracker = require('../../lib/behavioral-tracker');

module.exports = async (req, res) => {
  try {
    const { userId, signal, value } = req.body;
    
    if (!userId || !signal) {
      return res.status(400).json({
        success: false,
        error: 'userId and signal are required'
      });
    }
    
    // Adjust difficulty in real-time
    const adjustment = geniusAdaptive.adjustDifficultyInRealTime(userId, {
      type: signal,
      value,
      timestamp: Date.now()
    });
    
    // Get behavioral signals
    const userSignals = behavioralTracker.calculateUserSignals(userId);
    
    // Get recommended content based on new level
    // Note: In production, fetch actual content from database
    const recommendedContent = {
      message: `Content recommendation updated for level ${adjustment.newLevel}`,
      filters: {
        level: adjustment.newLevel,
        maxNewWords: userSignals.recommendation?.action === 'decrease_level' ? 3 : 7
      }
    };
    
    res.json({
      success: true,
      adjustment: {
        oldLevel: adjustment.oldLevel,
        newLevel: adjustment.newLevel,
        changed: adjustment.changed,
        action: adjustment.action,
        message: adjustment.message
      },
      signals: userSignals,
      recommendedContent,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error adjusting level:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

