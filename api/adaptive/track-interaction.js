/**
 * POST /api/adaptive/track-interaction
 * Track user interaction for behavioral analysis
 */

const behavioralTracker = require('../../lib/behavioral-tracker');
const geniusAdaptive = require('../../lib/genius-adaptive-system');

module.exports = async (req, res) => {
  try {
    const { 
      userId, 
      interactionType, 
      data 
    } = req.body;
    
    if (!userId || !interactionType) {
      return res.status(400).json({
        success: false,
        error: 'userId and interactionType are required'
      });
    }
    
    let trackingResult;
    let checkMilestone = null;
    
    // Track different types of interactions
    switch (interactionType) {
      case 'word_click':
        trackingResult = behavioralTracker.trackWordClick(
          userId, 
          data.word, 
          data.timestamp || Date.now(),
          data.context
        );
        break;
        
      case 'completion':
        trackingResult = behavioralTracker.trackCompletionRate(
          userId,
          data.contentId,
          data.percentage,
          data.duration
        );
        break;
        
      case 'button_click':
        trackingResult = behavioralTracker.trackButtonClick(
          userId,
          data.buttonType,
          data.contentId
        );
        
        // Immediately adjust level if user clicks "too hard" or "too easy"
        if (data.buttonType === 'too_hard' || data.buttonType === 'too_easy') {
          const adjustment = geniusAdaptive.adjustDifficultyInRealTime(userId, {
            type: data.buttonType,
            contentId: data.contentId,
            timestamp: Date.now()
          });
          
          trackingResult.adjustment = adjustment;
        }
        break;
        
      case 'quiz':
        trackingResult = behavioralTracker.trackQuizPerformance(
          userId,
          data.quizId,
          data.score,
          data.totalQuestions
        );
        break;
        
      case 'word_save':
        trackingResult = behavioralTracker.trackWordSave(
          userId,
          data.word,
          data.wordRank,
          data.level
        );
        
        // Check for milestone
        if (data.newWordCount) {
          checkMilestone = geniusAdaptive.checkMilestone(userId, data.newWordCount);
        }
        break;
        
      case 'translation_time':
        trackingResult = behavioralTracker.trackTranslationTime(
          userId,
          data.word,
          data.timeSpent
        );
        break;
        
      case 'video_interaction':
        trackingResult = behavioralTracker.trackVideoInteraction(
          userId,
          data.contentId,
          data.interactionType,
          data.timestamp
        );
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown interaction type: ${interactionType}`
        });
    }
    
    // Get current user signals
    const userSignals = behavioralTracker.calculateUserSignals(userId);
    
    res.json({
      success: true,
      tracked: true,
      interactionType,
      result: trackingResult,
      signals: userSignals,
      milestone: checkMilestone,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

