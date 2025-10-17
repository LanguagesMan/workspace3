#!/usr/bin/env node
/**
 * Batch Transcribe Videos with OpenAI Whisper API
 *
 * This script:
 * 1. Finds all .mp4 files in public/videos/reels/
 * 2. Transcribes them using OpenAI Whisper API
 * 3. Generates properly-timed .srt files
 * 4. Handles bilingual output (Spanish + English translation)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');

// OpenAI API Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
if (!OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable not set');
    console.error('Set it with: export OPENAI_API_KEY=your_key_here');
    process.exit(1);
}

const VIDEOS_DIR = path.join(__dirname, '../public/videos/reels');
const BATCH_SIZE = 5; // Process 5 videos at a time
const DELAY_MS = 2000; // 2 second delay between batches

/**
 * Convert Whisper JSON response to SRT format
 */
function convertToSRT(transcription) {
    if (!transcription.segments || transcription.segments.length === 0) {
        return '';
    }

    let srtContent = '';
    transcription.segments.forEach((segment, index) => {
        const startTime = formatTime(segment.start);
        const endTime = formatTime(segment.end);
        const text = segment.text.trim();

        srtContent += `${index + 1}\n`;
        srtContent += `${startTime} --> ${endTime}\n`;
        srtContent += `${text}\n\n`;
    });

    return srtContent;
}

/**
 * Format seconds to SRT timestamp (HH:MM:SS,mmm)
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(milliseconds, 3)}`;
}

function pad(num, size = 2) {
    return String(num).padStart(size, '0');
}

/**
 * Transcribe a single video with OpenAI Whisper
 */
async function transcribeVideo(videoPath) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('file', fs.createReadStream(videoPath));
        form.append('model', 'whisper-1');
        form.append('response_format', 'verbose_json'); // Get timestamps
        form.append('language', 'es'); // Spanish
        form.append('timestamp_granularities[]', 'segment'); // Get word-level timestamps

        const options = {
            hostname: 'api.openai.com',
            path: '/v1/audio/transcriptions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                ...form.getHeaders()
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const result = JSON.parse(data);
                        resolve(result);
                    } catch (error) {
                        reject(new Error(`Failed to parse response: ${error.message}`));
                    }
                } else {
                    reject(new Error(`API request failed: ${res.statusCode} - ${data}`));
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
 * Translate Spanish text to English using OpenAI GPT
 */
async function translateToEnglish(spanishText) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional Spanish-to-English translator. Translate the following Spanish text to English. Only provide the translation, nothing else.'
                },
                {
                    role: 'user',
                    content: spanishText
                }
            ],
            max_tokens: 200,
            temperature: 0.3
        });

        const options = {
            hostname: 'api.openai.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const result = JSON.parse(data);
                        const translation = result.choices[0].message.content.trim();
                        resolve(translation);
                    } catch (error) {
                        reject(new Error(`Failed to parse translation: ${error.message}`));
                    }
                } else {
                    reject(new Error(`Translation API failed: ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Process a single video: transcribe + translate + save SRT
 */
async function processVideo(videoFilename) {
    const videoPath = path.join(VIDEOS_DIR, videoFilename);
    const srtPath = videoPath.replace('.mp4', '.srt');

    console.log(`\n📹 Processing: ${videoFilename}`);

    try {
        // Check if SRT already exists and is recent
        if (fs.existsSync(srtPath)) {
            const videoStats = fs.statSync(videoPath);
            const srtStats = fs.statSync(srtPath);

            // Skip if SRT is newer than video (already processed)
            if (srtStats.mtime > videoStats.mtime) {
                console.log(`⏭️  Skipping (SRT already exists and is up-to-date)`);
                return { success: true, skipped: true };
            }
        }

        // Transcribe with Whisper
        console.log(`🎙️  Transcribing with Whisper...`);
        const transcription = await transcribeVideo(videoPath);

        if (!transcription.segments || transcription.segments.length === 0) {
            console.log(`⚠️  No speech detected`);
            return { success: false, error: 'No speech detected' };
        }

        // Translate each segment to English
        console.log(`🌐 Translating to English...`);
        const segments = [];
        for (const segment of transcription.segments) {
            const spanishText = segment.text.trim();
            const englishText = await translateToEnglish(spanishText);

            segments.push({
                start: segment.start,
                end: segment.end,
                spanish: spanishText,
                english: englishText
            });

            // Small delay between translations
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Generate bilingual SRT
        let srtContent = '';
        segments.forEach((segment, index) => {
            const startTime = formatTime(segment.start);
            const endTime = formatTime(segment.end);

            srtContent += `${index + 1}\n`;
            srtContent += `${startTime} --> ${endTime}\n`;
            srtContent += `${segment.spanish}\n`; // Spanish first
            srtContent += `${segment.english}\n\n`; // English second
        });

        // Save SRT file
        fs.writeFileSync(srtPath, srtContent, 'utf8');

        console.log(`✅ Saved: ${path.basename(srtPath)} (${segments.length} segments)`);
        return { success: true, segments: segments.length };

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Main function: Process all videos in batches
 */
async function main() {
    console.log('🚀 OpenAI Whisper Batch Transcription');
    console.log('=====================================\n');

    // Get all MP4 files
    const allFiles = fs.readdirSync(VIDEOS_DIR);
    const videoFiles = allFiles.filter(f => f.endsWith('.mp4'));

    console.log(`📊 Found ${videoFiles.length} videos in ${VIDEOS_DIR}\n`);

    if (videoFiles.length === 0) {
        console.log('No videos to process.');
        return;
    }

    let processed = 0;
    let skipped = 0;
    let failed = 0;

    // Process in batches
    for (let i = 0; i < videoFiles.length; i += BATCH_SIZE) {
        const batch = videoFiles.slice(i, i + BATCH_SIZE);

        console.log(`\n📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(videoFiles.length / BATCH_SIZE)}`);
        console.log('─'.repeat(50));

        for (const videoFile of batch) {
            const result = await processVideo(videoFile);

            if (result.success && result.skipped) {
                skipped++;
            } else if (result.success) {
                processed++;
            } else {
                failed++;
            }
        }

        // Delay between batches to avoid rate limits
        if (i + BATCH_SIZE < videoFiles.length) {
            console.log(`\n⏳ Waiting ${DELAY_MS / 1000}s before next batch...`);
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TRANSCRIPTION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Processed: ${processed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📁 Total videos: ${videoFiles.length}`);
    console.log('='.repeat(50) + '\n');
}

// Run
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
