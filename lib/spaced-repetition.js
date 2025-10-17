/**
 * Spaced Repetition System - SM-2 Algorithm Implementation
 * Based on SuperMemo SM-2 algorithm for optimal vocabulary review scheduling
 * 
 * The SM-2 algorithm calculates when a user should review a word based on:
 * - Ease Factor (how easy the word is for the user)
 * - Repetition number (how many times reviewed)
 * - Quality of response (0-5 scale)
 */

class SpacedRepetition {
  /**
   * Calculate next review date using SM-2 algorithm
   * @param {Object} card - The flashcard/word to review
   * @param {number} quality - User's response quality (0-5)
   *   5: Perfect response
   *   4: Correct response after some hesitation
   *   3: Correct response with difficulty
   *   2: Incorrect but word seemed familiar
   *   1: Incorrect but word seemed vaguely familiar
   *   0: Complete blackout
   * @returns {Object} Updated card with new scheduling data
   */
  static calculateNextReview(card, quality) {
    // Validate quality input
    if (quality < 0 || quality > 5) {
      throw new Error('Quality must be between 0 and 5');
    }

    // Initialize defaults for new cards
    let easeFactor = card.easeFactor || 2.5;
    let interval = card.interval || 0;
    let repetitions = card.repetitions || 0;

    // Calculate new ease factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Ease factor should never be less than 1.3
    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }

    // If quality < 3, reset repetitions and start over
    if (quality < 3) {
      repetitions = 0;
      interval = 1; // Review tomorrow
    } else {
      // Quality >= 3, continue with spaced repetition
      if (repetitions === 0) {
        interval = 1; // First review: 1 day
      } else if (repetitions === 1) {
        interval = 6; // Second review: 6 days
      } else {
        // Subsequent reviews: multiply previous interval by ease factor
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      easeFactor: Number(easeFactor.toFixed(2)),
      interval,
      repetitions,
      nextReview: nextReview.toISOString(),
      lastReviewed: new Date().toISOString(),
      quality
    };
  }

  /**
   * Determine mastery level based on repetitions and ease factor
   * @param {Object} card - The flashcard/word
   * @returns {string} Mastery level: 'new', 'learning', 'young', 'mature', 'mastered'
   */
  static getMasteryLevel(card) {
    if (!card.repetitions || card.repetitions === 0) {
      return 'new';
    }

    if (card.repetitions < 3) {
      return 'learning';
    }

    if (card.repetitions < 7) {
      return 'young';
    }

    if (card.repetitions < 15) {
      return 'mature';
    }

    // After 15+ successful repetitions with good ease factor
    if (card.repetitions >= 15 && card.easeFactor >= 2.5) {
      return 'mastered';
    }

    return 'mature';
  }

  /**
   * Get cards due for review
   * @param {Array} cards - All user's flashcards
   * @param {number} limit - Maximum number of cards to return
   * @returns {Array} Cards that need review, sorted by priority
   */
  static getDueCards(cards, limit = 20) {
    const now = new Date();

    // Filter cards that are due for review
    const dueCards = cards.filter(card => {
      if (!card.nextReview) return true; // New cards
      return new Date(card.nextReview) <= now;
    });

    // Sort by priority:
    // 1. Overdue cards (longest overdue first)
    // 2. New cards
    // 3. Cards with lower ease factor (struggling with these)
    dueCards.sort((a, b) => {
      const aOverdue = a.nextReview ? now - new Date(a.nextReview) : 0;
      const bOverdue = b.nextReview ? now - new Date(b.nextReview) : 0;

      // Prioritize overdue cards
      if (aOverdue > 0 && bOverdue > 0) {
        return bOverdue - aOverdue; // Most overdue first
      }

      // Then new cards
      if (!a.nextReview && b.nextReview) return -1;
      if (a.nextReview && !b.nextReview) return 1;

      // Then by ease factor (lower = more difficult)
      return (a.easeFactor || 2.5) - (b.easeFactor || 2.5);
    });

    return dueCards.slice(0, limit);
  }

  /**
   * Get review statistics for a user
   * @param {Array} cards - All user's flashcards
   * @returns {Object} Statistics about review progress
   */
  static getReviewStats(cards) {
    const now = new Date();
    
    const stats = {
      total: cards.length,
      new: 0,
      learning: 0,
      young: 0,
      mature: 0,
      mastered: 0,
      dueToday: 0,
      dueTomorrow: 0,
      averageEaseFactor: 0,
      longestStreak: 0
    };

    let easeFactorSum = 0;
    let easeFactorCount = 0;

    cards.forEach(card => {
      // Count by mastery level
      const mastery = this.getMasteryLevel(card);
      stats[mastery]++;

      // Count due cards
      if (!card.nextReview || new Date(card.nextReview) <= now) {
        stats.dueToday++;
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        
        if (new Date(card.nextReview) <= tomorrow) {
          stats.dueTomorrow++;
        }
      }

      // Calculate average ease factor
      if (card.easeFactor) {
        easeFactorSum += card.easeFactor;
        easeFactorCount++;
      }

      // Track longest streak (repetitions)
      if (card.repetitions > stats.longestStreak) {
        stats.longestStreak = card.repetitions;
      }
    });

    stats.averageEaseFactor = easeFactorCount > 0 
      ? Number((easeFactorSum / easeFactorCount).toFixed(2))
      : 2.5;

    return stats;
  }

  /**
   * Get optimal study session size based on user's current cards
   * @param {Array} cards - All user's flashcards
   * @returns {Object} Recommended session configuration
   */
  static getOptimalSessionSize(cards) {
    const dueCards = this.getDueCards(cards, 999);
    const stats = this.getReviewStats(cards);

    let recommendedSize = 20; // Default
    let sessionType = 'mixed';

    // If lots of new cards, focus on those
    if (stats.new > 30) {
      recommendedSize = 15;
      sessionType = 'new-focused';
    }

    // If lots of due reviews, prioritize those
    if (stats.dueToday > 50) {
      recommendedSize = 30;
      sessionType = 'review-focused';
    }

    // If falling behind, larger sessions
    if (stats.dueToday > 100) {
      recommendedSize = 50;
      sessionType = 'catch-up';
    }

    // If mostly mastered, smaller maintenance sessions
    if (stats.mastered > stats.total * 0.7) {
      recommendedSize = 10;
      sessionType = 'maintenance';
    }

    return {
      recommendedSize,
      sessionType,
      totalDue: dueCards.length,
      estimatedTimeMinutes: Math.ceil(recommendedSize * 0.5) // ~30 seconds per card
    };
  }

  /**
   * Calculate retention rate for a set of cards
   * @param {Array} cards - Flashcards to analyze
   * @returns {Object} Retention statistics
   */
  static calculateRetention(cards) {
    const reviewedCards = cards.filter(c => c.lastReviewed);
    
    if (reviewedCards.length === 0) {
      return {
        rate: 0,
        totalReviews: 0,
        successfulReviews: 0
      };
    }

    const successfulReviews = reviewedCards.filter(c => c.quality >= 3).length;
    const totalReviews = reviewedCards.length;

    return {
      rate: Number(((successfulReviews / totalReviews) * 100).toFixed(1)),
      totalReviews,
      successfulReviews,
      failedReviews: totalReviews - successfulReviews
    };
  }

  /**
   * Predict future workload based on current cards
   * @param {Array} cards - All user's flashcards
   * @param {number} days - Number of days to predict
   * @returns {Array} Predicted reviews per day
   */
  static predictWorkload(cards, days = 30) {
    const predictions = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      targetDate.setHours(23, 59, 59, 999);

      const dueCount = cards.filter(card => {
        if (!card.nextReview) return i === 0; // New cards count for today
        const reviewDate = new Date(card.nextReview);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate <= targetDate && 
               (i === 0 || reviewDate > new Date(today.getTime() + (i - 1) * 24 * 60 * 60 * 1000));
      }).length;

      predictions.push({
        date: targetDate.toISOString().split('T')[0],
        dueCards: dueCount,
        estimatedMinutes: Math.ceil(dueCount * 0.5)
      });
    }

    return predictions;
  }

  /**
   * Get personalized study recommendations
   * @param {Array} cards - All user's flashcards
   * @param {Object} userPreferences - User's study preferences
   * @returns {Object} Study recommendations
   */
  static getStudyRecommendations(cards, userPreferences = {}) {
    const stats = this.getReviewStats(cards);
    const session = this.getOptimalSessionSize(cards);
    const retention = this.calculateRetention(cards);
    
    const recommendations = [];

    // Recommendation: Consistency
    if (stats.dueToday > 30) {
      recommendations.push({
        type: 'consistency',
        priority: 'high',
        message: `You have ${stats.dueToday} cards due. Try to review daily to avoid buildup.`,
        action: 'Start a review session'
      });
    }

    // Recommendation: Learning new cards
    if (stats.new > 50 && stats.dueToday < 10) {
      recommendations.push({
        type: 'new-cards',
        priority: 'medium',
        message: `Great job staying current! Consider learning ${Math.min(10, stats.new)} new words.`,
        action: 'Learn new vocabulary'
      });
    }

    // Recommendation: Retention improvement
    if (retention.rate < 80 && retention.totalReviews > 10) {
      recommendations.push({
        type: 'retention',
        priority: 'high',
        message: `Your retention rate is ${retention.rate}%. Try shorter, more frequent sessions.`,
        action: 'Review struggling words'
      });
    }

    // Recommendation: Mastery celebration
    if (stats.mastered > stats.total * 0.5) {
      recommendations.push({
        type: 'celebration',
        priority: 'low',
        message: `Amazing! You've mastered ${stats.mastered} words! Keep up the great work! 🎉`,
        action: 'View mastered words'
      });
    }

    // Recommendation: Time management
    const workload = this.predictWorkload(cards, 7);
    const avgDaily = workload.reduce((sum, day) => sum + day.dueCards, 0) / 7;
    
    if (avgDaily > 40) {
      recommendations.push({
        type: 'workload',
        priority: 'medium',
        message: `You're averaging ${Math.round(avgDaily)} reviews per day. Consider adjusting your new card limit.`,
        action: 'Adjust settings'
      });
    }

    return {
      recommendations,
      currentSession: session,
      stats,
      retention,
      nextWeekWorkload: workload.slice(0, 7)
    };
  }
}

module.exports = SpacedRepetition;

