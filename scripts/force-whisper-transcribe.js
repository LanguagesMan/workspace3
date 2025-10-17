#!/usr/bin/env node
/**
 * Force Re-Transcribe with OpenAI Whisper (Overwrite Placeholders)
 */

const OpenAIWhisperService = require('../lib/openai-whisper-service');
const fs = require('fs');
require('dotenv').config();

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🎤 FORCE OpenAI Whisper Transcription                 ║
║   Overwriting ALL placeholder transcriptions            ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Delete all existing transcriptions to force re-processing
  console.log('🗑️  Deleting placeholder transcriptions...\n');
  const files = fs.readdirSync('./cache/transcriptions').filter(f => f.endsWith('.json') && f !== 'processing-summary.json');

  for (const file of files) {
    fs.unlinkSync(`./cache/transcriptions/${file}`);
  }

  console.log(`✅ Deleted ${files.length} placeholder files\n`);

  const service = new OpenAIWhisperService({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'whisper-1',
    language: 'es',
    outputDir: './cache/transcriptions',
    batchSize: 5
  });

  await service.initialize();

  const langfeedDir = './public/videos/langfeed';
  const summary = await service.processDirectory(langfeedDir);

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
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
