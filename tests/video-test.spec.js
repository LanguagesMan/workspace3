const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'workspace3');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

test.describe('Video Player - Spanish Subtitles Test', () => {

  test('Videos should display Spanish subtitles (not English)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('\n🎬 Testing Video Player with Spanish Subtitles...');

    // Navigate to videos page
    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000); // Wait for videos to load

    // Check for videos
    const videoCount = await page.locator('video').count();
    console.log(`✓ Found ${videoCount} video(s)`);
    expect(videoCount).toBeGreaterThan(0);

    // Take screenshot of first video
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_video_01_initial.png`),
      fullPage: true
    });

    // Check for Spanish text in subtitles
    const transcriptionBox = page.locator('.transcription-box').first();
    await expect(transcriptionBox).toBeVisible({ timeout: 5000 });

    // Get subtitle text
    const subtitleText = await page.locator('.spanish-line').first().textContent();
    console.log(`📝 Subtitle text: "${subtitleText}"`);

    // Verify it's Spanish (not English)
    // Spanish should have words like: "mierda", "tengo", "voy", "comprar", "tanta", etc.
    // NOT English words like: "shit", "hungry", "food", "people"
    const isEnglish = /\b(shit|hungry|food|people|going|buy)\b/i.test(subtitleText);
    const isSpanish = /\b(mierda|tengo|hambre|voy|comprar|comida|tanta|gente)\b/i.test(subtitleText);

    console.log(`Is English: ${isEnglish}`);
    console.log(`Is Spanish: ${isSpanish}`);

    expect(isEnglish).toBe(false); // Should NOT contain English
    expect(isSpanish).toBe(true);  // SHOULD contain Spanish

    // Take screenshot showing Spanish subtitles
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_video_02_spanish_subtitles.png`),
      fullPage: true
    });

    // Test multiple subtitle lines
    const allSubtitles = await page.locator('.spanish-line').allTextContents();
    console.log(`✓ Found ${allSubtitles.length} subtitle lines`);

    for (let i = 0; i < Math.min(3, allSubtitles.length); i++) {
      console.log(`   Line ${i + 1}: "${allSubtitles[i]}"`);
    }

    // Scroll to next video
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_video_03_second_video.png`),
      fullPage: true
    });

    // Check second video subtitles
    const secondVideoSubtitle = await page.locator('.spanish-line').first().textContent();
    console.log(`📝 Second video subtitle: "${secondVideoSubtitle}"`);

    const secondIsEnglish = /\b(shit|hungry|food|people|going|buy)\b/i.test(secondVideoSubtitle);
    expect(secondIsEnglish).toBe(false); // Second video should also have Spanish

    console.log('\n✅ ALL VIDEO TESTS PASSED - Spanish subtitles working correctly!');
  });
});
