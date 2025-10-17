/**
 * 🎙️ BATCH VIDEO TRANSCRIPTION SERVICE
 * 
 * Automated transcription system for processing remaining videos
 * Features:
 * - Scans for videos without .srt files
 * - Uses OpenAI Whisper API for transcription
 * - Generates word-level timestamps
 * - Rate limiting (10 videos at a time)
 * - Progress persistence & resume capability
 * - Separate Spanish (.es.srt) and English (.en.srt) files
 * 
 * @module batch-transcription-service
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

class BatchTranscriptionService {
    constructor(options = {}) {
        this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
        this.videosDir = options.videosDir || path.join(__dirname, '../public/videos');
        this.progressFile = options.progressFile || path.join(__dirname, '../transcription-progress.json');
        this.batchSize = options.batchSize || 10; // Process 10 at a time
        this.model = options.model || 'whisper-1';
        this.language = options.language || 'es'; // Spanish
        
        if (!this.apiKey) {
            throw new Error('OpenAI API key required. Set OPENAI_API_KEY environment variable.');
        }

        // Runtime statistics
        this.stats = {
            total: 0,
            completed: 0,
            failed: 0,
            skipped: 0,
            startTime: null,
            errors: []
        };

        this.progress = {
            processedVideos: [],
            lastProcessedIndex: -1,
            totalVideos: 0,
            completedAt: null
        };
    }

    /**
     * Initialize service - load existing progress
     */
    async initialize() {
        console.log('🚀 Initializing Batch Transcription Service...');
        
        // Load existing progress if available
        try {
            const data = await fs.readFile(this.progressFile, 'utf-8');
            this.progress = JSON.parse(data);
            console.log(`📊 Loaded progress: ${this.progress.processedVideos.length} videos already completed`);
        } catch (error) {
            console.log('📝 Starting fresh - no previous progress found');
        }

        console.log('✅ Service initialized');
    }

    /**
     * Save progress to file
     */
    async saveProgress() {
        try {
            await fs.writeFile(
                this.progressFile, 
                JSON.stringify(this.progress, null, 2),
                'utf-8'
            );
        } catch (error) {
            console.error('⚠️  Failed to save progress:', error.message);
        }
    }

    /**
     * Find all videos without both .es.srt and .en.srt files
     */
    async findVideosWithoutSRT() {
        const videos = [];
        
        const scanDirectory = async (dir) => {
            const items = await fs.readdir(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory()) {
                    await scanDirectory(fullPath);
                } else if (item.name.match(/\.(mp4|mov)$/i)) {
                    const baseName = item.name.replace(/\.(mp4|mov)$/i, '');
                    const videoPath = fullPath;
                    const srtPathEs = path.join(dir, baseName + '.es.srt');
                    const srtPathEn = path.join(dir, baseName + '.en.srt');
                    
                    // Check if already has BOTH .es.srt and .en.srt files
                    try {
                        await fs.access(srtPathEs);
                        await fs.access(srtPathEn);
                        // Both SRT files exist, skip this video
                    } catch {
                        // At least one SRT doesn't exist, add to queue
                        videos.push({
                            videoPath: videoPath,
                            srtPathEs: srtPathEs,
                            srtPathEn: srtPathEn,
                            baseName: baseName,
                            directory: path.basename(dir),
                            relativePath: path.relative(this.videosDir, videoPath)
                        });
                    }
                }
            }
        };
        
        await scanDirectory(this.videosDir);
        return videos;
    }

    /**
     * Filter out already processed videos
     */
    filterUnprocessedVideos(videos) {
        return videos.filter(video => 
            !this.progress.processedVideos.includes(video.relativePath)
        );
    }

    /**
     * Transcribe video with Whisper API (Spanish with natural punctuation)
     */
    async transcribeSpanish(videoPath) {
        const formData = new FormData();
        formData.append('file', fsSync.createReadStream(videoPath));
        formData.append('model', this.model);
        formData.append('language', this.language);
        formData.append('response_format', 'verbose_json');
        formData.append('timestamp_granularities[]', 'segment');
        formData.append('timestamp_granularities[]', 'word'); // Word-level for better punctuation

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/audio/transcriptions',
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                    timeout: 120000 // 2 minute timeout
                }
            );

            return response.data;
        } catch (error) {
            throw new Error(`Transcription failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Translate to English with Whisper API (with natural punctuation)
     */
    async translateToEnglish(videoPath) {
        const formData = new FormData();
        formData.append('file', fsSync.createReadStream(videoPath));
        formData.append('model', this.model);
        formData.append('response_format', 'verbose_json');
        formData.append('timestamp_granularities[]', 'segment');
        formData.append('timestamp_granularities[]', 'word'); // Word-level for better punctuation

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/audio/translations',
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                    timeout: 120000 // 2 minute timeout
                }
            );

            return response.data;
        } catch (error) {
            throw new Error(`Translation failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Convert Whisper response to SRT format
     */
    createSRTFromSegments(segments) {
        const srtLines = [];
        
        segments.forEach((segment, index) => {
            const startTime = this.formatSRTTime(segment.start);
            const endTime = this.formatSRTTime(segment.end);
            
            srtLines.push(index + 1);
            srtLines.push(`${startTime} --> ${endTime}`);
            srtLines.push(segment.text.trim());
            srtLines.push(''); // Empty line separator
        });

        return srtLines.join('\n');
    }

    /**
     * Format seconds to SRT time format (00:00:00,000)
     */
    formatSRTTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 1000);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
    }

    /**
     * Process a single video (creates both Spanish and English SRT files)
     */
    async processVideo(video) {
        const videoName = path.basename(video.videoPath);
        
        try {
            // Check file size (Whisper API has 25MB limit)
            const stats = await fs.stat(video.videoPath);
            const fileSizeMB = stats.size / (1024 * 1024);
            
            if (fileSizeMB > 24) {
                console.log(`   ⚠️  File too large (${fileSizeMB.toFixed(1)}MB), skipping`);
                this.stats.skipped++;
                this.stats.errors.push({
                    video: videoName,
                    error: 'File exceeds 25MB API limit'
                });
                return { success: false, reason: 'too_large' };
            }

            console.log(`   📊 Size: ${fileSizeMB.toFixed(1)}MB`);
            console.log(`   🇪🇸 Transcribing Spanish...`);
            
            // Get Spanish transcription
            const spanishData = await this.transcribeSpanish(video.videoPath);
            
            if (!spanishData.segments || spanishData.segments.length === 0) {
                console.log(`   ⚠️  No transcription segments found`);
                this.stats.failed++;
                return { success: false, reason: 'no_segments' };
            }

            console.log(`   🇬🇧 Translating to English...`);
            
            // Get English translation
            const englishData = await this.translateToEnglish(video.videoPath);
            
            if (!englishData.segments || englishData.segments.length === 0) {
                console.log(`   ⚠️  No translation segments found`);
                this.stats.failed++;
                return { success: false, reason: 'no_translation' };
            }

            console.log(`   💾 Creating SRT files...`);
            
            // Create separate SRT files for Spanish and English
            const srtContentEs = this.createSRTFromSegments(spanishData.segments);
            const srtContentEn = this.createSRTFromSegments(englishData.segments);
            
            // Save both SRT files
            await fs.writeFile(video.srtPathEs, srtContentEs, 'utf-8');
            await fs.writeFile(video.srtPathEn, srtContentEn, 'utf-8');
            
            // Mark as processed
            this.progress.processedVideos.push(video.relativePath);
            await this.saveProgress();
            
            this.stats.completed++;
            
            const progress = ((this.stats.completed / this.stats.total) * 100).toFixed(1);
            const eta = this.calculateETA();
            console.log(`   ✅ Complete! Progress: ${this.stats.completed}/${this.stats.total} (${progress}%) | ETA: ${eta}`);
            
            return { success: true };
        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
            this.stats.failed++;
            this.stats.errors.push({
                video: videoName,
                error: error.message
            });
            return { success: false, reason: 'error', error: error.message };
        }
    }

    /**
     * Calculate estimated time remaining
     */
    calculateETA() {
        if (this.stats.completed === 0) return 'calculating...';
        
        const elapsed = Date.now() - this.stats.startTime;
        const avgTimePerVideo = elapsed / this.stats.completed;
        const remaining = this.stats.total - this.stats.completed;
        const etaMs = avgTimePerVideo * remaining;
        
        const minutes = Math.floor(etaMs / 60000);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else {
            return `${minutes}m`;
        }
    }

    /**
     * Process videos in batches with rate limiting
     */
    async processBatch(videos) {
        this.stats.total = videos.length;
        this.stats.startTime = Date.now();
        
        for (let i = 0; i < videos.length; i += this.batchSize) {
            const batch = videos.slice(i, i + this.batchSize);
            const batchNum = Math.floor(i / this.batchSize) + 1;
            const totalBatches = Math.ceil(videos.length / this.batchSize);
            
            console.log(`\n${'='.repeat(70)}`);
            console.log(`📦 BATCH ${batchNum}/${totalBatches} (${batch.length} videos)`);
            console.log('='.repeat(70));
            
            // Process batch in parallel
            const batchPromises = batch.map((video, idx) => {
                const videoName = path.basename(video.videoPath);
                console.log(`\n🎙️  [${i + idx + 1}/${this.stats.total}] Processing: ${videoName}`);
                return this.processVideo(video);
            });
            
            await Promise.all(batchPromises);
            
            // Save progress after each batch
            await this.saveProgress();
            
            // Rate limiting - pause between batches
            if (i + this.batchSize < videos.length) {
                console.log('\n⏸️  Pausing 3 seconds between batches (rate limiting)...');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    }

    /**
     * Start transcription process
     */
    async start(options = {}) {
        const { limit = null, dryRun = false } = options;
        
        console.log('\n' + '='.repeat(70));
        console.log('🎙️  BATCH VIDEO TRANSCRIPTION SERVICE');
        console.log('='.repeat(70));
        
        await this.initialize();
        
        console.log('\n📂 Scanning for videos without transcriptions...');
        const allVideos = await this.findVideosWithoutSRT();
        
        console.log(`📊 Found ${allVideos.length} videos without .srt files`);
        
        // Filter out already processed
        const videos = this.filterUnprocessedVideos(allVideos);
        
        if (videos.length === 0) {
            console.log('\n✅ All videos already have transcriptions!');
            return this.generateReport();
        }

        console.log(`📊 Videos to process: ${videos.length} (${allVideos.length - videos.length} already processed)`);
        
        // Apply limit if specified
        const videosToProcess = limit ? videos.slice(0, limit) : videos;
        
        if (limit && videos.length > limit) {
            console.log(`🔒 Limiting to first ${limit} videos for this run`);
        }

        if (dryRun) {
            console.log('\n🔍 DRY RUN - No actual processing will occur');
            console.log('\nVideos that would be processed:');
            videosToProcess.slice(0, 10).forEach((v, i) => {
                console.log(`   ${i + 1}. ${v.relativePath}`);
            });
            if (videosToProcess.length > 10) {
                console.log(`   ... and ${videosToProcess.length - 10} more`);
            }
            return;
        }

        // Cost estimation
        const estimatedMinutes = videosToProcess.length * 0.5; // ~30 seconds avg per video
        const estimatedCost = estimatedMinutes * 0.006; // $0.006 per minute
        
        console.log(`\n💰 COST ESTIMATE:`);
        console.log(`   Videos to process: ${videosToProcess.length}`);
        console.log(`   Estimated duration: ${estimatedMinutes.toFixed(0)} minutes`);
        console.log(`   Estimated cost: $${estimatedCost.toFixed(2)}`);
        console.log(`   Batch size: ${this.batchSize} concurrent`);
        
        console.log('\n⏳ Starting in 3 seconds... (Ctrl+C to cancel)');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Process all videos
        await this.processBatch(videosToProcess);
        
        // Mark completion
        if (videos.length === videosToProcess.length) {
            this.progress.completedAt = new Date().toISOString();
            await this.saveProgress();
        }

        return this.generateReport();
    }

    /**
     * Generate final report
     */
    generateReport() {
        const duration = this.stats.startTime 
            ? ((Date.now() - this.stats.startTime) / 1000 / 60).toFixed(1)
            : 0;
        
        const report = {
            completed: this.stats.completed,
            failed: this.stats.failed,
            skipped: this.stats.skipped,
            total: this.stats.total,
            successRate: this.stats.total > 0 
                ? ((this.stats.completed / this.stats.total) * 100).toFixed(1)
                : 0,
            duration: `${duration} minutes`,
            errors: this.stats.errors.slice(0, 20), // First 20 errors
            timestamp: new Date().toISOString()
        };

        console.log('\n' + '='.repeat(70));
        console.log('✅ TRANSCRIPTION COMPLETE!');
        console.log('='.repeat(70));
        console.log(`✅ Successfully processed: ${report.completed}/${report.total} videos`);
        console.log(`❌ Failed: ${report.failed}`);
        console.log(`⏭️  Skipped: ${report.skipped}`);
        console.log(`⏱️  Total time: ${report.duration}`);
        console.log(`📈 Success rate: ${report.successRate}%`);
        
        if (this.stats.errors.length > 0) {
            console.log(`\n⚠️  Errors: ${this.stats.errors.length}`);
            this.stats.errors.slice(0, 5).forEach(err => {
                console.log(`   - ${err.video}: ${err.error}`);
            });
            if (this.stats.errors.length > 5) {
                console.log(`   ... and ${this.stats.errors.length - 5} more`);
            }
        }
        
        console.log('\n📁 Location: public/videos/**/*.es.srt and *.en.srt');
        console.log(`📊 Progress saved to: ${this.progressFile}\n`);

        return report;
    }
}

module.exports = BatchTranscriptionService;
