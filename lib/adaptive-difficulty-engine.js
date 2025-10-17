/**
 * 🎓 ADAPTIVE DIFFICULTY ENGINE (i+1 RULE)
 * 
 * Implements Krashen's Comprehensible Input Hypothesis
 * Content should be "slightly beyond" current level
 * 
 * Distribution Strategy:
 * - 70% at user level (i) - Build confidence
 * - 20% easier (i-1) - Ensure comprehension
 * - 10% harder (i+1) - Challenge & growth
 * 
 * Based on research: 90-95% known words = optimal comprehension
 */

class AdaptiveDifficultyEngine {
    constructor() {
        // CEFR levels in order
        this.LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        
        // Word frequency bands (approximate)
        this.FREQUENCY_BANDS = {
            'A1': { min: 1, max: 500, description: 'Most common words' },
            'A2': { min: 500, max: 1500, description: 'Common daily vocabulary' },
            'B1': { min: 1500, max: 3000, description: 'Intermediate' },
            'B2': { min: 3000, max: 5000, description: 'Advanced everyday' },
            'C1': { min: 5000, max: 10000, description: 'Sophisticated' },
            'C2': { min: 10000, max: 50000, description: 'Native-level' }
        };
        
        // Optimal content distribution
        this.DISTRIBUTION = {
            atLevel: 0.70,    // 70% at user level (i)
            easier: 0.20,     // 20% easier (i-1)
            harder: 0.10      // 10% harder (i+1)
        };
        
        // Comprehension thresholds
        this.MIN_COMPREHENSION = 0.90;  // 90% known words minimum
        this.OPTIMAL_COMPREHENSION = 0.95;  // 95% optimal
        this.MAX_COMPREHENSION = 0.98;  // 98% for unassisted reading
        
        // User level tracking
        this.userLevels = new Map();
    }

    /**
     * Get user's current level
     */
    getUserLevel(userId, defaultLevel = 'A2') {
        if (!this.userLevels.has(userId)) {
            this.userLevels.set(userId, {
                currentLevel: defaultLevel,
                levelIndex: this.LEVELS.indexOf(defaultLevel),
                knownWords: new Set(),
                levelHistory: [],
                lastAssessment: null
            });
        }
        return this.userLevels.get(userId);
    }

    /**
     * Calculate content difficulty distribution (70/20/10 rule)
     * @param {string} userLevel - Current CEFR level
     * @param {Array} availableContent - All available content
     * @param {number} count - How many items to return
     * @returns {Array} Distributed content
     */
    distributeContent(userLevel, availableContent, count = 20) {
        const levelIndex = this.LEVELS.indexOf(userLevel);
        
        // Categorize content by difficulty relative to user
        const atLevel = availableContent.filter(c => c.level === userLevel);
        const easier = levelIndex > 0 
            ? availableContent.filter(c => this.LEVELS.indexOf(c.level) < levelIndex)
            : [];
        const harder = levelIndex < this.LEVELS.length - 1
            ? availableContent.filter(c => this.LEVELS.indexOf(c.level) > levelIndex)
            : [];
        
        // Calculate target counts
        const atLevelCount = Math.round(count * this.DISTRIBUTION.atLevel);
        const easierCount = Math.round(count * this.DISTRIBUTION.easier);
        const harderCount = count - atLevelCount - easierCount;
        
        // Sample from each category
        const selected = [
            ...this.sample(atLevel, atLevelCount),
            ...this.sample(easier, easierCount),
            ...this.sample(harder, harderCount)
        ];
        
        // Shuffle to avoid predictable patterns
        return this.shuffle(selected);
    }

    /**
     * Calculate if content is i+1 for user
     * @param {Object} content - Content with words/vocabulary
     * @param {string} userId 
     * @returns {Object} i+1 analysis
     */
    analyzeComprehensibility(content, userId) {
        const userLevel = this.getUserLevel(userId);
        const { knownWords } = userLevel;
        
        // Extract words from content
        const contentWords = this.extractWords(content.text || content.spanish || '');
        const totalWords = contentWords.length;
        
        if (totalWords === 0) {
            return { isComprehensible: false, reason: 'No content' };
        }
        
        // Count known words
        const knownCount = contentWords.filter(word => knownWords.has(word.toLowerCase())).length;
        const knownPercentage = knownCount / totalWords;
        const unknownPercentage = 1 - knownPercentage;
        
        // Analyze difficulty
        let classification = 'unknown';
        let isOptimal = false;
        
        if (knownPercentage >= this.MAX_COMPREHENSION) {
            classification = 'i-1_or_i'; // Too easy or at level
            isOptimal = false;
        } else if (knownPercentage >= this.OPTIMAL_COMPREHENSION) {
            classification = 'i+1'; // PERFECT - slightly challenging
            isOptimal = true;
        } else if (knownPercentage >= this.MIN_COMPREHENSION) {
            classification = 'i+1'; // Still good - comprehensible
            isOptimal = true;
        } else if (knownPercentage >= 0.80) {
            classification = 'i+2'; // Challenging but possible
            isOptimal = false;
        } else {
            classification = 'i+3_or_more'; // Too hard
            isOptimal = false;
        }
        
        return {
            isComprehensible: knownPercentage >= this.MIN_COMPREHENSION,
            isOptimal,
            classification,
            knownPercentage,
            unknownPercentage,
            knownCount,
            unknownCount: totalWords - knownCount,
            totalWords,
            difficulty: this.calculateDifficulty(knownPercentage),
            recommendation: this.getRecommendation(knownPercentage)
        };
    }

    /**
     * Calculate numeric difficulty (0-10)
     */
    calculateDifficulty(knownPercentage) {
        // Invert so higher = harder
        const difficulty = (1 - knownPercentage) * 10;
        return Math.round(difficulty * 10) / 10;
    }

    /**
     * Get recommendation based on known percentage
     */
    getRecommendation(knownPercentage) {
        if (knownPercentage >= this.MAX_COMPREHENSION) {
            return 'Too easy - increase difficulty';
        } else if (knownPercentage >= this.OPTIMAL_COMPREHENSION) {
            return 'Perfect difficulty (i+1)';
        } else if (knownPercentage >= this.MIN_COMPREHENSION) {
            return 'Good challenge (i+1)';
        } else if (knownPercentage >= 0.80) {
            return 'Very challenging (i+2)';
        } else {
            return 'Too difficult - needs easier content';
        }
    }

    /**
     * Detect if user should level up or down
     * @param {string} userId 
     * @param {Array} recentPerformance - Array of {correct, contentLevel, timestamp}
     * @returns {Object} Level adjustment recommendation
     */
    assessLevelAdjustment(userId, recentPerformance) {
        if (recentPerformance.length < 10) {
            return { shouldAdjust: false, reason: 'Insufficient data' };
        }
        
        const userLevel = this.getUserLevel(userId);
        const currentLevelIndex = userLevel.levelIndex;
        
        // Analyze recent performance
        const last20 = recentPerformance.slice(-20);
        const correctCount = last20.filter(p => p.correct).length;
        const accuracy = correctCount / last20.length;
        
        // Check performance by content level
        const atLevelPerformance = last20.filter(p => p.contentLevel === userLevel.currentLevel);
        const atLevelAccuracy = atLevelPerformance.length > 0
            ? atLevelPerformance.filter(p => p.correct).length / atLevelPerformance.length
            : 0.5;
        
        // Signals for leveling up
        const shouldLevelUp = (
            accuracy >= 0.85 &&              // 85%+ overall accuracy
            atLevelAccuracy >= 0.90 &&       // 90%+ at current level
            currentLevelIndex < this.LEVELS.length - 1  // Not at max level
        );
        
        // Signals for leveling down
        const shouldLevelDown = (
            accuracy < 0.60 &&               // <60% overall accuracy
            atLevelAccuracy < 0.50 &&        // <50% at current level
            currentLevelIndex > 0            // Not at min level
        );
        
        if (shouldLevelUp) {
            const newLevel = this.LEVELS[currentLevelIndex + 1];
            return {
                shouldAdjust: true,
                direction: 'up',
                newLevel,
                reason: `High mastery (${Math.round(accuracy * 100)}% accuracy)`,
                confidence: 'high'
            };
        }
        
        if (shouldLevelDown) {
            const newLevel = this.LEVELS[currentLevelIndex - 1];
            return {
                shouldAdjust: true,
                direction: 'down',
                newLevel,
                reason: `Struggling (${Math.round(accuracy * 100)}% accuracy)`,
                confidence: 'high'
            };
        }
        
        return {
            shouldAdjust: false,
            currentLevel: userLevel.currentLevel,
            accuracy,
            reason: 'Performance stable at current level'
        };
    }

    /**
     * Detect struggle vs boredom
     */
    detectUserState(userId, recentSessions) {
        if (recentSessions.length < 5) {
            return { state: 'normal', confidence: 'low' };
        }
        
        // Calculate metrics
        const avgAccuracy = recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length;
        const avgTimePerQuestion = recentSessions.reduce((sum, s) => sum + s.avgTimePerQuestion, 0) / recentSessions.length;
        const avgCompletionRate = recentSessions.reduce((sum, s) => sum + s.completionRate, 0) / recentSessions.length;
        const avgEngagement = recentSessions.reduce((sum, s) => sum + (s.likes + s.shares + s.comments), 0) / recentSessions.length;
        
        // Detect struggling (high cognitive load)
        const isStruggling = (
            avgAccuracy < 0.65 ||                    // Low accuracy
            avgTimePerQuestion > 15 ||               // Taking too long
            avgCompletionRate < 0.50                 // Not finishing
        );
        
        // Detect boredom (low engagement)
        const isBored = (
            avgAccuracy > 0.95 &&                    // Too easy
            avgCompletionRate < 0.70 &&              // Not finishing (bored)
            avgEngagement < 0.5                      // Low interaction
        );
        
        if (isStruggling) {
            return {
                state: 'struggling',
                confidence: 'high',
                recommendation: 'Reduce difficulty, intensify practice on weak areas',
                metrics: { avgAccuracy, avgTimePerQuestion, avgCompletionRate }
            };
        }
        
        if (isBored) {
            return {
                state: 'bored',
                confidence: 'high',
                recommendation: 'Increase difficulty, introduce new content',
                metrics: { avgAccuracy, avgCompletionRate, avgEngagement }
            };
        }
        
        return {
            state: 'optimal',
            confidence: 'medium',
            recommendation: 'Continue current difficulty',
            metrics: { avgAccuracy, avgTimePerQuestion, avgCompletionRate, avgEngagement }
        };
    }

    /**
     * Mark words as known for user
     */
    addKnownWords(userId, words) {
        const userLevel = this.getUserLevel(userId);
        words.forEach(word => userLevel.knownWords.add(word.toLowerCase()));
    }

    /**
     * Update user level
     */
    updateUserLevel(userId, newLevel) {
        const userLevel = this.getUserLevel(userId);
        userLevel.levelHistory.push({
            from: userLevel.currentLevel,
            to: newLevel,
            timestamp: new Date(),
            knownWordsCount: userLevel.knownWords.size
        });
        userLevel.currentLevel = newLevel;
        userLevel.levelIndex = this.LEVELS.indexOf(newLevel);
        userLevel.lastAssessment = new Date();
    }

    /**
     * Extract words from text (simple tokenization)
     */
    extractWords(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\sáéíóúñü]/g, ' ')  // Keep Spanish characters
            .split(/\s+/)
            .filter(word => word.length > 2);  // Ignore very short words
    }

    /**
     * Sample random items from array
     */
    sample(array, count) {
        if (array.length <= count) return [...array];
        
        const shuffled = this.shuffle([...array]);
        return shuffled.slice(0, count);
    }

    /**
     * Shuffle array (Fisher-Yates)
     */
    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /**
     * Get level progression path
     */
    getLevelProgression(userId) {
        const userLevel = this.getUserLevel(userId);
        const currentIndex = userLevel.levelIndex;
        
        return {
            current: {
                level: userLevel.currentLevel,
                knownWords: userLevel.knownWords.size,
                frequencyBand: this.FREQUENCY_BANDS[userLevel.currentLevel]
            },
            previous: currentIndex > 0 ? {
                level: this.LEVELS[currentIndex - 1],
                frequencyBand: this.FREQUENCY_BANDS[this.LEVELS[currentIndex - 1]]
            } : null,
            next: currentIndex < this.LEVELS.length - 1 ? {
                level: this.LEVELS[currentIndex + 1],
                frequencyBand: this.FREQUENCY_BANDS[this.LEVELS[currentIndex + 1]]
            } : null,
            history: userLevel.levelHistory
        };
    }

    /**
     * Export user data
     */
    exportUserData(userId) {
        const userLevel = this.getUserLevel(userId);
        return {
            ...userLevel,
            knownWords: Array.from(userLevel.knownWords)
        };
    }

    /**
     * Import user data
     */
    importUserData(userId, data) {
        this.userLevels.set(userId, {
            ...data,
            knownWords: new Set(data.knownWords || [])
        });
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdaptiveDifficultyEngine;
}
