/**
 * 📚 SRS (SPACED REPETITION SYSTEM) VOCABULARY
 * Anki-style intelligent vocabulary review system
 * 
 * Algorithm based on:
 * - SuperMemo SM-2 algorithm
 * - Anki's modified SM-2
 * - Research on optimal spacing intervals
 * 
 * Features:
 * - Smart scheduling based on performance
 * - Multiple mastery levels (Learning, Young, Mature, Mastered)
 * - Forgetting curve optimization
 * - Daily review queue management
 * - Streak tracking
 * - Statistics and analytics
 */

const supabase = require('./supabase-client');

class SRSVocabularySystem {
    constructor() {
        // Spacing intervals (in days) for each quality rating
        this.intervals = {
            again: 0.0007,    // 1 minute (in days)
            hard: 0.0021,     // 3 minutes
            good: 0.0069,     // 10 minutes
            easy: 0.0278      // 40 minutes
        };

        // Mastery levels
        this.masteryLevels = {
            NEW: 0,           // Never reviewed
            LEARNING: 1,      // Currently learning (< 1 day)
            YOUNG: 2,         // Young card (1-21 days)
            MATURE: 3,        // Mature card (> 21 days)
            MASTERED: 4       // Mastered (> 100 days, high ease)
        };

        // Default ease factor (2.5 = 250%)
        this.defaultEase = 2.5;

        // Minimum ease factor
        this.minEase = 1.3;

        // Maximum interval (in days)
        this.maxInterval = 365;
    }

    /**
     * Save a new word to user's vocabulary
     * @param {string} userId - User ID
     * @param {Object} wordData - Word data
     * @returns {Promise<Object>} Saved word
     */
    async saveWord(userId, wordData) {
        const {
            word,
            translation,
            context,
            sourceType,
            sourceId,
            difficulty = null
        } = wordData;

        try {
            // Check if word already exists
            const { data: existing } = await supabase
                .from('user_vocabulary')
                .select('*')
                .eq('user_id', userId)
                .eq('word', word.toLowerCase())
                .single();

            if (existing) {
                console.log('📝 Word already exists:', word);
                return existing;
            }

            // Insert new word
            const { data, error } = await supabase
                .from('user_vocabulary')
                .insert([{
                    user_id: userId,
                    word: word.toLowerCase(),
                    translation,
                    context,
                    source_type: sourceType,
                    source_id: sourceId,
                    difficulty,
                    mastery_level: this.masteryLevels.NEW,
                    ease_factor: this.defaultEase,
                    interval_days: 0,
                    repetitions: 0,
                    next_review: new Date().toISOString(), // Due immediately
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Saved new word:', word);
            return data;

        } catch (error) {
            console.error('Error saving word:', error);
            throw error;
        }
    }

    /**
     * Get words due for review
     * @param {string} userId - User ID
     * @param {number} limit - Max words to return
     * @returns {Promise<Array>} Due words
     */
    async getDueWords(userId, limit = 20) {
        try {
            const { data, error } = await supabase
                .from('user_vocabulary')
                .select('*')
                .eq('user_id', userId)
                .lte('next_review', new Date().toISOString())
                .order('next_review', { ascending: true })
                .limit(limit);

            if (error) throw error;

            console.log(`📚 Found ${data.length} words due for review`);
            return data;

        } catch (error) {
            console.error('Error getting due words:', error);
            throw error;
        }
    }

    /**
     * Review a word and update its SRS data
     * @param {string} wordId - Word ID
     * @param {string} quality - Review quality: 'again', 'hard', 'good', 'easy'
     * @returns {Promise<Object>} Updated word
     */
    async reviewWord(wordId, quality) {
        try {
            // Get current word data
            const { data: word, error: fetchError } = await supabase
                .from('user_vocabulary')
                .select('*')
                .eq('id', wordId)
                .single();

            if (fetchError) throw fetchError;

            // Calculate new SRS values
            const srsData = this.calculateNextReview(word, quality);

            // Update word
            const { data: updated, error: updateError } = await supabase
                .from('user_vocabulary')
                .update({
                    ...srsData,
                    last_reviewed: new Date().toISOString()
                })
                .eq('id', wordId)
                .select()
                .single();

            if (updateError) throw updateError;

            // Track review in history
            await this.trackReview(word.user_id, wordId, quality, srsData);

            console.log(`✅ Reviewed word: ${word.word} (${quality})`);
            return updated;

        } catch (error) {
            console.error('Error reviewing word:', error);
            throw error;
        }
    }

    /**
     * Calculate next review date and SRS values
     * Uses modified SM-2 algorithm (Anki-style)
     */
    calculateNextReview(word, quality) {
        let {
            ease_factor,
            interval_days,
            repetitions,
            mastery_level
        } = word;

        let newInterval = 0;
        let newEase = ease_factor;
        let newReps = repetitions;
        let newMastery = mastery_level;

        // Convert quality to performance score (0-4)
        const performanceMap = {
            'again': 0,  // Complete fail
            'hard': 2,   // Hard but correct
            'good': 3,   // Good
            'easy': 4    // Easy/perfect
        };

        const performance = performanceMap[quality] || 3;

        // Calculate new ease factor
        if (performance < 3) {
            // Failed or hard: decrease ease
            newEase = Math.max(
                this.minEase,
                ease_factor + (0.2 - (0.15 * (5 - performance)))
            );
        } else {
            // Good or easy: increase ease slightly
            newEase = ease_factor + (0.1 * (performance - 3));
        }

        // Calculate new interval
        if (performance < 2) {
            // Failed (again): reset to learning
            newInterval = this.intervals.again;
            newReps = 0;
            newMastery = this.masteryLevels.LEARNING;
        } else if (repetitions === 0) {
            // First successful review
            if (performance === 2) {
                newInterval = this.intervals.hard;
            } else if (performance === 3) {
                newInterval = this.intervals.good;
            } else {
                newInterval = this.intervals.easy;
            }
            newReps = 1;
            newMastery = this.masteryLevels.LEARNING;
        } else if (repetitions === 1) {
            // Second successful review
            if (performance === 2) {
                newInterval = 1; // 1 day
            } else if (performance === 3) {
                newInterval = 3; // 3 days
            } else {
                newInterval = 7; // 7 days
            }
            newReps = 2;
            newMastery = this.masteryLevels.YOUNG;
        } else {
            // Subsequent reviews: use ease factor
            if (performance === 2) {
                // Hard: multiply by 1.2
                newInterval = interval_days * 1.2;
            } else {
                // Good/Easy: use ease factor
                newInterval = interval_days * newEase;
                
                // Easy bonus: 30% extra
                if (performance === 4) {
                    newInterval *= 1.3;
                }
            }
            
            newReps = repetitions + 1;

            // Update mastery level based on interval
            if (newInterval > 100) {
                newMastery = this.masteryLevels.MASTERED;
            } else if (newInterval > 21) {
                newMastery = this.masteryLevels.MATURE;
            } else {
                newMastery = this.masteryLevels.YOUNG;
            }
        }

        // Cap maximum interval
        newInterval = Math.min(newInterval, this.maxInterval);

        // Calculate next review date
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + newInterval);

        return {
            ease_factor: newEase,
            interval_days: newInterval,
            repetitions: newReps,
            mastery_level: newMastery,
            next_review: nextReview.toISOString()
        };
    }

    /**
     * Track review in history for analytics
     */
    async trackReview(userId, wordId, quality, srsData) {
        try {
            await supabase
                .from('vocabulary_reviews')
                .insert([{
                    user_id: userId,
                    word_id: wordId,
                    quality,
                    ease_factor: srsData.ease_factor,
                    interval_days: srsData.interval_days,
                    mastery_level: srsData.mastery_level,
                    reviewed_at: new Date().toISOString()
                }]);
        } catch (error) {
            // Don't fail if history tracking fails
            console.error('Error tracking review:', error);
        }
    }

    /**
     * Get vocabulary statistics for user
     */
    async getStats(userId) {
        try {
            const { data: words } = await supabase
                .from('user_vocabulary')
                .select('*')
                .eq('user_id', userId);

            if (!words) {
                return this.getEmptyStats();
            }

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const stats = {
                total: words.length,
                new: words.filter(w => w.mastery_level === this.masteryLevels.NEW).length,
                learning: words.filter(w => w.mastery_level === this.masteryLevels.LEARNING).length,
                young: words.filter(w => w.mastery_level === this.masteryLevels.YOUNG).length,
                mature: words.filter(w => w.mastery_level === this.masteryLevels.MATURE).length,
                mastered: words.filter(w => w.mastery_level === this.masteryLevels.MASTERED).length,
                dueToday: words.filter(w => new Date(w.next_review) <= now).length,
                reviewedToday: words.filter(w => {
                    const lastReview = new Date(w.last_reviewed);
                    return lastReview >= today;
                }).length
            };

            return stats;

        } catch (error) {
            console.error('Error getting stats:', error);
            return this.getEmptyStats();
        }
    }

    /**
     * Get empty stats object
     */
    getEmptyStats() {
        return {
            total: 0,
            new: 0,
            learning: 0,
            young: 0,
            mature: 0,
            mastered: 0,
            dueToday: 0,
            reviewedToday: 0
        };
    }

    /**
     * Get user's learning streak
     */
    async getStreak(userId) {
        try {
            const { data: reviews } = await supabase
                .from('vocabulary_reviews')
                .select('reviewed_at')
                .eq('user_id', userId)
                .order('reviewed_at', { ascending: false })
                .limit(365);

            if (!reviews || reviews.length === 0) {
                return { current: 0, longest: 0 };
            }

            // Calculate streak
            const uniqueDays = new Set(
                reviews.map(r => new Date(r.reviewed_at).toDateString())
            );

            let currentStreak = 0;
            let longestStreak = 0;
            let tempStreak = 0;
            let lastDate = new Date();

            const sortedDays = Array.from(uniqueDays).sort((a, b) => 
                new Date(b) - new Date(a)
            );

            for (const day of sortedDays) {
                const date = new Date(day);
                const daysDiff = Math.floor((lastDate - date) / (1000 * 60 * 60 * 24));

                if (daysDiff <= 1) {
                    tempStreak++;
                    if (tempStreak > longestStreak) {
                        longestStreak = tempStreak;
                    }
                } else {
                    if (currentStreak === 0) {
                        currentStreak = tempStreak;
                    }
                    tempStreak = 1;
                }

                lastDate = date;
            }

            if (currentStreak === 0) {
                currentStreak = tempStreak;
            }

            return {
                current: currentStreak,
                longest: longestStreak
            };

        } catch (error) {
            console.error('Error getting streak:', error);
            return { current: 0, longest: 0 };
        }
    }

    /**
     * Get all vocabulary for user (for analytics)
     */
    async getAllWords(userId) {
        try {
            const { data, error } = await supabase
                .from('user_vocabulary')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data;

        } catch (error) {
            console.error('Error getting all words:', error);
            return [];
        }
    }

    /**
     * Delete a word from vocabulary
     */
    async deleteWord(wordId) {
        try {
            const { error } = await supabase
                .from('user_vocabulary')
                .delete()
                .eq('id', wordId);

            if (error) throw error;

            console.log('🗑️ Deleted word:', wordId);
            return true;

        } catch (error) {
            console.error('Error deleting word:', error);
            throw error;
        }
    }
}

// Export singleton instance
const srsSystem = new SRSVocabularySystem();
module.exports = srsSystem;

