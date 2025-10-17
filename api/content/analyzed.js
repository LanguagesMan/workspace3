/**
 * API: GET /api/content/analyzed/:contentId
 * Returns full analysis of content (video/article/song)
 */

const { supabase } = require('../../lib/supabase-client');

module.exports = async (req, res) => {
    const { contentId } = req.params;

    if (!contentId) {
        return res.status(400).json({
            error: 'Content ID is required'
        });
    }

    try {
        // Get content analysis from database
        const { data, error } = await supabase
            .from('content_analysis')
            .select('*')
            .eq('content_id', contentId)
            .single();

        if (error) {
            console.error('Database error:', error);
            return res.status(404).json({
                error: 'Content not found or not analyzed yet'
            });
        }

        // Return full analysis
        res.json({
            success: true,
            content: {
                id: data.content_id,
                type: data.content_type,
                level: data.cefr_level,
                difficulty: data.difficulty_label,
                
                metrics: {
                    totalWords: data.total_words,
                    uniqueWords: data.unique_word_count,
                    averageWordRank: data.average_word_rank,
                    vocabularyDensity: data.vocabulary_density
                },
                
                frequencyBands: data.frequency_bands,
                
                metadata: {
                    title: data.title,
                    fileName: data.file_name,
                    duration: data.duration_seconds,
                    analyzedAt: data.analyzed_at
                }
            }
        });

    } catch (error) {
        console.error('Error fetching content analysis:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

