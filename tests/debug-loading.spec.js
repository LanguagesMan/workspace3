const { test, expect } = require('@playwright/test');

test('Debug eternal loading on tiktok-video-feed', async ({ page }) => {
    console.log('\n🔍 Debugging eternal loading...\n');

    // Listen to console messages
    page.on('console', msg => console.log(`  Browser: ${msg.text()}`));
    page.on('pageerror', err => console.error(`  Error: ${err.message}`));

    await page.goto('http://localhost:3001/tiktok-video-feed.html');

    // Wait 5 seconds
    await page.waitForTimeout(5000);

    // Check loading state
    const loadingVisible = await page.locator('#loading').isVisible();
    const skeletonVisible = await page.locator('#skeletonScreen').isVisible();
    const videoCount = await page.locator('video').count();

    console.log(`  Loading visible: ${loadingVisible}`);
    console.log(`  Skeleton visible: ${skeletonVisible}`);
    console.log(`  Videos loaded: ${videoCount}`);

    await page.screenshot({ path: 'screenshots/debug-eternal-loading.png', fullPage: true });
});
