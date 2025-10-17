/**
 * Spaced Repetition Engine using SM-2 Algorithm (Anki-style)
 * Based on SuperMemo 2 algorithm with Anki optimizations
 * 
 * Quality ratings (1-5, Anki style):
 * 1 - Again (forgot, need to review immediately)
 * 2 - Hard (difficult to recall, shorter interval)
 * 3 - Good (recalled correctly, standard interval)
 * 4 - Easy (recalled easily, longer interval)
 * 5 - Perfect (instant recall, maximum interval boost)
 * 
 * Interval progression (Anki-style): 1d → 3d → 7d → 14d → 30d → 90d+
 */

export class SpacedRepetitionEngine {
    
    /**
     * Calculate next review date and update learning metrics (Anki-style SM-2)
     * @param {Object} word - Current word data with SM-2 fields
     * @param {number} quality - Quality rating 1-5 (Anki style)
     * @returns {Object} Updated word data
     */
    calculateNextReview(word, quality) {
        let interval = word.interval || 0;
        let repetitions = word.repetitions || 0;
        let easeFactor = word.easiness || 2.5;
        
        // Anki-style quality mapping (convert 0-5 to 1-5 if needed)
        const ankiQuality = quality === 0 ? 1 : quality;
        
        // ANKI LOGIC: If quality <= 2, reset the card (failed recall)
        if (ankiQuality <= 2) {
            repetitions = 0;
            // Again (1) = 10 minutes, Hard (2) = 1 day
            interval = ankiQuality === 1 ? 0.007 : 1; // 10 min or 1 day
        } else {
            // Correct response - use Anki-style intervals
            if (repetitions === 0) {
                // First successful recall: 1 day
                interval = 1;
            } else if (repetitions === 1) {
                // Second successful recall: 3 days
                interval = 3;
            } else if (repetitions === 2) {
                // Third successful recall: 7 days
                interval = 7;
            } else {
                // Subsequent recalls: use ease factor multiplier
                // Anki intervals: 14d, 30d, 90d, etc.
                interval = Math.round(interval * easeFactor);
            }
            
            // Apply quality modifiers (Anki-style)
            if (ankiQuality === 3) {
                // Good: standard interval
                interval = interval;
            } else if (ankiQuality === 4) {
                // Easy: 1.3x multiplier
                interval = Math.round(interval * 1.3);
            } else if (ankiQuality === 5) {
                // Perfect: 1.5x multiplier
                interval = Math.round(interval * 1.5);
            }
            
            repetitions += 1;
        }
        
        // Update ease factor based on quality (SM-2 formula)
        // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
        // But adjust for Anki's 1-5 scale
        const qualityForEF = ankiQuality <= 2 ? 0 : ankiQuality;
        easeFactor = easeFactor + (0.1 - (5 - qualityForEF) * (0.08 + (5 - qualityForEF) * 0.02));
        
        // Ease factor must be between 1.3 and 2.5
        if (easeFactor < 1.3) easeFactor = 1.3;
        if (easeFactor > 2.5) easeFactor = 2.5;
        
        // Cap maximum interval at 365 days (1 year)
        if (interval > 365) interval = 365;
        
        // Calculate next review date
        const nextReview = new Date();
        if (interval < 1) {
            // For sub-day intervals (like 10 minutes)
            nextReview.setMinutes(nextReview.getMinutes() + Math.round(interval * 24 * 60));
        } else {
            nextReview.setDate(nextReview.getDate() + Math.ceil(interval));
        }
        
        // Calculate mastery level (0-5 based on successful repetitions)
        // 0 reps = level 0, 2 reps = level 1, 4 reps = level 2, etc.
        const masteryLevel = Math.min(5, Math.floor(repetitions / 2));
        
        return {
            interval: Math.ceil(interval),
            repetitions,
            easiness: Math.round(easeFactor * 100) / 100, // Round to 2 decimals
            nextReview,
            masteryLevel,
            qualityUsed: ankiQuality
        };
    }
    
    /**
     * Get count of words due for review
     * @param {Array} words - Array of word objects
     * @returns {number} Count of due words
     */
    getDueCount(words) {
        const now = new Date();
        return words.filter(word => {
            if (!word.saved) return false;
            if (!word.nextReview) return true; // Never reviewed
            return new Date(word.nextReview) <= now;
        }).length;
    }
    
    /**
     * Sort words by review priority
     * @param {Array} words - Array of word objects
     * @returns {Array} Sorted words (most urgent first)
     */
    sortByPriority(words) {
        const now = new Date();
        
        return words.sort((a, b) => {
            // Priority 1: Overdue words (most overdue first)
            const aOverdue = a.nextReview ? new Date(a.nextReview) - now : 0;
            const bOverdue = b.nextReview ? new Date(b.nextReview) - now : 0;
            
            if (aOverdue !== bOverdue) {
                return aOverdue - bOverdue;
            }
            
            // Priority 2: Lower mastery level (harder words first)
            if (a.masteryLevel !== b.masteryLevel) {
                return a.masteryLevel - b.masteryLevel;
            }
            
            // Priority 3: More clicks (more familiar words)
            return b.clickCount - a.clickCount;
        });
    }
    
    /**
     * Get recommended daily review count
     * @param {number} totalWords - Total saved words
     * @returns {number} Recommended daily review count
     */
    getRecommendedDailyReviews(totalWords) {
        if (totalWords < 10) return totalWords;
        if (totalWords < 50) return 10;
        if (totalWords < 100) return 15;
        return 20;
    }
}

// Export singleton instance
export const spacedRepetitionEngine = new SpacedRepetitionEngine();
