/**
 * 🎯 PERSONALIZATION API - Routes for recommendations and intelligence
 * 
 * Provides endpoints for:
 * - Article recommendations
 * - Article difficulty analysis
 * - User comprehension calculation
 * - Recommendation feedback tracking
 */

const express = require('express');
const router = express.Router();
const recommendationEngine = require('./recommendation-engine-enhanced');
const articleAnalyzer = require('./article-difficulty-analyzer');

/**
 * Get personalized article recommendations
 * GET /api/personalization/recommendations?userId=xxx&type=articles&limit=20
 */
router.get('/personalization/recommendations', async (req, res) => {
    try {
        const { userId, type = 'articles', limit = 20 } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const recommendations = await recommendationEngine.getRecommendations(
            userId,
            type,
            parseInt(limit)
        );

        res.json({
            success: true,
            recommendations,
            count: recommendations.length,
            userId,
            type
        });

    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({
            error: 'Failed to get recommendations',
            details: error.message
        });
    }
});

/**
 * Analyze article difficulty
 * POST /api/personalization/analyze-article
 */
router.post('/personalization/analyze-article', async (req, res) => {
    try {
        const { articleText, userId } = req.body;
        
        if (!articleText) {
            return res.status(400).json({ error: 'articleText is required' });
        }

        // Analyze difficulty
        const difficultyAnalysis = await articleAnalyzer.analyzeArticle(articleText);
        
        // Calculate user comprehension if userId provided
        let comprehension = null;
        if (userId) {
            comprehension = await articleAnalyzer.calculateUserComprehension(articleText, userId);
        }

        res.json({
            success: true,
            difficulty: difficultyAnalysis,
            comprehension: comprehension
        });

    } catch (error) {
        console.error('Error analyzing article:', error);
        res.status(500).json({
            error: 'Failed to analyze article',
            details: error.message
        });
    }
});

/**
 * Get user comprehension for article
 * POST /api/personalization/user-comprehension
 */
router.post('/personalization/user-comprehension', async (req, res) => {
    try {
        const { articleText, userId } = req.body;
        
        if (!articleText || !userId) {
            return res.status(400).json({ error: 'articleText and userId are required' });
        }

        const comprehension = await articleAnalyzer.calculateUserComprehension(articleText, userId);

        res.json({
            success: true,
            comprehension
        });

    } catch (error) {
        console.error('Error calculating comprehension:', error);
        res.status(500).json({
            error: 'Failed to calculate comprehension',
            details: error.message
        });
    }
});

/**
 * Track recommendation feedback
 * POST /api/personalization/feedback
 */
router.post('/personalization/feedback', async (req, res) => {
    try {
        const { userId, contentId, feedback } = req.body;
        
        if (!userId || !contentId || !feedback) {
            return res.status(400).json({ error: 'userId, contentId, and feedback are required' });
        }

        await recommendationEngine.trackRecommendationFeedback(userId, contentId, feedback);

        res.json({
            success: true,
            message: 'Feedback recorded successfully'
        });

    } catch (error) {
        console.error('Error tracking feedback:', error);
        res.status(500).json({
            error: 'Failed to track feedback',
            details: error.message
        });
    }
});

/**
 * Track content interaction (enhanced tracking)
 * POST /api/personalization/track-interaction
 */
router.post('/personalization/track-interaction', async (req, res) => {
    try {
        const {
            userId,
            contentId,
            contentType,
            interactionType,
            watchTime,
            completionPercentage,
            rating,
            artist,
            genre,
            topic,
            category,
            difficulty,
            sessionId,
            source = 'feed'
        } = req.body;

        if (!userId || !contentId || !contentType || !interactionType) {
            return res.status(400).json({
                error: 'userId, contentId, contentType, and interactionType are required'
            });
        }

        const { supabase, isConfigured } = require('./supabase-client');

        if (!isConfigured()) {
            console.log(`⚠️ Supabase not configured, would track: ${interactionType} on ${contentType} ${contentId}`);
            return res.json({
                success: true,
                message: 'Interaction tracked (dev mode)',
                interaction: { userId, contentId, interactionType }
            });
        }

        // Insert interaction into database
        const { data: interaction, error } = await supabase
            .from('user_content_interactions')
            .insert({
                user_id: userId,
                content_id: contentId,
                content_type: contentType,
                interaction_type: interactionType,
                watch_time_seconds: watchTime,
                completion_percentage: completionPercentage,
                rating,
                artist,
                genre,
                topic,
                category,
                difficulty,
                session_id: sessionId,
                source
            })
            .select()
            .single();

        if (error) {
            console.error('Error tracking interaction:', error);
            return res.status(500).json({
                error: 'Failed to track interaction',
                details: error.message
            });
        }

        console.log(`✅ Tracked ${interactionType} interaction for user ${userId} on ${contentType} ${contentId}`);

        // If high completion rate, potentially auto-learn preferences
        if (completionPercentage >= 0.8) {
            const preferenceLearning = require('./preference-learning-engine');
            // Run learning asynchronously (don't wait)
            preferenceLearning.analyzeAndUpdatePreferences(userId).catch(err => {
                console.error('Error in auto-learning preferences:', err);
            });
        }

        res.json({
            success: true,
            interaction,
            message: 'Interaction tracked successfully'
        });

    } catch (error) {
        console.error('Error tracking interaction:', error);
        res.status(500).json({
            error: 'Failed to track interaction',
            details: error.message
        });
    }
});

/**
 * Run preference learning analysis for user
 * POST /api/personalization/learn-preferences
 */
router.post('/personalization/learn-preferences', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const preferenceLearning = require('./preference-learning-engine');
        const result = await preferenceLearning.analyzeAndUpdatePreferences(userId);

        res.json(result);

    } catch (error) {
        console.error('Error learning preferences:', error);
        res.status(500).json({
            error: 'Failed to learn preferences',
            details: error.message
        });
    }
});

/**
 * Clear recommendation cache (for testing)
 * POST /api/personalization/clear-cache
 */
router.post('/personalization/clear-cache', async (req, res) => {
    try {
        recommendationEngine.clearCache();

        res.json({
            success: true,
            message: 'Recommendation cache cleared'
        });

    } catch (error) {
        console.error('Error clearing cache:', error);
        res.status(500).json({
            error: 'Failed to clear cache',
            details: error.message
        });
    }
});

module.exports = router;

