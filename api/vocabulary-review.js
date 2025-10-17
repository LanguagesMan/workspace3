/**
 * 📚 VOCABULARY REVIEW API
 * 
 * Endpoints for flashcard reviews, spaced repetition, and vocabulary management
 */

const express = require('express');
const router = express.Router();
const vocabularyTracker = require('../lib/vocabulary-tracker');
const SpacedRepetition = require('../lib/spaced-repetition');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /api/vocabulary-review/due
 * Get words that need review today
 */
router.get('/due', async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';
        const limit = parseInt(req.query.limit) || 20;

        // Get words due for review from database
        const words = await prisma.word.findMany({
            where: {
                userId,
                saved: true,
                OR: [
                    { nextReview: { lte: new Date() } },
                    { nextReview: null }
                ]
            },
            orderBy: [
                { nextReview: 'asc' },
                { easiness: 'asc' }  // Harder words first
            ],
            take: limit
        });

        // Get optimal session size recommendation
        const allWords = await prisma.word.findMany({
            where: { userId, saved: true }
        });

        const recommendation = SpacedRepetition.getOptimalSessionSize(allWords);
        
        res.json({
            success: true,
            dueWords: words,
            count: words.length,
            recommendation
        });

    } catch (error) {
        console.error('Error getting due words:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/vocabulary-review/review
 * Submit a word review (flashcard answer)
 */
router.post('/review', async (req, res) => {
    try {
        const { userId, wordId, quality, timeSpent } = req.body;

        if (!userId || !wordId || quality === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, wordId, quality'
            });
        }

        // Quality should be 0-5
        if (quality < 0 || quality > 5) {
            return res.status(400).json({
                success: false,
                error: 'Quality must be between 0 and 5'
            });
        }

        // Review the word
        const result = await vocabularyTracker.reviewWord(userId, wordId, quality);

        // Update review session with time spent if provided
        if (timeSpent) {
            const latestSession = await prisma.reviewSession.findFirst({
                where: { userId, wordId },
                orderBy: { createdAt: 'desc' }
            });

            if (latestSession) {
                await prisma.reviewSession.update({
                    where: { id: latestSession.id },
                    data: { timeSpent }
                });
            }
        }

        res.json({
            success: true,
            result
        });

    } catch (error) {
        console.error('Error reviewing word:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/vocabulary-review/stats
 * Get vocabulary review statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';

        // Get all user words
        const words = await prisma.word.findMany({
            where: { userId, saved: true }
        });

        // Use SpacedRepetition class for detailed stats
        const stats = SpacedRepetition.getReviewStats(words);
        const retention = SpacedRepetition.calculateRetention(words);
        const recommendations = SpacedRepetition.getStudyRecommendations(words);

        // Get learning streak
        const recentSessions = await prisma.reviewSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        const streak = calculateStreak(recentSessions);

        res.json({
            success: true,
            stats,
            retention,
            recommendations,
            streak
        });

    } catch (error) {
        console.error('Error getting review stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/vocabulary-review/workload
 * Get predicted review workload for next 30 days
 */
router.get('/workload', async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';
        const days = parseInt(req.query.days) || 30;

        const words = await prisma.word.findMany({
            where: { userId, saved: true }
        });

        const workload = SpacedRepetition.predictWorkload(words, days);

        res.json({
            success: true,
            workload,
            totalCards: words.length
        });

    } catch (error) {
        console.error('Error getting workload:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/vocabulary-review/word/:wordId
 * Get detailed information about a specific word
 */
router.get('/word/:wordId', async (req, res) => {
    try {
        const { wordId } = req.params;
        const userId = req.query.userId || 'demo-user';

        const word = await prisma.word.findUnique({
            where: { id: wordId }
        });

        if (!word || word.userId !== userId) {
            return res.status(404).json({
                success: false,
                error: 'Word not found'
            });
        }

        // Get review history
        const reviews = await prisma.reviewSession.findMany({
            where: { wordId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // Get mastery level
        const masteryLevel = SpacedRepetition.getMasteryLevel({
            repetitions: word.repetitions,
            easeFactor: word.easiness
        });

        // Find where this word appears in content
        const appearances = await findWordInContent(word.word, userId);

        res.json({
            success: true,
            word: {
                ...word,
                masteryLevel,
                reviews,
                appearances
            }
        });

    } catch (error) {
        console.error('Error getting word details:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/vocabulary-review/bulk-review
 * Submit multiple word reviews at once
 */
router.post('/bulk-review', async (req, res) => {
    try {
        const { userId, reviews } = req.body;

        if (!userId || !reviews || !Array.isArray(reviews)) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, reviews (array)'
            });
        }

        const results = [];

        for (const review of reviews) {
            const { wordId, quality, timeSpent } = review;
            
            try {
                const result = await vocabularyTracker.reviewWord(userId, wordId, quality);
                results.push({
                    wordId,
                    success: true,
                    result
                });
            } catch (error) {
                results.push({
                    wordId,
                    success: false,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            results,
            totalReviewed: results.filter(r => r.success).length,
            totalFailed: results.filter(r => !r.success).length
        });

    } catch (error) {
        console.error('Error bulk reviewing:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/vocabulary-review/learning
 * Get words currently being learned (not mastered yet)
 */
router.get('/learning', async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';

        const words = await vocabularyTracker.getLearningWords(userId);

        res.json({
            success: true,
            words,
            count: words.length
        });

    } catch (error) {
        console.error('Error getting learning words:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/vocabulary-review/mastered
 * Get all mastered words
 */
router.get('/mastered', async (req, res) => {
    try {
        const userId = req.query.userId || 'demo-user';

        const words = await prisma.word.findMany({
            where: {
                userId,
                mastered: true
            },
            orderBy: { lastReviewed: 'desc' }
        });

        res.json({
            success: true,
            words,
            count: words.length
        });

    } catch (error) {
        console.error('Error getting mastered words:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /api/vocabulary-review/word/:wordId
 * Remove a word from vocabulary (unsave it)
 */
router.delete('/word/:wordId', async (req, res) => {
    try {
        const { wordId } = req.params;
        const userId = req.query.userId || 'demo-user';

        const word = await prisma.word.findUnique({
            where: { id: wordId }
        });

        if (!word || word.userId !== userId) {
            return res.status(404).json({
                success: false,
                error: 'Word not found'
            });
        }

        // Unsave the word (don't delete, just mark as not saved)
        await prisma.word.update({
            where: { id: wordId },
            data: {
                saved: false,
                nextReview: null
            }
        });

        res.json({
            success: true,
            message: 'Word removed from vocabulary'
        });

    } catch (error) {
        console.error('Error removing word:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =========================
// HELPER FUNCTIONS
// =========================

/**
 * Calculate learning streak (consecutive days with reviews)
 */
function calculateStreak(sessions) {
    if (sessions.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group sessions by day
    const dayMap = new Map();
    sessions.forEach(session => {
        const day = new Date(session.createdAt);
        day.setHours(0, 0, 0, 0);
        const key = day.toISOString().split('T')[0];
        dayMap.set(key, true);
    });

    // Check consecutive days backwards from today
    let checkDate = new Date(today);
    
    // Start from yesterday if no reviews today
    if (!dayMap.has(checkDate.toISOString().split('T')[0])) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < 365; i++) {  // Max 1 year streak
        const key = checkDate.toISOString().split('T')[0];
        if (dayMap.has(key)) {
            streak = i + 1;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Find where a word appears in content
 */
async function findWordInContent(word, userId) {
    // This would search across all content types where the word appears
    // For now, just return empty array - can be enhanced later
    
    const appearances = [];

    // Search in videos
    const videos = await prisma.video.findMany({
        where: { userId },
        take: 10
    });

    // Search in transcriptions for the word
    // This is a simplified version - in production, you'd want full-text search
    for (const video of videos) {
        if (video.transcription && video.transcription.toLowerCase().includes(word.toLowerCase())) {
            appearances.push({
                type: 'video',
                id: video.id,
                title: video.title,
                timestamp: extractTimestamp(video.transcription, word)
            });
        }
    }

    return appearances.slice(0, 5);  // Return max 5 appearances
}

/**
 * Extract timestamp where word appears (simplified)
 */
function extractTimestamp(transcription, word) {
    // In a real implementation, you'd parse SRT or get exact timestamp
    return '00:00';
}

module.exports = router;

