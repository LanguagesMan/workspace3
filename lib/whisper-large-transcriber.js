/**
 * 🎙️ ENHANCED WHISPER TRANSCRIPTION SYSTEM
 * Uses OpenAI Whisper API with proper punctuation and translation
 * Features:
 * - Whisper large model via API
 * - Proper punctuation and formatting
 * - Spanish transcription + English translation
 * - Dual-language SRT files
 * - Batch processing with rate limiting
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
require('dotenv').config();

class WhisperLargeTranscriber {
    constructor(options = {}) {
        this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
        
        if (!this.apiKey) {
            throw new Error('❌ OpenAI API key required. Set OPENAI_API_KEY in .env file or pass as option.');
        }
        
        this.videosDir = options.videosDir || path.join(__dirname, '../public/videos');
        this.concurrentProcesses = options.concurrent || 3;
        this.maxFileSizeMB = options.maxFileSizeMB || 24;
        this.processedCount = 0;
        this.totalCount = 0;
        this.errors = [];
        this.skipped = [];
    }

    /**
     * Find all videos without SRT files (recursively)
     * Now checks for both Spanish (.es.srt) and English (.en.srt) files
     */
    async findVideosWithoutSRT() {
        const videos = [];
        
        const scanDirectory = (dir) => {
            try {
                const items = fs.readdirSync(dir, { withFileTypes: true });
                
                for (const item of items) {
                    const fullPath = path.join(dir, item.name);
                    
                    if (item.isDirectory()) {
                        scanDirectory(fullPath);
                    } else if (item.name.match(/\.(mp4|mov)$/i)) {
                        const baseName = item.name.replace(/\.(mp4|mov)$/i, '');
                        const spanishSrtPath = path.join(dir, baseName + '.es.srt');
                        const englishSrtPath = path.join(dir, baseName + '.en.srt');
                        
                        // Only add if either Spanish or English SRT doesn't exist
                        if (!fs.existsSync(spanishSrtPath) || !fs.existsSync(englishSrtPath)) {
                            videos.push({
                                videoPath: fullPath,
                                spanishSrtPath: spanishSrtPath,
                                englishSrtPath: englishSrtPath,
                                baseName: baseName,
                                directory: path.relative(this.videosDir, dir) || 'root'
                            });
                        }
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Skipping directory ${dir}: ${error.message}`);
            }
        };
        
        scanDirectory(this.videosDir);
        return videos;
    }

    /**
     * Transcribe audio to Spanish with proper punctuation
     * Uses OpenAI Whisper API
     */
    async transcribeSpanish(videoPath) {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(videoPath));
        formData.append('model', 'whisper-1');
        formData.append('language', 'es'); // Spanish
        formData.append('response_format', 'verbose_json');
        formData.append('timestamp_granularities[]', 'segment');

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
                timeout: 300000 // 5 minute timeout
            }
        );

        return response.data;
    }

    /**
     * Translate to English with proper punctuation
     * Uses OpenAI Whisper API translation endpoint
     */
    async translateToEnglish(videoPath) {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(videoPath));
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'verbose_json');
        formData.append('timestamp_granularities[]', 'segment');

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
                timeout: 300000 // 5 minute timeout
            }
        );

        return response.data;
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
     * Create Spanish-only SRT file
     * Format: Spanish text with natural punctuation
     */
    createSpanishSRT(spanishData) {
        const srtLines = [];
        let index = 1;

        const spanishSegments = spanishData.segments || [];

        for (let i = 0; i < spanishSegments.length; i++) {
            const spanish = spanishSegments[i];

            const startTime = this.formatSRTTime(spanish.start);
            const endTime = this.formatSRTTime(spanish.end);

            srtLines.push(index);
            srtLines.push(`${startTime} --> ${endTime}`);
            srtLines.push(spanish.text.trim()); // Spanish with natural punctuation from Whisper
            srtLines.push(''); // Empty line separator
            
            index++;
        }

        return srtLines.join('\n');
    }

    /**
     * Create English-only SRT file
     * Format: English translation with natural punctuation
     */
    createEnglishSRT(englishData) {
        const srtLines = [];
        let index = 1;

        const englishSegments = englishData.segments || [];

        for (let i = 0; i < englishSegments.length; i++) {
            const english = englishSegments[i];

            const startTime = this.formatSRTTime(english.start);
            const endTime = this.formatSRTTime(english.end);

            srtLines.push(index);
            srtLines.push(`${startTime} --> ${endTime}`);
            srtLines.push(english.text.trim()); // English with natural punctuation from Whisper
            srtLines.push(''); // Empty line separator
            
            index++;
        }

        return srtLines.join('\n');
    }

    /**
     * Process single video file
     */
    async processVideo(video) {
        const videoName = path.basename(video.videoPath);
        const videoDir = video.directory;
        
        console.log(`\n${'─'.repeat(70)}`);
        console.log(`🎥 Video: ${videoName}`);
        console.log(`📁 Location: ${videoDir}`);

        try {
            // Check file size
            const stats = fs.statSync(video.videoPath);
            const fileSizeMB = stats.size / (1024 * 1024);
            
            if (fileSizeMB > this.maxFileSizeMB) {
                const message = `File too large: ${fileSizeMB.toFixed(1)}MB (limit: ${this.maxFileSizeMB}MB)`;
                console.warn(`⚠️  ${message}`);
                this.skipped.push({ video: videoName, reason: message });
                return false;
            }

            console.log(`📊 Size: ${fileSizeMB.toFixed(2)}MB`);
            
            // Step 1: Transcribe to Spanish
            console.log(`🇪🇸 Transcribing Spanish...`);
            const spanishData = await this.transcribeSpanish(video.videoPath);
            
            // Step 2: Translate to English
            console.log(`🇬🇧 Translating to English...`);
            const englishData = await this.translateToEnglish(video.videoPath);

            // Step 3: Create separate SRT files
            console.log(`💾 Creating Spanish SRT file...`);
            const spanishSrtContent = this.createSpanishSRT(spanishData);
            fs.writeFileSync(video.spanishSrtPath, spanishSrtContent, 'utf-8');
            
            console.log(`💾 Creating English SRT file...`);
            const englishSrtContent = this.createEnglishSRT(englishData);
            fs.writeFileSync(video.englishSrtPath, englishSrtContent, 'utf-8');
            
            this.processedCount++;
            const progress = ((this.processedCount / this.totalCount) * 100).toFixed(1);
            
            console.log(`✅ Success!`);
            console.log(`📈 Progress: ${this.processedCount}/${this.totalCount} (${progress}%)`);
            
            return true;
        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            console.error(`❌ Error: ${errorMsg}`);
            this.errors.push({ video: videoName, error: errorMsg });
            return false;
        }
    }

    /**
     * Process videos in batches (respects API rate limits)
     */
    async processBatch(videos) {
        for (let i = 0; i < videos.length; i += this.concurrentProcesses) {
            const batch = videos.slice(i, i + this.concurrentProcesses);
            const batchNum = Math.floor(i / this.concurrentProcesses) + 1;
            const totalBatches = Math.ceil(videos.length / this.concurrentProcesses);
            
            console.log(`\n${'═'.repeat(70)}`);
            console.log(`📦 BATCH ${batchNum}/${totalBatches} (${batch.length} videos)`);
            console.log(`${'═'.repeat(70)}`);
            
            // Process batch in parallel
            await Promise.all(batch.map(video => this.processVideo(video)));
            
            // Pause between batches to respect rate limits
            if (i + this.concurrentProcesses < videos.length) {
                console.log(`\n⏸️  Pausing 3 seconds between batches (API rate limit protection)...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
    }

    /**
     * Start transcription process
     */
    async start() {
        console.log('\n' + '═'.repeat(70));
        console.log('🎙️  WHISPER LARGE MODEL TRANSCRIPTION SYSTEM');
        console.log('═'.repeat(70));
        console.log('✨ Features:');
        console.log('   • Natural punctuation and capitalization');
        console.log('   • Spanish transcription (.es.srt)');
        console.log('   • English translation (.en.srt)');
        console.log('   • Separate toggleable subtitle files');
        console.log('   • Batch processing with rate limiting');
        console.log('═'.repeat(70));
        
        // Find videos without SRT
        console.log('\n🔍 Scanning for videos without transcriptions...');
        const videos = await this.findVideosWithoutSRT();
        
        if (videos.length === 0) {
            console.log('\n✅ All videos already have transcriptions!');
            console.log('📁 Spanish: public/videos/**/*.es.srt');
            console.log('📁 English: public/videos/**/*.en.srt\n');
            return {
                success: true,
                processed: 0,
                skipped: 0,
                errors: 0
            };
        }

        this.totalCount = videos.length;
        
        // Calculate estimates
        const avgMinutesPerVideo = 3; // Average video length
        const estimatedMinutes = Math.ceil(this.totalCount * avgMinutesPerVideo / this.concurrentProcesses);
        const estimatedCost = (this.totalCount * avgMinutesPerVideo * 0.006).toFixed(2); // $0.006 per minute
        
        console.log(`\n📊 TRANSCRIPTION SUMMARY:`);
        console.log(`   Videos found: ${this.totalCount}`);
        console.log(`   Concurrent processes: ${this.concurrentProcesses}`);
        console.log(`   Estimated time: ~${estimatedMinutes} minutes`);
        console.log(`   Estimated cost: ~$${estimatedCost} USD`);
        console.log(`   API: OpenAI Whisper (whisper-1)`);
        
        console.log(`\n⏳ Starting in 5 seconds... Press Ctrl+C to cancel`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const startTime = Date.now();

        // Process all videos
        await this.processBatch(videos);

        const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        const actualCost = (this.processedCount * avgMinutesPerVideo * 0.006).toFixed(2);
        
        // Final summary
        console.log('\n' + '═'.repeat(70));
        console.log('🎉 TRANSCRIPTION COMPLETE!');
        console.log('═'.repeat(70));
        console.log(`✅ Successfully processed: ${this.processedCount}/${this.totalCount} videos`);
        console.log(`⏱️  Total time: ${duration} minutes`);
        console.log(`💰 Estimated cost: ~$${actualCost} USD`);
        
        if (this.skipped.length > 0) {
            console.log(`\n⏭️  Skipped: ${this.skipped.length} videos`);
            this.skipped.slice(0, 5).forEach(item => {
                console.log(`   • ${item.video}: ${item.reason}`);
            });
            if (this.skipped.length > 5) {
                console.log(`   ... and ${this.skipped.length - 5} more`);
            }
        }
        
        if (this.errors.length > 0) {
            console.log(`\n❌ Errors: ${this.errors.length} videos`);
            this.errors.slice(0, 5).forEach(err => {
                console.log(`   • ${err.video}: ${err.error}`);
            });
            if (this.errors.length > 5) {
                console.log(`   ... and ${this.errors.length - 5} more`);
            }
        }
        
        console.log(`\n📁 Spanish SRT files: public/videos/**/*.es.srt`);
        console.log(`📁 English SRT files: public/videos/**/*.en.srt`);
        console.log(`📝 Format: Separate files for each language (toggleable)\n`);
        
        return {
            success: true,
            processed: this.processedCount,
            skipped: this.skipped.length,
            errors: this.errors.length,
            duration: parseFloat(duration),
            cost: parseFloat(actualCost)
        };
    }
}

// CLI execution
if (require.main === module) {
    const transcriber = new WhisperLargeTranscriber({
        concurrent: 3,
        maxFileSizeMB: 24
    });
    
    transcriber.start()
        .then(result => {
            console.log('✨ Transcription process finished');
            process.exit(result.errors > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('\n❌ Fatal error:', error.message);
            process.exit(1);
        });
}

module.exports = WhisperLargeTranscriber;

