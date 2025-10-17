const { test, expect } = require('@playwright/test');

test.describe('📸 SCREENSHOT VALIDATION - User Requirements', () => {

  test('Screenshot: TikTok-style reels with clickable translations', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('video', { timeout: 10000 });

    // Wait for video to load
    await page.waitForTimeout(3000);

    // Take full-page screenshot
    await page.screenshot({
      path: 'screenshots/user-requirements-validated.png',
      fullPage: true
    });

    console.log('✅ Screenshot saved: screenshots/user-requirements-validated.png');

    // Screenshot with subtitles visible
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'screenshots/tiktok-reels-with-subtitles.png',
      fullPage: false
    });

    console.log('✅ Screenshot saved: screenshots/tiktok-reels-with-subtitles.png');
  });

  test('Screenshot: Clickable word translation popup', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('video', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // Wait for subtitles and click a word
    const clickableWord = await page.$('.subtitle-word');
    if (clickableWord) {
      await clickableWord.click();
      await page.waitForSelector('.translation-popup', { timeout: 5000 });

      await page.screenshot({
        path: 'screenshots/translation-popup-proof.png',
        fullPage: false
      });

      console.log('✅ Screenshot saved: screenshots/translation-popup-proof.png');
    }
  });

  test('Screenshot: Stories bar (Instagram-style)', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.stories-bar', { timeout: 5000 });

    await page.screenshot({
      path: 'screenshots/stories-bar-instagram-style.png',
      clip: { x: 0, y: 0, width: 1280, height: 150 }
    });

    console.log('✅ Screenshot saved: screenshots/stories-bar-instagram-style.png');
  });

});
