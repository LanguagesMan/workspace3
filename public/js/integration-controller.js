/**
 * 🎯 FRONTEND INTEGRATION CONTROLLER
 * Connects all frontend systems to backend integration API
 * Handles complete user journey from first visit to mastery
 */

class FrontendIntegrationController {
  constructor() {
    this.userId = this.getUserId();
    this.currentLevel = null;
    this.feedCache = null;
    this.isInitialized = false;
  }

  /**
   * 🚀 INITIALIZE
   * Call this on app startup
   */
  async initialize() {
    console.log('[Integration] Initializing frontend integration...');
    
    if (this.isInitialized) {
      console.log('[Integration] Already initialized');
      return;
    }
    
    try {
      // Check if this is first visit
      const isFirstVisit = !localStorage.getItem('userJourneyStarted');
      
      if (isFirstVisit) {
        await this.handleFirstVisit();
      } else {
        // Load existing profile
        await this.loadUserProfile();
      }
      
      // Set up tracking for all interactions
      this.setupGlobalTracking();
      
      // Set up real-time updates
      this.setupRealtimeUpdates();
      
      this.isInitialized = true;
      console.log('[Integration] Initialization complete');
      
    } catch (error) {
      console.error('[Integration] Initialization error:', error);
    }
  }

  /**
   * 🌟 FIRST VISIT FLOW
   */
  async handleFirstVisit() {
    console.log('[Integration] First visit detected');
    
    try {
      const response = await fetch('/api/integration/first-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('userJourneyStarted', 'true');
        
        // Redirect to placement test or beginner mode
        if (data.redirectTo) {
          console.log('[Integration] Redirecting to:', data.redirectTo);
          // Don't auto-redirect, let the index.html router handle it
        }
      }
      
    } catch (error) {
      console.error('[Integration] First visit error:', error);
    }
  }

  /**
   * 🎯 PLACEMENT TEST COMPLETE
   */
  async handlePlacementTestComplete(testResults) {
    console.log('[Integration] Placement test complete');
    
    try {
      const response = await fetch('/api/integration/placement-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          testResults
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.currentLevel = data.assessment.level;
        localStorage.setItem('userLevel', this.currentLevel);
        localStorage.setItem('assessmentCompleted', 'true');
        
        // Show celebration
        this.showLevelAssessment(data.assessment);
        
        // Cache initial feed
        this.feedCache = data.firstFeed;
        
        return data;
      }
      
    } catch (error) {
      console.error('[Integration] Placement test error:', error);
    }
  }

  /**
   * 🎓 BEGINNER SKIP
   */
  async handleBeginnerSkip() {
    console.log('[Integration] User skipped to beginner mode');
    
    try {
      const response = await fetch('/api/integration/beginner-skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.currentLevel = 'A1';
        localStorage.setItem('userLevel', 'A1');
        localStorage.setItem('assessmentCompleted', 'skipped');
        
        // Cache beginner feed
        this.feedCache = data.firstFeed;
        
        return data;
      }
      
    } catch (error) {
      console.error('[Integration] Beginner skip error:', error);
    }
  }

  /**
   * 📺 TRACK USER ACTION
   * Call this on EVERY user interaction
   */
  async trackAction(actionType, actionData) {
    try {
      const response = await fetch('/api/integration/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          action: {
            type: actionType,
            ...actionData,
            timestamp: Date.now()
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Check if level was adjusted
        if (data.adjustment && data.adjustment.changed) {
          this.handleLevelChange(data.adjustment);
        }
        
        // Check for milestone
        if (data.result.milestone) {
          this.celebrateMilestone(data.result.milestone);
        }
        
        // Refresh feed if needed
        if (data.shouldRefreshFeed) {
          this.feedCache = data.updatedFeed;
          this.triggerFeedRefresh();
        }
      }
      
      return data;
      
    } catch (error) {
      console.error('[Integration] Track action error:', error);
    }
  }

  /**
   * 📚 GET PERSONALIZED FEED
   */
  async getPersonalizedFeed(options = {}) {
    // Return cache if available and not forcing refresh
    if (this.feedCache && !options.forceRefresh) {
      console.log('[Integration] Returning cached feed');
      return this.feedCache;
    }
    
    try {
      const params = new URLSearchParams(options);
      const response = await fetch(`/api/integration/feed/${this.userId}?${params}`);
      const data = await response.json();
      
      if (data.success) {
        this.feedCache = data.feed;
        return data.feed;
      }
      
    } catch (error) {
      console.error('[Integration] Get feed error:', error);
    }
    
    return null;
  }

  /**
   * 🔄 REFRESH FEED
   */
  async refreshFeed() {
    try {
      const response = await fetch('/api/integration/refresh-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.feedCache = data.feed;
        this.triggerFeedRefresh();
        return data.feed;
      }
      
    } catch (error) {
      console.error('[Integration] Refresh feed error:', error);
    }
  }

  /**
   * 👤 LOAD USER PROFILE
   */
  async loadUserProfile() {
    try {
      const response = await fetch(`/api/integration/profile/${this.userId}`);
      const data = await response.json();
      
      if (data.success) {
        this.currentLevel = data.journey?.currentLevel || 'A1';
        localStorage.setItem('userLevel', this.currentLevel);
        return data;
      }
      
    } catch (error) {
      console.error('[Integration] Load profile error:', error);
    }
  }

  /**
   * 📊 CHECK PROGRESSION
   */
  async checkProgression() {
    try {
      const response = await fetch(`/api/integration/progression/${this.userId}`);
      const data = await response.json();
      
      if (data.success && data.shouldProgress) {
        this.showRetestPrompt(data);
      }
      
      return data;
      
    } catch (error) {
      console.error('[Integration] Check progression error:', error);
    }
  }

  /**
   * 🎮 SETUP GLOBAL TRACKING
   * Automatically track common interactions
   */
  setupGlobalTracking() {
    // Track video watch completion
    window.addEventListener('videoCompleted', (e) => {
      this.trackAction('video_watch', {
        contentId: e.detail.videoId,
        percentage: e.detail.percentage,
        duration: e.detail.duration
      });
    });
    
    // Track word clicks
    window.addEventListener('wordClicked', (e) => {
      this.trackAction('word_click', {
        word: e.detail.word,
        context: e.detail.context
      });
    });
    
    // Track "Too Hard" / "Too Easy" buttons
    window.addEventListener('difficultyFeedback', (e) => {
      this.trackAction(e.detail.type, {
        contentId: e.detail.contentId
      });
    });
    
    // Track word saves
    window.addEventListener('wordSaved', (e) => {
      this.trackAction('word_save', {
        word: e.detail.word,
        wordRank: e.detail.rank,
        level: e.detail.level,
        totalWords: e.detail.totalWords
      });
    });
    
    // Track quiz completion
    window.addEventListener('quizCompleted', (e) => {
      this.trackAction('quiz_complete', {
        quizId: e.detail.quizId,
        score: e.detail.score,
        totalQuestions: e.detail.totalQuestions
      });
    });
  }

  /**
   * ⚡ SETUP REAL-TIME UPDATES
   */
  setupRealtimeUpdates() {
    // Check progression every 5 minutes
    setInterval(() => {
      this.checkProgression();
    }, 5 * 60 * 1000);
  }

  /**
   * 🎉 HANDLE LEVEL CHANGE
   */
  handleLevelChange(adjustment) {
    console.log('[Integration] Level changed:', adjustment);
    
    this.currentLevel = adjustment.newLevel;
    localStorage.setItem('userLevel', adjustment.newLevel);
    
    // Show notification
    this.showNotification({
      type: 'level_change',
      title: adjustment.changed ? 'Level Adjusted!' : 'Level Maintained',
      message: adjustment.message,
      oldLevel: adjustment.oldLevel,
      newLevel: adjustment.newLevel
    });
  }

  /**
   * 🌟 CELEBRATE MILESTONE
   */
  celebrateMilestone(milestone) {
    console.log('[Integration] Milestone reached:', milestone);
    
    // Show celebration modal
    this.showNotification({
      type: 'milestone',
      title: 'Milestone Achieved! 🎉',
      message: milestone.message,
      emoji: milestone.emoji,
      reward: milestone.reward
    });
    
    // Trigger confetti animation
    if (typeof confetti !== 'undefined') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  /**
   * 📢 SHOW LEVEL ASSESSMENT
   */
  showLevelAssessment(assessment) {
    const modal = document.createElement('div');
    modal.className = 'assessment-result-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Your Level: ${assessment.level}</h2>
        <p>${assessment.reasoning}</p>
        <div class="level-badge">
          <span class="level-indicator">${assessment.level}</span>
          <span class="word-count">~${assessment.estimatedWordCount} words</span>
        </div>
        <button onclick="this.closest('.assessment-result-modal').remove()">
          Start Learning!
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * 🔔 SHOW NOTIFICATION
   */
  showNotification(notification) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `notification-toast ${notification.type}`;
    toast.innerHTML = `
      <div class="notification-content">
        <h4>${notification.title}</h4>
        <p>${notification.message}</p>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * 📱 SHOW RETEST PROMPT
   */
  showRetestPrompt(data) {
    const prompt = document.createElement('div');
    prompt.className = 'retest-prompt';
    prompt.innerHTML = `
      <div class="prompt-content">
        <h3>Ready to Level Up? 🚀</h3>
        <p>${data.message}</p>
        <button onclick="window.location.href='/components/swipe-placement-test.html'">
          Take Retest
        </button>
        <button onclick="this.closest('.retest-prompt').remove()">
          Later
        </button>
      </div>
    `;
    
    document.body.appendChild(prompt);
  }

  /**
   * 🔄 TRIGGER FEED REFRESH
   */
  triggerFeedRefresh() {
    window.dispatchEvent(new CustomEvent('feedUpdated', {
      detail: { feed: this.feedCache }
    }));
  }

  /**
   * 🆔 GET USER ID
   */
  getUserId() {
    let userId = localStorage.getItem('userId');
    
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    
    return userId;
  }
}

// Global instance
window.IntegrationController = new FrontendIntegrationController();

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.IntegrationController.initialize();
  });
} else {
  window.IntegrationController.initialize();
}

