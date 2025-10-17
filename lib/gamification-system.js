/**
 * 🎮 COMPREHENSIVE GAMIFICATION SYSTEM
 * 
 * Makes learning addictive through psychological triggers:
 * - Variable rewards (random XP bonuses)
 * - Loss aversion (don't lose your streak!)
 * - Social proof (10,000 people learned this today)
 * - Progress bars (70% to B1!)
 * - Achievement unlocks (surprise badges)
 * - Leaderboards (weekly rankings)
 * - Daily goals & missions
 * 
 * Goal: Users come back every day, stay engaged, share progress
 */

class GamificationSystem {
  constructor() {
        this.ACHIEVEMENTS = {
            // Learning Milestones
            FIRST_WORD: {
                id: 'first_word',
                name: 'First Blood',
                description: 'Learn your first word',
                icon: '🏆',
                xp: 10,
                rarity: 'common'
            },
            WORDS_100: {
                id: 'words_100',
                name: 'Century',
                description: 'Learn 100 words',
                icon: '💯',
                xp: 100,
                rarity: 'rare'
            },
            WORDS_500: {
                id: 'words_500',
                name: 'Word Master',
                description: 'Learn 500 words',
                icon: '📚',
                xp: 500,
                rarity: 'epic'
            },
            WORDS_1000: {
                id: 'words_1000',
                name: 'Vocabulary Legend',
                description: 'Learn 1000 words',
                icon: '👑',
                xp: 1000,
                rarity: 'legendary'
            },
            
            // Streaks
            STREAK_7: {
                id: 'streak_7',
                name: 'Hot Streak',
                description: '7 day learning streak',
                icon: '🔥',
                xp: 50,
                rarity: 'uncommon'
            },
            STREAK_30: {
                id: 'streak_30',
                name: 'Dedicated Learner',
                description: '30 day learning streak',
                icon: '⚡',
                xp: 200,
                rarity: 'rare'
            },
            STREAK_100: {
                id: 'streak_100',
                name: 'Unstoppable',
                description: '100 day learning streak',
                icon: '💎',
                xp: 1000,
                rarity: 'legendary'
            },
            
            // Performance
            PERFECT_QUIZ: {
                id: 'perfect_quiz',
                name: 'Perfectionist',
                description: 'Get 100% on a quiz',
                icon: '✨',
                xp: 15,
                rarity: 'common'
            },
            CORRECT_10: {
                id: 'correct_10',
                name: 'Sharp Shooter',
                description: '10 correct answers in a row',
                icon: '🎯',
                xp: 30,
                rarity: 'uncommon'
            },
            SPEED_DEMON: {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Complete lesson in under 2 minutes',
                icon: '🚀',
                xp: 25,
                rarity: 'uncommon'
            },
            
            // Content Consumption
            VIDEOS_50: {
                id: 'videos_50',
                name: 'Binge Watcher',
                description: 'Watch 50 videos',
                icon: '📺',
                xp: 75,
                rarity: 'uncommon'
            },
            ARTICLES_10: {
                id: 'articles_10',
                name: 'Bookworm',
                description: 'Read 10 articles',
                icon: '📖',
                xp: 50,
                rarity: 'uncommon'
            },
            CONVERSATIONS_10: {
                id: 'conversations_10',
                name: 'Chatterbox',
                description: 'Practice conversation 10 times',
                icon: '💬',
                xp: 80,
                rarity: 'rare'
            },
            
            // Level Progression
            LEVEL_A2: {
                id: 'level_a2',
                name: 'Getting Started',
                description: 'Reach A2 level',
                icon: '🌱',
                xp: 100,
                rarity: 'common'
            },
            LEVEL_B1: {
                id: 'level_b1',
                name: 'Conversational',
                description: 'Reach B1 level',
                icon: '🗣️',
                xp: 300,
                rarity: 'rare'
            },
            LEVEL_B2: {
                id: 'level_b2',
                name: 'Advanced',
                description: 'Reach B2 level',
                icon: '⭐',
                xp: 600,
                rarity: 'epic'
            },
            LEVEL_C1: {
                id: 'level_c1',
                name: 'Proficient',
                description: 'Reach C1 level',
                icon: '🏅',
                xp: 1000,
                rarity: 'legendary'
            },
            
            // Social
            WEEK_CHAMPION: {
                id: 'week_champion',
                name: 'Week Champion',
                description: '#1 on weekly leaderboard',
                icon: '👑',
                xp: 500,
                rarity: 'epic'
            },
            REFERRAL_3: {
                id: 'referral_3',
                name: 'Ambassador',
                description: 'Refer 3 friends',
                icon: '🎁',
                xp: 150,
                rarity: 'rare'
            }
        };
        
        this.DAILY_GOALS = {
            WATCH_5_VIDEOS: {
                id: 'watch_5_videos',
                title: 'Watch 5 videos',
                description: 'Watch at least 5 videos today',
                target: 5,
                progress: 0,
                xp: 20,
                icon: '📹'
            },
            LEARN_10_WORDS: {
                id: 'learn_10_words',
                title: 'Learn 10 words',
                description: 'Add 10 new words to your vocabulary',
                target: 10,
                progress: 0,
                xp: 30,
                icon: '📝'
            },
            COMPLETE_1_QUIZ: {
                id: 'complete_1_quiz',
                title: 'Complete a quiz',
                description: 'Finish at least one quiz with 70%+',
                target: 1,
                progress: 0,
                xp: 15,
                icon: '✅'
            }
        };
    }
    
    /**
     * Award XP with variable rewards (makes it addictive!)
     */
    awardXP(userId, baseXP, action) {
        // Variable reward multiplier (Skinner box effect)
        const multiplier = this.getVariableMultiplier();
        const actualXP = Math.round(baseXP * multiplier);
        
        // Check for combo multiplier (consecutive actions)
        const comboMultiplier = this.checkComboMultiplier(userId, action);
        const finalXP = Math.round(actualXP * comboMultiplier);
        
        // Store XP award
        this.storeXP(userId, finalXP);
        
    return {
            baseXP,
            multiplier,
            comboMultiplier,
            finalXP,
            total: this.getTotalXP(userId),
            message: this.getXPMessage(finalXP, multiplier, comboMultiplier)
    };
  }

  /**
     * Variable reward multiplier (Random bonuses)
     * Research: Variable rewards are MORE addictive than fixed rewards
     */
    getVariableMultiplier() {
        const random = Math.random();
        
        if (random < 0.02) return 5.0;   // 2% chance: 5x XP! 🎉
        if (random < 0.05) return 3.0;   // 3% chance: 3x XP! 🔥
        if (random < 0.15) return 2.0;   // 10% chance: 2x XP! ⚡
        if (random < 0.30) return 1.5;   // 15% chance: 1.5x XP ✨
        return 1.0;                      // 70% chance: Normal XP
    }
    
    /**
     * Combo multiplier (Consecutive correct actions)
     */
    checkComboMultiplier(userId, action) {
        // Mock: In production, check user's recent action history
        const consecutiveActions = Math.floor(Math.random() * 10);
        
        if (consecutiveActions >= 10) return 2.0;  // 10+ combo: 2x!
        if (consecutiveActions >= 5) return 1.5;   // 5+ combo: 1.5x
        if (consecutiveActions >= 3) return 1.2;   // 3+ combo: 1.2x
        return 1.0;
    }
    
    /**
     * Check and award achievements
     */
    async checkAchievements(userId, userStats) {
        const newAchievements = [];
        
        // Check each achievement
        Object.values(this.ACHIEVEMENTS).forEach(achievement => {
            if (this.isAchievementUnlocked(achievement, userStats)) {
                if (!this.hasAchievement(userId, achievement.id)) {
                    newAchievements.push(achievement);
                    this.awardAchievement(userId, achievement);
                }
            }
        });
        
        return {
            newAchievements,
            totalAchievements: this.getUserAchievements(userId).length,
            message: newAchievements.length > 0 
                ? `🎉 You unlocked ${newAchievements.length} new achievement(s)!`
                : null
        };
    }

    /**
     * Check if achievement should be unlocked
     */
    isAchievementUnlocked(achievement, userStats) {
        const { id } = achievement;
        
        // Word count achievements
        if (id === 'first_word') return userStats.wordsLearned >= 1;
        if (id === 'words_100') return userStats.wordsLearned >= 100;
        if (id === 'words_500') return userStats.wordsLearned >= 500;
        if (id === 'words_1000') return userStats.wordsLearned >= 1000;
        
        // Streak achievements
        if (id === 'streak_7') return userStats.currentStreak >= 7;
        if (id === 'streak_30') return userStats.currentStreak >= 30;
        if (id === 'streak_100') return userStats.currentStreak >= 100;
        
        // Performance achievements
        if (id === 'perfect_quiz') return userStats.perfectQuizzes >= 1;
        if (id === 'correct_10') return userStats.maxCorrectStreak >= 10;
        
        // Content achievements
        if (id === 'videos_50') return userStats.videosWatched >= 50;
        if (id === 'articles_10') return userStats.articlesRead >= 10;
        if (id === 'conversations_10') return userStats.conversationsPracticed >= 10;
        
        // Level achievements
        if (id === 'level_a2') return userStats.currentLevel >= 'A2';
        if (id === 'level_b1') return userStats.currentLevel >= 'B1';
        if (id === 'level_b2') return userStats.currentLevel >= 'B2';
        if (id === 'level_c1') return userStats.currentLevel >= 'C1';
        
        return false;
    }
    
    /**
     * Update daily goals progress
     */
    async updateDailyGoals(userId, action) {
        const goals = this.getUserDailyGoals(userId);
        let goalsCompleted = [];
        
        // Update progress based on action
        if (action.type === 'video_watched') {
            goals.WATCH_5_VIDEOS.progress++;
            if (goals.WATCH_5_VIDEOS.progress >= goals.WATCH_5_VIDEOS.target) {
                goalsCompleted.push(goals.WATCH_5_VIDEOS);
            }
        } else if (action.type === 'word_learned') {
            goals.LEARN_10_WORDS.progress++;
            if (goals.LEARN_10_WORDS.progress >= goals.LEARN_10_WORDS.target) {
                goalsCompleted.push(goals.LEARN_10_WORDS);
            }
        } else if (action.type === 'quiz_completed') {
            goals.COMPLETE_1_QUIZ.progress++;
            if (goals.COMPLETE_1_QUIZ.progress >= goals.COMPLETE_1_QUIZ.target) {
                goalsCompleted.push(goals.COMPLETE_1_QUIZ);
            }
        }
        
        // Award XP for completed goals
        let totalXPAwarded = 0;
        goalsCompleted.forEach(goal => {
            totalXPAwarded += goal.xp;
        });

        return {
            goals,
            completed: goalsCompleted,
            xpAwarded: totalXPAwarded,
            allCompleted: Object.values(goals).every(g => g.progress >= g.target)
        };
    }

    /**
     * Update streak
     */
    async updateStreak(userId) {
        const streakData = this.getUserStreak(userId);
        const today = new Date().toDateString();
        const lastActive = new Date(streakData.lastActiveDate).toDateString();
        
        if (today === lastActive) {
            // Already active today
            return streakData;
        }
        
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (lastActive === yesterday) {
            // Consecutive day!
            streakData.currentStreak++;
            streakData.longestStreak = Math.max(streakData.currentStreak, streakData.longestStreak);
        } else if (!streakData.freezeUsed && this.hasStreakFreeze(userId)) {
            // Missed a day but has freeze available
            streakData.freezeUsed = true;
            streakData.currentStreak++; // Maintain streak
        } else {
            // Streak broken
            streakData.currentStreak = 1;
            streakData.freezeUsed = false;
        }
        
        streakData.lastActiveDate = new Date().toISOString();
        this.saveStreakData(userId, streakData);
        
        return {
            ...streakData,
            message: this.getStreakMessage(streakData)
        };
    }
    
    /**
     * Get leaderboard (weekly)
     */
    async getLeaderboard(timeframe = 'weekly', limit = 50) {
        // Mock: In production, query database for top users
        const leaderboard = Array.from({ length: limit }, (_, i) => ({
            rank: i + 1,
            userId: `user_${i}`,
            username: `Learner${i + 1}`,
            xp: 10000 - (i * 150),
            level: ['C2', 'C1', 'B2', 'B1', 'A2'][Math.floor(i / 10)] || 'A1',
            streak: Math.max(1, 30 - i),
            avatar: `/avatars/default_${(i % 10) + 1}.png`
        }));
        
        return {
            timeframe,
            leaderboard,
            userRank: Math.floor(Math.random() * limit) + 1,
            updatedAt: new Date()
        };
    }
    
    /**
     * Get user's progress dashboard
     */
    async getUserProgress(userId) {
        const stats = this.getUserStats(userId);
        const goals = this.getUserDailyGoals(userId);
        const streak = this.getUserStreak(userId);
        const achievements = this.getUserAchievements(userId);
        const leaderboardRank = await this.getUserLeaderboardRank(userId);
        
        return {
            level: stats.currentLevel,
            xp: stats.totalXP,
            xpToNextLevel: this.getXPToNextLevel(stats.totalXP),
            wordsLearned: stats.wordsLearned,
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            dailyGoals: goals,
            achievements: {
                unlocked: achievements.length,
                total: Object.keys(this.ACHIEVEMENTS).length,
                recent: achievements.slice(-5)
            },
            leaderboard: {
                rank: leaderboardRank,
                percentile: Math.round((1 - leaderboardRank / 10000) * 100)
            },
            stats: {
                videosWatched: stats.videosWatched,
                quizzesCompleted: stats.quizzesCompleted,
                gamesPlayed: stats.gamesPlayed,
                articlesRead: stats.articlesRead
            }
        };
    }
    
    /**
     * Generate shareable achievement image
     */
    generateShareableImage(achievement, userStats) {
        return {
            imageUrl: `/api/share/achievement/${achievement.id}`,
            title: achievement.name,
            description: achievement.description,
            shareText: `I just unlocked "${achievement.name}" on Langflix! 🎉 Learning Spanish has never been this fun!`,
            socialLinks: {
                twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.getShareText(achievement))}`,
                facebook: `https://facebook.com/sharer/sharer.php?u=https://langflix.app`,
                instagram: 'Copy link to share on Instagram'
            }
        };
    }
    
    // ===== Helper & Mock Functions =====
    
    getXPMessage(finalXP, multiplier, comboMultiplier) {
        if (multiplier >= 5.0) return `🎉 JACKPOT! ${finalXP} XP!`;
        if (multiplier >= 3.0) return `🔥 MEGA BONUS! ${finalXP} XP!`;
        if (multiplier >= 2.0) return `⚡ DOUBLE XP! ${finalXP} XP!`;
        if (comboMultiplier >= 2.0) return `🎯 COMBO! ${finalXP} XP!`;
        return `+${finalXP} XP`;
    }
    
    getStreakMessage(streakData) {
        if (streakData.currentStreak === 1) return '🌱 New streak started!';
        if (streakData.currentStreak === 7) return '🔥 7-day streak! You\'re on fire!';
        if (streakData.currentStreak === 30) return '⚡ 30-day streak! Unstoppable!';
        if (streakData.currentStreak === 100) return '💎 100-day streak! LEGENDARY!';
        return `🔥 ${streakData.currentStreak}-day streak!`;
    }
    
    getShareText(achievement) {
        return `I just unlocked "${achievement.name}" on Langflix! ${achievement.icon} Learning Spanish has never been this fun! Join me: https://langflix.app`;
    }
    
    getXPToNextLevel(currentXP) {
        // XP required doubles each level
        const level = Math.floor(Math.log2(currentXP / 100 + 1));
        const nextLevelXP = Math.pow(2, level + 1) * 100;
        return nextLevelXP - currentXP;
    }
    
    // Mock database functions (replace with real DB in production)
    
    storeXP(userId, xp) {
        // Mock: store in database
        console.log(`Awarded ${xp} XP to user ${userId}`);
    }
    
    getTotalXP(userId) {
        return Math.floor(Math.random() * 5000) + 1000; // Mock
    }
    
    getUserDailyGoals(userId) {
        return { ...this.DAILY_GOALS }; // Mock
    }
    
    getUserStreak(userId) {
    return {
            currentStreak: 7,
            longestStreak: 30,
            lastActiveDate: new Date().toISOString(),
            freezeUsed: false
        };
    }
    
    hasStreakFreeze(userId) {
        return true; // Mock: check if user has premium or earned freeze
    }
    
    saveStreakData(userId, streakData) {
        console.log(`Saved streak data for ${userId}:`, streakData);
    }
    
    getUserAchievements(userId) {
        // Mock: return some random achievements
        return [
            this.ACHIEVEMENTS.FIRST_WORD,
            this.ACHIEVEMENTS.STREAK_7,
            this.ACHIEVEMENTS.PERFECT_QUIZ
        ];
    }
    
    hasAchievement(userId, achievementId) {
        // Mock: check if user already has this achievement
        return false;
    }
    
    awardAchievement(userId, achievement) {
        console.log(`Awarded achievement "${achievement.name}" to user ${userId}`);
        this.storeXP(userId, achievement.xp);
    }
    
    getUserStats(userId) {
        return {
            currentLevel: 'B1.5',
            totalXP: 2500,
            wordsLearned: 450,
            videosWatched: 75,
            quizzesCompleted: 30,
            gamesPlayed: 20,
            articlesRead: 12,
            conversationsPracticed: 5,
            perfectQuizzes: 3,
            maxCorrectStreak: 8
        };
    }
    
    async getUserLeaderboardRank(userId) {
        return Math.floor(Math.random() * 1000) + 1; // Mock: 1-1000
    }
}

    module.exports = GamificationSystem;
