#!/usr/bin/env node

/**
 * 🧪 TEST TRANSCRIPTION SETUP
 * Verify the transcription system is properly configured
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n' + '═'.repeat(70));
console.log('🧪 TRANSCRIPTION SYSTEM SETUP TEST');
console.log('═'.repeat(70));
console.log('\n');

let allChecks = true;

// Check 1: Node.js version
console.log('1️⃣  Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion >= 14) {
    console.log(`   ✅ Node.js ${nodeVersion} (OK)\n`);
} else {
    console.log(`   ❌ Node.js ${nodeVersion} (Need 14+)\n`);
    allChecks = false;
}

// Check 2: Dependencies
console.log('2️⃣  Checking dependencies...');
const requiredDeps = ['axios', 'form-data', 'dotenv'];
const missingDeps = [];

for (const dep of requiredDeps) {
    try {
        require.resolve(dep);
        console.log(`   ✅ ${dep}`);
    } catch (error) {
        console.log(`   ❌ ${dep} (missing)`);
        missingDeps.push(dep);
        allChecks = false;
    }
}

if (missingDeps.length > 0) {
    console.log(`\n   ⚠️  Install missing dependencies with: npm install`);
}
console.log('');

// Check 3: Environment variable
console.log('3️⃣  Checking environment variables...');
if (process.env.OPENAI_API_KEY) {
    const key = process.env.OPENAI_API_KEY;
    if (key.startsWith('sk-') && key.length > 20) {
        console.log(`   ✅ OPENAI_API_KEY is set (${key.substring(0, 10)}...)\n`);
    } else {
        console.log(`   ⚠️  OPENAI_API_KEY format seems incorrect`);
        console.log(`   Should start with 'sk-' and be ~50+ characters\n`);
        allChecks = false;
    }
} else {
    console.log(`   ❌ OPENAI_API_KEY not set`);
    console.log(`   Set it in .env file or environment variable\n`);
    allChecks = false;
}

// Check 4: File structure
console.log('4️⃣  Checking file structure...');
const requiredFiles = [
    'lib/whisper-large-transcriber.js',
    'lib/auto-transcribe-watcher.js',
    'scripts/transcribe-all-videos.js',
    'scripts/start-auto-watcher.js',
    'config/openai-config.js'
];

for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} (missing)`);
        allChecks = false;
    }
}
console.log('');

// Check 5: Videos directory
console.log('5️⃣  Checking videos directory...');
const videosDir = path.join(__dirname, '../public/videos');
if (fs.existsSync(videosDir)) {
    console.log(`   ✅ Videos directory exists: ${videosDir}`);
    
    // Count videos
    let videoCount = 0;
    let srtCount = 0;
    
    function countFiles(dir) {
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    countFiles(fullPath);
                } else if (item.name.match(/\.(mp4|mov)$/i)) {
                    videoCount++;
                } else if (item.name.endsWith('.srt')) {
                    srtCount++;
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }
    
    countFiles(videosDir);
    
    console.log(`   📊 Found ${videoCount} videos`);
    console.log(`   📊 Found ${srtCount} SRT files`);
    console.log(`   📊 Videos needing transcription: ${videoCount - srtCount}`);
} else {
    console.log(`   ❌ Videos directory not found: ${videosDir}`);
    allChecks = false;
}
console.log('');

// Check 6: Scripts in package.json
console.log('6️⃣  Checking npm scripts...');
try {
    const packageJson = require(path.join(__dirname, '../package.json'));
    const requiredScripts = ['transcribe', 'transcribe:watch', 'transcribe:all'];
    
    for (const script of requiredScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
            console.log(`   ✅ npm run ${script}`);
        } else {
            console.log(`   ❌ npm run ${script} (missing)`);
            allChecks = false;
        }
    }
} catch (error) {
    console.log(`   ❌ Cannot read package.json`);
    allChecks = false;
}
console.log('');

// Final summary
console.log('═'.repeat(70));
if (allChecks) {
    console.log('✅ ALL CHECKS PASSED!');
    console.log('═'.repeat(70));
    console.log('\n🎉 Your transcription system is ready to use!\n');
    console.log('Quick start:');
    console.log('  npm run transcribe         # Transcribe all videos');
    console.log('  npm run transcribe:watch   # Watch for new videos');
    console.log('  npm run transcribe:all     # Both\n');
} else {
    console.log('❌ SOME CHECKS FAILED');
    console.log('═'.repeat(70));
    console.log('\n⚠️  Please fix the issues above before running transcription.\n');
    console.log('Quick fixes:');
    console.log('  1. Set OPENAI_API_KEY in .env file');
    console.log('  2. Run: npm install');
    console.log('  3. Run this test again\n');
}

process.exit(allChecks ? 0 : 1);

