// 🎯 DYNAMIC LEVEL DETECTION SYSTEM
// Analyzes user's saved words and learning patterns to determine precise vocabulary level

class LevelDetectionSystem {
    constructor() {
        // Spanish word frequency database (top 10,000 words with frequency rank)
        this.wordFrequencyMap = new Map([
            ['el', 1], ['la', 2], ['de', 3], ['que', 4], ['y', 5],
            ['a', 6], ['en', 7], ['un', 8], ['ser', 9], ['se', 10],
            ['no', 11], ['haber', 12], ['por', 13], ['con', 14], ['su', 15],
            ['para', 16], ['como', 17], ['estar', 18], ['tener', 19], ['le', 20],
            // ... would contain all 10,000 words in production
        ]);

        this.levelBands = {
            A1: { min: 1, max: 300, name: 'Beginner' },
            A2: { min: 301, max: 1000, name: 'Elementary' },
            B1: { min: 1001, max: 3000, name: 'Intermediate' },
            B2: { min: 3001, max: 6000, name: 'Upper Intermediate' },
            C1: { min: 6001, max: 10000, name: 'Advanced' },
            C2: { min: 10001, max: 999999, name: 'Mastery' }
        };

        console.log('🎯 Level Detection System initialized');
    }

    /**
     * Detect user's Spanish level based on saved words
     * @param {Array} userWords - Array of words user has learned
     * @param {Object} learningHistory - User's learning patterns
     * @returns {Object} - Detailed level analysis
     */
    detectLevel(userWords = [], learningHistory = {}) {
        if (userWords.length === 0) {
            return this.getDefaultLevel();
        }

        // Analyze word frequencies
        const frequencies = userWords.map(word =>
            this.wordFrequencyMap.get(word.toLowerCase()) || 10000
        );

        // Calculate statistics
        const avgFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
        const maxFrequency = Math.max(...frequencies);
        const minFrequency = Math.min(...frequencies);

        // Determine band
        const level = this.determineLevel(avgFrequency, frequencies.length);

        // Calculate progress within band
        const progressInBand = this.calculateProgress(avgFrequency, level);

        // Analyze learning patterns
        const patterns = this.analyzeLearningPatterns(userWords, learningHistory);

        return {
            level: level,
            levelName: this.levelBands[level].name,
            confidence: this.calculateConfidence(frequencies.length, patterns),
            statistics: {
                totalWords: userWords.length,
                avgFrequencyRank: Math.round(avgFrequency),
                highestFrequency: maxFrequency,
                lowestFrequency: minFrequency,
                progressInLevel: progressInBand
            },
            patterns: patterns,
            nextLevel: this.getNextLevel(level),
            wordsToNextLevel: this.calculateWordsToNextLevel(avgFrequency, level),
            recommendations: this.generateRecommendations(level, patterns)
        };
    }

    /**
     * Determine CEFR level from frequency data
     */
    determineLevel(avgFrequency, wordCount) {
        // Weight both frequency and quantity
        const score = (avgFrequency * 0.7) + (wordCount * 0.3);

        if (score <= 300) return 'A1';
        if (score <= 1000) return 'A2';
        if (score <= 3000) return 'B1';
        if (score <= 6000) return 'B2';
        if (score <= 10000) return 'C1';
        return 'C2';
    }

    /**
     * Calculate progress percentage within current level
     */
    calculateProgress(avgFrequency, level) {
        const band = this.levelBands[level];
        const range = band.max - band.min;
        const position = avgFrequency - band.min;
        const progress = Math.max(0, Math.min(100, (position / range) * 100));
        return Math.round(progress);
    }

    /**
     * Analyze learning patterns
     */
    analyzeLearningPatterns(userWords, history) {
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;

        // Calculate learning velocity
        const recentWords = history.recentActivity || [];
        const wordsLast7Days = recentWords.filter(w =>
            (now - new Date(w.learnedAt).getTime()) < (7 * dayMs)
        ).length;

        const wordsLast30Days = recentWords.filter(w =>
            (now - new Date(w.learnedAt).getTime()) < (30 * dayMs)
        ).length;

        // Retention rate
        const reviewHistory = history.reviews || [];
        const successfulReviews = reviewHistory.filter(r => r.correct).length;
        const retentionRate = reviewHistory.length > 0
            ? (successfulReviews / reviewHistory.length) * 100
            : 0;

        // Consistency score
        const learningStreak = history.streak || 0;
        const consistencyScore = Math.min(100, (learningStreak / 30) * 100);

        return {
            learningVelocity: {
                daily: Math.round(wordsLast7Days / 7),
                weekly: wordsLast7Days,
                monthly: wordsLast30Days
            },
            retention: {
                rate: Math.round(retentionRate),
                successful: successfulReviews,
                total: reviewHistory.length
            },
            consistency: {
                streak: learningStreak,
                score: Math.round(consistencyScore)
            },
            engagement: this.calculateEngagement(wordsLast30Days, consistencyScore)
        };
    }

    /**
     * Calculate confidence in level detection
     */
    calculateConfidence(wordCount, patterns) {
        let confidence = 0;

        // Word count factor (0-40 points)
        confidence += Math.min(40, wordCount / 10);

        // Retention factor (0-30 points)
        confidence += (patterns.retention.rate / 100) * 30;

        // Consistency factor (0-30 points)
        confidence += (patterns.consistency.score / 100) * 30;

        return Math.round(Math.min(100, confidence));
    }

    /**
     * Calculate engagement level
     */
    calculateEngagement(monthlyWords, consistencyScore) {
        const engagementScore = (monthlyWords * 0.6) + (consistencyScore * 0.4);

        if (engagementScore > 80) return 'High';
        if (engagementScore > 50) return 'Medium';
        if (engagementScore > 20) return 'Low';
        return 'Very Low';
    }

    /**
     * Get next level in progression
     */
    getNextLevel(currentLevel) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 'C2';
    }

    /**
     * Calculate words needed to reach next level
     */
    calculateWordsToNextLevel(avgFrequency, level) {
        const nextLevel = this.getNextLevel(level);
        if (nextLevel === level) return 0;

        const currentBand = this.levelBands[level];
        const nextBand = this.levelBands[nextLevel];

        const wordsNeeded = Math.max(0, nextBand.min - avgFrequency);
        return Math.round(wordsNeeded);
    }

    /**
     * Generate personalized recommendations
     */
    generateRecommendations(level, patterns) {
        const recommendations = [];

        // Learning velocity recommendations
        if (patterns.learningVelocity.daily < 5) {
            recommendations.push({
                type: 'velocity',
                priority: 'high',
                message: '📈 Increase daily learning: Aim for 10-15 new words per day'
            });
        }

        // Retention recommendations
        if (patterns.retention.rate < 70) {
            recommendations.push({
                type: 'retention',
                priority: 'high',
                message: '🔄 Improve retention: Review words more frequently with spaced repetition'
            });
        }

        // Consistency recommendations
        if (patterns.consistency.streak < 7) {
            recommendations.push({
                type: 'consistency',
                priority: 'medium',
                message: '⏰ Build a streak: Try to learn every day for at least 7 days'
            });
        }

        // Level-specific recommendations
        const levelRec = this.getLevelRecommendation(level);
        if (levelRec) recommendations.push(levelRec);

        return recommendations;
    }

    /**
     * Get level-specific recommendation
     */
    getLevelRecommendation(level) {
        const levelAdvice = {
            A1: {
                type: 'content',
                priority: 'high',
                message: '🎯 Focus on: Present tense verbs, basic nouns, common phrases'
            },
            A2: {
                type: 'content',
                priority: 'high',
                message: '🎯 Focus on: Past tense, everyday vocabulary, simple conversations'
            },
            B1: {
                type: 'content',
                priority: 'medium',
                message: '🎯 Focus on: All tenses, complex sentences, topic-specific vocabulary'
            },
            B2: {
                type: 'content',
                priority: 'medium',
                message: '🎯 Focus on: Subjunctive mood, idiomatic expressions, nuanced meanings'
            },
            C1: {
                type: 'content',
                priority: 'low',
                message: '🎯 Focus on: Advanced structures, cultural references, professional vocabulary'
            },
            C2: {
                type: 'content',
                priority: 'low',
                message: '🎯 Maintain: Native-level practice, literary texts, specialized domains'
            }
        };

        return levelAdvice[level];
    }

    /**
     * Default level for new users
     */
    getDefaultLevel() {
        return {
            level: 'A1',
            levelName: 'Beginner',
            confidence: 0,
            statistics: {
                totalWords: 0,
                avgFrequencyRank: 0,
                highestFrequency: 0,
                lowestFrequency: 0,
                progressInLevel: 0
            },
            patterns: {
                learningVelocity: { daily: 0, weekly: 0, monthly: 0 },
                retention: { rate: 0, successful: 0, total: 0 },
                consistency: { streak: 0, score: 0 },
                engagement: 'New User'
            },
            nextLevel: 'A2',
            wordsToNextLevel: 300,
            recommendations: [{
                type: 'welcome',
                priority: 'high',
                message: '👋 Welcome! Start with the most common 300 Spanish words'
            }]
        };
    }

    /**
     * Track word learned
     */
    trackWordLearned(userId, word, context = {}) {
        const frequency = this.wordFrequencyMap.get(word.toLowerCase()) || 10000;

        return {
            userId,
            word,
            frequency,
            context,
            learnedAt: new Date().toISOString(),
            band: this.getFrequencyBand(frequency)
        };
    }

    /**
     * Get frequency band for a word
     */
    getFrequencyBand(frequency) {
        if (frequency <= 300) return 'A1';
        if (frequency <= 1000) return 'A2';
        if (frequency <= 3000) return 'B1';
        if (frequency <= 6000) return 'B2';
        if (frequency <= 10000) return 'C1';
        return 'C2';
    }
}

// Export for use in server
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LevelDetectionSystem };
}
