// 📊 ANALYTICS ENGINE - Process and analyze user learning data
// Provides insights, predictions, and personalized recommendations

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AnalyticsEngine {
    constructor() {
        this.cacheTime = 5 * 60 * 1000; // 5 minutes
        this.cache = new Map();
    }

    /**
     * Track user action (videos, articles, words, games, quizzes)
     */
    async trackAction(userId, action) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find or create today's activity record
            const activity = await prisma.dailyActivity.upsert({
                where: {
                    userId_date: {
                        userId,
                        date: today
                    }
                },
                update: this.buildUpdateData(action),
                create: {
                    userId,
                    date: today,
                    ...this.buildUpdateData(action)
                }
            });

            // Track content engagement
            if (action.contentType && action.contentId) {
                await prisma.contentEngagement.create({
                    data: {
                        userId,
                        contentType: action.contentType,
                        contentId: action.contentId,
                        action: action.action || 'viewed',
                        timeSpent: action.timeSpent || null
                    }
                });
            }

            // Update user interests if applicable
            if (action.category) {
                await this.updateUserInterest(userId, action.category, action.timeSpent || 60);
            }

            // Update user streak
            if (action.type !== 'review') {
                await this.updateStreak(userId);
            }

            return { success: true, activity };
        } catch (error) {
            console.error('Analytics tracking error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Build update data based on action type
     */
    buildUpdateData(action) {
        const updates = {};

        switch (action.type) {
            case 'video':
                updates.videosWatched = { increment: 1 };
                updates.timeSpentMins = { increment: Math.ceil((action.duration || 60) / 60) };
                break;
            case 'article':
                updates.articlesRead = { increment: 1 };
                updates.timeSpentMins = { increment: Math.ceil((action.timeSpent || 120) / 60) };
                break;
            case 'word':
                updates.wordsLearned = { increment: 1 };
                break;
            case 'review':
                updates.wordsReviewed = { increment: 1 };
                break;
            case 'game':
                updates.gamesPlayed = { increment: 1 };
                updates.timeSpentMins = { increment: Math.ceil((action.duration || 180) / 60) };
                break;
            case 'quiz':
                updates.quizzesCompleted = { increment: 1 };
                break;
        }

        return updates;
    }

    /**
     * Update user interest weights based on engagement
     */
    async updateUserInterest(userId, category, timeSpent) {
        try {
            // Weight based on time spent (more time = more interest)
            const weight = Math.min(timeSpent / 60, 10); // Max 10 points

            await prisma.userInterestCategory.upsert({
                where: {
                    userId_category: {
                        userId,
                        category
                    }
                },
                update: {
                    weight: { increment: weight * 0.1 }, // Gradual increase
                    lastUpdated: new Date()
                },
                create: {
                    userId,
                    category,
                    weight: weight * 0.1,
                    lastUpdated: new Date()
                }
            });
        } catch (error) {
            console.error('Interest update error:', error);
        }
    }

    /**
     * Update user streak
     */
    async updateStreak(userId) {
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) return;

            const lastActivity = new Date(user.lastActivity);
            const now = new Date();
            const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

            let newStreak = user.streak;

            if (daysDiff === 0) {
                // Same day, no change
                return;
            } else if (daysDiff === 1) {
                // Next day, increment streak
                newStreak = user.streak + 1;
            } else {
                // Broke streak
                newStreak = 1;
            }

            await prisma.user.update({
                where: { id: userId },
                data: {
                    streak: newStreak,
                    longestStreak: Math.max(newStreak, user.longestStreak),
                    lastActivity: now
                }
            });

            // Mark streak maintained in daily activity
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            await prisma.dailyActivity.updateMany({
                where: {
                    userId,
                    date: today
                },
                data: {
                    streakMaintained: true
                }
            });
        } catch (error) {
            console.error('Streak update error:', error);
        }
    }

    /**
     * Get daily statistics for a user
     */
    async getDailyStats(userId, date = null) {
        try {
            const targetDate = date ? new Date(date) : new Date();
            targetDate.setHours(0, 0, 0, 0);

            const activity = await prisma.dailyActivity.findUnique({
                where: {
                    userId_date: {
                        userId,
                        date: targetDate
                    }
                }
            });

            if (!activity) {
                return {
                    date: targetDate,
                    videosWatched: 0,
                    articlesRead: 0,
                    wordsLearned: 0,
                    wordsReviewed: 0,
                    gamesPlayed: 0,
                    quizzesCompleted: 0,
                    timeSpentMins: 0,
                    streakMaintained: false
                };
            }

            return activity;
        } catch (error) {
            console.error('Daily stats error:', error);
            return null;
        }
    }

    /**
     * Get weekly summary for a user
     */
    async getWeeklySummary(userId) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);

            const activities = await prisma.dailyActivity.findMany({
                where: {
                    userId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                orderBy: {
                    date: 'asc'
                }
            });

            // Aggregate stats
            const summary = {
                totalVideosWatched: 0,
                totalArticlesRead: 0,
                totalWordsLearned: 0,
                totalWordsReviewed: 0,
                totalGamesPlayed: 0,
                totalQuizzesCompleted: 0,
                totalTimeSpentMins: 0,
                activeDays: activities.length,
                dailyBreakdown: []
            };

            activities.forEach(activity => {
                summary.totalVideosWatched += activity.videosWatched;
                summary.totalArticlesRead += activity.articlesRead;
                summary.totalWordsLearned += activity.wordsLearned;
                summary.totalWordsReviewed += activity.wordsReviewed;
                summary.totalGamesPlayed += activity.gamesPlayed;
                summary.totalQuizzesCompleted += activity.quizzesCompleted;
                summary.totalTimeSpentMins += activity.timeSpentMins;
                
                summary.dailyBreakdown.push({
                    date: activity.date,
                    videosWatched: activity.videosWatched,
                    articlesRead: activity.articlesRead,
                    wordsLearned: activity.wordsLearned,
                    timeSpentMins: activity.timeSpentMins
                });
            });

            // Calculate averages
            summary.avgVideosPerDay = summary.activeDays > 0 ? summary.totalVideosWatched / summary.activeDays : 0;
            summary.avgArticlesPerDay = summary.activeDays > 0 ? summary.totalArticlesRead / summary.activeDays : 0;
            summary.avgTimePerDay = summary.activeDays > 0 ? summary.totalTimeSpentMins / summary.activeDays : 0;

            return summary;
        } catch (error) {
            console.error('Weekly summary error:', error);
            return null;
        }
    }

    /**
     * Get learning progress over time (for charts)
     */
    async getLearningProgress(userId, days = 30) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0);

            const activities = await prisma.dailyActivity.findMany({
                where: {
                    userId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                orderBy: {
                    date: 'asc'
                }
            });

            // Calculate cumulative words learned
            let cumulativeWords = 0;
            const progressData = activities.map(activity => {
                cumulativeWords += activity.wordsLearned;
                return {
                    date: activity.date,
                    wordsLearned: activity.wordsLearned,
                    cumulativeWords,
                    articlesRead: activity.articlesRead,
                    timeSpent: activity.timeSpentMins
                };
            });

            // Calculate learning velocity (words per week)
            const recentWeek = activities.slice(-7);
            const wordsLastWeek = recentWeek.reduce((sum, a) => sum + a.wordsLearned, 0);
            const previousWeek = activities.slice(-14, -7);
            const wordsPreviousWeek = previousWeek.reduce((sum, a) => sum + a.wordsLearned, 0);
            const weeklyChange = wordsPreviousWeek > 0 
                ? ((wordsLastWeek - wordsPreviousWeek) / wordsPreviousWeek) * 100 
                : 0;

            return {
                progressData,
                totalWordsLearned: cumulativeWords,
                wordsLastWeek,
                weeklyChange: Math.round(weeklyChange),
                averageWordsPerDay: activities.length > 0 ? cumulativeWords / activities.length : 0
            };
        } catch (error) {
            console.error('Learning progress error:', error);
            return null;
        }
    }

    /**
     * Get user interest breakdown
     */
    async getUserInterests(userId) {
        try {
            const interests = await prisma.userInterestCategory.findMany({
                where: { userId },
                orderBy: {
                    weight: 'desc'
                }
            });

            // Normalize weights to percentages
            const totalWeight = interests.reduce((sum, i) => sum + i.weight, 0);
            
            return interests.map(interest => ({
                category: interest.category,
                weight: interest.weight,
                percentage: totalWeight > 0 ? (interest.weight / totalWeight) * 100 : 0,
                lastUpdated: interest.lastUpdated
            }));
        } catch (error) {
            console.error('User interests error:', error);
            return [];
        }
    }

    /**
     * Generate insights and predictions
     */
    async generateInsights(userId) {
        try {
            const weeklyStats = await this.getWeeklySummary(userId);
            const progress = await this.getLearningProgress(userId, 30);
            const interests = await this.getUserInterests(userId);
            const user = await prisma.user.findUnique({ where: { id: userId } });

            if (!weeklyStats || !progress || !user) {
                return null;
            }

            const insights = [];
            const predictions = [];

            // Insight: Strongest area
            if (progress.weeklyChange > 0) {
                insights.push({
                    type: 'positive',
                    message: `You're strongest in vocabulary (+${progress.weeklyChange}% this week)`
                });
            }

            // Insight: Most engaged interest
            if (interests.length > 0) {
                const topInterest = interests[0];
                insights.push({
                    type: 'info',
                    message: `You're most interested in ${topInterest.category} (${Math.round(topInterest.percentage)}% of your time)`
                });
            }

            // Insight: Streak
            if (user.streak >= 7) {
                insights.push({
                    type: 'achievement',
                    message: `Amazing! ${user.streak} day streak 🔥`
                });
            }

            // Prediction: Level advancement
            const currentLevel = user.currentLevel || 'A2';
            const levelWords = {
                'A1': 500,
                'A2': 1000,
                'B1': 2000,
                'B2': 4000,
                'C1': 8000,
                'C2': 16000
            };
            
            const targetWords = levelWords[currentLevel] || 1000;
            const currentWords = progress.totalWordsLearned;
            const wordsNeeded = targetWords - currentWords;
            const avgWordsPerDay = progress.averageWordsPerDay;

            if (wordsNeeded > 0 && avgWordsPerDay > 0) {
                const daysToLevel = Math.ceil(wordsNeeded / avgWordsPerDay);
                const nextLevel = this.getNextLevel(currentLevel);
                
                predictions.push({
                    type: 'level',
                    message: `At this pace, ${nextLevel} level in ${daysToLevel} days`,
                    daysToLevel,
                    nextLevel
                });
            }

            // Prediction: Weekly goal
            if (weeklyStats.avgTimePerDay > 0) {
                const projectedWeeklyTime = weeklyStats.avgTimePerDay * 7;
                predictions.push({
                    type: 'time',
                    message: `Projected weekly study time: ${Math.round(projectedWeeklyTime)} minutes`,
                    projectedTime: Math.round(projectedWeeklyTime)
                });
            }

            return {
                insights,
                predictions,
                skillRadar: this.calculateSkillRadar(userId, weeklyStats, progress)
            };
        } catch (error) {
            console.error('Insights generation error:', error);
            return null;
        }
    }

    /**
     * Calculate skill radar data (vocab, grammar, reading, listening)
     */
    calculateSkillRadar(userId, weeklyStats, progress) {
        // Simplified skill calculation (can be enhanced with actual test scores)
        const vocabScore = Math.min(100, (progress.totalWordsLearned / 2000) * 100);
        const readingScore = Math.min(100, (weeklyStats.totalArticlesRead / 10) * 100);
        const listeningScore = Math.min(100, (weeklyStats.totalVideosWatched / 20) * 100);
        const grammarScore = Math.min(100, (weeklyStats.totalQuizzesCompleted / 20) * 100);

        return {
            vocabulary: Math.round(vocabScore),
            grammar: Math.round(grammarScore),
            reading: Math.round(readingScore),
            listening: Math.round(listeningScore)
        };
    }

    /**
     * Get next CEFR level
     */
    getNextLevel(currentLevel) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 'C2';
    }

    /**
     * Get content engagement history
     */
    async getContentEngagement(userId, contentType = null, days = 30) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const where = {
                userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            };

            if (contentType) {
                where.contentType = contentType;
            }

            const engagements = await prisma.contentEngagement.findMany({
                where,
                orderBy: {
                    createdAt: 'desc'
                },
                take: 100
            });

            // Group by action type
            const actionCounts = {};
            engagements.forEach(e => {
                actionCounts[e.action] = (actionCounts[e.action] || 0) + 1;
            });

            return {
                total: engagements.length,
                byAction: actionCounts,
                recentEngagements: engagements.slice(0, 20)
            };
        } catch (error) {
            console.error('Content engagement error:', error);
            return null;
        }
    }
}

module.exports = AnalyticsEngine;


