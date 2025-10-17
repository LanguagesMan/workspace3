/**
 * 📊 VIDEO INTERACTION TRACKING API
 * 
 * Tracks all user interactions with videos for smart recommendations:
 * - Video views and completions
 * - Watch time and completion rate
 * - Skips, pauses, replays
 * - Word clicks
 * - Likes and saves
 * 
 * Used by SmartVideoRecommender to learn user preferences and behavior
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Use shared recommender instance (will be set by server.js)
let recommender = null;

// Export function to set the recommender
router.setRecommender = (recommenderInstance) => {
    recommender = recommenderInstance;
};

// Getter for recommender with fallback
function getRecommender() {
    if (!recommender) {
        // Fallback: create new instance if not set
        const SmartVideoRecommender = require('../lib/smart-video-recommender');
        recommender = new SmartVideoRecommender();
    }
    return recommender;
}

/**
 * Track video interaction
 * POST /api/video-interactions/track
 * 
 * Body: {
 *   userId: string,
 *   videoId: string,
 *   interactionType: 'view' | 'complete' | 'skip' | 'pause' | 'rewatch' | 'like' | 'word_click',
 *   watchTime: number (seconds),
 *   videoDuration: number (seconds),
 *   completionRate: number (0-1),
 *   videoMetadata: { title, description, theme, category, level, tags }
 * }
 */
router.post('/track', async (req, res) => {
    try {
        const {
            userId = 'anonymous',
            videoId,
            interactionType,
            watchTime = 0,
            videoDuration = 30,
            completionRate = 0,
            videoMetadata = {},
            wordClicks = 0,
            rewatch = false
        } = req.body;

        if (!videoId || !interactionType) {
            return res.status(400).json({
                success: false,
                error: 'videoId and interactionType are required'
            });
        }

        console.log(`📊 Tracking: ${userId} ${interactionType} ${videoId} (${Math.round(completionRate * 100)}% complete)`);

        // Build interaction object
        const interaction = {
            type: 'video_watch',
            videoId,
            interactionType,
            watchTime,
            videoDuration,
            completionRate,
            videoTitle: videoMetadata.title,
            videoDescription: videoMetadata.description,
            videoTheme: videoMetadata.theme || videoMetadata.category,
            videoCategory: videoMetadata.category,
            videoLevel: videoMetadata.level,
            wordClicks,
            rewatch,
            timestamp: new Date().toISOString()
        };

        // Update user profile
        const updatedProfile = await getRecommender().updateUserProfile(userId, interaction);

        // Also save to interaction log for analytics
        await saveInteractionLog(userId, interaction);

        res.json({
            success: true,
            message: 'Interaction tracked',
            profile: {
                watchedCount: updatedProfile.watchedVideos.length,
                topInterests: getTopInterests(updatedProfile.interests, 3),
                level: updatedProfile.level
            }
        });

    } catch (error) {
        console.error('❌ Error tracking interaction:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get user's watch history
 * GET /api/video-interactions/history/:userId
 */
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50 } = req.query;

        const profile = await getRecommender().getUserProfile(userId);

        res.json({
            success: true,
            userId,
            watchedVideos: profile.watchedVideos.slice(-limit),
            totalWatched: profile.watchedVideos.length,
            interests: profile.interests,
            behaviorPatterns: profile.behaviorPatterns
        });

    } catch (error) {
        console.error('❌ Error fetching history:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get user's detected interests
 * GET /api/video-interactions/interests/:userId
 */
router.get('/interests/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await getRecommender().getUserProfile(userId);

        const sortedInterests = Object.entries(profile.interests)
            .sort(([, a], [, b]) => b - a)
            .map(([interest, weight]) => ({
                interest,
                weight: Math.round(weight * 100) / 100,
                percentage: Math.round(weight * 100)
            }));

        res.json({
            success: true,
            userId,
            interests: sortedInterests,
            topThemes: getTopThemes(profile.seenThemes, 10)
        });

    } catch (error) {
        console.error('❌ Error fetching interests:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Mark video as watched (simple tracking)
 * POST /api/video-interactions/watched
 * 
 * Body: { userId, videoId }
 */
router.post('/watched', async (req, res) => {
    try {
        const { userId = 'anonymous', videoId } = req.body;

        if (!videoId) {
            return res.status(400).json({
                success: false,
                error: 'videoId is required'
            });
        }

        const interaction = {
            type: 'video_watch',
            videoId,
            interactionType: 'view',
            completionRate: 1.0,
            timestamp: new Date().toISOString()
        };

        await recommender.updateUserProfile(userId, interaction);

        res.json({
            success: true,
            message: 'Video marked as watched'
        });

    } catch (error) {
        console.error('❌ Error marking watched:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Clear watch history (for testing)
 * DELETE /api/video-interactions/history/:userId
 */
router.delete('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Delete user profile file
        const profilePath = path.join(__dirname, '../data/user-profiles', `${userId}.json`);
        if (fs.existsSync(profilePath)) {
            fs.unlinkSync(profilePath);
        }

        // Clear cache
        getRecommender().clearCache();

        res.json({
            success: true,
            message: 'Watch history cleared'
        });

    } catch (error) {
        console.error('❌ Error clearing history:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get user stats
 * GET /api/video-interactions/stats/:userId
 */
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await getRecommender().getUserProfile(userId);

        const interactions = profile.interactions || [];
        const skipCount = interactions.filter(i => i.type === 'skip').length;
        const rewatchCount = interactions.filter(i => i.type === 'rewatch').length;
        
        const stats = {
            userId,
            level: profile.level,
            totalWatched: profile.watchedVideos.length,
            totalInteractions: interactions.length,
            topInterests: getTopInterests(profile.interests, 5),
            topThemes: getTopThemes(profile.seenThemes, 5),
            behaviorPatterns: {
                avgCompletionRate: Math.round(profile.behaviorPatterns.avgCompletionRate * 100),
                avgWatchTime: Math.round(profile.behaviorPatterns.avgWatchTime),
                skipRate: interactions.length > 0 ? Math.round((skipCount / interactions.length) * 100) : 0,
                rewatchRate: interactions.length > 0 ? Math.round((rewatchCount / interactions.length) * 100) : 0
            },
            knownWordsCount: profile.knownWords.size
        };

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper functions

function saveInteractionLog(userId, interaction) {
    try {
        const logDir = path.join(__dirname, '../data/interaction-logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logDir, `${today}.jsonl`);

        const logEntry = JSON.stringify({
            userId,
            ...interaction,
            timestamp: new Date().toISOString()
        }) + '\n';

        fs.appendFileSync(logFile, logEntry);
    } catch (error) {
        console.error('Failed to save interaction log:', error);
    }
}

function getTopInterests(interests, limit) {
    return Object.entries(interests)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([interest, weight]) => ({
            interest,
            weight: Math.round(weight * 100) / 100
        }));
}

function getTopThemes(themes, limit) {
    return Object.entries(themes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([theme, count]) => ({
            theme,
            count
        }));
}

module.exports = router;

