/**
 * 🎙️ AI CONVERSATION API
 * Voice-enabled chatbot endpoints
 */

const express = require('express');
const router = express.Router();
const aiConversation = require('../lib/ai-conversation-partner');
const multer = require('multer');
const { requireAuth } = require('../lib/auth-service');

// Configure multer for audio file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    },
    fileFilter: (req, file, cb) => {
        // Accept audio files
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    }
});

/**
 * POST /api/conversation/message
 * Send text message and get AI response
 */
router.post('/message', async (req, res) => {
    try {
        const { userId, message, topic } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ error: 'userId and message are required' });
        }

        const response = await aiConversation.generateResponse(userId, message, topic);

        res.json({
            success: true,
            ...response
        });
    } catch (error) {
        console.error('Error in /api/conversation/message:', error);
        res.status(500).json({ 
            error: 'Failed to generate response',
            details: error.message 
        });
    }
});

/**
 * POST /api/conversation/voice
 * Transcribe voice input and get AI response
 */
router.post('/voice', upload.single('audio'), async (req, res) => {
    try {
        const { userId, topic } = req.body;
        const audioBuffer = req.file?.buffer;

        if (!userId || !audioBuffer) {
            return res.status(400).json({ error: 'userId and audio file are required' });
        }

        // Transcribe audio
        const transcription = await aiConversation.transcribeAudio(audioBuffer, 'es');

        // Generate AI response
        const response = await aiConversation.generateResponse(
            userId,
            transcription.text,
            topic
        );

        res.json({
            success: true,
            userMessage: transcription.text,
            confidence: transcription.confidence,
            ...response
        });
    } catch (error) {
        console.error('Error in /api/conversation/voice:', error);
        res.status(500).json({ 
            error: 'Failed to process voice input',
            details: error.message 
        });
    }
});

/**
 * POST /api/conversation/tts
 * Generate text-to-speech for AI response
 */
router.post('/tts', async (req, res) => {
    try {
        const { text, voice } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'text is required' });
        }

        const audioBuffer = await aiConversation.generateSpeech(text, voice || 'nova');

        // Set headers for audio streaming
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
            'Cache-Control': 'public, max-age=3600'
        });

        res.send(audioBuffer);
    } catch (error) {
        console.error('Error in /api/conversation/tts:', error);
        res.status(500).json({ 
            error: 'Failed to generate speech',
            details: error.message 
        });
    }
});

/**
 * POST /api/conversation/start
 * Start a new conversation with a topic
 */
router.post('/start', async (req, res) => {
    try {
        const { userId, topic } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const opening = await aiConversation.startConversation(userId, topic || 'general');

        res.json({
            success: true,
            ...opening
        });
    } catch (error) {
        console.error('Error in /api/conversation/start:', error);
        res.status(500).json({ 
            error: 'Failed to start conversation',
            details: error.message 
        });
    }
});

/**
 * GET /api/conversation/topics/:userId
 * Get suggested conversation topics for user
 */
router.get('/topics/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const topics = await aiConversation.getSuggestedTopics(userId);

        res.json({
            success: true,
            ...topics
        });
    } catch (error) {
        console.error('Error in /api/conversation/topics:', error);
        res.status(500).json({ 
            error: 'Failed to get topics',
            details: error.message 
        });
    }
});

/**
 * DELETE /api/conversation/history/:userId
 * Clear conversation history
 */
router.delete('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        aiConversation.clearHistory(userId);

        res.json({
            success: true,
            message: 'Conversation history cleared'
        });
    } catch (error) {
        console.error('Error in /api/conversation/history:', error);
        res.status(500).json({ 
            error: 'Failed to clear history',
            details: error.message 
        });
    }
});

/**
 * GET /api/conversation/stats/:userId
 * Get conversation statistics
 */
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const stats = aiConversation.getConversationStats(userId);

        res.json({
            success: true,
            ...stats
        });
    } catch (error) {
        console.error('Error in /api/conversation/stats:', error);
        res.status(500).json({ 
            error: 'Failed to get stats',
            details: error.message 
        });
    }
});

module.exports = router;

