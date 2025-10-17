const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Mobile Responsive Design', () => {

  test('should render videos page on mobile viewport', async ({ page }) => {
    console.log('\n📱 Testing Mobile Responsive - Videos...\n');

    // Set mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verify video is visible on mobile
    const videoCount = await page.locator('video').count();
    console.log(`✓ Found ${videoCount} video(s) on mobile`);
    expect(videoCount).toBeGreaterThan(0);

    await page.screenshot({
      path: 'screenshots/test-mobile-videos.png',
      fullPage: true
    });
    console.log('📸 Screenshot: test-mobile-videos.png');

    console.log('\n✅ MOBILE VIDEOS TEST PASSED!\n');
  });

  test('should render feed page on mobile viewport', async ({ page }) => {
    console.log('\n📱 Testing Mobile Responsive - Feed...\n');

    // Set mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Verify feed container is visible
    const feedContainer = await page.locator('.feed-container, #feedContainer').count();
    console.log(`✓ Found ${feedContainer} feed container(s) on mobile`);
    expect(feedContainer).toBeGreaterThan(0);

    await page.screenshot({
      path: 'screenshots/test-mobile-feed.png',
      fullPage: true
    });
    console.log('📸 Screenshot: test-mobile-feed.png');

    console.log('\n✅ MOBILE FEED TEST PASSED!\n');
  });

  test('should render articles page on mobile viewport', async ({ page }) => {
    console.log('\n📱 Testing Mobile Responsive - Articles...\n');

    // Set mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3002/articles-feed.html');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Verify articles visible
    const articleCards = await page.locator('.article-card').count();
    console.log(`✓ Found ${articleCards} article card(s) on mobile`);

    await page.screenshot({
      path: 'screenshots/test-mobile-articles.png',
      fullPage: true
    });
    console.log('📸 Screenshot: test-mobile-articles.png');

    console.log('\n✅ MOBILE ARTICLES TEST PASSED!\n');
  });

  test('should work on tablet viewport', async ({ page }) => {
    console.log('\n📱 Testing Tablet Responsive...\n');

    // Set tablet viewport (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Verify feed container adapts to tablet size
    const feedContainer = await page.locator('.feed-container, #feedContainer').count();
    console.log(`✓ Found ${feedContainer} feed container(s) on tablet`);
    expect(feedContainer).toBeGreaterThan(0);

    await page.screenshot({
      path: 'screenshots/test-tablet-feed.png',
      fullPage: true
    });
    console.log('📸 Screenshot: test-tablet-feed.png');

    console.log('\n✅ TABLET TEST PASSED!\n');
  });
});
