#!/usr/bin/env node
/**
 * TEST SCRIPT: Transcribe a single video to verify setup
 *
 * Usage:
 *   export OPENAI_API_KEY="sk-..."
 *   node scripts/test-single-video.js <path-to-video.mp4>
 */

const fs = require('fs');
const path = require('path');

// Get video path from command line
const videoPath = process.argv[2];

if (!videoPath) {
    console.error('Usage: node scripts/test-single-video.js <path-to-video.mp4>');
    console.error('');
    console.error('Example:');
    console.error('  node scripts/test-single-video.js public/videos/langfeed/Want_202509242347_pnlif.mp4');
    process.exit(1);
}

if (!fs.existsSync(videoPath)) {
    console.error(`Error: Video file not found: ${videoPath}`);
    process.exit(1);
}

// Load the main batch script and process just this one video
const mainScript = require('./batch-transcribe-all.js');

console.log('🧪 TEST MODE: Processing single video');
console.log(`📹 Video: ${videoPath}`);
console.log('');

// This will only process the one video
process.argv[2] = path.dirname(videoPath);
