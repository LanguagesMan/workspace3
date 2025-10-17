#!/usr/bin/env node

/**
 * AUTO-TRANSCRIPTION SYSTEM
 *
 * Watches /public/videos/reels/ folder for new .mp4 files
 * Automatically transcribes them using OpenAI Whisper API
 * Generates .srt subtitle files with the same name
 *
 * Usage:
 *   node scripts/auto-transcribe.js
 *
 * Environment variables:
 *   OPENAI_API_KEY - Your OpenAI API key (required)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');

// Configuration
const VIDEOS_DIR = path.join(__dirname, '../public/videos/reels');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

// Check if API key is set
if (!OPENAI_API_KEY) {
    console.error('❌ ERROR: OPENAI_API_KEY environment variable is not set');
    console.error('');
    console.error('Please set your OpenAI API key:');
    console.error('  export OPENAI_API_KEY="sk-..."');
    console.error('');
    console.error('Or add it to your .env file');
    process.exit(1);
}

console.log('🎬 AUTO-TRANSCRIPTION SYSTEM');
console.log('📁 Watching:', VIDEOS_DIR);
console.log('🔑 OpenAI API Key:', OPENAI_API_KEY.substring(0, 8) + '...');
console.log('');

// Ensure videos directory exists
if (!fs.existsSync(VIDEOS_DIR)) {
    console.error(`❌ Videos directory not found: ${VIDEOS_DIR}`);
    process.exit(1);
}

/**
 * Transcribe video using OpenAI Whisper API
 */
async function transcribeVideo(videoPath) {
    const filename = path.basename(videoPath);
    console.log(`🎙️  Transcribing: ${filename}...`);

    return new Promise((resolve, reject) => {
        // Create form data
        const form = new FormData();
        form.append('file', fs.createReadStream(videoPath));
        form.append('model', 'whisper-1');
        form.append('language', 'es'); // Spanish
        form.append('response_format', 'srt'); // Get SRT format directly

        // Make API request
        const options = {
            hostname: 'api.openai.com',
            port: 443,
            path: '/v1/audio/transcriptions',
            method: 'POST',
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data); // SRT content
                } else {
                    reject(new Error(`API returned status ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        form.pipe(req);
    });
}

/**
 * Generate SRT file from transcription
 */
function saveSrtFile(videoPath, srtContent) {
    const srtPath = videoPath.replace('.mp4', '.srt');
    fs.writeFileSync(srtPath, srtContent, 'utf-8');
    console.log(`✅ Saved: ${path.basename(srtPath)}`);
}

/**
 * Process a video file
 */
async function processVideo(videoPath) {
    const srtPath = videoPath.replace('.mp4', '.srt');

    // Skip if SRT already exists
    if (fs.existsSync(srtPath)) {
        console.log(`⏭️  Skipping (SRT exists): ${path.basename(videoPath)}`);
        return;
    }

    try {
        // Transcribe video
        const srtContent = await transcribeVideo(videoPath);

        // Save SRT file
        saveSrtFile(videoPath, srtContent);

        console.log(`🎉 Successfully transcribed: ${path.basename(videoPath)}`);
    } catch (error) {
        console.error(`❌ Error transcribing ${path.basename(videoPath)}:`, error.message);
    }
}

/**
 * Process all existing videos without SRT files
 */
async function processExistingVideos() {
    console.log('🔍 Scanning for videos without SRT files...\n');

    const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.mp4'));
    const videosWithoutSrt = files.filter(f => {
        const srtPath = path.join(VIDEOS_DIR, f.replace('.mp4', '.srt'));
        return !fs.existsSync(srtPath);
    });

    if (videosWithoutSrt.length === 0) {
        console.log('✅ All videos already have SRT files\n');
        return;
    }

    console.log(`📋 Found ${videosWithoutSrt.length} videos to transcribe\n`);

    // Process videos one by one (to avoid rate limiting)
    for (const filename of videosWithoutSrt) {
        const videoPath = path.join(VIDEOS_DIR, filename);
        await processVideo(videoPath);
        console.log(''); // Blank line between videos
    }

    console.log('✅ Finished processing existing videos\n');
}

/**
 * Watch for new video files
 */
function watchForNewVideos() {
    console.log('👀 Watching for new videos...\n');

    fs.watch(VIDEOS_DIR, async (eventType, filename) => {
        if (!filename || !filename.endsWith('.mp4')) {
            return;
        }

        const videoPath = path.join(VIDEOS_DIR, filename);

        // Wait for file to be fully written
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if file exists and has size
        if (!fs.existsSync(videoPath)) {
            return;
        }

        const stats = fs.statSync(videoPath);
        if (stats.size === 0) {
            return;
        }

        console.log(`\n📥 New video detected: ${filename}`);
        await processVideo(videoPath);
    });
}

/**
 * Main function
 */
async function main() {
    try {
        // Process existing videos first
        await processExistingVideos();

        // Watch for new videos
        watchForNewVideos();

        console.log('🚀 Auto-transcription system is running');
        console.log('   Press Ctrl+C to stop\n');

        // Keep process alive
        process.on('SIGINT', () => {
            console.log('\n\n👋 Stopping auto-transcription system...');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run the script
main();
