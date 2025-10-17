// 🎮 GAMES API - Database-Connected Game Content
// Provides vocabulary for games based on user's learning progress
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get vocabulary for Word Match game
 * Returns pairs of words at user's level, prioritizing SRS due words
 * GET /api/games/word-match?userId=xxx&count=8
 */
router.get('/games/word-match', async (req, res) => {
    try {
        const { userId, count = '8' } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId parameter' });
        }

        const pairCount = parseInt(count) / 2; // Need half since we create pairs
        
        // Get user's level
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { level: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get words: prioritize SRS due, then recently learned, then random saved words
        const words = await prisma.word.findMany({
            where: {
                userId,
                saved: true,
                level: user.level // Match user's level
            },
            orderBy: [
                { nextReview: 'asc' }, // SRS due words first
                { lastSeen: 'desc' }   // Then recent words
            ],
            take: pairCount,
            select: {
                word: true,
                translation: true,
                level: true,
                masteryLevel: true
            }
        });

        // If not enough words, get from frequency list at user's level
        if (words.length < pairCount) {
            const defaultWords = getDefaultWordsByLevel(user.level, pairCount - words.length);
            words.push(...defaultWords);
        }

        return res.json({
            success: true,
            words,
            level: user.level,
            count: words.length
        });

    } catch (error) {
        console.error('Error getting word-match data:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * Get vocabulary for Sentence Builder game
 * Returns sentences to build using user's known words
 * GET /api/games/sentence-builder?userId=xxx&count=10
 */
router.get('/games/sentence-builder', async (req, res) => {
    try {
        const { userId, count = '10' } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId parameter' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { level: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user's known words for context
        const knownWords = await prisma.word.findMany({
            where: {
                userId,
                saved: true,
                masteryLevel: { gte: 2 } // Only well-known words
            },
            select: { word: true },
            take: 100
        });

        const knownWordSet = new Set(knownWords.map(w => w.word.toLowerCase()));

        // Get level-appropriate sentences
        const sentences = getSentencesByLevel(user.level, parseInt(count), knownWordSet);

        return res.json({
            success: true,
            sentences,
            level: user.level
        });

    } catch (error) {
        console.error('Error getting sentence-builder data:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * Get vocabulary for Fill in the Blank game
 * Returns sentences with missing words for user to fill
 * GET /api/games/fill-blank?userId=xxx&count=10
 */
router.get('/games/fill-blank', async (req, res) => {
    try {
        const { userId, count = '10' } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId parameter' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { level: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get words user is learning (masteryLevel 1-3)
        const learningWords = await prisma.word.findMany({
            where: {
                userId,
                saved: true,
                masteryLevel: { gte: 1, lte: 3 }
            },
            orderBy: { nextReview: 'asc' },
            take: parseInt(count),
            select: {
                word: true,
                translation: true,
                level: true
            }
        });

        // Generate fill-in-the-blank exercises for each word
        const exercises = learningWords.map(wordObj => {
            const sentence = generateSentenceWithBlank(wordObj.word, user.level);
            return {
                sentence,
                missingWord: wordObj.word,
                translation: wordObj.translation,
                options: generateDistractors(wordObj.word, user.level)
            };
        });

        return res.json({
            success: true,
            exercises,
            level: user.level
        });

    } catch (error) {
        console.error('Error getting fill-blank data:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * Get vocabulary for Speed Round game
 * Returns rapid-fire translation challenges
 * GET /api/games/speed-round?userId=xxx&count=20
 */
router.get('/games/speed-round', async (req, res) => {
    try {
        const { userId, count = '20' } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId parameter' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { level: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get mix of user's words (70%) and new words (30%)
        const savedWords = await prisma.word.findMany({
            where: {
                userId,
                saved: true
            },
            orderBy: { masteryLevel: 'asc' }, // Start with weaker words
            take: Math.floor(parseInt(count) * 0.7),
            select: {
                word: true,
                translation: true,
                level: true,
                masteryLevel: true
            }
        });

        // Add some new words at user's level for challenge
        const newWords = getDefaultWordsByLevel(user.level, Math.ceil(parseInt(count) * 0.3));

        const allWords = [...savedWords, ...newWords];
        
        // Shuffle for variety
        shuffleArray(allWords);

        return res.json({
            success: true,
            words: allWords,
            level: user.level
        });

    } catch (error) {
        console.error('Error getting speed-round data:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * Get vocabulary for Tap Pairs game (Duolingo-style)
 * Returns word pairs to tap/match
 * GET /api/games/tap-pairs?userId=xxx&count=6
 */
router.get('/games/tap-pairs', async (req, res) => {
    try {
        const { userId, count = '6' } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId parameter' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { level: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get words due for review
        const words = await prisma.word.findMany({
            where: {
                userId,
                saved: true,
                nextReview: { lte: new Date() }
            },
            orderBy: { masteryLevel: 'asc' },
            take: parseInt(count),
            select: {
                word: true,
                translation: true,
                level: true
            }
        });

        // If not enough due words, add recent words
        if (words.length < parseInt(count)) {
            const additionalWords = await prisma.word.findMany({
                where: {
                    userId,
                    saved: true,
                    nextReview: { gt: new Date() }
                },
                orderBy: { lastSeen: 'desc' },
                take: parseInt(count) - words.length,
                select: {
                    word: true,
                    translation: true,
                    level: true
                }
            });
            words.push(...additionalWords);
        }

        return res.json({
            success: true,
            pairs: words,
            level: user.level
        });

    } catch (error) {
        console.error('Error getting tap-pairs data:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * Submit game results and update spaced repetition
 * POST /api/games/submit-results
 * Body: { userId, gameType, results: [{word, correct}] }
 */
router.post('/games/submit-results', async (req, res) => {
    try {
        const { userId, gameType, results, score, duration } = req.body;
        
        if (!userId || !results) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Update each word's spaced repetition based on performance
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
                interval = 1; // Reset to 1 day
            }
    
    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    
            return prisma.word.update({
                where: { id: word.id },
                data: {
                    easiness,
                    interval,
                    masteryLevel,
                    nextReview,
                    lastSeen: new Date()
                }
            });
        });

        await Promise.all(updatePromises.filter(p => p !== null));

        // Track game session
        await prisma.userInteraction.create({
            data: {
                userId,
                type: `game_${gameType}`,
                timeSpent: duration,
                createdAt: new Date()
            }
        });

        // Update user XP
        const xpGained = Math.floor(score / 10);
        await prisma.user.update({
            where: { id: userId },
            data: {
                totalXP: { increment: xpGained },
                lastActivity: new Date()
            }
        });

        return res.json({
            success: true,
            xpGained,
            wordsUpdated: results.length
        });

    } catch (error) {
        console.error('Error submitting game results:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get default words by CEFR level
 */
function getDefaultWordsByLevel(level, count) {
    const wordSets = {
        A1: [
            { word: 'hola', translation: 'hello', level: 'A1' },
            { word: 'gracias', translation: 'thank you', level: 'A1' },
            { word: 'adiós', translation: 'goodbye', level: 'A1' },
            { word: 'agua', translation: 'water', level: 'A1' },
            { word: 'casa', translation: 'house', level: 'A1' },
            { word: 'comer', translation: 'to eat', level: 'A1' },
            { word: 'perro', translation: 'dog', level: 'A1' },
            { word: 'gato', translation: 'cat', level: 'A1' },
            { word: 'amigo', translation: 'friend', level: 'A1' },
            { word: 'familia', translation: 'family', level: 'A1' }
        ],
        A2: [
            { word: 'escuela', translation: 'school', level: 'A2' },
            { word: 'trabajar', translation: 'to work', level: 'A2' },
            { word: 'ciudad', translation: 'city', level: 'A2' },
            { word: 'viaje', translation: 'trip', level: 'A2' },
            { word: 'restaurante', translation: 'restaurant', level: 'A2' },
            { word: 'película', translation: 'movie', level: 'A2' },
            { word: 'comprar', translation: 'to buy', level: 'A2' },
            { word: 'tiempo', translation: 'time/weather', level: 'A2' },
            { word: 'dinero', translation: 'money', level: 'A2' },
            { word: 'feliz', translation: 'happy', level: 'A2' }
        ],
        B1: [
            { word: 'desarrollar', translation: 'to develop', level: 'B1' },
            { word: 'ambiente', translation: 'environment', level: 'B1' },
            { word: 'situación', translation: 'situation', level: 'B1' },
            { word: 'experiencia', translation: 'experience', level: 'B1' },
            { word: 'opinión', translation: 'opinion', level: 'B1' },
            { word: 'conseguir', translation: 'to achieve', level: 'B1' },
            { word: 'propósito', translation: 'purpose', level: 'B1' },
            { word: 'mantener', translation: 'to maintain', level: 'B1' },
            { word: 'sociedad', translation: 'society', level: 'B1' },
            { word: 'resultado', translation: 'result', level: 'B1' }
        ],
        B2: [
            { word: 'desafío', translation: 'challenge', level: 'B2' },
            { word: 'innovación', translation: 'innovation', level: 'B2' },
            { word: 'perspectiva', translation: 'perspective', level: 'B2' },
            { word: 'estrategia', translation: 'strategy', level: 'B2' },
            { word: 'implementar', translation: 'to implement', level: 'B2' },
            { word: 'sostenible', translation: 'sustainable', level: 'B2' },
            { word: 'compromiso', translation: 'commitment', level: 'B2' },
            { word: 'investigación', translation: 'research', level: 'B2' },
            { word: 'análisis', translation: 'analysis', level: 'B2' },
            { word: 'gestión', translation: 'management', level: 'B2' }
        ]
    };

    const words = wordSets[level] || wordSets.A2;
    return words.slice(0, count);
}

/**
 * Get sentences by CEFR level
 */
function getSentencesByLevel(level, count, knownWords) {
    const sentenceSets = {
        A1: [
            { spanish: 'Me gusta el café', english: 'I like coffee', words: ['Me', 'gusta', 'el', 'café'] },
            { spanish: 'Mi casa es grande', english: 'My house is big', words: ['Mi', 'casa', 'es', 'grande'] },
            { spanish: 'El perro come pan', english: 'The dog eats bread', words: ['El', 'perro', 'come', 'pan'] },
            { spanish: 'Yo tengo un gato', english: 'I have a cat', words: ['Yo', 'tengo', 'un', 'gato'] },
            { spanish: 'Ella bebe agua', english: 'She drinks water', words: ['Ella', 'bebe', 'agua'] },
            { spanish: 'Nosotros somos amigos', english: 'We are friends', words: ['Nosotros', 'somos', 'amigos'] },
            { spanish: 'Tú hablas español', english: 'You speak Spanish', words: ['Tú', 'hablas', 'español'] },
            { spanish: 'La familia está aquí', english: 'The family is here', words: ['La', 'familia', 'está', 'aquí'] },
            { spanish: 'Él va a casa', english: 'He goes home', words: ['Él', 'va', 'a', 'casa'] },
            { spanish: 'Buenos días amigo', english: 'Good morning friend', words: ['Buenos', 'días', 'amigo'] }
        ],
        A2: [
            { spanish: 'Voy a la escuela todos los días', english: 'I go to school every day', words: ['Voy', 'a', 'la', 'escuela', 'todos', 'los', 'días'] },
            { spanish: 'Me gusta viajar en verano', english: 'I like to travel in summer', words: ['Me', 'gusta', 'viajar', 'en', 'verano'] },
            { spanish: 'Quiero comprar una película nueva', english: 'I want to buy a new movie', words: ['Quiero', 'comprar', 'una', 'película', 'nueva'] },
            { spanish: 'El restaurante está en la ciudad', english: 'The restaurant is in the city', words: ['El', 'restaurante', 'está', 'en', 'la', 'ciudad'] },
            { spanish: 'Necesito más tiempo para trabajar', english: 'I need more time to work', words: ['Necesito', 'más', 'tiempo', 'para', 'trabajar'] }
        ],
        B1: [
            { spanish: 'Es importante desarrollar nuevas habilidades', english: 'It\'s important to develop new skills', words: ['Es', 'importante', 'desarrollar', 'nuevas', 'habilidades'] },
            { spanish: 'La situación requiere una solución rápida', english: 'The situation requires a quick solution', words: ['La', 'situación', 'requiere', 'una', 'solución', 'rápida'] },
            { spanish: 'Mi experiencia en este campo es limitada', english: 'My experience in this field is limited', words: ['Mi', 'experiencia', 'en', 'este', 'campo', 'es', 'limitada'] }
        ],
        B2: [
            { spanish: 'El desafío más grande es mantener la innovación', english: 'The biggest challenge is maintaining innovation', words: ['El', 'desafío', 'más', 'grande', 'es', 'mantener', 'la', 'innovación'] },
            { spanish: 'Desde mi perspectiva la estrategia es sostenible', english: 'From my perspective the strategy is sustainable', words: ['Desde', 'mi', 'perspectiva', 'la', 'estrategia', 'es', 'sostenible'] }
        ]
    };

    const sentences = sentenceSets[level] || sentenceSets.A2;
    return sentences.slice(0, count);
}

/**
 * Generate sentence with blank for fill-in game
 */
function generateSentenceWithBlank(word, level) {
    // Simple templates by level
    const templates = {
        A1: [
            `Me gusta ${word}`,
            `Yo tengo un ${word}`,
            `El ${word} es grande`
        ],
        A2: [
            `Voy al ${word} todos los días`,
            `Me gustaría visitar el ${word}`,
            `El ${word} está muy lejos`
        ],
        B1: [
            `La ${word} requiere atención`,
            `Necesito ${word} esta situación`,
            `Mi ${word} en este tema es limitada`
        ]
    };

    const levelTemplates = templates[level] || templates.A2;
    const template = levelTemplates[Math.floor(Math.random() * levelTemplates.length)];
    
    return template.replace(word, '____');
}

/**
 * Generate distractor words for multiple choice
 */
function generateDistractors(correctWord, level) {
    const allWords = getDefaultWordsByLevel(level, 10);
    const distractors = allWords
        .filter(w => w.word !== correctWord)
        .slice(0, 3)
        .map(w => w.word);
    
    return [correctWord, ...distractors].sort(() => Math.random() - 0.5);
}

/**
 * Shuffle array in place
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = router;
