/**
 * 🧠 HALF-LIFE REGRESSION (HLR) - DUOLINGO'S SPACED REPETITION
 * 
 * Research-based implementation of optimal memory retention scheduling
 * Based on: Settles & Meeder (2016) "A Trainable Spaced Repetition Model for Language Learning"
 * 
 * Key Features:
 * - Predicts probability of recall using forgetting curve: p = 2^(-Δ/h)
 * - Estimates half-life (h) using machine learning regression
 * - Personalizes review schedule based on user performance
 * - Targets 90% recall probability for optimal retention
 * 
 * Performance: 45%+ reduction in prediction error vs SM-2
 *              12% increase in daily engagement vs previous system
 */

class HalfLifeRegression {
    constructor() {
        // Target recall probability (90% optimal per research)
        this.TARGET_RECALL = 0.90;
        
        // Minimum recall before forcing review
        this.MIN_RECALL = 0.75;
        
        // Model weights (Θ) - will be trained/refined over time
        // Initial values based on psycholinguistic research
        this.modelWeights = {
            // Interaction features (most important)
            totalExposures: 0.15,        // √n
            correctRecalls: 0.30,        // √n_⊕ (highest weight)
            incorrectRecalls: -0.40,     // √n_⊖ (penalty)
            
            // Lexeme features (word difficulty)
            wordLength: -0.05,           // Longer = harder
            wordFrequency: 0.10,         // Common = easier
            isCognate: 0.20,             // Similar to English = easier
            isIrregular: -0.25,          // Irregular = harder
            
            // Context features
            timeSinceLastReview: -0.02,  // Decay over time
            reviewInterval: 0.08         // Spacing effect
        };
        
        // User memory profiles (half-life cache)
        this.userMemory = new Map();
        
        // Training data collection for model refinement
        this.trainingData = [];
    }

    /**
     * Calculate probability of recall using forgetting curve
     * p = 2^(-Δ/h)
     * 
     * @param {number} lagDays - Days since last practice (Δ)
     * @param {number} halfLife - Estimated half-life (h)
     * @returns {number} Probability of correct recall (0-1)
     */
    predictRecall(lagDays, halfLife) {
        if (halfLife <= 0) return 0;
        return Math.pow(2, -lagDays / halfLife);
    }

    /**
     * Estimate half-life using regression model
     * ĥ_Θ = 2^(Θ · x)
     * 
     * @param {Object} features - Feature vector for the word
     * @returns {number} Estimated half-life in days
     */
    estimateHalfLife(features) {
        const {
            totalExposures = 0,
            correctRecalls = 0,
            incorrectRecalls = 0,
            wordLength = 5,
            wordFrequency = 1000,
            isCognate = false,
            isIrregular = false,
            lastInterval = 1,
            totalReviewTime = 0
        } = features;

        // Feature vector calculation (using square roots per research)
        const x = (
            (Math.sqrt(totalExposures) * this.modelWeights.totalExposures) +
            (Math.sqrt(correctRecalls) * this.modelWeights.correctRecalls) +
            (Math.sqrt(incorrectRecalls) * this.modelWeights.incorrectRecalls) +
            (Math.log(wordLength) * this.modelWeights.wordLength) +
            (Math.log(wordFrequency + 1) * this.modelWeights.wordFrequency) +
            ((isCognate ? 1 : 0) * this.modelWeights.isCognate) +
            ((isIrregular ? 1 : 0) * this.modelWeights.isIrregular) +
            (Math.log(lastInterval + 1) * this.modelWeights.reviewInterval)
        );

        // Half-life formula: ĥ = 2^(Θ·x)
        const halfLife = Math.pow(2, x);
        
        // Clamp to reasonable bounds (0.25 days to 365 days)
        return Math.max(0.25, Math.min(365, halfLife));
    }

    /**
     * Get user's memory state for a word
     * @param {string} userId 
     * @param {string} wordId 
     * @returns {Object} Memory state
     */
    getMemoryState(userId, wordId) {
        const userKey = `${userId}:${wordId}`;
        
        if (!this.userMemory.has(userKey)) {
            // Initialize new memory state
            this.userMemory.set(userKey, {
                wordId,
                totalExposures: 0,
                correctRecalls: 0,
                incorrectRecalls: 0,
                lastReviewDate: null,
                lastInterval: 0,
                currentHalfLife: 1,  // Start at 1 day
                strengthLevel: 0,    // 0-4 bars
                history: []
            });
        }
        
        return this.userMemory.get(userKey);
    }

    /**
     * Calculate when to schedule next review
     * Optimal time: when p(recall) = 0.90
     * 
     * @param {Object} memoryState 
     * @returns {Object} Schedule recommendation
     */
    scheduleNextReview(memoryState) {
        const { currentHalfLife, lastReviewDate } = memoryState;
        
        // Calculate days until recall probability drops to target
        // p = 2^(-Δ/h) = 0.90
        // -Δ/h = log₂(0.90)
        // Δ = -h × log₂(0.90)
        const targetLag = -currentHalfLife * Math.log2(this.TARGET_RECALL);
        
        // Calculate current lag
        const now = new Date();
        const currentLag = lastReviewDate 
            ? (now - new Date(lastReviewDate)) / (1000 * 60 * 60 * 24)
            : 0;
        
        // Calculate current recall probability
        const currentRecall = this.predictRecall(currentLag, currentHalfLife);
        
        // Days until next review
        const daysUntilReview = Math.max(0, targetLag - currentLag);
        
        // Next review date
        const nextReviewDate = new Date(now.getTime() + daysUntilReview * 24 * 60 * 60 * 1000);
        
        // Urgency level
        let urgency = 'optimal';
        if (currentRecall < this.MIN_RECALL) {
            urgency = 'overdue';
        } else if (currentRecall < this.TARGET_RECALL) {
            urgency = 'due_soon';
        } else if (currentRecall > 0.98) {
            urgency = 'too_fresh';
        }
        
        return {
            nextReviewDate,
            daysUntilReview,
            currentRecall,
            urgency,
            strengthBars: this.calculateStrengthBars(currentRecall)
        };
    }

    /**
     * Calculate strength meter bars (0-4)
     * 4 bars = "golden" = fresh in memory
     */
    calculateStrengthBars(recallProbability) {
        if (recallProbability >= 0.95) return 4;  // Golden
        if (recallProbability >= 0.85) return 3;
        if (recallProbability >= 0.70) return 2;
        if (recallProbability >= 0.50) return 1;
        return 0;  // Needs practice
    }

    /**
     * Update memory state after practice session
     * @param {string} userId 
     * @param {string} wordId 
     * @param {Object} practiceResult 
     * @param {Object} wordFeatures 
     * @returns {Object} Updated memory state and schedule
     */
    recordPractice(userId, wordId, practiceResult, wordFeatures) {
        const memoryState = this.getMemoryState(userId, wordId);
        const { correct, responseTime, confidence } = practiceResult;
        
        const now = new Date();
        const lagDays = memoryState.lastReviewDate
            ? (now - new Date(memoryState.lastReviewDate)) / (1000 * 60 * 60 * 24)
            : 0;
        
        // Update interaction counts
        memoryState.totalExposures++;
        if (correct) {
            memoryState.correctRecalls++;
        } else {
            memoryState.incorrectRecalls++;
        }
        
        // Calculate new half-life
        const features = {
            totalExposures: memoryState.totalExposures,
            correctRecalls: memoryState.correctRecalls,
            incorrectRecalls: memoryState.incorrectRecalls,
            lastInterval: memoryState.lastInterval,
            ...wordFeatures
        };
        
        const newHalfLife = this.estimateHalfLife(features);
        
        // SM-2 style immediate reset on failure
        if (!correct && memoryState.totalExposures > 1) {
            // Significant decrease in half-life for wrong answers
            memoryState.currentHalfLife = Math.max(0.5, newHalfLife * 0.5);
        } else if (correct) {
            // Increase half-life for correct answers (exponential growth)
            memoryState.currentHalfLife = newHalfLife;
        }
        
        // Update state
        memoryState.lastReviewDate = now;
        memoryState.lastInterval = lagDays;
        memoryState.history.push({
            date: now,
            correct,
            responseTime,
            confidence,
            lagDays,
            halfLife: memoryState.currentHalfLife,
            recallProbability: this.predictRecall(lagDays, memoryState.currentHalfLife)
        });
        
        // Collect training data for model refinement
        this.collectTrainingData(memoryState, lagDays, correct);
        
        // Calculate next review schedule
        const schedule = this.scheduleNextReview(memoryState);
        
        return {
            memoryState,
            schedule,
            xpReward: this.calculateXPReward(memoryState, schedule, correct)
        };
    }

    /**
     * Calculate XP reward based on optimal retrieval timing
     * Highest XP when practicing words "on the verge of forgetting"
     */
    calculateXPReward(memoryState, schedule, correct) {
        if (!correct) {
            return 5;  // Small participation reward
        }
        
        const { currentRecall, urgency } = schedule;
        
        // Maximum XP for optimal timing (88-92% recall)
        let xp = 20;  // Base XP
        
        if (urgency === 'overdue') {
            // Rescued from forgetting
            xp = 50;
        } else if (urgency === 'due_soon') {
            // Optimal timing - highest reward
            xp = 100;
        } else if (urgency === 'optimal') {
            xp = 30;
        } else if (urgency === 'too_fresh') {
            // Wasteful review - minimal XP
            xp = 10;
        }
        
        // Bonus for difficult words (low half-life)
        if (memoryState.currentHalfLife < 2) {
            xp *= 1.5;
        }
        
        return Math.round(xp);
    }

    /**
     * Get weakest words for targeted practice
     * @param {string} userId 
     * @param {number} count 
     * @returns {Array} Words due for review, sorted by urgency
     */
    getWeakestWords(userId, count = 10) {
        const userWords = Array.from(this.userMemory.entries())
            .filter(([key, _]) => key.startsWith(`${userId}:`))
            .map(([key, state]) => {
                const schedule = this.scheduleNextReview(state);
                return {
                    wordId: state.wordId,
                    ...state,
                    ...schedule
                };
            });
        
        // Sort by urgency (overdue first, then due soon, then by recall probability)
        userWords.sort((a, b) => {
            const urgencyOrder = { overdue: 0, due_soon: 1, optimal: 2, too_fresh: 3 };
            const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            
            if (urgencyDiff !== 0) return urgencyDiff;
            
            // Within same urgency, prioritize lower recall probability
            return a.currentRecall - b.currentRecall;
        });
        
        return userWords.slice(0, count);
    }

    /**
     * Get skill strength for visualization (Duolingo-style meter)
     * @param {string} userId 
     * @param {Array} wordIds - Words in this skill
     * @returns {Object} Skill strength metrics
     */
    getSkillStrength(userId, wordIds) {
        const wordStates = wordIds.map(wordId => {
            const state = this.getMemoryState(userId, wordId);
            const schedule = this.scheduleNextReview(state);
            return schedule;
        });
        
        // Average recall probability across all words in skill
        const avgRecall = wordStates.reduce((sum, s) => sum + s.currentRecall, 0) / wordStates.length;
        const strengthBars = this.calculateStrengthBars(avgRecall);
        
        // Count words by urgency
        const wordsByUrgency = {
            overdue: wordStates.filter(s => s.urgency === 'overdue').length,
            due_soon: wordStates.filter(s => s.urgency === 'due_soon').length,
            optimal: wordStates.filter(s => s.urgency === 'optimal').length,
            too_fresh: wordStates.filter(s => s.urgency === 'too_fresh').length
        };
        
        return {
            strengthBars,
            avgRecall,
            isGolden: strengthBars === 4,
            needsPractice: strengthBars < 3,
            wordsByUrgency,
            totalWords: wordIds.length
        };
    }

    /**
     * Collect training data for model improvement
     */
    collectTrainingData(memoryState, lagDays, actualRecall) {
        const { currentHalfLife } = memoryState;
        const predictedRecall = this.predictRecall(lagDays, currentHalfLife);
        
        this.trainingData.push({
            lagDays,
            halfLife: currentHalfLife,
            predictedRecall,
            actualRecall: actualRecall ? 1 : 0,
            error: Math.abs(predictedRecall - (actualRecall ? 1 : 0))
        });
        
        // Keep last 10,000 data points
        if (this.trainingData.length > 10000) {
            this.trainingData.shift();
        }
    }

    /**
     * Calculate model accuracy (for monitoring)
     */
    getModelAccuracy() {
        if (this.trainingData.length === 0) return null;
        
        const avgError = this.trainingData.reduce((sum, d) => sum + d.error, 0) / this.trainingData.length;
        const accuracy = 1 - avgError;
        
        return {
            accuracy,
            avgError,
            dataPoints: this.trainingData.length
        };
    }

    /**
     * Export user memory state (for persistence)
     */
    exportUserData(userId) {
        const userData = {};
        
        for (const [key, state] of this.userMemory.entries()) {
            if (key.startsWith(`${userId}:`)) {
                userData[key] = state;
            }
        }
        
        return userData;
    }

    /**
     * Import user memory state (from database)
     */
    importUserData(userData) {
        for (const [key, state] of Object.entries(userData)) {
            this.userMemory.set(key, state);
        }
    }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HalfLifeRegression;
}
