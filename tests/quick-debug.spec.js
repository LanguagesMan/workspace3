const { test, expect } = require('@playwright/test');

test('Debug video loading', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Wait for page load
    await page.waitForTimeout(5000);

    const loadingVisible = await page.locator('.loading').isVisible();
    const reelsCount = await page.locator('.reel').count();

    console.log('Loading visible:', loadingVisible);
    console.log('Reels rendered:', reelsCount);

    if (reelsCount > 0) {
        console.log('✅ Videos ARE rendering!');
        const firstReel = page.locator('.reel').first();
        const videoSrc = await firstReel.locator('video').getAttribute('src');
        console.log('First video src:', videoSrc);
    } else {
        console.log('❌ No videos rendered - stuck on loading');
    }
});
