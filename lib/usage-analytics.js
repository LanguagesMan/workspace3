/**
 * Usage Analytics System
 * Tracks user behavior and generates insights for improving the platform
 */

const { createClient } = require('@supabase/supabase-js');

class UsageAnalytics {
  constructor(supabaseUrl, supabaseKey) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.batchQueue = [];
    this.batchSize = 10;
    this.flushInterval = 5000; // 5 seconds
    
    // Start automatic batch flushing
    if (this.flushInterval > 0) {
      this.intervalId = setInterval(() => this.flush(), this.flushInterval);
    }
  }

  /**
   * Track article read
   */
  async trackArticleRead(userId, articleId, metadata = {}) {
    const event = {
      user_id: userId,
      event_type: 'article_read',
      event_data: {
        article_id: articleId,
        language: metadata.language,
        difficulty: metadata.difficulty,
        category: metadata.category,
        read_duration: metadata.readDuration,
        completion_percentage: metadata.completionPercentage,
      },
      timestamp: new Date().toISOString(),
    };

    await this.trackEvent(event);
  }

  /**
   * Track word translation
   */
  async trackWordTranslation(userId, word, metadata = {}) {
    const event = {
      user_id: userId,
      event_type: 'word_translation',
      event_data: {
        word,
        from_language: metadata.fromLanguage,
        to_language: metadata.toLanguage,
        context: metadata.context,
        article_id: metadata.articleId,
      },
      timestamp: new Date().toISOString(),
    };

    await this.trackEvent(event);
  }

  /**
   * Track video view
   */
  async trackVideoView(userId, videoId, metadata = {}) {
    const event = {
      user_id: userId,
      event_type: 'video_view',
      event_data: {
        video_id: videoId,
        language: metadata.language,
        category: metadata.category,
        watch_duration: metadata.watchDuration,
        completion_percentage: metadata.completionPercentage,
      },
      timestamp: new Date().toISOString(),
    };

    await this.trackEvent(event);
  }

  /**
   * Track quiz attempt
   */
  async trackQuizAttempt(userId, quizId, metadata = {}) {
    const event = {
      user_id: userId,
      event_type: 'quiz_attempt',
      event_data: {
        quiz_id: quizId,
        score: metadata.score,
        total_questions: metadata.totalQuestions,
        correct_answers: metadata.correctAnswers,
        time_taken: metadata.timeTaken,
        difficulty: metadata.difficulty,
      },
      timestamp: new Date().toISOString(),
    };

    await this.trackEvent(event);
  }

  /**
   * Track user progress milestone
   */
  async trackProgressMilestone(userId, milestone, metadata = {}) {
    const event = {
      user_id: userId,
      event_type: 'progress_milestone',
      event_data: {
        milestone,
        level: metadata.level,
        xp_earned: metadata.xpEarned,
        total_xp: metadata.totalXp,
        achievements: metadata.achievements,
      },
      timestamp: new Date().toISOString(),
    };

    await this.trackEvent(event);
  }

  /**
   * Track vocabulary save
   */
  async trackVocabularySave(userId, word, metadata = {}) {
    const event = {
      user_id: userId,
      event_type: 'vocabulary_save',
      event_data: {
        word,
        translation: metadata.translation,
        language: metadata.language,
        context: metadata.context,
        article_id: metadata.articleId,
      },
      timestamp: new Date().toISOString(),
    };

    await this.trackEvent(event);
  }

  /**
   * Track API usage
   */
  async trackAPIUsage(endpoint, metadata = {}) {
    const event = {
      event_type: 'api_usage',
      event_data: {
        endpoint,
        method: metadata.method,
        status_code: metadata.statusCode,
        response_time: metadata.responseTime,
        user_id: metadata.userId,
        error: metadata.error,
      },
      timestamp: new Date().toISOString(),
    };

    await this.trackEvent(event);
  }

  /**
   * Track generic event (internal method)
   */
  async trackEvent(event) {
    try {
      // Add to batch queue
      this.batchQueue.push(event);

      // Flush if batch is full
      if (this.batchQueue.length >= this.batchSize) {
        await this.flush();
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Flush batch queue to database
   */
  async flush() {
    if (this.batchQueue.length === 0) return;

    const events = [...this.batchQueue];
    this.batchQueue = [];

    try {
      const { error } = await this.supabase
        .from('usage_analytics')
        .insert(events);

      if (error) {
        console.error('Failed to flush analytics batch:', error);
        // Put events back in queue if failed
        this.batchQueue.unshift(...events);
      }
    } catch (error) {
      console.error('Failed to flush analytics batch:', error);
      this.batchQueue.unshift(...events);
    }
  }

  /**
   * Generate daily report
   */
  async generateDailyReport(date = new Date()) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    try {
      const { data, error } = await this.supabase
        .from('usage_analytics')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) throw error;

      // Aggregate metrics
      const report = {
        date: date.toISOString().split('T')[0],
        total_events: data.length,
        unique_users: new Set(data.map(e => e.user_id).filter(Boolean)).size,
        events_by_type: {},
        articles_read: 0,
        videos_watched: 0,
        words_translated: 0,
        quizzes_attempted: 0,
        vocabulary_saved: 0,
      };

      // Count events by type
      data.forEach(event => {
        const type = event.event_type;
        report.events_by_type[type] = (report.events_by_type[type] || 0) + 1;

        // Update specific counters
        if (type === 'article_read') report.articles_read++;
        if (type === 'video_view') report.videos_watched++;
        if (type === 'word_translation') report.words_translated++;
        if (type === 'quiz_attempt') report.quizzes_attempted++;
        if (type === 'vocabulary_save') report.vocabulary_saved++;
      });

      return report;
    } catch (error) {
      console.error('Failed to generate daily report:', error);
      throw error;
    }
  }

  /**
   * Generate weekly report
   */
  async generateWeeklyReport(startDate = new Date()) {
    const reports = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() - i);
      
      try {
        const dailyReport = await this.generateDailyReport(date);
        reports.push(dailyReport);
      } catch (error) {
        console.error(`Failed to generate report for ${date}:`, error);
      }
    }

    // Aggregate weekly metrics
    const weeklyReport = {
      week_start: reports[6]?.date,
      week_end: reports[0]?.date,
      total_events: reports.reduce((sum, r) => sum + r.total_events, 0),
      unique_users: new Set(reports.flatMap(r => Object.keys(r.events_by_type))).size,
      articles_read: reports.reduce((sum, r) => sum + r.articles_read, 0),
      videos_watched: reports.reduce((sum, r) => sum + r.videos_watched, 0),
      words_translated: reports.reduce((sum, r) => sum + r.words_translated, 0),
      quizzes_attempted: reports.reduce((sum, r) => sum + r.quizzes_attempted, 0),
      vocabulary_saved: reports.reduce((sum, r) => sum + r.vocabulary_saved, 0),
      daily_reports: reports,
    };

    return weeklyReport;
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const { data, error } = await this.supabase
        .from('usage_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const summary = {
        user_id: userId,
        period_days: days,
        total_activities: data.length,
        articles_read: data.filter(e => e.event_type === 'article_read').length,
        videos_watched: data.filter(e => e.event_type === 'video_view').length,
        words_translated: data.filter(e => e.event_type === 'word_translation').length,
        quizzes_attempted: data.filter(e => e.event_type === 'quiz_attempt').length,
        vocabulary_saved: data.filter(e => e.event_type === 'vocabulary_save').length,
        last_activity: data[0]?.timestamp,
        most_active_day: null,
      };

      // Calculate most active day
      const dayActivity = {};
      data.forEach(event => {
        const day = event.timestamp.split('T')[0];
        dayActivity[day] = (dayActivity[day] || 0) + 1;
      });

      if (Object.keys(dayActivity).length > 0) {
        summary.most_active_day = Object.entries(dayActivity)
          .sort((a, b) => b[1] - a[1])[0][0];
      }

      return summary;
    } catch (error) {
      console.error('Failed to get user activity summary:', error);
      throw error;
    }
  }

  /**
   * Close analytics (flush remaining events and clear interval)
   */
  async close() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    await this.flush();
  }
}

// Initialize analytics instance
let analyticsInstance = null;

const initAnalytics = (supabaseUrl, supabaseKey) => {
  if (!analyticsInstance) {
    analyticsInstance = new UsageAnalytics(supabaseUrl, supabaseKey);
    console.log('✅ Usage analytics initialized');
  }
  return analyticsInstance;
};

const getAnalytics = () => {
  if (!analyticsInstance) {
    throw new Error('Analytics not initialized. Call initAnalytics first.');
  }
  return analyticsInstance;
};

module.exports = {
  UsageAnalytics,
  initAnalytics,
  getAnalytics,
};

