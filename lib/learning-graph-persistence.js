/**
 * 📊 LEARNING GRAPH PERSISTENCE
 * Tracks every interaction and updates user's learning graph in real-time
 * Powers the adaptive feed intelligence system
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class LearningGraphPersistence {
    constructor() {
        this.batchQueue = new Map(); // userId -> pending interactions
        this.flushInterval = 5000; // Flush every 5 seconds
        this.startBatchProcessor();
    }

    /**
     * Track any user interaction
     * @param {string} userId - User ID
     * @param {string} type - Interaction type (word_click, article_read, video_watched, etc.)
     * @param {Object} data - Interaction data
     */
    async trackInteraction(userId, type, data = {}) {
        try {
            const interaction = await prisma.userInteraction.create({
                data: {
                    userId,
                    type,
                    contentId: data.contentId || null,
                    difficulty: data.difficulty || null,
                    correct: data.correct !== undefined ? data.correct : null,
                    timeSpent: data.timeSpent || null,
                    completed: data.completed || false,
                    metadata: JSON.stringify({
                        ...data,
                        timestamp: new Date().toISOString()
                    })
                }
            });

            // Update user stats asynchronously
            this.updateUserStats(userId, type, data).catch(err => 
                console.error('Failed to update user stats:', err)
            );

            return interaction;
        } catch (error) {
            console.error('Error tracking interaction:', error);
            // Fallback to batch queue if DB write fails
            this.addToBatchQueue(userId, { type, data });
            return null;
        }
    }

    /**
     * Track video watch interaction
     */
    async trackVideoWatch(userId, videoId, data = {}) {
        return this.trackInteraction(userId, 'video_watched', {
            contentId: videoId,
            ...data
        });
    }

    /**
     * Track article read interaction
     */
    async trackArticleRead(userId, articleId, data = {}) {
        return this.trackInteraction(userId, 'article_read', {
            contentId: articleId,
            ...data
        });
    }

    /**
     * Track word click/lookup
     */
    async trackWordClick(userId, word, data = {}) {
        return this.trackInteraction(userId, 'word_click', {
            contentId: word,
            ...data
        });
    }

    /**
     * Track game play
     */
    async trackGamePlay(userId, gameId, data = {}) {
        return this.trackInteraction(userId, 'game_played', {
            contentId: gameId,
            ...data
        });
    }

    /**
     * Track skip action (important for feed learning)
     */
    async trackSkip(userId, contentId, contentType, data = {}) {
        return this.trackInteraction(userId, 'content_skipped', {
            contentId: `${contentType}_${contentId}`,
            ...data,
            contentType
        });
    }

    /**
     * Track like action
     */
    async trackLike(userId, contentId, contentType) {
        try {
            // Create like in database
            await prisma.like.upsert({
                where: {
                    userId_contentId: {
                        userId,
                        contentId
                    }
                },
                create: {
                    userId,
                    contentId,
                    contentType
                },
                update: {}
            });

            // Track as interaction
            return this.trackInteraction(userId, 'content_liked', {
                contentId: `${contentType}_${contentId}`,
                contentType
            });
        } catch (error) {
            console.error('Error tracking like:', error);
            return null;
        }
    }

    /**
     * Track save action
     */
    async trackSave(userId, contentId, contentType, data = {}) {
        return this.trackInteraction(userId, 'content_saved', {
            contentId: `${contentType}_${contentId}`,
            contentType,
            ...data
        });
    }

    /**
     * Update user statistics based on interaction
     */
    async updateUserStats(userId, interactionType, data) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { totalXP: true, streak: true, lastActivity: true }
            });

            if (!user) return;

            // Calculate XP gain
            let xpGain = 0;
            switch (interactionType) {
                case 'video_watched':
                    xpGain = data.completed ? 10 : 5;
                    break;
                case 'article_read':
                    xpGain = data.completed ? 15 : 7;
                    break;
                case 'word_click':
                    xpGain = 1;
                    break;
                case 'game_played':
                    xpGain = data.score ? Math.floor(data.score / 10) : 5;
                    break;
                case 'quiz_completed':
                    xpGain = data.correct ? 5 : 2;
                    break;
            }

            // Update streak
            const now = new Date();
            const lastActivity = new Date(user.lastActivity);
            const hoursSinceLastActivity = (now - lastActivity) / (1000 * 60 * 60);
            
            let newStreak = user.streak;
            if (hoursSinceLastActivity > 48) {
                newStreak = 1; // Reset streak
            } else if (hoursSinceLastActivity > 24) {
                newStreak = user.streak + 1; // Increment streak
            }

            // Update user
            await prisma.user.update({
                where: { id: userId },
                data: {
                    totalXP: { increment: xpGain },
                    streak: newStreak,
                    lastActivity: now
                }
            });

            // Update daily activity
            await this.updateDailyActivity(userId, interactionType);

        } catch (error) {
            console.error('Error updating user stats:', error);
        }
    }

    /**
     * Update daily activity tracking
     */
    async updateDailyActivity(userId, interactionType) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const activity = await prisma.dailyActivity.upsert({
                where: {
                    userId_date: {
                        userId,
                        date: today
                    }
                },
                create: {
                    userId,
                    date: today,
                    videosWatched: interactionType === 'video_watched' ? 1 : 0,
                    articlesRead: interactionType === 'article_read' ? 1 : 0,
                    gamesPlayed: interactionType === 'game_played' ? 1 : 0,
                    wordsLearned: interactionType === 'word_click' ? 1 : 0,
                    quizzesCompleted: interactionType === 'quiz_completed' ? 1 : 0
                },
                update: {
                    videosWatched: interactionType === 'video_watched' ? { increment: 1 } : undefined,
                    articlesRead: interactionType === 'article_read' ? { increment: 1 } : undefined,
                    gamesPlayed: interactionType === 'game_played' ? { increment: 1 } : undefined,
                    wordsLearned: interactionType === 'word_click' ? { increment: 1 } : undefined,
                    quizzesCompleted: interactionType === 'quiz_completed' ? { increment: 1 } : undefined
                }
            });

            return activity;
        } catch (error) {
            console.error('Error updating daily activity:', error);
            return null;
        }
    }

    /**
     * Calculate rolling comprehension scores
     */
    async calculateComprehensionScore(userId, timeWindow = 7) {
        try {
            const since = new Date();
            since.setDate(since.getDate() - timeWindow);

            const interactions = await prisma.userInteraction.findMany({
                where: {
                    userId,
                    createdAt: { gte: since },
                    type: { in: ['video_watched', 'article_read', 'quiz_completed'] }
                },
                orderBy: { createdAt: 'desc' }
            });

            if (interactions.length === 0) return 0;

            // Calculate average comprehension
            let totalScore = 0;
            let count = 0;

            for (const interaction of interactions) {
                if (interaction.completed) {
                    totalScore += 100;
                    count++;
                } else if (interaction.timeSpent) {
                    // Estimate comprehension from time spent
                    const metadata = JSON.parse(interaction.metadata || '{}');
                    const duration = metadata.duration || 60;
                    const completionRate = Math.min(1, interaction.timeSpent / duration);
                    totalScore += completionRate * 100;
                    count++;
                }
            }

            return count > 0 ? Math.round(totalScore / count) : 0;
        } catch (error) {
            console.error('Error calculating comprehension score:', error);
            return 0;
        }
    }

    /**
     * Get user interaction history
     */
    async getInteractionHistory(userId, options = {}) {
        try {
            const {
                limit = 100,
                type = null,
                since = null
            } = options;

            const where = { userId };
            if (type) where.type = type;
            if (since) where.createdAt = { gte: since };

            return await prisma.userInteraction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit
            });
        } catch (error) {
            console.error('Error getting interaction history:', error);
            return [];
        }
    }

    /**
     * Get interaction patterns for feed optimization
     */
    async getInteractionPatterns(userId) {
        try {
            const last30Days = new Date();
            last30Days.setDate(last30Days.getDate() - 30);

            const interactions = await prisma.userInteraction.findMany({
                where: {
                    userId,
                    createdAt: { gte: last30Days }
                }
            });

            // Analyze patterns
            const patterns = {
                totalInteractions: interactions.length,
                byType: {},
                byDifficulty: {},
                completionRate: 0,
                averageTimeSpent: 0,
                preferredTimes: [], // When user is most active
                skipRate: 0,
                likeRate: 0
            };

            let completedCount = 0;
            let totalTimeSpent = 0;
            let timeSpentCount = 0;
            let skipCount = 0;
            let likeCount = 0;

            for (const interaction of interactions) {
                // Count by type
                patterns.byType[interaction.type] = (patterns.byType[interaction.type] || 0) + 1;

                // Count by difficulty
                if (interaction.difficulty) {
                    patterns.byDifficulty[interaction.difficulty] = 
                        (patterns.byDifficulty[interaction.difficulty] || 0) + 1;
                }

                // Track completion
                if (interaction.completed) completedCount++;

                // Track time spent
                if (interaction.timeSpent) {
                    totalTimeSpent += interaction.timeSpent;
                    timeSpentCount++;
                }

                // Track skips and likes
                if (interaction.type === 'content_skipped') skipCount++;
                if (interaction.type === 'content_liked') likeCount++;
            }

            patterns.completionRate = interactions.length > 0 
                ? (completedCount / interactions.length) * 100 
                : 0;
            patterns.averageTimeSpent = timeSpentCount > 0 
                ? totalTimeSpent / timeSpentCount 
                : 0;
            patterns.skipRate = interactions.length > 0 
                ? (skipCount / interactions.length) * 100 
                : 0;
            patterns.likeRate = interactions.length > 0 
                ? (likeCount / interactions.length) * 100 
                : 0;

            return patterns;
        } catch (error) {
            console.error('Error getting interaction patterns:', error);
            return null;
        }
    }

    /**
     * Update interest weights based on interactions
     */
    async updateInterestWeights(userId) {
        try {
            const patterns = await this.getInteractionPatterns(userId);
            if (!patterns) return;

            const last30Days = new Date();
            last30Days.setDate(last30Days.getDate() - 30);

            const interactions = await prisma.userInteraction.findMany({
                where: {
                    userId,
                    createdAt: { gte: last30Days },
                    type: { in: ['video_watched', 'article_read', 'content_liked'] }
                }
            });

            // Extract topics from content interactions
            const topicCounts = {};
            
            for (const interaction of interactions) {
                try {
                    const metadata = JSON.parse(interaction.metadata || '{}');
                    const topics = metadata.topics || [];
                    
                    for (const topic of topics) {
                        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                        
                        // Boost weight for liked content
                        if (interaction.type === 'content_liked') {
                            topicCounts[topic] += 2;
                        }
                    }
                } catch (e) {
                    // Skip malformed metadata
                }
            }

            // Update or create interest weights
            for (const [interest, count] of Object.entries(topicCounts)) {
                const weight = Math.min(10, count / 10); // Normalize to 0-10

                await prisma.userInterest.upsert({
                    where: {
                        userId_interest: {
                            userId,
                            interest
                        }
                    },
                    create: {
                        userId,
                        interest,
                        weight
                    },
                    update: {
                        weight
                    }
                });
            }

            return topicCounts;
        } catch (error) {
            console.error('Error updating interest weights:', error);
            return null;
        }
    }

    /**
     * Batch processing helpers
     */
    addToBatchQueue(userId, interaction) {
        if (!this.batchQueue.has(userId)) {
            this.batchQueue.set(userId, []);
        }
        this.batchQueue.get(userId).push(interaction);
    }

    startBatchProcessor() {
        setInterval(() => {
            this.flushBatchQueue();
        }, this.flushInterval);
    }

    async flushBatchQueue() {
        if (this.batchQueue.size === 0) return;

        const entries = Array.from(this.batchQueue.entries());
        this.batchQueue.clear();

        for (const [userId, interactions] of entries) {
            for (const { type, data } of interactions) {
                try {
                    await this.trackInteraction(userId, type, data);
                } catch (error) {
                    console.error('Error flushing batch interaction:', error);
                }
            }
        }
    }

    /**
     * Get success rate per difficulty level
     */
    async getSuccessRateByDifficulty(userId) {
        try {
            const last30Days = new Date();
            last30Days.setDate(last30Days.getDate() - 30);

            const interactions = await prisma.userInteraction.findMany({
                where: {
                    userId,
                    createdAt: { gte: last30Days },
                    difficulty: { not: null }
                }
            });

            const stats = {};

            for (const interaction of interactions) {
                const level = interaction.difficulty;
                if (!stats[level]) {
                    stats[level] = { total: 0, completed: 0, avgTimeSpent: 0, timeSpentSum: 0 };
                }

                stats[level].total++;
                if (interaction.completed) stats[level].completed++;
                if (interaction.timeSpent) {
                    stats[level].timeSpentSum += interaction.timeSpent;
                }
            }

            // Calculate rates
            for (const level in stats) {
                stats[level].successRate = (stats[level].completed / stats[level].total) * 100;
                stats[level].avgTimeSpent = stats[level].timeSpentSum / stats[level].total;
            }

            return stats;
        } catch (error) {
            console.error('Error getting success rate by difficulty:', error);
            return {};
        }
    }

    /**
     * Cleanup old interactions (keep last 90 days)
     */
    async cleanupOldInteractions() {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 90);

            const deleted = await prisma.userInteraction.deleteMany({
                where: {
                    createdAt: { lt: cutoffDate }
                }
            });

            console.log(`🧹 Cleaned up ${deleted.count} old interactions`);
            return deleted.count;
        } catch (error) {
            console.error('Error cleaning up old interactions:', error);
            return 0;
        }
    }
}

// Export singleton
const learningGraphPersistence = new LearningGraphPersistence();
module.exports = learningGraphPersistence;


