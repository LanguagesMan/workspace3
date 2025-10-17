/**
 * 🧠 PREFERENCE LEARNING ENGINE - Behavioral Analysis System
 * 
 * Automatically learns user preferences from their behavior:
 * - Most watched artists → add to favorites
 * - Most read topics → boost topic weights
 * - Consistently skipped content → add to dislikes
 * - High completion rate content → preferred difficulty
 * 
 * Uses implicit signals to personalize without explicit user input
 */

const { supabase, isConfigured } = require('./supabase-client');

class PreferenceLearningEngine {
    constructor() {
        this.ANALYSIS_WINDOW_DAYS = 30; // Analyze last 30 days
        this.MIN_INTERACTIONS_THRESHOLD = 3; // Minimum interactions to learn preference
        this.HIGH_COMPLETION_THRESHOLD = 0.7; // 70% completion = positive signal
        this.SKIP_THRESHOLD_SECONDS = 10; // <10s = skip
        this.SKIP_COUNT_DISLIKE = 3; // 3 skips = dislike
    }

    /**
     * Analyze user behavior and update implicit preferences
     * Main entry point for preference learning
     */
    async analyzeAndUpdatePreferences(userId) {
        if (!isConfigured()) {
            console.log('⚠️ Supabase not configured, skipping preference learning');
            return { success: false, message: 'Supabase not configured' };
        }

        try {
            console.log(`🧠 Starting preference analysis for user ${userId}...`);

            // Get interactions from last 30 days
            const interactions = await this.getRecentInteractions(userId);

            if (interactions.length < this.MIN_INTERACTIONS_THRESHOLD) {
                console.log(`ℹ️ Not enough interactions (${interactions.length}) for user ${userId}`);
                return {
                    success: true,
                    message: 'Not enough data for analysis',
                    interactionCount: interactions.length
                };
            }

            // Analyze different aspects
            const musicPrefs = await this.analyzeMusicPreferences(interactions);
            const articlePrefs = await this.analyzeArticlePreferences(interactions);
            const videoPrefs = await this.analyzeVideoPreferences(interactions);
            const difficultyPrefs = await this.analyzeDifficultyPreferences(interactions);
            const contentMix = await this.analyzeContentMix(interactions);

            // Detect dislikes
            const dislikes = await this.detectDislikes(interactions);

            // Build update object
            const updates = {
                user_id: userId,
                updated_at: new Date().toISOString()
            };

            // Music preferences
            if (musicPrefs.artists.length > 0) {
                updates.favorite_artists = musicPrefs.artists;
            }
            if (musicPrefs.genres.length > 0) {
                updates.favorite_music_genres = musicPrefs.genres;
            }
            if (dislikes.artists.length > 0) {
                updates.disliked_artists = dislikes.artists;
            }

            // Article preferences
            if (articlePrefs.topics.length > 0) {
                updates.favorite_topics = articlePrefs.topics;
            }
            if (dislikes.topics.length > 0) {
                updates.disliked_topics = dislikes.topics;
            }

            // Video preferences
            if (videoPrefs.categories.length > 0) {
                updates.favorite_categories = videoPrefs.categories;
            }

            // Difficulty preferences
            if (difficultyPrefs.min && difficultyPrefs.max) {
                updates.preferred_difficulty_range = {
                    min: difficultyPrefs.min,
                    max: difficultyPrefs.max
                };
            }

            // Content mix preferences
            if (contentMix) {
                updates.preferred_content_types = contentMix;
            }

            // Update preferences in database
            const { error } = await supabase
                .from('user_preferences')
                .upsert(updates, { onConflict: 'user_id' });

            if (error) {
                console.error('Error updating learned preferences:', error);
                return { success: false, error: error.message };
            }

            console.log(`✅ Updated preferences for user ${userId} based on ${interactions.length} interactions`);
            return {
                success: true,
                message: 'Preferences learned successfully',
                updates,
                interactionCount: interactions.length
            };

        } catch (error) {
            console.error('Error in preference learning:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get recent interactions for analysis
     */
    async getRecentInteractions(userId) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.ANALYSIS_WINDOW_DAYS);

        const { data, error } = await supabase
            .from('user_content_interactions')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', cutoffDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching interactions:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Analyze music preferences from interactions
     */
    async analyzeMusicPreferences(interactions) {
        const musicInteractions = interactions.filter(i => i.content_type === 'music');
        
        if (musicInteractions.length === 0) {
            return { artists: [], genres: [] };
        }

        // Calculate artist affinity scores
        const artistScores = {};
        const genreScores = {};

        musicInteractions.forEach(interaction => {
            const { artist, genre, watch_time_seconds = 0, completion_percentage = 0 } = interaction;

            // Artist affinity: completion rate * time spent
            if (artist) {
                if (!artistScores[artist]) {
                    artistScores[artist] = { totalTime: 0, totalCompletion: 0, count: 0 };
                }
                artistScores[artist].totalTime += watch_time_seconds;
                artistScores[artist].totalCompletion += completion_percentage;
                artistScores[artist].count += 1;
            }

            // Genre affinity
            if (genre) {
                if (!genreScores[genre]) {
                    genreScores[genre] = { totalTime: 0, totalCompletion: 0, count: 0 };
                }
                genreScores[genre].totalTime += watch_time_seconds;
                genreScores[genre].totalCompletion += completion_percentage;
                genreScores[genre].count += 1;
            }
        });

        // Calculate final scores and sort
        const artists = Object.entries(artistScores)
            .map(([artist, data]) => ({
                artist,
                score: (data.totalCompletion / data.count) * (data.totalTime / 100)
            }))
            .filter(a => a.score > 0.5) // Only positive signals
            .sort((a, b) => b.score - a.score)
            .slice(0, 10) // Top 10
            .map(a => a.artist);

        const genres = Object.entries(genreScores)
            .map(([genre, data]) => ({
                genre,
                score: (data.totalCompletion / data.count) * (data.totalTime / 100)
            }))
            .filter(g => g.score > 0.5)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5) // Top 5
            .map(g => g.genre);

        return { artists, genres };
    }

    /**
     * Analyze article/news preferences from interactions
     */
    async analyzeArticlePreferences(interactions) {
        const articleInteractions = interactions.filter(i => i.content_type === 'article');
        
        if (articleInteractions.length === 0) {
            return { topics: [] };
        }

        const topicScores = {};

        articleInteractions.forEach(interaction => {
            const { topic, completion_percentage = 0 } = interaction;

            if (topic) {
                if (!topicScores[topic]) {
                    topicScores[topic] = { totalCompletion: 0, count: 0 };
                }
                topicScores[topic].totalCompletion += completion_percentage;
                topicScores[topic].count += 1;
            }
        });

        // Calculate average completion rate per topic
        const topics = Object.entries(topicScores)
            .map(([topic, data]) => ({
                topic,
                score: data.totalCompletion / data.count
            }))
            .filter(t => t.score >= this.HIGH_COMPLETION_THRESHOLD)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(t => t.topic);

        return { topics };
    }

    /**
     * Analyze video preferences from interactions
     */
    async analyzeVideoPreferences(interactions) {
        const videoInteractions = interactions.filter(i => i.content_type === 'video');
        
        if (videoInteractions.length === 0) {
            return { categories: [] };
        }

        const categoryScores = {};

        videoInteractions.forEach(interaction => {
            const { category, completion_percentage = 0 } = interaction;

            if (category) {
                if (!categoryScores[category]) {
                    categoryScores[category] = { totalCompletion: 0, count: 0 };
                }
                categoryScores[category].totalCompletion += completion_percentage;
                categoryScores[category].count += 1;
            }
        });

        const categories = Object.entries(categoryScores)
            .map(([category, data]) => ({
                category,
                score: data.totalCompletion / data.count
            }))
            .filter(c => c.score >= this.HIGH_COMPLETION_THRESHOLD)
            .sort((a, b) => b.score - a.score)
            .slice(0, 8)
            .map(c => c.category);

        return { categories };
    }

    /**
     * Analyze preferred difficulty level from interactions
     */
    async analyzeDifficultyPreferences(interactions) {
        // Filter interactions with high completion rate
        const successfulInteractions = interactions.filter(i => 
            i.difficulty && i.completion_percentage >= this.HIGH_COMPLETION_THRESHOLD
        );

        if (successfulInteractions.length === 0) {
            return { min: 'A2', max: 'B2' }; // Default
        }

        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const levelCounts = {};

        successfulInteractions.forEach(i => {
            const level = i.difficulty.toUpperCase();
            levelCounts[level] = (levelCounts[level] || 0) + 1;
        });

        // Find most common levels
        const sortedLevels = Object.entries(levelCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([level]) => level);

        if (sortedLevels.length === 0) {
            return { min: 'A2', max: 'B2' };
        }

        // Set range around most common level
        const primaryLevel = sortedLevels[0];
        const primaryIndex = levels.indexOf(primaryLevel);

        const min = levels[Math.max(0, primaryIndex - 1)];
        const max = levels[Math.min(levels.length - 1, primaryIndex + 1)];

        return { min, max };
    }

    /**
     * Analyze content mix preferences (how much of each type)
     */
    async analyzeContentMix(interactions) {
        if (interactions.length === 0) {
            return { videos: 40, articles: 40, music: 20 };
        }

        const typeCounts = {
            video: 0,
            article: 0,
            music: 0,
            other: 0
        };

        interactions.forEach(i => {
            const type = i.content_type || 'other';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        const total = interactions.length;
        
        return {
            videos: Math.round((typeCounts.video / total) * 100) || 40,
            articles: Math.round((typeCounts.article / total) * 100) || 40,
            music: Math.round((typeCounts.music / total) * 100) || 20
        };
    }

    /**
     * Detect dislikes from skip behavior
     */
    async detectDislikes(interactions) {
        const skipsByArtist = {};
        const skipsByTopic = {};

        interactions.forEach(interaction => {
            const { watch_time_seconds = 0, artist, topic, content_type } = interaction;

            // Skipped within first 10 seconds
            if (watch_time_seconds < this.SKIP_THRESHOLD_SECONDS) {
                if (content_type === 'music' && artist) {
                    skipsByArtist[artist] = (skipsByArtist[artist] || 0) + 1;
                }
                if (content_type === 'article' && topic) {
                    skipsByTopic[topic] = (skipsByTopic[topic] || 0) + 1;
                }
            }
        });

        // Artists skipped 3+ times = disliked
        const dislikedArtists = Object.entries(skipsByArtist)
            .filter(([, count]) => count >= this.SKIP_COUNT_DISLIKE)
            .map(([artist]) => artist);

        // Topics skipped 3+ times = disliked
        const dislikedTopics = Object.entries(skipsByTopic)
            .filter(([, count]) => count >= this.SKIP_COUNT_DISLIKE)
            .map(([topic]) => topic);

        return {
            artists: dislikedArtists,
            topics: dislikedTopics
        };
    }

    /**
     * Calculate implicit preference scores for recommendations
     */
    calculateImplicitScores(interactions, contentItem) {
        // This can be used for real-time scoring
        const relevantInteractions = interactions.filter(i => {
            if (contentItem.type === 'music') {
                return i.content_type === 'music' && 
                       (i.artist === contentItem.artist || i.genre === contentItem.genre);
            }
            if (contentItem.type === 'article') {
                return i.content_type === 'article' && 
                       i.topic === contentItem.topic;
            }
            return false;
        });

        if (relevantInteractions.length === 0) {
            return 0.5; // Neutral
        }

        const avgCompletion = relevantInteractions.reduce((sum, i) => 
            sum + (i.completion_percentage || 0), 0) / relevantInteractions.length;

        return avgCompletion / 100; // Normalize to 0-1
    }
}

module.exports = new PreferenceLearningEngine();

