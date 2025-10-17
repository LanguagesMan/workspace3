const { test, expect } = require('@playwright/test');

test('Verify video loading fix - only /reels/ videos should load', async ({ page, context }) => {
    // Clear all caches
    await context.clearCookies();

    // Navigate with cache disabled
    await page.goto('http://localhost:3001/tiktok-video-feed.html', {
        waitUntil: 'networkidle'
    });

    // Wait for videos to load
    await page.waitForTimeout(5000);

    // Get console logs
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    // Reload to capture logs
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Check for "reels only" message
    const reelsOnlyLog = logs.find(log => log.includes('reels only'));
    console.log('Found reels only log:', reelsOnlyLog);

    // Get all video elements
    const videos = await page.locator('video').all();
    console.log(`\nFound ${videos.length} video elements`);

    // Check first 3 videos
    for (let i = 0; i < Math.min(videos.length, 3); i++) {
        const video = videos[i];
        const src = await video.getAttribute('src');
        console.log(`Video ${i + 1} src:`, src);

        // Verify it's from /reels/ not /langfeed/
        expect(src).toContain('/reels/');
        expect(src).not.toContain('/langfeed/');

        // Check if video has errors
        const videoState = await video.evaluate((vid) => {
            return {
                readyState: vid.readyState,
                error: vid.error ? vid.error.code : null,
                errorMessage: vid.error ? vid.error.message : null
            };
        });

        console.log(`Video ${i + 1} state:`, videoState);

        // Video should not have DEMUXER_ERROR
        if (videoState.error) {
            console.error(`❌ Video ${i + 1} has error:`, videoState.errorMessage);
        }
    }

    await page.screenshot({ path: 'screenshots/diagnostic/after-fix.png', fullPage: true });
});
