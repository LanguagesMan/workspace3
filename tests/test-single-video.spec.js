/**
 * Test single video loading to isolate the issue
 */

const { test } = require('@playwright/test');

test('Test different video URL formats', async ({ page }) => {
    page.on('console', msg => console.log(`Browser: ${msg.text()}`));

    await page.goto('http://localhost:3002/test-single-video.html');
    await page.waitForTimeout(5000);

    const video1Status = await page.locator('#video1').evaluate(v => ({
        readyState: v.readyState,
        networkState: v.networkState,
        error: v.error ? { code: v.error.code, message: v.error.message } : null,
        src: v.currentSrc
    }));

    const video2Status = await page.locator('#video2').evaluate(v => ({
        readyState: v.readyState,
        networkState: v.networkState,
        error: v.error ? { code: v.error.code, message: v.error.message } : null,
        src: v.currentSrc
    }));

    const video3Status = await page.locator('#video3').evaluate(v => ({
        readyState: v.readyState,
        networkState: v.networkState,
        error: v.error ? { code: v.error.code, message: v.error.message } : null,
        src: v.currentSrc
    }));

    console.log('\n=== VIDEO 1 (Direct path with spaces) ===');
    console.log(JSON.stringify(video1Status, null, 2));

    console.log('\n=== VIDEO 2 (URL-encoded) ===');
    console.log(JSON.stringify(video2Status, null, 2));

    console.log('\n=== VIDEO 3 (Reel without spaces) ===');
    console.log(JSON.stringify(video3Status, null, 2));

    await page.screenshot({ path: `screenshots/video-format-test-${Date.now()}.png` });
});
