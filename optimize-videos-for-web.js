#!/usr/bin/env node

/**
 * Optimize MP4 Videos for Web Playback
 * Re-encodes videos with web-optimized settings (MOOV atom at beginning)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const reelsDir = path.join(__dirname, 'public', 'videos', 'reels');
const backupDir = path.join(reelsDir, '_originals');

// Create backup directory
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('📁 Created backup directory:', backupDir);
}

// Get all MP4 files
const files = fs.readdirSync(reelsDir);
const mp4Files = files.filter(f => f.endsWith('.mp4'));

console.log(`🎬 Found ${mp4Files.length} MP4 files to optimize\n`);

let optimized = 0;
let skipped = 0;

for (const filename of mp4Files) {
    const inputPath = path.join(reelsDir, filename);
    const backupPath = path.join(backupDir, filename);
    const tempPath = path.join(reelsDir, `_temp_${filename}`);

    try {
        // Skip if already has backup (already optimized)
        if (fs.existsSync(backupPath)) {
            console.log(`⏭️  Skip: ${filename} (already optimized)`);
            skipped++;
            continue;
        }

        console.log(`⚙️  Optimizing: ${filename}`);

        // Backup original
        fs.copyFileSync(inputPath, backupPath);

        // Re-encode for web with faststart (MOOV atom at beginning)
        execSync(
            `ffmpeg -i "${inputPath}" \
            -c:v libx264 -preset fast -crf 23 \
            -profile:v baseline -level 3.0 \
            -pix_fmt yuv420p \
            -movflags +faststart \
            -c:a aac -b:a 128k \
            "${tempPath}" -y -loglevel error`,
            { stdio: 'inherit' }
        );

        // Replace original with optimized
        fs.unlinkSync(inputPath);
        fs.renameSync(tempPath, inputPath);

        console.log(`✅ Optimized: ${filename}\n`);
        optimized++;

    } catch (error) {
        console.error(`❌ Error optimizing ${filename}:`, error.message);
        // Clean up temp file if exists
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
    }
}

console.log(`\n📊 Summary:`);
console.log(`✅ Optimized: ${optimized} videos`);
console.log(`⏭️  Skipped: ${skipped} videos (already done)`);
console.log(`📁 Originals backed up to: ${backupDir}`);
console.log(`\n🎉 All videos now web-optimized for browser playback!`);
