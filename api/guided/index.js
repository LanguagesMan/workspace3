const express = require('express');
const router = express.Router();
const GuidedLearningEngine = require('../../lib/guided-learning-engine');
const AICoachSystem = require('../../lib/ai-coach-system');

const engine = new GuidedLearningEngine();
const aiCoach = new AICoachSystem();

router.post('/session', async (req, res) => {
    try {
        const { userId = 'guest', article, options = {} } = req.body || {};

        if (!article || !article.content) {
            return res.status(400).json({
                success: false,
                error: 'Article content is required to build a guided session.'
            });
        }

        const session = await engine.generateSession({
            userId,
            article,
            options
        });

        res.json({
            success: true,
            session
        });
    } catch (error) {
        console.error('Guided session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate guided session',
            details: error.message
        });
    }
});

router.get('/demo', async (_req, res) => {
    try {
        const demoArticle = {
            id: 'demo-article',
            title: 'Un día en el mercado de Madrid',
            summary: 'Explora un mercado español mientras aprendes vocabulario esencial sobre comida y compras.',
            content: `
                Hoy visitamos el mercado de San Miguel en Madrid. Es un lugar famoso donde los turistas y los locales
                compran productos frescos. Primero hablamos con un vendedor que nos recomienda probar el jamón ibérico.
                Luego pedimos tapas y una bebida fría porque hace mucho calor. Finalmente, practicamos cómo pedir
                en español: "¿Cuánto cuesta?" y "Me gustaría comprar medio kilo, por favor".
            `
        };

        const session = await engine.generateSession({
            userId: 'demo',
            article: demoArticle
        });

        res.json({
            success: true,
            session
        });
    } catch (error) {
        console.error('Guided demo error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate guided demo',
            details: error.message
        });
    }
});

// Get all available topics
router.get('/topics', async (req, res) => {
    try {
        const userLevel = req.query.level || 'A1';
        const topics = engine.getAvailableTopics(userLevel);
        
        res.json({
            success: true,
            topics
        });
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch topics',
            details: error.message
        });
    }
});

// Get all available multi-day journeys
router.get('/journeys', async (req, res) => {
    try {
        const userLevel = req.query.level || 'A1';
        const journeys = engine.getAvailableJourneys(userLevel);
        
        res.json({
            success: true,
            journeys
        });
    } catch (error) {
        console.error('Error fetching journeys:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch journeys',
            details: error.message
        });
    }
});

// Start a single-topic journey
router.post('/journey/start', async (req, res) => {
    try {
        const { userId = 'guest', topicId, journeyType = 'standard' } = req.body;
        
        if (!topicId) {
            return res.status(400).json({
                success: false,
                error: 'Topic ID is required'
            });
        }
        
        const journey = await engine.startJourney(userId, topicId, journeyType);
        
        res.json({
            success: true,
            journey
        });
    } catch (error) {
        console.error('Error starting journey:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start journey',
            details: error.message
        });
    }
});

// Start a multi-day journey (7-day program)
router.post('/journey/multi-day/start', async (req, res) => {
    try {
        const { userId = 'guest', journeyId } = req.body;
        
        if (!journeyId) {
            return res.status(400).json({
                success: false,
                error: 'Journey ID is required'
            });
        }
        
        const multiDayJourney = await engine.startMultiDayJourney(userId, journeyId);
        
        res.json({
            success: true,
            journey: multiDayJourney
        });
    } catch (error) {
        console.error('Error starting multi-day journey:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start multi-day journey',
            details: error.message
        });
    }
});

// Get current day session for multi-day journey
router.post('/journey/multi-day/current', async (req, res) => {
    try {
        const { multiDayJourney } = req.body;
        
        if (!multiDayJourney) {
            return res.status(400).json({
                success: false,
                error: 'Multi-day journey data is required'
            });
        }
        
        const session = await engine.getCurrentDaySession(multiDayJourney);
        
        res.json({
            success: true,
            session
        });
    } catch (error) {
        console.error('Error getting current day session:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get current day session',
            details: error.message
        });
    }
});

// Complete current day and advance
router.post('/journey/multi-day/complete-day', async (req, res) => {
    try {
        const { multiDayJourney, dayResults } = req.body;
        
        if (!multiDayJourney || !dayResults) {
            return res.status(400).json({
                success: false,
                error: 'Journey data and day results are required'
            });
        }
        
        const result = await engine.completeDayAndAdvance(multiDayJourney, dayResults);
        
        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error('Error completing day:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to complete day',
            details: error.message
        });
    }
});

// Generate active recall quiz
router.post('/active-recall', async (req, res) => {
    try {
        const { learnedWords, articleContext } = req.body;
        
        if (!learnedWords || !articleContext) {
            return res.status(400).json({
                success: false,
                error: 'Learned words and article context are required'
            });
        }
        
        const quiz = engine.generateActiveRecallQuiz(learnedWords, articleContext);
        
        res.json({
            success: true,
            quiz
        });
    } catch (error) {
        console.error('Error generating active recall quiz:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate quiz',
            details: error.message
        });
    }
});

// Schedule spaced repetition
router.post('/spaced-repetition/schedule', async (req, res) => {
    try {
        const { userId, learnedWords, journeyId } = req.body;
        
        if (!userId || !learnedWords || !journeyId) {
            return res.status(400).json({
                success: false,
                error: 'User ID, learned words, and journey ID are required'
            });
        }
        
        const schedule = engine.scheduleSpacedRepetition(userId, learnedWords, journeyId);
        
        res.json({
            success: true,
            schedule
        });
    } catch (error) {
        console.error('Error scheduling spaced repetition:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to schedule spaced repetition',
            details: error.message
        });
    }
});

// AI Coach: Chat
router.post('/ai-coach/chat', async (req, res) => {
    try {
        const { userId, message, learningContext = {} } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }
        
        const response = await aiCoach.chat(userId, message, learningContext);
        
        res.json({
            success: true,
            ...response
        });
    } catch (error) {
        console.error('AI Coach chat error:', error);
        res.status(500).json({
            success: false,
            error: 'AI Coach failed to respond',
            details: error.message
        });
    }
});

// AI Coach: Grammar explanation
router.post('/ai-coach/grammar', async (req, res) => {
    try {
        const { grammarPoint, examples = [] } = req.body;
        
        if (!grammarPoint) {
            return res.status(400).json({
                success: false,
                error: 'Grammar point is required'
            });
        }
        
        const explanation = await aiCoach.explainGrammar(grammarPoint, examples);
        
        res.json({
            success: true,
            explanation
        });
    } catch (error) {
        console.error('Grammar explanation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to explain grammar',
            details: error.message
        });
    }
});

// AI Coach: Generate examples
router.post('/ai-coach/examples', async (req, res) => {
    try {
        const { word, count = 3, difficulty = 'A2' } = req.body;
        
        if (!word) {
            return res.status(400).json({
                success: false,
                error: 'Word is required'
            });
        }
        
        const examples = await aiCoach.generateExamples(word, count, difficulty);
        
        res.json({
            success: true,
            examples
        });
    } catch (error) {
        console.error('Examples generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate examples',
            details: error.message
        });
    }
});

// AI Coach: Pronunciation help
router.get('/ai-coach/pronunciation/:word', async (req, res) => {
    try {
        const { word } = req.params;
        
        const help = await aiCoach.getPronunciationHelp(word);
        
        res.json({
            success: true,
            ...help
        });
    } catch (error) {
        console.error('Pronunciation help error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get pronunciation help',
            details: error.message
        });
    }
});

// AI Coach: Get encouragement
router.post('/ai-coach/encouragement', async (req, res) => {
    try {
        const { progress = {} } = req.body;
        
        const encouragement = aiCoach.getEncouragement(progress);
        
        res.json({
            success: true,
            message: encouragement
        });
    } catch (error) {
        console.error('Encouragement error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get encouragement',
            details: error.message
        });
    }
});

module.exports = router;
