/**
 * 🔄 AUTOMATIC VIDEO TRANSCRIPTION WATCHER
 * Watches for new videos and automatically transcribes them
 * Features:
 * - Real-time file system monitoring
 * - Automatic transcription on new video detection
 * - Debouncing to handle file writes
 * - Processing queue to avoid overload
 */

const fs = require('fs');
const path = require('path');
const WhisperLargeTranscriber = require('./whisper-large-transcriber');

class AutoTranscribeWatcher {
    constructor(options = {}) {
        this.videosDir = options.videosDir || path.join(__dirname, '../public/videos');
        this.transcriber = new WhisperLargeTranscriber({
            apiKey: options.apiKey,
            concurrent: 1, // Process one at a time for auto-transcribe
            maxFileSizeMB: options.maxFileSizeMB || 24
        });
        
        this.watchedDirs = new Set();
        this.processingQueue = [];
        this.isProcessing = false;
        this.debounceTimers = new Map();
        this.processedFiles = new Set();
        
        console.log('🔄 Auto-Transcribe Watcher initialized');
        console.log(`📁 Watching: ${this.videosDir}`);
    }

    /**
     * Check if file needs transcription
     * Now checks for both Spanish (.es.srt) and English (.en.srt) files
     */
    needsTranscription(videoPath) {
        const baseName = path.basename(videoPath, path.extname(videoPath));
        const spanishSrtPath = path.join(path.dirname(videoPath), baseName + '.es.srt');
        const englishSrtPath = path.join(path.dirname(videoPath), baseName + '.en.srt');
        return !fs.existsSync(spanishSrtPath) || !fs.existsSync(englishSrtPath);
    }

    /**
     * Add video to processing queue
     */
    async queueVideo(videoPath) {
        // Skip if already processed or in queue
        if (this.processedFiles.has(videoPath)) {
            return;
        }
        
        // Skip if already in queue
        if (this.processingQueue.some(v => v.videoPath === videoPath)) {
            return;
        }
        
        // Check if needs transcription
        if (!this.needsTranscription(videoPath)) {
            console.log(`⏭️  Skipping (already has SRT): ${path.basename(videoPath)}`);
            return;
        }
        
        const baseName = path.basename(videoPath, path.extname(videoPath));
        const videoInfo = {
            videoPath: videoPath,
            spanishSrtPath: path.join(path.dirname(videoPath), baseName + '.es.srt'),
            englishSrtPath: path.join(path.dirname(videoPath), baseName + '.en.srt'),
            baseName: baseName,
            directory: path.relative(this.videosDir, path.dirname(videoPath)) || 'root'
        };
        
        console.log(`\n➕ Added to queue: ${path.basename(videoPath)}`);
        this.processingQueue.push(videoInfo);
        
        // Start processing if not already processing
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    /**
     * Process videos in queue
     */
    async processQueue() {
        if (this.isProcessing || this.processingQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        while (this.processingQueue.length > 0) {
            const video = this.processingQueue.shift();
            
            console.log(`\n${'═'.repeat(70)}`);
            console.log(`🎬 Processing: ${video.baseName}`);
            console.log(`📁 Queue remaining: ${this.processingQueue.length}`);
            console.log(`${'═'.repeat(70)}`);
            
            try {
                await this.transcriber.processVideo(video);
                this.processedFiles.add(video.videoPath);
                console.log(`✅ Completed: ${video.baseName}`);
            } catch (error) {
                console.error(`❌ Failed: ${video.baseName}`, error.message);
            }
            
            // Small delay between videos
            if (this.processingQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        this.isProcessing = false;
        console.log(`\n✅ Queue empty, watching for new videos...\n`);
    }

    /**
     * Handle new file detection with debouncing
     */
    handleNewFile(filePath) {
        // Clear existing timer for this file
        if (this.debounceTimers.has(filePath)) {
            clearTimeout(this.debounceTimers.get(filePath));
        }
        
        // Set new timer (wait for file write to complete)
        const timer = setTimeout(() => {
            this.debounceTimers.delete(filePath);
            
            // Check if it's a video file
            if (filePath.match(/\.(mp4|mov)$/i)) {
                console.log(`\n🆕 New video detected: ${path.basename(filePath)}`);
                this.queueVideo(filePath);
            }
        }, 2000); // 2 second debounce
        
        this.debounceTimers.set(filePath, timer);
    }

    /**
     * Watch a directory recursively
     */
    watchDirectory(dir) {
        try {
            // Skip if already watching
            if (this.watchedDirs.has(dir)) {
                return;
            }
            
            this.watchedDirs.add(dir);
            
            // Watch this directory
            fs.watch(dir, { persistent: true }, (eventType, filename) => {
                if (!filename) return;
                
                const filePath = path.join(dir, filename);
                
                // Handle file events
                if (eventType === 'rename' || eventType === 'change') {
                    try {
                        // Check if file exists (rename can be create or delete)
                        if (fs.existsSync(filePath)) {
                            const stats = fs.statSync(filePath);
                            
                            if (stats.isDirectory()) {
                                // New directory, watch it
                                this.watchDirectory(filePath);
                            } else if (stats.isFile()) {
                                // New or modified file
                                this.handleNewFile(filePath);
                            }
                        }
                    } catch (error) {
                        // File might have been deleted or moved
                        // Ignore the error
                    }
                }
            });
            
            // Recursively watch subdirectories
            try {
                const items = fs.readdirSync(dir, { withFileTypes: true });
                for (const item of items) {
                    if (item.isDirectory()) {
                        this.watchDirectory(path.join(dir, item.name));
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Cannot read directory: ${dir}`);
            }
            
        } catch (error) {
            console.warn(`⚠️  Cannot watch directory: ${dir}`, error.message);
        }
    }

    /**
     * Start watching for new videos
     */
    async start() {
        console.log('\n' + '═'.repeat(70));
        console.log('🔄 AUTO-TRANSCRIBE WATCHER STARTING');
        console.log('═'.repeat(70));
        console.log('✨ Features:');
        console.log('   • Real-time monitoring of video directories');
        console.log('   • Automatic transcription of new videos');
        console.log('   • Spanish transcription (.es.srt)');
        console.log('   • English translation (.en.srt)');
        console.log('   • Natural punctuation in both languages');
        console.log('   • Separate toggleable subtitle files');
        console.log('═'.repeat(70));
        console.log(`\n📁 Watching: ${this.videosDir}`);
        console.log(`🎙️  Using: OpenAI Whisper API (whisper-1)`);
        console.log(`\n👀 Monitoring for new .mp4 and .mov files...`);
        console.log(`⚡ Will auto-transcribe when detected\n`);
        
        // Start watching
        this.watchDirectory(this.videosDir);
        
        console.log(`✅ Watching ${this.watchedDirs.size} directories`);
        console.log(`\n🟢 Auto-transcribe watcher is running...`);
        console.log(`   Press Ctrl+C to stop\n`);
        
        // Keep process alive
        process.on('SIGINT', () => {
            console.log('\n\n🛑 Stopping auto-transcribe watcher...');
            console.log(`📊 Processed: ${this.processedFiles.size} videos`);
            console.log(`📋 Queue remaining: ${this.processingQueue.length}`);
            console.log('\n✅ Watcher stopped\n');
            process.exit(0);
        });
    }

    /**
     * Process all existing videos without SRT files, then start watching
     */
    async startWithInitialScan() {
        console.log('\n' + '═'.repeat(70));
        console.log('🔄 AUTO-TRANSCRIBE WATCHER WITH INITIAL SCAN');
        console.log('═'.repeat(70));
        
        // First, process all existing videos
        console.log('\n📂 Scanning for existing videos without transcriptions...');
        const existingTranscriber = new WhisperLargeTranscriber({
            concurrent: 3,
            maxFileSizeMB: 24
        });
        
        const result = await existingTranscriber.start();
        
        console.log('\n✅ Initial scan complete!');
        console.log(`   Processed: ${result.processed} videos`);
        console.log(`   Skipped: ${result.skipped} videos`);
        console.log(`   Errors: ${result.errors} videos`);
        
        // Now start watching for new files
        console.log('\n🔄 Starting auto-watcher for new videos...\n');
        await this.start();
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const withInitialScan = args.includes('--initial-scan') || args.includes('-i');
    
    const watcher = new AutoTranscribeWatcher();
    
    if (withInitialScan) {
        watcher.startWithInitialScan().catch(error => {
            console.error('\n❌ Fatal error:', error.message);
            process.exit(1);
        });
    } else {
        watcher.start().catch(error => {
            console.error('\n❌ Fatal error:', error.message);
            process.exit(1);
        });
    }
}

module.exports = AutoTranscribeWatcher;

