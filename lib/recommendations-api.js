// Smart Recommendations API Router
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
// Disable difficulty analyzer for now (causing startup issues)
// const ArticleDifficultyAnalyzer = require('./article-difficulty-analyzer.js');

const prisma = new PrismaClient();
// const difficultyAnalyzer = new ArticleDifficultyAnalyzer();

// Get personalized article recommendations
router.get('/recommendations/articles', async (req, res) => {
    const { userId, limit = '10' } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    try {
        // Get user's current level
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { currentLevel: true }
        });
        
        const userLevel = user?.currentLevel || 'A2';
        
        // Get articles filtered by level (±1 CEFR level)
        const levelMap = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
        const userLevelIndex = levelMap[userLevel] || 1;
        
        // Include current level and ±1
        const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
            .filter((_, index) => Math.abs(index - userLevelIndex) <= 1);
        
        const articles = await prisma.article.findMany({
            where: {
                level: { in: validLevels }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: parseInt(limit)
        });
        
        // Transform articles for frontend
        const transformedArticles = articles.map(article => ({
            id: article.id,
            title: article.title,
            description: article.description,
            content: article.content,
            level: article.level,
            cefrLevel: article.level,
            topics: JSON.parse(article.topics || '[]'),
            sourceUrl: article.sourceUrl,
            sourceName: article.sourceName,
            hasAudio: article.hasAudio,
            personalizedScore: article.level === userLevel ? 1.0 : 0.8
        }));
        
        console.log(`✅ Generated ${transformedArticles.length} recommendations for ${userId} (${userLevel})`);
        
        return res.json({
            success: true,
            userLevel,
            count: transformedArticles.length,
            articles: transformedArticles
        });
        
    } catch (error) {
        console.error('Error getting recommendations:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Analyze article difficulty
router.post('/recommendations/analyze', async (req, res) => {
    const { text, title } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Missing text parameter' });
    }
    
    try {
        const analysis = await difficultyAnalyzer.analyzeText(text);
        
        console.log(`✅ Analyzed "${title || 'article'}" - Level: ${analysis.level}, Score: ${analysis.difficultyScore}`);
        
        return res.json({
            success: true,
            title: title || 'Article',
            analysis
        });
        
    } catch (error) {
        console.error('Error analyzing article:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Update user interests based on interactions
router.post('/recommendations/track-interest', async (req, res) => {
    const { userId, interest, action } = req.body;
    
    if (!userId || !interest) {
        return res.status(400).json({ error: 'Missing userId or interest' });
    }
    
    try {
        // Track interest
        const userInterest = await prisma.userInterest.upsert({
            where: {
                userId_interest: {
                    userId,
                    interest: interest.toLowerCase()
                }
            },
            update: {
                weight: { increment: action === 'read' ? 0.5 : 0.1 }
            },
            create: {
                userId,
                interest: interest.toLowerCase(),
                weight: 1.0
            }
        });
        
        console.log(`✅ Tracked interest "${interest}" for user ${userId}`);
        
        return res.json({
            success: true,
            interest: userInterest
        });
        
    } catch (error) {
        console.error('Error tracking interest:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Helper function - in production, load from your content source
async function loadSampleArticles() {
    return [
        {
            id: 'article_1',
            title: 'El gato y el perro',
            description: 'El gato es pequeño. El perro es grande. Son amigos.',
            topic: 'animals',
            url: '#'
        },
        {
            id: 'article_2',
            title: 'La tecnología moderna',
            description: 'La inteligencia artificial está transformando radicalmente nuestra sociedad contemporánea.',
            topic: 'technology',
            url: '#'
        },
        {
            id: 'article_3',
            title: 'Receta de paella',
            description: 'Necesitas arroz, azafrán, pollo y verduras. Cocina todo junto.',
            topic: 'cooking',
            url: '#'
        },
        {
            id: 'article_4',
            title: 'Historia de España',
            description: 'Durante el siglo XVI, España experimentó una expansión territorial sin precedentes.',
            topic: 'history',
            url: '#'
        },
        {
            id: 'article_5',
            title: 'Fútbol en Barcelona',
            description: 'El equipo jugó muy bien. Ganaron el partido tres a uno.',
            topic: 'sports',
            url: '#'
        }
    ];
}

module.exports = router;
