/**
 * 🤖 AI CONTENT GENERATION API
 * 
 * Generate personalized stories, dialogues, and lessons
 */

const express = require('express');
const router = express.Router();
const aiStoryGenerator = require('../lib/ai-story-generator');

/**
 * POST /api/ai-content/story
 * Generate a personalized story
 */
router.post('/story', async (req, res) => {
    try {
        const {
            userId = 'demo-user',
            genre = 'adventure',
            theme = 'travel',
            length = 'short',
            level = 'B1',
            customPrompt = null
        } = req.body;

        const result = await aiStoryGenerator.generateStory(userId, {
            genre,
            theme,
            length,
            level,
            customPrompt
        });

        res.json(result);

    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/ai-content/dialogue
 * Generate a conversation scenario
 */
router.post('/dialogue', async (req, res) => {
    try {
        const {
            userId = 'demo-user',
            scenario = 'restaurant',
            participants = 2,
            level = 'B1',
            exchanges = 10
        } = req.body;

        const result = await aiStoryGenerator.generateDialogue(userId, {
            scenario,
            participants,
            level,
            exchanges
        });

        res.json(result);

    } catch (error) {
        console.error('Error generating dialogue:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/ai-content/micro-lesson
 * Generate a quick lesson on a topic
 */
router.post('/micro-lesson', async (req, res) => {
    try {
        const {
            userId = 'demo-user',
            topic,
            level = 'B1'
        } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                error: 'Topic is required'
            });
        }

        const result = await aiStoryGenerator.generateMicroLesson(userId, topic, level);

        res.json(result);

    } catch (error) {
        console.error('Error generating micro-lesson:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/ai-content/genres
 * Get available story genres
 */
router.get('/genres', (req, res) => {
    res.json({
        success: true,
        genres: aiStoryGenerator.GENRES
    });
});

/**
 * GET /api/ai-content/themes
 * Get available story themes
 */
router.get('/themes', (req, res) => {
    res.json({
        success: true,
        themes: aiStoryGenerator.THEMES
    });
});

module.exports = router;

