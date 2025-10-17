/**
 * 🎯 USER PREFERENCES API - Complete Personalization System
 * 
 * Manages user preferences for:
 * - Music (artists, genres)
 * - Articles (topics, sources)
 * - Videos (categories, creators)
 * - Learning settings
 * - Content mix preferences
 */

const express = require('express');
const router = express.Router();
const { supabase, isConfigured } = require('./supabase-client');

/**
 * Get user ID from request (authenticated or anonymous)
 */
function getUserId(req) {
    return req.headers['x-user-id'] || req.query.userId || 'anonymous_' + Date.now();
}

/**
 * Default preferences for new users
 */
const DEFAULT_PREFERENCES = {
    favorite_artists: [],
    favorite_music_genres: ['pop', 'reggaeton'],
    disliked_artists: [],
    favorite_topics: ['culture', 'technology'],
    favorite_sources: [],
    disliked_topics: [],
    favorite_categories: ['comedy', 'music'],
    favorite_creators: [],
    disliked_categories: [],
    preferred_content_types: { videos: 40, articles: 40, music: 20 },
    preferred_difficulty_range: { min: 'A2', max: 'B2' },
    learning_goals: ['vocabulary', 'listening'],
    daily_time_goal: 15,
    auto_play: true,
    show_translations: true,
    subtitle_language: 'both'
};

/**
 * GET user preferences
 * GET /api/preferences?userId=xxx
 */
router.get('/preferences', async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!isConfigured()) {
            console.log('⚠️ Supabase not configured, returning default preferences');
            return res.json({
                success: true,
                preferences: { ...DEFAULT_PREFERENCES, user_id: userId },
                isDefault: true
            });
        }

        const { data: preferences, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching preferences:', error);
            return res.status(500).json({ error: 'Failed to fetch preferences' });
        }

        // If no preferences exist, return defaults
        if (!preferences || error?.code === 'PGRST116') {
            console.log(`✅ No preferences found for ${userId}, returning defaults`);
            return res.json({
                success: true,
                preferences: { ...DEFAULT_PREFERENCES, user_id: userId },
                isDefault: true
            });
        }

        console.log(`✅ Retrieved preferences for user ${userId}`);
        res.json({
            success: true,
            preferences,
            isDefault: false
        });

    } catch (error) {
        console.error('Error in GET /preferences:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * UPDATE user preferences (partial updates)
 * PATCH /api/preferences
 */
router.patch('/preferences', async (req, res) => {
    try {
        const userId = getUserId(req);
        const updates = req.body;

        if (!isConfigured()) {
            console.log('⚠️ Supabase not configured, simulating update');
            return res.json({
                success: true,
                preferences: { ...DEFAULT_PREFERENCES, ...updates, user_id: userId },
                message: 'Preferences updated (dev mode)'
            });
        }

        // Add updated_at timestamp
        updates.updated_at = new Date().toISOString();

        // Upsert preferences
        const { data: preferences, error } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: userId,
                ...updates
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) {
            console.error('Error updating preferences:', error);
            return res.status(500).json({ error: 'Failed to update preferences', details: error.message });
        }

        console.log(`✅ Updated preferences for user ${userId}`);
        res.json({
            success: true,
            preferences,
            message: 'Preferences updated successfully'
        });

    } catch (error) {
        console.error('Error in PATCH /preferences:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * ADD to preference lists (favorite artist, topic, etc.)
 * POST /api/preferences/add
 * Body: { field: 'favorite_artists', value: 'Bad Bunny' }
 */
router.post('/preferences/add', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { field, value } = req.body;

        if (!field || !value) {
            return res.status(400).json({ error: 'field and value are required' });
        }

        if (!isConfigured()) {
            console.log(`⚠️ Supabase not configured, would add ${value} to ${field}`);
            return res.json({
                success: true,
                message: `Added ${value} to ${field} (dev mode)`
            });
        }

        // Get current preferences
        const { data: current } = await supabase
            .from('user_preferences')
            .select(field)
            .eq('user_id', userId)
            .single();

        let currentArray = current?.[field] || [];
        
        // Add value if not already present
        if (!currentArray.includes(value)) {
            currentArray.push(value);

            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: userId,
                    [field]: currentArray,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) {
                console.error('Error adding to preference:', error);
                return res.status(500).json({ error: 'Failed to add preference' });
            }

            console.log(`✅ Added ${value} to ${field} for user ${userId}`);
        } else {
            console.log(`ℹ️ ${value} already in ${field} for user ${userId}`);
        }

        res.json({
            success: true,
            message: `Added ${value} to ${field}`,
            [field]: currentArray
        });

    } catch (error) {
        console.error('Error in POST /preferences/add:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * REMOVE from preference lists
 * POST /api/preferences/remove
 * Body: { field: 'favorite_artists', value: 'Bad Bunny' }
 */
router.post('/preferences/remove', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { field, value } = req.body;

        if (!field || !value) {
            return res.status(400).json({ error: 'field and value are required' });
        }

        if (!isConfigured()) {
            console.log(`⚠️ Supabase not configured, would remove ${value} from ${field}`);
            return res.json({
                success: true,
                message: `Removed ${value} from ${field} (dev mode)`
            });
        }

        // Get current preferences
        const { data: current } = await supabase
            .from('user_preferences')
            .select(field)
            .eq('user_id', userId)
            .single();

        let currentArray = current?.[field] || [];
        
        // Remove value
        currentArray = currentArray.filter(item => item !== value);

        const { error } = await supabase
            .from('user_preferences')
            .update({
                [field]: currentArray,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (error) {
            console.error('Error removing from preference:', error);
            return res.status(500).json({ error: 'Failed to remove preference' });
        }

        console.log(`✅ Removed ${value} from ${field} for user ${userId}`);
        res.json({
            success: true,
            message: `Removed ${value} from ${field}`,
            [field]: currentArray
        });

    } catch (error) {
        console.error('Error in POST /preferences/remove:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * GET user's collections
 * GET /api/collections?type=playlist
 */
router.get('/collections', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { type } = req.query;

        if (!isConfigured()) {
            return res.json({ success: true, collections: [], message: 'Dev mode' });
        }

        let query = supabase
            .from('user_collections')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (type) {
            query = query.eq('type', type);
        }

        const { data: collections, error } = await query;

        if (error) {
            console.error('Error fetching collections:', error);
            return res.status(500).json({ error: 'Failed to fetch collections' });
        }

        console.log(`✅ Retrieved ${collections?.length || 0} collections for user ${userId}`);
        res.json({
            success: true,
            collections: collections || [],
            count: collections?.length || 0
        });

    } catch (error) {
        console.error('Error in GET /collections:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * CREATE collection
 * POST /api/collections
 */
router.post('/collections', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name, description, type, content_type, items = [] } = req.body;

        if (!name || !type) {
            return res.status(400).json({ error: 'name and type are required' });
        }

        if (!isConfigured()) {
            return res.json({
                success: true,
                collection: { id: 'dev_' + Date.now(), name, type, items },
                message: 'Collection created (dev mode)'
            });
        }

        const { data: collection, error } = await supabase
            .from('user_collections')
            .insert({
                user_id: userId,
                name,
                description,
                type,
                content_type,
                items
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating collection:', error);
            return res.status(500).json({ error: 'Failed to create collection' });
        }

        console.log(`✅ Created collection "${name}" for user ${userId}`);
        res.json({
            success: true,
            collection,
            message: 'Collection created successfully'
        });

    } catch (error) {
        console.error('Error in POST /collections:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * ADD item to collection
 * POST /api/collections/:collectionId/items
 */
router.post('/collections/:collectionId/items', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { collectionId } = req.params;
        const { contentId, contentType, metadata = {} } = req.body;

        if (!contentId || !contentType) {
            return res.status(400).json({ error: 'contentId and contentType are required' });
        }

        if (!isConfigured()) {
            return res.json({
                success: true,
                message: `Added ${contentId} to collection (dev mode)`
            });
        }

        // Get current collection
        const { data: collection, error: fetchError } = await supabase
            .from('user_collections')
            .select('items')
            .eq('id', collectionId)
            .eq('user_id', userId)
            .single();

        if (fetchError) {
            console.error('Error fetching collection:', fetchError);
            return res.status(404).json({ error: 'Collection not found' });
        }

        let items = collection.items || [];
        
        // Add new item
        items.push({
            id: contentId,
            type: contentType,
            added_at: new Date().toISOString(),
            ...metadata
        });

        // Update collection
        const { error: updateError } = await supabase
            .from('user_collections')
            .update({
                items,
                updated_at: new Date().toISOString()
            })
            .eq('id', collectionId)
            .eq('user_id', userId);

        if (updateError) {
            console.error('Error updating collection:', updateError);
            return res.status(500).json({ error: 'Failed to add item to collection' });
        }

        console.log(`✅ Added item ${contentId} to collection ${collectionId}`);
        res.json({
            success: true,
            message: 'Item added to collection',
            items
        });

    } catch (error) {
        console.error('Error in POST /collections/:id/items:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * REMOVE item from collection
 * DELETE /api/collections/:collectionId/items/:itemId
 */
router.delete('/collections/:collectionId/items/:itemId', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { collectionId, itemId } = req.params;

        if (!isConfigured()) {
            return res.json({
                success: true,
                message: `Removed ${itemId} from collection (dev mode)`
            });
        }

        // Get current collection
        const { data: collection, error: fetchError } = await supabase
            .from('user_collections')
            .select('items')
            .eq('id', collectionId)
            .eq('user_id', userId)
            .single();

        if (fetchError) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        let items = collection.items || [];
        items = items.filter(item => item.id !== itemId);

        // Update collection
        const { error: updateError } = await supabase
            .from('user_collections')
            .update({
                items,
                updated_at: new Date().toISOString()
            })
            .eq('id', collectionId)
            .eq('user_id', userId);

        if (updateError) {
            console.error('Error updating collection:', updateError);
            return res.status(500).json({ error: 'Failed to remove item from collection' });
        }

        console.log(`✅ Removed item ${itemId} from collection ${collectionId}`);
        res.json({
            success: true,
            message: 'Item removed from collection',
            items
        });

    } catch (error) {
        console.error('Error in DELETE /collections/:id/items/:itemId:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;

