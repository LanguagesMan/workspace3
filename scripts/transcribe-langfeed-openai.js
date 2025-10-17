#!/usr/bin/env node
/**
 * Transcribe Langfeed Videos using OpenAI Whisper API
 *
 * Processes all 673 videos with transcription + translation + CEFR grading
 */

const OpenAIWhisperService = require('../lib/openai-whisper-service');
require('dotenv').config();

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🎬 Langfeed Video Transcription Pipeline              ║
║   OpenAI Whisper API + Translation + CEFR Grading      ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable not set');
    console.error('   Set it in .env file or run: export OPENAI_API_KEY=your-key-here');
    process.exit(1);
  }

  const service = new OpenAIWhisperService({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'whisper-1',
    language: 'es',        // Spanish videos
    outputDir: './cache/transcriptions',
    batchSize: 5           // Process 5 concurrently to avoid rate limits
  });

  try {
    // Initialize
    console.log('🔧 Initializing OpenAI Whisper service...\n');
    await service.initialize();

    // Process all langfeed videos
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
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([level, count]) => `   ${level}: ${count} videos`)
  .join('\n')}

${summary.failed > 0 ? `\n⚠️  Failed Videos:\n${summary.failedVideos.map(f => `   - ${f.video}: ${f.error}`).join('\n')}` : ''}

📁 Results saved to: ./cache/transcriptions/
    `);

  } catch (error) {
    console.error('\n❌ Processing failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
