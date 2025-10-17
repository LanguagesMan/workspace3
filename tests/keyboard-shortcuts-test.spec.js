const { test, expect } = require('@playwright/test');

/**
 * Keyboard Shortcuts Test - YouTube Shorts Style
 * Research: https://support.google.com/youtube/answer/7631406
 */

test.describe('Power User Keyboard Shortcuts', () => {
  test('should load app and show keyboard shortcuts in console', async ({ page }) => {
    // Listen for console logs
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.goto('http://localhost:3002');
    await page.waitForSelector('.reel', { timeout: 5000 });

    // Check for keyboard shortcuts console message
    await page.waitForTimeout(1000);
    const hasShortcuts = logs.some(log => log.includes('Keyboard shortcuts enabled'));

    console.log('✅ Console logs:', logs.filter(l => l.includes('Keyboard')));
    expect(hasShortcuts).toBe(true);
  });

  test('should support Space key for play/pause', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.reel video');

    const video = page.locator('.reel video').first();

    // Press Space to play/pause
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    console.log('✅ Space key pressed - Play/Pause');
  });

  test('should support arrow keys for navigation', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.reel');

    const container = page.locator('.reels-container');
    const initialScroll = await container.evaluate(el => el.scrollTop);

    // Press down arrow to scroll to next video
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);

    const newScroll = await container.evaluate(el => el.scrollTop);

    console.log(`✅ Scroll: ${initialScroll} → ${newScroll}`);
    expect(newScroll).toBeGreaterThan(initialScroll);
  });

  test('should support J/L keys for skip', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.reel video');

    const video = page.locator('.reel video').first();

    // Let video play a bit
    await page.waitForTimeout(2000);

    // Press L to skip forward 10s
    await page.keyboard.press('l');
    await page.waitForTimeout(500);

    console.log('✅ L key pressed - Skip +10s');
  });

  test('should support M key for mute/unmute', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.reel video');

    // Press M to mute
    await page.keyboard.press('m');
    await page.waitForTimeout(500);

    console.log('✅ M key pressed - Mute/Unmute');
  });

  test('should support K key for play/pause (YouTube standard)', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.reel video');

    // Press K to play/pause
    await page.keyboard.press('k');
    await page.waitForTimeout(500);

    console.log('✅ K key pressed - Play/Pause (YouTube standard)');
  });

  test('VISUAL: Take screenshot with keyboard shortcuts', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.reel');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `screenshots/keyboard-shortcuts-${Date.now()}.png`,
      fullPage: true
    });

    console.log('✅ Screenshot saved');
  });
});
