/**
 * 🎵 MUSIC & LYRICS API
 * 
 * Learn Spanish through music
 */

const express = require('express');
const router = express.Router();
const musicSystem = require('../lib/music-lyrics-system');

/**
 * POST /api/music/add
 * Add a new song with lyrics
 */
router.post('/add', async (req, res) => {
    try {
        const result = await musicSystem.addSong(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/music/by-level
 * Get songs by CEFR level
 */
router.get('/by-level', async (req, res) => {
    try {
        const { level = 'B1', limit = 20 } = req.query;
        const songs = await musicSystem.getSongsByLevel(level, parseInt(limit));
        
        res.json({
            success: true,
            songs,
            count: songs.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/music/search
 * Search songs
 */
router.get('/search', async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter "q" is required'
            });
        }

        const songs = await musicSystem.searchSongs(q, parseInt(limit));
        
        res.json({
            success: true,
            songs,
            count: songs.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/music/recommended
 * Get recommended songs for user
 */
router.get('/recommended', async (req, res) => {
    try {
        const { userId = 'demo-user', limit = 10 } = req.query;
        const songs = await musicSystem.getRecommendedSongs(userId, parseInt(limit));
        
        res.json({
            success: true,
            songs,
            count: songs.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/music/exercise/:songId
 * Create practice exercise from song
 */
router.post('/exercise/:songId', async (req, res) => {
    try {
        const { songId } = req.params;
        const { type = 'fill-in-blank' } = req.body;
        
        const result = await musicSystem.createExercise(songId, type);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/music/play/:songId
 * Track song playback
 */
router.post('/play/:songId', async (req, res) => {
    try {
        const { songId } = req.params;
        const { userId = 'demo-user' } = req.body;
        
        await musicSystem.trackPlayback(userId, songId);
        
        res.json({
            success: true
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/music/stats/:songId
 * Get song statistics
 */
router.get('/stats/:songId', async (req, res) => {
    try {
        const { songId } = req.params;
        const stats = await musicSystem.getSongStats(songId);
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

