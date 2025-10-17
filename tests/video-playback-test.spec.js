/**
 * 🎬 VIDEO PLAYBACK TEST - Core Functionality
 */

const { test, expect } = require('@playwright/test');

test.describe('🎬 Video Playback - CORE TEST', () => {

    test('✅ Videos load without 404 errors', async ({ page }) => {
        const errors = [];
        const videoRequests = [];

        page.on('response', response => {
            if (response.url().includes('.mp4')) {
                videoRequests.push({
                    url: response.url(),
                    status: response.status(),
                    ok: response.ok()
                });

                if (!response.ok()) {
                    errors.push({
                        url: response.url(),
                        status: response.status()
                    });
                }
            }
        });

        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(5000);

        console.log(`\n📹 Video requests: ${videoRequests.length}`);
        videoRequests.slice(0, 5).forEach((req, i) => {
            const status = req.ok ? '✅' : '❌';
            console.log(`  ${status} ${req.status} - ${req.url.split('/').pop()}`);
        });

        if (errors.length > 0) {
            console.log(`\n❌ Failed requests: ${errors.length}`);
        }

        expect(errors.length).toBe(0);
    });

    test('✅ Videos can be played', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);

        const videos = await page.locator('video.feed-video');
        const videoCount = await videos.count();

        console.log(`\n🎬 Testing ${videoCount} videos...`);

        if (videoCount > 0) {
            const firstVideo = videos.first();
            await firstVideo.waitFor({ state: 'visible' });

            const duration = await firstVideo.evaluate(v => v.duration);
            const hasValidDuration = !isNaN(duration) && duration > 0;

            console.log(`  Duration: ${hasValidDuration ? duration.toFixed(2) + 's' : 'Invalid'}`);
            expect(hasValidDuration).toBe(true);
        }
    });
});
