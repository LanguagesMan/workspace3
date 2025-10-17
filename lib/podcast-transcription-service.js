/**
 * 🎙️ PODCAST TRANSCRIPTION SERVICE
 * 
 * Transcribes podcasts using OpenAI Whisper
 * Segments long episodes into 2-3 minute clips
 * Analyzes difficulty level of each clip
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class PodcastTranscriptionService {
    constructor() {
        this.CLIP_DURATION = 150; // 2.5 minutes in seconds
        this.analyzer = require('./content-difficulty-analyzer');
    }

    /**
     * Transcribe a podcast episode
     * @param {string} podcastId - Podcast ID from database
     * @returns {Object} Transcription result
     */
    async transcribePodcast(podcastId) {
        try {
            console.log(`\n🎙️ Transcribing podcast ${podcastId}...`);

            // Get podcast from database
            const podcast = await prisma.podcast.findUnique({
                where: { id: podcastId }
            });

            if (!podcast) {
                throw new Error('Podcast not found');
            }

            if (podcast.transcribed) {
                console.log('   ⏭️  Already transcribed');
                return { success: true, message: 'Already transcribed' };
            }

            // Download audio if not local
            let audioPath = podcast.localAudioPath;
            if (!audioPath || !fs.existsSync(audioPath)) {
                const aggregator = require('./podcast-feed-aggregator');
                audioPath = await aggregator.downloadAudio(podcast.audioUrl, podcast.id);
                
                // Update local path
                await prisma.podcast.update({
                    where: { id: podcastId },
                    data: { localAudioPath: audioPath }
                });
            }

            console.log('   📝 Transcribing with Whisper...');

            // Transcribe with Whisper
            const transcription = await this.transcribeAudioFile(audioPath);

            console.log(`   ✅ Transcribed: ${transcription.segments.length} segments`);

            // Save full transcription
            await prisma.podcast.update({
                where: { id: podcastId },
                data: {
                    transcription: transcription.text,
                    transcribed: true
                }
            });

            // Segment into clips
            console.log('   ✂️  Segmenting into clips...');
            const clips = await this.segmentIntoClips(podcast, transcription);

            console.log(`   ✅ Created ${clips.length} clips`);

            return {
                success: true,
                transcriptionLength: transcription.text.length,
                clipCount: clips.length
            };

        } catch (error) {
            console.error(`   ❌ Transcription failed:`, error.message);
            throw error;
        }
    }

    /**
     * Transcribe audio file using Whisper
     * @param {string} audioPath - Path to audio file
     * @returns {Object} Transcription with segments
     */
    async transcribeAudioFile(audioPath) {
        try {
            const audioFile = fs.createReadStream(audioPath);

            const transcription = await openai.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-1',
                language: 'es',
                response_format: 'verbose_json',
                timestamp_granularities: ['segment']
            });

            return transcription;

        } catch (error) {
            console.error('Whisper transcription error:', error);
            throw error;
        }
    }

    /**
     * Segment long transcription into 2-3 minute clips
     * @param {Object} podcast - Podcast object
     * @param {Object} transcription - Whisper transcription
     * @returns {Array} Clip objects
     */
    async segmentIntoClips(podcast, transcription) {
        const clips = [];
        let currentClip = {
            segments: [],
            startTime: 0,
            endTime: 0,
            text: ''
        };

        let clipNumber = 1;

        for (const segment of transcription.segments) {
            // Check if adding this segment would exceed clip duration
            const wouldExceed = (segment.end - currentClip.startTime) > this.CLIP_DURATION;

            if (wouldExceed && currentClip.segments.length > 0) {
                // Save current clip
                await this.saveClip(podcast.id, clipNumber, currentClip);
                clips.push(currentClip);
                
                // Start new clip
                clipNumber++;
                currentClip = {
                    segments: [],
                    startTime: segment.start,
                    endTime: segment.end,
                    text: ''
                };
            }

            // Add segment to current clip
            currentClip.segments.push(segment);
            currentClip.endTime = segment.end;
            currentClip.text += segment.text + ' ';
        }

        // Save last clip
        if (currentClip.segments.length > 0) {
            await this.saveClip(podcast.id, clipNumber, currentClip);
            clips.push(currentClip);
        }

        return clips;
    }

    /**
     * Save clip to database
     * @param {string} podcastId - Podcast ID
     * @param {number} clipNumber - Clip number
     * @param {Object} clipData - Clip data
     */
    async saveClip(podcastId, clipNumber, clipData) {
        try {
            // Analyze difficulty
            const analysis = this.analyzer.analyzeTranscription(clipData.text.trim(), false);

            // Extract topics (simple keyword extraction)
            const topics = this.extractTopics(clipData.text);

            await prisma.podcastClip.create({
                data: {
                    podcastId,
                    clipNumber,
                    startTime: clipData.startTime,
                    endTime: clipData.endTime,
                    duration: clipData.endTime - clipData.startTime,
                    transcript: clipData.text.trim(),
                    level: analysis.level,
                    topics: JSON.stringify(topics)
                }
            });

            console.log(`      ✅ Clip ${clipNumber}: ${clipData.startTime}s - ${clipData.endTime}s (${analysis.level})`);

        } catch (error) {
            console.error(`      ❌ Error saving clip ${clipNumber}:`, error.message);
        }
    }

    /**
     * Extract topics from text (simple keyword extraction)
     * @param {string} text - Text to analyze
     * @returns {Array} Topics
     */
    extractTopics(text) {
        const keywords = {
            'news': ['noticia', 'política', 'gobierno', 'presidente', 'país'],
            'culture': ['cultura', 'tradición', 'fiesta', 'celebración', 'arte'],
            'food': ['comida', 'cocina', 'restaurante', 'receta', 'plato'],
            'travel': ['viaje', 'turismo', 'visitar', 'ciudad', 'país'],
            'technology': ['tecnología', 'internet', 'teléfono', 'computadora', 'aplicación'],
            'sports': ['deporte', 'fútbol', 'juego', 'equipo', 'partido'],
            'education': ['educación', 'escuela', 'universidad', 'estudiante', 'aprender']
        };

        const topics = [];
        const lowerText = text.toLowerCase();

        for (const [topic, words] of Object.entries(keywords)) {
            if (words.some(word => lowerText.includes(word))) {
                topics.push(topic);
            }
        }

        return topics.length > 0 ? topics : ['general'];
    }

    /**
     * Transcribe all untranscribed podcasts
     * @param {number} limit - Max podcasts to transcribe
     */
    async transcribeAll(limit = 5) {
        console.log('🎙️ PODCAST TRANSCRIPTION SERVICE\n');

        try {
            // Get untranscribed podcasts
            const podcasts = await prisma.podcast.findMany({
                where: { transcribed: false },
                take: limit,
                orderBy: { createdAt: 'desc' }
            });

            console.log(`Found ${podcasts.length} untranscribed podcasts\n`);

            let success = 0;
            let failed = 0;

            for (const podcast of podcasts) {
                try {
                    await this.transcribePodcast(podcast.id);
                    success++;
                } catch (error) {
                    console.error(`Failed to transcribe ${podcast.title}:`, error.message);
                    failed++;
                }
            }

            console.log(`\n✅ Transcription complete: ${success} success, ${failed} failed`);

        } catch (error) {
            console.error('Error in transcribeAll:', error);
        }
    }

    /**
     * Get podcast clips by level
     * @param {string} level - CEFR level
     * @returns {Array} Clips
     */
    async getClipsByLevel(level) {
        try {
            const clips = await prisma.podcastClip.findMany({
                where: { level },
                include: {
                    podcast: {
                        select: {
                            title: true,
                            source: true,
                            audioUrl: true,
                            localAudioPath: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 50
            });

            return clips;
        } catch (error) {
            console.error('Error getting clips:', error);
            return [];
        }
    }
}

// Export singleton
const transcriptionService = new PodcastTranscriptionService();
module.exports = transcriptionService;

// CLI command
if (require.main === module) {
    (async () => {
        const limit = parseInt(process.argv[2]) || 5;
        await transcriptionService.transcribeAll(limit);
        process.exit(0);
    })();
}

