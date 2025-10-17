/**
 * 🎙️ PODCAST INGESTION PIPELINE
 * 
 * Ingests Spanish learning podcasts:
 * - Fetches podcasts from RSS feeds
 * - Downloads audio files
 * - Transcribes using Whisper API
 * - Splits into 30-60s clips
 * - Analyzes difficulty and extracts vocabulary
 */

const Parser = require('rss-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const parser = new Parser({
    customFields: {
        item: ['itunes:duration', 'enclosure', 'media:content']
    }
});

class PodcastIngestionPipeline {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.downloadDir = path.join(__dirname, '../../cache/podcasts');
        
        // Ensure download directory exists
        if (!fs.existsSync(this.downloadDir)) {
            fs.mkdirSync(this.downloadDir, { recursive: true });
        }

        // Spanish learning podcast feeds
        this.PODCAST_FEEDS = [
            {
                name: 'Notes in Spanish',
                url: 'https://www.notesinspanish.com/feed/podcast/',
                level: 'B1',
                category: 'learning'
            },
            {
                name: 'Coffee Break Spanish',
                url: 'https://feeds.megaphone.fm/coffeebreakspanish',
                level: 'A2',
                category: 'learning'
            },
            {
                name: 'News in Slow Spanish',
                url: 'https://feeds.feedburner.com/NewsinslowspanishLatino',
                level: 'B2',
                category: 'news'
            },
            {
                name: 'Duolingo Spanish Podcast',
                url: 'https://feeds.megaphone.fm/duolingospanishpodcast',
                level: 'B1',
                category: 'stories'
            },
            {
                name: 'SpanishPod101',
                url: 'https://www.spanishpod101.com/learningcenter/feed/rss',
                level: 'A2',
                category: 'learning'
            },
            {
                name: 'Español con Juan',
                url: 'https://www.espanolconjuan.com/feed/podcast/',
                level: 'B1',
                category: 'learning'
            }
        ];

        this.CLIP_DURATION_MIN = 30; // 30 seconds
        this.CLIP_DURATION_MAX = 90; // 90 seconds
        this.CLIP_TARGET = 60; // 60 seconds ideal
    }

    /**
     * Fetch podcast episodes from RSS feed
     */
    async fetchPodcastFeed(feedConfig) {
        try {
            console.log(`   📡 Fetching ${feedConfig.name}...`);
            
            const feed = await parser.parseURL(feedConfig.url);
            
            const episodes = feed.items.map(item => {
                const audioUrl = item.enclosure?.url || item['media:content']?.url || null;
                const duration = this.parseDuration(item['itunes:duration']);
                
                return {
                    title: item.title,
                    description: item.contentSnippet || item.description || '',
                    audioUrl: audioUrl,
                    publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                    duration: duration,
                    guid: item.guid || item.link,
                    thumbnail: item.itunes?.image || feed.itunes?.image || null,
                    source: feedConfig.name,
                    suggestedLevel: feedConfig.level,
                    category: feedConfig.category
                };
            }).filter(ep => ep.audioUrl && ep.audioUrl.length > 0);

            console.log(`   ✅ Found ${episodes.length} episodes`);
            return episodes;

        } catch (error) {
            console.error(`   ❌ Error fetching ${feedConfig.name}:`, error.message);
            return [];
        }
    }

    /**
     * Parse duration string (HH:MM:SS or MM:SS or seconds)
     */
    parseDuration(durationStr) {
        if (!durationStr) return null;
        
        // If it's already a number, return it
        if (typeof durationStr === 'number') return durationStr;
        
        const str = durationStr.toString().trim();
        
        // If it's just a number as string
        if (/^\d+$/.test(str)) return parseInt(str);
        
        // Parse HH:MM:SS or MM:SS
        const parts = str.split(':').map(p => parseInt(p));
        
        if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        }
        
        return null;
    }

    /**
     * Download audio file
     */
    async downloadAudio(audioUrl, episodeId) {
        try {
            const filename = `${episodeId}.mp3`;
            const filepath = path.join(this.downloadDir, filename);

            // Skip if already downloaded
            if (fs.existsSync(filepath)) {
                console.log(`   ⏭️  Audio already downloaded`);
                return filepath;
            }

            console.log(`   ⬇️  Downloading audio...`);

            const response = await axios({
                method: 'GET',
                url: audioUrl,
                responseType: 'stream',
                timeout: 60000,
                maxContentLength: 200 * 1024 * 1024 // 200 MB limit
            });

            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const stats = fs.statSync(filepath);
            console.log(`   ✅ Downloaded ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

            return filepath;

        } catch (error) {
            console.error(`   ❌ Download failed:`, error.message);
            return null;
        }
    }

    /**
     * Transcribe audio using OpenAI Whisper
     */
    async transcribeAudio(audioPath) {
        try {
            console.log(`   🎤 Transcribing with Whisper...`);

            const audioFile = fs.createReadStream(audioPath);

            const transcription = await this.openai.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-1',
                language: 'es',
                response_format: 'verbose_json',
                timestamp_granularities: ['segment']
            });

            console.log(`   ✅ Transcribed: ${transcription.segments?.length || 0} segments`);

            return {
                success: true,
                text: transcription.text,
                segments: transcription.segments || []
            };

        } catch (error) {
            console.error(`   ❌ Transcription failed:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Split transcription into clips (30-90 seconds)
     */
    splitIntoClips(segments, targetDuration = 60) {
        const clips = [];
        let currentClip = {
            segments: [],
            startTime: 0,
            endTime: 0,
            text: ''
        };

        for (const segment of segments) {
            const clipDuration = segment.end - currentClip.startTime;

            // If adding this segment would exceed max duration, save current clip
            if (currentClip.segments.length > 0 && clipDuration > this.CLIP_DURATION_MAX) {
                clips.push({ ...currentClip });
                
                // Start new clip
                currentClip = {
                    segments: [segment],
                    startTime: segment.start,
                    endTime: segment.end,
                    text: segment.text
                };
            } else {
                // Add segment to current clip
                if (currentClip.segments.length === 0) {
                    currentClip.startTime = segment.start;
                }
                currentClip.segments.push(segment);
                currentClip.endTime = segment.end;
                currentClip.text += ' ' + segment.text;
            }

            // If clip is at ideal duration and has at least 2 segments, save it
            if (clipDuration >= this.CLIP_TARGET && currentClip.segments.length >= 2) {
                clips.push({ ...currentClip });
                currentClip = {
                    segments: [],
                    startTime: 0,
                    endTime: 0,
                    text: ''
                };
            }
        }

        // Add remaining clip if it meets minimum duration
        if (currentClip.segments.length > 0 && 
            (currentClip.endTime - currentClip.startTime) >= this.CLIP_DURATION_MIN) {
            clips.push(currentClip);
        }

        return clips;
    }

    /**
     * Analyze clip difficulty
     */
    analyzeClipDifficulty(text) {
        // Simple analysis based on word count and complexity
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
        const vocabularyDensity = uniqueWords / wordCount;

        // Map to CEFR level
        let level = 'B1';
        if (wordCount < 50 && vocabularyDensity < 0.65) level = 'A2';
        else if (wordCount < 80 && vocabularyDensity < 0.7) level = 'B1';
        else if (vocabularyDensity < 0.75) level = 'B2';
        else level = 'C1';

        return { level, wordCount, vocabularyDensity };
    }

    /**
     * Extract topics from text
     */
    extractTopics(text, podcastCategory) {
        const topics = [podcastCategory];
        const lowerText = text.toLowerCase();

        const topicKeywords = {
            'grammar': ['gramática', 'verbo', 'conjugación', 'tiempo'],
            'vocabulary': ['vocabulario', 'palabras', 'expresión'],
            'culture': ['cultura', 'tradición', 'costumbre', 'historia'],
            'travel': ['viaje', 'viajar', 'ciudad', 'país', 'turismo'],
            'food': ['comida', 'cocina', 'restaurante', 'plato', 'receta'],
            'daily_life': ['vida', 'rutina', 'diario', 'trabajo', 'familia'],
            'news': ['noticia', 'actual', 'evento', 'acontecimiento']
        };

        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword)) && !topics.includes(topic)) {
                topics.push(topic);
            }
        }

        return topics;
    }

    /**
     * Process and store a single podcast episode
     */
    async processEpisode(episode, transcribe = true) {
        try {
            // Generate episode ID
            const episodeId = Buffer.from(episode.guid || episode.audioUrl)
                .toString('base64')
                .substring(0, 32)
                .replace(/[+/=]/g, '');

            // Check if already exists
            const existing = await prisma.podcast.findUnique({
                where: { id: episodeId }
            });

            if (existing) {
                console.log(`   ⏭️  Skipping (already exists): ${episode.title.substring(0, 50)}...`);
                return { success: true, skipped: true };
            }

            console.log(`\n   📻 Processing: ${episode.title.substring(0, 50)}...`);

            // Download audio
            const audioPath = await this.downloadAudio(episode.audioUrl, episodeId);
            
            if (!audioPath) {
                return { success: false, error: 'Download failed' };
            }

            let transcriptionResult = null;
            let clips = [];

            // Transcribe if enabled and API key available
            if (transcribe && this.openai.apiKey) {
                transcriptionResult = await this.transcribeAudio(audioPath);
                
                if (transcriptionResult.success && transcriptionResult.segments.length > 0) {
                    // Split into clips
                    console.log(`   ✂️  Creating clips...`);
                    const rawClips = this.splitIntoClips(transcriptionResult.segments);
                    
                    console.log(`   📊 Created ${rawClips.length} clips`);
                    
                    clips = rawClips;
                }
            }

            // Store podcast episode
            await prisma.podcast.create({
                data: {
                    id: episodeId,
                    title: episode.title,
                    description: episode.description.substring(0, 1000),
                    audioUrl: episode.audioUrl,
                    localAudioPath: audioPath,
                    source: episode.source,
                    level: episode.suggestedLevel,
                    category: episode.category,
                    duration: episode.duration,
                    publishedAt: episode.publishedAt,
                    guid: episode.guid,
                    thumbnail: episode.thumbnail,
                    transcribed: transcriptionResult?.success || false,
                    transcription: transcriptionResult?.text || null
                }
            });

            // Store clips
            if (clips.length > 0) {
                console.log(`   💾 Storing ${clips.length} clips...`);
                
                for (let i = 0; i < clips.length; i++) {
                    const clip = clips[i];
                    const analysis = this.analyzeClipDifficulty(clip.text);
                    const topics = this.extractTopics(clip.text, episode.category);

                    await prisma.podcastClip.create({
                        data: {
                            podcastId: episodeId,
                            clipNumber: i + 1,
                            startTime: clip.startTime,
                            endTime: clip.endTime,
                            duration: clip.endTime - clip.startTime,
                            transcript: clip.text.trim(),
                            level: analysis.level,
                            topics: JSON.stringify(topics)
                        }
                    });
                }
            }

            console.log(`   ✅ Stored episode with ${clips.length} clips`);

            return {
                success: true,
                episodeId,
                clipCount: clips.length,
                transcribed: transcriptionResult?.success || false
            };

        } catch (error) {
            console.error(`   ❌ Error processing episode:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Ingest episodes from a single feed
     */
    async ingestFeed(feedConfig, limit = 5) {
        console.log(`\n🎙️ Ingesting from ${feedConfig.name}...`);

        try {
            // Fetch feed
            const episodes = await this.fetchPodcastFeed(feedConfig);
            
            if (episodes.length === 0) {
                return { ingested: 0, skipped: 0, failed: 0 };
            }

            let ingested = 0;
            let skipped = 0;
            let failed = 0;
            let totalClips = 0;

            // Process episodes (limit to specified number)
            for (const episode of episodes.slice(0, limit)) {
                const result = await this.processEpisode(episode, true);
                
                if (result.success && !result.skipped) {
                    ingested++;
                    totalClips += result.clipCount || 0;
                } else if (result.skipped) {
                    skipped++;
                } else {
                    failed++;
                }

                // Wait between episodes
                await this.sleep(2000);
            }

            console.log(`\n   📊 Feed complete: ${ingested} episodes, ${totalClips} clips, ${skipped} skipped, ${failed} failed`);
            return { ingested, skipped, failed, clips: totalClips };

        } catch (error) {
            console.error(`Error ingesting feed ${feedConfig.name}:`, error.message);
            return { ingested: 0, skipped: 0, failed: 0, clips: 0 };
        }
    }

    /**
     * Ingest podcasts from all configured feeds
     */
    async ingestAll(episodesPerFeed = 3) {
        console.log('🎙️ PODCAST INGESTION PIPELINE - STARTING\n');
        console.log(`Target: ${this.PODCAST_FEEDS.length} feeds, ${episodesPerFeed} episodes each\n`);

        if (!this.openai.apiKey) {
            console.warn('⚠️  OPENAI_API_KEY not configured - transcription disabled\n');
            return { success: false, error: 'API key not configured' };
        }

        let totalIngested = 0;
        let totalSkipped = 0;
        let totalFailed = 0;
        let totalClips = 0;

        for (const feed of this.PODCAST_FEEDS) {
            const result = await this.ingestFeed(feed, episodesPerFeed);
            totalIngested += result.ingested;
            totalSkipped += result.skipped;
            totalFailed += result.failed;
            totalClips += result.clips || 0;

            // Wait between feeds
            await this.sleep(3000);
        }

        console.log('\n✅ PODCAST INGESTION COMPLETE');
        console.log(`   📊 Episodes: ${totalIngested} ingested, ${totalSkipped} skipped, ${totalFailed} failed`);
        console.log(`   🎬 Clips: ${totalClips} total clips created`);
        
        const total = totalIngested + totalSkipped + totalFailed;
        if (total > 0) {
            console.log(`   🎯 Success rate: ${((totalIngested / total) * 100).toFixed(1)}%`);
        }

        return {
            success: true,
            totalIngested,
            totalSkipped,
            totalFailed,
            totalClips,
            feeds: this.PODCAST_FEEDS.length
        };
    }

    /**
     * Get ingestion statistics
     */
    async getStats() {
        try {
            const totalPodcasts = await prisma.podcast.count();
            const transcribed = await prisma.podcast.count({
                where: { transcribed: true }
            });
            const totalClips = await prisma.podcastClip.count();

            const byLevel = await prisma.podcastClip.groupBy({
                by: ['level'],
                _count: true
            });

            return {
                success: true,
                stats: {
                    totalPodcasts,
                    transcribed,
                    notTranscribed: totalPodcasts - transcribed,
                    totalClips,
                    avgClipsPerPodcast: totalPodcasts > 0 ? (totalClips / totalPodcasts).toFixed(1) : 0,
                    clipsByLevel: byLevel.reduce((acc, item) => {
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
const podcastIngestionPipeline = new PodcastIngestionPipeline();
module.exports = podcastIngestionPipeline;

// CLI usage
if (require.main === module) {
    const episodesPerFeed = parseInt(process.argv[2]) || 3;
    
    podcastIngestionPipeline.ingestAll(episodesPerFeed)
        .then(result => {
            console.log('\n📈 Final Results:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Fatal error:', error);
            process.exit(1);
        });
}


