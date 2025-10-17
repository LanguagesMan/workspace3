/**
 * 🎯 LEVEL PROGRESSION SYSTEM
 * 
 * Automatically tracks user improvement and advances their CEFR level
 * Based on vocabulary mastery, comprehension rates, and learning patterns
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class LevelProgressionSystem {
    constructor() {
        // CEFR level requirements (approximate vocabulary sizes)
        this.LEVEL_REQUIREMENTS = {
            'A1': {
                minVocabulary: 300,
                minMastered: 200,
                comprehensionTarget: 0.85,
                averageQuality: 3.5,
                name: 'Beginner',
                description: 'Basic phrases and everyday expressions'
            },
            'A2': {
                minVocabulary: 600,
                minMastered: 400,
                comprehensionTarget: 0.85,
                averageQuality: 3.5,
                name: 'Elementary',
                description: 'Routine tasks and familiar topics'
            },
            'B1': {
                minVocabulary: 1200,
                minMastered: 800,
                comprehensionTarget: 0.85,
                averageQuality: 3.5,
                name: 'Intermediate',
                description: 'Work, school, and leisure situations'
            },
            'B2': {
                minVocabulary: 2500,
                minMastered: 1800,
                comprehensionTarget: 0.85,
                averageQuality: 3.8,
                name: 'Upper Intermediate',
                description: 'Complex texts and spontaneous conversation'
            },
            'C1': {
                minVocabulary: 5000,
                minMastered: 3500,
                comprehensionTarget: 0.90,
                averageQuality: 4.0,
                name: 'Advanced',
                description: 'Demanding texts and fluent expression'
            },
            'C2': {
                minVocabulary: 8000,
                minMastered: 6000,
                comprehensionTarget: 0.95,
                averageQuality: 4.5,
                name: 'Mastery',
                description: 'Near-native fluency'
            }
        };

        this.LEVELS_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    }

    /**
     * Calculate user's current level based on their performance
     * @param {string} userId - User ID
     * @returns {Object} Current level assessment
     */
    async calculateCurrentLevel(userId) {
        try {
            // Get vocabulary stats
            const savedWords = await prisma.word.count({
                where: { userId, saved: true }
            });

            const masteredWords = await prisma.word.count({
                where: { userId, mastered: true }
            });

            // Get average review quality from recent sessions
            const recentReviews = await prisma.reviewSession.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 50
            });

            const avgQuality = recentReviews.length > 0
                ? recentReviews.reduce((sum, r) => sum + r.quality, 0) / recentReviews.length
                : 0;

            // Get average comprehension rate from content interactions
            const comprehensionRate = await this.calculateAvgComprehension(userId);

            // Determine level
            let currentLevel = 'A1';
            let progress = 0;

            for (const level of this.LEVELS_ORDER) {
                const req = this.LEVEL_REQUIREMENTS[level];
                
                const vocabProgress = Math.min(100, (savedWords / req.minVocabulary) * 100);
                const masteryProgress = Math.min(100, (masteredWords / req.minMastered) * 100);
                const qualityProgress = Math.min(100, (avgQuality / req.averageQuality) * 100);
                const comprehensionProgress = Math.min(100, (comprehensionRate / req.comprehensionTarget) * 100);

                const totalProgress = (vocabProgress + masteryProgress + qualityProgress + comprehensionProgress) / 4;

                if (totalProgress >= 80) {
                    currentLevel = level;
                    progress = totalProgress;
                } else {
                    break;
                }
            }

            // Get next level requirements
            const currentLevelIndex = this.LEVELS_ORDER.indexOf(currentLevel);
            const nextLevel = currentLevelIndex < this.LEVELS_ORDER.length - 1
                ? this.LEVELS_ORDER[currentLevelIndex + 1]
                : null;

            return {
                currentLevel,
                currentLevelName: this.LEVEL_REQUIREMENTS[currentLevel].name,
                progress,
                stats: {
                    savedWords,
                    masteredWords,
                    avgQuality: Number(avgQuality.toFixed(2)),
                    comprehensionRate: Number(comprehensionRate.toFixed(2))
                },
                nextLevel,
                nextLevelRequirements: nextLevel ? this.LEVEL_REQUIREMENTS[nextLevel] : null,
                canLevelUp: progress >= 95 && nextLevel !== null
            };

        } catch (error) {
            console.error('Error calculating current level:', error);
            return {
                currentLevel: 'A1',
                currentLevelName: 'Beginner',
                progress: 0,
                error: error.message
            };
        }
    }

    /**
     * Calculate average comprehension rate from user interactions
     * @param {string} userId - User ID
     * @returns {number} Average comprehension rate (0-1)
     */
    async calculateAvgComprehension(userId) {
        try {
            // Get recent content interactions
            const interactions = await prisma.userInteraction.findMany({
                where: {
                    userId,
                    type: { in: ['video_view', 'article_read', 'podcast_listen'] }
                },
                orderBy: { createdAt: 'desc' },
                take: 20
            });

            if (interactions.length === 0) return 0.75; // Default for new users

            // Calculate average comprehension from metadata
            let totalComprehension = 0;
            let count = 0;

            for (const interaction of interactions) {
                try {
                    const metadata = typeof interaction.metadata === 'string' 
                        ? JSON.parse(interaction.metadata)
                        : interaction.metadata;
                    
                    if (metadata && metadata.comprehensionRate) {
                        totalComprehension += metadata.comprehensionRate;
                        count++;
                    }
                } catch (e) {
                    // Skip invalid metadata
                }
            }

            return count > 0 ? totalComprehension / count : 0.75;

        } catch (error) {
            console.error('Error calculating comprehension:', error);
            return 0.75;
        }
    }

    /**
     * Get detailed progress breakdown for current level
     * @param {string} userId - User ID
     * @returns {Object} Detailed progress metrics
     */
    async getProgressBreakdown(userId) {
        try {
            const levelData = await this.calculateCurrentLevel(userId);
            const currentLevel = levelData.currentLevel;
            const requirements = this.LEVEL_REQUIREMENTS[currentLevel];

            // Get current stats
            const savedWords = await prisma.word.count({
                where: { userId, saved: true }
            });

            const masteredWords = await prisma.word.count({
                where: { userId, mastered: true }
            });

            const recentReviews = await prisma.reviewSession.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 50
            });

            const avgQuality = recentReviews.length > 0
                ? recentReviews.reduce((sum, r) => sum + r.quality, 0) / recentReviews.length
                : 0;

            const comprehensionRate = await this.calculateAvgComprehension(userId);

            // Calculate progress for each metric
            const breakdown = {
                level: currentLevel,
                levelName: requirements.name,
                metrics: {
                    vocabulary: {
                        current: savedWords,
                        required: requirements.minVocabulary,
                        progress: Math.min(100, (savedWords / requirements.minVocabulary) * 100),
                        status: savedWords >= requirements.minVocabulary ? 'complete' : 'in-progress'
                    },
                    mastery: {
                        current: masteredWords,
                        required: requirements.minMastered,
                        progress: Math.min(100, (masteredWords / requirements.minMastered) * 100),
                        status: masteredWords >= requirements.minMastered ? 'complete' : 'in-progress'
                    },
                    quality: {
                        current: Number(avgQuality.toFixed(2)),
                        required: requirements.averageQuality,
                        progress: Math.min(100, (avgQuality / requirements.averageQuality) * 100),
                        status: avgQuality >= requirements.averageQuality ? 'complete' : 'in-progress'
                    },
                    comprehension: {
                        current: Number((comprehensionRate * 100).toFixed(1)),
                        required: Number((requirements.comprehensionTarget * 100).toFixed(1)),
                        progress: Math.min(100, (comprehensionRate / requirements.comprehensionTarget) * 100),
                        status: comprehensionRate >= requirements.comprehensionTarget ? 'complete' : 'in-progress'
                    }
                },
                overallProgress: levelData.progress,
                canLevelUp: levelData.canLevelUp
            };

            return breakdown;

        } catch (error) {
            console.error('Error getting progress breakdown:', error);
            return null;
        }
    }

    /**
     * Check if user qualifies for level up
     * @param {string} userId - User ID
     * @returns {Object} Level up eligibility
     */
    async checkLevelUpEligibility(userId) {
        try {
            const levelData = await this.calculateCurrentLevel(userId);
            
            if (!levelData.canLevelUp) {
                return {
                    eligible: false,
                    currentLevel: levelData.currentLevel,
                    progress: levelData.progress,
                    message: 'Keep practicing! You need 95% progress to level up.'
                };
            }

            // Additional checks for level up
            const recentReviews = await prisma.reviewSession.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 20
            });

            // Check consistency (at least 10 reviews in last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const recentReviewCount = recentReviews.filter(r => 
                new Date(r.createdAt) > weekAgo
            ).length;

            if (recentReviewCount < 10) {
                return {
                    eligible: false,
                    currentLevel: levelData.currentLevel,
                    progress: levelData.progress,
                    message: 'Complete at least 10 reviews this week to level up.',
                    requiredReviews: 10 - recentReviewCount
                };
            }

            return {
                eligible: true,
                currentLevel: levelData.currentLevel,
                nextLevel: levelData.nextLevel,
                progress: levelData.progress,
                message: `Congratulations! You're ready to advance to ${levelData.nextLevel}!`
            };

        } catch (error) {
            console.error('Error checking level up eligibility:', error);
            return {
                eligible: false,
                error: error.message
            };
        }
    }

    /**
     * Perform level up for user
     * @param {string} userId - User ID
     * @returns {Object} Level up result
     */
    async performLevelUp(userId) {
        try {
            const eligibility = await this.checkLevelUpEligibility(userId);
            
            if (!eligibility.eligible) {
                return {
                    success: false,
                    message: eligibility.message
                };
            }

            const currentLevel = eligibility.currentLevel;
            const nextLevel = eligibility.nextLevel;

            // Update user's level in database
            await prisma.user.updateMany({
                where: { id: userId },
                data: {
                    level: nextLevel,
                    levelUpdatedAt: new Date()
                }
            });

            // Create level up achievement
            await prisma.userInteraction.create({
                data: {
                    userId,
                    type: 'level_up',
                    contentId: `level-up-${nextLevel}`,
                    metadata: JSON.stringify({
                        fromLevel: currentLevel,
                        toLevel: nextLevel,
                        timestamp: new Date().toISOString()
                    })
                }
            });

            console.log(`🎉 User ${userId} leveled up from ${currentLevel} to ${nextLevel}!`);

            return {
                success: true,
                fromLevel: currentLevel,
                toLevel: nextLevel,
                message: `🎉 Congratulations! You've advanced to ${nextLevel}!`,
                newRequirements: this.LEVEL_REQUIREMENTS[nextLevel]
            };

        } catch (error) {
            console.error('Error performing level up:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get learning velocity (words learned per day)
     * @param {string} userId - User ID
     * @param {number} days - Number of days to analyze
     * @returns {Object} Velocity metrics
     */
    async getLearningVelocity(userId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const newWords = await prisma.word.count({
                where: {
                    userId,
                    saved: true,
                    savedAt: {
                        gte: startDate
                    }
                }
            });

            const masteredWords = await prisma.word.count({
                where: {
                    userId,
                    mastered: true,
                    lastReviewed: {
                        gte: startDate
                    }
                }
            });

            const reviewSessions = await prisma.reviewSession.count({
                where: {
                    userId,
                    createdAt: {
                        gte: startDate
                    }
                }
            });

            return {
                period: `${days} days`,
                newWordsPerDay: Number((newWords / days).toFixed(1)),
                masteredWordsPerDay: Number((masteredWords / days).toFixed(1)),
                reviewsPerDay: Number((reviewSessions / days).toFixed(1)),
                totalNewWords: newWords,
                totalMastered: masteredWords,
                totalReviews: reviewSessions
            };

        } catch (error) {
            console.error('Error calculating learning velocity:', error);
            return null;
        }
    }

    /**
     * Predict time to next level based on current velocity
     * @param {string} userId - User ID
     * @returns {Object} Time prediction
     */
    async predictTimeToNextLevel(userId) {
        try {
            const levelData = await this.calculateCurrentLevel(userId);
            
            if (!levelData.nextLevel) {
                return {
                    message: "You're at the highest level!",
                    daysRemaining: 0
                };
            }

            const velocity = await this.getLearningVelocity(userId, 30);
            const nextReq = levelData.nextLevelRequirements;
            
            // Calculate words needed
            const wordsNeeded = Math.max(0, 
                nextReq.minMastered - levelData.stats.masteredWords
            );

            // Estimate days based on current velocity
            const daysNeeded = velocity.masteredWordsPerDay > 0
                ? Math.ceil(wordsNeeded / velocity.masteredWordsPerDay)
                : null;

            return {
                currentLevel: levelData.currentLevel,
                nextLevel: levelData.nextLevel,
                wordsNeeded,
                currentVelocity: velocity.masteredWordsPerDay,
                estimatedDays: daysNeeded,
                estimatedDate: daysNeeded ? new Date(Date.now() + daysNeeded * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
                message: daysNeeded 
                    ? `At your current pace, you'll reach ${levelData.nextLevel} in about ${daysNeeded} days!`
                    : 'Start reviewing more to see your progress!'
            };

        } catch (error) {
            console.error('Error predicting time to next level:', error);
            return null;
        }
    }

    /**
     * Get personalized recommendations to improve faster
     * @param {string} userId - User ID
     * @returns {Array} Recommendations
     */
    async getImprovementRecommendations(userId) {
        try {
            const breakdown = await this.getProgressBreakdown(userId);
            const velocity = await this.getLearningVelocity(userId, 7);
            
            const recommendations = [];

            // Check each metric
            if (breakdown.metrics.vocabulary.progress < 80) {
                recommendations.push({
                    priority: 'high',
                    category: 'vocabulary',
                    title: 'Learn More Words',
                    message: `You need ${breakdown.metrics.vocabulary.required - breakdown.metrics.vocabulary.current} more words to reach ${breakdown.level}.`,
                    action: 'Browse content and save new words you encounter.',
                    target: breakdown.metrics.vocabulary.required - breakdown.metrics.vocabulary.current
                });
            }

            if (breakdown.metrics.mastery.progress < 80) {
                recommendations.push({
                    priority: 'high',
                    category: 'mastery',
                    title: 'Review Regularly',
                    message: `Master ${breakdown.metrics.mastery.required - breakdown.metrics.mastery.current} more words.`,
                    action: 'Complete daily flashcard reviews to master saved words.',
                    target: breakdown.metrics.mastery.required - breakdown.metrics.mastery.current
                });
            }

            if (breakdown.metrics.quality.progress < 80) {
                recommendations.push({
                    priority: 'medium',
                    category: 'quality',
                    title: 'Improve Review Quality',
                    message: 'Focus on understanding words deeply, not just memorizing.',
                    action: 'Read example sentences and use words in context.',
                    currentQuality: breakdown.metrics.quality.current,
                    targetQuality: breakdown.metrics.quality.required
                });
            }

            if (breakdown.metrics.comprehension.progress < 80) {
                recommendations.push({
                    priority: 'medium',
                    category: 'comprehension',
                    title: 'Watch More Content',
                    message: 'Increase your comprehension by consuming more content at your level.',
                    action: 'Watch videos and read articles regularly.',
                    currentRate: breakdown.metrics.comprehension.current,
                    targetRate: breakdown.metrics.comprehension.required
                });
            }

            // Check velocity
            if (velocity.reviewsPerDay < 5) {
                recommendations.push({
                    priority: 'high',
                    category: 'consistency',
                    title: 'Study More Consistently',
                    message: 'You\'re averaging less than 5 reviews per day.',
                    action: 'Aim for at least 10-20 reviews daily for faster progress.',
                    currentReviews: velocity.reviewsPerDay,
                    targetReviews: 15
                });
            }

            return recommendations;

        } catch (error) {
            console.error('Error getting improvement recommendations:', error);
            return [];
        }
    }
}

module.exports = new LevelProgressionSystem();

