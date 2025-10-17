/**
 * 🎯 SMART FEED SORTING BY DIFFICULTY
 * Sorts content feed to show perfect difficulty matches first
 * Uses Goldilocks scoring to find optimal learning content
 */

const { supabase, isConfigured } = require('./supabase-client');
const analyzer = require('./content-difficulty-analyzer');

class SmartDifficultyFeed {
    constructor() {
        this.goldilocksMin = 0.85; // 85% comprehension
        this.goldilocksMax = 0.95; // 95% comprehension
        this.optimalZone = 0.90;   // 90% is perfect
    }

    /**
     * Get personalized feed sorted by difficulty match
     * @param {string} userId - User ID
     * @param {Object} options - Options (contentType, limit, offset)
     * @returns {Array} Sorted content items
     */
    async getPersonalizedFeed(userId, options = {}) {
        const {
            contentType = null,
            limit = 20,
            offset = 0,
            minGoldilocksScore = 70
        } = options;

        if (!isConfigured()) {
            console.warn('Supabase not configured, returning unsorted content');
            return this.getFallbackFeed(contentType, limit, offset);
        }

        try {
            // Get user's known words count
            const { data: userWords } = await supabase
                .from('user_words')
                .select('lemma', { count: 'exact', head: true })
                .eq('user_id', userId);

            const userVocabSize = userWords?.length || 0;

            // Get all content with pre-computed difficulty
            let query = supabase
                .from('content_analysis')
                .select(`
                    *,
                    user_content_difficulty!left(
                        goldilocks_score,
                        comprehension_rate,
                        difficulty_label,
                        unknown_word_count
                    )
                `)
                .order('cefr_level', { ascending: true });

            if (contentType) {
                query = query.eq('content_type', contentType);
            }

            const { data: content, error } = await query;

            if (error) {
                console.error('Error fetching content:', error);
                return this.getFallbackFeed(contentType, limit, offset);
            }

            // Calculate or use cached difficulty for each item
            const scoredContent = await Promise.all(
                content.map(async (item) => {
                    let goldilocksScore;
                    let comprehensionRate;
                    let difficultyLabel;

                    // Use cached if available
                    if (item.user_content_difficulty) {
                        goldilocksScore = item.user_content_difficulty.goldilocks_score;
                        comprehensionRate = item.user_content_difficulty.comprehension_rate;
                        difficultyLabel = item.user_content_difficulty.difficulty_label;
                    } else {
                        // Calculate on-the-fly
                        const difficulty = this.calculateDifficultyScore(item, userVocabSize);
                        goldilocksScore = difficulty.goldilocksScore;
                        comprehensionRate = difficulty.comprehensionRate;
                        difficultyLabel = difficulty.difficultyLabel;
                    }

                    return {
                        ...item,
                        goldilocksScore,
                        comprehensionRate,
                        difficultyLabel,
                        // Boost score for content in optimal range
                        sortScore: this.calculateSortScore(goldilocksScore, item.cefr_level)
                    };
                })
            );

            // Sort by goldilocks score (best matches first)
            const sorted = scoredContent
                .filter(item => item.goldilocksScore >= minGoldilocksScore)
                .sort((a, b) => b.sortScore - a.sortScore)
                .slice(offset, offset + limit);

            return sorted.map(item => this.formatContentItem(item));

        } catch (error) {
            console.error('Error in getPersonalizedFeed:', error);
            return this.getFallbackFeed(contentType, limit, offset);
        }
    }

    /**
     * Calculate difficulty score for content based on user vocab size
     * @param {Object} content - Content analysis data
     * @param {number} userVocabSize - User's vocabulary size
     * @returns {Object} Difficulty metrics
     */
    calculateDifficultyScore(content, userVocabSize) {
        const userKnownWords = this.estimateKnownWords(userVocabSize);
        
        const difficulty = analyzer.calculateDifficultyForUser(
            {
                uniqueWordCount: content.unique_word_count,
                totalWords: content.total_words,
                frequencyBands: content.frequency_bands,
                level: content.cefr_level
            },
            userKnownWords
        );

        return {
            goldilocksScore: difficulty.goldilocksScore,
            comprehensionRate: difficulty.comprehensionRate,
            difficultyLabel: difficulty.difficulty
        };
    }

    /**
     * Estimate which words user knows based on vocab size
     * (Assumes users learn most common words first)
     * @param {number} vocabSize - User's vocabulary size
     * @returns {Array<string>} Estimated known words
     */
    estimateKnownWords(vocabSize) {
        // Return array of length equal to vocab size
        // Actual words don't matter for estimation, just the count
        return Array(vocabSize).fill('');
    }

    /**
     * Calculate sort score (combines goldilocks + level appropriateness)
     * @param {number} goldilocksScore - Goldilocks score (0-100)
     * @param {string} cefrLevel - CEFR level
     * @returns {number} Sort score
     */
    calculateSortScore(goldilocksScore, cefrLevel) {
        // Goldilocks score is primary factor
        let score = goldilocksScore;

        // Slight boost for intermediate levels (B1/B2) as they're most common learner levels
        if (cefrLevel === 'B1' || cefrLevel === 'B2') {
            score += 5;
        }

        return score;
    }

    /**
     * Format content item for API response
     * @param {Object} item - Content item
     * @returns {Object} Formatted item
     */
    formatContentItem(item) {
        return {
            id: item.content_id,
            type: item.content_type,
            title: item.title,
            level: item.cefr_level,
            difficulty: item.difficultyLabel,
            
            metrics: {
                totalWords: item.total_words,
                uniqueWords: item.unique_word_count,
                comprehensionRate: Math.round(item.comprehensionRate),
                goldilocksScore: Math.round(item.goldilocksScore)
            },
            
            // Goldilocks badge info
            isPerfect: item.goldilocksScore >= 90,
            isGood: item.goldilocksScore >= 75,
            
            fileName: item.file_name
        };
    }

    /**
     * Get fallback feed (unsorted, by level)
     * @param {string} contentType - Content type filter
     * @param {number} limit - Items limit
     * @param {number} offset - Offset for pagination
     * @returns {Array} Content items
     */
    async getFallbackFeed(contentType, limit, offset) {
        try {
            let query = supabase
                .from('content_analysis')
                .select('*')
                .order('cefr_level', { ascending: true })
                .range(offset, offset + limit - 1);

            if (contentType) {
                query = query.eq('content_type', contentType);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Fallback feed error:', error);
                return [];
            }

            return data.map(item => this.formatContentItem({
                ...item,
                goldilocksScore: 50, // Neutral
                comprehensionRate: 75, // Estimate
                difficultyLabel: 'Unknown'
            }));

        } catch (error) {
            console.error('Error in fallback feed:', error);
            return [];
        }
    }

    /**
     * Get content by level
     * @param {string} level - CEFR level (A1-C2)
     * @param {string} contentType - Content type
     * @param {number} limit - Limit
     * @returns {Array} Content items
     */
    async getContentByLevel(level, contentType = null, limit = 20) {
        try {
            let query = supabase
                .from('content_analysis')
                .select('*')
                .eq('cefr_level', level)
                .limit(limit);

            if (contentType) {
                query = query.eq('content_type', contentType);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching by level:', error);
                return [];
            }

            return data.map(item => this.formatContentItem({
                ...item,
                goldilocksScore: 75,
                comprehensionRate: 80,
                difficultyLabel: analyzer.getDifficultyLabel(level)
            }));

        } catch (error) {
            console.error('Error in getContentByLevel:', error);
            return [];
        }
    }

    /**
     * Get recommended level for user
     * @param {string} userId - User ID
     * @returns {string} Recommended CEFR level
     */
    async getRecommendedLevel(userId) {
        try {
            // Get user's vocabulary size
            const { count } = await supabase
                .from('user_words')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            const vocabSize = count || 0;

            // Map vocab size to CEFR level
            if (vocabSize < 300) return 'A1';
            if (vocabSize < 600) return 'A2';
            if (vocabSize < 1200) return 'B1';
            if (vocabSize < 2000) return 'B2';
            if (vocabSize < 3500) return 'C1';
            return 'C2';

        } catch (error) {
            console.error('Error getting recommended level:', error);
            return 'A2'; // Default
        }
    }
}

// Export singleton
const smartFeed = new SmartDifficultyFeed();
module.exports = smartFeed;

