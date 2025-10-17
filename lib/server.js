// 🚀 UNIFIED FEED SERVER - Complete Language Learning Platform
// Integrates: News, Social Media, Videos, AI Articles, LangFeed Videos

const express = require('express');
const cors = require('cors');
const path = require('path');
const unifiedFeedRouter = require('./lib/unified-feed-api.js');
const AIStoryGenerator = require('./lib/ai-story-generator.js');
const socialRouter = require('./lib/social-features.js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'unified-infinite-feed.html'));
});

// API Routes
app.use('/api', unifiedFeedRouter);
app.use('/api/social', socialRouter);

// Initialize AI Story Generator
const storyGen = new AIStoryGenerator();

// 🎬 NEW FEATURE: AI Story Arc Generation
app.post('/api/story/start', async (req, res) => {
    try {
        const { userId = 'user_' + Date.now(), level = 'A2' } = req.body;

        console.log(`🎯 Starting new story for ${userId} at level ${level}`);

        const storyArc = await storyGen.generateStoryArc(userId, level);

        res.json({
            success: true,
            story: storyArc,
            message: 'Quest started! Follow the hamster 🐹'
        });

    } catch (error) {
        console.error('Story start error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start story'
        });
    }
});

// 🎭 Process user choice and generate consequence
app.post('/api/story/choice', async (req, res) => {
    try {
        const { storyId, userInput, expectedPattern, storyContext } = req.body;

        const consequence = await storyGen.processFunnyConsequence(
            userInput,
            expectedPattern,
            storyContext
        );

        res.json({
            success: true,
            consequence: consequence,
            hamster: '🐹 ' + consequence.hamsterReaction
        });

    } catch (error) {
        console.error('Choice processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process choice'
        });
    }
});

// Serve the unified feed HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'unified-infinite-feed.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        apis: ['NewsAPI', 'Guardian', 'Pexels', 'Unsplash', 'DeepL', 'LangFeed']
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║  🌍 UNIFIED FEED SERVER RUNNING        ║
    ║  📱 http://localhost:${PORT}            ║
    ║                                        ║
    ║  📊 API Endpoints:                     ║
    ║  GET  /api/unified-feed                ║
    ║  GET  /api/langfeed/stream/:videoId    ║
    ║  POST /api/detect-level                ║
    ║  POST /api/preferences                 ║
    ║                                        ║
    ║  🎯 Features:                          ║
    ║  ✅ Real News (NewsAPI, Guardian)      ║
    ║  ✅ Videos (Pexels, LangFeed)          ║
    ║  ✅ Translation (DeepL)                ║
    ║  ✅ Level Adaptation (A1-C2)           ║
    ║  ✅ Interest Detection                 ║
    ╚════════════════════════════════════════╝
    `);
});
