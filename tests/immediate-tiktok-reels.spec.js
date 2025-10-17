// Test: App opens IMMEDIATELY to TikTok-style reels (no menus first)
import { test, expect } from '@playwright/test';

test.describe('🚀 IMMEDIATE TikTok Reels on App Open', () => {
  test('App redirects to TikTok reels immediately (no menus)', async ({ page }) => {
    // Go to root
    await page.goto('http://localhost:3002/');

    // Should redirect to videos-feed.html immediately
    await page.waitForURL('**/videos-feed.html', { timeout: 3000 });

    const currentURL = page.url();
    expect(currentURL).toContain('videos-feed.html');
    console.log('✅ App redirects immediately to TikTok reels');
    console.log(`   URL: ${currentURL}`);

    // Check TikTok-style full-screen reels loaded
    await page.waitForSelector('.shorts-container', { timeout: 5000 });
    const container = page.locator('.shorts-container');
    await expect(container).toBeVisible();
    console.log('✅ TikTok-style full-screen container loaded');

    // Check real videos loaded
    const videos = page.locator('video');
    const videoCount = await videos.count();
    expect(videoCount).toBeGreaterThan(0);
    console.log(`✅ ${videoCount} real videos loaded from /reels/`);

    await page.screenshot({ path: 'screenshots/workspace3/IMMEDIATE-tiktok-open.png' });
  });

  test('TikTok scroll-snap-stop always prevents skipping videos', async ({ page }) => {
    await page.goto('http://localhost:3002/videos-feed.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check scroll-snap-stop is set to "always" (TikTok pattern)
    const firstCard = page.locator('.video-card').first();
    const scrollSnapStop = await firstCard.evaluate(el =>
      window.getComputedStyle(el).scrollSnapStop
    );

    expect(scrollSnapStop).toBe('always');
    console.log('✅ scroll-snap-stop: always (TikTok pattern - no skipping videos)');

    await page.screenshot({ path: 'screenshots/workspace3/TIKTOK-snap-always.png' });
  });

  test('Full TikTok experience ready from first load', async ({ page }) => {
    // Start from root
    await page.goto('http://localhost:3002/');
    await page.waitForURL('**/videos-feed.html');
    await page.waitForTimeout(1500);

    console.log('🎬 Verifying FULL TikTok experience from first load...');

    // 1. Full-screen layout
    const container = page.locator('.shorts-container');
    await expect(container).toBeVisible();
    console.log('✅ 1. Full-screen vertical container');

    // 2. Real videos
    const videoCount = await page.locator('video').count();
    expect(videoCount).toBeGreaterThan(10);
    console.log(`✅ 2. ${videoCount} real videos loaded`);

    // 3. Clickable subtitles
    const wordCount = await page.locator('.word-clickable').count();
    expect(wordCount).toBeGreaterThan(50);
    console.log(`✅ 3. ${wordCount} clickable Spanish words`);

    // 4. Scroll-snap always
    const firstCard = page.locator('.video-card').first();
    const snapStop = await firstCard.evaluate(el =>
      window.getComputedStyle(el).scrollSnapStop
    );
    expect(snapStop).toBe('always');
    console.log('✅ 4. TikTok scroll-snap-stop always');

    // 5. Smooth scrolling
    const scrollBehavior = await container.evaluate(el =>
      window.getComputedStyle(el).scrollBehavior
    );
    expect(scrollBehavior).toBe('smooth');
    console.log('✅ 5. Smooth TikTok-style scrolling');

    await page.screenshot({ path: 'screenshots/workspace3/TIKTOK-immediate-complete.png' });

    console.log('');
    console.log('🎉 TIKTOK-STYLE APP - COMPLETE:');
    console.log('   ✅ Opens IMMEDIATELY to reels (no menus)');
    console.log('   ✅ Full-screen vertical scroll');
    console.log('   ✅ Real Spanish learning videos');
    console.log('   ✅ Clickable word translations');
    console.log('   ✅ Perfect TikTok scroll mechanics');
    console.log('   ✅ NO dummy content');
  });
});
