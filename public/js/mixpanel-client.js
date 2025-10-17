/**
 * 📊 MIXPANEL CLIENT-SIDE ANALYTICS
 *
 * Client-side Mixpanel tracking for user interactions
 * Complements server-side tracking in lib/mixpanel-analytics.js
 *
 * Usage:
 * <script src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js"></script>
 * <script src="/js/mixpanel-client.js"></script>
 * <script>
 *   MixpanelClient.trackVideoStarted('video-123', { title: 'Intro', difficulty: 'A1' });
 * </script>
 */

class MixpanelClient {
  constructor() {
    this.isEnabled = false;
    this.userId = null;
    this.sessionStart = Date.now();
    this.initialize();
  }

  /**
   * Initialize Mixpanel client
   */
  initialize() {
    // Get token from meta tag or environment
    const tokenMeta = document.querySelector('meta[name="mixpanel-token"]');
    const token = tokenMeta ? tokenMeta.content : null;

    if (!token) {
      console.warn('⚠️  Mixpanel not configured (no token found)');
      return;
    }

    try {
      // Initialize Mixpanel
      if (typeof mixpanel !== 'undefined') {
        mixpanel.init(token, {
          track_pageview: false, // We'll track manually
          persistence: 'localStorage',
          ignore_dnt: false, // Respect Do Not Track
          loaded: (mixpanel) => {
            this.isEnabled = true;
            console.log('✅ Mixpanel client initialized');
            this.setupAutoTracking();
          }
        });
      } else {
        console.warn('⚠️  Mixpanel SDK not loaded');
      }
    } catch (error) {
      console.error('❌ Mixpanel initialization error:', error);
    }
  }

  /**
   * Set up automatic tracking
   */
  setupAutoTracking() {
    // Track page view
    this.trackPageView();

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });

    // Track visibility changes (app backgrounded/foregrounded)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('App Backgrounded', {});
      } else {
        this.track('App Foregrounded', {});
      }
    });
  }

  /**
   * Set user identity
   * @param {string} userId - User ID
   */
  identify(userId) {
    if (!this.isEnabled) return;

    this.userId = userId;
    mixpanel.identify(userId);
    console.log(`✅ Mixpanel user identified: ${userId}`);
  }

  /**
   * Set user properties
   * @param {Object} properties - User properties
   */
  setUserProperties(properties) {
    if (!this.isEnabled) return;

    mixpanel.people.set({
      ...properties,
      'Last Active': new Date().toISOString()
    });
  }

  /**
   * Increment user property
   * @param {string} property - Property name
   * @param {number} amount - Amount to increment
   */
  incrementUserProperty(property, amount = 1) {
    if (!this.isEnabled) return;
    mixpanel.people.increment(property, amount);
  }

  /**
   * Track generic event
   * @param {string} eventName - Event name
   * @param {Object} properties - Event properties
   */
  track(eventName, properties = {}) {
    if (!this.isEnabled) return;

    const eventData = {
      ...properties,
      page: window.location.pathname,
      referrer: document.referrer,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    mixpanel.track(eventName, eventData);
    console.log(`✅ Mixpanel event tracked: ${eventName}`, properties);
  }

  // ==================== PAGE & SESSION EVENTS ====================

  /**
   * Track page view
   */
  trackPageView() {
    this.track('Page Viewed', {
      page_title: document.title,
      page_url: window.location.href,
      page_path: window.location.pathname
    });
  }

  /**
   * Track session end
   */
  trackSessionEnd() {
    const sessionDuration = Math.round((Date.now() - this.sessionStart) / 1000);
    this.track('Session Ended', {
      session_duration_seconds: sessionDuration,
      session_duration_minutes: Math.round(sessionDuration / 60)
    });
  }

  // ==================== VIDEO EVENTS ====================

  /**
   * Track video started
   * @param {string} videoId - Video ID
   * @param {Object} properties - Video properties (title, difficulty, duration, etc.)
   */
  trackVideoStarted(videoId, properties = {}) {
    this.track('Video Started', {
      video_id: videoId,
      video_title: properties.title,
      video_difficulty: properties.difficulty,
      video_duration: properties.duration,
      video_category: properties.category,
      video_language: properties.language || 'Spanish',
      ...properties
    });
    this.incrementUserProperty('Total Videos Watched');
  }

  /**
   * Track video completed
   * @param {string} videoId - Video ID
   * @param {Object} properties - Video properties
   */
  trackVideoCompleted(videoId, properties = {}) {
    this.track('Video Completed', {
      video_id: videoId,
      watch_percentage: properties.watchPercentage || 100,
      watch_duration: properties.watchDuration,
      completion_time: properties.completionTime,
      ...properties
    });
  }

  /**
   * Track video progress
   * @param {string} videoId - Video ID
   * @param {number} percentage - Progress percentage
   */
  trackVideoProgress(videoId, percentage) {
    // Only track at 25%, 50%, 75% milestones
    const milestones = [25, 50, 75];
    if (milestones.includes(percentage)) {
      this.track('Video Progress', {
        video_id: videoId,
        progress_percentage: percentage
      });
    }
  }

  /**
   * Track video skipped
   * @param {string} videoId - Video ID
   * @param {number} watchedSeconds - Seconds watched before skipping
   */
  trackVideoSkipped(videoId, watchedSeconds) {
    this.track('Video Skipped', {
      video_id: videoId,
      watched_seconds: watchedSeconds
    });
  }

  // ==================== LEARNING EVENTS ====================

  /**
   * Track word clicked (for translation)
   * @param {string} word - Word clicked
   * @param {Object} properties - Context properties
   */
  trackWordClicked(word, properties = {}) {
    this.track('Word Clicked', {
      word: word,
      translation: properties.translation,
      context: properties.context,
      video_id: properties.videoId,
      article_id: properties.articleId,
      ...properties
    });
  }

  /**
   * Track word saved to vocabulary
   * @param {string} word - Word saved
   * @param {Object} properties - Word properties
   */
  trackWordSaved(word, properties = {}) {
    this.track('Word Saved', {
      word: word,
      translation: properties.translation,
      context: properties.context,
      difficulty: properties.difficulty,
      ...properties
    });
    this.incrementUserProperty('Total Words Learned');
  }

  /**
   * Track word reviewed
   * @param {string} word - Word reviewed
   * @param {boolean} correct - Whether answer was correct
   */
  trackWordReviewed(word, correct) {
    this.track('Word Reviewed', {
      word: word,
      correct: correct,
      review_type: 'flashcard'
    });
  }

  // ==================== GAME EVENTS ====================

  /**
   * Track game started
   * @param {string} gameType - Type of game (word-match, sentence-builder, etc.)
   * @param {Object} properties - Game properties
   */
  trackGameStarted(gameType, properties = {}) {
    this.track('Game Started', {
      game_type: gameType,
      difficulty: properties.difficulty,
      category: properties.category,
      ...properties
    });
  }

  /**
   * Track game completed
   * @param {string} gameType - Type of game
   * @param {number} score - Score achieved
   * @param {Object} properties - Game properties
   */
  trackGameCompleted(gameType, score, properties = {}) {
    this.track('Game Completed', {
      game_type: gameType,
      score: score,
      max_score: properties.maxScore,
      accuracy: properties.accuracy,
      time_taken: properties.timeTaken,
      stars_earned: properties.starsEarned,
      ...properties
    });

    // Track high score milestone
    if (properties.isHighScore) {
      this.track('Game High Score', {
        game_type: gameType,
        score: score
      });
    }
  }

  /**
   * Track quiz started
   * @param {string} quizId - Quiz ID
   * @param {Object} properties - Quiz properties
   */
  trackQuizStarted(quizId, properties = {}) {
    this.track('Quiz Started', {
      quiz_id: quizId,
      quiz_type: properties.quizType,
      difficulty: properties.difficulty,
      question_count: properties.questionCount,
      ...properties
    });
  }

  /**
   * Track quiz completed
   * @param {string} quizId - Quiz ID
   * @param {number} score - Score achieved
   * @param {Object} properties - Quiz properties
   */
  trackQuizCompleted(quizId, score, properties = {}) {
    this.track('Quiz Completed', {
      quiz_id: quizId,
      score: score,
      correct_answers: properties.correctAnswers,
      total_questions: properties.totalQuestions,
      accuracy: properties.accuracy,
      time_taken: properties.timeTaken,
      ...properties
    });
  }

  // ==================== PREMIUM / PAYMENT EVENTS ====================

  /**
   * Track premium upgrade clicked
   * @param {string} location - Where upgrade button was clicked (feed, paywall, settings, etc.)
   */
  trackPremiumUpgradeClicked(location) {
    this.track('Premium Upgrade Clicked', {
      location: location,
      current_plan: 'free'
    });
  }

  /**
   * Track checkout started
   * @param {string} plan - Plan selected (premium_monthly, premium_yearly)
   */
  trackCheckoutStarted(plan) {
    this.track('Checkout Started', {
      plan: plan,
      price: plan === 'premium_yearly' ? 49.99 : 4.99
    });
  }

  /**
   * Track payment method added
   */
  trackPaymentMethodAdded() {
    this.track('Payment Method Added', {});
  }

  // ==================== ENGAGEMENT EVENTS ====================

  /**
   * Track streak milestone
   * @param {number} streakDays - Current streak
   */
  trackStreakMilestone(streakDays) {
    const milestones = [3, 7, 14, 30, 60, 100, 365];
    if (milestones.includes(streakDays)) {
      this.track('Streak Milestone', {
        streak_days: streakDays,
        milestone_type: `${streakDays}_day_streak`
      });
    }
  }

  /**
   * Track achievement unlocked
   * @param {string} achievementId - Achievement ID
   * @param {Object} properties - Achievement properties
   */
  trackAchievementUnlocked(achievementId, properties = {}) {
    this.track('Achievement Unlocked', {
      achievement_id: achievementId,
      achievement_name: properties.name,
      achievement_category: properties.category,
      xp_earned: properties.xpEarned,
      ...properties
    });
  }

  /**
   * Track social share
   * @param {string} contentType - What was shared (progress, achievement, video)
   * @param {string} platform - Where shared (twitter, facebook, copy_link)
   */
  trackSocialShare(contentType, platform) {
    this.track('Content Shared', {
      content_type: contentType,
      platform: platform
    });
  }

  /**
   * Track referral link clicked
   */
  trackReferralLinkClicked() {
    this.track('Referral Link Clicked', {});
  }

  // ==================== CONTENT EVENTS ====================

  /**
   * Track article read
   * @param {string} articleId - Article ID
   * @param {Object} properties - Article properties
   */
  trackArticleRead(articleId, properties = {}) {
    this.track('Article Read', {
      article_id: articleId,
      article_title: properties.title,
      difficulty: properties.difficulty,
      category: properties.category,
      read_duration: properties.readDuration,
      completion_percentage: properties.completionPercentage,
      ...properties
    });
  }

  /**
   * Track podcast listened
   * @param {string} podcastId - Podcast ID
   * @param {Object} properties - Podcast properties
   */
  trackPodcastListened(podcastId, properties = {}) {
    this.track('Podcast Listened', {
      podcast_id: podcastId,
      podcast_title: properties.title,
      duration: properties.duration,
      listened_duration: properties.listenedDuration,
      ...properties
    });
  }

  // ==================== ONBOARDING EVENTS ====================

  /**
   * Track onboarding step completed
   * @param {number} step - Step number
   * @param {string} stepName - Step name
   */
  trackOnboardingStep(step, stepName) {
    this.track('Onboarding Step Completed', {
      step: step,
      step_name: stepName
    });
  }

  /**
   * Track onboarding completed
   */
  trackOnboardingCompleted() {
    this.track('Onboarding Completed', {});
  }

  /**
   * Track level assessment completed
   * @param {string} level - Assessed level (A1, A2, B1, etc.)
   * @param {number} score - Assessment score
   */
  trackLevelAssessmentCompleted(level, score) {
    this.track('Level Assessment Completed', {
      assessed_level: level,
      assessment_score: score
    });
    this.setUserProperties({
      'Spanish Level': level
    });
  }

  // ==================== SETTINGS EVENTS ====================

  /**
   * Track settings changed
   * @param {string} setting - Setting changed
   * @param {*} value - New value
   */
  trackSettingChanged(setting, value) {
    this.track('Setting Changed', {
      setting: setting,
      value: value
    });
  }

  // ==================== ERROR EVENTS ====================

  /**
   * Track client error
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   */
  trackError(error, context = {}) {
    this.track('Client Error', {
      error_message: error.message,
      error_stack: error.stack,
      error_type: error.name,
      component: context.component,
      action: context.action,
      ...context
    });
  }
}

// Create and export singleton instance
const mixpanelClient = new MixpanelClient();

// Export as global for easy access
if (typeof window !== 'undefined') {
  window.MixpanelClient = mixpanelClient;
}

// Also support module exports if using bundler
if (typeof module !== 'undefined' && module.exports) {
  module.exports = mixpanelClient;
}
