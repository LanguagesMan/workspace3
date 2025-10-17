/**
 * 👤 USER PROGRESS SERVICE
 * Complete user progress tracking system
 */

const fs = require('fs');
const path = require('path');

class UserProgressService {
    constructor(dataDir = null) {
        this.dataDir = dataDir || path.join(__dirname, '../../data/users');
        this.ensureDataDir();
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    /**
     * Create new user profile
     */
    createUser(userId, initialData = {}) {
        const user = {
            id: userId,
            profile: {
                name: initialData.name || 'Learner',
                email: initialData.email || null,
                level: initialData.level || 'A1',
                targetLevel: initialData.targetLevel || 'B2',
                interests: initialData.interests || ['general'],
                nativeLanguage: 'English',
                learningLanguage: 'Spanish'
            },
            progress: {
                xp: 0,
                level: 'A1',
                levelProgress: 0, // 0-100%
                totalVideosWatched: 0,
                totalWordsLearned: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: new Date().toISOString().split('T')[0]
            },
            wordBank: {
                saved: [], // Words user has saved
                mastered: [], // Words user has mastered
                learning: [], // Words currently learning
                weak: [] // Words that need review
            },
            engagement: {
                videosCompleted: [],
                videosLiked: [],
                videosSaved: [],
                quizzesCompleted: [],
                gamesPlayed: [],
                articlesRead: []
            },
            achievements: [],
            settings: {
                notifications: true,
                autoplay: true,
                subtitles: 'both', // 'spanish', 'english', 'both', 'none'
                playbackSpeed: 1.0
            },
            stats: {
                totalTimeSpent: 0, // minutes
                avgSessionTime: 0,
                bestStreak: 0,
                totalXPEarned: 0,
                dailyGoal: 50, // XP per day
                dailyGoalStreak: 0
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.saveUser(user);
        return user;
    }

    /**
     * Get user by ID
     */
    getUser(userId) {
        const filePath = path.join(this.dataDir, `${userId}.json`);
        
        if (!fs.existsSync(filePath)) {
            return this.createUser(userId);
        }

        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }

    /**
     * Save user data
     */
    saveUser(user) {
        user.updatedAt = new Date().toISOString();
        const filePath = path.join(this.dataDir, `${user.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(user, null, 2));
    }

    /**
     * Award XP to user
     */
    awardXP(userId, amount, source = 'general') {
        const user = this.getUser(userId);
        
        // Add XP
        user.progress.xp += amount;
        user.stats.totalXPEarned += amount;

        // Check for level up
        const newLevel = this.calculateLevel(user.progress.xp);
        if (newLevel !== user.progress.level) {
            user.progress.level = newLevel;
            
            // Award achievement
            this.awardAchievement(user, {
                id: `level_${newLevel}`,
                name: `Reached ${newLevel}`,
                description: `You've reached level ${newLevel}!`,
                icon: '🎉',
                xp: 50
            });
        }

        // Update level progress
        user.progress.levelProgress = this.calculateLevelProgress(user.progress.xp);

        this.saveUser(user);

        return {
            xp: amount,
            totalXP: user.progress.xp,
            level: user.progress.level,
            levelProgress: user.progress.levelProgress,
            leveledUp: newLevel !== user.progress.level
        };
    }

    /**
     * Calculate CEFR level from XP
     */
    calculateLevel(xp) {
        if (xp < 500) return 'A1';
        if (xp < 1500) return 'A2';
        if (xp < 3500) return 'B1';
        if (xp < 6500) return 'B2';
        if (xp < 10000) return 'C1';
        return 'C2';
    }

    /**
     * Calculate progress within current level (0-100%)
     */
    calculateLevelProgress(xp) {
        const levels = [
            { level: 'A1', min: 0, max: 500 },
            { level: 'A2', min: 500, max: 1500 },
            { level: 'B1', min: 1500, max: 3500 },
            { level: 'B2', min: 3500, max: 6500 },
            { level: 'C1', min: 6500, max: 10000 },
            { level: 'C2', min: 10000, max: Infinity }
        ];

        for (const { min, max } of levels) {
            if (xp >= min && xp < max) {
                return Math.round(((xp - min) / (max - min)) * 100);
            }
        }

        return 100; // Max level
    }

    /**
     * Save word to user's word bank
     */
    saveWord(userId, word, context = {}) {
        const user = this.getUser(userId);

        const wordData = {
            word: word,
            translation: context.translation || '',
            context: context.sentence || '',
            videoId: context.videoId || null,
            level: context.level || user.progress.level,
            savedAt: new Date().toISOString(),
            reviewCount: 0,
            lastReviewed: null,
            strength: 0, // 0-100
            nextReview: this.calculateNextReview(0)
        };

        // Add to saved words if not already there
        if (!user.wordBank.saved.find(w => w.word === word)) {
            user.wordBank.saved.push(wordData);
            user.wordBank.learning.push(word);
            user.progress.totalWordsLearned++;

            // Award XP
            this.awardXP(userId, 5, 'word_saved');
        }

        this.saveUser(user);
        return wordData;
    }

    /**
     * Calculate next review date using spaced repetition
     */
    calculateNextReview(strength) {
        const intervals = [1, 3, 7, 14, 30, 60, 120]; // days
        const index = Math.min(Math.floor(strength / 15), intervals.length - 1);
        const days = intervals[index];
        
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + days);
        return nextDate.toISOString();
    }

    /**
     * Update streak
     */
    updateStreak(userId) {
        const user = this.getUser(userId);
        const today = new Date().toISOString().split('T')[0];
        const lastActive = user.progress.lastActiveDate;

        if (lastActive === today && user.progress.currentStreak > 0) {
            // Already active today
            return user.progress.currentStreak;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActive === yesterdayStr) {
            // Continuing streak
            user.progress.currentStreak++;
        } else {
            // Streak broken
            user.progress.currentStreak = 1;
        }

        // Update longest streak
        if (user.progress.currentStreak > user.progress.longestStreak) {
            user.progress.longestStreak = user.progress.currentStreak;
        }

        user.progress.lastActiveDate = today;

        // Streak milestones
        if (user.progress.currentStreak % 7 === 0) {
            this.awardAchievement(user, {
                id: `streak_${user.progress.currentStreak}`,
                name: `${user.progress.currentStreak} Day Streak!`,
                description: `You've maintained a ${user.progress.currentStreak} day streak!`,
                icon: '🔥',
                xp: user.progress.currentStreak * 5
            });
        }

        this.saveUser(user);
        return user.progress.currentStreak;
    }

    /**
     * Track video completion
     */
    trackVideoCompletion(userId, videoId, watchTime = 0) {
        const user = this.getUser(userId);

        if (!user.engagement.videosCompleted.includes(videoId)) {
            user.engagement.videosCompleted.push(videoId);
            user.progress.totalVideosWatched++;

            // Award XP based on video difficulty
            const xp = this.calculateVideoXP(videoId, user.progress.level);
            this.awardXP(userId, xp, 'video_completed');

            // Update streak
            this.updateStreak(userId);
        }

        this.saveUser(user);
    }

    /**
     * Calculate XP for video based on difficulty
     */
    calculateVideoXP(videoId, userLevel) {
        // Base XP: 20-50 depending on video difficulty
        const baseXP = 30;
        
        // Bonus for watching harder content
        const bonus = Math.random() > 0.7 ? 10 : 0; // 30% chance of bonus
        
        return baseXP + bonus;
    }

    /**
     * Award achievement
     */
    awardAchievement(user, achievement) {
        if (!user.achievements.find(a => a.id === achievement.id)) {
            achievement.awardedAt = new Date().toISOString();
            user.achievements.push(achievement);
            
            // Award XP if specified
            if (achievement.xp) {
                user.progress.xp += achievement.xp;
            }
        }
    }

    /**
     * Get user dashboard data
     */
    getDashboard(userId) {
        const user = this.getUser(userId);

        return {
            profile: user.profile,
            progress: {
                level: user.progress.level,
                xp: user.progress.xp,
                levelProgress: user.progress.levelProgress,
                nextLevelXP: this.getNextLevelXP(user.progress.xp),
                streak: user.progress.currentStreak,
                longestStreak: user.progress.longestStreak
            },
            stats: {
                videosWatched: user.progress.totalVideosWatched,
                wordsLearned: user.progress.totalWordsLearned,
                quizzesCompleted: user.engagement.quizzesCompleted.length,
                gamesPlayed: user.engagement.gamesPlayed.length,
                totalXP: user.stats.totalXPEarned
            },
            recentAchievements: user.achievements.slice(-5).reverse(),
            wordBank: {
                total: user.wordBank.saved.length,
                learning: user.wordBank.learning.length,
                mastered: user.wordBank.mastered.length,
                needsReview: this.getWordsNeedingReview(user).length
            }
        };
    }

    /**
     * Get XP needed for next level
     */
    getNextLevelXP(currentXP) {
        const thresholds = [500, 1500, 3500, 6500, 10000];
        for (const threshold of thresholds) {
            if (currentXP < threshold) {
                return threshold - currentXP;
            }
        }
        return 0; // Max level
    }

    /**
     * Get words that need review
     */
    getWordsNeedingReview(user) {
        const now = new Date();
        return user.wordBank.saved.filter(word => {
            if (!word.nextReview) return true;
            return new Date(word.nextReview) <= now;
        });
    }

    /**
     * Get practice session (words to review)
     */
    getPracticeSession(userId, count = 10) {
        const user = this.getUser(userId);
        const wordsToReview = this.getWordsNeedingReview(user);
        
        // Prioritize weak words
        const sorted = wordsToReview.sort((a, b) => a.strength - b.strength);
        
        return sorted.slice(0, count);
    }

    /**
     * Get all users (for testing)
     */
    getAllUsers() {
        const files = fs.readdirSync(this.dataDir).filter(f => f.endsWith('.json'));
        return files.map(f => {
            const data = fs.readFileSync(path.join(this.dataDir, f), 'utf8');
            return JSON.parse(data);
        });
    }
}

module.exports = UserProgressService;

// CLI testing
if (require.main === module) {
    const service = new UserProgressService();
    
    // Create test user
    const user = service.createUser('test-user-001', {
        name: 'Test User',
        level: 'A1'
    });
    
    console.log('✅ Created user:', user.id);
    
    // Award XP
    service.awardXP('test-user-001', 100, 'test');
    console.log('✅ Awarded 100 XP');
    
    // Save word
    service.saveWord('test-user-001', 'hola', {
        translation: 'hello',
        sentence: 'Hola, ¿cómo estás?'
    });
    console.log('✅ Saved word: hola');
    
    // Get dashboard
    const dashboard = service.getDashboard('test-user-001');
    console.log('\n📊 Dashboard:');
    console.log(JSON.stringify(dashboard, null, 2));
}
