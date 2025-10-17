// 🏆 GAMES LEADERBOARD API
// Manages game scores, leaderboards, and XP rewards

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get global leaderboard
 * GET /api/games/leaderboard?gameType=matchMadness&limit=10
 */
router.get('/games/leaderboard', async (req, res) => {
    try {
        const { gameType, limit = '10', timeframe = 'allTime' } = req.query;
        
        let dateFilter = {};
        const now = new Date();
        
        // Apply timeframe filter
        switch(timeframe) {
            case 'today':
                dateFilter = { gte: new Date(now.setHours(0, 0, 0, 0)) };
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                dateFilter = { gte: weekAgo };
                break;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                dateFilter = { gte: monthAgo };
                break;
            case 'allTime':
            default:
                dateFilter = {};
        }

        // Get top scores with user info
        const scores = await prisma.gameScore.findMany({
            where: {
                ...(gameType && { gameType }),
                ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
            },
            orderBy: { score: 'desc' },
            take: parseInt(limit),
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        level: true
                    }
                }
            }
        });

        // Calculate ranks
        const leaderboard = scores.map((entry, index) => ({
            rank: index + 1,
            userId: entry.userId,
            username: entry.user.username || 'Anonymous',
            level: entry.user.level,
            score: entry.score,
            accuracy: entry.accuracy,
            duration: entry.duration,
            gameType: entry.gameType,
            createdAt: entry.createdAt
        }));

        return res.json({
            success: true,
            leaderboard,
            timeframe,
            gameType: gameType || 'all'
        });

    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * Get user's game stats
 * GET /api/games/stats?userId=xxx
 */
router.get('/games/stats', async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId parameter' });
        }

        // Get user's scores
        const scores = await prisma.gameScore.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate stats by game type
        const statsByGame = {};
        const gameTypes = ['matchMadness', 'speedChallenge', 'wordBuilder', 'listeningPractice', 'translationRace'];
        
        gameTypes.forEach(gameType => {
            const gameScores = scores.filter(s => s.gameType === gameType);
            
            if (gameScores.length > 0) {
                statsByGame[gameType] = {
                    gamesPlayed: gameScores.length,
                    bestScore: Math.max(...gameScores.map(s => s.score)),
                    avgScore: Math.round(gameScores.reduce((sum, s) => sum + s.score, 0) / gameScores.length),
                    avgAccuracy: Math.round(gameScores.reduce((sum, s) => sum + s.accuracy, 0) / gameScores.length),
                    totalXP: gameScores.reduce((sum, s) => sum + (s.xpEarned || 0), 0),
                    lastPlayed: gameScores[0].createdAt
                };
            }
        });

        // Overall stats
        const overall = {
            totalGamesPlayed: scores.length,
            totalXPEarned: scores.reduce((sum, s) => sum + (s.xpEarned || 0), 0),
            avgScore: scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0,
            avgAccuracy: scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.accuracy, 0) / scores.length) : 0,
            bestOverallScore: scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0
        };

        // Get user's rank
        const userBestScore = overall.bestOverallScore;
        const betterScores = await prisma.gameScore.count({
            where: {
                score: { gt: userBestScore }
            },
            distinct: ['userId']
        });
        
        const rank = betterScores + 1;

        return res.json({
            success: true,
            stats: {
                overall,
                byGame: statsByGame,
                rank
            }
        });

    } catch (error) {
        console.error('Error getting game stats:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * Submit game score
 * POST /api/games/submit-score
 * Body: { userId, gameType, score, accuracy, duration, results }
 */
router.post('/games/submit-score', async (req, res) => {
    try {
        const { userId, gameType, score, accuracy, duration, results } = req.body;
        
        if (!userId || !gameType || score === undefined) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Calculate XP based on score and accuracy
        const baseXP = Math.floor(score / 10);
        const accuracyBonus = accuracy >= 90 ? 20 : accuracy >= 70 ? 10 : 0;
        const speedBonus = duration < 60 ? 10 : duration < 120 ? 5 : 0;
        const xpEarned = baseXP + accuracyBonus + speedBonus;

        // Save score
        const gameScore = await prisma.gameScore.create({
            data: {
                userId,
                gameType,
                score,
                accuracy: Math.round(accuracy),
                duration,
                xpEarned
            }
        });

        // Update user XP and stats
        await prisma.user.update({
            where: { id: userId },
            data: {
                totalXP: { increment: xpEarned },
                lastActivity: new Date()
            }
        });

        // Update word mastery if results provided
        if (results && Array.isArray(results)) {
            const updatePromises = results.map(async (result) => {
                const word = await prisma.word.findFirst({
                    where: {
                        userId,
                        word: result.word
                    }
                });

                if (!word) return null;

                // SM-2 algorithm adjustment
                let { easiness, interval, masteryLevel } = word;
                
                if (result.correct) {
                    masteryLevel = Math.min(5, masteryLevel + 1);
                    easiness = Math.min(2.5, easiness + 0.1);
                    interval = Math.ceil(interval * easiness);
                } else {
                    masteryLevel = Math.max(0, masteryLevel - 1);
                    easiness = Math.max(1.3, easiness - 0.2);
                    interval = 1;
                }
                
                const nextReview = new Date();
                nextReview.setDate(nextReview.getDate() + interval);
                
                return prisma.word.update({
                    where: { id: word.id },
                    data: {
                        easiness,
                        interval,
                        masteryLevel,
                        nextReview,
                        lastSeen: new Date(),
                        reviewCount: { increment: 1 }
                    }
                });
            });

            await Promise.all(updatePromises.filter(p => p !== null));
        }

        // Check for achievements
        const achievements = await checkAchievements(userId, gameType, score, accuracy);

        return res.json({
            success: true,
            scoreId: gameScore.id,
            xpEarned,
            achievements: achievements || []
        });

    } catch (error) {
        console.error('Error submitting score:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * Get user's rank for a specific game
 * GET /api/games/my-rank?userId=xxx&gameType=matchMadness
 */
router.get('/games/my-rank', async (req, res) => {
    try {
        const { userId, gameType } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId parameter' });
        }

        // Get user's best score
        const userBestScore = await prisma.gameScore.findFirst({
            where: {
                userId,
                ...(gameType && { gameType })
            },
            orderBy: { score: 'desc' }
        });

        if (!userBestScore) {
            return res.json({
                success: true,
                rank: null,
                message: 'No games played yet'
            });
        }

        // Count how many users have better scores
        const betterScores = await prisma.gameScore.count({
            where: {
                score: { gt: userBestScore.score },
                ...(gameType && { gameType })
            },
            distinct: ['userId']
        });

        const rank = betterScores + 1;

        // Get total players
        const totalPlayers = await prisma.gameScore.findMany({
            where: {
                ...(gameType && { gameType })
            },
            distinct: ['userId']
        });

        return res.json({
            success: true,
            rank,
            totalPlayers: totalPlayers.length,
            bestScore: userBestScore.score,
            percentile: Math.round((1 - betterScores / totalPlayers.length) * 100)
        });

    } catch (error) {
        console.error('Error getting rank:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Check for achievements
 */
async function checkAchievements(userId, gameType, score, accuracy) {
    const achievements = [];

    // Check existing achievements
    const userAchievements = await prisma.achievement.findMany({
        where: { userId }
    });
    
    const hasAchievement = (name) => userAchievements.some(a => a.name === name);

    // Perfect Score Achievement
    if (accuracy === 100 && !hasAchievement('Perfect Game')) {
        await prisma.achievement.create({
            data: {
                userId,
                name: 'Perfect Game',
                description: 'Achieved 100% accuracy in a game',
                icon: '🎯',
                earnedAt: new Date()
            }
        });
        achievements.push({ name: 'Perfect Game', icon: '🎯' });
    }

    // Speed Demon Achievement
    if (gameType === 'speedChallenge' && score >= 100 && !hasAchievement('Speed Demon')) {
        await prisma.achievement.create({
            data: {
                userId,
                name: 'Speed Demon',
                description: 'Scored 100+ in Speed Challenge',
                icon: '⚡',
                earnedAt: new Date()
            }
        });
        achievements.push({ name: 'Speed Demon', icon: '⚡' });
    }

    // Master Builder Achievement
    if (gameType === 'wordBuilder' && accuracy >= 90 && !hasAchievement('Master Builder')) {
        await prisma.achievement.create({
            data: {
                userId,
                name: 'Master Builder',
                description: 'Achieved 90%+ accuracy in Word Builder',
                icon: '🔨',
                earnedAt: new Date()
            }
        });
        achievements.push({ name: 'Master Builder', icon: '🔨' });
    }

    // Memory Master Achievement
    if (gameType === 'matchMadness' && score >= 80 && !hasAchievement('Memory Master')) {
        await prisma.achievement.create({
            data: {
                userId,
                name: 'Memory Master',
                description: 'Scored 80+ in Match Madness',
                icon: '🧠',
                earnedAt: new Date()
            }
        });
        achievements.push({ name: 'Memory Master', icon: '🧠' });
    }

    return achievements;
}

module.exports = router;


