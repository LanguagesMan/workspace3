// Vocabulary API Router - Word tracking & Spaced Repetition
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { SpacedRepetitionEngine } = require('./spaced-repetition-engine-cjs.js');

const prisma = new PrismaClient();
const srEngine = new SpacedRepetitionEngine();

// Track word click
router.post('/vocabulary/click', async (req, res) => {
    const { userId, word, translation, context, source, sourceId, level } = req.body;
    
    if (!userId || !word || !translation) {
        return res.status(400).json({ error: 'Missing required fields: userId, word, translation' });
    }
    
    try {
        const vocabulary = await prisma.word.upsert({
            where: {
                userId_word: {
                    userId,
                    word: word.toLowerCase().trim()
                }
            },
            update: {
                clickCount: { increment: 1 },
                lastSeen: new Date(),
                translation,
                context: context || undefined,
                source: source || undefined,
                sourceId: sourceId || undefined
            },
            create: {
                userId,
                word: word.toLowerCase().trim(),
                translation,
                context,
                source: source || 'article',
                sourceId,
                level: level || 'A2',
                clickCount: 1
            }
        });
        
        await prisma.userInteraction.create({
            data: {
                userId,
                type: 'word_click',
                contentId: sourceId || word,
                difficulty: level,
                metadata: JSON.stringify({ word, source })
            }
        });
        
        console.log(`✅ Word clicked: "${word}" by user ${userId}`);
        return res.json({ success: true, vocabulary });
        
    } catch (error) {
        console.error('Error tracking word click:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Save word for review
router.post('/vocabulary/save', async (req, res) => {
    const { userId, word } = req.body;
    
    if (!userId || !word) {
        return res.status(400).json({ error: 'Missing required fields: userId, word' });
    }
    
    try {
        const vocabulary = await prisma.word.update({
            where: {
                userId_word: {
                    userId,
                    word: word.toLowerCase().trim()
                }
            },
            data: {
                saved: true,
                masteryLevel: 0,
                nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }
        });
        
        console.log(`✅ Word saved: "${word}" by user ${userId}`);
        return res.json({ success: true, vocabulary });
        
    } catch (error) {
        console.error('Error saving word:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Word not found. Click the word first before saving.' });
        }
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get vocabulary
router.get('/vocabulary/get', async (req, res) => {
    const { userId, saved, limit = '100' } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    try {
        const where = { userId };
        if (saved === 'true') {
            where.saved = true;
        }
        
        const words = await prisma.word.findMany({
            where,
            orderBy: { lastSeen: 'desc' },
            take: parseInt(limit)
        });
        
        console.log(`✅ Retrieved ${words.length} words for user ${userId}`);
        return res.json({ success: true, words, total: words.length });
        
    } catch (error) {
        console.error('Error getting vocabulary:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get words for review
router.get('/vocabulary/review', async (req, res) => {
    const { userId, limit = '20' } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
    }
    
    try {
        const now = new Date();
        
        const words = await prisma.word.findMany({
            where: {
                userId,
                saved: true,
                OR: [
                    { nextReview: null },
                    { nextReview: { lte: now } }
                ]
            },
            orderBy: [
                { nextReview: 'asc' },
                { masteryLevel: 'asc' }
            ],
            take: parseInt(limit)
        });
        
        console.log(`✅ Found ${words.length} words due for review for user ${userId}`);
        return res.json({ success: true, words, count: words.length });
        
    } catch (error) {
        console.error('Error getting review words:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Update after review
router.post('/vocabulary/update-review', async (req, res) => {
    const { userId, word, quality } = req.body;
    
    if (!userId || !word || quality === undefined) {
        return res.status(400).json({ error: 'Missing required fields: userId, word, quality (0-5)' });
    }
    
    const qualityNum = parseInt(quality);
    if (qualityNum < 0 || qualityNum > 5) {
        return res.status(400).json({ error: 'Quality must be between 0 and 5' });
    }
    
    try {
        const currentWord = await prisma.word.findUnique({
            where: {
                userId_word: {
                    userId,
                    word: word.toLowerCase().trim()
                }
            }
        });
        
        if (!currentWord) {
            return res.status(404).json({ error: 'Word not found' });
        }
        
        const updatedData = srEngine.calculateNextReview(currentWord, qualityNum);
        
        const vocabulary = await prisma.word.update({
            where: {
                userId_word: {
                    userId,
                    word: word.toLowerCase().trim()
                }
            },
            data: {
                masteryLevel: updatedData.masteryLevel,
                easiness: updatedData.easiness,
                interval: updatedData.interval,
                repetitions: updatedData.repetitions,
                nextReview: updatedData.nextReview,
                lastReviewed: new Date(),
                reviewCount: { increment: 1 },
                mastered: updatedData.masteryLevel >= 5
            }
        });
        
        await prisma.userInteraction.create({
            data: {
                userId,
                type: 'word_review',
                contentId: word,
                correct: qualityNum >= 3,
                difficulty: currentWord.level,
                metadata: JSON.stringify({ quality: qualityNum, masteryLevel: updatedData.masteryLevel })
            }
        });
        
        console.log(`✅ Word reviewed: "${word}" (quality: ${qualityNum}, next: ${updatedData.interval}d)`);
        return res.json({ 
            success: true, 
            vocabulary,
            nextReviewIn: updatedData.interval,
            masteryLevel: updatedData.masteryLevel
        });
        
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
