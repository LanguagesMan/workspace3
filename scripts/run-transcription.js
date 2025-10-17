#!/usr/bin/env node

/**
 * 🎙️ VIDEO TRANSCRIPTION CLI
 * 
 * Command-line tool to run batch video transcription
 * 
 * Usage:
 *   node scripts/run-transcription.js [options]
 * 
 * Options:
 *   --limit N        Process only first N videos
 *   --dry-run        Show what would be processed without processing
 *   --resume         Resume from last position (automatic)
 *   --reset          Reset progress and start from beginning
 *   --status         Show current progress status
 * 
 * Examples:
 *   node scripts/run-transcription.js --limit 10    # Process first 10
 *   node scripts/run-transcription.js --dry-run     # Preview without processing
 *   node scripts/run-transcription.js               # Process all remaining
 * 
 * @module run-transcription
 */

// Load .env.local first, then .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const path = require('path');
const fs = require('fs').promises;
const BatchTranscriptionService = require('../lib/batch-transcription-service');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        limit: null,
        dryRun: false,
        reset: false,
        status: false,
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '--limit' && args[i + 1]) {
            options.limit = parseInt(args[i + 1]);
            i++;
        } else if (arg === '--dry-run') {
            options.dryRun = true;
        } else if (arg === '--reset') {
            options.reset = true;
        } else if (arg === '--status') {
            options.status = true;
        } else if (arg === '--help' || arg === '-h') {
            options.help = true;
        }
    }

    return options;
}

// Show help message
function showHelp() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║          🎙️  VIDEO TRANSCRIPTION CLI                             ║
╚═══════════════════════════════════════════════════════════════════╝

USAGE:
  node scripts/run-transcription.js [options]

OPTIONS:
  --limit N        Process only first N videos (useful for testing)
  --dry-run        Show what would be processed without actually processing
  --resume         Resume from last position (happens automatically)
  --reset          Reset progress file and start from beginning
  --status         Show current progress and statistics
  --help, -h       Show this help message

EXAMPLES:
  # Process first 10 videos (good for testing)
  node scripts/run-transcription.js --limit 10

  # Preview what will be processed
  node scripts/run-transcription.js --dry-run

  # Process all remaining videos
  node scripts/run-transcription.js

  # Check current status
  node scripts/run-transcription.js --status

  # Start fresh (reset progress)
  node scripts/run-transcription.js --reset

ENVIRONMENT VARIABLES:
  OPENAI_API_KEY   Required - Your OpenAI API key

FEATURES:
  ✅ Automatic resume if interrupted
  ✅ Progress tracking in transcription-progress.json
  ✅ Rate limiting (10 concurrent max)
  ✅ Cost estimation before starting
  ✅ Detailed error reporting
  ✅ Separate .es.srt and .en.srt files

COST:
  Approximately $0.006 per minute of audio
  Average video: ~30 seconds = ~$0.003 per video
  704 videos ≈ $2.11 total

OUTPUT:
  .es.srt files (Spanish) next to each video file
  .en.srt files (English translation) next to each video file
  Progress saved to transcription-progress.json
    `);
}

// Show current status
async function showStatus() {
    const progressFile = path.join(__dirname, '../transcription-progress.json');
    
    try {
        const data = await fs.readFile(progressFile, 'utf-8');
        const progress = JSON.parse(data);
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 TRANSCRIPTION STATUS');
        console.log('='.repeat(70));
        console.log(`Total videos processed: ${progress.processedVideos.length}`);
        console.log(`Last updated: ${progress.lastProcessedIndex >= 0 ? new Date(progress.lastProcessedIndex).toLocaleString() : 'N/A'}`);
        
        if (progress.completedAt) {
            console.log(`✅ All transcriptions completed at: ${new Date(progress.completedAt).toLocaleString()}`);
        } else {
            console.log(`🔄 In progress - resume by running without --reset flag`);
        }
        
        console.log('\nRecent videos processed:');
        progress.processedVideos.slice(-10).forEach((video, i) => {
            console.log(`   ${i + 1}. ${video}`);
        });
        
        if (progress.processedVideos.length > 10) {
            console.log(`   ... and ${progress.processedVideos.length - 10} more`);
        }
        
        console.log('');
    } catch (error) {
        console.log('\n⚠️  No progress file found. Run transcription to start.\n');
    }
}

// Reset progress
async function resetProgress() {
    const progressFile = path.join(__dirname, '../transcription-progress.json');
    
    try {
        await fs.unlink(progressFile);
        console.log('✅ Progress file deleted. Will start from beginning.\n');
    } catch (error) {
        console.log('⚠️  No progress file to reset.\n');
    }
}

// Main execution
async function main() {
    const options = parseArgs();

    // Handle help
    if (options.help) {
        showHelp();
        process.exit(0);
    }

    // Handle status
    if (options.status) {
        await showStatus();
        process.exit(0);
    }

    // Handle reset
    if (options.reset) {
        await resetProgress();
        if (options.limit === null && !options.dryRun) {
            console.log('Progress reset. Run again to start transcription.\n');
            process.exit(0);
        }
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
        console.error('\n❌ Error: OPENAI_API_KEY environment variable not set\n');
        console.log('Please set your OpenAI API key:');
        console.log('  export OPENAI_API_KEY="your-api-key-here"');
        console.log('\nOr create a .env file with:');
        console.log('  OPENAI_API_KEY=your-api-key-here\n');
        process.exit(1);
    }

    try {
        // Create service
        const service = new BatchTranscriptionService({
            apiKey: process.env.OPENAI_API_KEY
        });

        // Start transcription
        const report = await service.start({
            limit: options.limit,
            dryRun: options.dryRun
        });

        // Save report
        if (!options.dryRun && report) {
            const reportPath = path.join(__dirname, '../transcription-report.json');
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`📄 Report saved to: ${reportPath}\n`);
        }

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Handle interruption gracefully
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Interrupted! Progress has been saved.');
    console.log('💡 Run again to resume from where you left off.\n');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n⚠️  Terminated! Progress has been saved.');
    console.log('💡 Run again to resume from where you left off.\n');
    process.exit(0);
});

// Run
if (require.main === module) {
    main();
}

module.exports = { main, parseArgs };
