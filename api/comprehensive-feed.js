/**
 * 🌟 COMPREHENSIVE FEED API
 * Best-in-class feed system for language learners
 * 
 * Features:
 * - Unified content feed (videos, articles, music)
 * - Multi-level filtering (A1-C2)
 * - Topic-based filtering
 * - Search functionality
 * - Personalized recommendations
 * - Analytics tracking
 */

const express = require('express');
const router = express.Router();
const unifiedFeedV2 = require('../lib/unified-feed-algorithm-v2');
const supabase = require('../lib/supabase-client');

/**
 * GET /api/feed/comprehensive
 * Get personalized comprehensive feed
 * 
 * Query params:
 * - userId: User ID (required)
 * - limit: Number of items (default: 30)
 * - offset: Pagination offset (default: 0)
 * - types: Comma-separated content types (video,article,music)
 * - level: CEFR level filter (A1-C2)
 * - topic: Topic filter
 * - search: Search query
 * - sort: Sort order (recommended, recent, popular)
 */
router.get('/comprehensive', async (req, res) => {
    try {
        const {
            userId,
            limit = 30,
            offset = 0,
            types = 'video,article,music',
            level = null,
            topic = null,
            search = null,
            sort = 'recommended'
        } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        console.log(`📱 Comprehensive feed request:`, {
            userId,
            limit,
            offset,
            types,
            level,
            topic,
            search,
            sort
        });

        // Parse content types
        const contentTypes = types.split(',').map(t => t.trim());

        // Generate feed
        const feed = await unifiedFeedV2.generateUnifiedFeed(userId, {
            limit: parseInt(limit) + parseInt(offset) + 50, // Extra for filtering
            contentTypes,
            levelFilter: level,
            topicFilter: topic,
            includeAnalysis: true
        });

        // Apply search filter
        let filteredFeed = feed;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredFeed = feed.filter(item =>
                (item.title && item.title.toLowerCase().includes(searchLower)) ||
                (item.description && item.description.toLowerCase().includes(searchLower)) ||
                (item.artist && item.artist.toLowerCase().includes(searchLower)) ||
                (item.content && item.content.toLowerCase().includes(searchLower))
            );
        }

        // Apply sorting
        if (sort === 'recent') {
            filteredFeed.sort((a, b) => {
                const dateA = new Date(a.publishedAt || a.createdAt || a.uploadDate || 0);
                const dateB = new Date(b.publishedAt || b.createdAt || b.uploadDate || 0);
                return dateB - dateA;
            });
        } else if (sort === 'popular') {
            filteredFeed.sort((a, b) => (b.views || 0) - (a.views || 0));
        }
        // 'recommended' is already sorted by score

        // Apply pagination
        const paginated = filteredFeed.slice(
            parseInt(offset),
            parseInt(offset) + parseInt(limit)
        );

        // Track feed view
        await trackFeedView(userId, paginated);

        res.json({
            success: true,
            items: paginated,
            total: filteredFeed.length,
            offset: parseInt(offset),
            limit: parseInt(limit),
            hasMore: filteredFeed.length > parseInt(offset) + parseInt(limit),
            filters: {
                types: contentTypes,
                level,
                topic,
                search,
                sort
            }
        });

    } catch (error) {
        console.error('Error getting comprehensive feed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate feed',
            details: error.message
        });
    }
});

/**
 * GET /api/feed/filters
 * Get available filter options
 */
router.get('/filters', async (req, res) => {
    try {
        const { userId } = req.query;

        // Get available topics from user's content
        const topics = [
            'travel',
            'food',
            'culture',
            'sports',
            'technology',
            'music',
            'entertainment',
            'news',
            'education',
            'health',
            'business',
            'science',
            'art'
        ];

        // Get content type counts
        const stats = {
            videos: 0,
            articles: 0,
            music: 0
        };

        // If user provided, get personalized stats
        if (userId) {
            // This could be expanded to show actual available content counts
        }

        res.json({
            success: true,
            filters: {
                levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
                topics: topics.sort(),
                types: ['video', 'article', 'music'],
                sorts: ['recommended', 'recent', 'popular']
            },
            stats
        });

    } catch (error) {
        console.error('Error getting filters:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get filters'
        });
    }
});

/**
 * POST /api/feed/interaction
 * Track user interaction with feed item
 * 
 * Body:
 * - userId: User ID
 * - contentId: Content ID
 * - contentType: Content type (video/article/music)
 * - interactionType: Interaction type (view, complete, save, like, skip)
 * - duration: Engagement duration in seconds
 */
router.post('/interaction', async (req, res) => {
    try {
        const {
            userId,
            contentId,
            contentType,
            interactionType,
            duration = 0,
            metadata = {}
        } = req.body;

        if (!userId || !contentId || !contentType || !interactionType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Track interaction in database
        const { data, error } = await supabase
            .from('user_interactions')
            .insert([{
                user_id: userId,
                content_id: contentId,
                content_type: contentType,
                interaction_type: interactionType,
                duration_seconds: duration,
                metadata,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        console.log(`📊 Tracked interaction: ${userId} ${interactionType} ${contentType}/${contentId}`);

        res.json({
            success: true,
            interaction: data
        });

    } catch (error) {
        console.error('Error tracking interaction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track interaction',
            details: error.message
        });
    }
});

/**
 * GET /api/feed/stats/:userId
 * Get user's feed statistics
 */
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get interaction stats
        const { data: interactions, error } = await supabase
            .from('user_interactions')
            .select('content_type, interaction_type, duration_seconds, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            throw error;
        }

        // Calculate stats
        const stats = {
            totalInteractions: interactions.length,
            videosWatched: interactions.filter(i => 
                i.content_type === 'video' && i.interaction_type === 'complete'
            ).length,
            articlesRead: interactions.filter(i => 
                i.content_type === 'article' && i.interaction_type === 'complete'
            ).length,
            songsListened: interactions.filter(i => 
                i.content_type === 'music' && i.interaction_type === 'complete'
            ).length,
            itemsSaved: interactions.filter(i => 
                i.interaction_type === 'save'
            ).length,
            totalMinutes: Math.round(
                interactions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0) / 60
            ),
            thisWeek: interactions.filter(i => {
                const created = new Date(i.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return created >= weekAgo;
            }).length
        };

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error getting feed stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get stats',
            details: error.message
        });
    }
});

/**
 * POST /api/feed/refresh
 * Force refresh feed (clear cache)
 */
router.post('/refresh', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        // Generate fresh feed
        const feed = await unifiedFeedV2.generateUnifiedFeed(userId, {
            limit: 30,
            contentTypes: ['video', 'article', 'music'],
            includeAnalysis: true
        });

        res.json({
            success: true,
            items: feed,
            message: 'Feed refreshed successfully'
        });

    } catch (error) {
        console.error('Error refreshing feed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to refresh feed'
        });
    }
});

/**
 * Helper: Track feed view for analytics
 */
async function trackFeedView(userId, items) {
    try {
        // Track that user viewed these items
        const viewData = items.map(item => ({
            user_id: userId,
            content_id: item.id,
            content_type: item.type,
            interaction_type: 'view',
            created_at: new Date().toISOString()
        }));

        // Batch insert (limit to first 10 to avoid overwhelming DB)
        if (viewData.length > 0) {
            await supabase
                .from('user_interactions')
                .insert(viewData.slice(0, 10));
        }
    } catch (error) {
        // Don't fail the request if tracking fails
        console.error('Error tracking feed view:', error);
    }
}

module.exports = router;

