/**
 * Test speed control persistence across video navigation
 * User reported: "if I do slowing down the video and I'm going to another video,
 * it doesn't continue playing. It should continue playing even when I go to
 * another video on half speed or so"
 */

const { test, expect } = require('@playwright/test');

test.describe('🎬 Speed Control Persistence', () => {
    test('should persist playback speed when scrolling to next video', async ({ page }) => {
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForTimeout(3000); // Wait for videos to load

        // Get first video
        const firstVideo = page.locator('.video-card').first().locator('video');

        // Check initial speed (should be 1x)
        const initialSpeed = await firstVideo.evaluate(v => v.playbackRate);
        console.log(`📊 Initial speed: ${initialSpeed}x`);
        expect(initialSpeed).toBe(1);

        // Find and click speed button
        const speedBtn = page.locator('.video-card').first().locator('.speed-btn, button:has-text("1x"), button:has-text("1.0x")').first();

        // Click speed button to change to 0.5x (assuming cycle: 1x → 0.5x → 0.75x → 1.25x → 1.5x → 2x)
        await speedBtn.click();
        await page.waitForTimeout(500);

        // Verify speed changed on first video
        const newSpeed = await firstVideo.evaluate(v => v.playbackRate);
        console.log(`📊 Speed after clicking button: ${newSpeed}x`);
        expect(newSpeed).not.toBe(1);

        // Check localStorage was updated
        const storedSpeed = await page.evaluate(() => localStorage.getItem('playbackSpeed'));
        console.log(`💾 Speed in localStorage: ${storedSpeed}x`);
        expect(storedSpeed).toBe(newSpeed.toString());

        // Check how many videos exist BEFORE scrolling
        const videosBeforeScroll = await page.locator('.video-card').count();
        console.log(`📹 Videos in DOM before scroll: ${videosBeforeScroll}`);

        // Scroll to second video
        await page.evaluate(() => {
            const secondCard = document.querySelectorAll('.video-card')[1];
            if (secondCard) {
                console.log('🔄 Scrolling to second video...');
                secondCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        await page.waitForTimeout(2000); // Wait for scroll and video to start playing

        // Check how many videos exist AFTER scrolling
        const videosAfterScroll = await page.locator('.video-card').count();
        console.log(`📹 Videos in DOM after scroll: ${videosAfterScroll}`);

        // Get second video and check its speed
        const secondVideo = page.locator('.video-card').nth(1).locator('video');
        const secondVideoSpeed = await secondVideo.evaluate(v => v.playbackRate);
        console.log(`📊 Second video speed: ${secondVideoSpeed}x`);

        // THIS IS THE CRITICAL TEST: Second video should have the same speed
        expect(secondVideoSpeed).toBe(newSpeed);

        console.log(`✅ Speed persisted from ${newSpeed}x on video 1 to ${secondVideoSpeed}x on video 2`);
    });

    test('should apply saved speed from localStorage on page load', async ({ page }) => {
        // Set speed in localStorage before loading page
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.evaluate(() => localStorage.setItem('playbackSpeed', '0.5'));

        // Reload page
        await page.reload();
        await page.waitForTimeout(3000);

        // Check first video speed
        const firstVideo = page.locator('.video-card').first().locator('video');
        const speed = await firstVideo.evaluate(v => v.playbackRate);

        console.log(`📊 Video speed after reload with localStorage=0.5: ${speed}x`);
        expect(speed).toBe(0.5);
    });

    test('should apply same speed to all videos when changed', async ({ page }) => {
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForTimeout(3000);

        // Click speed button on first video
        const speedBtn = page.locator('.video-card').first().locator('.speed-btn, button:has-text("1x"), button:has-text("1.0x")').first();
        await speedBtn.click();
        await page.waitForTimeout(500);

        // Get speed from first video
        const firstVideo = page.locator('.video-card').first().locator('video');
        const targetSpeed = await firstVideo.evaluate(v => v.playbackRate);
        console.log(`🎯 Target speed: ${targetSpeed}x`);

        // Check all visible videos have the same speed
        const allVideos = page.locator('.video-card video');
        const count = await allVideos.count();
        console.log(`📹 Checking ${count} videos...`);

        for (let i = 0; i < Math.min(count, 5); i++) {
            const videoSpeed = await allVideos.nth(i).evaluate(v => v.playbackRate);
            console.log(`  Video ${i + 1}: ${videoSpeed}x`);
            expect(videoSpeed).toBe(targetSpeed);
        }

        console.log(`✅ All videos have speed ${targetSpeed}x`);
    });
});
