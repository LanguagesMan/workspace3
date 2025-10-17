/**
 * Client-side Analytics
 * Tracks user interactions and sends data to backend
 */

class AnalyticsClient {
  constructor() {
    this.apiEndpoint = '/api/analytics';
    this.queue = [];
    this.flushInterval = 10000; // 10 seconds
    this.maxQueueSize = 20;
    
    // Initialize Vercel Analytics if available
    if (window.va) {
      console.log('✅ Vercel Analytics loaded');
    }
    
    // Start auto-flush
    setInterval(() => this.flush(), this.flushInterval);
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
  }

  /**
   * Track page view
   */
  trackPageView(page, metadata = {}) {
    this.track('page_view', {
      page,
      referrer: document.referrer,
      ...metadata,
    });
    
    // Also send to Vercel Analytics
    if (window.va) {
      window.va('pageview', { page });
    }
  }

  /**
   * Track article read
   */
  trackArticleRead(articleId, metadata = {}) {
    this.track('article_read', {
      article_id: articleId,
      language: metadata.language,
      difficulty: metadata.difficulty,
      category: metadata.category,
      read_duration: metadata.readDuration,
      completion_percentage: metadata.completionPercentage,
    });
  }

  /**
   * Track video view
   */
  trackVideoView(videoId, metadata = {}) {
    this.track('video_view', {
      video_id: videoId,
      language: metadata.language,
      category: metadata.category,
      watch_duration: metadata.watchDuration,
      completion_percentage: metadata.completionPercentage,
    });
  }

  /**
   * Track word translation
   */
  trackWordTranslation(word, metadata = {}) {
    this.track('word_translation', {
      word,
      from_language: metadata.fromLanguage,
      to_language: metadata.toLanguage,
      context: metadata.context,
      article_id: metadata.articleId,
    });
  }

  /**
   * Track quiz attempt
   */
  trackQuizAttempt(quizId, metadata = {}) {
    this.track('quiz_attempt', {
      quiz_id: quizId,
      score: metadata.score,
      total_questions: metadata.totalQuestions,
      correct_answers: metadata.correctAnswers,
      time_taken: metadata.timeTaken,
      difficulty: metadata.difficulty,
    });
  }

  /**
   * Track vocabulary save
   */
  trackVocabularySave(word, metadata = {}) {
    this.track('vocabulary_save', {
      word,
      translation: metadata.translation,
      language: metadata.language,
      context: metadata.context,
      article_id: metadata.articleId,
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(action, metadata = {}) {
    this.track('user_interaction', {
      action,
      ...metadata,
    });
  }

  /**
   * Track error
   */
  trackError(error, metadata = {}) {
    this.track('client_error', {
      message: error.message,
      stack: error.stack,
      component: metadata.component,
      action: metadata.action,
    });
  }

  /**
   * Generic track method
   */
  track(eventType, data = {}) {
    const event = {
      event_type: eventType,
      event_data: data,
      timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    };

    this.queue.push(event);

    // Auto-flush if queue is full
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  /**
   * Flush events to server
   */
  async flush() {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
        // Use keepalive for requests during page unload
        keepalive: true,
      });

      if (!response.ok) {
        console.warn('Failed to send analytics:', response.statusText);
        // Put events back in queue if failed
        this.queue.unshift(...events);
      }
    } catch (error) {
      console.error('Analytics error:', error);
      // Put events back in queue if failed
      this.queue.unshift(...events);
    }
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    
    return sessionId;
  }
}

// Initialize global analytics instance
window.analytics = new AnalyticsClient();

// Track initial page view
window.addEventListener('DOMContentLoaded', () => {
  window.analytics.trackPageView(window.location.pathname);
});

// Auto-track navigation (for SPAs)
let lastPath = window.location.pathname;
setInterval(() => {
  const currentPath = window.location.pathname;
  if (currentPath !== lastPath) {
    lastPath = currentPath;
    window.analytics.trackPageView(currentPath);
  }
}, 1000);

