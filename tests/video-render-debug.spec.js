const { test, expect } = require('@playwright/test');

test('Debug video rendering issue', async ({ page }) => {
    // Capture console logs
    page.on('console', msg => {
        console.log(`BROWSER: ${msg.type()}: ${msg.text()}`);
    });

    // Capture errors
    page.on('pageerror', error => {
        console.log(`❌ PAGE ERROR: ${error.message}`);
    });

    console.log('🔍 Loading page...');
    await page.goto('http://localhost:3001/tiktok-video-feed.html');

    console.log('⏳ Waiting for video cards...');
    await page.waitForTimeout(5000);

    // Check how many video cards loaded
    const cardCount = await page.locator('.video-card').count();
    console.log(`📊 Video cards found: ${cardCount}`);

    if (cardCount > 0) {
        // Get first video element details
        const firstVideo = page.locator('.video-card').first().locator('video');

        const videoSrc = await firstVideo.getAttribute('src');
        console.log(`📹 Video src: ${videoSrc}`);

        const videoWidth = await firstVideo.evaluate(v => v.clientWidth);
        const videoHeight = await firstVideo.evaluate(v => v.clientHeight);
        console.log(`📐 Video dimensions: ${videoWidth}x${videoHeight}`);

        const readyState = await firstVideo.evaluate(v => v.readyState);
        console.log(`📊 Video readyState: ${readyState}`);

        const videoError = await firstVideo.evaluate(v => v.error ? v.error.message : null);
        console.log(`❌ Video error: ${videoError || 'none'}`);

        const networkError = await firstVideo.evaluate(v => v.networkState);
        console.log(`🌐 Network state: ${networkError}`);

        // Try to play the video
        console.log('▶️ Attempting to play video...');
        const playResult = await firstVideo.evaluate(async (v) => {
            try {
                await v.play();
                return 'success';
            } catch (e) {
                return `error: ${e.message}`;
            }
        });
        console.log(`▶️ Play result: ${playResult}`);

        // Check if video is actually playing
        await page.waitForTimeout(1000);
        const isPlaying = await firstVideo.evaluate(v => !v.paused && !v.ended && v.readyState > 2);
        console.log(`▶️ Video playing: ${isPlaying}`);
    }

    // Take screenshot for debugging
    await page.screenshot({ path: '/tmp/video-render-debug.png', fullPage: false });
    console.log('📸 Screenshot saved to /tmp/video-render-debug.png');
});
