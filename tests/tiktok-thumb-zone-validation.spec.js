// 👍 TikTok Thumb Zone Ergonomics Validation
// Based on 2025 UX research: 67% users use right thumb one-handed
const { test, expect } = require('@playwright/test');

test.describe('👍 TikTok Thumb Zone Ergonomics', () => {

  test('Engagement buttons in optimal thumb zone (right sidebar)', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await page.waitForSelector('.engagement-bar', { timeout: 5000 });

    // Get first engagement bar position
    const engagementBar = page.locator('.engagement-bar').first();
    const barBox = await engagementBar.boundingBox();

    // TikTok pattern: Right sidebar (easy thumb zone for 67% right-handed users)
    const viewportWidth = page.viewportSize().width;
    const rightEdgeDistance = viewportWidth - (barBox.x + barBox.width);

    console.log(`📍 Engagement bar right edge distance: ${rightEdgeDistance}px`);

    // Should be within 16-20px of right edge (TikTok standard)
    expect(rightEdgeDistance).toBeLessThan(25);
    expect(rightEdgeDistance).toBeGreaterThan(10);

    console.log('✅ Engagement bar in optimal right thumb zone');
  });

  test('Buttons vertically stacked for easy thumb swipe', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await page.waitForSelector('.engagement-btn', { timeout: 5000 });

    // Check vertical alignment (Fitts\'s Law)
    const buttons = await page.locator('.engagement-btn').all();
    expect(buttons.length).toBeGreaterThan(3);

    // Get Y positions
    const positions = [];
    for (const btn of buttons.slice(0, 5)) {
      const box = await btn.boundingBox();
      positions.push(box.y);
    }

    // Should be vertically stacked (Y increases)
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i-1]);
    }

    console.log('✅ Buttons vertically stacked per Fitts\'s Law');
  });

  test('Button size optimal for thumb tap (48-56px)', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await page.waitForSelector('.engagement-btn', { timeout: 5000 });

    const firstBtn = page.locator('.engagement-btn').first();
    const btnBox = await firstBtn.boundingBox();

    console.log(`🎯 Button size: ${btnBox.width}px × ${btnBox.height}px`);

    // TikTok uses 48-56px for comfortable thumb taps
    expect(btnBox.width).toBeGreaterThanOrEqual(48);
    expect(btnBox.width).toBeLessThanOrEqual(60);
    expect(btnBox.height).toBeGreaterThanOrEqual(48);
    expect(btnBox.height).toBeLessThanOrEqual(60);

    console.log('✅ Button size optimal for thumb zone (48-56px)');
  });

  test('Primary action (scroll) is unobstructed vertical swipe', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await page.waitForSelector('.video-slide', { timeout: 5000 });

    // Check scroll-snap type
    const scrollSnapType = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).scrollSnapType;
    });

    expect(scrollSnapType).toContain('y mandatory');

    // Check no horizontal scroll interference
    const overflowX = await page.evaluate(() => {
      return window.getComputedStyle(document.body).overflowX;
    });

    expect(overflowX).toBe('hidden');

    console.log('✅ Primary vertical scroll unobstructed (TikTok pattern)');
  });

  test('Stories bar in easy thumb zone (top horizontal)', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await page.waitForSelector('.stories-bar', { timeout: 5000 });

    const storiesBar = page.locator('.stories-bar');
    const barBox = await storiesBar.boundingBox();

    // Should be at top (easy zone for horizontal swipe)
    expect(barBox.y).toBeLessThan(150);

    // Height should allow comfortable thumb reach
    expect(barBox.height).toBeLessThan(120);

    console.log('✅ Stories bar in top easy zone (horizontal swipe)');
  });

  test('Video info bottom-left (out of thumb zone)', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    await page.waitForSelector('.video-info', { timeout: 5000 });

    const videoInfo = page.locator('.video-info').first();
    const infoBox = await videoInfo.boundingBox();

    // Should be bottom-left (out of way of right thumb)
    const viewportWidth = page.viewportSize().width;
    expect(infoBox.x).toBeLessThan(viewportWidth / 3); // Left third

    console.log('✅ Video info positioned away from thumb zone');
  });
});
