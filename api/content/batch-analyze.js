/**
 * API: POST /api/content/batch-analyze
 * Batch analyze multiple content items
 * Body: { contentIds: ["id1", "id2", ...] }
 */

const { supabase } = require('../../lib/supabase-client');

module.exports = async (req, res) => {
    const { contentIds } = req.body;

    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
        return res.status(400).json({
            error: 'contentIds array is required'
        });
    }

    // Limit batch size
    if (contentIds.length > 100) {
        return res.status(400).json({
            error: 'Maximum 100 content items per batch'
        });
    }

    try {
        // Get analysis for all requested content
        const { data, error } = await supabase
            .from('content_analysis')
            .select('*')
            .in('content_id', contentIds);

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                error: 'Database query failed',
                message: error.message
            });
        }

        // Format results
        const results = data.map(item => ({
            id: item.content_id,
            type: item.content_type,
            level: item.cefr_level,
            difficulty: item.difficulty_label,
            totalWords: item.total_words,
            uniqueWords: item.unique_word_count,
            averageWordRank: item.average_word_rank,
            frequencyBands: item.frequency_bands
        }));

        // Return results
        res.json({
            success: true,
            count: results.length,
            requested: contentIds.length,
            notFound: contentIds.length - results.length,
            results
        });

    } catch (error) {
        console.error('Error in batch analysis:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

