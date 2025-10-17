// 🗄️ DATABASE API - Unified endpoints for vocabulary, stats, progress

const express = require('express');
const router = express.Router();

// Simple in-memory database (replace with Prisma in production)
const db = {
    users: new Map(),
    words: new Map(),
    progress: [],
    sessions: [],
    behaviors: [], // TikTok-style behavior tracking
    interests: new Map() // Intelligent interest detection
};

// 👤 GET USER LEVEL
router.get('/user/level/:userId', (req, res) => {
    const { userId } = req.params;

    const user = db.users.get(userId) || {
        id: userId,
        level: 'A1',
        streak: 0,
        totalXP: 0,
        wordsCount: 0
    };

    res.json({
        success: true,
        level: user.level,
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
            level: level || 'A2',
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
            level: user.level
        }
    });
});

// 📊 GET USER STATS (Wispr Flow style)
router.get('/user/stats/:userId', (req, res) => {
    const { userId } = req.params;

    const user = db.users.get(userId) || {
        id: userId,
        level: 'A1',
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
            level: user.level,
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

// 🧠 INTELLIGENT BEHAVIOR TRACKING (TikTok/Instagram Style)

// Track user behavior: reads, skips, word clicks
router.post('/behavior/track', (req, res) => {
    const { userId, action, contentId, contentType, difficulty, duration, data } = req.body;

    const behavior = {
        id: `behavior_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        action, // 'read', 'skip', 'word_click', 'complete', 'like', 'save'
        contentId,
        contentType, // 'article', 'video', 'sentence'
        difficulty, // 'A1', 'A2', 'B1', etc.
        duration, // time spent (seconds)
        timestamp: new Date().toISOString(),
        data // additional context (clicked word, scroll depth, etc.)
    };

    db.behaviors.push(behavior);

    // Intelligent level/interest detection
    const analysis = analyzeUserBehavior(userId);

    res.json({
        success: true,
        behavior,
        analysis // Real-time insights
    });
});

// Get user's intelligent profile
router.get('/behavior/profile/:userId', (req, res) => {
    const { userId } = req.params;
    const analysis = analyzeUserBehavior(userId);

    res.json({
        success: true,
        profile: analysis
    });
});

// INTELLIGENT ANALYSIS FUNCTION
function analyzeUserBehavior(userId) {
    const userBehaviors = db.behaviors.filter(b => b.userId === userId);

    if (userBehaviors.length === 0) {
        return {
            estimatedLevel: 'A2',
            confidence: 0,
            interests: [],
            strengths: [],
            weaknesses: [],
            recommendedDifficulty: 'A2'
        };
    }

    // 1. LEVEL DETECTION from completion vs skip patterns
    const completions = userBehaviors.filter(b => b.action === 'complete' || b.action === 'read');
    const skips = userBehaviors.filter(b => b.action === 'skip');

    const levelScores = {
        'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0
    };

    // Content they completed = comfortable level
    completions.forEach(c => {
        if (c.difficulty) levelScores[c.difficulty] += 2;
    });

    // Content they skipped = too hard
    skips.forEach(s => {
        if (s.difficulty) levelScores[s.difficulty] -= 1;
    });

    // Find optimal level
    const estimatedLevel = Object.entries(levelScores)
        .sort((a, b) => b[1] - a[1])[0][0];

    // 2. INTEREST DETECTION from engagement patterns
    const interests = {};
    userBehaviors.forEach(b => {
        if (b.data && b.data.topic) {
            interests[b.data.topic] = (interests[b.data.topic] || 0) + 1;
        }
    });

    const topInterests = Object.entries(interests)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic]) => topic);

    // 3. WORD CLICK ANALYSIS (what they struggle with)
    const wordClicks = userBehaviors.filter(b => b.action === 'word_click');
    const clickedWords = wordClicks.map(b => b.data?.word).filter(Boolean);

    const weaknesses = [...new Set(clickedWords)].slice(0, 10);

    // 4. ENGAGEMENT TIME ANALYSIS
    const avgDuration = completions.reduce((sum, b) => sum + (b.duration || 0), 0) / completions.length || 0;

    return {
        estimatedLevel,
        confidence: Math.min(userBehaviors.length / 20, 1), // Confidence increases with data
        interests: topInterests,
        strengths: completions.map(c => c.difficulty).filter(Boolean),
        weaknesses,
        recommendedDifficulty: estimatedLevel,
        avgEngagementTime: avgDuration,
        totalInteractions: userBehaviors.length,
        completionRate: (completions.length / (completions.length + skips.length)) || 0
    };
}

// Auto-update user profile based on behavior
router.post('/behavior/update-profile', (req, res) => {
    const { userId } = req.body;

    const analysis = analyzeUserBehavior(userId);

    // Update user level automatically
    let user = db.users.get(userId);
    if (!user) {
        user = {
            id: userId,
            level: 'A2',
            streak: 0,
            totalXP: 0,
            wordsCount: 0
        };
    }

    // Update level if confidence is high
    if (analysis.confidence > 0.5) {
        user.level = analysis.estimatedLevel;
    }

    // Update interests
    user.interests = analysis.interests;
    user.weakWords = analysis.weaknesses;

    db.users.set(userId, user);

    res.json({
        success: true,
        user,
        analysis
    });
});

module.exports = router;
