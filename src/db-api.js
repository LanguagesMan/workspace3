// 🗄️ DATABASE API - Unified endpoints for vocabulary, stats, progress

const express = require('express');
const router = express.Router();

// Simple in-memory database (replace with Prisma in production)
const db = {
    users: new Map(),
    words: new Map(),
    progress: [],
    sessions: []
};

// 👤 GET USER LEVEL
router.get('/user/level/:userId', (req, res) => {
    const { userId } = req.params;

    const user = db.users.get(userId) || {
        id: userId,
        currentLevel: 'A1',
        streak: 0,
        totalXP: 0,
        wordsCount: 0
    };

    res.json({
        success: true,
        level: user.currentLevel,
        xp: user.totalXP,
        streak: user.streak,
        wordsCount: user.wordsCount
    });
});

// 📝 GET USER WORDS
router.get('/user/words/:userId', (req, res) => {
    const { userId } = req.params;
    const { level } = req.query;

    let words = Array.from(db.words.values())
        .filter(w => w.userId === userId);

    if (level) {
        words = words.filter(w => w.level === level);
    }

    const byLevel = {
        A1: words.filter(w => w.level === 'A1').length,
        A2: words.filter(w => w.level === 'A2').length,
        B1: words.filter(w => w.level === 'B1').length,
        B2: words.filter(w => w.level === 'B2').length,
        C1: words.filter(w => w.level === 'C1').length,
        C2: words.filter(w => w.level === 'C2').length
    };

    res.json({
        success: true,
        words: words,
        total: words.length,
        byLevel: byLevel,
        mastered: words.filter(w => w.mastered).length
    });
});

// ✅ POST WORDS LEARNED
router.post('/words/learned', (req, res) => {
    const { userId, word, translation, level, context } = req.body;

    const wordId = `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const wordData = {
        id: wordId,
        userId: userId,
        word: word,
        translation: translation,
        level: level || 'A2',
        context: context || '',
        savedAt: new Date().toISOString(),
        reviewCount: 0,
        mastered: false
    };

    db.words.set(wordId, wordData);

    // Update user stats
    let user = db.users.get(userId);
    if (!user) {
        user = {
            id: userId,
            currentLevel: level || 'A2',
            streak: 0,
            totalXP: 0,
            wordsCount: 0
        };
    }

    user.wordsCount = (user.wordsCount || 0) + 1;
    user.totalXP = (user.totalXP || 0) + 10; // 10 XP per word
    db.users.set(userId, user);

    // Track progress
    db.progress.push({
        userId: userId,
        date: new Date().toISOString(),
        action: 'word_learned',
        word: word,
        xpEarned: 10
    });

    res.json({
        success: true,
        word: wordData,
        userStats: {
            totalWords: user.wordsCount,
            totalXP: user.totalXP,
            level: user.currentLevel
        }
    });
});

// 📊 GET USER STATS (Wispr Flow style)
router.get('/user/stats/:userId', (req, res) => {
    const { userId } = req.params;

    const user = db.users.get(userId) || {
        id: userId,
        currentLevel: 'A1',
        streak: 0,
        totalXP: 0,
        wordsCount: 0
    };

    const words = Array.from(db.words.values())
        .filter(w => w.userId === userId);

    const userProgress = db.progress.filter(p => p.userId === userId);

    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const todayProgress = userProgress.filter(p =>
        p.date.startsWith(today)
    );

    const weekProgress = getLast7Days().map(date => ({
        date: date,
        words: userProgress.filter(p => p.date.startsWith(date)).length,
        xp: userProgress.filter(p => p.date.startsWith(date))
            .reduce((sum, p) => sum + (p.xpEarned || 0), 0)
    }));

    const stats = {
        user: {
            id: userId,
            level: user.currentLevel,
            xp: user.totalXP,
            streak: user.streak,
            longestStreak: user.longestStreak || user.streak
        },
        vocabulary: {
            total: words.length,
            mastered: words.filter(w => w.mastered).length,
            learning: words.filter(w => !w.mastered).length,
            byLevel: {
                A1: words.filter(w => w.level === 'A1').length,
                A2: words.filter(w => w.level === 'A2').length,
                B1: words.filter(w => w.level === 'B1').length,
                B2: words.filter(w => w.level === 'B2').length,
                C1: words.filter(w => w.level === 'C1').length,
                C2: words.filter(w => w.level === 'C2').length
            }
        },
        today: {
            wordsLearned: todayProgress.length,
            xpEarned: todayProgress.reduce((sum, p) => sum + (p.xpEarned || 0), 0),
            timeSpent: 0 // TODO: track time
        },
        weekProgress: weekProgress,
        achievements: getAchievements(userId, words.length, user.streak)
    };

    res.json({
        success: true,
        stats: stats
    });
});

// 📈 GET PROGRESS HISTORY
router.get('/user/progress/:userId', (req, res) => {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const userProgress = db.progress
        .filter(p => p.userId === userId)
        .slice(-days);

    const dailyStats = {};

    userProgress.forEach(p => {
        const date = p.date.split('T')[0];
        if (!dailyStats[date]) {
            dailyStats[date] = {
                date: date,
                words: 0,
                xp: 0
            };
        }
        dailyStats[date].words += 1;
        dailyStats[date].xp += p.xpEarned || 0;
    });

    res.json({
        success: true,
        progress: Object.values(dailyStats)
    });
});

// 🏆 HELPER: Get achievements
function getAchievements(userId, wordCount, streak) {
    const achievements = [];

    if (wordCount >= 10) achievements.push({
        id: 'vocab_10',
        title: 'Word Collector',
        description: 'Learned 10 words',
        icon: '📚'
    });

    if (wordCount >= 50) achievements.push({
        id: 'vocab_50',
        title: 'Vocabulary Builder',
        description: 'Learned 50 words',
        icon: '🎓'
    });

    if (wordCount >= 100) achievements.push({
        id: 'vocab_100',
        title: 'Language Master',
        description: 'Learned 100 words',
        icon: '👑'
    });

    if (streak >= 7) achievements.push({
        id: 'streak_7',
        title: 'Week Warrior',
        description: '7 day streak',
        icon: '🔥'
    });

    if (streak >= 30) achievements.push({
        id: 'streak_30',
        title: 'Month Master',
        description: '30 day streak',
        icon: '⚡'
    });

    return achievements;
}

// 📅 HELPER: Get last 7 days
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

module.exports = router;
