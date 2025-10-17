#!/usr/bin/env node

/**
 * 🔄 START AUTO-TRANSCRIBE WATCHER
 * Automatically transcribes new videos as they're added
 * 
 * Usage:
 *   node scripts/start-auto-watcher.js              # Just watch for new videos
 *   node scripts/start-auto-watcher.js --initial-scan # Process existing + watch
 */

require('dotenv').config();
const AutoTranscribeWatcher = require('../lib/auto-transcribe-watcher');

async function main() {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.error('\n❌ ERROR: OPENAI_API_KEY not found\n');
        console.log('Please set your OpenAI API key in one of these ways:\n');
        console.log('1. Create a .env file with:');
        console.log('   OPENAI_API_KEY=sk-your-api-key-here\n');
        console.log('2. Or export it in your terminal:');
        console.log('   export OPENAI_API_KEY=sk-your-api-key-here\n');
        console.log('3. Or run with the key:');
        console.log('   OPENAI_API_KEY=sk-xxx node scripts/start-auto-watcher.js\n');
        console.log('Get your API key from: https://platform.openai.com/api-keys\n');
        process.exit(1);
    }
    
    const args = process.argv.slice(2);
    const withInitialScan = args.includes('--initial-scan') || args.includes('-i');
    
    const watcher = new AutoTranscribeWatcher();
    
    try {
        if (withInitialScan) {
            await watcher.startWithInitialScan();
        } else {
            await watcher.start();
        }
    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run
main();

