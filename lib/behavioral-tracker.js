/**
 * 📊 BEHAVIORAL TRACKER
 * Tracks all user interactions to power the adaptive learning engine
 * Every click, every pause, every completion tells us something about the user
 */

class BehavioralTracker {
  constructor() {
    this.sessions = new Map(); // userId -> session data
    this.clickTimestamps = new Map(); // userId -> array of click times
    this.contentInteractions = new Map(); // userId -> array of interactions
  }

  /**
   * 🖱️ TRACK WORD CLICK
   * When user clicks a word to translate it
   */
  trackWordClick(userId, word, timestamp = Date.now(), context = {}) {
    if (!this.sessions.has(userId)) {
      this._initializeSession(userId);
    }
    
    const session = this.sessions.get(userId);
    
    // Calculate time since last click (click speed)
    const lastClick = session.lastClickTime || timestamp;
    const timeSinceLastClick = timestamp - lastClick;
    
    session.wordClicks.push({
      word,
      timestamp,
      timeSinceLastClick,
      context
    });
    
    session.lastClickTime = timestamp;
    
    // Update click speed average
    if (session.clickSpeeds.length >= 10) {
      session.clickSpeeds.shift(); // Keep only last 10
    }
    session.clickSpeeds.push(timeSinceLastClick);
    
    return {
      success: true,
      clickSpeed: timeSinceLastClick,
      avgClickSpeed: this.getAverageClickSpeed(userId),
      signal: this._interpretClickSpeed(timeSinceLastClick)
    };
  }

  /**
   * ⏱️ TRACK CLICK SPEED
   * Fast clicks = knows words, slow = struggling
   */
  trackClickSpeed(userId, avgSpeed) {
    if (!this.sessions.has(userId)) {
      this._initializeSession(userId);
    }
    
    const session = this.sessions.get(userId);
    session.clickSpeedAvg = avgSpeed;
    
    return {
      avgSpeed,
      interpretation: this._interpretClickSpeed(avgSpeed)
    };
  }

  /**
   * 📺 TRACK COMPLETION RATE
   * How much of a video/article did the user complete?
   */
  trackCompletionRate(userId, contentId, percentage, duration = null) {
    if (!this.sessions.has(userId)) {
      this._initializeSession(userId);
    }
    
    const session = this.sessions.get(userId);
    
    session.completionRates.push({
      contentId,
      percentage,
      duration,
      timestamp: Date.now()
    });
    
    // Calculate rolling average (last 10 items)
    const recentRates = session.completionRates.slice(-10);
    const avgRate = recentRates.reduce((sum, r) => sum + r.percentage, 0) / recentRates.length;
    session.completionRateAvg = avgRate;
    
    return {
      percentage,
      avgCompletionRate: avgRate,
      signal: this._interpretCompletionRate(percentage),
      recommendation: this._getCompletionRecommendation(percentage)
    };
  }

  /**
   * 🔘 TRACK BUTTON CLICK (Too Hard / Too Easy)
   * Direct user feedback is gold!
   */
  trackButtonClick(userId, buttonType, contentId = null) {
    if (!this.sessions.has(userId)) {
      this._initializeSession(userId);
    }
    
    const session = this.sessions.get(userId);
    
    session.buttonClicks.push({
      type: buttonType,
      contentId,
      timestamp: Date.now()
    });
    
    // Update counters
    if (buttonType === 'too_hard') {
      session.tooHardCount++;
    } else if (buttonType === 'too_easy') {
      session.tooEasyCount++;
    }
    
    return {
      buttonType,
      tooHardCount: session.tooHardCount,
      tooEasyCount: session.tooEasyCount,
      urgentAdjustment: this._shouldMakeUrgentAdjustment(session)
    };
  }

  /**
   * ⏳ TRACK TIME SPENT ON TRANSLATION
   * How long did user look at a translation?
   */
  trackTranslationTime(userId, word, timeSpent) {
    if (!this.sessions.has(userId)) {
      this._initializeSession(userId);
    }
    
    const session = this.sessions.get(userId);
    
    session.translationTimes.push({
      word,
      timeSpent,
      timestamp: Date.now()
    });
    
    return {
      timeSpent,
      signal: this._interpretTranslationTime(timeSpent)
    };
  }

  /**
   * 💾 TRACK WORD SAVE PATTERNS
   * What kind of words is the user saving?
   */
  trackWordSave(userId, word, wordRank = null, level = null) {
    if (!this.sessions.has(userId)) {
      this._initializeSession(userId);
    }
    
    const session = this.sessions.get(userId);
    
    session.savedWords.push({
      word,
      wordRank,
      level,
      timestamp: Date.now()
    });
    
    // Analyze saved word complexity
    const recentSaves = session.savedWords.slice(-20);
    const avgRank = recentSaves
      .filter(w => w.wordRank)
      .reduce((sum, w) => sum + w.wordRank, 0) / recentSaves.length;
    
    return {
      word,
      totalSavedWords: session.savedWords.length,
      avgWordRank: avgRank,
      userLevel: this._estimateLevelFromSavedWords(recentSaves)
    };
  }

  /**
   * 🎯 TRACK QUIZ PERFORMANCE
   * Direct measure of comprehension
   */
  trackQuizPerformance(userId, quizId, score, totalQuestions) {
    if (!this.sessions.has(userId)) {
      this._initializeSession(userId);
    }
    
    const session = this.sessions.get(userId);
    
    const percentage = (score / totalQuestions) * 100;
    
    session.quizScores.push({
      quizId,
      score,
      totalQuestions,
      percentage,
      timestamp: Date.now()
    });
    
    // Calculate rolling average
    const recentScores = session.quizScores.slice(-10);
    const avgScore = recentScores.reduce((sum, q) => sum + q.percentage, 0) / recentScores.length;
    
    return {
      score,
      percentage,
      avgScore,
      signal: this._interpretQuizScore(percentage),
      shouldAdjustLevel: this._shouldAdjustLevelFromQuiz(avgScore)
    };
  }

  /**
   * 📹 TRACK VIDEO INTERACTION
   * Pauses, rewinds, speed changes
   */
  trackVideoInteraction(userId, contentId, interactionType, timestamp = Date.now()) {
    if (!this.sessions.has(userId)) {
      this._initializeSession(userId);
    }
    
    const session = this.sessions.get(userId);
    
    session.videoInteractions.push({
      contentId,
      type: interactionType, // 'pause', 'rewind', 'speed_up', 'speed_down', 'skip'
      timestamp
    });
    
    return {
      interactionType,
      signal: this._interpretVideoInteraction(interactionType)
    };
  }

  /**
   * 🎯 TRACK MICRO-INTERACTIONS (TikTok-style)
   * Detailed tracking: pause points, replays, subtitle clicks, watch speed
   */
  trackMicroInteractions(userId, videoId, interactions) {
    if (!this.sessions.has(userId)) {
      this._initializeSession(userId);
    }
    
    const session = this.sessions.get(userId);
    
    const microData = {
      videoId,
      pausePoints: interactions.pausePoints || [], // [3.2s, 8.7s]
      replaySegments: interactions.replaySegments || [], // [[2s, 5s]]
      subtitleClicks: interactions.subtitleClicks || [], // [word1, word2]
      watchSpeed: interactions.watchSpeed || 1.0,
      faceProximity: interactions.faceProximity || null, // 'close' | 'far'
      timestamp: Date.now()
    };
    
    if (!session.microInteractions) {
      session.microInteractions = [];
    }
    
    session.microInteractions.push(microData);
    
    // Keep only last 50 micro-interactions
    if (session.microInteractions.length > 50) {
      session.microInteractions = session.microInteractions.slice(-50);
    }
    
    return {
      tracked: true,
      pauseCount: microData.pausePoints.length,
      replayCount: microData.replaySegments.length,
      subtitleClickCount: microData.subtitleClicks.length,
      engagement: this._calculateMicroEngagement(microData)
    };
  }

  /**
   * 🔥 CALCULATE ADDICTION SCORE (0-100)
   * TikTok-style metric: How hooked is this user?
   */
  calculateAddictionScore(userId, analytics = {}) {
    const session = this.sessions.get(userId);
    
    if (!session) {
      return {
        score: 0,
        category: 'new_user',
        confidence: 'low'
      };
    }
    
    const {
      avgSessionTime = session.lastActivity - session.startTime / 60000, // minutes
      dailyReturnRate = 0.5, // Default assumption
      avgWatchCompletion = session.completionRateAvg / 100 || 0.5,
      wordSavesPerVideo = session.savedWords.length / Math.max(session.completionRates.length, 1)
    } = analytics;
    
    // Addiction formula (0-100)
    const score = 
      (avgSessionTime * 2) +
      (dailyReturnRate * 100 * 3) +
      (avgWatchCompletion * 100 * 1.5) +
      (wordSavesPerVideo * 10);
    
    const normalized = Math.min(100, Math.max(0, Math.round(score)));
    
    let category;
    if (normalized >= 80) category = 'highly_engaged'; // Addicted!
    else if (normalized >= 60) category = 'engaged';
    else if (normalized >= 40) category = 'moderate';
    else if (normalized >= 20) category = 'casual';
    else category = 'at_risk';
    
    return {
      score: normalized,
      category,
      metrics: {
        avgSessionTime,
        dailyReturnRate,
        avgWatchCompletion,
        wordSavesPerVideo
      },
      confidence: session.completionRates.length >= 10 ? 'high' : 'medium'
    };
  }

  /**
   * ⏱️ TRACK WATCH TIME INTERVAL
   * Track every 1-second interval (not just completion)
   */
  trackWatchTimeInterval(userId, contentId, currentTime, totalDuration) {
    if (!this.sessions.has(userId)) {
      this._initializeSession(userId);
    }
    
    const session = this.sessions.get(userId);
    
    if (!session.watchTimeIntervals) {
      session.watchTimeIntervals = {};
    }
    
    if (!session.watchTimeIntervals[contentId]) {
      session.watchTimeIntervals[contentId] = {
        intervals: [],
        totalWatched: 0,
        duration: totalDuration,
        firstThreeSeconds: false // Hook detection
      };
    }
    
    const watchData = session.watchTimeIntervals[contentId];
    watchData.intervals.push(currentTime);
    watchData.totalWatched = currentTime;
    
    // Hook detection: Did they watch first 3 seconds?
    if (currentTime >= 3 && !watchData.firstThreeSeconds) {
      watchData.firstThreeSeconds = true;
      return {
        hooked: true,
        signal: 'user_hooked', // Boost similar content
        message: 'User watched past 3s - they\'re hooked!'
      };
    }
    
    return {
      currentTime,
      totalWatched: watchData.totalWatched,
      completionRate: (currentTime / totalDuration) * 100
    };
  }

  /**
   * 🔄 DETECT REWATCH
   * If user scrolls back to previous video = high engagement signal
   */
  detectRewatch(userId, contentId) {
    if (!this.sessions.has(userId)) {
      return { isRewatch: false };
    }
    
    const session = this.sessions.get(userId);
    
    if (!session.rewatchTracking) {
      session.rewatchTracking = {};
    }
    
    if (session.rewatchTracking[contentId]) {
      session.rewatchTracking[contentId].count++;
      return {
        isRewatch: true,
        rewatchCount: session.rewatchTracking[contentId].count,
        engagementBoost: 5, // +5x engagement score for rewatched content
        signal: 'boost_similar_content'
      };
    }
    
    session.rewatchTracking[contentId] = {
      count: 1,
      firstSeenAt: Date.now()
    };
    
    return { isRewatch: false, firstView: true };
  }

  /**
   * ⚡ DETECT SKIP PATTERN
   * Skip within 2s = suppress similar content
   */
  detectSkipPattern(userId, contentId, watchTime, totalDuration) {
    if (!this.sessions.has(userId)) {
      this._initializeSession(userId);
    }
    
    const session = this.sessions.get(userId);
    
    if (!session.skipPatterns) {
      session.skipPatterns = [];
    }
    
    const isQuickSkip = watchTime < 2;
    
    if (isQuickSkip) {
      session.skipPatterns.push({
        contentId,
        watchTime,
        totalDuration,
        timestamp: Date.now()
      });
      
      // Keep only last 50 skips
      if (session.skipPatterns.length > 50) {
        session.skipPatterns.shift();
      }
      
      return {
        isSkip: true,
        signal: 'suppress_similar_content',
        watchTime,
        message: 'User skipped within 2s - they dislike this content'
      };
    }
    
    return { isSkip: false };
  }

  /**
   * 📊 CALCULATE USER SIGNALS
   * Aggregate all behavioral data into actionable signals
   */
  calculateUserSignals(userId) {
    const session = this.sessions.get(userId);
    
    if (!session) {
      return {
        hasData: false,
        message: 'No behavioral data yet'
      };
    }
    
    const signals = {
      // Click speed signal
      clickSpeed: {
        avg: session.clickSpeedAvg,
        interpretation: this._interpretClickSpeed(session.clickSpeedAvg),
        confidence: session.clickSpeeds.length >= 10 ? 'high' : 'medium'
      },
      
      // Completion rate signal
      completionRate: {
        avg: session.completionRateAvg,
        interpretation: this._interpretCompletionRate(session.completionRateAvg),
        confidence: session.completionRates.length >= 5 ? 'high' : 'medium'
      },
      
      // Quiz performance signal
      quizPerformance: {
        avg: this._calculateAvgQuizScore(session.quizScores),
        interpretation: this._interpretQuizScore(this._calculateAvgQuizScore(session.quizScores)),
        confidence: session.quizScores.length >= 3 ? 'high' : 'low'
      },
      
      // Direct feedback signal
      userFeedback: {
        tooHardCount: session.tooHardCount,
        tooEasyCount: session.tooEasyCount,
        balance: session.tooEasyCount - session.tooHardCount,
        interpretation: this._interpretFeedbackBalance(session)
      },
      
      // Saved words pattern
      savedWordsPattern: {
        totalSaved: session.savedWords.length,
        avgWordRank: this._calculateAvgWordRank(session.savedWords),
        interpretation: this._interpretSavedWordsPattern(session.savedWords)
      },
      
      // Overall recommendation
      recommendation: this._generateOverallRecommendation(session),
      
      // Confidence score (how much data do we have?)
      confidenceScore: this._calculateOverallConfidence(session)
    };
    
    return signals;
  }

  /**
   * 📈 GET SESSION STATS
   */
  getSessionStats(userId) {
    const session = this.sessions.get(userId);
    
    if (!session) {
      return null;
    }
    
    return {
      totalWordClicks: session.wordClicks.length,
      totalContentViewed: session.completionRates.length,
      totalQuizzesTaken: session.quizScores.length,
      totalWordsSaved: session.savedWords.length,
      avgClickSpeed: session.clickSpeedAvg,
      avgCompletionRate: session.completionRateAvg,
      tooHardClicks: session.tooHardCount,
      tooEasyClicks: session.tooEasyCount,
      sessionStart: session.startTime,
      lastActivity: session.lastActivity
    };
  }

  /**
   * 🔄 GET AVERAGE CLICK SPEED
   */
  getAverageClickSpeed(userId) {
    const session = this.sessions.get(userId);
    if (!session || session.clickSpeeds.length === 0) return null;
    
    return session.clickSpeeds.reduce((sum, speed) => sum + speed, 0) / session.clickSpeeds.length;
  }

  // ==================== PRIVATE HELPER METHODS ====================

  _initializeSession(userId) {
    this.sessions.set(userId, {
      userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      wordClicks: [],
      clickSpeeds: [],
      clickSpeedAvg: null,
      completionRates: [],
      completionRateAvg: null,
      buttonClicks: [],
      tooHardCount: 0,
      tooEasyCount: 0,
      translationTimes: [],
      savedWords: [],
      quizScores: [],
      videoInteractions: [],
      lastClickTime: null
    });
  }

  _interpretClickSpeed(speed) {
    if (speed < 2000) return 'fast_learner'; // Knows words well
    if (speed < 5000) return 'comfortable'; // Normal pace
    if (speed < 10000) return 'struggling'; // Taking time
    return 'overwhelmed'; // Very slow
  }

  _interpretCompletionRate(percentage) {
    if (percentage > 90) return 'too_easy'; // Completed everything
    if (percentage > 70) return 'perfect'; // Good completion
    if (percentage > 30) return 'acceptable'; // Some completion
    return 'too_hard'; // Gave up early
  }

  _interpretTranslationTime(timeSpent) {
    if (timeSpent < 1000) return 'quick_glance'; // Already knew it
    if (timeSpent < 3000) return 'learning'; // Normal learning
    if (timeSpent < 7000) return 'studying'; // Deep study
    return 'memorizing'; // Really focusing
  }

  _interpretQuizScore(percentage) {
    if (percentage > 80) return 'mastery'; // Increase level
    if (percentage > 60) return 'good'; // Keep level
    if (percentage > 40) return 'struggling'; // Consider decrease
    return 'too_hard'; // Decrease level
  }

  _interpretVideoInteraction(type) {
    const signals = {
      'pause': 'needs_time', // Pausing to understand
      'rewind': 'missed_something', // Replaying
      'speed_up': 'too_easy', // Content too slow
      'speed_down': 'too_fast', // Content too fast
      'skip': 'not_interested' // Skipping
    };
    
    return signals[type] || 'unknown';
  }

  _interpretFeedbackBalance(session) {
    const balance = session.tooEasyCount - session.tooHardCount;
    
    if (balance > 3) return 'increase_difficulty';
    if (balance < -3) return 'decrease_difficulty';
    return 'perfect_balance';
  }

  _interpretSavedWordsPattern(savedWords) {
    if (savedWords.length < 5) return 'just_starting';
    
    const recentWords = savedWords.slice(-20);
    const avgRank = this._calculateAvgWordRank(recentWords);
    
    if (avgRank < 500) return 'beginner_words';
    if (avgRank < 1500) return 'intermediate_words';
    if (avgRank < 3000) return 'advanced_words';
    return 'expert_words';
  }

  _calculateAvgQuizScore(quizScores) {
    if (quizScores.length === 0) return null;
    
    const recent = quizScores.slice(-10);
    return recent.reduce((sum, q) => sum + q.percentage, 0) / recent.length;
  }

  _calculateAvgWordRank(savedWords) {
    const wordsWithRank = savedWords.filter(w => w.wordRank);
    if (wordsWithRank.length === 0) return null;
    
    return wordsWithRank.reduce((sum, w) => sum + w.wordRank, 0) / wordsWithRank.length;
  }

  _estimateLevelFromSavedWords(savedWords) {
    const avgRank = this._calculateAvgWordRank(savedWords);
    
    if (!avgRank) return 'unknown';
    if (avgRank < 500) return 'A1';
    if (avgRank < 1500) return 'A2';
    if (avgRank < 3000) return 'B1';
    if (avgRank < 5000) return 'B2';
    return 'C1';
  }

  _shouldMakeUrgentAdjustment(session) {
    // If user clicks "too hard" 3 times in a row, urgent adjustment needed
    const recentClicks = session.buttonClicks.slice(-3);
    const allTooHard = recentClicks.every(c => c.type === 'too_hard');
    const allTooEasy = recentClicks.every(c => c.type === 'too_easy');
    
    return allTooHard || allTooEasy;
  }

  _shouldAdjustLevelFromQuiz(avgScore) {
    if (avgScore > 85) return { adjust: true, direction: 'up', reason: 'Quiz mastery' };
    if (avgScore < 45) return { adjust: true, direction: 'down', reason: 'Quiz difficulty' };
    return { adjust: false, direction: null, reason: 'Good balance' };
  }

  _getCompletionRecommendation(percentage) {
    if (percentage > 90) return 'Consider harder content';
    if (percentage > 70) return 'Perfect! Keep this difficulty';
    if (percentage > 30) return 'Content is challenging but manageable';
    return 'Consider easier content';
  }

  _generateOverallRecommendation(session) {
    const signals = [];
    
    // Check click speed
    if (session.clickSpeedAvg < 2000) {
      signals.push({ signal: 'increase', weight: 2, reason: 'Fast click speed' });
    } else if (session.clickSpeedAvg > 7000) {
      signals.push({ signal: 'decrease', weight: 3, reason: 'Slow click speed' });
    }
    
    // Check completion rate
    if (session.completionRateAvg > 90) {
      signals.push({ signal: 'increase', weight: 2, reason: 'High completion rate' });
    } else if (session.completionRateAvg < 30) {
      signals.push({ signal: 'decrease', weight: 3, reason: 'Low completion rate' });
    }
    
    // Check quiz scores
    const avgQuiz = this._calculateAvgQuizScore(session.quizScores);
    if (avgQuiz > 80) {
      signals.push({ signal: 'increase', weight: 3, reason: 'High quiz scores' });
    } else if (avgQuiz < 50) {
      signals.push({ signal: 'decrease', weight: 3, reason: 'Low quiz scores' });
    }
    
    // Check user feedback
    if (session.tooEasyCount > session.tooHardCount + 2) {
      signals.push({ signal: 'increase', weight: 4, reason: 'User says too easy' });
    } else if (session.tooHardCount > session.tooEasyCount + 2) {
      signals.push({ signal: 'decrease', weight: 4, reason: 'User says too hard' });
    }
    
    // Calculate weighted recommendation
    let increaseScore = signals.filter(s => s.signal === 'increase').reduce((sum, s) => sum + s.weight, 0);
    let decreaseScore = signals.filter(s => s.signal === 'decrease').reduce((sum, s) => sum + s.weight, 0);
    
    if (increaseScore > decreaseScore + 2) {
      return {
        action: 'increase_level',
        confidence: 'high',
        reasons: signals.filter(s => s.signal === 'increase').map(s => s.reason)
      };
    } else if (decreaseScore > increaseScore + 2) {
      return {
        action: 'decrease_level',
        confidence: 'high',
        reasons: signals.filter(s => s.signal === 'decrease').map(s => s.reason)
      };
    } else {
      return {
        action: 'maintain_level',
        confidence: 'medium',
        reasons: ['Performance indicators are balanced']
      };
    }
  }

  _calculateOverallConfidence(session) {
    let dataPoints = 0;
    
    dataPoints += Math.min(session.wordClicks.length / 10, 10); // Max 10 points
    dataPoints += Math.min(session.completionRates.length / 5, 10); // Max 10 points
    dataPoints += Math.min(session.quizScores.length / 3, 10); // Max 10 points
    dataPoints += Math.min(session.savedWords.length / 20, 10); // Max 10 points
    dataPoints += Math.min((session.tooHardCount + session.tooEasyCount) / 2, 10); // Max 10 points
    
    const percentage = (dataPoints / 50) * 100;
    
    if (percentage > 70) return 'very_high';
    if (percentage > 50) return 'high';
    if (percentage > 30) return 'medium';
    return 'low';
  }

  _calculateMicroEngagement(microData) {
    let score = 50; // Base score
    
    // Pauses indicate interest
    score += Math.min(microData.pausePoints.length * 5, 20);
    
    // Replays indicate confusion or high interest
    score += Math.min(microData.replaySegments.length * 10, 30);
    
    // Subtitle clicks show active learning
    score += Math.min(microData.subtitleClicks.length * 3, 20);
    
    // Watch speed adjustments
    if (microData.watchSpeed > 1.0) {
      score -= 10; // Too easy
    } else if (microData.watchSpeed < 1.0) {
      score += 5; // Needs more time = engaged
    }
    
    return Math.min(100, Math.max(0, score));
  }
}

module.exports = new BehavioralTracker();

