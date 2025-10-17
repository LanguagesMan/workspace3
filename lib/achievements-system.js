// 🏆 ACHIEVEMENTS SYSTEM - Gamification & Milestones
// Inspired by: Duolingo, Memrise, Steam Achievements

class AchievementsSystem {
    constructor() {
        this.achievements = this.defineAchievements();
        this.userProgress = this.loadUserProgress();
    }

    defineAchievements() {
        return [
            // === BEGINNER ACHIEVEMENTS (First Steps) ===
            {
                id: 'first_video',
                name: 'First Steps',
                description: 'Watch your first Spanish video',
                icon: '👶',
                type: 'video',
                requirement: { videosWatched: 1 },
                xpReward: 10,
                tier: 'bronze'
            },
            {
                id: 'first_word',
                name: 'Vocab Collector',
                description: 'Save your first Spanish word',
                icon: '📝',
                type: 'vocabulary',
                requirement: { wordsSaved: 1 },
                xpReward: 10,
                tier: 'bronze'
            },
            {
                id: 'first_streak',
                name: 'Consistency',
                description: 'Maintain a 1-day streak',
                icon: '🔥',
                type: 'streak',
                requirement: { streak: 1 },
                xpReward: 10,
                tier: 'bronze'
            },

            // === BRONZE ACHIEVEMENTS (Getting Started) ===
            {
                id: 'ten_videos',
                name: 'Binge Watcher',
                description: 'Watch 10 Spanish videos',
                icon: '📺',
                type: 'video',
                requirement: { videosWatched: 10 },
                xpReward: 50,
                tier: 'bronze'
            },
            {
                id: 'ten_words',
                name: 'Vocabulary Builder',
                description: 'Save 10 Spanish words',
                icon: '📚',
                type: 'vocabulary',
                requirement: { wordsSaved: 10 },
                xpReward: 50,
                tier: 'bronze'
            },
            {
                id: 'three_day_streak',
                name: 'Getting Serious',
                description: 'Maintain a 3-day streak',
                icon: '🔥',
                type: 'streak',
                requirement: { streak: 3 },
                xpReward: 50,
                tier: 'bronze'
            },
            {
                id: 'first_game',
                name: 'Game On',
                description: 'Complete your first game',
                icon: '🎮',
                type: 'game',
                requirement: { gamesPlayed: 1 },
                xpReward: 30,
                tier: 'bronze'
            },

            // === SILVER ACHIEVEMENTS (Building Momentum) ===
            {
                id: 'fifty_videos',
                name: 'Video Marathon',
                description: 'Watch 50 Spanish videos',
                icon: '🎬',
                type: 'video',
                requirement: { videosWatched: 50 },
                xpReward: 100,
                tier: 'silver'
            },
            {
                id: 'fifty_words',
                name: 'Word Master',
                description: 'Save 50 Spanish words',
                icon: '🎓',
                type: 'vocabulary',
                requirement: { wordsSaved: 50 },
                xpReward: 100,
                tier: 'silver'
            },
            {
                id: 'seven_day_streak',
                name: 'Week Warrior',
                description: 'Maintain a 7-day streak',
                icon: '🔥',
                type: 'streak',
                requirement: { streak: 7 },
                xpReward: 100,
                tier: 'silver'
            },
            {
                id: 'ten_games',
                name: 'Game Enthusiast',
                description: 'Complete 10 games',
                icon: '🎯',
                type: 'game',
                requirement: { gamesPlayed: 10 },
                xpReward: 75,
                tier: 'silver'
            },
            {
                id: 'level_up',
                name: 'Level Up!',
                description: 'Reach level 5',
                icon: '⬆️',
                type: 'level',
                requirement: { level: 5 },
                xpReward: 100,
                tier: 'silver'
            },

            // === GOLD ACHIEVEMENTS (Committed Learner) ===
            {
                id: 'hundred_videos',
                name: 'Century Club',
                description: 'Watch 100 Spanish videos',
                icon: '💯',
                type: 'video',
                requirement: { videosWatched: 100 },
                xpReward: 200,
                tier: 'gold'
            },
            {
                id: 'hundred_words',
                name: 'Vocab Genius',
                description: 'Save 100 Spanish words',
                icon: '🧠',
                type: 'vocabulary',
                requirement: { wordsSaved: 100 },
                xpReward: 200,
                tier: 'gold'
            },
            {
                id: 'thirty_day_streak',
                name: 'Monthly Master',
                description: 'Maintain a 30-day streak',
                icon: '🏆',
                type: 'streak',
                requirement: { streak: 30 },
                xpReward: 500,
                tier: 'gold'
            },
            {
                id: 'all_games',
                name: 'Game Master',
                description: 'Try all available games',
                icon: '🎮',
                type: 'game',
                requirement: { uniqueGames: 5 },
                xpReward: 150,
                tier: 'gold'
            },
            {
                id: 'perfect_quiz',
                name: 'Perfect Score',
                description: 'Score 100% on a quiz',
                icon: '💯',
                type: 'quiz',
                requirement: { perfectQuizzes: 1 },
                xpReward: 150,
                tier: 'gold'
            },

            // === PLATINUM ACHIEVEMENTS (Elite) ===
            {
                id: 'five_hundred_videos',
                name: 'Video Legend',
                description: 'Watch 500 Spanish videos',
                icon: '👑',
                type: 'video',
                requirement: { videosWatched: 500 },
                xpReward: 1000,
                tier: 'platinum'
            },
            {
                id: 'five_hundred_words',
                name: 'Vocabulary Legend',
                description: 'Save 500 Spanish words',
                icon: '📖',
                type: 'vocabulary',
                requirement: { wordsSaved: 500 },
                xpReward: 1000,
                tier: 'platinum'
            },
            {
                id: 'hundred_day_streak',
                name: 'Centurion',
                description: 'Maintain a 100-day streak',
                icon: '🔥',
                type: 'streak',
                requirement: { streak: 100 },
                xpReward: 2000,
                tier: 'platinum'
            },
            {
                id: 'level_ten',
                name: 'Level 10 Legend',
                description: 'Reach level 10',
                icon: '⭐',
                type: 'level',
                requirement: { level: 10 },
                xpReward: 500,
                tier: 'platinum'
            },

            // === SPECIAL ACHIEVEMENTS ===
            {
                id: 'early_bird',
                name: 'Early Bird',
                description: 'Practice before 8 AM',
                icon: '🌅',
                type: 'special',
                requirement: { earlyBird: true },
                xpReward: 50,
                tier: 'special'
            },
            {
                id: 'night_owl',
                name: 'Night Owl',
                description: 'Practice after 10 PM',
                icon: '🦉',
                type: 'special',
                requirement: { nightOwl: true },
                xpReward: 50,
                tier: 'special'
            },
            {
                id: 'speedster',
                name: 'Speedster',
                description: 'Watch 10 videos in one session',
                icon: '⚡',
                type: 'special',
                requirement: { videosInSession: 10 },
                xpReward: 75,
                tier: 'special'
            },
            {
                id: 'perfectionist',
                name: 'Perfectionist',
                description: 'Get 10 perfect quiz scores',
                icon: '💎',
                type: 'special',
                requirement: { perfectQuizzes: 10 },
                xpReward: 300,
                tier: 'special'
            }
        ];
    }

    loadUserProgress() {
        const saved = localStorage.getItem('achievementsProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            unlockedAchievements: [],
            stats: {
                videosWatched: 0,
                wordsSaved: 0,
                streak: 0,
                gamesPlayed: 0,
                uniqueGames: 0,
                level: 1,
                perfectQuizzes: 0,
                earlyBird: false,
                nightOwl: false,
                videosInSession: 0
            }
        };
    }

    saveProgress() {
        localStorage.setItem('achievementsProgress', JSON.stringify(this.userProgress));
    }

    checkAchievements(statUpdate) {
        // Update user stats
        Object.assign(this.userProgress.stats, statUpdate);
        
        const newAchievements = [];
        
        // Check each achievement
        for (const achievement of this.achievements) {
            // Skip if already unlocked
            if (this.userProgress.unlockedAchievements.includes(achievement.id)) {
                continue;
            }
            
            // Check if requirements are met
            if (this.meetsRequirements(achievement.requirement)) {
                this.userProgress.unlockedAchievements.push(achievement.id);
                newAchievements.push(achievement);
            }
        }
        
        this.saveProgress();
        
        return newAchievements;
    }

    meetsRequirements(requirement) {
        for (const [key, value] of Object.entries(requirement)) {
            if (this.userProgress.stats[key] < value) {
                return false;
            }
        }
        return true;
    }

    getUnlockedAchievements() {
        return this.achievements.filter(a => 
            this.userProgress.unlockedAchievements.includes(a.id)
        );
    }

    getLockedAchievements() {
        return this.achievements.filter(a => 
            !this.userProgress.unlockedAchievements.includes(a.id)
        );
    }

    getProgress() {
        const total = this.achievements.length;
        const unlocked = this.userProgress.unlockedAchievements.length;
        return {
            unlocked,
            total,
            percentage: Math.round((unlocked / total) * 100)
        };
    }

    // Get achievements by tier
    getByTier(tier) {
        return this.achievements.filter(a => a.tier === tier);
    }

    // Get next achievements to unlock (closest to completion)
    getNextToUnlock(limit = 3) {
        const locked = this.getLockedAchievements();
        
        // Calculate progress for each locked achievement
        const withProgress = locked.map(achievement => {
            const progress = this.calculateProgress(achievement);
            return { ...achievement, progress };
        });
        
        // Sort by progress (closest to completion first)
        withProgress.sort((a, b) => b.progress - a.progress);
        
        return withProgress.slice(0, limit);
    }

    calculateProgress(achievement) {
        const req = achievement.requirement;
        const stats = this.userProgress.stats;
        
        let totalProgress = 0;
        let count = 0;
        
        for (const [key, targetValue] of Object.entries(req)) {
            const currentValue = stats[key] || 0;
            const progress = Math.min(100, (currentValue / targetValue) * 100);
            totalProgress += progress;
            count++;
        }
        
        return count > 0 ? totalProgress / count : 0;
    }
}

// Export for use in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementsSystem;
}
