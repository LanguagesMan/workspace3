const { test, expect } = require('@playwright/test');

test('🌐 Real browser: Video playback test', async ({ page }) => {
    await page.goto('http://localhost:3002/test-video-playback.html');

    // Wait for video element
    const video = await page.locator('#testVideo');
    await video.waitFor({ state: 'visible' });

    // Wait up to 10 seconds for metadata to load
    await page.waitForFunction(() => {
        const v = document.getElementById('testVideo');
        return v.readyState >= 1 || v.error !== null;
    }, { timeout: 10000 }).catch(() => {});

    // Get final status
    const statusText = await page.locator('#status').textContent();
    const propsText = await page.locator('#props').textContent();

    console.log('\n📊 Test Page Status:');
    console.log(statusText);
    console.log('\n📹 Video Properties:');
    console.log(propsText);

    const props = JSON.parse(propsText);

    if (props.error) {
        console.log('\n❌ VIDEO ERROR:', props.error.message);
        console.log('Error Code:', props.error.code);
    } else if (props.readyState.includes('METADATA') || props.readyState.includes('ENOUGH_DATA')) {
        console.log('\n✅ VIDEO WORKS IN REAL BROWSER!');
    }

    // Take screenshot
    await page.screenshot({ path: '/Users/mindful/_projects/workspace3/screenshots/video-test-result.png' });
    console.log('\n📸 Screenshot saved to: screenshots/video-test-result.png');
});
