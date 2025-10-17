/**
 * 🎯 ENHANCED VOCABULARY API - Phase 1.1 Database Migration
 * 
 * This replaces localStorage vocabulary tracking with proper Supabase integration
 * Features:
 * - Word click tracking with context
 * - Spaced repetition system (SM-2 algorithm)
 * - Cross-device synchronization
 * - Mastery level tracking
 * - Review scheduling
 */

const express = require('express');
const router = express.Router();
const { supabase, isConfigured } = require('./supabase-client');

/**
 * Get or create user ID (handles both authenticated and anonymous users)
 */
async function getUserId(req) {
    // Try to get authenticated user first
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) return user.id;
    } catch (error) {
        // User not authenticated, continue to anonymous flow
    }

    // For anonymous users, use localStorage ID or generate one
    const anonymousId = req.headers['x-anonymous-user-id'] || 'anonymous_' + Date.now();
    return anonymousId;
}

/**
 * Track word click with full context
 * POST /api/vocabulary/click
 */
router.post('/vocabulary/click', async (req, res) => {
    try {
        const { 
            word, 
            translation, 
            context, 
            source, 
            sourceId, 
            level,
            timestamp,
            videoId,
            articleId,
            position
        } = req.body;

        if (!word || !translation) {
            return res.status(400).json({ 
                error: 'Missing required fields: word, translation' 
            });
        }

        const userId = await getUserId(req);

        // Upsert word with full context
        const { data: vocabulary, error } = await supabase
            .from('user_words')
            .upsert({
                user_id: userId,
                lemma: word.toLowerCase().trim(),
                original_word: word,
                translation: translation,
                language: 'es',
                status: 'learning',
                context: context || null,
                source: source || 'unknown',
                source_id: sourceId || null,
                level: level || 'A2',
                video_id: videoId || null,
                article_id: articleId || null,
                position: position || null,
                click_count: 1,
                last_clicked_at: new Date().toISOString(),
                created_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,lemma,language',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving word click:', error);
            return res.status(500).json({ error: 'Database error', details: error.message });
        }

        // Track engagement event
        await supabase
            .from('engagement_events')
            .insert({
                user_id: userId,
                content_id: sourceId || word,
                content_type: source || 'word',
                event_type: 'word_click',
                metadata: {
                    word: word,
                    translation: translation,
                    source: source,
                    level: level,
                    video_id: videoId,
                    article_id: articleId
                }
            });

        console.log(`✅ Word clicked: "${word}" by user ${userId}`);
        return res.json({ 
            success: true, 
            vocabulary,
            message: 'Word click tracked successfully'
        });

    } catch (error) {
        console.error('Error in word click tracking:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

/**
 * Save word for spaced repetition review
 * POST /api/vocabulary/save
 */
router.post('/vocabulary/save', async (req, res) => {
    try {
        const { word, quality = 0 } = req.body;
        
        if (!word) {
            return res.status(400).json({ 
                error: 'Missing required field: word' 
            });
        }

        const userId = await getUserId(req);

        // Update word to saved status and schedule first review
        const { data: vocabulary, error } = await supabase
            .from('user_words')
            .update({
                status: 'learning',
                saved: true,
                ease_factor: 2.5,
                interval_days: 1,
                next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                times_reviewed: 0,
                times_correct: 0,
                times_incorrect: 0,
                saved_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('lemma', word.toLowerCase().trim())
            .eq('language', 'es')
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ 
                    error: 'Word not found. Click the word first before saving.' 
                });
            }
            console.error('Error saving word:', error);
            return res.status(500).json({ error: 'Database error', details: error.message });
        }

        // Track save event
        await supabase
            .from('engagement_events')
            .insert({
                user_id: userId,
                content_id: word,
                content_type: 'word',
                event_type: 'word_save',
                metadata: { word: word, saved: true }
            });

        console.log(`✅ Word saved: "${word}" by user ${userId}`);
        return res.json({ 
            success: true, 
            vocabulary,
            message: 'Word saved for review',
            nextReviewIn: '1 day'
        });

    } catch (error) {
        console.error('Error saving word:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

/**
 * Get user's vocabulary
 * GET /api/vocabulary/get?userId=xxx&saved=true&limit=100
 */
router.get('/vocabulary/get', async (req, res) => {
    try {
        const { saved, limit = '100', status } = req.query;
        const userId = await getUserId(req);

        let query = supabase
            .from('user_words')
            .select('*')
            .eq('user_id', userId)
            .eq('language', 'es')
            .order('last_clicked_at', { ascending: false })
            .limit(parseInt(limit));

        if (saved === 'true') {
            query = query.eq('saved', true);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data: words, error } = await query;

        if (error) {
            console.error('Error getting vocabulary:', error);
            return res.status(500).json({ error: 'Database error', details: error.message });
        }

        console.log(`✅ Retrieved ${words?.length || 0} words for user ${userId}`);
        return res.json({ 
            success: true, 
            words: words || [], 
            total: words?.length || 0,
            userId: userId
        });

    } catch (error) {
        console.error('Error getting vocabulary:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

/**
 * Get words due for review (spaced repetition)
 * GET /api/vocabulary/review?limit=20
 */
router.get('/vocabulary/review', async (req, res) => {
    try {
        const { limit = '20' } = req.query;
        const userId = await getUserId(req);

        const now = new Date().toISOString();

        const { data: words, error } = await supabase
            .from('user_words')
            .select('*')
            .eq('user_id', userId)
            .eq('language', 'es')
            .eq('saved', true)
            .lte('next_review_at', now)
            .order('next_review_at', { ascending: true })
            .limit(parseInt(limit));

        if (error) {
            console.error('Error getting review words:', error);
            return res.status(500).json({ error: 'Database error', details: error.message });
        }

        console.log(`✅ Found ${words?.length || 0} words due for review for user ${userId}`);
        return res.json({ 
            success: true, 
            words: words || [], 
            count: words?.length || 0,
            userId: userId
        });

    } catch (error) {
        console.error('Error getting review words:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

/**
 * Update word after review (SM-2 spaced repetition algorithm)
 * POST /api/vocabulary/update-review
 */
router.post('/vocabulary/update-review', async (req, res) => {
    try {
        const { word, quality } = req.body;
        
        if (!word || quality === undefined) {
            return res.status(400).json({ 
                error: 'Missing required fields: word, quality (0-5)' 
            });
        }

        const qualityNum = parseInt(quality);
        if (qualityNum < 0 || qualityNum > 5) {
            return res.status(400).json({ 
                error: 'Quality must be between 0 and 5' 
            });
        }

        const userId = await getUserId(req);

        // Get current word data
        const { data: currentWord, error: fetchError } = await supabase
            .from('user_words')
            .select('*')
            .eq('user_id', userId)
            .eq('lemma', word.toLowerCase().trim())
            .eq('language', 'es')
            .single();

        if (fetchError || !currentWord) {
            return res.status(404).json({ error: 'Word not found' });
        }

        // SM-2 Algorithm implementation
        let newEaseFactor = currentWord.ease_factor || 2.5;
        let newInterval = currentWord.interval_days || 1;
        let newRepetitions = currentWord.times_reviewed || 0;
        let newStatus = currentWord.status;

        if (qualityNum >= 3) {
            // Correct response
            newRepetitions += 1;
            newTimesCorrect = (currentWord.times_correct || 0) + 1;

            if (newRepetitions === 1) {
                newInterval = 1;
            } else if (newRepetitions === 2) {
                newInterval = 6;
            } else {
                newInterval = Math.round(newInterval * newEaseFactor);
            }

            newEaseFactor = newEaseFactor + (0.1 - (5 - qualityNum) * (0.08 + (5 - qualityNum) * 0.02));
            newEaseFactor = Math.max(1.3, newEaseFactor);

            if (newRepetitions >= 5 && newEaseFactor >= 2.5) {
                newStatus = 'mastered';
            } else if (newRepetitions >= 2) {
                newStatus = 'reviewing';
            }
        } else {
            // Incorrect response - restart
            newRepetitions = 0;
            newInterval = 1;
            newStatus = 'learning';
        }

        // Calculate next review date
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

        // Update word with new spaced repetition data
        const { data: vocabulary, error: updateError } = await supabase
            .from('user_words')
            .update({
                status: newStatus,
                ease_factor: newEaseFactor,
                interval_days: newInterval,
                next_review_at: nextReviewDate.toISOString(),
                times_reviewed: newRepetitions,
                times_correct: qualityNum >= 3 ? (currentWord.times_correct || 0) + 1 : (currentWord.times_correct || 0),
                times_incorrect: qualityNum < 3 ? (currentWord.times_incorrect || 0) + 1 : (currentWord.times_incorrect || 0),
                last_reviewed_at: new Date().toISOString(),
                mastered: newStatus === 'mastered'
            })
            .eq('user_id', userId)
            .eq('lemma', word.toLowerCase().trim())
            .eq('language', 'es')
            .select()
            .single();

        if (updateError) {
            console.error('Error updating review:', updateError);
            return res.status(500).json({ error: 'Database error', details: updateError.message });
        }

        // Track review event
        await supabase
            .from('engagement_events')
            .insert({
                user_id: userId,
                content_id: word,
                content_type: 'word',
                event_type: 'word_review',
                metadata: {
                    word: word,
                    quality: qualityNum,
                    mastery_level: newRepetitions,
                    next_review_in_days: newInterval,
                    status: newStatus
                }
            });

        console.log(`✅ Word reviewed: "${word}" (quality: ${qualityNum}, next: ${newInterval}d, status: ${newStatus})`);
        return res.json({ 
            success: true, 
            vocabulary,
            nextReviewIn: newInterval,
            masteryLevel: newRepetitions,
            status: newStatus,
            message: `Word ${newStatus === 'mastered' ? 'mastered!' : 'reviewed successfully'}`
        });

    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

/**
 * Get user vocabulary statistics
 * GET /api/vocabulary/stats
 */
router.get('/vocabulary/stats', async (req, res) => {
    try {
        const userId = await getUserId(req);

        // Get comprehensive stats
        const [totalWords, savedWords, dueForReview, masteredWords, learningWords] = await Promise.all([
            // Total words clicked
            supabase
                .from('user_words')
                .select('id', { count: 'exact' })
                .eq('user_id', userId)
                .eq('language', 'es'),
            
            // Saved words
            supabase
                .from('user_words')
                .select('id', { count: 'exact' })
                .eq('user_id', userId)
                .eq('language', 'es')
                .eq('saved', true),
            
            // Due for review
            supabase
                .from('user_words')
                .select('id', { count: 'exact' })
                .eq('user_id', userId)
                .eq('language', 'es')
                .eq('saved', true)
                .lte('next_review_at', new Date().toISOString()),
            
            // Mastered words
            supabase
                .from('user_words')
                .select('id', { count: 'exact' })
                .eq('user_id', userId)
                .eq('language', 'es')
                .eq('status', 'mastered'),
            
            // Learning words
            supabase
                .from('user_words')
                .select('id', { count: 'exact' })
                .eq('user_id', userId)
                .eq('language', 'es')
                .eq('status', 'learning')
        ]);

        const stats = {
            totalWords: totalWords.count || 0,
            savedWords: savedWords.count || 0,
            dueForReview: dueForReview.count || 0,
            masteredWords: masteredWords.count || 0,
            learningWords: learningWords.count || 0,
            masteryPercentage: savedWords.count > 0 ? Math.round((masteredWords.count / savedWords.count) * 100) : 0
        };

        console.log(`✅ Retrieved vocabulary stats for user ${userId}:`, stats);
        return res.json({ 
            success: true, 
            stats,
            userId: userId
        });

    } catch (error) {
        console.error('Error getting vocabulary stats:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

/**
 * Sync localStorage vocabulary to database (migration helper)
 * POST /api/vocabulary/sync-from-localstorage
 */
router.post('/vocabulary/sync-from-localstorage', async (req, res) => {
    try {
        const { words } = req.body; // Array of words from localStorage
        
        if (!words || !Array.isArray(words)) {
            return res.status(400).json({ 
                error: 'Missing or invalid words array' 
            });
        }

        const userId = await getUserId(req);
        const syncedWords = [];

        for (const wordData of words) {
            try {
                const { data: vocabulary, error } = await supabase
                    .from('user_words')
                    .upsert({
                        user_id: userId,
                        lemma: wordData.word?.toLowerCase().trim(),
                        original_word: wordData.word,
                        translation: wordData.translation,
                        language: 'es',
                        status: wordData.saved ? 'learning' : 'clicked',
                        saved: wordData.saved || false,
                        context: wordData.context || null,
                        source: wordData.source || 'localStorage',
                        level: wordData.level || 'A2',
                        click_count: wordData.clickCount || 1,
                        created_at: wordData.timestamp ? new Date(wordData.timestamp) : new Date(),
                        last_clicked_at: wordData.timestamp ? new Date(wordData.timestamp) : new Date()
                    }, {
                        onConflict: 'user_id,lemma,language',
                        ignoreDuplicates: false
                    })
                    .select()
                    .single();

                if (!error) {
                    syncedWords.push(vocabulary);
                }
            } catch (wordError) {
                console.error(`Error syncing word ${wordData.word}:`, wordError);
            }
        }

        console.log(`✅ Synced ${syncedWords.length}/${words.length} words from localStorage for user ${userId}`);
        return res.json({ 
            success: true, 
            syncedWords,
            syncedCount: syncedWords.length,
            totalCount: words.length,
            message: `Synced ${syncedWords.length} words to database`
        });

    } catch (error) {
        console.error('Error syncing from localStorage:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

module.exports = router;
