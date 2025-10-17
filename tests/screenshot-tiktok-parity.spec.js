// 📸 Screenshot Comparison: TikTok Quality Parity
const { test, expect } = require('@playwright/test');

test.describe('📸 TikTok Quality Screenshots', () => {

  test('Full app screenshot - TikTok For You page style', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await page.waitForSelector('.video-slide', { timeout: 5000 });
    await page.waitForTimeout(2000); // Let UI settle

    // Full page screenshot
    await page.screenshot({
      path: 'screenshots/current/tiktok-for-you-page.png',
      fullPage: false
    });

    console.log('✅ Screenshot saved: screenshots/current/tiktok-for-you-page.png');
  });

  test('Stories bar screenshot - Instagram style', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await page.waitForSelector('.stories-bar', { timeout: 5000 });

    const storiesBar = page.locator('.stories-bar');
    await storiesBar.screenshot({
      path: 'screenshots/current/instagram-stories-bar.png'
    });

    console.log('✅ Screenshot saved: screenshots/current/instagram-stories-bar.png');
  });

  test('Video with subtitles screenshot', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await page.waitForSelector('video', { timeout: 5000 });
    await page.waitForTimeout(3000); // Wait for subtitles

    const firstSlide = page.locator('.video-slide').first();
    await firstSlide.screenshot({
      path: 'screenshots/current/video-with-subtitles.png'
    });

    console.log('✅ Screenshot saved: screenshots/current/video-with-subtitles.png');
  });

  test('Translation popup screenshot', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await page.waitForSelector('.video-slide', { timeout: 5000 });
    await page.waitForTimeout(2000);

    // Click a word to show translation
    const subtitleWord = page.locator('.subtitle-word').first();

    if (await subtitleWord.count() > 0) {
      await subtitleWord.click();
      await page.waitForSelector('.translation-popup', { timeout: 3000 });

      await page.screenshot({
        path: 'screenshots/current/translation-popup.png'
      });

      console.log('✅ Screenshot saved: screenshots/current/translation-popup.png');
    } else {
      console.log('⚠️ No subtitle words to click');
    }
  });

  test('Engagement buttons screenshot - TikTok style', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await page.waitForSelector('.engagement-bar', { timeout: 5000 });

    const engagementBar = page.locator('.engagement-bar').first();
    await engagementBar.screenshot({
      path: 'screenshots/current/engagement-buttons.png'
    });

    console.log('✅ Screenshot saved: screenshots/current/engagement-buttons.png');
  });
});
