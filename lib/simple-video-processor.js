/**
 * Simple Video Processor
 * Extracts metadata and creates catalog entries for langfeed videos
 * Uses ffprobe for metadata, prepares for future Whisper integration
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

/**
 * CEFR-based difficulty estimation (simplified for now)
 * Will be enhanced with actual transcriptions later
 */
function estimateDifficulty(videoName, duration) {
  const name = videoName.toLowerCase();

  // Simple heuristics based on filename patterns
  if (name.includes('slow') || name.includes('8second')) {
    return { level: 'A1', name: 'Beginner', confidence: 0.7 };
  }
  if (name.includes('basic') || name.includes('simple')) {
    return { level: 'A2', name: 'Elementary', confidence: 0.6 };
  }
  if (name.includes('intermediate')) {
    return { level: 'B1', name: 'Intermediate', confidence: 0.7 };
  }
  if (name.includes('advanced')) {
    return { level: 'C1', name: 'Advanced', confidence: 0.7 };
  }

  // Default: Elementary (most common for short videos)
  return { level: 'A2', name: 'Elementary', confidence: 0.5 };
}

/**
 * Extract video metadata using ffprobe
 */
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
    console.error(`Failed to get metadata for ${videoPath}:`, error.message);
    return null;
  }
}

/**
 * Process all videos and create catalog
 */
async function processLangfeedVideos() {
  console.log('🎬 Processing langfeed videos...\n');

  const videoDir = './public/videos/langfeed';
  const outputFile = './cache/langfeed-catalog.json';

  // Find all MP4 files
  const files = execSync(`find "${videoDir}" -type f -name "*.mp4"`, { encoding: 'utf-8' })
    .trim().split('\n').filter(Boolean);

  console.log(`📹 Found ${files.length} videos\n`);

  const catalog = [];
  let processed = 0;

  for (const filePath of files) {
    const fileName = path.basename(filePath, '.mp4');
    const relativePath = filePath.replace('./public/', '/');

    // Get metadata
    const metadata = await getVideoMetadata(filePath);

    if (metadata) {
      // Estimate difficulty
      const difficulty = estimateDifficulty(fileName, metadata.duration);

      const entry = {
        id: fileName,
        title: fileName.replace(/_/g, ' '),
        url: relativePath,
        thumbnail: relativePath.replace('.mp4', '.jpg'),  // Placeholder
        duration: metadata.duration,
        size: metadata.size,
        resolution: `${metadata.width}x${metadata.height}`,
        difficulty: difficulty,
        language: 'es',  // Spanish
        needsTranscription: true,  // Flag for future processing
        addedAt: new Date().toISOString()
      };

      catalog.push(entry);
      processed++;

      if (processed % 50 === 0) {
        console.log(`✓ Processed ${processed}/${files.length} videos...`);
      }
    }
  }

  // Save catalog
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, JSON.stringify(catalog, null, 2));

  // Generate summary
  const difficultyDistribution = {};
  catalog.forEach(entry => {
    const level = entry.difficulty.level;
    difficultyDistribution[level] = (difficultyDistribution[level] || 0) + 1;
  });

  console.log(`
✅ Processing complete!

📊 Summary:
   Total videos: ${catalog.length}
   Avg duration: ${(catalog.reduce((sum, v) => sum + v.duration, 0) / catalog.length).toFixed(1)}s

📈 Difficulty Distribution (estimated):
${Object.entries(difficultyDistribution)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([level, count]) => `   ${level}: ${count} videos`)
  .join('\n')}

📁 Catalog saved to: ${outputFile}

⚠️  Note: Difficulty levels are estimated. Run Whisper transcription for accurate grading.
  `);

  return catalog;
}

// Run if called directly
if (require.main === module) {
  processLangfeedVideos().catch(console.error);
}

module.exports = { processLangfeedVideos, getVideoMetadata, estimateDifficulty };
