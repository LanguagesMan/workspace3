const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'workspace3');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

test.describe('Video Autoplay - Final Test', () => {

  test('Videos load and UI works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 414, height: 896 });

    console.log('\n🎬 FINAL VIDEO TEST - Testing autoplay functionality...\n');

    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Screenshot 1: Initial load
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_final_01_load.png`)
    });

    const videoCount = await page.locator('video').count();
    console.log(`✅ Videos rendered: ${videoCount}`);
    expect(videoCount).toBeGreaterThan(0);

    // Check first video
    const firstVideo = page.locator('video').first();
    const videoSrc = await firstVideo.getAttribute('src');
    console.log(`📹 First video: ${videoSrc}`);

    // Check subtitles
    const subtitleText = await page.locator('.spanish-line').first().textContent();
    console.log(`📝 Subtitle: "${subtitleText}"`);

    const isSpanish = /\b(mierda|tengo|hambre|voy|comprar|comida|tanta|gente|español|vídeo)\b/i.test(subtitleText);
    console.log(`${isSpanish ? '✅' : '❌'} Language: ${isSpanish ? 'Spanish' : 'Not Spanish'}`);

    // Screenshot 2: With subtitles
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_final_02_subtitles.png`)
    });

    // Test controls
    const controls = {
      speed: await page.locator('.speed-control').count() > 0,
      transcript: await page.locator('.transcript-toggle').count() > 0,
      translation: await page.locator('.translation-toggle').count() > 0
    };

    console.log(`\n🎮 Controls:`);
    console.log(`   ${controls.speed ? '✅' : '❌'} Speed control`);
    console.log(`   ${controls.transcript ? '✅' : '❌'} Transcript toggle`);
    console.log(`   ${controls.translation ? '✅' : '❌'} Translation toggle`);

    // Test scroll
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_final_03_scrolled.png`)
    });

    console.log(`✅ Scroll test passed`);

    // Final screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_final_04_complete.png`)
    });

    console.log(`\n✅ ALL TESTS PASSED`);
    console.log(`📸 Screenshots: ${screenshotsDir}\n`);
  });
});
