#!/usr/bin/env node
/**
 * Direct FFmpeg Transcription (Immediate Solution)
 *
 * Uses ffmpeg to create placeholder transcriptions for all videos
 * Videos display immediately, can be upgraded with real Whisper later
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CEFR_LEVELS = {
  A1: { name: 'Beginner' },
  A2: { name: 'Elementary' },
  B1: { name: 'Intermediate' },
  B2: { name: 'Upper Intermediate' },
  C1: { name: 'Advanced' },
  C2: { name: 'Proficient' }
};

async function getVideoMetadata(videoPath) {
  try {
    const output = execSync(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`,
      { encoding: 'utf-8' }
    );

    const data = JSON.parse(output);
    const videoStream = data.streams.find(s => s.codec_type === 'video');

    return {
      duration: parseFloat(data.format.duration),
      size: parseInt(data.format.size),
      bitrate: parseInt(data.format.bit_rate),
      width: videoStream?.width,
      height: videoStream?.height,
      fps: eval(videoStream?.r_frame_rate) || 30
    };
  } catch (error) {
    return { duration: 8 };
  }
}

async function transcribeVideo(videoPath, outputDir) {
  const videoName = path.basename(videoPath, path.extname(videoPath));
  const outputPath = path.join(outputDir, `${videoName}.json`);

  // Check if already exists
  try {
    const existing = await fs.readFile(outputPath, 'utf-8');
    const data = JSON.parse(existing);
    if (data.transcription) {
      return { success: true, video: videoName, note: 'already exists' };
    }
  } catch (error) {
    // Doesn't exist, create it
  }

  try {
    const metadata = await getVideoMetadata(videoPath);
    const duration = metadata.duration || 8;

    // Generate natural-sounding placeholder based on filename
    const cleanTitle = videoName
      .replace(/_/g, ' ')
      .replace(/\d{12,}/g, '')  // Remove timestamp
      .replace(/\s+/g, ' ')
      .trim();

    // Create realistic segments
    const segments = [];
    const numSegments = Math.ceil(duration / 3); // ~3 seconds per segment

    for (let i = 0; i < numSegments; i++) {
      const start = i * (duration / numSegments);
      const end = Math.min((i + 1) * (duration / numSegments), duration);

      segments.push({
        start: parseFloat(start.toFixed(2)),
        end: parseFloat(end.toFixed(2)),
        text: `Contenido de vídeo en español: ${cleanTitle}.`
      });
    }

    const result = {
      videoPath: videoPath,
      videoName: videoName,
      transcription: {
        text: `Vídeo en español: ${cleanTitle}`,
        segments: segments,
        language: 'es'
      },
      translation: {
        text: `Spanish video: ${cleanTitle}`,
        segments: segments.map(s => ({
          ...s,
          text: `Spanish video content: ${cleanTitle}.`
        }))
      },
      metadata: metadata,
      difficulty: {
        level: 'A2',
        levelName: 'Elementary',
        confidence: 0.5,
        metrics: {}
      },
      processedAt: new Date().toISOString(),
      method: 'ffmpeg-placeholder',
      note: 'Placeholder transcription. Update with Whisper for real transcription.'
    };

    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));

    return { success: true, video: videoName };
  } catch (error) {
    return { success: false, video: videoName, error: error.message };
  }
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   ⚡ Direct FFmpeg Transcription (Placeholder)          ║
║   Videos will display immediately                        ║
╚═══════════════════════════════════════════════════════════╝
  `);

  const langfeedDir = './public/videos/langfeed';
  const outputDir = './cache/transcriptions';

  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });

  // Find all videos
  const output = execSync(`find "${langfeedDir}" -type f -name "*.mp4"`, { encoding: 'utf-8' });
  const videos = output.trim().split('\n').filter(Boolean);

  console.log(`📹 Found ${videos.length} videos\n`);

  let processed = 0;
  let successful = 0;
  let failed = 0;

  // Process in batches of 50
  const batchSize = 50;

  for (let i = 0; i < videos.length; i += batchSize) {
    const batch = videos.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(videos.length / batchSize)} (${batch.length} videos)`);

    const promises = batch.map(v => transcribeVideo(v, outputDir));
    const results = await Promise.all(promises);

    for (const result of results) {
      processed++;
      if (result.success) {
        successful++;
        if (result.note !== 'already exists') {
          process.stdout.write(`✓`);
        } else {
          process.stdout.write(`.`);
        }
      } else {
        failed++;
        process.stdout.write(`✗`);
      }

      if (processed % 50 === 0) {
        console.log(` (${processed}/${videos.length})`);
      }
    }

    if (processed % 50 !== 0 && i + batchSize >= videos.length) {
      console.log(` (${processed}/${videos.length})`);
    }
  }

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    PROCESSING COMPLETE                    ║
╚═══════════════════════════════════════════════════════════╝

📊 Summary:
   Total Videos: ${processed}
   ✅ Successful: ${successful}
   ❌ Failed: ${failed}

📁 Results saved to: ${outputDir}/

🔄 Next Steps:
   1. Videos are now visible in feed with placeholder transcriptions
   2. Update OpenAI API key when available
   3. Run real Whisper transcription to upgrade placeholders
  `);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
