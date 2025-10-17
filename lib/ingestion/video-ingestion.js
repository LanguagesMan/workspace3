/**
 * 📺 VIDEO INGESTION PIPELINE
 * 
 * Ingests Spanish learning videos from YouTube:
 * - Fetches videos from curated Spanish learning channels
 * - Extracts transcripts using youtube-transcript API
 * - Generates CEFR difficulty scores
 * - Stores metadata in database
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const videoDifficultyScorer = require('../videoDifficultyScorer');

const prisma = new PrismaClient();

class VideoIngestionPipeline {
    constructor() {
        this.YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        this.YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
        
        // Curated Spanish learning channels
        this.SPANISH_CHANNELS = [
            { id: 'UCidV7Vl1t2reW8C25L3M_-A', name: 'Español con Juan', targetLevel: 'B1' },
            { id: 'UCNXjk2tMoMhXWPJ8_AqjFBQ', name: 'Spanish Dict', targetLevel: 'A2' },
            { id: 'UCaUwqYvwdUEuKlP27zU4D1w', name: 'Butterfly Spanish', targetLevel: 'A2' },
            { id: 'UC3AEFwCBHNk0DRXQPYmY9nw', name: 'Why Not Spanish', targetLevel: 'B1' },
            { id: 'UCdPzTCv5DHKGw_F_oi3HUvA', name: 'Easy Spanish', targetLevel: 'A1' },
            { id: 'UCf8jsIaPjC08rK7b4FbdLqg', name: 'Dreaming Spanish', targetLevel: 'B1' },
            { id: 'UCmRtXPnznj9eeqj4d7CqkNQ', name: 'SpanishPod101', targetLevel: 'A2' }
        ];
    }

    /**
     * Fetch recent videos from a YouTube channel
     */
    async fetchChannelVideos(channelId, maxResults = 10) {
        try {
            const response = await axios.get(`${this.YOUTUBE_API_BASE}/search`, {
                params: {
                    key: this.YOUTUBE_API_KEY,
                    channelId: channelId,
                    part: 'snippet',
                    order: 'date',
                    type: 'video',
                    maxResults: maxResults,
                    videoDuration: 'short', // Prefer 5-15 min videos for learning
                    relevanceLanguage: 'es'
                }
            });

            return response.data.items.map(item => ({
                youtubeId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
                publishedAt: new Date(item.snippet.publishedAt),
                channelId: channelId,
                channelTitle: item.snippet.channelTitle
            }));

        } catch (error) {
            console.error(`Error fetching videos from channel ${channelId}:`, error.message);
            return [];
        }
    }

    /**
     * Get video details including duration
     */
    async getVideoDetails(videoIds) {
        try {
            const response = await axios.get(`${this.YOUTUBE_API_BASE}/videos`, {
                params: {
                    key: this.YOUTUBE_API_KEY,
                    id: videoIds.join(','),
                    part: 'contentDetails,statistics'
                }
            });

            const details = {};
            response.data.items.forEach(item => {
                details[item.id] = {
                    duration: this.parseDuration(item.contentDetails.duration),
                    viewCount: parseInt(item.statistics.viewCount || 0),
                    likeCount: parseInt(item.statistics.likeCount || 0)
                };
            });

            return details;

        } catch (error) {
            console.error('Error fetching video details:', error.message);
            return {};
        }
    }

    /**
     * Parse ISO 8601 duration to seconds
     */
    parseDuration(isoDuration) {
        const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 0;
        
        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);
        
        return hours * 3600 + minutes * 60 + seconds;
    }

    /**
     * Fetch transcript for a YouTube video
     * Uses youtube-transcript-api proxy
     */
    async fetchTranscript(youtubeId) {
        try {
            // Try using youtube-transcript API
            const response = await axios.get(`https://youtube-transcript-api.alexflipnote.dev/transcript/${youtubeId}`, {
                params: { lang: 'es' },
                timeout: 10000
            });

            if (response.data && Array.isArray(response.data)) {
                return {
                    success: true,
                    lines: response.data.map((segment, index) => ({
                        index: index + 1,
                        startTime: segment.start,
                        duration: segment.duration,
                        spanish: segment.text,
                        english: null // Will be translated later
                    }))
                };
            }

            return { success: false, error: 'No transcript data' };

        } catch (error) {
            // If transcript not available, return null
            console.log(`   ⚠️  No transcript available for ${youtubeId}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate video difficulty using transcription
     */
    calculateDifficulty(video, transcription) {
        if (!transcription || !transcription.lines || transcription.lines.length === 0) {
            return {
                difficultyScore: 50,
                cefrLevel: video.targetLevel || 'B1',
                confidence: 'low'
            };
        }

        // Use the existing difficulty scorer
        return videoDifficultyScorer.calculateVideoDifficulty({
            ...video,
            transcription: transcription
        });
    }

    /**
     * Extract topics from video metadata
     */
    extractTopics(video, transcription) {
        const topics = [];
        const text = (video.title + ' ' + video.description + ' ' + 
                     (transcription?.lines?.map(l => l.spanish).join(' ') || '')).toLowerCase();

        const topicKeywords = {
            'grammar': ['gramática', 'grammar', 'conjugación', 'verbo', 'tiempo verbal'],
            'vocabulary': ['vocabulario', 'palabras', 'vocabulary', 'expresiones'],
            'conversation': ['conversación', 'hablar', 'diálogo', 'conversation'],
            'culture': ['cultura', 'tradición', 'historia', 'costumbre', 'culture'],
            'travel': ['viaje', 'turismo', 'viajar', 'travel', 'ciudad'],
            'food': ['comida', 'cocina', 'receta', 'food', 'restaurante'],
            'daily_life': ['vida diaria', 'rutina', 'daily life', 'cotidiano'],
            'business': ['negocios', 'trabajo', 'business', 'oficina', 'profesional']
        };

        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                topics.push(topic);
            }
        }

        return topics.length > 0 ? topics : ['learning', 'spanish'];
    }

    /**
     * Ingest videos from a single channel
     */
    async ingestChannel(channelConfig, videosPerChannel = 10) {
        console.log(`\n📺 Ingesting from ${channelConfig.name}...`);

        try {
            // Fetch recent videos
            const videos = await this.fetchChannelVideos(channelConfig.id, videosPerChannel);
            
            if (videos.length === 0) {
                console.log('   ⚠️  No videos found');
                return { ingested: 0, skipped: 0 };
            }

            console.log(`   Found ${videos.length} videos`);

            // Get video details (duration, stats)
            const videoIds = videos.map(v => v.youtubeId);
            const details = await this.getVideoDetails(videoIds);

            let ingested = 0;
            let skipped = 0;

            // Process each video
            for (const video of videos) {
                try {
                    // Check if already exists
                    const existing = await prisma.youTubeVideo.findUnique({
                        where: { youtubeId: video.youtubeId }
                    });

                    if (existing) {
                        console.log(`   ⏭️  Skipping ${video.youtubeId} (already exists)`);
                        skipped++;
                        continue;
                    }

                    const videoDetail = details[video.youtubeId] || {};

                    // Fetch transcript
                    const transcription = await this.fetchTranscript(video.youtubeId);

                    // Calculate difficulty
                    const difficulty = this.calculateDifficulty({
                        ...video,
                        targetLevel: channelConfig.targetLevel,
                        duration: videoDetail.duration
                    }, transcription.success ? transcription : null);

                    // Extract topics
                    const topics = this.extractTopics(video, transcription.success ? transcription : null);

                    // Store in database
                    await prisma.youTubeVideo.create({
                        data: {
                            youtubeId: video.youtubeId,
                            title: video.title,
                            thumbnailUrl: video.thumbnailUrl,
                            duration: videoDetail.duration || null,
                            transcriptUrl: transcription.success ? `transcript://${video.youtubeId}` : null,
                            level: difficulty.cefrLevel,
                            topics: JSON.stringify(topics)
                        }
                    });

                    // Store transcript separately if available (could use a separate table)
                    if (transcription.success && transcription.lines.length > 0) {
                        // Store in content_features table in Supabase for enrichment
                        // For now, we'll just log success
                        console.log(`   ✅ ${video.youtubeId} - ${difficulty.cefrLevel} (${transcription.lines.length} lines)`);
                    } else {
                        console.log(`   ✅ ${video.youtubeId} - ${difficulty.cefrLevel} (no transcript)`);
                    }

                    ingested++;

                    // Rate limiting: wait 1 second between requests
                    await this.sleep(1000);

                } catch (error) {
                    console.error(`   ❌ Error processing ${video.youtubeId}:`, error.message);
                    skipped++;
                }
            }

            console.log(`   📊 Channel complete: ${ingested} ingested, ${skipped} skipped`);
            return { ingested, skipped };

        } catch (error) {
            console.error(`Error ingesting channel ${channelConfig.name}:`, error.message);
            return { ingested: 0, skipped: 0 };
        }
    }

    /**
     * Ingest videos from all configured channels
     */
    async ingestAll(videosPerChannel = 10) {
        console.log('🎬 VIDEO INGESTION PIPELINE - STARTING\n');
        console.log(`Target: ${this.SPANISH_CHANNELS.length} channels, ${videosPerChannel} videos each\n`);

        if (!this.YOUTUBE_API_KEY) {
            console.error('❌ YOUTUBE_API_KEY not configured');
            console.log('\n💡 To enable YouTube ingestion:');
            console.log('   1. Get API key from: https://console.cloud.google.com/apis/credentials');
            console.log('   2. Enable YouTube Data API v3');
            console.log('   3. Add YOUTUBE_API_KEY to .env file\n');
            return { success: false, error: 'API key not configured' };
        }

        let totalIngested = 0;
        let totalSkipped = 0;

        for (const channel of this.SPANISH_CHANNELS) {
            const result = await this.ingestChannel(channel, videosPerChannel);
            totalIngested += result.ingested;
            totalSkipped += result.skipped;

            // Wait 2 seconds between channels to respect rate limits
            await this.sleep(2000);
        }

        console.log('\n✅ VIDEO INGESTION COMPLETE');
        console.log(`   📊 Total: ${totalIngested} ingested, ${totalSkipped} skipped`);
        console.log(`   🎯 Success rate: ${((totalIngested / (totalIngested + totalSkipped)) * 100).toFixed(1)}%`);

        return {
            success: true,
            totalIngested,
            totalSkipped,
            channels: this.SPANISH_CHANNELS.length
        };
    }

    /**
     * Get ingestion statistics
     */
    async getStats() {
        try {
            const totalVideos = await prisma.youTubeVideo.count();
            const withTranscripts = await prisma.youTubeVideo.count({
                where: { transcriptUrl: { not: null } }
            });

            const byLevel = await prisma.youTubeVideo.groupBy({
                by: ['level'],
                _count: true
            });

            return {
                success: true,
                stats: {
                    total: totalVideos,
                    withTranscripts: withTranscripts,
                    withoutTranscripts: totalVideos - withTranscripts,
                    byLevel: byLevel.reduce((acc, item) => {
                        acc[item.level] = item._count;
                        return acc;
                    }, {})
                }
            };

        } catch (error) {
            console.error('Error getting stats:', error);
            return { success: false };
        }
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton
const videoIngestionPipeline = new VideoIngestionPipeline();
module.exports = videoIngestionPipeline;

// CLI usage
if (require.main === module) {
    const videosPerChannel = parseInt(process.argv[2]) || 10;
    
    videoIngestionPipeline.ingestAll(videosPerChannel)
        .then(result => {
            console.log('\n📈 Final Results:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Fatal error:', error);
            process.exit(1);
        });
}


