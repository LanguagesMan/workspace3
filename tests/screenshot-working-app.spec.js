const { test } = require('@playwright/test');

test('Screenshot working app', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Wait for videos to load
    await page.waitForSelector('.reel', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/WORKING-APP-WITH-VIDEOS.png', fullPage: false });
    console.log('✅ Screenshot saved: screenshots/WORKING-APP-WITH-VIDEOS.png');
});
