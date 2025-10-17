/**
 * 🎮 GAMIFICATION ENGINE - VARIABLE REWARDS & ENGAGEMENT
 * 
 * Based on B.F. Skinner's Variable Ratio Schedule + Duolingo Research
 * 
 * Key Features:
 * - Variable XP rewards (dopamine-driven)
 * - Streak system with loss aversion
 * - Optimal notification timing
 * - Achievement unlocks
 * - Leaderboard competition
 * 
 * Research Impact:
 * - Streak system: 21% churn reduction
 * - Variable rewards: 50% surge during Double XP events
 * - Notifications: 60% increase in commitment (when optimized)
 */

class GamificationEngine {
    constructor() {
        // XP Base Values (aligned with TikTok engagement weights)
        this.XP_VALUES = {
            // HIGH VALUE - Optimal retrieval & quality engagement
            masterWeakWord: { base: 100, variance: [0.5, 2.0] },      // On verge of forgetting
            completeQuiz: { base: 50, variance: [0.8, 1.5] },
            shareContent: { base: 40, variance: [1.0, 2.0] },         // 3 points TikTok
            
            // MEDIUM-HIGH - Completion & utility
            watchToCompletion: { base: 30, variance: [0.8, 1.5] },    // 4 points TikTok
            saveWord: { base: 25, variance: [0.8, 1.5] },
            rewatchVideo: { base: 35, variance: [1.0, 2.0] },         // 5 points TikTok
            
            // MEDIUM - Engagement signals
            comment: { base: 15, variance: [0.5, 1.5] },              // 2 points TikTok
            followCreator: { base: 12, variance: [1.0, 1.0] },
            
            // LOW - Basic signals
            like: { base: 8, variance: [0.5, 1.2] },                  // 1 point TikTok
            dailyLogin: { base: 5, variance: [1.0, 1.0] },
            videoView: { base: 3, variance: [1.0, 1.0] }
        };
        
        // Variable Ratio Schedule
        this.BONUS_PROBABILITY = 0.30;  // 30% chance of bonus
        this.DOUBLE_XP_MULTIPLIER = 2.0;
        
        // Streak configuration
        this.STREAK_XP_MULTIPLIER = 0.1;  // +10% XP per 10-day streak
        this.STREAK_FREEZE_COST = 10;     // Gems to freeze streak
        
        // User states
        this.userStates = new Map();
        
        // Achievement definitions
        this.ACHIEVEMENTS = this.defineAchievements();
    }

    /**
     * Calculate XP with variable rewards
     * Implements Variable Ratio Schedule from Skinner's research
     */
    calculateXP(action, context = {}) {
        const xpConfig = this.XP_VALUES[action];
        if (!xpConfig) {
            console.warn(`Unknown action: ${action}`);
            return 0;
        }
        
        const { base, variance } = xpConfig;
        let xp = base;
        
        // Variable Ratio Schedule - unpredictable bonuses
        if (Math.random() < this.BONUS_PROBABILITY) {
            const [minMult, maxMult] = variance;
            const multiplier = minMult + Math.random() * (maxMult - minMult);
            xp = Math.round(base * multiplier);
            
            context.bonusAwarded = true;
            context.multiplier = multiplier;
        }
        
        // Streak bonus
        if (context.streakDays) {
            const streakMultiplier = 1 + (Math.floor(context.streakDays / 10) * this.STREAK_XP_MULTIPLIER);
            xp = Math.round(xp * streakMultiplier);
            context.streakBonus = Math.round(xp * (streakMultiplier - 1));
        }
        
        // Difficulty bonus (for learning actions)
        if (context.difficulty && context.difficulty > 5) {
            const difficultyBonus = 1 + ((context.difficulty - 5) * 0.1);
            xp = Math.round(xp * difficultyBonus);
        }
        
        // Optimal timing bonus (HLR integration)
        if (context.urgency === 'due_soon') {
            xp = Math.round(xp * 2.0);  // Double XP for optimal timing
            context.optimalTimingBonus = true;
        } else if (context.urgency === 'overdue') {
            xp = Math.round(xp * 1.5);  // Rescued from forgetting
            context.rescuedBonus = true;
        }
        
        return xp;
    }

    /**
     * Get or create user state
     */
    getUserState(userId) {
        if (!this.userStates.has(userId)) {
            this.userStates.set(userId, {
                userId,
                xp: 0,
                level: 1,
                streakDays: 0,
                streakFreezes: 0,
                lastActiveDate: null,
                longestStreak: 0,
                videosWatched: 0,
                wordsLearned: 0,
                lessonsCompleted: 0,
                achievements: [],
                statistics: {
                    totalXP: 0,
                    xpThisWeek: 0,
                    xpToday: 0,
                    actionsToday: 0
                }
            });
        }
        return this.userStates.get(userId);
    }

    /**
     * Award XP and check for achievements
     */
    awardXP(userId, action, context = {}) {
        const userState = this.getUserState(userId);
        
        // Add streak context
        context.streakDays = userState.streakDays;
        
        // Calculate XP with variable rewards
        const xp = this.calculateXP(action, context);
        
        // Update user state
        userState.xp += xp;
        userState.statistics.totalXP += xp;
        userState.statistics.xpToday += xp;
        userState.statistics.actionsToday++;
        
        // Check for level up
        const levelUp = this.checkLevelUp(userState);
        
        // Check for achievements
        const newAchievements = this.checkAchievements(userState, action);
        
        // Track action-specific stats
        this.trackAction(userState, action);
        
        return {
            xpAwarded: xp,
            totalXP: userState.xp,
            level: userState.level,
            levelUp,
            newAchievements,
            bonusAwarded: context.bonusAwarded || false,
            streakBonus: context.streakBonus || 0,
            showCelebration: context.bonusAwarded || levelUp || newAchievements.length > 0
        };
    }

    /**
     * Update daily streak with loss aversion
     */
    updateStreak(userId) {
        const userState = this.getUserState(userId);
        const today = new Date().toISOString().split('T')[0];
        const lastActive = userState.lastActiveDate;
        
        if (!lastActive) {
            // First day
            userState.streakDays = 1;
            userState.lastActiveDate = today;
            return { streakDays: 1, status: 'started', atRisk: false };
        }
        
        const lastActiveDate = new Date(lastActive);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastActiveDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            // Already logged in today
            return { streakDays: userState.streakDays, status: 'maintained', atRisk: false };
        } else if (diffDays === 1) {
            // Consecutive day - increment streak
            userState.streakDays++;
            userState.lastActiveDate = today;
            
            // Update longest streak
            if (userState.streakDays > userState.longestStreak) {
                userState.longestStreak = userState.streakDays;
            }
            
            return {
                streakDays: userState.streakDays,
                status: 'increased',
                atRisk: false,
                milestoneReached: this.checkStreakMilestone(userState.streakDays)
            };
        } else {
            // Streak broken
            const brokenStreak = userState.streakDays;
            userState.streakDays = 1;
            userState.lastActiveDate = today;
            
            return {
                streakDays: 1,
                status: 'broken',
                previousStreak: brokenStreak,
                lossAversion: this.calculateLossAversion(brokenStreak)
            };
        }
    }

    /**
     * Check if user is at risk of breaking streak
     */
    checkStreakAtRisk(userId) {
        const userState = this.getUserState(userId);
        const lastActive = userState.lastActiveDate;
        
        if (!lastActive) return { atRisk: false };
        
        const now = new Date();
        const lastActiveDate = new Date(lastActive);
        const hoursSinceActive = (now - lastActiveDate) / (1000 * 60 * 60);
        
        // At risk if >20 hours since last activity
        const atRisk = hoursSinceActive > 20 && hoursSinceActive < 48;
        
        return {
            atRisk,
            streakDays: userState.streakDays,
            hoursSinceActive: Math.floor(hoursSinceActive),
            hoursRemaining: Math.max(0, Math.floor(48 - hoursSinceActive)),
            canUseFreeze: userState.streakFreezes > 0,
            lossAversion: this.calculateLossAversion(userState.streakDays)
        };
    }

    /**
     * Calculate emotional loss aversion based on streak length
     * Longer streaks = more painful to lose
     */
    calculateLossAversion(streakDays) {
        if (streakDays < 7) return 'low';
        if (streakDays < 30) return 'medium';
        if (streakDays < 100) return 'high';
        if (streakDays < 365) return 'very_high';
        return 'extreme';  // 365+ days
    }

    /**
     * Use streak freeze
     */
    useStreakFreeze(userId) {
        const userState = this.getUserState(userId);
        
        if (userState.streakFreezes <= 0) {
            return { success: false, reason: 'No streak freezes available' };
        }
        
        userState.streakFreezes--;
        const today = new Date().toISOString().split('T')[0];
        userState.lastActiveDate = today;  // Extend streak
        
        return {
            success: true,
            streakDays: userState.streakDays,
            remainingFreezes: userState.streakFreezes
        };
    }

    /**
     * Check for level up
     */
    checkLevelUp(userState) {
        const xpForNextLevel = this.calculateXPForLevel(userState.level + 1);
        
        if (userState.xp >= xpForNextLevel) {
            userState.level++;
            return {
                leveledUp: true,
                newLevel: userState.level,
                xpForNext: this.calculateXPForLevel(userState.level + 1)
            };
        }
        
        return {
            leveledUp: false,
            xpForNext: xpForNextLevel,
            progress: userState.xp / xpForNextLevel
        };
    }

    /**
     * Calculate XP required for level (exponential growth)
     */
    calculateXPForLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    /**
     * Define achievements
     */
    defineAchievements() {
        return [
            // Streak achievements
            { id: 'streak_7', name: '7-Day Scholar', requirement: { type: 'streak', value: 7 }, xp: 500 },
            { id: 'streak_30', name: '30-Day Master', requirement: { type: 'streak', value: 30 }, xp: 2000 },
            { id: 'streak_100', name: '100-Day Legend', requirement: { type: 'streak', value: 100 }, xp: 10000 },
            { id: 'streak_365', name: 'Year Warrior', requirement: { type: 'streak', value: 365 }, xp: 50000 },
            
            // Learning achievements
            { id: 'words_100', name: 'Vocabulary Novice', requirement: { type: 'wordsLearned', value: 100 }, xp: 1000 },
            { id: 'words_500', name: 'Vocabulary Expert', requirement: { type: 'wordsLearned', value: 500 }, xp: 5000 },
            { id: 'words_1000', name: 'Vocabulary Master', requirement: { type: 'wordsLearned', value: 1000 }, xp: 15000 },
            
            // Video achievements
            { id: 'videos_50', name: 'Binge Watcher', requirement: { type: 'videosWatched', value: 50 }, xp: 500 },
            { id: 'videos_200', name: 'Content Consumer', requirement: { type: 'videosWatched', value: 200 }, xp: 2000 },
            { id: 'videos_500', name: 'Netflix Champion', requirement: { type: 'videosWatched', value: 500 }, xp: 5000 },
            
            // Engagement achievements
            { id: 'shares_10', name: 'Social Butterfly', requirement: { type: 'shares', value: 10 }, xp: 300 },
            { id: 'comments_50', name: 'Conversationalist', requirement: { type: 'comments', value: 50 }, xp: 800 },
            
            // XP achievements
            { id: 'xp_10000', name: 'XP Hunter', requirement: { type: 'totalXP', value: 10000 }, xp: 1000 },
            { id: 'xp_50000', name: 'XP Legend', requirement: { type: 'totalXP', value: 50000 }, xp: 5000 }
        ];
    }

    /**
     * Check for new achievements
     */
    checkAchievements(userState, action) {
        const newAchievements = [];
        
        for (const achievement of this.ACHIEVEMENTS) {
            // Skip if already earned
            if (userState.achievements.includes(achievement.id)) continue;
            
            const { type, value } = achievement.requirement;
            let currentValue = 0;
            
            switch (type) {
                case 'streak':
                    currentValue = userState.streakDays;
                    break;
                case 'wordsLearned':
                    currentValue = userState.wordsLearned;
                    break;
                case 'videosWatched':
                    currentValue = userState.videosWatched;
                    break;
                case 'totalXP':
                    currentValue = userState.statistics.totalXP;
                    break;
                case 'shares':
                    currentValue = userState.statistics.shares || 0;
                    break;
                case 'comments':
                    currentValue = userState.statistics.comments || 0;
                    break;
            }
            
            if (currentValue >= value) {
                userState.achievements.push(achievement.id);
                userState.xp += achievement.xp;
                newAchievements.push(achievement);
            }
        }
        
        return newAchievements;
    }

    /**
     * Track action-specific statistics
     */
    trackAction(userState, action) {
        switch (action) {
            case 'watchToCompletion':
            case 'rewatchVideo':
                userState.videosWatched++;
                break;
            case 'saveWord':
            case 'masterWeakWord':
                userState.wordsLearned++;
                break;
            case 'completeQuiz':
                userState.lessonsCompleted++;
                break;
            case 'shareContent':
                userState.statistics.shares = (userState.statistics.shares || 0) + 1;
                break;
            case 'comment':
                userState.statistics.comments = (userState.statistics.comments || 0) + 1;
                break;
        }
    }

    /**
     * Check streak milestone
     */
    checkStreakMilestone(streakDays) {
        const milestones = [7, 14, 30, 50, 100, 200, 365, 500, 1000];
        return milestones.includes(streakDays);
    }

    /**
     * Generate notification for user
     * Based on research: Personalized notifications boost engagement 4x
     */
    generateNotification(userId, type) {
        const userState = this.getUserState(userId);
        const notifications = {
            streak_risk: {
                title: `🔥 Your ${userState.streakDays}-day streak is at risk!`,
                body: `Don't lose your progress! Complete a lesson to keep your streak alive.`,
                urgency: 'high',
                cta: 'Save My Streak'
            },
            
            streak_milestone: {
                title: `🎉 ${userState.streakDays} Days! You're on fire!`,
                body: `You've reached an amazing milestone. Keep the momentum going!`,
                urgency: 'low',
                cta: 'Continue Learning'
            },
            
            daily_reminder: {
                title: `📚 Time for your daily Spanish practice`,
                body: `Your brain is ready to learn. Just 5 minutes today!`,
                urgency: 'medium',
                cta: 'Start Lesson'
            },
            
            achievement_unlocked: {
                title: `🏆 Achievement Unlocked!`,
                body: `You've earned a new badge. Check your profile!`,
                urgency: 'medium',
                cta: 'View Achievement'
            },
            
            level_up: {
                title: `⬆️ Level Up! You're now Level ${userState.level}`,
                body: `Congratulations! Harder challenges await.`,
                urgency: 'low',
                cta: 'See New Content'
            },
            
            guilt_final: {
                title: `We'll stop sending reminders`,
                body: `It seems these notifications aren't helping. We'll give you space.`,
                urgency: 'high',
                cta: 'I want to continue'
            }
        };
        
        return notifications[type] || notifications.daily_reminder;
    }

    /**
     * Calculate optimal notification timing
     * Research: Afternoon/evening highest engagement
     */
    getOptimalNotificationTime(userId, userTimezone = 'UTC') {
        const userState = this.getUserState(userId);
        
        // Analyze user's historical activity patterns
        // For now, use research-backed defaults
        
        return {
            primaryTime: { hour: 18, minute: 0 },      // 6 PM (evening)
            secondaryTime: { hour: 14, minute: 0 },    // 2 PM (afternoon)
            avoidTimes: [
                { start: 23, end: 7 },  // Late night/early morning
                { start: 9, end: 10 }   // Morning commute
            ]
        };
    }

    /**
     * Export user gamification data
     */
    exportUserData(userId) {
        const userState = this.getUserState(userId);
        return { ...userState };
    }

    /**
     * Import user gamification data
     */
    importUserData(userId, data) {
        this.userStates.set(userId, data);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamificationEngine;
}
