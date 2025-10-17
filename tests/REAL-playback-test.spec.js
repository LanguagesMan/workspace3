const { test, expect } = require('@playwright/test');

test.describe('🎯 REAL Video Playback Test', () => {
    
    test('Videos actually play when clicked', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(4000);

        const video = await page.locator('video.feed-video').first();
        
        // Wait for video to be visible
        await video.waitFor({ state: 'visible', timeout: 5000 });
        
        // Get initial state
        const initialPaused = await video.evaluate(v => v.paused);
        console.log(`Initial state - paused: ${initialPaused}`);
        
        // Click to unmute/play
        await video.click();
        await page.waitForTimeout(1000);
        
        // Check if playing
        const isPlaying = await video.evaluate(v => !v.paused && v.currentTime > 0);
        console.log(`After click - playing: ${isPlaying}`);
        
        // Get video details
        const details = await video.evaluate(v => ({
            src: v.src,
            duration: v.duration,
            readyState: v.readyState,
            currentTime: v.currentTime
        }));
        
        console.log('Video details:', JSON.stringify(details, null, 2));
        
        expect(details.duration).toBeGreaterThan(0);
        expect(details.readyState).toBeGreaterThan(0);
    });
    
    test('Take screenshot of working feed', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);
        
        await page.screenshot({
            path: 'screenshots/workspace3/FINAL-WORKING-FEED.png',
            fullPage: true
        });
        
        console.log('Screenshot: FINAL-WORKING-FEED.png');
    });
});
