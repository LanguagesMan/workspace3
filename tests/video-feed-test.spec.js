const { test, expect } = require('@playwright/test');

test.describe('📹 VIDEO FEED TEST SUITE', () => {

  test('should load video feed page and display videos', async ({ page }) => {
    console.log('\n📹 TESTING: Video Feed Page');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/video-feed.html');
    await page.waitForTimeout(3000); // Wait for videos to load

    // Check header
    const header = await page.locator('.header').count();
    console.log(`✓ Header: ${header > 0 ? 'YES' : 'NO'}`);

    // Check video items
    const videoItems = await page.locator('.video-item').count();
    console.log(`✓ Video items loaded: ${videoItems}`);

    // Check first video
    const firstVideo = await page.locator('video').first();
    const videoSrc = await firstVideo.getAttribute('src');
    console.log(`✓ First video source: ${videoSrc}`);

    // Check subtitle overlay exists
    const subtitleOverlay = await page.locator('.subtitle-overlay').first().count();
    console.log(`✓ Subtitle overlay: ${subtitleOverlay > 0 ? 'YES' : 'NO'}`);

    // Check speed controls
    const speedControls = await page.locator('.control-btn').count();
    console.log(`✓ Speed control buttons: ${speedControls}`);

    // Check side actions
    const sideActions = await page.locator('.action-btn').count();
    console.log(`✓ Action buttons: ${sideActions}`);

    // Screenshot full page
    await page.screenshot({ path: 'screenshots/VIDEO-FEED-full.png', fullPage: false });
    console.log('📸 Screenshot: VIDEO-FEED-full.png');

    expect(videoItems).toBeGreaterThan(0);
    expect(speedControls).toBeGreaterThan(0);

    console.log('\n✅ VIDEO FEED TEST PASSED!');
  });

  test('should test speed controls', async ({ page }) => {
    console.log('\n⚡ TESTING: Video Speed Controls');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/video-feed.html');
    await page.waitForTimeout(3000);

    // Click different speed buttons
    const speeds = ['0.5x', '0.75x', '1x', '1.25x', '1.5x'];

    for (const speed of speeds) {
      const btn = page.locator('.control-btn').filter({ hasText: speed }).first();
      await btn.click();
      await page.waitForTimeout(300);
      console.log(`✓ Clicked speed: ${speed}`);
    }

    await page.screenshot({ path: 'screenshots/VIDEO-FEED-speed-controls.png' });
    console.log('📸 Screenshot: VIDEO-FEED-speed-controls.png');

    console.log('\n✅ SPEED CONTROLS TEST PASSED!');
  });

  test('should test mobile responsive view', async ({ page }) => {
    console.log('\n📱 TESTING: Mobile Responsive Video Feed');
    console.log('='.repeat(60));

    // Mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3002/video-feed.html');
    await page.waitForTimeout(3000);

    const videoItems = await page.locator('.video-item').count();
    console.log(`✓ Videos on mobile: ${videoItems}`);

    await page.screenshot({ path: 'screenshots/VIDEO-FEED-mobile.png', fullPage: false });
    console.log('📸 Screenshot: VIDEO-FEED-mobile.png');

    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3002/video-feed.html');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'screenshots/VIDEO-FEED-tablet.png', fullPage: false });
    console.log('📸 Screenshot: VIDEO-FEED-tablet.png');

    console.log('\n✅ RESPONSIVE TEST PASSED!');
  });

  test('should verify API returns videos with subtitles', async ({ page }) => {
    console.log('\n🎬 TESTING: Video API Endpoint');
    console.log('='.repeat(60));

    await page.goto('http://localhost:3002/video-feed.html');

    const apiData = await page.evaluate(async () => {
      const res = await fetch('/api/videos/with-subtitles');
      return await res.json();
    });

    console.log(`✓ API Success: ${apiData.success ? 'YES' : 'NO'}`);
    console.log(`✓ Videos with subtitles: ${apiData.count}`);
    console.log(`✓ Sample video: ${apiData.videos[0]?.title}`);

    expect(apiData.success).toBe(true);
    expect(apiData.count).toBeGreaterThan(0);

    console.log('\n✅ API TEST PASSED!');
  });

});
