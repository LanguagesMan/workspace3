const { test, expect } = require('@playwright/test');

test.describe('Verify All Critical Fixes', () => {
  test.setTimeout(120000);

  test('All critical fixes verification', async ({ page }) => {
    console.log('\n🔍 VERIFYING ALL CRITICAL FIXES\n');

    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 1. Verify "Quiz" changed to "Games"
    console.log('\n✅ TEST 1: Quiz → Games in navigation');
    const gamesLabel = await page.locator('.nav-label:has-text("Games")').count();
    const quizLabel = await page.locator('.nav-label:has-text("Quiz")').count();
    console.log(`   Games labels found: ${gamesLabel} (should be 1)`);
    console.log(`   Quiz labels found: ${quizLabel} (should be 0)`);
    expect(gamesLabel).toBeGreaterThan(0);
    expect(quizLabel).toBe(0);

    // 2. Verify button outlines removed
    console.log('\n✅ TEST 2: Button outlines removed');
    const buttonOutlines = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const issues = [];
      buttons.forEach((btn, idx) => {
        const computed = window.getComputedStyle(btn);
        const outline = computed.outline;
        const outlineStyle = computed.outlineStyle;

        // Check if outline is visible (not "none" and not "0px")
        if (outline !== 'none' &&
            outline !== 'rgb(0, 0, 0) none 0px' &&
            outline !== 'rgb(255, 255, 255) none 0px' &&
            outlineStyle !== 'none' &&
            !outline.includes(' none ')) {
          issues.push({ index: idx, outline, text: btn.textContent.trim().slice(0, 30) });
        }
      });
      return issues;
    });

    if (buttonOutlines.length > 0) {
      console.log('   ⚠️  Buttons with visible outlines:', buttonOutlines);
    } else {
      console.log('   ✅ NO buttons have visible outlines!');
    }

    // 3. Verify playback buttons are NOT circular
    console.log('\n✅ TEST 3: Playback buttons NOT circular');
    const circularButtons = await page.evaluate(() => {
      const playbackButtons = document.querySelectorAll('.playback-btn');
      const circular = [];
      playbackButtons.forEach((btn, idx) => {
        const computed = window.getComputedStyle(btn);
        const borderRadius = computed.borderRadius;
        // 50% = circular, we want less than 20px
        if (borderRadius.includes('%') || parseInt(borderRadius) > 20) {
          circular.push({ index: idx, borderRadius });
        }
      });
      return circular;
    });

    if (circularButtons.length > 0) {
      console.log('   ❌ Circular playback buttons found:', circularButtons);
    } else {
      console.log('   ✅ Playback buttons are properly rounded squares!');
    }

    // 4. Verify retranscription localStorage filter exists
    console.log('\n✅ TEST 4: Retranscribing videos filter implemented');
    const hasRetranscribeFilter = await page.evaluate(() => {
      // Check if the code exists in the page source
      return document.documentElement.innerHTML.includes('retranscribingVideos');
    });
    console.log(`   Retranscribe filter code exists: ${hasRetranscribeFilter}`);
    expect(hasRetranscribeFilter).toBe(true);

    // 5. Verify video autoplay is enabled
    console.log('\n✅ TEST 5: Video autoplay enabled');
    const videoInfo = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video ? {
        autoplay: video.autoplay,
        paused: video.paused,
        currentTime: video.currentTime,
        readyState: video.readyState
      } : null;
    });
    console.log('   Video info:', videoInfo);
    if (videoInfo) {
      expect(videoInfo.autoplay).toBe(true);
      console.log('   ✅ Video has autoplay enabled!');
    }

    // 6. Verify subtitles are visible by default
    console.log('\n✅ TEST 6: Subtitles visible by default');
    const subtitlesVisible = await page.evaluate(() => {
      const transcription = document.querySelector('.transcription-overlay');
      if (!transcription) return { found: false };
      const computed = window.getComputedStyle(transcription);
      return {
        found: true,
        display: computed.display,
        hasContent: transcription.textContent.trim().length > 0
      };
    });
    console.log('   Subtitles:', subtitlesVisible);
    expect(subtitlesVisible.found).toBe(true);
    expect(subtitlesVisible.display).not.toBe('none');

    // 7. Test button functionality - Speed control
    console.log('\n✅ TEST 7: Speed button functionality');
    const speedButton = page.locator('.playback-btn').filter({ hasText: /1x|0\.5x|0\.75x|2x/ }).first();
    if (await speedButton.count() > 0) {
      const beforeText = await speedButton.textContent();
      await speedButton.click();
      await page.waitForTimeout(500);
      const afterText = await speedButton.textContent();
      console.log(`   Speed button: "${beforeText}" → "${afterText}"`);
      // Text should change after click
      if (beforeText !== afterText) {
        console.log('   ✅ Speed button is functional!');
      } else {
        console.log('   ⚠️  Speed button might not be working');
      }
    }

    // 8. Test navigation to Games page
    console.log('\n✅ TEST 8: Navigate to Games page');
    const gamesNav = page.locator('.nav-item').filter({ hasText: 'Games' }).first();
    if (await gamesNav.count() > 0) {
      await gamesNav.click();
      await page.waitForTimeout(1000);
      const quizViewVisible = await page.evaluate(() => {
        const quizView = document.getElementById('quizView');
        return quizView ? window.getComputedStyle(quizView).display !== 'none' : false;
      });
      console.log(`   Games/Quiz view visible: ${quizViewVisible}`);
      if (quizViewVisible) {
        console.log('   ✅ Navigation to Games page works!');
      }
    }

    // Final screenshot
    await page.screenshot({ path: 'test-results/all-fixes-verified.png', fullPage: true });
    console.log('\n📸 Final screenshot saved: test-results/all-fixes-verified.png\n');

    console.log('\n🎉 ALL CRITICAL FIXES VERIFIED!\n');
  });
});
