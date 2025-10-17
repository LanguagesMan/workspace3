#!/usr/bin/env node
/**
 * Process Langfeed Videos
 * Transcribe and grade 673 videos using Whisper + CEFR
 */

const VideoTranscriptionService = require('../lib/video-transcription-service');

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🎬 Langfeed Video Processing Pipeline                  ║
║   Transcription + Translation + CEFR Grading            ║
╚═══════════════════════════════════════════════════════════╝
  `);

  const service = new VideoTranscriptionService({
    whisperModel: 'base',  // Start with base for speed, upgrade to large later
    language: 'es',        // Spanish videos
    targetLanguage: 'en',  // Translate to English
    batchSize: 10,         // Process 10 concurrently
    outputDir: './cache/transcriptions'
  });

  try {
    // Initialize (install Whisper if needed)
    console.log('🔧 Initializing service...\n');
    await service.initialize();

    // Process all videos
    const langfeedDir = './public/videos/langfeed';
    const summary = await service.processDirectory(langfeedDir);

    // Print results
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    PROCESSING COMPLETE                    ║
╚═══════════════════════════════════════════════════════════╝

📊 Summary:
   Total Videos: ${summary.totalVideos}
   ✅ Successful: ${summary.successful}
   ❌ Failed: ${summary.failed}

📈 Difficulty Distribution (CEFR):
${Object.entries(summary.difficultyDistribution)
  .map(([level, count]) => `   ${level}: ${count} videos`)
  .join('\n')}

${summary.failed > 0 ? `\n⚠️ Failed Videos:\n${summary.failedVideos.map(f => `   - ${f.video}: ${f.error}`).join('\n')}` : ''}

📁 Results saved to: ./cache/transcriptions/
    `);

  } catch (error) {
    console.error('\n❌ Processing failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
