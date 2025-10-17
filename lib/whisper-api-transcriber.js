/**
 * 🎙️ OPTIMIZED WHISPER API TRANSCRIBER
 * Uses OpenAI Whisper API for fast transcription + translation
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

class WhisperAPITranscriber {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.OPENAI_API_KEY;
        if (!this.apiKey) {
            throw new Error('OpenAI API key required. Set OPENAI_API_KEY environment variable.');
        }
        
        this.videosDir = path.join(__dirname, '../public/videos');
        this.processedCount = 0;
        this.totalCount = 0;
        this.errors = [];
        this.concurrent = 3; // API rate limit friendly
    }

    /**
     * Find all videos without SRT files
     */
    async findVideosWithoutSRT() {
        const videos = [];
        
        const scanDirectory = (dir) => {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (item.name.match(/\.(mp4|mov)$/i)) {
                    const baseName = item.name.replace(/\.(mp4|mov)$/i, '');
                    const srtPath = path.join(dir, baseName + '.srt');
                    
                    if (!fs.existsSync(srtPath)) {
                        videos.push({
                            videoPath: fullPath,
                            srtPath: srtPath,
                            baseName: baseName,
                            directory: path.basename(dir)
                        });
                    }
                }
            }
        };
        
        scanDirectory(this.videosDir);
        return videos;
    }

    /**
     * Transcribe video with Whisper API (Spanish)
     */
    async transcribeSpanish(videoPath) {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(videoPath));
        formData.append('model', 'whisper-1');
        formData.append('language', 'es');
        formData.append('response_format', 'verbose_json');
        formData.append('timestamp_granularities', '["segment"]');

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
                    maxBodyLength: Infinity
                }
            );

            return response.data;
        } catch (error) {
            throw new Error(`Transcription failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Translate to English with Whisper API
     */
    async translateToEnglish(videoPath) {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(videoPath));
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'verbose_json');
        formData.append('timestamp_granularities', '["segment"]');

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
                    maxBodyLength: Infinity
                }
            );

            return response.data;
        } catch (error) {
            throw new Error(`Translation failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Convert Whisper response to SRT format (dual language)
     */
    createDualLanguageSRT(spanishData, englishData) {
        const srtLines = [];
        let index = 1;

        // Use Spanish segments as the base (they have timestamps)
        const spanishSegments = spanishData.segments || [];
        const englishSegments = englishData.segments || [];

        for (let i = 0; i < spanishSegments.length; i++) {
            const spanish = spanishSegments[i];
            const english = englishSegments[i] || { text: '' };

            const startTime = this.formatSRTTime(spanish.start);
            const endTime = this.formatSRTTime(spanish.end);

            // Subtitle entry
            srtLines.push(index);
            srtLines.push(`${startTime} --> ${endTime}`);
            srtLines.push(spanish.text.trim());
            srtLines.push(''); // Empty line for next entry
            
            // Add English translation as separate subtitle
            index++;
            srtLines.push(index);
            srtLines.push(`${startTime} --> ${endTime}`);
            srtLines.push(english.text.trim() || '[Translation pending]');
            srtLines.push(''); // Empty line
            
            index++;
        }

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
     * Process single video
     */
    async processVideo(video) {
        const videoName = path.basename(video.videoPath);
        console.log(`\n🎙️ Processing: ${videoName}`);

        try {
            // Check file size (Whisper API has 25MB limit)
            const stats = fs.statSync(video.videoPath);
            const fileSizeMB = stats.size / (1024 * 1024);
            
            if (fileSizeMB > 24) {
                console.warn(`⚠️  File too large (${fileSizeMB.toFixed(1)}MB), skipping: ${videoName}`);
                this.errors.push({ video: videoName, error: 'File too large for API' });
                return false;
            }

            console.log(`   📊 Size: ${fileSizeMB.toFixed(1)}MB`);
            console.log(`   🇪🇸 Transcribing Spanish...`);
            
            // Get Spanish transcription
            const spanishData = await this.transcribeSpanish(video.videoPath);
            
            console.log(`   🇬🇧 Translating to English...`);
            
            // Get English translation
            const englishData = await this.translateToEnglish(video.videoPath);

            console.log(`   💾 Creating SRT file...`);
            
            // Create dual-language SRT
            const srtContent = this.createDualLanguageSRT(spanishData, englishData);
            
            // Save SRT file
            fs.writeFileSync(video.srtPath, srtContent, 'utf-8');
            
            this.processedCount++;
            const progress = ((this.processedCount / this.totalCount) * 100).toFixed(1);
            console.log(`   ✅ Complete! Progress: ${this.processedCount}/${this.totalCount} (${progress}%)`);
            
            return true;
        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
            this.errors.push({ video: videoName, error: error.message });
            return false;
        }
    }

    /**
     * Process videos in batches
     */
    async processBatch(videos) {
        for (let i = 0; i < videos.length; i += this.concurrent) {
            const batch = videos.slice(i, i + this.concurrent);
            const batchNum = Math.floor(i / this.concurrent) + 1;
            const totalBatches = Math.ceil(videos.length / this.concurrent);
            
            console.log(`\n${'='.repeat(70)}`);
            console.log(`📦 BATCH ${batchNum}/${totalBatches} (${batch.length} videos)`);
            console.log('='.repeat(70));
            
            await Promise.all(batch.map(video => this.processVideo(video)));
            
            // Small delay between batches to respect rate limits
            if (i + this.concurrent < videos.length) {
                console.log('\n⏸️  Pausing 2 seconds between batches...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    /**
     * Start transcription process
     */
    async start() {
        console.log('\n' + '='.repeat(70));
        console.log('🎙️ WHISPER API TRANSCRIPTION SYSTEM');
        console.log('='.repeat(70));
        
        // Find videos
        console.log('\n📂 Scanning for videos without transcriptions...');
        const videos = await this.findVideosWithoutSRT();
        
        if (videos.length === 0) {
            console.log('\n✅ All videos already have transcriptions!');
            return;
        }

        this.totalCount = videos.length;
        
        console.log(`\n📊 SUMMARY:`);
        console.log(`   Videos to process: ${this.totalCount}`);
        console.log(`   Concurrent processes: ${this.concurrent}`);
        console.log(`   Estimated time: ${Math.ceil(this.totalCount * 20 / this.concurrent / 60)} minutes`);
        console.log(`   Cost estimate: $${(this.totalCount * 0.018).toFixed(2)} (at $0.006/min, avg 3min/video)`);
        
        console.log('\n⏳ Starting in 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const startTime = Date.now();

        // Process all videos
        await this.processBatch(videos);

        const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        
        // Final summary
        console.log('\n' + '='.repeat(70));
        console.log('✅ TRANSCRIPTION COMPLETE!');
        console.log('='.repeat(70));
        console.log(`✅ Successfully processed: ${this.processedCount}/${this.totalCount} videos`);
        console.log(`⏱️  Total time: ${duration} minutes`);
        console.log(`💰 Estimated cost: $${(this.processedCount * 0.018).toFixed(2)}`);
        
        if (this.errors.length > 0) {
            console.log(`\n⚠️  Errors: ${this.errors.length}`);
            this.errors.slice(0, 10).forEach(err => {
                console.log(`   - ${err.video}: ${err.error}`);
            });
            if (this.errors.length > 10) {
                console.log(`   ... and ${this.errors.length - 10} more`);
            }
        }
        
        console.log('\n✅ All transcriptions saved with Spanish + English!');
        console.log('📁 Location: public/videos/**/*.srt\n');
    }
}

// CLI execution
if (require.main === module) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
        console.error('❌ Error: OPENAI_API_KEY environment variable not set');
        console.log('\nTo set it:');
        console.log('  export OPENAI_API_KEY="your-api-key-here"');
        console.log('\nOr run with:');
        console.log('  OPENAI_API_KEY="your-key" node lib/whisper-api-transcriber.js');
        process.exit(1);
    }
    
    const transcriber = new WhisperAPITranscriber(apiKey);
    transcriber.start().catch(error => {
        console.error('\n❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = WhisperAPITranscriber;

