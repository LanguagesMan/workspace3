// Level Assessment API Router
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Save assessment results
router.post('/assessment/save', async (req, res) => {
    const { userId, level, score, responses, confidence } = req.body;
    
    if (!userId || !level) {
        return res.status(400).json({ error: 'Missing userId or level' });
    }
    
    try {
        // Update user level
        await prisma.user.update({
            where: { id: userId },
            data: { level: level, levelUpdatedAt: new Date() }
        });
        
        // Create or update skill assessment
        const assessment = await prisma.skillAssessment.upsert({
            where: { userId },
            update: {
                vocabularyScore: score || 0,
                overallLevel: level,
                confidence: confidence || 50,
                lastAssessed: new Date(),
                assessmentCount: { increment: 1 }
            },
            create: {
                userId,
                vocabularyScore: score || 0,
                overallLevel: level,
                confidence: confidence || 50,
                assessmentCount: 1
            }
        });
        
        // Track assessment completion
        await prisma.userInteraction.create({
            data: {
                userId,
                type: 'assessment_completed',
                difficulty: level,
                correct: true,
                timeSpent: responses?.length * 30 || 150, // Estimate
                completed: true,
                metadata: JSON.stringify({ score, responses: responses?.length || 0 })
            }
        });
        
        console.log(`✅ Assessment saved: User ${userId} → Level ${level} (Score: ${score})`);
        
        return res.json({
            success: true,
            level,
            assessment
        });
        
    } catch (error) {
        console.error('Error saving assessment:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get user's current assessment
router.get('/assessment/get', async (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { level: true }
        });
        
        const assessment = await prisma.skillAssessment.findUnique({
            where: { userId }
        });
        
        return res.json({
            success: true,
            currentLevel: user?.level || 'A2',
            assessment: assessment || null,
            hasCompletedAssessment: !!assessment
        });
        
    } catch (error) {
        console.error('Error getting assessment:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Update user level (after continuous assessment)
router.post('/assessment/update-level', async (req, res) => {
    const { userId, newLevel, reason } = req.body;
    
    if (!userId || !newLevel) {
        return res.status(400).json({ error: 'Missing userId or newLevel' });
    }
    
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { level: newLevel, levelUpdatedAt: new Date() }
        });
        
        await prisma.skillAssessment.update({
            where: { userId },
            data: {
                overallLevel: newLevel,
                lastAssessed: new Date()
            }
        });
        
        // Track level change
        await prisma.userInteraction.create({
            data: {
                userId,
                type: 'level_updated',
                difficulty: newLevel,
                metadata: JSON.stringify({ reason, previousLevel: null, newLevel })
            }
        });
        
        console.log(`✅ Level updated: User ${userId} → ${newLevel} (Reason: ${reason})`);
        
        return res.json({
            success: true,
            newLevel,
            message: `Level updated to ${newLevel}`
        });
        
    } catch (error) {
        console.error('Error updating level:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get level recommendations based on performance
router.get('/assessment/recommend-level', async (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    try {
        // Get recent interactions
        const recentInteractions = await prisma.userInteraction.findMany({
            where: {
                userId,
                type: { in: ['word_review', 'word_click', 'article_read'] },
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { level: true }
        });
        
        // Calculate performance metrics
        const correctRate = recentInteractions.filter(i => i.correct === true).length / (recentInteractions.length || 1);
        const avgDifficulty = calculateAvgDifficulty(recentInteractions.map(i => i.difficulty));
        
        // Recommend level change
        let recommendation = user?.level || 'A2';
        let reason = 'Current level appropriate';
        
        if (correctRate > 0.85 && recentInteractions.length > 10) {
            recommendation = getNextLevel(user?.level);
            reason = `High success rate (${Math.round(correctRate * 100)}%) - ready to advance`;
        } else if (correctRate < 0.5 && recentInteractions.length > 10) {
            recommendation = getPreviousLevel(user?.level);
            reason = `Low success rate (${Math.round(correctRate * 100)}%) - need more practice`;
        }
        
        return res.json({
            success: true,
            currentLevel: user?.level || 'A2',
            recommendedLevel: recommendation,
            reason,
            metrics: {
                correctRate: Math.round(correctRate * 100),
                interactionsAnalyzed: recentInteractions.length,
                avgDifficulty
            }
        });
        
    } catch (error) {
        console.error('Error getting level recommendation:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Helper functions
function calculateAvgDifficulty(difficulties) {
    const levelScores = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
    const scores = difficulties
        .filter(d => d && levelScores[d])
        .map(d => levelScores[d]);
    
    if (scores.length === 0) return 'A2';
    
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    return levels[Math.round(avg) - 1] || 'A2';
}

function getNextLevel(currentLevel) {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const index = levels.indexOf(currentLevel);
    return index < levels.length - 1 ? levels[index + 1] : currentLevel;
}

function getPreviousLevel(currentLevel) {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const index = levels.indexOf(currentLevel);
    return index > 0 ? levels[index - 1] : currentLevel;
}

module.exports = router;
