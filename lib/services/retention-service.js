// 🔥 RETENTION SERVICE - Streak System, Milestones, Push Notifications
// Comprehensive retention features to boost Day 7 & Day 30 retention

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class RetentionService {
    constructor() {
        this.milestones = this.defineMilestones();
    }

    /**
     * Define all available milestones
     */
    defineMilestones() {
        return [
            // Videos Watched
            { type: 'videos_watched', threshold: 10, title: 'Video Rookie', description: 'Watched 10 videos', icon: '🎬', xpReward: 50 },
            { type: 'videos_watched', threshold: 50, title: 'Cinema Fan', description: 'Watched 50 videos', icon: '🎥', xpReward: 200 },
            { type: 'videos_watched', threshold: 100, title: 'Binge Master', description: 'Watched 100 videos', icon: '🍿', xpReward: 500 },
            { type: 'videos_watched', threshold: 500, title: 'Video Legend', description: 'Watched 500 videos', icon: '⭐', xpReward: 2000 },

            // Words Learned
            { type: 'words_learned', threshold: 10, title: 'Word Explorer', description: 'Learned 10 words', icon: '📝', xpReward: 50 },
            { type: 'words_learned', threshold: 50, title: 'Vocabulary Builder', description: 'Learned 50 words', icon: '📚', xpReward: 200 },
            { type: 'words_learned', threshold: 100, title: 'Word Collector', description: 'Learned 100 words', icon: '🎯', xpReward: 500 },
            { type: 'words_learned', threshold: 500, title: 'Polyglot', description: 'Learned 500 words', icon: '🌍', xpReward: 2000 },

            // Streak Days
            { type: 'streak_days', threshold: 3, title: '3-Day Streak', description: 'Learned 3 days in a row', icon: '🔥', xpReward: 30 },
            { type: 'streak_days', threshold: 7, title: '1-Week Streak', description: 'Learned 7 days in a row', icon: '🔥🔥', xpReward: 100 },
            { type: 'streak_days', threshold: 30, title: '1-Month Streak', description: 'Learned 30 days in a row', icon: '🔥🔥🔥', xpReward: 500 },
            { type: 'streak_days', threshold: 100, title: '100-Day Streak', description: 'Learned 100 days in a row', icon: '💎', xpReward: 2000 },
            { type: 'streak_days', threshold: 365, title: '1-Year Streak', description: 'Learned every day for a year!', icon: '👑', xpReward: 10000 },

            // Games Completed
            { type: 'games_completed', threshold: 10, title: 'Game Beginner', description: 'Completed 10 games', icon: '🎮', xpReward: 50 },
            { type: 'games_completed', threshold: 50, title: 'Game Enthusiast', description: 'Completed 50 games', icon: '🎯', xpReward: 200 },
            { type: 'games_completed', threshold: 100, title: 'Game Master', description: 'Completed 100 games', icon: '🏆', xpReward: 500 },

            // Special Achievements
            { type: 'first_perfect_game', threshold: 1, title: 'Perfect Score!', description: 'Got 100% on a game', icon: '💯', xpReward: 100 },
            { type: 'morning_learner', threshold: 10, title: 'Early Bird', description: 'Learned before 8 AM, 10 times', icon: '🌅', xpReward: 200 },
            { type: 'night_owl', threshold: 10, title: 'Night Owl', description: 'Learned after 10 PM, 10 times', icon: '🌙', xpReward: 200 },
        ];
    }

    /**
     * Update user streak (called daily when user completes an activity)
     */
    async updateStreak(userId, activityType = 'general') {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new Error('User not found');
            }

            const now = new Date();
            const today = this.getDateString(now);
            const yesterday = this.getDateString(this.addDays(now, -1));
            const lastActivityDate = this.getDateString(new Date(user.lastActivity));

            let newStreak = user.streak;
            let streakMaintained = false;

            // Check if activity already logged today
            const todayActivity = await prisma.streakHistory.findUnique({
                where: {
                    userId_date: {
                        userId,
                        date: new Date(today)
                    }
                }
            });

            if (todayActivity) {
                // Already logged today, just increment activity count
                await prisma.streakHistory.update({
                    where: { id: todayActivity.id },
                    data: {
                        activityCount: todayActivity.activityCount + 1,
                        activityType
                    }
                });

                return {
                    streak: user.streak,
                    streakChanged: false,
                    message: 'Activity logged, streak already maintained today'
                };
            }

            // Determine new streak
            if (lastActivityDate === today) {
                // Already active today (shouldn't happen due to check above, but just in case)
                streakMaintained = true;
            } else if (lastActivityDate === yesterday) {
                // Continuing streak
                newStreak += 1;
                streakMaintained = true;
            } else {
                // Streak broken, reset to 1
                newStreak = 1;
                streakMaintained = false;
            }

            // Update longest streak if needed
            const newLongestStreak = Math.max(user.longestStreak, newStreak);

            // Update user
            await prisma.user.update({
                where: { id: userId },
                data: {
                    streak: newStreak,
                    longestStreak: newLongestStreak,
                    lastActivity: now
                }
            });

            // Log streak history
            await prisma.streakHistory.create({
                data: {
                    userId,
                    date: new Date(today),
                    streakCount: newStreak,
                    activityType,
                    activityCount: 1
                }
            });

            // Check for streak milestones
            await this.checkStreakMilestones(userId, newStreak);

            // Send celebration notification for milestone streaks
            if ([3, 7, 14, 30, 50, 100, 365].includes(newStreak)) {
                await this.sendStreakCelebration(userId, newStreak);
            }

            return {
                streak: newStreak,
                longestStreak: newLongestStreak,
                streakChanged: true,
                streakMaintained,
                message: streakMaintained ? 
                    `Streak maintained! ${newStreak} days 🔥` : 
                    'Streak started fresh! 🎯'
            };

        } catch (error) {
            console.error('Error updating streak:', error);
            throw error;
        }
    }

    /**
     * Check if user's streak is about to break
     */
    async checkStreakWarning(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user || user.streak === 0) {
                return { needsWarning: false };
            }

            const now = new Date();
            const lastActivity = new Date(user.lastActivity);
            const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);

            // Send warning if:
            // 1. User has a streak of 3+ days
            // 2. It's been 20+ hours since last activity
            // 3. Haven't completed activity today
            if (user.streak >= 3 && hoursSinceActivity >= 20) {
                const today = this.getDateString(now);
                const todayActivity = await prisma.streakHistory.findUnique({
                    where: {
                        userId_date: {
                            userId,
                            date: new Date(today)
                        }
                    }
                });

                if (!todayActivity) {
                    return {
                        needsWarning: true,
                        streak: user.streak,
                        hoursRemaining: Math.round(24 - hoursSinceActivity)
                    };
                }
            }

            return { needsWarning: false };

        } catch (error) {
            console.error('Error checking streak warning:', error);
            return { needsWarning: false };
        }
    }

    /**
     * Track progress and check milestones
     */
    async trackProgress(userId, type, increment = 1) {
        try {
            // Get current progress for all milestones of this type
            const milestones = await prisma.milestone.findMany({
                where: { type, isActive: true }
            });

            for (const milestone of milestones) {
                let userMilestone = await prisma.userMilestone.findUnique({
                    where: {
                        userId_milestoneId: {
                            userId,
                            milestoneId: milestone.id
                        }
                    },
                    include: { milestone: true }
                });

                // Create if doesn't exist
                if (!userMilestone) {
                    userMilestone = await prisma.userMilestone.create({
                        data: {
                            userId,
                            milestoneId: milestone.id,
                            currentValue: 0
                        },
                        include: { milestone: true }
                    });
                }

                // Skip if already completed
                if (userMilestone.isCompleted) {
                    continue;
                }

                // Update progress
                const newValue = userMilestone.currentValue + increment;
                const isNowCompleted = newValue >= milestone.threshold;

                await prisma.userMilestone.update({
                    where: { id: userMilestone.id },
                    data: {
                        currentValue: newValue,
                        isCompleted: isNowCompleted,
                        completedAt: isNowCompleted ? new Date() : null
                    }
                });

                // If newly completed, award XP and send notification
                if (isNowCompleted) {
                    await this.awardMilestone(userId, milestone);
                }
            }

        } catch (error) {
            console.error('Error tracking progress:', error);
            throw error;
        }
    }

    /**
     * Award milestone to user
     */
    async awardMilestone(userId, milestone) {
        try {
            // Award XP
            await prisma.user.update({
                where: { id: userId },
                data: {
                    totalXP: {
                        increment: milestone.xpReward
                    }
                }
            });

            // Create achievement record
            await prisma.achievement.create({
                data: {
                    userId,
                    type: milestone.type,
                    title: milestone.title,
                    description: milestone.description,
                    icon: milestone.icon
                }
            });

            // Send congratulation notification
            await this.sendMilestoneNotification(userId, milestone);

            console.log(`✅ Milestone awarded: ${milestone.title} to user ${userId}`);

        } catch (error) {
            console.error('Error awarding milestone:', error);
        }
    }

    /**
     * Check streak milestones
     */
    async checkStreakMilestones(userId, currentStreak) {
        await this.trackProgress(userId, 'streak_days', 0); // Set to exact value
        
        // Update the current value to exact streak count
        const streakMilestones = await prisma.milestone.findMany({
            where: { type: 'streak_days', isActive: true }
        });

        for (const milestone of streakMilestones) {
            const userMilestone = await prisma.userMilestone.findUnique({
                where: {
                    userId_milestoneId: {
                        userId,
                        milestoneId: milestone.id
                    }
                }
            });

            if (userMilestone && !userMilestone.isCompleted) {
                await prisma.userMilestone.update({
                    where: { id: userMilestone.id },
                    data: {
                        currentValue: currentStreak,
                        isCompleted: currentStreak >= milestone.threshold,
                        completedAt: currentStreak >= milestone.threshold ? new Date() : null
                    }
                });

                if (currentStreak >= milestone.threshold && !userMilestone.isCompleted) {
                    await this.awardMilestone(userId, milestone);
                }
            }
        }
    }

    /**
     * Get user progress summary
     */
    async getUserProgress(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    words: true,
                    achievements: true
                }
            });

            if (!user) {
                throw new Error('User not found');
            }

            // Get milestone progress
            const milestoneProgress = await prisma.userMilestone.findMany({
                where: { userId },
                include: { milestone: true }
            });

            // Get activity stats
            const dailyActivities = await prisma.dailyActivity.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                take: 30
            });

            // Calculate totals
            const totalVideos = dailyActivities.reduce((sum, day) => sum + day.videosWatched, 0);
            const totalGames = dailyActivities.reduce((sum, day) => sum + day.gamesPlayed, 0);
            const totalWords = user.words.filter(w => w.saved).length;

            return {
                streak: user.streak,
                longestStreak: user.longestStreak,
                totalXP: user.totalXP,
                level: user.level,
                totalVideos,
                totalGames,
                totalWords,
                achievements: user.achievements.length,
                milestones: milestoneProgress.map(mp => ({
                    id: mp.milestone.id,
                    type: mp.milestone.type,
                    title: mp.milestone.title,
                    description: mp.milestone.description,
                    icon: mp.milestone.icon,
                    progress: mp.currentValue,
                    threshold: mp.milestone.threshold,
                    percentage: Math.min(100, Math.round((mp.currentValue / mp.milestone.threshold) * 100)),
                    isCompleted: mp.isCompleted,
                    completedAt: mp.completedAt
                })),
                recentActivity: dailyActivities.slice(0, 7)
            };

        } catch (error) {
            console.error('Error getting user progress:', error);
            throw error;
        }
    }

    /**
     * Send streak celebration notification
     */
    async sendStreakCelebration(userId, streak) {
        const messages = {
            3: { title: '🔥 3-Day Streak!', body: "You're on fire! Keep it going!" },
            7: { title: '🔥🔥 1 Week Streak!', body: "Amazing! You've learned for 7 days straight!" },
            14: { title: '🔥🔥 2 Week Streak!', body: 'Two weeks of consistent learning! Incredible!' },
            30: { title: '🔥🔥🔥 30-Day Streak!', body: "You're a learning machine! One month down!" },
            50: { title: '💎 50-Day Streak!', body: 'Halfway to 100! You are unstoppable!' },
            100: { title: '👑 100-Day Streak!', body: 'LEGENDARY! 100 days of dedication!' },
            365: { title: '🌟 365-Day Streak!', body: 'A FULL YEAR! You are absolutely amazing!' }
        };

        const message = messages[streak];
        if (message) {
            await this.sendNotification(userId, {
                type: 'streak_celebration',
                title: message.title,
                body: message.body,
                data: { streak }
            });
        }
    }

    /**
     * Send milestone notification
     */
    async sendMilestoneNotification(userId, milestone) {
        await this.sendNotification(userId, {
            type: 'milestone_unlocked',
            title: `${milestone.icon} ${milestone.title}`,
            body: milestone.description,
            data: { 
                milestoneId: milestone.id,
                xpReward: milestone.xpReward
            }
        });
    }

    /**
     * Send notification (to be implemented with push service)
     */
    async sendNotification(userId, notification) {
        try {
            // Check user preferences
            const prefs = await prisma.notificationPreference.findUnique({
                where: { userId }
            });

            if (!prefs) {
                // Create default preferences
                await prisma.notificationPreference.create({
                    data: { userId }
                });
            }

            // Log notification
            await prisma.pushNotification.create({
                data: {
                    userId,
                    type: notification.type,
                    title: notification.title,
                    body: notification.body,
                    data: JSON.stringify(notification.data || {}),
                    status: 'pending'
                }
            });

            // TODO: Actually send push notification via FCM/APNS
            console.log(`📱 Notification queued for user ${userId}:`, notification.title);

        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }

    /**
     * Generate share card for social media
     */
    async generateShareCard(userId, type, data) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            let title, subtitle, cardData;

            switch (type) {
                case 'streak':
                    title = `${data.streak}-Day Streak! 🔥`;
                    subtitle = `I've been learning Spanish for ${data.streak} days straight on Langflix!`;
                    cardData = { streak: data.streak, longestStreak: user.longestStreak };
                    break;

                case 'milestone':
                    title = `${data.icon} ${data.title}`;
                    subtitle = data.description;
                    cardData = { milestone: data.title, xp: data.xpReward };
                    break;

                case 'progress':
                    title = `My Learning Progress 📊`;
                    subtitle = `${data.totalWords} words learned, ${data.totalVideos} videos watched!`;
                    cardData = data;
                    break;

                default:
                    throw new Error('Invalid share card type');
            }

            // Create share card record
            const shareCard = await prisma.shareCard.create({
                data: {
                    userId,
                    type,
                    title,
                    subtitle,
                    cardData: JSON.stringify(cardData)
                }
            });

            // TODO: Generate actual image using canvas or image service
            // For now, return card data
            return {
                id: shareCard.id,
                title,
                subtitle,
                shareUrl: `https://langflix.app/share/${shareCard.id}`,
                cardData
            };

        } catch (error) {
            console.error('Error generating share card:', error);
            throw error;
        }
    }

    /**
     * Track share card interaction
     */
    async trackShare(shareCardId, platform) {
        try {
            const shareCard = await prisma.shareCard.findUnique({
                where: { id: shareCardId }
            });

            if (!shareCard) {
                throw new Error('Share card not found');
            }

            const platforms = JSON.parse(shareCard.platforms);
            if (!platforms.includes(platform)) {
                platforms.push(platform);
            }

            await prisma.shareCard.update({
                where: { id: shareCardId },
                data: {
                    shareCount: shareCard.shareCount + 1,
                    platforms: JSON.stringify(platforms)
                }
            });

            // Update user milestone for social sharing
            const userMilestone = await prisma.userMilestone.findFirst({
                where: {
                    userId: shareCard.userId,
                    milestone: {
                        type: 'social_shares'
                    }
                }
            });

            if (userMilestone) {
                await prisma.userMilestone.update({
                    where: { id: userMilestone.id },
                    data: {
                        sharedToSocial: true,
                        shareCount: userMilestone.shareCount + 1
                    }
                });
            }

        } catch (error) {
            console.error('Error tracking share:', error);
        }
    }

    // Helper functions
    getDateString(date) {
        return date.toISOString().split('T')[0];
    }

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}

module.exports = RetentionService;

