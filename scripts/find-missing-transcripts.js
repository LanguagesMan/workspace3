#!/usr/bin/env node
/**
 * Find all MP4 files missing SRT transcripts
 */

const fs = require('fs');
const path = require('path');

const VIDEOS_DIR = path.join(__dirname, '../public/videos');

function findAllVideos(dir, results = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findAllVideos(filePath, results);
        } else if (file.endsWith('.mp4')) {
            const srtPath = filePath.replace('.mp4', '.srt');
            const hasSrt = fs.existsSync(srtPath);

            results.push({
                mp4: filePath,
                srt: srtPath,
                hasSrt,
                dir: path.dirname(filePath),
                filename: file
            });
        }
    }

    return results;
}

// Find all videos
console.log('Scanning for videos...\n');
const allVideos = findAllVideos(VIDEOS_DIR);

// Separate into with/without SRT
const withSrt = allVideos.filter(v => v.hasSrt);
const withoutSrt = allVideos.filter(v => !v.hasSrt);

// Print summary
console.log('='.repeat(70));
console.log('VIDEO TRANSCRIPT AUDIT');
console.log('='.repeat(70));
console.log(`Total MP4 files: ${allVideos.length}`);
console.log(`With SRT files: ${withSrt.length}`);
console.log(`Missing SRT files: ${withoutSrt.length}`);
console.log(`Coverage: ${((withSrt.length / allVideos.length) * 100).toFixed(1)}%`);
console.log('='.repeat(70));

// Print missing files
if (withoutSrt.length > 0) {
    console.log('\nVIDEOS MISSING TRANSCRIPTS:\n');
    withoutSrt.forEach((v, i) => {
        console.log(`${i + 1}. ${v.mp4}`);
    });

    // Save to file for batch processing
    const outputPath = path.join(__dirname, 'missing-transcripts.txt');
    fs.writeFileSync(outputPath, withoutSrt.map(v => v.mp4).join('\n'));
    console.log(`\nSaved list to: ${outputPath}\n`);
}

// Breakdown by directory
console.log('\nBREAKDOWN BY DIRECTORY:\n');
const byDir = {};
allVideos.forEach(v => {
    const relDir = path.relative(VIDEOS_DIR, v.dir);
    if (!byDir[relDir]) {
        byDir[relDir] = { total: 0, withSrt: 0, missing: 0 };
    }
    byDir[relDir].total++;
    if (v.hasSrt) {
        byDir[relDir].withSrt++;
    } else {
        byDir[relDir].missing++;
    }
});

for (const [dir, stats] of Object.entries(byDir).sort()) {
    const coverage = (stats.withSrt / stats.total * 100).toFixed(0);
    console.log(`${dir || '(root)'}: ${stats.withSrt}/${stats.total} (${coverage}% coverage, ${stats.missing} missing)`);
}
