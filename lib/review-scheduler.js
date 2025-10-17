/**
 * 🎯 REVIEW SCHEDULER - Phase 1.3 Spaced Repetition
 * 
 * Implements SM-2 spaced repetition algorithm for optimal review scheduling
 * Features:
 * - Automatic review scheduling based on performance
 * - Mastery level tracking (learning → reviewing → mastered)
 * - Adaptive intervals (1d, 3d, 7d, 14d, 30d, etc.)
 * - Review notifications and reminders
 */

const { supabase, isConfigured } = require('./supabase-client');

class ReviewScheduler {
    constructor() {
        this.masteryLevels = {
            learning: 0,    // Just started learning
            reviewing: 1,   // In review phase
            familiar: 2,    // Getting familiar
            known: 3,       // Well known
            mastered: 4     // Fully mastered
        };

        // SM-2 default parameters
        this.minEaseFactor = 1.3;
        this.defaultEaseFactor = 2.5;
    }

    /**
     * Calculate next review using SM-2 algorithm
     * @param {Object} word - Current word data from database
     * @param {number} quality - User's recall quality (0-5)
     * @returns {Object} Updated word data with new review schedule
     */
    calculateNextReview(word, quality) {
        // Ensure quality is a number between 0-5
        quality = Math.max(0, Math.min(5, parseInt(quality)));

        let easeFactor = word.ease_factor || this.defaultEaseFactor;
        let interval = word.interval_days || 0;
        let repetitions = word.times_reviewed || 0;

        // SM-2 Algorithm
        if (quality >= 3) {
            // Correct response
            repetitions += 1;

            if (repetitions === 1) {
                interval = 1; // First review: 1 day
            } else if (repetitions === 2) {
                interval = 6; // Second review: 6 days
            } else {
                interval = Math.round(interval * easeFactor);
            }

            // Update ease factor
            easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            easeFactor = Math.max(this.minEaseFactor, easeFactor);
        } else {
            // Incorrect response - restart
            repetitions = 0;
            interval = 1;
            easeFactor = Math.max(this.minEaseFactor, easeFactor - 0.2);
        }

        // Calculate next review date
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + interval);

        // Determine mastery level
        let masteryLevel = this.masteryLevels.learning;
        let status = 'learning';

        if (repetitions >= 5 && easeFactor >= 2.5) {
            masteryLevel = this.masteryLevels.mastered;
            status = 'mastered';
        } else if (repetitions >= 3) {
            masteryLevel = this.masteryLevels.known;
            status = 'reviewing';
        } else if (repetitions >= 1) {
            masteryLevel = this.masteryLevels.familiar;
            status = 'reviewing';
        }

        return {
            easeFactor: easeFactor,
            intervalDays: interval,
            repetitions: repetitions,
            nextReviewAt: nextReviewDate.toISOString(),
            masteryLevel: masteryLevel,
            status: status,
            lastReviewedAt: new Date().toISOString()
        };
    }

    /**
     * Get words due for review today
     * @param {string} userId - User ID
     * @param {number} limit - Maximum number of words to return
     * @returns {Array} Words due for review
     */
    async getDueWords(userId, limit = 20) {
        if (!isConfigured()) {
            console.warn('Supabase not configured, returning empty review queue');
            return [];
        }

        try {
            const now = new Date().toISOString();

            const { data: words, error } = await supabase
                .from('user_words')
                .select('*')
                .eq('user_id', userId)
                .eq('language', 'es')
                .eq('saved', true)
                .lte('next_review_at', now)
                .order('next_review_at', { ascending: true })
                .limit(limit);

            if (error) {
                console.error('Error fetching due words:', error);
                return [];
            }

            console.log(`📚 Found ${words?.length || 0} words due for review for user ${userId}`);
            return words || [];

        } catch (error) {
            console.error('Error in getDueWords:', error);
            return [];
        }
    }

    /**
     * Get upcoming review schedule
     * @param {string} userId - User ID
     * @returns {Object} Review schedule by date
     */
    async getReviewSchedule(userId) {
        if (!isConfigured()) {
            return { today: 0, tomorrow: 0, thisWeek: 0, later: 0 };
        }

        try {
            const { data: allWords, error } = await supabase
                .from('user_words')
                .select('next_review_at')
                .eq('user_id', userId)
                .eq('language', 'es')
                .eq('saved', true)
                .not('next_review_at', 'is', null);

            if (error) {
                console.error('Error fetching review schedule:', error);
                return { today: 0, tomorrow: 0, thisWeek: 0, later: 0 };
            }

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);

            const schedule = {
                today: 0,
                tomorrow: 0,
                thisWeek: 0,
                later: 0
            };

            (allWords || []).forEach(word => {
                const reviewDate = new Date(word.next_review_at);
                
                if (reviewDate < tomorrow) {
                    schedule.today++;
                } else if (reviewDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
                    schedule.tomorrow++;
                } else if (reviewDate < weekEnd) {
                    schedule.thisWeek++;
                } else {
                    schedule.later++;
                }
            });

            return schedule;

        } catch (error) {
            console.error('Error in getReviewSchedule:', error);
            return { today: 0, tomorrow: 0, thisWeek: 0, later: 0 };
        }
    }

    /**
     * Schedule a new word for review
     * @param {string} userId - User ID
     * @param {string} word - Word to schedule
     * @returns {boolean} Success status
     */
    async scheduleNewWord(userId, word) {
        if (!isConfigured()) {
            console.warn('Supabase not configured, cannot schedule word');
            return false;
        }

        try {
            // Schedule first review for tomorrow
            const firstReview = new Date();
            firstReview.setDate(firstReview.getDate() + 1);

            const { error } = await supabase
                .from('user_words')
                .update({
                    saved: true,
                    ease_factor: this.defaultEaseFactor,
                    interval_days: 1,
                    next_review_at: firstReview.toISOString(),
                    status: 'learning',
                    mastery_level: this.masteryLevels.learning
                })
                .eq('user_id', userId)
                .eq('lemma', word.toLowerCase().trim())
                .eq('language', 'es');

            if (error) {
                console.error('Error scheduling word:', error);
                return false;
            }

            console.log(`✅ Scheduled word "${word}" for review tomorrow`);
            return true;

        } catch (error) {
            console.error('Error in scheduleNewWord:', error);
            return false;
        }
    }

    /**
     * Get words by mastery level
     * @param {string} userId - User ID
     * @param {string} status - Status to filter by (learning, reviewing, mastered)
     * @returns {Array} Words at specified mastery level
     */
    async getWordsByMastery(userId, status) {
        if (!isConfigured()) {
            return [];
        }

        try {
            const { data: words, error } = await supabase
                .from('user_words')
                .select('*')
                .eq('user_id', userId)
                .eq('language', 'es')
                .eq('saved', true)
                .eq('status', status)
                .order('last_clicked_at', { ascending: false });

            if (error) {
                console.error('Error fetching words by mastery:', error);
                return [];
            }

            return words || [];

        } catch (error) {
            console.error('Error in getWordsByMastery:', error);
            return [];
        }
    }

    /**
     * Get mastery statistics for user
     * @param {string} userId - User ID
     * @returns {Object} Mastery statistics
     */
    async getMasteryStats(userId) {
        if (!isConfigured()) {
            return { learning: 0, reviewing: 0, mastered: 0, total: 0 };
        }

        try {
            const [learning, reviewing, mastered, total] = await Promise.all([
                supabase.from('user_words').select('id', { count: 'exact' })
                    .eq('user_id', userId).eq('language', 'es').eq('saved', true).eq('status', 'learning'),
                supabase.from('user_words').select('id', { count: 'exact' })
                    .eq('user_id', userId).eq('language', 'es').eq('saved', true).eq('status', 'reviewing'),
                supabase.from('user_words').select('id', { count: 'exact' })
                    .eq('user_id', userId).eq('language', 'es').eq('saved', true).eq('status', 'mastered'),
                supabase.from('user_words').select('id', { count: 'exact' })
                    .eq('user_id', userId).eq('language', 'es').eq('saved', true)
            ]);

            return {
                learning: learning.count || 0,
                reviewing: reviewing.count || 0,
                mastered: mastered.count || 0,
                total: total.count || 0
            };

        } catch (error) {
            console.error('Error in getMasteryStats:', error);
            return { learning: 0, reviewing: 0, mastered: 0, total: 0 };
        }
    }

    /**
     * Reset a word to learning state (useful for difficult words)
     * @param {string} userId - User ID
     * @param {string} word - Word to reset
     * @returns {boolean} Success status
     */
    async resetWord(userId, word) {
        if (!isConfigured()) {
            return false;
        }

        try {
            const nextReview = new Date();
            nextReview.setDate(nextReview.getDate() + 1);

            const { error } = await supabase
                .from('user_words')
                .update({
                    ease_factor: this.defaultEaseFactor,
                    interval_days: 1,
                    times_reviewed: 0,
                    next_review_at: nextReview.toISOString(),
                    status: 'learning',
                    mastery_level: this.masteryLevels.learning
                })
                .eq('user_id', userId)
                .eq('lemma', word.toLowerCase().trim())
                .eq('language', 'es');

            if (error) {
                console.error('Error resetting word:', error);
                return false;
            }

            console.log(`✅ Reset word "${word}" to learning state`);
            return true;

        } catch (error) {
            console.error('Error in resetWord:', error);
            return false;
        }
    }
}

module.exports = new ReviewScheduler();

