// User Profile API Router - Unified user management
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get complete user profile with all stats
router.get('/user/profile', async (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    try {
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get vocabulary stats
        const vocabularyStats = await prisma.word.aggregate({
            where: { userId },
            _count: { id: true }
        });
        
        const savedWords = await prisma.word.count({
            where: { userId, saved: true }
        });
        
        const masteredWords = await prisma.word.count({
            where: { userId, masteryLevel: { gte: 4 } }
        });
        
        const dueWords = await prisma.word.count({
            where: {
                userId,
                saved: true,
                nextReview: { lte: new Date() }
            }
        });
        
        // Get skill assessment
        const assessment = await prisma.skillAssessment.findUnique({
            where: { userId }
        });
        
        // Get recent interactions (last 7 days)
        const recentInteractions = await prisma.userInteraction.count({
            where: {
                userId,
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
        });
        
        // Calculate streak
        const interactions = await prisma.userInteraction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 30,
            select: { createdAt: true }
        });
        
        const streak = calculateStreak(interactions.map(i => i.createdAt));
        
        // Build complete profile
        const profile = {
            user: {
                id: user.id,
                username: user.username,
                currentLevel: user.level,
                createdAt: user.createdAt
            },
            vocabulary: {
                total: vocabularyStats._count.id,
                saved: savedWords,
                mastered: masteredWords,
                due: dueWords
            },
            assessment: assessment ? {
                level: assessment.overallLevel,
                vocabularyScore: assessment.vocabularyScore,
                confidence: assessment.confidence,
                lastAssessed: assessment.lastAssessed
            } : null,
            activity: {
                recentInteractions,
                streak
            }
        };
        
        return res.json({
            success: true,
            profile
        });
        
    } catch (error) {
        console.error('Error getting user profile:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Initialize or get user
router.post('/user/init', async (req, res) => {
    const { userId, username } = req.body;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }
    
    try {
        const user = await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                username: username || `user_${Date.now()}`,
                level: 'A2' // Default level
            }
        });
        
        console.log(`✅ User initialized: ${userId}`);
        
        return res.json({
            success: true,
            user
        });
        
    } catch (error) {
        console.error('Error initializing user:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Update user preferences
router.post('/user/update', async (req, res) => {
    const { userId, updates } = req.body;
    
    if (!userId || !updates) {
        return res.status(400).json({ error: 'Missing userId or updates' });
    }
    
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: updates
        });
        
        console.log(`✅ User updated: ${userId}`);
        
        return res.json({
            success: true,
            user
        });
        
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get user dashboard stats
router.get('/user/dashboard', async (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        
        // Vocabulary progress
        const totalWords = await prisma.word.count({ where: { userId } });
        const savedWords = await prisma.word.count({ where: { userId, saved: true } });
        const dueWords = await prisma.word.count({ 
            where: { userId, saved: true, nextReview: { lte: new Date() } }
        });
        
        // Mastery breakdown
        const masteryBreakdown = await prisma.word.groupBy({
            by: ['masteryLevel'],
            where: { userId, saved: true },
            _count: { masteryLevel: true }
        });
        
        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentActivity = await prisma.userInteraction.findMany({
            where: {
                userId,
                createdAt: { gte: sevenDaysAgo }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        // Activity by day
        const activityByDay = {};
        recentActivity.forEach(activity => {
            const day = activity.createdAt.toISOString().split('T')[0];
            activityByDay[day] = (activityByDay[day] || 0) + 1;
        });
        
        // Learning stats
        const reviewsCompleted = await prisma.userInteraction.count({
            where: { userId, type: 'word_review' }
        });
        
        const assessmentsCompleted = await prisma.userInteraction.count({
            where: { userId, type: 'assessment_completed' }
        });
        
        return res.json({
            success: true,
            dashboard: {
                user: {
                    level: user.level,
                    username: user.username
                },
                vocabulary: {
                    total: totalWords,
                    saved: savedWords,
                    due: dueWords,
                    masteryBreakdown: masteryBreakdown.map(m => ({
                        level: m.masteryLevel,
                        count: m._count.masteryLevel
                    }))
                },
                activity: {
                    last7Days: Object.keys(activityByDay).length,
                    byDay: activityByDay,
                    reviewsCompleted,
                    assessmentsCompleted
                }
            }
        });
        
    } catch (error) {
        console.error('Error getting dashboard:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Helper: Calculate learning streak
function calculateStreak(dates) {
    if (dates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const uniqueDays = [...new Set(dates.map(d => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
    }))].sort((a, b) => b - a);
    
    if (uniqueDays.length === 0) return 0;
    
    // Check if studied today or yesterday
    const lastStudy = new Date(uniqueDays[0]);
    const daysSinceLastStudy = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastStudy > 1) return 0; // Streak broken
    
    // Count consecutive days
    for (let i = 0; i < uniqueDays.length - 1; i++) {
        const current = new Date(uniqueDays[i]);
        const next = new Date(uniqueDays[i + 1]);
        const diff = Math.floor((current - next) / (1000 * 60 * 60 * 24));
        
        if (diff === 1) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak + 1; // Include current day
}

module.exports = router;
