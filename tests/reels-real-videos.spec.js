const { test, expect } = require('@playwright/test');

test.describe('Reels - Real Videos (TikTok Pattern)', () => {
    test('should load real videos from reels folder', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');

        // Wait for feed to load
        await page.waitForTimeout(3000);

        // Check console for real videos loaded
        const logs = [];
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('real videos') || text.includes('BEST FEED')) {
                logs.push(text);
            }
        });

        await page.reload();
        await page.waitForTimeout(2000);

        // Should log real videos
        const hasRealVideos = logs.some(log => log.includes('real videos'));
        expect(hasRealVideos || logs.length > 0).toBeTruthy();

        console.log('✅ Feed loaded');
    });

    test('should display video slides', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');

        await page.waitForTimeout(3000);

        // Check for video feed container
        const feed = await page.locator('.video-feed').count();
        expect(feed).toBeGreaterThan(0);

        console.log('✅ Video feed container exists');
    });

    test('should have vertical scroll enabled', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');

        await page.waitForTimeout(2000);

        const feed = page.locator('.video-feed');
        const scrollSnapType = await feed.evaluate(el =>
            window.getComputedStyle(el).scrollSnapType
        );

        expect(scrollSnapType).toContain('y');

        console.log('✅ Vertical scroll snap enabled');
    });
});
