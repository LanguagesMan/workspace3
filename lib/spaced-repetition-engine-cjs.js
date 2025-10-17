/**
 * Spaced Repetition Engine using SM-2 Algorithm (CommonJS)
 */

class SpacedRepetitionEngine {
    
    calculateNextReview(word, quality) {
        let interval = word.interval || 0;
        let repetitions = word.repetitions || 0;
        let easiness = word.easiness || 2.5;
        
        if (quality < 3) {
            repetitions = 0;
            interval = 1;
        } else {
            if (repetitions === 0) {
                interval = 1;
            } else if (repetitions === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easiness);
            }
            repetitions += 1;
        }
        
        easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        
        if (easiness < 1.3) {
            easiness = 1.3;
        }
        
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);
        
        const masteryLevel = Math.min(5, Math.floor(repetitions / 2));
        
        return {
            interval,
            repetitions,
            easiness: Math.round(easiness * 100) / 100,
            nextReview,
            masteryLevel
        };
    }
    
    getDueCount(words) {
        const now = new Date();
        return words.filter(word => {
            if (!word.saved) return false;
            if (!word.nextReview) return true;
            return new Date(word.nextReview) <= now;
        }).length;
    }
}

module.exports = { SpacedRepetitionEngine };
