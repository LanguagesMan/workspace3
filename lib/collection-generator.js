/**
 * 🎵 COLLECTION GENERATOR - Auto Playlists & Reading Lists
 * 
 * Automatically generates personalized collections:
 * - "Your Daily Mix" - personalized music playlists
 * - "Recommended Reading" - curated article lists
 * - "Discover New Artists" - exploration playlists
 * - "Learn with Videos" - educational video lists
 */

const { supabase, isConfigured } = require('./supabase-client');
const fs = require('fs');
const path = require('path');

class CollectionGenerator {
    constructor() {
        this.musicPath = path.join(__dirname, '../public/content/songs.json');
        this.videoCatalogPath = path.join(__dirname, '../data/video-catalog.json');
    }

    /**
     * Generate "Your Daily Mix" - personalized music playlist
     */
    async generateDailyMix(userId) {
        if (!isConfigured()) {
            console.log('⚠️ Supabase not configured, skipping Daily Mix generation');
            return null;
        }

        try {
            console.log(`🎵 Generating Daily Mix for user ${userId}...`);

            // Get user preferences
            const { data: prefs } = await supabase
                .from('user_preferences')
                .select('favorite_artists, favorite_music_genres')
                .eq('user_id', userId)
                .single();

            if (!prefs || (!prefs.favorite_artists?.length && !prefs.favorite_music_genres?.length)) {
                console.log('No music preferences found, using default mix');
                return await this.generateDefaultMusicPlaylist(userId);
            }

            // Get available songs
            const allSongs = this.getAvailableSongs();
            
            // Score songs based on preferences
            const scoredSongs = allSongs.map(song => {
                let score = 0;
                
                // Artist match (highest weight)
                if (prefs.favorite_artists?.includes(song.artist)) {
                    score += 1.0;
                }
                
                // Genre match
                if (prefs.favorite_music_genres?.includes(song.genre)) {
                    score += 0.5;
                }
                
                // Random exploration factor
                score += Math.random() * 0.2;
                
                return { ...song, score };
            });

            // Select top songs
            const playlistSongs = scoredSongs
                .sort((a, b) => b.score - a.score)
                .slice(0, 20);

            // Create or update collection
            const collection = await this.saveCollection(userId, {
                name: 'Your Daily Mix',
                description: 'Personalized music playlist based on your favorites',
                type: 'playlist',
                content_type: 'music',
                items: playlistSongs.map(song => ({
                    id: song.id || song.title,
                    type: 'music',
                    title: song.title,
                    artist: song.artist,
                    added_at: new Date().toISOString()
                })),
                is_auto_generated: true
            });

            console.log(`✅ Generated Daily Mix with ${playlistSongs.length} songs for user ${userId}`);
            return collection;

        } catch (error) {
            console.error('Error generating Daily Mix:', error);
            return null;
        }
    }

    /**
     * Generate "Recommended Reading" - personalized article list
     */
    async generateReadingList(userId) {
        if (!isConfigured()) {
            console.log('⚠️ Supabase not configured, skipping Reading List generation');
            return null;
        }

        try {
            console.log(`📰 Generating Reading List for user ${userId}...`);

            // Get user preferences
            const { data: prefs } = await supabase
                .from('user_preferences')
                .select('favorite_topics, preferred_difficulty_range')
                .eq('user_id', userId)
                .single();

            if (!prefs || !prefs.favorite_topics?.length) {
                console.log('No article preferences found, using default list');
                return await this.generateDefaultReadingList(userId);
            }

            // Get recent Spanish news articles (would integrate with spanishNewsFeed)
            const articles = await this.getRecommendedArticles(
                prefs.favorite_topics,
                prefs.preferred_difficulty_range
            );

            // Create collection
            const collection = await this.saveCollection(userId, {
                name: 'Recommended Reading',
                description: `Articles about ${prefs.favorite_topics.slice(0, 3).join(', ')}`,
                type: 'reading_list',
                content_type: 'articles',
                items: articles.map(article => ({
                    id: article.id,
                    type: 'article',
                    title: article.title,
                    topic: article.topic,
                    added_at: new Date().toISOString()
                })),
                is_auto_generated: true
            });

            console.log(`✅ Generated Reading List with ${articles.length} articles for user ${userId}`);
            return collection;

        } catch (error) {
            console.error('Error generating Reading List:', error);
            return null;
        }
    }

    /**
     * Generate "Discover New Artists" - exploration playlist
     */
    async generateDiscoveryPlaylist(userId) {
        if (!isConfigured()) {
            console.log('⚠️ Supabase not configured, skipping Discovery Playlist generation');
            return null;
        }

        try {
            console.log(`🔍 Generating Discovery Playlist for user ${userId}...`);

            // Get user preferences
            const { data: prefs } = await supabase
                .from('user_preferences')
                .select('favorite_artists, favorite_music_genres')
                .eq('user_id', userId)
                .single();

            const allSongs = this.getAvailableSongs();
            
            // Find songs from artists NOT in favorites, but in favorite genres
            const discoverySongs = allSongs.filter(song => {
                const notFavoriteArtist = !prefs?.favorite_artists?.includes(song.artist);
                const matchesGenre = prefs?.favorite_music_genres?.includes(song.genre);
                return notFavoriteArtist && matchesGenre;
            });

            // Add some random exploration
            const randomSongs = allSongs
                .filter(song => !prefs?.favorite_artists?.includes(song.artist))
                .sort(() => Math.random() - 0.5)
                .slice(0, 5);

            const playlist = [...discoverySongs, ...randomSongs].slice(0, 15);

            const collection = await this.saveCollection(userId, {
                name: 'Discover New Artists',
                description: 'Explore new Spanish artists in genres you love',
                type: 'playlist',
                content_type: 'music',
                items: playlist.map(song => ({
                    id: song.id || song.title,
                    type: 'music',
                    title: song.title,
                    artist: song.artist,
                    added_at: new Date().toISOString()
                })),
                is_auto_generated: true
            });

            console.log(`✅ Generated Discovery Playlist with ${playlist.length} songs for user ${userId}`);
            return collection;

        } catch (error) {
            console.error('Error generating Discovery Playlist:', error);
            return null;
        }
    }

    /**
     * Generate "Learn with Videos" - educational video playlist
     */
    async generateVideoPlaylist(userId) {
        if (!isConfigured()) {
            return null;
        }

        try {
            console.log(`🎬 Generating Video Playlist for user ${userId}...`);

            const { data: prefs } = await supabase
                .from('user_preferences')
                .select('favorite_categories, preferred_difficulty_range')
                .eq('user_id', userId)
                .single();

            // Get videos from catalog
            const videos = this.getAvailableVideos();
            
            const scoredVideos = videos.map(video => {
                let score = 0;
                
                if (prefs?.favorite_categories?.includes(video.category)) {
                    score += 1.0;
                }
                
                // Match difficulty level
                if (video.level && prefs?.preferred_difficulty_range) {
                    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                    const videoLevel = levels.indexOf(video.level);
                    const minLevel = levels.indexOf(prefs.preferred_difficulty_range.min);
                    const maxLevel = levels.indexOf(prefs.preferred_difficulty_range.max);
                    
                    if (videoLevel >= minLevel && videoLevel <= maxLevel) {
                        score += 0.5;
                    }
                }
                
                score += Math.random() * 0.2;
                
                return { ...video, score };
            });

            const playlist = scoredVideos
                .sort((a, b) => b.score - a.score)
                .slice(0, 20);

            const collection = await this.saveCollection(userId, {
                name: 'Learn with Videos',
                description: 'Personalized video lessons at your level',
                type: 'playlist',
                content_type: 'videos',
                items: playlist.map(video => ({
                    id: video.id,
                    type: 'video',
                    title: video.title,
                    category: video.category,
                    added_at: new Date().toISOString()
                })),
                is_auto_generated: true
            });

            console.log(`✅ Generated Video Playlist with ${playlist.length} videos for user ${userId}`);
            return collection;

        } catch (error) {
            console.error('Error generating Video Playlist:', error);
            return null;
        }
    }

    /**
     * Save or update a collection in database
     */
    async saveCollection(userId, collectionData) {
        try {
            // Check if auto-generated collection of this type already exists
            const { data: existing } = await supabase
                .from('user_collections')
                .select('id')
                .eq('user_id', userId)
                .eq('name', collectionData.name)
                .eq('is_auto_generated', true)
                .single();

            if (existing) {
                // Update existing collection
                const { data: updated, error } = await supabase
                    .from('user_collections')
                    .update({
                        ...collectionData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) {
                    console.error('Error updating collection:', error);
                    return null;
                }

                return updated;
            } else {
                // Create new collection
                const { data: created, error } = await supabase
                    .from('user_collections')
                    .insert({
                        user_id: userId,
                        ...collectionData
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('Error creating collection:', error);
                    return null;
                }

                return created;
            }

        } catch (error) {
            console.error('Error saving collection:', error);
            return null;
        }
    }

    /**
     * Get available songs from content library
     */
    getAvailableSongs() {
        try {
            if (fs.existsSync(this.musicPath)) {
                const data = fs.readFileSync(this.musicPath, 'utf-8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading songs:', error);
        }

        // Return sample data if file not found
        return [
            { id: '1', title: 'Despacito', artist: 'Luis Fonsi', genre: 'reggaeton', level: 'B1' },
            { id: '2', title: 'Vivir Mi Vida', artist: 'Marc Anthony', genre: 'salsa', level: 'A2' },
            { id: '3', title: 'Bailando', artist: 'Enrique Iglesias', genre: 'pop', level: 'B1' }
        ];
    }

    /**
     * Get available videos from catalog
     */
    getAvailableVideos() {
        try {
            if (fs.existsSync(this.videoCatalogPath)) {
                const data = fs.readFileSync(this.videoCatalogPath, 'utf-8');
                const catalog = JSON.parse(data);
                return catalog.videos || [];
            }
        } catch (error) {
            console.error('Error loading videos:', error);
        }

        return [];
    }

    /**
     * Get recommended articles (stub - would integrate with news API)
     */
    async getRecommendedArticles(topics, difficultyRange) {
        // This would integrate with the Spanish news feed
        // For now, return sample data
        return topics.slice(0, 10).map((topic, i) => ({
            id: `article_${i}`,
            title: `Article about ${topic}`,
            topic: topic,
            difficulty: difficultyRange?.min || 'B1'
        }));
    }

    /**
     * Generate default music playlist (fallback)
     */
    async generateDefaultMusicPlaylist(userId) {
        const songs = this.getAvailableSongs().slice(0, 10);
        
        return await this.saveCollection(userId, {
            name: 'Your Daily Mix',
            description: 'Get started with popular Spanish music',
            type: 'playlist',
            content_type: 'music',
            items: songs.map(song => ({
                id: song.id || song.title,
                type: 'music',
                title: song.title,
                artist: song.artist,
                added_at: new Date().toISOString()
            })),
            is_auto_generated: true
        });
    }

    /**
     * Generate default reading list (fallback)
     */
    async generateDefaultReadingList(userId) {
        const articles = await this.getRecommendedArticles(['culture', 'technology', 'sports'], { min: 'B1' });
        
        return await this.saveCollection(userId, {
            name: 'Recommended Reading',
            description: 'Popular articles to start learning Spanish',
            type: 'reading_list',
            content_type: 'articles',
            items: articles.map(article => ({
                id: article.id,
                type: 'article',
                title: article.title,
                topic: article.topic,
                added_at: new Date().toISOString()
            })),
            is_auto_generated: true
        });
    }

    /**
     * Generate all collections for a user
     */
    async generateAllCollections(userId) {
        console.log(`🎯 Generating all collections for user ${userId}...`);
        
        const results = await Promise.allSettled([
            this.generateDailyMix(userId),
            this.generateReadingList(userId),
            this.generateDiscoveryPlaylist(userId),
            this.generateVideoPlaylist(userId)
        ]);

        const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
        
        console.log(`✅ Generated ${successful}/4 collections for user ${userId}`);
        
        return {
            success: true,
            generated: successful,
            total: 4
        };
    }
}

module.exports = new CollectionGenerator();

