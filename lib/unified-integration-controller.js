/**
 * 🎯 UNIFIED INTEGRATION CONTROLLER
 * Orchestrates all systems into seamless user experience
 * - Genius Adaptive System
 * - Behavioral Tracker
 * - Content Difficulty Analyzer
 * - Swipe Placement Test
 * - Beginner Mode
 */

const geniusAdaptive = require('./genius-adaptive-system');
const behavioralTracker = require('./behavioral-tracker');
const contentAnalyzer = require('./content-difficulty-analyzer');

class UnifiedIntegrationController {
  constructor() {
    this.userJourneys = new Map(); // Track complete user journeys
    this.feedCache = new Map(); // Cache personalized feeds
    this.realtimeCallbacks = new Map(); // WebSocket callbacks
  }

  /**
   * 🚀 STEP 1: FIRST VISIT
   * User opens app for first time
   */
  async handleFirstVisit(userId) {
    console.log(`[Integration] First visit for user ${userId}`);
    
    // Initialize user journey
    const journey = {
      userId,
      stage: 'first_visit',
      startTime: Date.now(),
      completedSteps: [],
      currentLevel: null,
      knownWords: []
    };
    
    this.userJourneys.set(userId, journey);
    
    return {
      success: true,
      journey,
      nextStep: 'placement_test',
      redirectTo: '/components/swipe-placement-test.html',
      message: 'Welcome! Let\'s find your perfect level.'
    };
  }

  /**
   * 🎯 STEP 2: PLACEMENT TEST COMPLETE
   * User finished swipe test (30 seconds)
   */
  async handlePlacementTestComplete(userId, testResults) {
    console.log(`[Integration] Placement test complete for user ${userId}`);
    
    const journey = this.userJourneys.get(userId);
    if (!journey) {
      throw new Error('No journey found for user');
    }
    
    // Calculate initial level
    const quickTestResults = {
      ultraHighFreq: testResults.knownWords.filter(w => w.rank <= 20).length,
      midFreq: testResults.knownWords.filter(w => w.rank > 20 && w.rank <= 500).length,
      knowsBasics: testResults.accuracy > 0.6
    };
    
    const assessment = await geniusAdaptive.assessInitialLevel(userId, quickTestResults);
    
    // Update journey
    journey.stage = 'placement_complete';
    journey.currentLevel = assessment.level;
    journey.estimatedWordCount = assessment.estimatedWordCount;
    journey.completedSteps.push('placement_test');
    
    // Get personalized first feed
    const firstFeed = await this.getPersonalizedFeed(userId);
    
    return {
      success: true,
      assessment,
      journey,
      firstFeed,
      nextStep: 'first_session',
      redirectTo: '/tiktok-video-feed.html',
      message: `Great! You're at ${assessment.level} level. Let's start learning!`
    };
  }

  /**
   * 🎓 HANDLE BEGINNER SKIP
   * User clicks "I'm a beginner" button
   */
  async handleBeginnerSkip(userId) {
    console.log(`[Integration] User ${userId} skipped test - beginner mode`);
    
    const journey = {
      userId,
      stage: 'beginner_mode',
      startTime: Date.now(),
      completedSteps: ['skipped_test'],
      currentLevel: 'A1',
      knownWords: []
    };
    
    this.userJourneys.set(userId, journey);
    
    // Initialize as A1 beginner
    await geniusAdaptive.assessInitialLevel(userId, {
      ultraHighFreq: 0,
      midFreq: 0,
      knowsBasics: false
    });
    
    // Get beginner-friendly feed
    const beginnerFeed = await this.getPersonalizedFeed(userId);
    
    return {
      success: true,
      journey,
      beginnerMode: true,
      firstFeed: beginnerFeed,
      nextStep: 'first_session',
      redirectTo: '/tiktok-video-feed.html',
      message: 'Perfect! We\'ll start with the basics.'
    };
  }

  /**
   * 📺 STEP 3: USER ACTION (Every interaction)
   * This is called on EVERY user action to adjust in real-time
   */
  async handleUserAction(userId, action) {
    // Track the action
    let trackingResult;
    
    switch (action.type) {
      case 'video_watch':
        trackingResult = behavioralTracker.trackCompletionRate(
          userId,
          action.contentId,
          action.percentage,
          action.duration
        );
        break;
        
      case 'word_click':
        trackingResult = behavioralTracker.trackWordClick(
          userId,
          action.word,
          action.timestamp,
          action.context
        );
        break;
        
      case 'too_hard':
      case 'too_easy':
        trackingResult = behavioralTracker.trackButtonClick(
          userId,
          action.type,
          action.contentId
        );
        
        // Immediately adjust level
        const adjustment = geniusAdaptive.adjustDifficultyInRealTime(userId, {
          type: action.type,
          contentId: action.contentId
        });
        
        trackingResult.adjustment = adjustment;
        
        // Clear feed cache to force refresh
        this.feedCache.delete(userId);
        break;
        
      case 'word_save':
        trackingResult = behavioralTracker.trackWordSave(
          userId,
          action.word,
          action.wordRank,
          action.level
        );
        
        // Check for milestone
        const milestone = geniusAdaptive.checkMilestone(userId, action.totalWords);
        if (milestone) {
          trackingResult.milestone = milestone;
        }
        break;
        
      case 'quiz_complete':
        trackingResult = behavioralTracker.trackQuizPerformance(
          userId,
          action.quizId,
          action.score,
          action.totalQuestions
        );
        break;
    }
    
    // Analyze signals
    const signals = behavioralTracker.calculateUserSignals(userId);
    
    // Check if we should adjust level
    const shouldAdjust = this._shouldAdjustLevel(signals);
    
    if (shouldAdjust.adjust) {
      const adjustment = geniusAdaptive.adjustDifficultyInRealTime(userId, {
        type: shouldAdjust.reason,
        value: shouldAdjust.value
      });
      
      // Clear feed cache
      this.feedCache.delete(userId);
      
      trackingResult.autoAdjustment = adjustment;
    }
    
    // Get updated feed if needed
    let updatedFeed = null;
    if (trackingResult.adjustment || trackingResult.autoAdjustment) {
      updatedFeed = await this.getPersonalizedFeed(userId);
    }
    
    return {
      success: true,
      tracked: true,
      result: trackingResult,
      signals,
      adjustment: trackingResult.adjustment || trackingResult.autoAdjustment,
      updatedFeed,
      shouldRefreshFeed: !!updatedFeed
    };
  }

  /**
   * 📚 GET PERSONALIZED FEED
   * The core content personalization algorithm
   */
  async getPersonalizedFeed(userId, options = {}) {
    console.log(`[Integration] Getting personalized feed for user ${userId}`);
    
    // Check cache first (5 minute TTL)
    const cached = this.feedCache.get(userId);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000 && !options.forceRefresh) {
      console.log('[Integration] Returning cached feed');
      return cached.feed;
    }
    
    // Get user profile from genius adaptive system
    const journey = this.userJourneys.get(userId);
    const beginnerSettings = geniusAdaptive.getBeginnerModeSettings(userId);
    const signals = behavioralTracker.calculateUserSignals(userId);
    
    // Get all available content (in production, this would fetch from database)
    const allContent = await this._getAllContent();
    
    // Score each piece of content for this user
    const scoredContent = allContent.map(content => {
      const goldilocksScoring = geniusAdaptive.scoreContentForUser(userId, content);
      
      return {
        ...content,
        goldilocksScore: goldilocksScoring.score,
        goldilocksZone: goldilocksScoring.zone,
        newWords: goldilocksScoring.unknownWords,
        newWordCount: goldilocksScoring.newWordCount,
        difficulty: goldilocksScoring.difficulty
      };
    });
    
    // Sort by goldilocks score (best matches first)
    let sortedContent = scoredContent.sort((a, b) => b.goldilocksScore - a.goldilocksScore);
    
    // Apply beginner mode filters if needed
    if (beginnerSettings.isBeginnerMode) {
      sortedContent = sortedContent.filter(c => 
        c.newWordCount <= beginnerSettings.maxNewWordsPerItem &&
        c.difficulty === 'A1' || c.difficulty === 'A2'
      );
    }
    
    // Apply user preferences (if any)
    if (options.topics) {
      sortedContent = sortedContent.filter(c => 
        options.topics.some(topic => c.topics?.includes(topic))
      );
    }
    
    // Remove already watched (if requested)
    if (options.hideWatched && journey?.watchedContent) {
      sortedContent = sortedContent.filter(c => 
        !journey.watchedContent.includes(c.id)
      );
    }
    
    // Prepare feed structure
    const feed = {
      items: sortedContent.slice(0, 20), // First 20 items
      metadata: {
        userId,
        currentLevel: journey?.currentLevel || 'A1',
        beginnerMode: beginnerSettings.isBeginnerMode,
        signals: signals.recommendation,
        totalAvailable: sortedContent.length,
        averageGoldilocksScore: this._calculateAverageScore(sortedContent.slice(0, 20))
      }
    };
    
    // Cache the feed
    this.feedCache.set(userId, {
      feed,
      timestamp: Date.now()
    });
    
    return feed;
  }

  /**
   * 🔄 REFRESH FEED IN REAL-TIME
   * Called after level adjustments
   */
  async refreshFeedRealTime(userId) {
    console.log(`[Integration] Refreshing feed in real-time for user ${userId}`);
    
    // Force refresh (bypass cache)
    const newFeed = await this.getPersonalizedFeed(userId, { forceRefresh: true });
    
    // Trigger real-time update if WebSocket connected
    if (this.realtimeCallbacks.has(userId)) {
      const callback = this.realtimeCallbacks.get(userId);
      callback({
        type: 'feed_update',
        feed: newFeed,
        timestamp: Date.now()
      });
    }
    
    return newFeed;
  }

  /**
   * 📊 GET COMPLETE USER PROFILE
   * Everything about the user in one call
   */
  async getUserProfile(userId) {
    const journey = this.userJourneys.get(userId);
    const signals = behavioralTracker.calculateUserSignals(userId);
    const sessionStats = behavioralTracker.getSessionStats(userId);
    const beginnerSettings = geniusAdaptive.getBeginnerModeSettings(userId);
    
    return {
      success: true,
      userId,
      journey,
      signals,
      sessionStats,
      beginnerSettings,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 🎮 TRACK COMPLETE SESSION
   * Track entire user session from start to end
   */
  async trackSession(userId, sessionData) {
    const journey = this.userJourneys.get(userId);
    
    if (!journey) {
      return { success: false, error: 'No journey found' };
    }
    
    // Update journey with session data
    journey.sessions = journey.sessions || [];
    journey.sessions.push({
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      duration: sessionData.endTime - sessionData.startTime,
      videosWatched: sessionData.videosWatched || 0,
      wordsClicked: sessionData.wordsClicked || 0,
      wordsSaved: sessionData.wordsSaved || 0,
      quizzesTaken: sessionData.quizzesTaken || 0
    });
    
    return {
      success: true,
      journey,
      sessionNumber: journey.sessions.length,
      totalSessions: journey.sessions.length
    };
  }

  /**
   * 🎯 CHECK PROGRESSION
   * Has user progressed enough to level up?
   */
  async checkProgression(userId) {
    const signals = behavioralTracker.calculateUserSignals(userId);
    const journey = this.userJourneys.get(userId);
    
    if (!journey) {
      return { shouldProgress: false };
    }
    
    // Check if user is consistently performing well
    const shouldProgress = 
      signals.quizPerformance.avg > 80 &&
      signals.completionRate.avg > 85 &&
      signals.clickSpeed.interpretation === 'fast_learner';
    
    if (shouldProgress) {
      // Suggest retest
      return {
        shouldProgress: true,
        recommendation: 'retest',
        message: 'You\'re doing great! Ready to test your progress?',
        currentLevel: journey.currentLevel,
        estimatedNewLevel: this._estimateNextLevel(journey.currentLevel)
      };
    }
    
    return { shouldProgress: false };
  }

  /**
   * 🌟 MILESTONE CELEBRATIONS
   * Check and celebrate user milestones
   */
  async checkAndCelebrateMilestone(userId, wordCount) {
    const milestone = geniusAdaptive.checkMilestone(userId, wordCount);
    
    if (milestone) {
      // Log milestone achievement
      console.log(`[Integration] Milestone reached: ${milestone.milestone} words for user ${userId}`);
      
      // Update journey
      const journey = this.userJourneys.get(userId);
      if (journey) {
        journey.milestones = journey.milestones || [];
        journey.milestones.push({
          milestone: milestone.milestone,
          timestamp: Date.now(),
          message: milestone.message
        });
      }
    }
    
    return milestone;
  }

  /**
   * 📱 REGISTER REAL-TIME CALLBACK
   * For WebSocket updates
   */
  registerRealtimeCallback(userId, callback) {
    this.realtimeCallbacks.set(userId, callback);
    console.log(`[Integration] Real-time callback registered for user ${userId}`);
  }

  /**
   * 🔌 UNREGISTER REAL-TIME CALLBACK
   */
  unregisterRealtimeCallback(userId) {
    this.realtimeCallbacks.delete(userId);
    console.log(`[Integration] Real-time callback removed for user ${userId}`);
  }

  // ==================== PRIVATE HELPER METHODS ====================

  _shouldAdjustLevel(signals) {
    if (!signals.hasData) {
      return { adjust: false };
    }
    
    // Check if recommendation is to adjust
    if (signals.recommendation.action === 'increase_level') {
      return {
        adjust: true,
        reason: 'performance_high',
        value: signals.recommendation.confidence,
        direction: 'up'
      };
    }
    
    if (signals.recommendation.action === 'decrease_level') {
      return {
        adjust: true,
        reason: 'performance_low',
        value: signals.recommendation.confidence,
        direction: 'down'
      };
    }
    
    return { adjust: false };
  }

  async _getAllContent() {
    // In production, this would query the database
    // For now, return mock data structure
    return [
      {
        id: 'video_001',
        type: 'video',
        title: 'Spanish Basics',
        transcription: 'Hola me llamo María y vivo en España',
        topics: ['introduction', 'basics'],
        duration: 120
      },
      {
        id: 'video_002',
        type: 'video',
        title: 'Ordering Food',
        transcription: 'Quiero una pizza con queso por favor',
        topics: ['food', 'restaurant'],
        duration: 90
      }
      // More content would be loaded from database
    ];
  }

  _calculateAverageScore(items) {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + (item.goldilocksScore || 0), 0);
    return Math.round(sum / items.length);
  }

  _estimateNextLevel(currentLevel) {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }
}

// Export singleton
module.exports = new UnifiedIntegrationController();

