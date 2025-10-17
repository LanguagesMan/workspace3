/**
 * 📊 PERSONALIZATION SIGNALS TRACKER
 * Tracks detailed user behavior patterns for feed personalization
 * - Time spent per content type
 * - Skip/like/save/replay patterns
 * - Word lookup frequency
 * - Quiz/game performance
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PersonalizationSignalsTracker {
    constructor() {
        // In-memory buffer for real-time tracking
        this.signalBuffer = new Map(); // userId -> signals[]
        this.flushInterval = 10000; // Flush every 10 seconds
        this.startAutoFlush();
    }

    /**
     * Track time spent on content
     */
    async trackTimeSpent(userId, contentId, contentType, timeSpent, totalDuration) {
        const signal = {
            type: 'time_spent',
            userId,
            contentId,
            contentType,
            timeSpent,
            totalDuration,
            completionRate: totalDuration ? (timeSpent / totalDuration) * 100 : null,
            timestamp: Date.now()
        };

        this.addToBuffer(userId, signal);

        // Immediate analysis for real-time adaptation
        return this.analyzeTimeSpentSignal(signal);
    }

    /**
     * Track skip action
     */
    async trackSkip(userId, contentId, contentType, skipPosition, totalDuration) {
        const signal = {
            type: 'skip',
            userId,
            contentId,
            contentType,
            skipPosition,
            totalDuration,
            skipPercentage: totalDuration ? (skipPosition / totalDuration) * 100 : null,
            timestamp: Date.now()
        };

        this.addToBuffer(userId, signal);

        // Create interaction record
        await prisma.userInteraction.create({
            data: {
                userId,
                type: 'content_skipped',
                contentId: `${contentType}_${contentId}`,
                timeSpent: skipPosition,
                completed: false,
                metadata: JSON.stringify({
                    contentType,
                    skipPercentage: signal.skipPercentage
                })
            }
        }).catch(err => console.error('Failed to track skip:', err));

        return this.analyzeSkipPattern(userId, signal);
    }

    /**
     * Track like/save action
     */
    async trackEngagement(userId, contentId, contentType, action) {
        const signal = {
            type: action, // 'like', 'save', 'share'
            userId,
            contentId,
            contentType,
            timestamp: Date.now()
        };

        this.addToBuffer(userId, signal);

        // Create interaction record
        await prisma.userInteraction.create({
            data: {
                userId,
                type: `content_${action}`,
                contentId: `${contentType}_${contentId}`,
                completed: true,
                metadata: JSON.stringify({ contentType })
            }
        }).catch(err => console.error(`Failed to track ${action}:`, err));

        // Update interest weights based on engagement
        await this.updateInterestsFromEngagement(userId, contentId, contentType, action);

        return { success: true, signal };
    }

    /**
     * Track replay/rewind action
     */
    async trackReplay(userId, contentId, contentType, position) {
        const signal = {
            type: 'replay',
            userId,
            contentId,
            contentType,
            position,
            timestamp: Date.now()
        };

        this.addToBuffer(userId, signal);

        return this.analyzeReplaySignal(signal);
    }

    /**
     * Track word lookup
     */
    async trackWordLookup(userId, word, context, contentId) {
        const signal = {
            type: 'word_lookup',
            userId,
            word,
            context,
            contentId,
            timestamp: Date.now()
        };

        this.addToBuffer(userId, signal);

        // Track in database
        await prisma.userInteraction.create({
            data: {
                userId,
                type: 'word_click',
                contentId: word,
                metadata: JSON.stringify({ context, sourceContentId: contentId })
            }
        }).catch(err => console.error('Failed to track word lookup:', err));

        return this.analyzeWordLookupPattern(userId, word);
    }

    /**
     * Track quiz/game performance
     */
    async trackPerformance(userId, activityType, activityId, score, maxScore, difficulty) {
        const signal = {
            type: 'performance',
            userId,
            activityType,
            activityId,
            score,
            maxScore,
            percentage: (score / maxScore) * 100,
            difficulty,
            timestamp: Date.now()
        };

        this.addToBuffer(userId, signal);

        // Track in database
        await prisma.userInteraction.create({
            data: {
                userId,
                type: `${activityType}_completed`,
                contentId: activityId,
                difficulty,
                correct: score >= maxScore * 0.7,
                completed: true,
                metadata: JSON.stringify({ score, maxScore, percentage: signal.percentage })
            }
        }).catch(err => console.error('Failed to track performance:', err));

        return this.analyzePerformanceSignal(signal);
    }

    /**
     * Track content rating (too hard / too easy / just right)
     */
    async trackContentRating(userId, contentId, contentType, rating) {
        const signal = {
            type: 'content_rating',
            userId,
            contentId,
            contentType,
            rating, // 'too_hard', 'too_easy', 'just_right'
            timestamp: Date.now()
        };

        this.addToBuffer(userId, signal);

        // Track in database
        await prisma.userInteraction.create({
            data: {
                userId,
                type: `content_rated_${rating}`,
                contentId: `${contentType}_${contentId}`,
                metadata: JSON.stringify({ contentType, rating })
            }
        }).catch(err => console.error('Failed to track rating:', err));

        return this.analyzeDifficultyFeedback(userId, rating);
    }

    /**
     * Get comprehensive personalization profile
     */
    async getPersonalizationProfile(userId) {
        try {
            // Get signals from last 30 days
            const last30Days = new Date();
            last30Days.setDate(last30Days.getDate() - 30);

            const interactions = await prisma.userInteraction.findMany({
                where: {
                    userId,
                    createdAt: { gte: last30Days }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Analyze patterns
            const profile = {
                userId,
                totalSignals: interactions.length,
                
                // Time spent patterns
                timeSpent: this.analyzeTimeSpentPatterns(interactions),
                
                // Engagement patterns
                engagement: this.analyzeEngagementPatterns(interactions),
                
                // Skip patterns
                skipBehavior: this.analyzeSkipBehavior(interactions),
                
                // Word lookup patterns
                wordLookups: this.analyzeWordLookupBehavior(interactions),
                
                // Performance patterns
                performance: this.analyzePerformanceTrends(interactions),
                
                // Content preferences
                contentPreferences: this.analyzeContentPreferences(interactions),
                
                // Difficulty signals
                difficultySignals: this.analyzeDifficultySignals(interactions),
                
                // Session patterns
                sessionPatterns: this.analyzeSessionPatterns(interactions)
            };

            return profile;
        } catch (error) {
            console.error('Error getting personalization profile:', error);
            return null;
        }
    }

    /**
     * Analyze time spent patterns
     */
    analyzeTimeSpentPatterns(interactions) {
        const timeSpentByType = {};
        const completionRates = {};

        for (const interaction of interactions) {
            if (!interaction.timeSpent) continue;

            try {
                const metadata = JSON.parse(interaction.metadata || '{}');
                const contentType = metadata.contentType || 'unknown';

                if (!timeSpentByType[contentType]) {
                    timeSpentByType[contentType] = { total: 0, count: 0, avg: 0 };
                }

                timeSpentByType[contentType].total += interaction.timeSpent;
                timeSpentByType[contentType].count += 1;

                if (interaction.completed) {
                    completionRates[contentType] = (completionRates[contentType] || 0) + 1;
                }
            } catch (e) {
                // Skip malformed metadata
            }
        }

        // Calculate averages
        for (const type in timeSpentByType) {
            const data = timeSpentByType[type];
            data.avg = data.total / data.count;
            data.completionRate = (completionRates[type] || 0) / data.count * 100;
        }

        return timeSpentByType;
    }

    /**
     * Analyze engagement patterns
     */
    analyzeEngagementPatterns(interactions) {
        const patterns = {
            likes: 0,
            saves: 0,
            shares: 0,
            total: interactions.length,
            likeRate: 0,
            saveRate: 0,
            shareRate: 0,
            favoriteTopics: {},
            favoriteTypes: {}
        };

        for (const interaction of interactions) {
            if (interaction.type === 'content_liked') patterns.likes++;
            if (interaction.type === 'content_saved') patterns.saves++;
            if (interaction.type === 'content_shared') patterns.shares++;

            try {
                const metadata = JSON.parse(interaction.metadata || '{}');
                if (interaction.type.includes('liked') || interaction.type.includes('saved')) {
                    const topics = metadata.topics || [];
                    const contentType = metadata.contentType;

                    topics.forEach(topic => {
                        patterns.favoriteTopics[topic] = (patterns.favoriteTopics[topic] || 0) + 1;
                    });

                    if (contentType) {
                        patterns.favoriteTypes[contentType] = (patterns.favoriteTypes[contentType] || 0) + 1;
                    }
                }
            } catch (e) {
                // Skip malformed metadata
            }
        }

        patterns.likeRate = (patterns.likes / patterns.total) * 100;
        patterns.saveRate = (patterns.saves / patterns.total) * 100;
        patterns.shareRate = (patterns.shares / patterns.total) * 100;

        return patterns;
    }

    /**
     * Analyze skip behavior
     */
    analyzeSkipBehavior(interactions) {
        const skips = interactions.filter(i => i.type === 'content_skipped');
        
        const analysis = {
            totalSkips: skips.length,
            skipRate: (skips.length / interactions.length) * 100,
            skipReasons: {},
            skipByType: {},
            avgSkipPosition: 0
        };

        let totalSkipPosition = 0;

        for (const skip of skips) {
            try {
                const metadata = JSON.parse(skip.metadata || '{}');
                const contentType = metadata.contentType || 'unknown';
                const skipPercentage = metadata.skipPercentage || 0;

                analysis.skipByType[contentType] = (analysis.skipByType[contentType] || 0) + 1;
                totalSkipPosition += skipPercentage;
            } catch (e) {
                // Skip malformed metadata
            }
        }

        analysis.avgSkipPosition = skips.length > 0 ? totalSkipPosition / skips.length : 0;

        return analysis;
    }

    /**
     * Analyze word lookup behavior
     */
    analyzeWordLookupBehavior(interactions) {
        const lookups = interactions.filter(i => i.type === 'word_click');
        
        const analysis = {
            totalLookups: lookups.length,
            uniqueWords: new Set(lookups.map(l => l.contentId)).size,
            lookupsPerContent: lookups.length / Math.max(1, interactions.length),
            frequentWords: {},
            lookupTrend: 'stable'
        };

        // Count word frequencies
        for (const lookup of lookups) {
            const word = lookup.contentId;
            analysis.frequentWords[word] = (analysis.frequentWords[word] || 0) + 1;
        }

        // Analyze trend (increasing/decreasing lookups over time)
        const recent = lookups.slice(-50);
        const older = lookups.slice(0, 50);

        if (recent.length > 0 && older.length > 0) {
            const recentRate = recent.length / 50;
            const olderRate = older.length / 50;

            if (recentRate > olderRate * 1.2) {
                analysis.lookupTrend = 'increasing'; // Struggling more
            } else if (recentRate < olderRate * 0.8) {
                analysis.lookupTrend = 'decreasing'; // Improving
            }
        }

        return analysis;
    }

    /**
     * Analyze performance trends
     */
    analyzePerformanceTrends(interactions) {
        const performances = interactions.filter(i => 
            i.type.includes('quiz') || i.type.includes('game')
        );

        const analysis = {
            totalActivities: performances.length,
            avgScore: 0,
            scoresByDifficulty: {},
            trend: 'stable',
            recentAvg: 0,
            overallAvg: 0
        };

        let totalScore = 0;
        let scoreCount = 0;

        for (const perf of performances) {
            try {
                const metadata = JSON.parse(perf.metadata || '{}');
                const percentage = metadata.percentage || 0;
                const difficulty = perf.difficulty || 'unknown';

                if (!analysis.scoresByDifficulty[difficulty]) {
                    analysis.scoresByDifficulty[difficulty] = { total: 0, count: 0, avg: 0 };
                }

                analysis.scoresByDifficulty[difficulty].total += percentage;
                analysis.scoresByDifficulty[difficulty].count += 1;
                
                totalScore += percentage;
                scoreCount += 1;
            } catch (e) {
                // Skip malformed metadata
            }
        }

        analysis.avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;

        // Calculate averages by difficulty
        for (const diff in analysis.scoresByDifficulty) {
            const data = analysis.scoresByDifficulty[diff];
            data.avg = data.total / data.count;
        }

        // Analyze trend
        const recent = performances.slice(-10);
        const older = performances.slice(0, 10);

        if (recent.length > 0 && older.length > 0) {
            const recentScores = recent.map(p => {
                try {
                    return JSON.parse(p.metadata || '{}').percentage || 0;
                } catch {
                    return 0;
                }
            });
            const olderScores = older.map(p => {
                try {
                    return JSON.parse(p.metadata || '{}').percentage || 0;
                } catch {
                    return 0;
                }
            });

            analysis.recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
            analysis.overallAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

            if (analysis.recentAvg > analysis.overallAvg + 10) {
                analysis.trend = 'improving';
            } else if (analysis.recentAvg < analysis.overallAvg - 10) {
                analysis.trend = 'declining';
            }
        }

        return analysis;
    }

    /**
     * Analyze content preferences
     */
    analyzeContentPreferences(interactions) {
        const preferences = {
            byType: {},
            byDifficulty: {},
            byTopic: {},
            preferredContentTypes: [],
            preferredDifficulty: null
        };

        for (const interaction of interactions) {
            try {
                const metadata = JSON.parse(interaction.metadata || '{}');
                const contentType = metadata.contentType || 'unknown';
                const difficulty = interaction.difficulty;

                // Count by type
                if (!preferences.byType[contentType]) {
                    preferences.byType[contentType] = { views: 0, completions: 0, likes: 0 };
                }
                preferences.byType[contentType].views += 1;
                if (interaction.completed) preferences.byType[contentType].completions += 1;
                if (interaction.type === 'content_liked') preferences.byType[contentType].likes += 1;

                // Count by difficulty
                if (difficulty) {
                    if (!preferences.byDifficulty[difficulty]) {
                        preferences.byDifficulty[difficulty] = { views: 0, completions: 0 };
                    }
                    preferences.byDifficulty[difficulty].views += 1;
                    if (interaction.completed) preferences.byDifficulty[difficulty].completions += 1;
                }

                // Count by topic
                const topics = metadata.topics || [];
                topics.forEach(topic => {
                    preferences.byTopic[topic] = (preferences.byTopic[topic] || 0) + 1;
                });
            } catch (e) {
                // Skip malformed metadata
            }
        }

        // Determine preferred content types
        const typeScores = Object.entries(preferences.byType)
            .map(([type, data]) => ({
                type,
                score: (data.likes * 3) + (data.completions * 2) + data.views
            }))
            .sort((a, b) => b.score - a.score);

        preferences.preferredContentTypes = typeScores.slice(0, 3).map(t => t.type);

        // Determine preferred difficulty
        const difficultyScores = Object.entries(preferences.byDifficulty)
            .map(([diff, data]) => ({
                difficulty: diff,
                completionRate: data.completions / data.views
            }))
            .sort((a, b) => b.completionRate - a.completionRate);

        preferences.preferredDifficulty = difficultyScores[0]?.difficulty || null;

        return preferences;
    }

    /**
     * Analyze difficulty signals
     */
    analyzeDifficultySignals(interactions) {
        const signals = {
            tooHard: 0,
            tooEasy: 0,
            justRight: 0,
            suggestion: 'maintain'
        };

        for (const interaction of interactions) {
            if (interaction.type.includes('too_hard')) signals.tooHard++;
            if (interaction.type.includes('too_easy')) signals.tooEasy++;
            if (interaction.type.includes('just_right')) signals.justRight++;
        }

        // Determine suggestion
        if (signals.tooHard > signals.tooEasy * 2) {
            signals.suggestion = 'decrease_difficulty';
        } else if (signals.tooEasy > signals.tooHard * 2) {
            signals.suggestion = 'increase_difficulty';
        }

        return signals;
    }

    /**
     * Analyze session patterns
     */
    analyzeSessionPatterns(interactions) {
        // Group interactions by session (within 1 hour)
        const sessions = [];
        let currentSession = null;

        for (const interaction of interactions) {
            if (!currentSession || 
                (new Date(interaction.createdAt) - currentSession.end) > 3600000) {
                // New session
                if (currentSession) sessions.push(currentSession);
                currentSession = {
                    start: new Date(interaction.createdAt),
                    end: new Date(interaction.createdAt),
                    interactions: [interaction]
                };
            } else {
                // Same session
                currentSession.end = new Date(interaction.createdAt);
                currentSession.interactions.push(interaction);
            }
        }

        if (currentSession) sessions.push(currentSession);

        const analysis = {
            totalSessions: sessions.length,
            avgSessionLength: 0,
            avgInteractionsPerSession: 0,
            preferredTimeOfDay: {},
            sessionQuality: 0
        };

        let totalDuration = 0;
        let totalInteractions = 0;

        for (const session of sessions) {
            const duration = (session.end - session.start) / 1000; // seconds
            totalDuration += duration;
            totalInteractions += session.interactions.length;

            // Track time of day
            const hour = session.start.getHours();
            let timeOfDay = 'night';
            if (hour >= 6 && hour < 12) timeOfDay = 'morning';
            else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
            else if (hour >= 18 && hour < 22) timeOfDay = 'evening';

            analysis.preferredTimeOfDay[timeOfDay] = (analysis.preferredTimeOfDay[timeOfDay] || 0) + 1;
        }

        analysis.avgSessionLength = sessions.length > 0 ? totalDuration / sessions.length : 0;
        analysis.avgInteractionsPerSession = sessions.length > 0 ? totalInteractions / sessions.length : 0;

        // Session quality: engagement rate
        const completedCount = interactions.filter(i => i.completed).length;
        analysis.sessionQuality = (completedCount / interactions.length) * 100;

        return analysis;
    }

    /**
     * Helper methods for real-time analysis
     */
    analyzeTimeSpentSignal(signal) {
        const completionRate = signal.completionRate || 0;
        
        let interpretation = 'normal';
        let recommendation = null;

        if (completionRate < 20) {
            interpretation = 'abandoned_early';
            recommendation = 'decrease_difficulty';
        } else if (completionRate > 95) {
            interpretation = 'fully_engaged';
            recommendation = 'maintain_or_increase';
        } else if (completionRate > 70) {
            interpretation = 'good_engagement';
        } else {
            interpretation = 'partial_engagement';
        }

        return { interpretation, recommendation, completionRate };
    }

    analyzeSkipPattern(userId, signal) {
        // Get recent skip history
        const userSignals = this.signalBuffer.get(userId) || [];
        const recentSkips = userSignals.filter(s => s.type === 'skip').slice(-5);

        const skipRate = recentSkips.length / Math.min(5, userSignals.length) * 100;

        let interpretation = 'normal';
        let urgency = 'low';

        if (skipRate > 60) {
            interpretation = 'high_skip_rate';
            urgency = 'high';
        } else if (skipRate > 40) {
            interpretation = 'elevated_skip_rate';
            urgency = 'medium';
        }

        return { interpretation, urgency, skipRate };
    }

    analyzeReplaySignal(signal) {
        return {
            interpretation: 'engaged_learning',
            recommendation: 'content_is_valuable'
        };
    }

    analyzeWordLookupPattern(userId, word) {
        const userSignals = this.signalBuffer.get(userId) || [];
        const wordLookups = userSignals.filter(s => s.type === 'word_lookup');
        const thisWordLookups = wordLookups.filter(s => s.word === word);

        return {
            isNewWord: thisWordLookups.length === 0,
            lookupCount: thisWordLookups.length,
            totalLookups: wordLookups.length
        };
    }

    analyzePerformanceSignal(signal) {
        const percentage = signal.percentage;
        
        let interpretation = 'good';
        let recommendation = null;

        if (percentage > 85) {
            interpretation = 'excellent';
            recommendation = 'increase_difficulty';
        } else if (percentage < 50) {
            interpretation = 'struggling';
            recommendation = 'decrease_difficulty';
        }

        return { interpretation, recommendation, percentage };
    }

    analyzeDifficultyFeedback(userId, rating) {
        const userSignals = this.signalBuffer.get(userId) || [];
        const ratings = userSignals.filter(s => s.type === 'content_rating').slice(-5);

        const tooHardCount = ratings.filter(s => s.rating === 'too_hard').length;
        const tooEasyCount = ratings.filter(s => s.rating === 'too_easy').length;

        let urgency = 'low';
        if (tooHardCount >= 3 || tooEasyCount >= 3) {
            urgency = 'high';
        }

        return { urgency, recentFeedback: { tooHard: tooHardCount, tooEasy: tooEasyCount } };
    }

    /**
     * Update interests from engagement
     */
    async updateInterestsFromEngagement(userId, contentId, contentType, action) {
        try {
            // Fetch content to get topics
            let topics = [];

            // This would need to be expanded based on content type
            // For now, simplified

            const boost = action === 'like' ? 0.3 : action === 'save' ? 0.2 : 0.1;

            for (const topic of topics) {
                await prisma.userInterest.upsert({
                    where: {
                        userId_interest: { userId, interest: topic }
                    },
                    create: {
                        userId,
                        interest: topic,
                        weight: boost
                    },
                    update: {
                        weight: { increment: boost }
                    }
                });
            }
        } catch (error) {
            console.error('Error updating interests from engagement:', error);
        }
    }

    /**
     * Buffer management
     */
    addToBuffer(userId, signal) {
        if (!this.signalBuffer.has(userId)) {
            this.signalBuffer.set(userId, []);
        }
        const buffer = this.signalBuffer.get(userId);
        buffer.push(signal);

        // Keep buffer limited to last 100 signals
        if (buffer.length > 100) {
            buffer.shift();
        }
    }

    startAutoFlush() {
        setInterval(() => {
            this.flushBuffers();
        }, this.flushInterval);
    }

    async flushBuffers() {
        // Periodically process buffered signals
        // For now, just log size
        const totalSignals = Array.from(this.signalBuffer.values())
            .reduce((sum, signals) => sum + signals.length, 0);
        
        if (totalSignals > 0) {
            console.log(`📊 Signal buffer: ${totalSignals} signals across ${this.signalBuffer.size} users`);
        }
    }
}

// Export singleton
const personalizationSignalsTracker = new PersonalizationSignalsTracker();
module.exports = personalizationSignalsTracker;


