const { test, expect } = require('@playwright/test');

test('screenshot new 2025 glassmorphism design', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Wait for content to load
    await page.waitForTimeout(3000);

    // Take full-page screenshot
    await page.screenshot({
        path: 'screenshots/design-2025-glassmorphism-' + Date.now() + '.png',
        fullPage: true
    });

    console.log('✅ Screenshot saved to screenshots/');
});
