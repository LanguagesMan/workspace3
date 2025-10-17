// Quick state check for workspace3
const { test, expect } = require('@playwright/test');

test.describe('Current State Check', () => {
  test('should load apple-feed.html and capture state', async ({ page }) => {
    // Navigate to apple-feed
    await page.goto('http://localhost:3002/apple-feed.html');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'screenshots/CURRENT-STATE.png',
      fullPage: true
    });

    console.log('✅ Current state captured');
  });
});
