const { test, expect } = require('@playwright/test');

test.describe('PRODUCTION READINESS AUDIT', () => {
  test.setTimeout(180000);

  test('Complete Production Check', async ({ page, context }) => {
    console.log('\n🚀 PRODUCTION READINESS AUDIT\n');

    const issues = [];
    const warnings = [];
    const passed = [];

    await context.clearCookies();
    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('📋 CORE FUNCTIONALITY\n');

    // Video loading
    const videoCount = await page.evaluate(() => document.querySelectorAll('.video-card').length);
    videoCount > 0 ? passed.push(`✅ ${videoCount} videos loaded`) : issues.push('❌ No videos');
    console.log(videoCount > 0 ? `✅ ${videoCount} videos loaded` : '❌ No videos loaded');

    // Autoplay
    const autoplay = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v ? v.autoplay : false;
    });
    autoplay ? passed.push('✅ Autoplay enabled') : issues.push('❌ Autoplay disabled');
    console.log(autoplay ? '✅ Autoplay enabled' : '❌ Autoplay disabled');

    // Subtitles
    const subtitles = await page.evaluate(() => {
      const el = document.querySelector('.transcription-overlay');
      return el ? window.getComputedStyle(el).display !== 'none' : false;
    });
    subtitles ? passed.push('✅ Subtitles visible') : issues.push('❌ Subtitles hidden');
    console.log(subtitles ? '✅ Subtitles visible' : '❌ Subtitles hidden');

    console.log('\n📋 BUTTONS & DESIGN\n');

    // Navigation
    const navLabels = await page.evaluate(() => 
      Array.from(document.querySelectorAll('.nav-label')).map(el => el.textContent.trim())
    );
    console.log(`Nav items: ${navLabels.join(', ')}`);
    navLabels.includes('Games') ? passed.push('✅ Games in nav') : issues.push('❌ Quiz not changed');

    // Button design
    const btnIssues = await page.evaluate(() => {
      const problems = [];
      document.querySelectorAll('button').forEach((btn, i) => {
        const s = window.getComputedStyle(btn);
        if (s.borderRadius.includes('%') && parseFloat(s.borderRadius) >= 50) {
          problems.push(`Btn${i}: circular`);
        }
      });
      return problems;
    });
    btnIssues.length === 0 ? passed.push('✅ No circular buttons') : btnIssues.forEach(i => warnings.push(`⚠️ ${i}`));
    console.log(btnIssues.length === 0 ? '✅ No circular buttons' : `⚠️ ${btnIssues.join(', ')}`);

    console.log('\n📋 PERSISTENCE\n');

    // LocalStorage filters
    const hasFilters = await page.evaluate(() => {
      const html = document.documentElement.innerHTML;
      return {
        deleted: html.includes('deletedVideos'),
        retranscribe: html.includes('retranscribingVideos'),
        watched: html.includes('watchedVideos')
      };
    });
    hasFilters.deleted ? passed.push('✅ Delete filter') : issues.push('❌ No delete filter');
    hasFilters.retranscribe ? passed.push('✅ Retranscribe filter') : issues.push('❌ No retranscribe filter');
    console.log(hasFilters.deleted ? '✅ Delete filter' : '❌ No delete filter');
    console.log(hasFilters.retranscribe ? '✅ Retranscribe filter' : '❌ No retranscribe filter');

    console.log('\n' + '='.repeat(60));
    console.log(`✅ PASSED: ${passed.length}`);
    console.log(`⚠️ WARNINGS: ${warnings.length}`);
    console.log(`❌ CRITICAL: ${issues.length}`);
    console.log('='.repeat(60));

    if (issues.length === 0) {
      console.log('\n🚀 READY FOR PRODUCTION LAUNCH!\n');
    } else {
      console.log('\n❌ FIX CRITICAL ISSUES BEFORE LAUNCH:\n');
      issues.forEach(i => console.log(`  ${i}`));
      console.log('');
    }

    expect(issues.length).toBe(0);
  });
});
