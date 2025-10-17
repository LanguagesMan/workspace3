/**
 * 🎯 ONBOARDING LEVEL ASSESSMENT
 * 
 * Quick assessment to determine user's Spanish level (A1-C2)
 * Used for new users who haven't taken a formal placement test
 * 
 * Method: Watch 3-5 short videos and track comprehension signals
 * - Completion rate
 * - Word clicks
 * - Skip behavior
 * - Replay behavior
 * 
 * More accurate and engaging than traditional multiple-choice tests
 * Based on research from Duolingo's placement test system
 */

class OnboardingAssessment {
    constructor() {
        this.LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        
        // Assessment videos (3-5 videos per level)
        this.assessmentVideos = {
            'A1': [
                { id: 'assess_a1_1', title: 'Greetings', keywords: ['hola', 'adiós', 'buenos días'] },
                { id: 'assess_a1_2', title: 'Numbers 1-10', keywords: ['uno', 'dos', 'tres'] },
                { id: 'assess_a1_3', title: 'Colors', keywords: ['rojo', 'azul', 'verde'] }
            ],
            'A2': [
                { id: 'assess_a2_1', title: 'Daily routine', keywords: ['desayuno', 'trabajo', 'dormir'] },
                { id: 'assess_a2_2', title: 'Family', keywords: ['padre', 'madre', 'hermano'] },
                { id: 'assess_a2_3', title: 'Shopping', keywords: ['comprar', 'precio', 'tienda'] }
            ],
            'B1': [
                { id: 'assess_b1_1', title: 'Travel plans', keywords: ['viajar', 'hotel', 'reservar'] },
                { id: 'assess_b1_2', title: 'Past experiences', keywords: ['pasado', 'experiencia', 'recuerdo'] },
                { id: 'assess_b1_3', title: 'Opinions', keywords: ['creo que', 'pienso', 'opinión'] }
            ],
            'B2': [
                { id: 'assess_b2_1', title: 'Current events', keywords: ['noticias', 'política', 'economía'] },
                { id: 'assess_b2_2', title: 'Environment', keywords: ['medio ambiente', 'clima', 'sostenible'] },
                { id: 'assess_b2_3', title: 'Technology', keywords: ['tecnología', 'internet', 'innovación'] }
            ],
            'C1': [
                { id: 'assess_c1_1', title: 'Philosophy', keywords: ['filosófico', 'concepto', 'teoría'] },
                { id: 'assess_c1_2', title: 'Literature', keywords: ['literario', 'obra', 'autor'] },
                { id: 'assess_c1_3', title: 'Business', keywords: ['empresa', 'estrategia', 'mercado'] }
            ]
        };

        // Comprehension thresholds
        this.thresholds = {
            completionRate: {
                excellent: 0.90,  // Understood well
                good: 0.70,       // Moderate understanding
                poor: 0.50        // Struggled
            },
            wordClickRate: {
                excellent: 0.05,  // Clicked <5% of words
                good: 0.15,       // Clicked 5-15% of words
                poor: 0.30        // Clicked >30% of words
            }
        };
    }

    /**
     * Start assessment - returns first video to show
     * @param {Object} userInfo - Optional user info (interests, native language)
     * @returns {Object} Assessment session
     */
    startAssessment(userInfo = {}) {
        const sessionId = `assess_${Date.now()}`;
        
        return {
            sessionId,
            currentLevel: 'A2', // Start with A2 (most common)
            currentStep: 0,
            totalSteps: 5,
            results: [],
            estimatedLevel: null,
            confidence: 0,
            nextVideo: this.getAssessmentVideo('A2', 0)
        };
    }

    /**
     * Process assessment response and determine next video
     * @param {Object} session - Current assessment session
     * @param {Object} response - User's response to current video
     * @returns {Object} Updated session with next video or final result
     */
    processResponse(session, response) {
        const {
            videoId,
            level,
            completionRate,
            watchTime,
            videoDuration,
            wordClicks,
            totalWords,
            skipped,
            rewatched
        } = response;

        // Calculate comprehension score for this video
        const comprehension = this.calculateComprehension({
            completionRate,
            wordClicks,
            totalWords,
            skipped,
            rewatched
        });

        // Add to results
        session.results.push({
            videoId,
            level,
            comprehension,
            completionRate,
            wordClickRate: totalWords > 0 ? wordClicks / totalWords : 0,
            timestamp: new Date().toISOString()
        });

        session.currentStep++;

        // Determine next level to test based on comprehension
        const nextLevel = this.determineNextLevel(level, comprehension);

        // If we have enough data or reached end, calculate final level
        if (session.currentStep >= session.totalSteps || !nextLevel) {
            return this.finishAssessment(session);
        }

        // Continue assessment
        session.currentLevel = nextLevel;
        session.nextVideo = this.getAssessmentVideo(nextLevel, 0);

        return session;
    }

    /**
     * Calculate comprehension score from user behavior
     * @param {Object} behavior - User interaction data
     * @returns {number} Comprehension score (0-100)
     */
    calculateComprehension(behavior) {
        const {
            completionRate = 0,
            wordClicks = 0,
            totalWords = 100,
            skipped = false,
            rewatched = false
        } = behavior;

        let score = 0;

        // Completion rate (40% weight)
        if (completionRate >= this.thresholds.completionRate.excellent) {
            score += 40;
        } else if (completionRate >= this.thresholds.completionRate.good) {
            score += 30;
        } else if (completionRate >= this.thresholds.completionRate.poor) {
            score += 15;
        }

        // Word click rate (30% weight)
        const wordClickRate = totalWords > 0 ? wordClicks / totalWords : 0;
        if (wordClickRate <= this.thresholds.wordClickRate.excellent) {
            score += 30;
        } else if (wordClickRate <= this.thresholds.wordClickRate.good) {
            score += 20;
        } else if (wordClickRate <= this.thresholds.wordClickRate.poor) {
            score += 10;
        }

        // Skip penalty (20% weight)
        if (!skipped) {
            score += 20;
        }

        // Rewatch bonus (10% weight)
        if (rewatched) {
            score += 10;
        }

        return Math.min(100, score);
    }

    /**
     * Determine next level to test based on comprehension
     * @param {string} currentLevel - Current CEFR level
     * @param {number} comprehension - Comprehension score (0-100)
     * @returns {string|null} Next level to test, or null if done
     */
    determineNextLevel(currentLevel, comprehension) {
        const currentIndex = this.LEVELS.indexOf(currentLevel);

        if (comprehension >= 80) {
            // Too easy - move up one level
            if (currentIndex < this.LEVELS.length - 1) {
                return this.LEVELS[currentIndex + 1];
            }
            return null; // Already at highest level
        } else if (comprehension >= 60) {
            // Just right - confirm with another at same level or move up slightly
            if (currentIndex < this.LEVELS.length - 1) {
                return this.LEVELS[currentIndex + 1];
            }
            return currentLevel;
        } else if (comprehension >= 40) {
            // A bit hard - stay at current level
            return currentLevel;
        } else {
            // Too hard - move down one level
            if (currentIndex > 0) {
                return this.LEVELS[currentIndex - 1];
            }
            return currentLevel; // Already at lowest level
        }
    }

    /**
     * Finish assessment and calculate final level
     * @param {Object} session - Assessment session
     * @returns {Object} Final assessment results
     */
    finishAssessment(session) {
        const results = session.results;

        // Calculate average comprehension per level
        const levelScores = {};
        results.forEach(result => {
            if (!levelScores[result.level]) {
                levelScores[result.level] = [];
            }
            levelScores[result.level].push(result.comprehension);
        });

        // Find the highest level where user scored >= 60
        let estimatedLevel = 'A1';
        let maxScore = 0;

        Object.entries(levelScores).forEach(([level, scores]) => {
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            const levelIndex = this.LEVELS.indexOf(level);
            
            if (avgScore >= 60 && levelIndex > this.LEVELS.indexOf(estimatedLevel)) {
                estimatedLevel = level;
                maxScore = avgScore;
            }
        });

        // Calculate confidence (based on consistency)
        const allScores = results.map(r => r.comprehension);
        const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
        const variance = allScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / allScores.length;
        const stdDev = Math.sqrt(variance);
        const confidence = Math.max(0, Math.min(100, 100 - stdDev));

        return {
            ...session,
            completed: true,
            estimatedLevel,
            confidence: Math.round(confidence),
            levelScores,
            recommendation: this.getRecommendation(estimatedLevel, confidence),
            nextSteps: this.getNextSteps(estimatedLevel)
        };
    }

    /**
     * Get assessment video for level
     * @param {string} level - CEFR level
     * @param {number} index - Video index (0-2)
     * @returns {Object} Video info
     */
    getAssessmentVideo(level, index = 0) {
        const videos = this.assessmentVideos[level] || this.assessmentVideos['A2'];
        return videos[index % videos.length];
    }

    /**
     * Get personalized recommendation based on assessment
     * @param {string} level - Estimated level
     * @param {number} confidence - Confidence score
     * @returns {string} Recommendation text
     */
    getRecommendation(level, confidence) {
        if (confidence >= 80) {
            return `We're confident you're at ${level} level! Start learning with videos matched to your ability.`;
        } else if (confidence >= 60) {
            return `You're likely at ${level} level. We'll fine-tune recommendations as you watch more videos.`;
        } else {
            return `You're around ${level} level. We'll adjust content difficulty as we learn more about you.`;
        }
    }

    /**
     * Get next steps after assessment
     * @param {string} level - User's level
     * @returns {Array} Next steps
     */
    getNextSteps(level) {
        return [
            {
                title: 'Start watching videos',
                description: `Watch videos at your ${level} level`,
                action: 'browse_videos',
                priority: 1
            },
            {
                title: 'Build your vocabulary',
                description: 'Save words as you watch',
                action: 'vocabulary',
                priority: 2
            },
            {
                title: 'Practice with games',
                description: 'Reinforce learning with fun games',
                action: 'games',
                priority: 3
            },
            {
                title: 'AI conversation partner',
                description: 'Practice speaking with AI',
                action: 'ai_chat',
                priority: 4
            }
        ];
    }

    /**
     * Get assessment progress
     * @param {Object} session - Current session
     * @returns {Object} Progress info
     */
    getProgress(session) {
        return {
            currentStep: session.currentStep,
            totalSteps: session.totalSteps,
            percentage: Math.round((session.currentStep / session.totalSteps) * 100),
            currentLevel: session.currentLevel
        };
    }

    /**
     * Skip assessment - use default level
     * @param {string} preferredLevel - User's self-assessed level
     * @returns {Object} Assessment result
     */
    skipAssessment(preferredLevel = 'A2') {
        return {
            completed: true,
            skipped: true,
            estimatedLevel: preferredLevel,
            confidence: 50, // Low confidence since skipped
            recommendation: `Starting with ${preferredLevel} level. We'll adjust as you learn.`,
            nextSteps: this.getNextSteps(preferredLevel)
        };
    }
}

module.exports = OnboardingAssessment;

