#!/usr/bin/env node
/**
 * COMPREHENSIVE BATCH TRANSCRIPTION SYSTEM
 *
 * Generates transcripts for ALL videos missing .srt files across entire /public/videos directory
 *
 * Features:
 * - Recursively scans all subdirectories
 * - Uses OpenAI Whisper API for accurate Spanish transcription
 * - Generates bilingual SRT files (Spanish + English translation)
 * - Proper timestamp synchronization (fixes "sentence already said in 5th second shows in 1st second" issue)
 * - Rate limiting to avoid API throttling
 * - Resume capability (skips already transcribed videos)
 * - Progress tracking and detailed reporting
 *
 * Usage:
 *   export OPENAI_API_KEY="your-key-here"
 *   node scripts/batch-transcribe-all.js
 *
 * To transcribe specific directory only:
 *   node scripts/batch-transcribe-all.js /path/to/directory
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const VIDEOS_DIR = path.join(__dirname, '../public/videos');
const BATCH_SIZE = 3; // Process 3 videos at a time (conservative to avoid rate limits)
const DELAY_MS = 3000; // 3 second delay between batches
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (Whisper API limit)

// Check API key
if (!OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable not set');
    console.error('');
    console.error('Please set your OpenAI API key:');
    console.error('  export OPENAI_API_KEY="sk-..."');
    console.error('');
    console.error('You can get an API key at: https://platform.openai.com/api-keys');
    process.exit(1);
}

/**
 * Find all MP4 files recursively
 */
function findAllVideos(dir, results = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findAllVideos(filePath, results);
        } else if (file.endsWith('.mp4')) {
            const srtPath = filePath.replace('.mp4', '.srt');
            const hasSrt = fs.existsSync(srtPath);
            const fileSize = stat.size;

            results.push({
                mp4: filePath,
                srt: srtPath,
                hasSrt,
                fileSize,
                dir: path.dirname(filePath),
                filename: file
            });
        }
    }

    return results;
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
 * Transcribe video using OpenAI Whisper API with accurate timing
 */
async function transcribeVideo(videoPath) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('file', fs.createReadStream(videoPath));
        form.append('model', 'whisper-1');
        form.append('response_format', 'verbose_json'); // Get word-level timestamps
        form.append('language', 'es'); // Spanish
        form.append('timestamp_granularities[]', 'segment'); // Segment-level timing

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
                        reject(new Error(`Failed to parse Whisper response: ${error.message}`));
                    }
                } else {
                    reject(new Error(`Whisper API failed (${res.statusCode}): ${data}`));
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
 * Translate Spanish to English using GPT
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
                    reject(new Error(`Translation API failed (${res.statusCode}): ${data}`));
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
 * Process a single video
 */
async function processVideo(video) {
    const relPath = path.relative(VIDEOS_DIR, video.mp4);
    console.log(`\n📹 Processing: ${relPath}`);

    try {
        // Check file size
        if (video.fileSize > MAX_FILE_SIZE) {
            console.log(`   ⚠️  SKIPPED: File too large (${(video.fileSize / 1024 / 1024).toFixed(1)}MB > 25MB limit)`);
            return { success: false, error: 'File too large', skipped: true };
        }

        // Skip if already has SRT
        if (video.hasSrt) {
            const videoStats = fs.statSync(video.mp4);
            const srtStats = fs.statSync(video.srt);

            // Skip if SRT is newer than video
            if (srtStats.mtime > videoStats.mtime) {
                console.log(`   ⏭️  SKIPPED: SRT already exists and is up-to-date`);
                return { success: true, skipped: true };
            }
        }

        // Transcribe with Whisper
        console.log(`   🎙️  Transcribing with Whisper...`);
        const transcription = await transcribeVideo(video.mp4);

        if (!transcription.segments || transcription.segments.length === 0) {
            console.log(`   ⚠️  WARNING: No speech detected in video`);
            return { success: false, error: 'No speech detected' };
        }

        console.log(`   ✓  Transcribed ${transcription.segments.length} segments`);

        // Translate each segment
        console.log(`   🌐 Translating to English...`);
        const segments = [];
        for (let i = 0; i < transcription.segments.length; i++) {
            const segment = transcription.segments[i];
            const spanishText = segment.text.trim();

            // Show progress for long transcriptions
            if (transcription.segments.length > 3) {
                process.stdout.write(`\r   🌐 Translating segment ${i + 1}/${transcription.segments.length}...`);
            }

            const englishText = await translateToEnglish(spanishText);

            segments.push({
                start: segment.start,
                end: segment.end,
                spanish: spanishText,
                english: englishText
            });

            // Small delay between translations
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        if (transcription.segments.length > 3) {
            console.log(''); // New line after progress
        }
        console.log(`   ✓  Translated ${segments.length} segments`);

        // Generate bilingual SRT with ACCURATE timestamps
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
        fs.writeFileSync(video.srt, srtContent, 'utf8');

        console.log(`   ✅ SUCCESS: Saved ${path.basename(video.srt)} (${segments.length} segments)`);
        return { success: true, segments: segments.length };

    } catch (error) {
        console.error(`   ❌ ERROR: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Main function
 */
async function main() {
    const startTime = Date.now();

    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║       COMPREHENSIVE VIDEO TRANSCRIPTION SYSTEM                     ║');
    console.log('║       OpenAI Whisper API + GPT Translation                         ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log('');

    // Custom directory or default to /public/videos
    const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : VIDEOS_DIR;
    console.log(`📂 Scanning directory: ${targetDir}`);
    console.log('');

    // Find all videos
    const allVideos = findAllVideos(targetDir);
    const withoutSrt = allVideos.filter(v => !v.hasSrt);
    const tooLarge = withoutSrt.filter(v => v.fileSize > MAX_FILE_SIZE);

    console.log('═'.repeat(70));
    console.log('SCAN RESULTS');
    console.log('═'.repeat(70));
    console.log(`Total MP4 files found: ${allVideos.length}`);
    console.log(`Already have SRT: ${allVideos.filter(v => v.hasSrt).length}`);
    console.log(`Missing SRT: ${withoutSrt.length}`);
    if (tooLarge.length > 0) {
        console.log(`Too large to process: ${tooLarge.length} (> 25MB)`);
    }
    console.log(`Ready to transcribe: ${withoutSrt.length - tooLarge.length}`);
    console.log('═'.repeat(70));

    if (withoutSrt.length === 0) {
        console.log('\n✅ All videos already have SRT files!\n');
        return;
    }

    // Estimate cost and time
    const estimatedMinutes = Math.ceil((withoutSrt.length * 2) / 60); // ~2 min per video
    const estimatedCost = (withoutSrt.length * 0.10).toFixed(2); // ~$0.10 per video estimate
    console.log('');
    console.log('📊 ESTIMATES:');
    console.log(`   Processing time: ~${estimatedMinutes} minutes`);
    console.log(`   Estimated cost: ~$${estimatedCost} (Whisper + GPT)`);
    console.log('');

    // Confirm before proceeding
    console.log('⚠️  This will make API calls to OpenAI (charges apply)');
    console.log('   Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Process in batches
    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < withoutSrt.length; i += BATCH_SIZE) {
        const batch = withoutSrt.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(withoutSrt.length / BATCH_SIZE);

        console.log('\n' + '─'.repeat(70));
        console.log(`📦 BATCH ${batchNum}/${totalBatches} (Videos ${i + 1}-${Math.min(i + BATCH_SIZE, withoutSrt.length)})`);
        console.log('─'.repeat(70));

        for (const video of batch) {
            const result = await processVideo(video);

            if (result.success && result.skipped) {
                skipped++;
            } else if (result.success) {
                processed++;
            } else {
                failed++;
            }
        }

        // Progress summary
        const totalDone = processed + skipped + failed;
        const percentDone = ((totalDone / withoutSrt.length) * 100).toFixed(1);
        console.log('');
        console.log(`   Progress: ${totalDone}/${withoutSrt.length} (${percentDone}%) | ✅ ${processed} | ⏭️  ${skipped} | ❌ ${failed}`);

        // Delay between batches
        if (i + BATCH_SIZE < withoutSrt.length) {
            const remaining = withoutSrt.length - totalDone;
            const estimatedSecondsLeft = Math.ceil((remaining * 120) / 60); // 2 min per video
            console.log(`   ⏳ Waiting ${DELAY_MS / 1000}s before next batch... (${estimatedSecondsLeft}m remaining)`);
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
    }

    // Final summary
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedSecsRemainder = elapsedSeconds % 60;

    console.log('\n' + '═'.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('═'.repeat(70));
    console.log(`✅ Successfully transcribed: ${processed}`);
    console.log(`⏭️  Skipped (already exists): ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📁 Total videos processed: ${processed + skipped + failed}/${withoutSrt.length}`);
    console.log(`⏱️  Total time: ${elapsedMinutes}m ${elapsedSecsRemainder}s`);
    console.log('═'.repeat(70));

    if (failed > 0) {
        console.log('\n⚠️  Some videos failed to transcribe. Check errors above.');
        console.log('   You can re-run this script to retry failed videos.');
    }

    if (processed > 0) {
        console.log('\n✅ Transcription complete! All .srt files saved next to .mp4 files.');
        console.log('   Timing is synchronized with video playback.');
    }

    console.log('');
}

// Run
main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
