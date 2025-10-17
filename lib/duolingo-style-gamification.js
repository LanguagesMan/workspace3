// 🎮 DUOLINGO-STYLE GAMIFICATION - BUT BETTER
// Dynamic XP, Smart Streaks, Achievement System

class DuolingoStyleGamification {
    constructor() {
        this.xpMultipliers = {
            'A1': 1.0,
            'A2': 1.2,
            'B1': 1.5,
            'B2': 2.0,
            'C1': 2.5,
            'C2': 3.0
        };
        
        this.activityXP = {
            'video_watch': 10,
            'video_complete': 20,
            'word_click': 5,
            'word_save': 10,
            'quiz_attempt': 15,
            'quiz_perfect': 50,
            'daily_login': 5,
            'streak_maintain': 20,
            'level_up': 100,
            'challenge_hard_content': 30
        };
        
        this.achievements = this.initializeAchievements();
        this.userStats = new Map();
    }

    /**
     * Calculate dynamic XP based on activity, difficulty, and user level
     * BETTER THAN DUOLINGO: XP scales with difficulty
     */
    calculateXP(activity, userLevel, contentLevel) {
        const baseXP = this.activityXP[activity.type] || 10;
        const levelMultiplier = this.xpMultipliers[userLevel] || 1.0;
        
        let xp = baseXP * levelMultiplier;
        
        // COURAGE BONUS: Reward users for tackling harder content
        if (contentLevel && this.compareLevels(contentLevel, userLevel) > 0) {
            xp *= 1.5; // 50% bonus for learning above your level!
            activity.courageBonus = true;
        }
        
        // PERFECT PERFORMANCE BONUS
        if (activity.performance === 'perfect') {
            xp *= 1.3;
        }
        
        // CONSISTENCY BONUS: More XP for maintaining streaks
        if (activity.currentStreak > 7) {
            xp *= 1.2;
        }
        if (activity.currentStreak > 30) {
            xp *= 1.5;
        }
        
        // FIRST TIME BONUS
        if (activity.isFirstTime) {
            xp *= 1.25;
        }
        
        return {
            xp: Math.round(xp),
            breakdown: {
                base: baseXP,
                levelMultiplier,
                courageBonus: activity.courageBonus ? 1.5 : 1.0,
                perfectionBonus: activity.performance === 'perfect' ? 1.3 : 1.0,
                streakBonus: activity.currentStreak > 30 ? 1.5 : (activity.currentStreak > 7 ? 1.2 : 1.0),
                firstTimeBonus: activity.isFirstTime ? 1.25 : 1.0
            }
        };
    }

    /**
     * SMART STREAK SYSTEM
     * Unlike Duolingo (just login), we track ACTUAL LEARNING
     */
    updateStreak(userId, activity) {
        if (!this.userStats.has(userId)) {
            this.userStats.set(userId, {
                currentStreak: 0,
                longestStreak: 0,
                lastActivityDate: null,
                learningDays: new Set(),
                wordsLearnedToday: 0,
                totalWordsLearned: 0
            });
        }
        
        const stats = this.userStats.get(userId);
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        // Check if this is a new learning day
        const isNewDay = stats.lastActivityDate !== today;
        
        if (isNewDay) {
            // Did user learn something meaningful? (at least 5 new words or 2 completed activities)
            const meaningfulLearning = stats.wordsLearnedToday >= 5 || activity.type === 'quiz_perfect';
            
            if (meaningfulLearning) {
                // Check if continuing streak (learned yesterday) or starting new
                if (stats.lastActivityDate === yesterday) {
                    stats.currentStreak++;
                } else if (stats.lastActivityDate === null || stats.currentStreak === 0) {
                    stats.currentStreak = 1;
                } else {
                    // Streak broken - reset
                    stats.currentStreak = 1;
                }
                
                // Update longest streak
                if (stats.currentStreak > stats.longestStreak) {
                    stats.longestStreak = stats.currentStreak;
                }
                
                stats.learningDays.add(today);
                stats.lastActivityDate = today;
                stats.wordsLearnedToday = 0; // Reset for new day
            }
        }
        
        // Track words learned today
        if (activity.type === 'word_save') {
            stats.wordsLearnedToday++;
            stats.totalWordsLearned++;
        }
        
        return {
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            totalDays: stats.learningDays.size,
            wordsToday: stats.wordsLearnedToday,
            totalWords: stats.totalWordsLearned,
            streakMilestone: this.getStreakMilestone(stats.currentStreak)
        };
    }

    /**
     * ACHIEVEMENT SYSTEM
     * Progressive, motivating, tied to real learning
     */
    initializeAchievements() {
        return {
            // Vocabulary achievements
            'first_word': { name: 'First Steps', desc: 'Saved your first word', xp: 10, icon: '👶' },
            'vocab_10': { name: 'Getting Started', desc: 'Learned 10 words', xp: 50, icon: '📝' },
            'vocab_50': { name: 'Word Collector', desc: 'Learned 50 words', xp: 100, icon: '📚' },
            'vocab_100': { name: 'Vocabulary Builder', desc: 'Learned 100 words', xp: 200, icon: '🏗️' },
            'vocab_500': { name: 'Polyglot Path', desc: 'Learned 500 words', xp: 500, icon: '🌟' },
            'vocab_1000': { name: 'Word Master', desc: 'Learned 1000 words', xp: 1000, icon: '👑' },
            'vocab_2000': { name: 'Language Ninja', desc: 'Learned 2000 words', xp: 2000, icon: '🥋' },
            
            // Streak achievements
            'streak_3': { name: 'Committed', desc: '3-day learning streak', xp: 30, icon: '🔥' },
            'streak_7': { name: 'Week Warrior', desc: '7-day learning streak', xp: 70, icon: '💪' },
            'streak_30': { name: 'Monthly Master', desc: '30-day learning streak', xp: 300, icon: '🎯' },
            'streak_100': { name: 'Centurion', desc: '100-day learning streak', xp: 1000, icon: '💯' },
            'streak_365': { name: 'Year of Learning', desc: '365-day learning streak', xp: 5000, icon: '🏆' },
            
            // Content achievements
            'video_1': { name: 'First Watch', desc: 'Completed first video', xp: 10, icon: '🎬' },
            'video_10': { name: 'Binge Learner', desc: 'Completed 10 videos', xp: 50, icon: '📺' },
            'video_100': { name: 'Video Veteran', desc: 'Completed 100 videos', xp: 500, icon: '🎥' },
            
            // Quiz achievements
            'quiz_perfect_first': { name: 'Perfect Score', desc: 'First perfect quiz', xp: 50, icon: '⭐' },
            'quiz_perfect_10': { name: 'Quiz Master', desc: '10 perfect quizzes', xp: 200, icon: '🎓' },
            
            // Courage achievements
            'courage_first': { name: 'Brave Learner', desc: 'Tried content above your level', xp: 25, icon: '🦁' },
            'courage_10': { name: 'Fear Conqueror', desc: 'Challenged yourself 10 times', xp: 100, icon: '⚔️' },
            
            // Speed achievements
            'fast_learner': { name: 'Quick Study', desc: 'Learned 20 words in one day', xp: 100, icon: '⚡' },
            'marathon': { name: 'Marathon Learner', desc: '60 minutes in one session', xp: 200, icon: '🏃' },
            
            // Level achievements
            'level_a1': { name: 'A1 Achieved', desc: 'Reached A1 level', xp: 100, icon: '🥉' },
            'level_a2': { name: 'A2 Achieved', desc: 'Reached A2 level', xp: 200, icon: '🥈' },
            'level_b1': { name: 'B1 Achieved', desc: 'Reached B1 level', xp: 500, icon: '🥇' },
            'level_b2': { name: 'B2 Achieved', desc: 'Reached B2 level', xp: 1000, icon: '💎' },
            'level_c1': { name: 'C1 Achieved', desc: 'Reached C1 level', xp: 2000, icon: '👑' },
            'level_c2': { name: 'C2 Mastery', desc: 'Reached C2 level', xp: 5000, icon: '🏆' }
        };
    }

    /**
     * Check and award achievements
     */
    checkAchievements(userId, stats) {
        const earned = [];
        const userAchievements = this.getUserAchievements(userId);
        
        // Vocabulary milestones
        const vocabMilestones = [
            { count: 1, id: 'first_word' },
            { count: 10, id: 'vocab_10' },
            { count: 50, id: 'vocab_50' },
            { count: 100, id: 'vocab_100' },
            { count: 500, id: 'vocab_500' },
            { count: 1000, id: 'vocab_1000' },
            { count: 2000, id: 'vocab_2000' }
        ];
        
        for (const milestone of vocabMilestones) {
            if (stats.totalWords >= milestone.count && !userAchievements.has(milestone.id)) {
                earned.push(this.awardAchievement(userId, milestone.id));
            }
        }
        
        // Streak milestones
        const streakMilestones = [
            { days: 3, id: 'streak_3' },
            { days: 7, id: 'streak_7' },
            { days: 30, id: 'streak_30' },
            { days: 100, id: 'streak_100' },
            { days: 365, id: 'streak_365' }
        ];
        
        for (const milestone of streakMilestones) {
            if (stats.currentStreak >= milestone.days && !userAchievements.has(milestone.id)) {
                earned.push(this.awardAchievement(userId, milestone.id));
            }
        }
        
        // Fast learner (20 words in one day)
        if (stats.wordsToday >= 20 && !userAchievements.has('fast_learner')) {
            earned.push(this.awardAchievement(userId, 'fast_learner'));
        }
        
        return earned;
    }

    /**
     * Award achievement and return details
     */
    awardAchievement(userId, achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return null;
        
        const userAchievements = this.getUserAchievements(userId);
        userAchievements.add(achievementId);
        
        return {
            id: achievementId,
            ...achievement,
            earnedAt: Date.now()
        };
    }

    /**
     * Get user's earned achievements
     */
    getUserAchievements(userId) {
        if (!this.userStats.has(userId)) {
            this.userStats.set(userId, { achievements: new Set() });
        }
        const stats = this.userStats.get(userId);
        if (!stats.achievements) {
            stats.achievements = new Set();
        }
        return stats.achievements;
    }

    /**
     * Get streak milestone message
     */
    getStreakMilestone(streak) {
        if (streak === 3) return '🔥 3 days! You\'re building a habit!';
        if (streak === 7) return '💪 One week! You\'re on fire!';
        if (streak === 14) return '⭐ Two weeks! Impressive dedication!';
        if (streak === 30) return '🎯 30 days! You\'re a learning machine!';
        if (streak === 60) return '🚀 Two months! Unstoppable!';
        if (streak === 100) return '💯 100 days! You\'re a legend!';
        if (streak === 365) return '🏆 ONE YEAR! You\'re a language master!';
        return null;
    }

    /**
     * Compare CEFR levels
     */
    compareLevels(level1, level2) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const index1 = levels.indexOf(level1);
        const index2 = levels.indexOf(level2);
        return index1 - index2;
    }

    /**
     * Get daily goal progress
     */
    getDailyGoalProgress(userId) {
        const stats = this.userStats.get(userId);
        if (!stats) return { progress: 0, goal: 10, complete: false };
        
        const goal = 10; // 10 new words per day
        const progress = stats.wordsLearnedToday || 0;
        
        return {
            progress,
            goal,
            complete: progress >= goal,
            percentage: Math.min(100, Math.round((progress / goal) * 100))
        };
    }

    /**
     * Get leaderboard position (optional feature)
     */
    getLeaderboard(timeframe = 'week') {
        // This would integrate with database in production
        // For now, return mock data structure
        return {
            timeframe,
            userRank: 0,
            topUsers: []
        };
    }

    /**
     * COMPLETE USER STATS DASHBOARD
     */
    getUserDashboard(userId) {
        const stats = this.userStats.get(userId) || {};
        const achievements = Array.from(this.getUserAchievements(userId) || [])
            .map(id => ({ id, ...this.achievements[id] }));
        
        const dailyGoal = this.getDailyGoalProgress(userId);
        
        return {
            xp: stats.totalXP || 0,
            level: this.calculateLevelFromXP(stats.totalXP || 0),
            streak: {
                current: stats.currentStreak || 0,
                longest: stats.longestStreak || 0,
                total: stats.learningDays?.size || 0
            },
            vocabulary: {
                total: stats.totalWordsLearned || 0,
                today: stats.wordsLearnedToday || 0
            },
            achievements: {
                earned: achievements,
                total: Object.keys(this.achievements).length,
                percentage: Math.round((achievements.length / Object.keys(this.achievements).length) * 100)
            },
            dailyGoal,
            nextMilestone: this.getNextMilestone(stats)
        };
    }

    /**
     * Calculate level from total XP
     */
    calculateLevelFromXP(xp) {
        // Each level requires more XP: Level 1 = 0, Level 2 = 100, Level 3 = 250, etc.
        let level = 1;
        let requiredXP = 0;
        
        while (xp >= requiredXP) {
            level++;
            requiredXP += level * 50; // Progressive difficulty
        }
        
        return {
            level: level - 1,
            currentXP: xp,
            nextLevelXP: requiredXP,
            progress: requiredXP > 0 ? Math.round((xp / requiredXP) * 100) : 0
        };
    }

    /**
     * Get next achievement milestone
     */
    getNextMilestone(stats) {
        const totalWords = stats.totalWordsLearned || 0;
        const milestones = [10, 50, 100, 500, 1000, 2000];
        
        for (const milestone of milestones) {
            if (totalWords < milestone) {
                return {
                    type: 'vocabulary',
                    current: totalWords,
                    target: milestone,
                    remaining: milestone - totalWords
                };
            }
        }
        
        return null;
    }

    /**
     * Award XP and update stats
     */
    awardXP(userId, activity, userLevel, contentLevel) {
        if (!this.userStats.has(userId)) {
            this.userStats.set(userId, {
                totalXP: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastActivityDate: null,
                learningDays: new Set(),
                wordsLearnedToday: 0,
                totalWordsLearned: 0,
                achievements: new Set()
            });
        }
        
        const stats = this.userStats.get(userId);
        const xpResult = this.calculateXP(activity, userLevel, contentLevel);
        
        stats.totalXP = (stats.totalXP || 0) + xpResult.xp;
        
        // Check for level up
        const oldLevel = this.calculateLevelFromXP(stats.totalXP - xpResult.xp);
        const newLevel = this.calculateLevelFromXP(stats.totalXP);
        const leveledUp = newLevel.level > oldLevel.level;
        
        if (leveledUp) {
            xpResult.xp += this.activityXP.level_up;
            stats.totalXP += this.activityXP.level_up;
            xpResult.levelUp = true;
            xpResult.newLevel = newLevel.level;
        }
        
        return {
            ...xpResult,
            totalXP: stats.totalXP,
            level: newLevel,
            leveledUp
        };
    }
}

module.exports = new DuolingoStyleGamification();

