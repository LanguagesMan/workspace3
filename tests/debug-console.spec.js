const { test } = require('@playwright/test');

test('capture console logs', async ({ page }) => {
    const logs = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => logs.push(`ERROR: ${err.message}`));
    
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log('\n=== BROWSER CONSOLE LOGS ===');
    logs.forEach(log => console.log(log));
    
    // Check video element
    const videoSrc = await page.evaluate(() => {
        const video = document.querySelector('video');
        return {
            exists: !!video,
            src: video?.src,
            readyState: video?.readyState,
            videoWidth: video?.videoWidth,
            videoHeight: video?.videoHeight,
            paused: video?.paused,
            muted: video?.muted,
            error: video?.error?.message
        };
    });
    
    console.log('\n=== VIDEO ELEMENT ===');
    console.log(JSON.stringify(videoSrc, null, 2));
});
