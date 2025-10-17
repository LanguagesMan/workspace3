#!/usr/bin/env node
/**
 * Adaptive Transcription with Gödel Learning Agent
 *
 * Self-referential learning system that:
 * - Tries multiple strategies
 * - Learns from successes/failures
 * - Improves strategy selection over time
 */

const AdaptiveWhisperAgent = require('../lib/adaptive-whisper-agent');
require('dotenv').config();

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🧠 Adaptive Transcription Agent (Gödel Learning)      ║
║   Multi-tier fallback with self-improvement             ║
╚═══════════════════════════════════════════════════════════╝
  `);

  const agent = new AdaptiveWhisperAgent({
    outputDir: './cache/transcriptions',
    batchSize: 10  // Process 10 concurrently
  });

  try {
    console.log('🔧 Initializing adaptive agent...\n');
    await agent.initialize();

    const langfeedDir = './public/videos/langfeed';
    const summary = await agent.processDirectory(langfeedDir);

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    PROCESSING COMPLETE                    ║
╚═══════════════════════════════════════════════════════════╝

📊 Summary:
   Total Videos: ${summary.totalVideos}
   ✅ Successful: ${summary.successful}
   ❌ Failed: ${summary.failed}

🧠 Final Learning Stats:
${Object.entries(summary.learningMemory.strategies)
  .filter(([_, stats]) => stats.attempts > 0)
  .map(([name, stats]) => {
    const successRate = ((stats.successes / stats.attempts) * 100).toFixed(0);
    return `   ${name}: ${stats.successes}/${stats.attempts} (${successRate}%) - Avg ${stats.avgTime.toFixed(1)}s`;
  })
  .join('\n')}

📁 Results saved to: ./cache/transcriptions/
    `);

  } catch (error) {
    console.error('\n❌ Processing failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
