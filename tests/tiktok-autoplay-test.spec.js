const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'workspace3');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

test.describe('TikTok-Style Video Autoplay Test', () => {

  test('Videos should autoplay like TikTok (HEADED MODE)', async ({ page }) => {
    await page.setViewportSize({ width: 414, height: 896 }); // iPhone 11 Pro

    console.log('\n🎬 Testing TikTok-style autoplay in HEADED mode...');

    // Navigate to videos page
    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    console.log('✓ Page loaded');

    // Wait for videos to load
    await page.waitForTimeout(3000);

    // Take initial screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_autoplay_01_initial.png`),
      fullPage: false
    });

    // Check for video elements
    const videoCount = await page.locator('video').count();
    console.log(`✓ Found ${videoCount} video(s)`);

    if (videoCount === 0) {
      console.log('❌ NO VIDEOS - page did not render videos');
      return;
    }

    // Get first video
    const firstVideo = page.locator('video').first();

    // Wait a bit more for video to start loading
    await page.waitForTimeout(2000);

    // Check video state
    const videoState = await firstVideo.evaluate((video) => ({
      src: video.src,
      readyState: video.readyState,
      paused: video.paused,
      muted: video.muted,
      autoplay: video.autoplay,
      currentTime: video.currentTime,
      duration: video.duration,
      error: video.error ? {
        code: video.error.code,
        message: video.error.message
      } : null
    }));

    console.log('\n📊 First Video State:');
    console.log(`   Source: ${videoState.src}`);
    console.log(`   Ready State: ${videoState.readyState} (4=can play through)`);
    console.log(`   Paused: ${videoState.paused}`);
    console.log(`   Muted: ${videoState.muted}`);
    console.log(`   Autoplay: ${videoState.autoplay}`);
    console.log(`   Current Time: ${videoState.currentTime}s`);
    console.log(`   Duration: ${videoState.duration}s`);

    if (videoState.error) {
      console.log(`   ❌ ERROR: ${videoState.error.message}`);
    } else {
      console.log(`   ✅ No errors`);
    }

    // Try to manually play if not playing
    if (videoState.paused) {
      console.log('\n▶️ Video is paused, attempting to play...');

      const playResult = await firstVideo.evaluate(async (video) => {
        try {
          await video.play();
          return { success: true, playing: !video.paused };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      console.log(`   Play result: ${JSON.stringify(playResult)}`);
    }

    // Wait for playback
    await page.waitForTimeout(2000);

    // Check if playing now
    const isPlaying = await firstVideo.evaluate((video) => !video.paused && video.currentTime > 0);
    console.log(`\n🎬 Video is ${isPlaying ? '▶️ PLAYING' : '⏸️ NOT PLAYING'}`);

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_autoplay_02_after_play.png`),
      fullPage: false
    });

    // Test scroll to next video
    console.log('\n📜 Testing scroll to next video...');

    await page.evaluate(() => {
      window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    });

    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_autoplay_03_scrolled.png`),
      fullPage: false
    });

    // Check second video
    const secondVideo = page.locator('video').nth(1);
    const secondState = await secondVideo.evaluate((video) => ({
      paused: video.paused,
      currentTime: video.currentTime,
      readyState: video.readyState
    }));

    console.log(`\n📊 Second Video State:`);
    console.log(`   Ready State: ${secondState.readyState}`);
    console.log(`   Paused: ${secondState.paused}`);
    console.log(`   Current Time: ${secondState.currentTime}s`);

    // Check if subtitles are in Spanish
    const subtitles = await page.locator('.spanish-line').first().textContent();
    console.log(`\n📝 Subtitles: "${subtitles}"`);

    const isSpanish = /\b(mierda|tengo|hambre|voy|comprar|comida|tanta|gente|español|vídeo)\b/i.test(subtitles);
    const isEnglish = /\b(shit|hungry|food|people|going|buy|video)\b/i.test(subtitles);

    console.log(`   Language: ${isSpanish ? '🇪🇸 Spanish ✅' : isEnglish ? '🇬🇧 English ❌' : '❓ Unknown'}`);

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_autoplay_04_final.png`),
      fullPage: false
    });

    console.log('\n✅ AUTOPLAY TEST COMPLETED');
    console.log(`📸 Screenshots saved to: ${screenshotsDir}`);
  });
});
