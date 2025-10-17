/**
 * 📊 ANALYTICS SYSTEM
 * 
 * Track user engagement, learning effectiveness, and content performance
 */

const { PrismaClient } = require('@prisma/client');
const { cache } = require('./cache-system');

const prisma = new PrismaClient();

class AnalyticsSystem {
    constructor() {
        this.events = [];
        this.flushInterval = 60000; // Flush every minute
        
        // Start auto-flush
        setInterval(() => this.flushEvents(), this.flushInterval);
    }

    /**
     * Track event
     * @param {string} userId - User ID
     * @param {string} event - Event name
     * @param {Object} properties - Event properties
     */
    async trackEvent(userId, event, properties = {}) {
        try {
            const eventData = {
                userId,
                event,
                properties: JSON.stringify(properties),
                timestamp: new Date()
            };

            // Add to buffer
            this.events.push(eventData);

            // Flush if buffer is full
            if (this.events.length >= 100) {
                await this.flushEvents();
            }

            return { success: true };

        } catch (error) {
            console.error('Analytics track error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Flush buffered events to database
     */
    async flushEvents() {
        if (this.events.length === 0) return;

        try {
            const events = [...this.events];
            this.events = [];

            // Batch insert
            await prisma.userInteraction.createMany({
                data: events.map(e => ({
                    userId: e.userId,
                    type: e.event,
                    metadata: e.properties,
                    createdAt: e.timestamp
                }))
            });

            console.log(`📊 Flushed ${events.length} analytics events`);

        } catch (error) {
            console.error('Analytics flush error:', error);
        }
    }

    /**
     * Get user engagement metrics
     * @param {string} userId - User ID
     * @param {number} days - Number of days to analyze
     * @returns {Object} Engagement metrics
     */
    async getUserEngagement(userId, days = 30) {
        try {
            const cacheKey = `analytics:engagement:${userId}:${days}`;
            const cached = await cache.get(cacheKey);
            
            if (cached) return cached;

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            // Get all interactions
            const interactions = await prisma.userInteraction.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: startDate
                    }
                }
            });

            // Calculate metrics
            const metrics = {
                totalInteractions: interactions.length,
                dailyAverage: (interactions.length / days).toFixed(1),
                contentTypes: {},
                hourlyDistribution: Array(24).fill(0),
                dayOfWeekDistribution: Array(7).fill(0),
                streak: await this.calculateStreak(userId)
            };

            // Count by content type
            for (const interaction of interactions) {
                const type = interaction.type;
                metrics.contentTypes[type] = (metrics.contentTypes[type] || 0) + 1;

                // Hour distribution
                const hour = new Date(interaction.createdAt).getHours();
                metrics.hourlyDistribution[hour]++;

                // Day of week distribution
                const dayOfWeek = new Date(interaction.createdAt).getDay();
                metrics.dayOfWeekDistribution[dayOfWeek]++;
            }

            // Cache for 1 hour
            await cache.set(cacheKey, metrics, 3600);

            return metrics;

        } catch (error) {
            console.error('User engagement error:', error);
            return null;
        }
    }

    /**
     * Get learning effectiveness metrics
     * @param {string} userId - User ID
     * @returns {Object} Learning metrics
     */
    async getLearningEffectiveness(userId) {
        try {
            const cacheKey = `analytics:learning:${userId}`;
            const cached = await cache.get(cacheKey);
            
            if (cached) return cached;

            // Get vocabulary stats
            const totalWords = await prisma.word.count({
                where: { userId, saved: true }
            });

            const masteredWords = await prisma.word.count({
                where: { userId, mastered: true }
            });

            const learningWords = await prisma.word.count({
                where: { userId, saved: true, mastered: false }
            });

            // Get review stats
            const recentReviews = await prisma.reviewSession.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 100
            });

            const averageQuality = recentReviews.length > 0
                ? recentReviews.reduce((sum, r) => sum + r.quality, 0) / recentReviews.length
                : 0;

            const retentionRate = recentReviews.filter(r => r.quality >= 3).length / recentReviews.length * 100;

            // Calculate learning velocity
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const wordsLearnedThisWeek = await prisma.word.count({
                where: {
                    userId,
                    saved: true,
                    savedAt: { gte: oneWeekAgo }
                }
            });

            const metrics = {
                totalWords,
                masteredWords,
                learningWords,
                masteryRate: (masteredWords / Math.max(totalWords, 1) * 100).toFixed(1),
                averageQuality: averageQuality.toFixed(2),
                retentionRate: retentionRate.toFixed(1),
                wordsPerWeek: wordsLearnedThisWeek,
                totalReviews: recentReviews.length
            };

            // Cache for 30 minutes
            await cache.set(cacheKey, metrics, 1800);

            return metrics;

        } catch (error) {
            console.error('Learning effectiveness error:', error);
            return null;
        }
    }

    /**
     * Get content performance metrics
     * @param {string} contentType - Content type
     * @param {string} contentId - Content ID
     * @returns {Object} Content metrics
     */
    async getContentPerformance(contentType, contentId) {
        try {
            const cacheKey = `analytics:content:${contentType}:${contentId}`;
            const cached = await cache.get(cacheKey);
            
            if (cached) return cached;

            const interactions = await prisma.userInteraction.findMany({
                where: {
                    type: `${contentType}_view`,
                    contentId
                }
            });

            const completed = interactions.filter(i => i.completed).length;
            const totalTime = interactions.reduce((sum, i) => sum + (i.timeSpent || 0), 0);

            const metrics = {
                totalViews: interactions.length,
                uniqueUsers: new Set(interactions.map(i => i.userId)).size,
                completionRate: (completed / Math.max(interactions.length, 1) * 100).toFixed(1),
                averageTime: interactions.length > 0 ? (totalTime / interactions.length).toFixed(0) : 0,
                totalTimeSpent: totalTime
            };

            // Cache for 5 minutes
            await cache.set(cacheKey, metrics, 300);

            return metrics;

        } catch (error) {
            console.error('Content performance error:', error);
            return null;
        }
    }

    /**
     * Get system-wide metrics
     * @returns {Object} System metrics
     */
    async getSystemMetrics() {
        try {
            const cacheKey = 'analytics:system';
            const cached = await cache.get(cacheKey);
            
            if (cached) return cached;

            const totalUsers = await prisma.user.count();
            const activeUsers30d = await prisma.user.count({
                where: {
                    lastActivity: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            });

            const totalWords = await prisma.word.count();
            const totalReviews = await prisma.reviewSession.count();

            const metrics = {
                totalUsers,
                activeUsers30d,
                activeRate: (activeUsers30d / Math.max(totalUsers, 1) * 100).toFixed(1),
                totalWords,
                totalReviews,
                avgWordsPerUser: (totalWords / Math.max(totalUsers, 1)).toFixed(0)
            };

            // Cache for 10 minutes
            await cache.set(cacheKey, metrics, 600);

            return metrics;

        } catch (error) {
            console.error('System metrics error:', error);
            return null;
        }
    }

    /**
     * Calculate user streak
     * @param {string} userId - User ID
     * @returns {number} Current streak in days
     */
    async calculateStreak(userId) {
        try {
            const interactions = await prisma.userInteraction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 365
            });

            if (interactions.length === 0) return 0;

            // Group by day
            const daySet = new Set();
            interactions.forEach(i => {
                const day = new Date(i.createdAt);
                day.setHours(0, 0, 0, 0);
                daySet.add(day.getTime());
            });

            const days = Array.from(daySet).sort((a, b) => b - a);

            // Calculate streak
            let streak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let currentDay = today.getTime();

            for (const day of days) {
                if (day === currentDay || day === currentDay - 86400000) {
                    streak++;
                    currentDay = day - 86400000;
                } else {
                    break;
                }
            }

            return streak;

        } catch (error) {
            console.error('Streak calculation error:', error);
            return 0;
        }
    }

    /**
     * Get funnel metrics (user journey)
     * @returns {Object} Funnel data
     */
    async getFunnelMetrics() {
        try {
            const registered = await prisma.user.count();
            const verified = await prisma.user.count({ where: { verified: true } });
            const savedWords = await prisma.user.count({
                where: {
                    words: {
                        some: { saved: true }
                    }
                }
            });
            const completedReviews = await prisma.user.count({
                where: {
                    words: {
                        some: { reviewCount: { gte: 1 } }
                    }
                }
            });
            const mastered = await prisma.user.count({
                where: {
                    words: {
                        some: { mastered: true }
                    }
                }
            });

            return {
                registered,
                verified,
                savedWords,
                completedReviews,
                mastered,
                conversionRates: {
                    verificationRate: (verified / Math.max(registered, 1) * 100).toFixed(1),
                    savingRate: (savedWords / Math.max(verified, 1) * 100).toFixed(1),
                    reviewRate: (completedReviews / Math.max(savedWords, 1) * 100).toFixed(1),
                    masteryRate: (mastered / Math.max(completedReviews, 1) * 100).toFixed(1)
                }
            };

        } catch (error) {
            console.error('Funnel metrics error:', error);
            return null;
        }
    }
}

module.exports = new AnalyticsSystem();

