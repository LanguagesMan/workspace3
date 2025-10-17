// 🔥 SOCIAL FEATURES - Like, Share, Save, Comment System
// Makes the feed addictive with viral social mechanics

const express = require('express');
const router = express.Router();

// In-memory storage (replace with database in production)
const storage = {
    savedWords: new Map(), // userId -> Set of words
    likedContent: new Map(), // userId -> Set of contentIds
    savedArticles: new Map(), // userId -> Array of articles
    shares: new Map(), // contentId -> share count
    comments: new Map(), // contentId -> Array of comments
    userStreaks: new Map(), // userId -> streak data
    achievements: new Map() // userId -> Array of achievements
};

// 💾 SAVE WORD
router.post('/save-word', (req, res) => {
    try {
        const { userId, word, translation, context, level } = req.body;

        if (!storage.savedWords.has(userId)) {
            storage.savedWords.set(userId, new Set());
        }

        const wordData = {
            word: word,
            translation: translation,
            context: context,
            level: level,
            savedAt: new Date().toISOString(),
            reviewCount: 0
        };

        const userWords = storage.savedWords.get(userId);
        userWords.add(JSON.stringify(wordData));

        // Check for achievement
        const wordCount = userWords.size;
        if (wordCount === 10 || wordCount === 50 || wordCount === 100) {
            trackAchievement(userId, `vocabulary_${wordCount}`, `Saved ${wordCount} words! 📚`);
        }

        res.json({
            success: true,
            message: '✅ Word saved!',
            totalWords: userWords.size,
            achievement: storage.achievements.get(userId)?.slice(-1)[0]
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 💾 GET SAVED WORDS
router.get('/saved-words/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const userWords = storage.savedWords.get(userId) || new Set();

        const words = Array.from(userWords).map(w => JSON.parse(w));

        res.json({
            success: true,
            words: words,
            total: words.length,
            byLevel: groupByLevel(words)
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ❤️ LIKE CONTENT
router.post('/like', (req, res) => {
    try {
        const { userId, contentId, contentType } = req.body;

        if (!storage.likedContent.has(userId)) {
            storage.likedContent.set(userId, new Set());
        }

        const userLikes = storage.likedContent.get(userId);
        const wasLiked = userLikes.has(contentId);

        if (wasLiked) {
            userLikes.delete(contentId);
        } else {
            userLikes.add(contentId);
        }

        // Track engagement
        trackEngagement(userId, 'like', contentId, contentType);

        res.json({
            success: true,
            liked: !wasLiked,
            totalLikes: userLikes.size,
            message: wasLiked ? 'Unliked' : '❤️ Liked!'
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 📤 SHARE CONTENT
router.post('/share', (req, res) => {
    try {
        const { userId, contentId, contentType, platform, content } = req.body;

        // Increment share count
        const shareCount = (storage.shares.get(contentId) || 0) + 1;
        storage.shares.set(contentId, shareCount);

        // Generate share URL and metadata
        const shareData = {
            shareId: `share_${Date.now()}`,
            contentId: contentId,
            userId: userId,
            platform: platform,
            sharedAt: new Date().toISOString(),
            shareUrl: generateShareUrl(contentId, userId),
            metadata: {
                title: content.title || content.spanish,
                description: content.english || content.description,
                image: content.thumbnail,
                type: contentType
            }
        };

        // Track viral achievement
        if (shareCount === 1 || shareCount === 10 || shareCount === 100) {
            trackAchievement(userId, `viral_${shareCount}`, `Content shared ${shareCount} times! 🔥`);
        }

        trackEngagement(userId, 'share', contentId, contentType);

        res.json({
            success: true,
            shareData: shareData,
            totalShares: shareCount,
            message: '🔥 Shared!'
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 💬 ADD COMMENT
router.post('/comment', (req, res) => {
    try {
        const { userId, contentId, comment, spanish, english } = req.body;

        if (!storage.comments.has(contentId)) {
            storage.comments.set(contentId, []);
        }

        const commentData = {
            commentId: `comment_${Date.now()}`,
            userId: userId,
            spanish: spanish,
            english: english,
            comment: comment,
            createdAt: new Date().toISOString(),
            likes: 0
        };

        storage.comments.get(contentId).push(commentData);

        trackEngagement(userId, 'comment', contentId, 'comment');

        res.json({
            success: true,
            comment: commentData,
            totalComments: storage.comments.get(contentId).length,
            message: '💬 Comment added!'
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 💬 GET COMMENTS
router.get('/comments/:contentId', (req, res) => {
    try {
        const { contentId } = req.params;
        const comments = storage.comments.get(contentId) || [];

        res.json({
            success: true,
            comments: comments,
            total: comments.length
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 📚 SAVE ARTICLE
router.post('/save-article', (req, res) => {
    try {
        const { userId, article } = req.body;

        if (!storage.savedArticles.has(userId)) {
            storage.savedArticles.set(userId, []);
        }

        const savedArticle = {
            ...article,
            savedAt: new Date().toISOString(),
            notes: '',
            highlightedWords: []
        };

        storage.savedArticles.get(userId).push(savedArticle);

        trackEngagement(userId, 'save_article', article.id, 'article');

        res.json({
            success: true,
            article: savedArticle,
            totalSaved: storage.savedArticles.get(userId).length,
            message: '📚 Article saved!'
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 📚 GET SAVED ARTICLES
router.get('/saved-articles/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const articles = storage.savedArticles.get(userId) || [];

        res.json({
            success: true,
            articles: articles,
            total: articles.length
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🔥 GET USER STREAK
router.get('/streak/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const streak = calculateStreak(userId);

        res.json({
            success: true,
            streak: streak
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🏆 GET ACHIEVEMENTS
router.get('/achievements/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const achievements = storage.achievements.get(userId) || [];

        res.json({
            success: true,
            achievements: achievements,
            total: achievements.length
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 📊 GET USER STATS (for addictive gamification)
router.get('/stats/:userId', (req, res) => {
    try {
        const { userId } = req.params;

        const stats = {
            savedWords: (storage.savedWords.get(userId) || new Set()).size,
            likedContent: (storage.likedContent.get(userId) || new Set()).size,
            savedArticles: (storage.savedArticles.get(userId) || []).length,
            achievements: (storage.achievements.get(userId) || []).length,
            streak: calculateStreak(userId),
            level: calculateUserLevel(userId)
        };

        res.json({
            success: true,
            stats: stats
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🔥 HELPER FUNCTIONS

function trackEngagement(userId, action, contentId, contentType) {
    // Track for analytics and feed optimization
    console.log(`📊 Engagement: ${userId} ${action} ${contentType} ${contentId}`);
}

function trackAchievement(userId, achievementId, message) {
    if (!storage.achievements.has(userId)) {
        storage.achievements.set(userId, []);
    }

    const achievement = {
        id: achievementId,
        message: message,
        unlockedAt: new Date().toISOString()
    };

    storage.achievements.get(userId).push(achievement);
    console.log(`🏆 Achievement unlocked: ${userId} - ${message}`);
}

function generateShareUrl(contentId, userId) {
    return `https://langfeed.app/share/${contentId}?ref=${userId}`;
}

function groupByLevel(words) {
    const byLevel = {};
    words.forEach(w => {
        if (!byLevel[w.level]) byLevel[w.level] = [];
        byLevel[w.level].push(w);
    });
    return byLevel;
}

function calculateStreak(userId) {
    // Placeholder - implement actual streak calculation
    const streakData = storage.userStreaks.get(userId) || {
        current: 1,
        longest: 1,
        lastActivity: new Date().toISOString()
    };

    return streakData;
}

function calculateUserLevel(userId) {
    const wordCount = (storage.savedWords.get(userId) || new Set()).size;

    if (wordCount < 50) return 'Beginner 🌱';
    if (wordCount < 200) return 'Learner 📚';
    if (wordCount < 500) return 'Explorer 🗺️';
    if (wordCount < 1000) return 'Master 🎓';
    return 'Legend 👑';
}

module.exports = router;
