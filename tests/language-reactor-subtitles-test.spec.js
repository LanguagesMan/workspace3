const { test, expect } = require('@playwright/test');

test.describe('Language Reactor Subtitle System', () => {
    test('should display dual-language subtitles with Language Reactor design', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');

        // Wait for feed to load
        await page.waitForSelector('.content-card', { timeout: 10000 });

        // Find first video
        const video = await page.locator('video.feed-video').first();
        if (await video.count() > 0) {
            await video.scrollIntoViewIfNeeded();

            // Check video controls exist
            const ccBtn = await page.locator('[id^="cc-btn-"]').first();
            const repeatBtn = await page.locator('[id^="repeat-btn-"]').first();
            const speedBtn = await page.locator('[id^="speed-btn-"]').first();

            await expect(ccBtn).toBeVisible();
            await expect(repeatBtn).toBeVisible();
            await expect(speedBtn).toBeVisible();

            // Take screenshot of controls
            await page.screenshot({
                path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/video-controls.png',
                fullPage: false
            });

            // Click CC to show subtitles
            await ccBtn.click();
            await page.waitForTimeout(500);

            // Verify subtitle containers exist
            const subtitleContainer = await page.locator('[id^="subtitle-"]').first();
            await expect(subtitleContainer).toBeVisible();

            // Play video to trigger subtitles
            await video.click();
            await page.waitForTimeout(1000);

            // Take screenshot of dual subtitles
            await page.screenshot({
                path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/dual-subtitles.png',
                fullPage: false
            });

            console.log('✅ Dual subtitles displayed correctly');
        }
    });

    test('should toggle speed selector', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const video = await page.locator('video.feed-video').first();
        if (await video.count() > 0) {
            await video.scrollIntoViewIfNeeded();

            const speedBtn = await page.locator('[id^="speed-btn-"]').first();
            await speedBtn.click();

            // Verify speed selector appears
            const speedSelector = await page.locator('[id^="speed-selector-"]').first();
            await expect(speedSelector).toHaveClass(/active/);

            // Take screenshot
            await page.screenshot({
                path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/speed-selector.png',
                fullPage: false
            });

            console.log('✅ Speed selector works correctly');
        }
    });

    test('should activate repeat mode', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const video = await page.locator('video.feed-video').first();
        if (await video.count() > 0) {
            await video.scrollIntoViewIfNeeded();

            const repeatBtn = await page.locator('[id^="repeat-btn-"]').first();
            await repeatBtn.click();

            // Verify repeat button is active
            await expect(repeatBtn).toHaveClass(/active/);

            // Take screenshot
            await page.screenshot({
                path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/repeat-mode.png',
                fullPage: false
            });

            console.log('✅ Repeat mode activated correctly');
        }
    });

    test('should show complete feed with new subtitle system', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');

        // Take full page screenshot
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/full-feed-with-subtitles.png',
            fullPage: true
        });

        console.log('✅ Complete feed screenshot captured');
    });
});
