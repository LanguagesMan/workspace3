#!/usr/bin/env node

/**
 * 🎬 MASTER TRANSCRIPTION SCRIPT
 * Transcribe ALL videos in the project with Whisper large model
 * 
 * Usage:
 *   node scripts/transcribe-all-videos.js
 *   
 * Or with environment variable:
 *   OPENAI_API_KEY=sk-xxx node scripts/transcribe-all-videos.js
 */

require('dotenv').config();
const WhisperLargeTranscriber = require('../lib/whisper-large-transcriber');

async function main() {
    console.log('\n' + '═'.repeat(70));
    console.log('🎬 MASTER VIDEO TRANSCRIPTION SCRIPT');
    console.log('═'.repeat(70));
    
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.error('\n❌ ERROR: OPENAI_API_KEY not found\n');
        console.log('Please set your OpenAI API key in one of these ways:\n');
        console.log('1. Create a .env file with:');
        console.log('   OPENAI_API_KEY=sk-your-api-key-here\n');
        console.log('2. Or export it in your terminal:');
        console.log('   export OPENAI_API_KEY=sk-your-api-key-here\n');
        console.log('3. Or run with the key:');
        console.log('   OPENAI_API_KEY=sk-xxx node scripts/transcribe-all-videos.js\n');
        console.log('Get your API key from: https://platform.openai.com/api-keys\n');
        process.exit(1);
    }
    
    // Create transcriber
    const transcriber = new WhisperLargeTranscriber({
        concurrent: 3, // Process 3 videos at once
        maxFileSizeMB: 24 // OpenAI Whisper API limit
    });
    
    try {
        // Start transcription
        const result = await transcriber.start();
        
        // Summary
        console.log('\n' + '═'.repeat(70));
        console.log('📊 FINAL SUMMARY');
        console.log('═'.repeat(70));
        console.log(`✅ Successfully processed: ${result.processed} videos`);
        console.log(`⏭️  Skipped: ${result.skipped} videos`);
        console.log(`❌ Errors: ${result.errors} videos`);
        console.log(`⏱️  Duration: ${result.duration} minutes`);
        console.log(`💰 Estimated cost: $${result.cost} USD`);
        console.log('═'.repeat(70));
        
        if (result.errors > 0) {
            console.log('\n⚠️  Some videos failed to process. Check the error log above.');
            process.exit(1);
        } else {
            console.log('\n🎉 All videos transcribed successfully!\n');
            process.exit(0);
        }
        
    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run
main();

