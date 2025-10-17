/**
 * API: GET /api/content/difficulty/:userId/:contentId
 * Returns difficulty specifically for that user
 */

const { supabase } = require('../../lib/supabase-client');
const analyzer = require('../../lib/content-difficulty-analyzer');

module.exports = async (req, res) => {
    const { userId, contentId } = req.params;

    if (!userId || !contentId) {
        return res.status(400).json({
            error: 'User ID and Content ID are required'
        });
    }

    try {
        // Check if we already have cached difficulty for this user+content
        const { data: cached, error: cacheError } = await supabase
            .from('user_content_difficulty')
            .select('*')
            .eq('user_id', userId)
            .eq('content_id', contentId)
            .single();

        // If cached and recent (less than 7 days old), return it
        if (cached && !cacheError) {
            const cacheAge = Date.now() - new Date(cached.updated_at).getTime();
            const sevenDays = 7 * 24 * 60 * 60 * 1000;

            if (cacheAge < sevenDays) {
                return res.json({
                    success: true,
                    cached: true,
                    difficulty: {
                        unknownWordCount: cached.unknown_word_count,
                        comprehensionRate: cached.comprehension_rate,
                        goldilocksScore: cached.goldilocks_score,
                        difficulty: cached.difficulty_label,
                        newWordsPreview: cached.new_words_preview
                    }
                });
            }
        }

        // Get content analysis
        const { data: content, error: contentError } = await supabase
            .from('content_analysis')
            .select('*')
            .eq('content_id', contentId)
            .single();

        if (contentError || !content) {
            return res.status(404).json({
                error: 'Content not found or not analyzed'
            });
        }

        // Get user's known words
        const { data: userWords, error: wordsError } = await supabase
            .from('user_words')
            .select('lemma')
            .eq('user_id', userId)
            .eq('language', 'es');

        const knownWords = (userWords || []).map(w => w.lemma);

        // Calculate user-specific difficulty
        const userDifficulty = analyzer.calculateDifficultyForUser(
            {
                uniqueWordCount: content.unique_word_count,
                totalWords: content.total_words,
                frequencyBands: content.frequency_bands,
                level: content.cefr_level
            },
            knownWords
        );

        // Cache the result
        const { error: insertError } = await supabase
            .from('user_content_difficulty')
            .upsert({
                user_id: userId,
                content_id: contentId,
                unknown_word_count: userDifficulty.unknownWordCount,
                comprehension_rate: userDifficulty.comprehensionRate,
                goldilocks_score: userDifficulty.goldilocksScore,
                difficulty_label: userDifficulty.difficulty,
                new_words_preview: [] // Would populate with actual unknown words
            }, {
                onConflict: 'user_id,content_id'
            });

        if (insertError) {
            console.error('Error caching difficulty:', insertError);
        }

        // Return result
        res.json({
            success: true,
            cached: false,
            difficulty: {
                unknownWordCount: userDifficulty.unknownWordCount,
                comprehensionRate: userDifficulty.comprehensionRate,
                goldilocksScore: userDifficulty.goldilocksScore,
                difficulty: userDifficulty.difficulty,
                newWordsToLearn: userDifficulty.newWordsToLearn
            },
            contentInfo: {
                level: content.cefr_level,
                totalWords: content.total_words,
                uniqueWords: content.unique_word_count
            }
        });

    } catch (error) {
        console.error('Error calculating user difficulty:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

