/**
 * 📚 SRS VOCABULARY API
 * Complete vocabulary management with spaced repetition
 * 
 * Endpoints:
 * - POST /save - Save word to vocabulary
 * - GET /due - Get words due for review
 * - POST /review - Review a word
 * - GET /stats - Get vocabulary statistics
 * - GET /all - Get all vocabulary
 * - DELETE /:wordId - Delete a word
 * - GET /streak - Get learning streak
 */

const express = require('express');
const router = express.Router();
const srsSystem = require('../lib/srs-vocabulary-system');

/**
 * POST /api/vocabulary/save
 * Save a new word to vocabulary
 */
router.post('/save', async (req, res) => {
    try {
        const {
            userId,
            word,
            translation,
            context,
            sourceType,
            sourceId,
            difficulty
        } = req.body;

        if (!userId || !word || !translation) {
            return res.status(400).json({
                success: false,
                error: 'userId, word, and translation are required'
            });
        }

        const savedWord = await srsSystem.saveWord(userId, {
            word,
            translation,
            context,
            sourceType,
            sourceId,
            difficulty
        });

        res.json({
            success: true,
            word: savedWord
        });

    } catch (error) {
        console.error('Error saving word:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save word',
            details: error.message
        });
    }
});

/**
 * GET /api/vocabulary/due
 * Get words due for review
 */
router.get('/due', async (req, res) => {
    try {
        const { userId, limit = 20 } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const dueWords = await srsSystem.getDueWords(userId, parseInt(limit));

        res.json({
            success: true,
            words: dueWords,
            count: dueWords.length
        });

    } catch (error) {
        console.error('Error getting due words:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get due words',
            details: error.message
        });
    }
});

/**
 * POST /api/vocabulary/review
 * Review a word and update SRS data
 */
router.post('/review', async (req, res) => {
    try {
        const { wordId, quality } = req.body;

        if (!wordId || !quality) {
            return res.status(400).json({
                success: false,
                error: 'wordId and quality are required'
            });
        }

        if (!['again', 'hard', 'good', 'easy'].includes(quality)) {
            return res.status(400).json({
                success: false,
                error: 'quality must be: again, hard, good, or easy'
            });
        }

        const updatedWord = await srsSystem.reviewWord(wordId, quality);

        res.json({
            success: true,
            word: updatedWord
        });

    } catch (error) {
        console.error('Error reviewing word:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to review word',
            details: error.message
        });
    }
});

/**
 * GET /api/vocabulary/stats
 * Get vocabulary statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const stats = await srsSystem.getStats(userId);

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get stats',
            details: error.message
        });
    }
});

/**
 * GET /api/vocabulary/all
 * Get all vocabulary for user
 */
router.get('/all', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const words = await srsSystem.getAllWords(userId);

        res.json({
            success: true,
            words,
            count: words.length
        });

    } catch (error) {
        console.error('Error getting all words:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get words',
            details: error.message
        });
    }
});

/**
 * DELETE /api/vocabulary/:wordId
 * Delete a word from vocabulary
 */
router.delete('/:wordId', async (req, res) => {
    try {
        const { wordId } = req.params;

        await srsSystem.deleteWord(wordId);

        res.json({
            success: true,
            message: 'Word deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting word:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete word',
            details: error.message
        });
    }
});

/**
 * GET /api/vocabulary/streak
 * Get user's learning streak
 */
router.get('/streak', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const streak = await srsSystem.getStreak(userId);

        res.json({
            success: true,
            streak
        });

    } catch (error) {
        console.error('Error getting streak:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get streak',
            details: error.message
        });
    }
});

/**
 * POST /api/vocabulary/delete
 * Delete word by word text (for inline translation)
 */
router.post('/delete', async (req, res) => {
    try {
        const { userId, word } = req.body;

        if (!userId || !word) {
            return res.status(400).json({
                success: false,
                error: 'userId and word are required'
            });
        }

        // Find and delete word
        const supabase = require('../lib/supabase-client');
        const { error } = await supabase
            .from('user_vocabulary')
            .delete()
            .eq('user_id', userId)
            .eq('word', word.toLowerCase());

        if (error) throw error;

        res.json({
            success: true,
            message: 'Word deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting word:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete word',
            details: error.message
        });
    }
});

module.exports = router;

