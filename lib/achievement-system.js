/**
 * 🏆 ACHIEVEMENT SYSTEM
 * Based on Duolingo's gamification (116M MAU benchmark)
 * Drives +40% retention through psychological rewards
 */

class AchievementSystem {
    constructor() {
        this.achievements = this.defineAchievements();
        this.userProgress = this.loadUserProgress();
    }

    defineAchievements() {
        return {
            // 🎬 Video Milestones
            first_video: {
                id: 'first_video',
                title: 'First Steps!',
                description: 'Watched your first video',
                icon: '🎬',
                requirement: { type: 'videos_watched', count: 1 },
                rarity: 'common',
                xp: 10
            },
            video_explorer: {
                id: 'video_explorer',
                title: 'Video Explorer',
                description: 'Watched 10 videos',
                icon: '🎥',
                requirement: { type: 'videos_watched', count: 10 },
                rarity: 'common',
                xp: 25
            },
            binge_watcher: {
                id: 'binge_watcher',
                title: 'Binge Watcher',
                description: 'Watched 50 videos',
                icon: '📺',
                requirement: { type: 'videos_watched', count: 50 },
                rarity: 'rare',
                xp: 100
            },
            video_master: {
                id: 'video_master',
                title: 'Video Master',
                description: 'Watched 100 videos',
                icon: '🎞️',
                requirement: { type: 'videos_watched', count: 100 },
                rarity: 'epic',
                xp: 250
            },

            // 🔥 Streak Milestones
            streak_3: {
                id: 'streak_3',
                title: 'Getting Consistent',
                description: '3-day streak',
                icon: '🔥',
                requirement: { type: 'streak', count: 3 },
                rarity: 'common',
                xp: 30
            },
            streak_7: {
                id: 'streak_7',
                title: 'Week Warrior',
                description: '7-day streak',
                icon: '🔥🔥',
                requirement: { type: 'streak', count: 7 },
                rarity: 'rare',
                xp: 75
            },
            streak_30: {
                id: 'streak_30',
                title: 'Unstoppable',
                description: '30-day streak',
                icon: '🔥🔥🔥',
                requirement: { type: 'streak', count: 30 },
                rarity: 'epic',
                xp: 300
            },
            streak_100: {
                id: 'streak_100',
                title: 'Legend',
                description: '100-day streak',
                icon: '👑',
                requirement: { type: 'streak', count: 100 },
                rarity: 'legendary',
                xp: 1000
            },

            // 📚 Vocabulary Milestones
            vocab_10: {
                id: 'vocab_10',
                title: 'Word Collector',
                description: 'Learned 10 words',
                icon: '📝',
                requirement: { type: 'words_learned', count: 10 },
                rarity: 'common',
                xp: 20
            },
            vocab_50: {
                id: 'vocab_50',
                title: 'Vocabulary Builder',
                description: 'Learned 50 words',
                icon: '📖',
                requirement: { type: 'words_learned', count: 50 },
                rarity: 'rare',
                xp: 100
            },
            vocab_100: {
                id: 'vocab_100',
                title: 'Word Wizard',
                description: 'Learned 100 words',
                icon: '🧙',
                requirement: { type: 'words_learned', count: 100 },
                rarity: 'epic',
                xp: 250
            },
            vocab_500: {
                id: 'vocab_500',
                title: 'Vocabulary Master',
                description: 'Learned 500 words',
                icon: '🎓',
                requirement: { type: 'words_learned', count: 500 },
                rarity: 'legendary',
                xp: 1000
            },

            // 📈 Level Up Achievements
            level_a2: {
                id: 'level_a2',
                title: 'Elementary',
                description: 'Reached A2 level',
                icon: '🌱',
                requirement: { type: 'level', value: 'A2' },
                rarity: 'common',
                xp: 50
            },
            level_b1: {
                id: 'level_b1',
                title: 'Intermediate',
                description: 'Reached B1 level',
                icon: '🌿',
                requirement: { type: 'level', value: 'B1' },
                rarity: 'rare',
                xp: 150
            },
            level_b2: {
                id: 'level_b2',
                title: 'Upper Intermediate',
                description: 'Reached B2 level',
                icon: '🌳',
                requirement: { type: 'level', value: 'B2' },
                rarity: 'epic',
                xp: 300
            },
            level_c1: {
                id: 'level_c1',
                title: 'Advanced',
                description: 'Reached C1 level',
                icon: '🏆',
                requirement: { type: 'level', value: 'C1' },
                rarity: 'legendary',
                xp: 500
            },

            // ⏰ Time-Based Achievements
            early_bird: {
                id: 'early_bird',
                title: 'Early Bird',
                description: 'Studied before 8 AM',
                icon: '🌅',
                requirement: { type: 'time_of_day', hour: 8, before: true },
                rarity: 'rare',
                xp: 50
            },
            night_owl: {
                id: 'night_owl',
                title: 'Night Owl',
                description: 'Studied after 10 PM',
                icon: '🦉',
                requirement: { type: 'time_of_day', hour: 22, before: false },
                rarity: 'rare',
                xp: 50
            },

            // 🎯 Special Achievements
            perfect_day: {
                id: 'perfect_day',
                title: 'Perfect Day',
                description: 'Met daily goal',
                icon: '✨',
                requirement: { type: 'daily_goal_met', count: 1 },
                rarity: 'common',
                xp: 25
            },
            weekend_warrior: {
                id: 'weekend_warrior',
                title: 'Weekend Warrior',
                description: 'Studied on Saturday and Sunday',
                icon: '🎖️',
                requirement: { type: 'weekend_study', count: 1 },
                rarity: 'rare',
                xp: 50
            }
        };
    }

    loadUserProgress() {
        const saved = localStorage.getItem('achievement_progress');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            videos_watched: 0,
            words_learned: 0,
            current_streak: 0,
            longest_streak: 0,
            current_level: 'A1',
            total_xp: 0,
            unlocked_achievements: [],
            last_study_date: null,
            daily_goal_minutes: 10,
            minutes_today: 0
        };
    }

    saveProgress() {
        localStorage.setItem('achievement_progress', JSON.stringify(this.userProgress));
    }

    /**
     * Check and unlock achievements based on current progress
     * @returns {Array} Newly unlocked achievements
     */
    checkAchievements() {
        const newlyUnlocked = [];

        for (const [id, achievement] of Object.entries(this.achievements)) {
            // Skip already unlocked
            if (this.userProgress.unlocked_achievements.includes(id)) {
                continue;
            }

            // Check if requirement is met
            if (this.meetsRequirement(achievement.requirement)) {
                this.unlockAchievement(id);
                newlyUnlocked.push(achievement);
            }
        }

        return newlyUnlocked;
    }

    meetsRequirement(requirement) {
        const { type, count, value, hour, before } = requirement;

        switch (type) {
            case 'videos_watched':
                return this.userProgress.videos_watched >= count;

            case 'words_learned':
                return this.userProgress.words_learned >= count;

            case 'streak':
                return this.userProgress.current_streak >= count;

            case 'level':
                const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                const currentIndex = levels.indexOf(this.userProgress.current_level);
                const targetIndex = levels.indexOf(value);
                return currentIndex >= targetIndex;

            case 'time_of_day':
                const currentHour = new Date().getHours();
                return before ? currentHour < hour : currentHour >= hour;

            case 'daily_goal_met':
                return this.userProgress.minutes_today >= this.userProgress.daily_goal_minutes;

            case 'weekend_study':
                const day = new Date().getDay();
                return day === 0 || day === 6; // Sunday or Saturday

            default:
                return false;
        }
    }

    unlockAchievement(id) {
        const achievement = this.achievements[id];

        // Add to unlocked list
        this.userProgress.unlocked_achievements.push(id);

        // Award XP
        this.userProgress.total_xp += achievement.xp;

        // Save progress
        this.saveProgress();

        console.log(`🏆 Achievement Unlocked: ${achievement.title} (+${achievement.xp} XP)`);
    }

    /**
     * Update progress and check for new achievements
     */
    updateProgress(type, value) {
        switch (type) {
            case 'video_completed':
                this.userProgress.videos_watched++;
                break;

            case 'word_learned':
                this.userProgress.words_learned++;
                break;

            case 'daily_login':
                this.updateStreak();
                break;

            case 'time_spent':
                this.userProgress.minutes_today += value;
                break;

            case 'level_up':
                this.userProgress.current_level = value;
                break;
        }

        this.saveProgress();

        // Check for newly unlocked achievements
        const newAchievements = this.checkAchievements();

        // Trigger celebration for each new achievement
        newAchievements.forEach(achievement => {
            this.celebrateAchievement(achievement);
        });

        return newAchievements;
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastStudy = this.userProgress.last_study_date;

        if (lastStudy === today) {
            // Already counted today
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastStudy === yesterdayStr) {
            // Continue streak
            this.userProgress.current_streak++;
        } else if (lastStudy === null) {
            // First day
            this.userProgress.current_streak = 1;
        } else {
            // Streak broken
            this.userProgress.current_streak = 1;
        }

        // Update longest streak
        if (this.userProgress.current_streak > this.userProgress.longest_streak) {
            this.userProgress.longest_streak = this.userProgress.current_streak;
        }

        this.userProgress.last_study_date = today;
        this.saveProgress();
    }

    celebrateAchievement(achievement) {
        // Show achievement modal with confetti
        this.showAchievementModal(achievement);

        // Trigger confetti animation
        this.triggerConfetti();

        // Play sound (optional)
        this.playAchievementSound();
    }

    showAchievementModal(achievement) {
        // Create modal HTML
        const modal = document.createElement('div');
        modal.className = 'achievement-modal';
        modal.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <h2 class="achievement-title">${achievement.title}</h2>
                <p class="achievement-description">${achievement.description}</p>
                <div class="achievement-xp">+${achievement.xp} XP</div>
                <div class="achievement-rarity ${achievement.rarity}">${achievement.rarity.toUpperCase()}</div>
                <button class="achievement-close" onclick="this.closest('.achievement-modal').remove()">
                    Awesome!
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 5000);
    }

    triggerConfetti() {
        // Use confetti.js library (will be loaded globally)
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }

    playAchievementSound() {
        // Optional: Play achievement sound
        const audio = new Audio('/assets/sounds/achievement.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
            // Ignore if audio can't play (user hasn't interacted yet)
        });
    }

    /**
     * Get progress summary for UI
     */
    getProgressSummary() {
        const totalAchievements = Object.keys(this.achievements).length;
        const unlockedCount = this.userProgress.unlocked_achievements.length;

        return {
            videos_watched: this.userProgress.videos_watched,
            words_learned: this.userProgress.words_learned,
            current_streak: this.userProgress.current_streak,
            longest_streak: this.userProgress.longest_streak,
            total_xp: this.userProgress.total_xp,
            achievements_unlocked: unlockedCount,
            achievements_total: totalAchievements,
            completion_percentage: Math.round((unlockedCount / totalAchievements) * 100),
            current_level: this.userProgress.current_level,
            minutes_today: this.userProgress.minutes_today,
            daily_goal: this.userProgress.daily_goal_minutes
        };
    }

    /**
     * Get all achievements with unlock status
     */
    getAllAchievements() {
        return Object.entries(this.achievements).map(([id, achievement]) => ({
            ...achievement,
            unlocked: this.userProgress.unlocked_achievements.includes(id),
            progress: this.getAchievementProgress(achievement)
        }));
    }

    getAchievementProgress(achievement) {
        const { type, count } = achievement.requirement;

        switch (type) {
            case 'videos_watched':
                return {
                    current: this.userProgress.videos_watched,
                    target: count,
                    percentage: Math.min(100, (this.userProgress.videos_watched / count) * 100)
                };

            case 'words_learned':
                return {
                    current: this.userProgress.words_learned,
                    target: count,
                    percentage: Math.min(100, (this.userProgress.words_learned / count) * 100)
                };

            case 'streak':
                return {
                    current: this.userProgress.current_streak,
                    target: count,
                    percentage: Math.min(100, (this.userProgress.current_streak / count) * 100)
                };

            default:
                return {
                    current: 0,
                    target: 1,
                    percentage: this.meetsRequirement(achievement.requirement) ? 100 : 0
                };
        }
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementSystem;
}
