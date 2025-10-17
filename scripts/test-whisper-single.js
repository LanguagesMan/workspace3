#!/usr/bin/env node
/**
 * Test OpenAI Whisper on a single video
 */

const OpenAIWhisperService = require('../lib/openai-whisper-service');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  console.log('🧪 Testing OpenAI Whisper on single video...\n');

  // Get first langfeed video
  const langfeedDir = './public/videos/langfeed';
  const files = fs.readdirSync(langfeedDir).filter(f => f.endsWith('.mp4'));

  if (files.length === 0) {
    console.error('❌ No videos found in langfeed directory');
    process.exit(1);
  }

  const testVideo = path.join(langfeedDir, files[0]);
  console.log(`📹 Test video: ${files[0]}\n`);

  const service = new OpenAIWhisperService({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'whisper-1',
    language: 'es',
    outputDir: './cache/transcriptions',
    batchSize: 1
  });

  await service.initialize();

  console.log('🎤 Transcribing with OpenAI Whisper API...\n');
  const result = await service.transcribeVideo(testVideo);

  if (result.error) {
    console.error('❌ Transcription failed:', result.error);
    process.exit(1);
  }

  console.log('\n✅ Transcription successful!\n');
  console.log('📊 Results:');
  console.log(`   Spanish: ${result.transcription.text}`);
  console.log(`   English: ${result.translation.text}`);
  console.log(`   Difficulty: ${result.difficulty.level} (${result.difficulty.levelName})`);
  console.log(`   Confidence: ${(result.difficulty.confidence * 100).toFixed(0)}%`);
  console.log(`\n   Metrics:`);
  console.log(`   - Words: ${result.difficulty.metrics.wordCount}`);
  console.log(`   - Unique words: ${result.difficulty.metrics.uniqueWordCount}`);
  console.log(`   - Avg word length: ${result.difficulty.metrics.avgWordLength}`);
  console.log(`   - WPM: ${result.difficulty.metrics.wordsPerMinute}`);
  console.log(`\n📁 Saved to: ${path.join('./cache/transcriptions', path.basename(testVideo, '.mp4') + '.json')}`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
