const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('TikTok Videos Page', () => {

  test('should load and display video feed', async ({ page }) => {
    console.log('\n🎥 Testing TikTok Videos Page...\n');

    // Navigate to videos page
    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Wait for initial render

    // Check for video elements
    const videoCount = await page.locator('video').count();
    console.log(`✓ Found ${videoCount} video element(s)`);
    expect(videoCount).toBeGreaterThan(0);

    // Take screenshot
    await page.screenshot({
      path: 'screenshots/test-tiktok-videos.png',
      fullPage: true
    });
    console.log('📸 Screenshot: test-tiktok-videos.png');

    console.log('\n✅ VIDEO FEED TEST PASSED!\n');
  });

  test('should have TikTok-style vertical scroll', async ({ page }) => {
    console.log('\n📜 Testing Vertical Scroll...\n');

    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Test scroll functionality
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(500);

    // Verify scroll-snap is working
    const scrollTop = await page.evaluate(() => window.scrollY);
    console.log(`✓ Scrolled to position: ${scrollTop}px`);
    expect(scrollTop).toBeGreaterThan(0);

    await page.screenshot({
      path: 'screenshots/test-tiktok-scroll.png',
      fullPage: true
    });
    console.log('📸 Screenshot: test-tiktok-scroll.png');

    console.log('\n✅ SCROLL TEST PASSED!\n');
  });

  test('should display transcription containers', async ({ page }) => {
    console.log('\n💬 Testing Transcriptions...\n');

    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // Wait for transcriptions to load

    // Check for transcription container
    const transcriptionCount = await page.locator('.transcription, .transcription-content').count();
    console.log(`✓ Found ${transcriptionCount} transcription container(s)`);
    expect(transcriptionCount).toBeGreaterThan(0);

    // Check for words if they exist (optional)
    const wordCount = await page.locator('.word, span[data-word]').count();
    console.log(`✓ Found ${wordCount} clickable word(s)`);

    await page.screenshot({
      path: 'screenshots/test-tiktok-transcriptions.png',
      fullPage: true
    });
    console.log('📸 Screenshot: test-tiktok-transcriptions.png');

    console.log('\n✅ TRANSCRIPTION TEST PASSED!\n');
  });

  test('should work on mobile viewport', async ({ page }) => {
    console.log('\n📱 Testing Mobile View...\n');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check video still visible on mobile
    const videoCount = await page.locator('video').count();
    console.log(`✓ Found ${videoCount} video(s) on mobile`);
    expect(videoCount).toBeGreaterThan(0);

    await page.screenshot({
      path: 'screenshots/test-tiktok-mobile.png',
      fullPage: true
    });
    console.log('📸 Screenshot: test-tiktok-mobile.png');

    console.log('\n✅ MOBILE TEST PASSED!\n');
  });
});
