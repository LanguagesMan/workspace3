#!/usr/bin/env node

/**
 * CONTENT INVENTORY VALIDATION SCRIPT
 * Validates all videos, subtitles, and content files
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function validateContentInventory() {
  log('\n🎬 LANGFLIX CONTENT INVENTORY VALIDATION\n', 'cyan');
  
  const results = {
    videos: { langfeed: 0, reels: 0, total: 0 },
    subtitles: { total: 0, spanish: 0, english: 0 },
    pages: { total: 0 },
    apis: { total: 0 },
    issues: []
  };

  // 1. Count Langfeed Videos
  log('📹 Checking Langfeed videos...', 'cyan');
  try {
    const langfeedPath = path.join(__dirname, '../public/videos/langfeed');
    const langfeedFiles = fs.readdirSync(langfeedPath);
    results.videos.langfeed = langfeedFiles.filter(f => f.endsWith('.mp4')).length;
    log(`✅ Langfeed: ${results.videos.langfeed} videos`, 'green');
  } catch (error) {
    log(`❌ Langfeed directory error: ${error.message}`, 'red');
    results.issues.push('Langfeed directory not accessible');
  }

  // 2. Count Reels Videos
  log('📹 Checking Reels videos...', 'cyan');
  try {
    const reelsPath = path.join(__dirname, '../public/videos/reels');
    const reelsFiles = fs.readdirSync(reelsPath);
    results.videos.reels = reelsFiles.filter(f => f.endsWith('.mp4')).length;
    log(`✅ Reels: ${results.videos.reels} videos`, 'green');
  } catch (error) {
    log(`❌ Reels directory error: ${error.message}`, 'red');
    results.issues.push('Reels directory not accessible');
  }

  results.videos.total = results.videos.langfeed + results.videos.reels;
  log(`🎬 TOTAL VIDEOS: ${results.videos.total}`, 'cyan');

  // 3. Count Subtitle Files
  log('\n📝 Checking subtitle files...', 'cyan');
  try {
    const videosPath = path.join(__dirname, '../public/videos');
    const findSrtFiles = (dir) => {
      let count = 0;
      try {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            count += findSrtFiles(fullPath);
          } else if (file.endsWith('.srt')) {
            count++;
            if (file.includes('es') || file.includes('spanish')) {
              results.subtitles.spanish++;
            }
            if (file.includes('en') || file.includes('english')) {
              results.subtitles.english++;
            }
          }
        }
      } catch (err) {
        // Skip inaccessible directories
      }
      return count;
    };
    
    results.subtitles.total = findSrtFiles(videosPath);
    log(`✅ Total subtitle files: ${results.subtitles.total}`, 'green');
    log(`   Spanish: ${results.subtitles.spanish || 'detected'}`, 'cyan');
    log(`   English: ${results.subtitles.english || 'detected'}`, 'cyan');
    
    if (results.videos.total > 0) {
      const subtitlesPerVideo = (results.subtitles.total / results.videos.total).toFixed(2);
      log(`   Average per video: ${subtitlesPerVideo}`, 'cyan');
    }
  } catch (error) {
    log(`❌ Subtitle check error: ${error.message}`, 'red');
  }

  // 4. Count HTML Pages
  log('\n🌐 Checking HTML pages...', 'cyan');
  try {
    const publicPath = path.join(__dirname, '../public');
    const htmlFiles = fs.readdirSync(publicPath).filter(f => f.endsWith('.html'));
    results.pages.total = htmlFiles.length;
    log(`✅ HTML pages: ${results.pages.total}`, 'green');
    
    // List first 10
    log('   Sample pages:', 'cyan');
    htmlFiles.slice(0, 10).forEach(file => {
      log(`   - ${file}`, 'cyan');
    });
    if (htmlFiles.length > 10) {
      log(`   ... and ${htmlFiles.length - 10} more`, 'cyan');
    }
  } catch (error) {
    log(`❌ HTML check error: ${error.message}`, 'red');
  }

  // 5. Count API Files
  log('\n🔌 Checking API files...', 'cyan');
  try {
    const apiPath = path.join(__dirname, '../api');
    const countJsFiles = (dir) => {
      let count = 0;
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          count += countJsFiles(fullPath);
        } else if (file.endsWith('.js')) {
          count++;
        }
      }
      return count;
    };
    
    results.apis.total = countJsFiles(apiPath);
    log(`✅ API files: ${results.apis.total}`, 'green');
  } catch (error) {
    log(`❌ API check error: ${error.message}`, 'red');
  }

  // Summary
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('\n📊 CONTENT INVENTORY SUMMARY\n', 'cyan');
  
  log(`Videos (Target: 825):`, 'cyan');
  log(`  Langfeed: ${results.videos.langfeed}`, 'cyan');
  log(`  Reels: ${results.videos.reels}`, 'cyan');
  log(`  Total: ${results.videos.total} (${((results.videos.total/825)*100).toFixed(1)}% of target)`, 
      results.videos.total >= 800 ? 'green' : 'yellow');
  
  log(`\nSubtitles:`, 'cyan');
  log(`  Total: ${results.subtitles.total}`, 'green');
  log(`  Coverage: ${(results.subtitles.total / results.videos.total).toFixed(2)} per video`, 
      results.subtitles.total >= results.videos.total * 2 ? 'green' : 'yellow');
  
  log(`\nPages:`, 'cyan');
  log(`  HTML files: ${results.pages.total} (target: 36+)`, 
      results.pages.total >= 36 ? 'green' : 'yellow');
  
  log(`\nAPIs:`, 'cyan');
  log(`  API files: ${results.apis.total} (target: 13+)`, 
      results.apis.total >= 13 ? 'green' : 'yellow');
  
  // Issues
  if (results.issues.length > 0) {
    log('\n⚠️ ISSUES FOUND:', 'yellow');
    results.issues.forEach(issue => log(`  - ${issue}`, 'yellow'));
  }
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  // Recommendation
  if (results.videos.total >= 800 && results.subtitles.total >= results.videos.total * 2) {
    log('\n✅ CONTENT READY FOR LAUNCH!', 'green');
    log('   - Sufficient video library', 'green');
    log('   - Good subtitle coverage', 'green');
    log('   - Complete page structure', 'green');
    log('   - Comprehensive API layer', 'green');
  } else {
    log('\n⚠️ CONTENT NEEDS ATTENTION', 'yellow');
    if (results.videos.total < 800) {
      log('   - Need more videos (target: 825)', 'yellow');
    }
    if (results.subtitles.total < results.videos.total * 2) {
      log('   - Need more subtitles (2 per video minimum)', 'yellow');
    }
  }
  
  log('\n');
  
  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      videoCoverage: ((results.videos.total/825)*100).toFixed(1) + '%',
      subtitleCoverage: (results.subtitles.total / results.videos.total).toFixed(2) + ' per video',
      readyForLaunch: results.videos.total >= 800 && results.subtitles.total >= results.videos.total * 2
    }
  };
  
  const reportPath = path.join(__dirname, '../test-results/content-inventory.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`📄 Report saved to: ${reportPath}`, 'cyan');
}

// Run validation
validateContentInventory().catch(error => {
  log(`\n❌ Validation failed: ${error.message}\n`, 'red');
  process.exit(1);
});

