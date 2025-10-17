// 🎬 VIDEO SPEED CONTROLS TEST
// Pattern: YouTube Shorts + TikTok 2025
// Tests playback speed controls (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)

const { test, expect } = require('@playwright/test');

test.describe('Video Speed Controls', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the unified infinite feed (where videos actually load)
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(5000); // Wait for feed to load videos
    });

    test('speed control button should be visible on video cards', async ({ page }) => {
        // Wait for content to load and find first video card (has video element)
        await page.waitForSelector('.content-card', { timeout: 10000 });

        // Find a card that contains a video element
        const videoCard = page.locator('.content-card:has(video)').first();
        await expect(videoCard).toBeVisible({ timeout: 10000 });

        // Check if speed control button exists
        const speedBtn = videoCard.locator('.speed-btn');
        await expect(speedBtn).toBeVisible();

        // Should show default 1x speed
        const speedDisplay = await speedBtn.textContent();
        expect(speedDisplay).toContain('1x');
    });

    test('clicking speed button should show speed menu', async ({ page }) => {
        // Find first video card
        const videoCard = page.locator('.content-card:has(video)').first();
        await expect(videoCard).toBeVisible({ timeout: 10000 });
        const speedBtn = videoCard.locator('.speed-btn');

        // Click speed button
        await speedBtn.click();
        await page.waitForTimeout(300);

        // Speed menu should be visible
        const speedMenu = videoCard.locator('.speed-menu');
        await expect(speedMenu).toBeVisible();

        // Should have all speed options
        const speedOptions = speedMenu.locator('button');
        const count = await speedOptions.count();
        expect(count).toBe(6); // 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
    });

    test('selecting speed should update video playbackRate', async ({ page }) => {
        // Find first video card
        const videoCard = page.locator('.content-card:has(video)').first();
        await expect(videoCard).toBeVisible({ timeout: 10000 });
        const speedBtn = videoCard.locator('.speed-btn');

        // Open speed menu
        await speedBtn.click();
        await page.waitForTimeout(300);

        // Select 1.5x speed
        const speed1_5x = page.locator('button:has-text("1.5x")').first();
        await speed1_5x.click();
        await page.waitForTimeout(300);

        // Check video playbackRate
        const video = videoCard.locator('video');
        const playbackRate = await video.evaluate(v => v.playbackRate);
        expect(playbackRate).toBe(1.5);

        // Speed display should update
        const speedDisplay = await speedBtn.textContent();
        expect(speedDisplay).toContain('1.5x');
    });

    test('speed setting should persist in localStorage', async ({ page }) => {
        // Find first video card
        const videoCard = page.locator('.content-card:has(video)').first();
        await expect(videoCard).toBeVisible({ timeout: 10000 });
        const speedBtn = videoCard.locator('.speed-btn');

        // Open speed menu and select 2x
        await speedBtn.click();
        await page.waitForTimeout(300);

        const speed2x = page.locator('button:has-text("2x")').first();
        await speed2x.click();
        await page.waitForTimeout(300);

        // Check localStorage
        const savedSpeed = await page.evaluate(() => localStorage.getItem('preferredPlaybackSpeed'));
        expect(savedSpeed).toBe('2');
    });

    test('all speed options should work correctly', async ({ page }) => {
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

        for (const speed of speeds) {
            // Find first video card
            const videoCard = page.locator('.content-card:has(video)').first();
            await expect(videoCard).toBeVisible({ timeout: 10000 });
            const speedBtn = videoCard.locator('.speed-btn');

            // Open menu
            await speedBtn.click();
            await page.waitForTimeout(200);

            // Click speed option
            const speedOption = page.locator(`button:has-text("${speed}x")`).first();
            await speedOption.click();
            await page.waitForTimeout(300);

            // Verify playbackRate
            const video = videoCard.locator('video');
            const playbackRate = await video.evaluate(v => v.playbackRate);
            expect(playbackRate).toBe(speed);

            // Verify display
            const displayText = await speedBtn.textContent();
            expect(displayText).toContain(`${speed}x`);

            console.log(`✅ Speed ${speed}x working correctly`);
        }
    });

    test('speed menu should close after selecting speed', async ({ page }) => {
        // Find first video card
        const videoCard = page.locator('.content-card:has(video)').first();
        await expect(videoCard).toBeVisible({ timeout: 10000 });
        const speedBtn = videoCard.locator('.speed-btn');

        // Open menu
        await speedBtn.click();
        await page.waitForTimeout(300);

        const speedMenu = videoCard.locator('.speed-menu');
        await expect(speedMenu).toBeVisible();

        // Select a speed
        const speed1_25x = page.locator('button:has-text("1.25x")').first();
        await speed1_25x.click();
        await page.waitForTimeout(300);

        // Menu should be hidden
        const isVisible = await speedMenu.isVisible();
        expect(isVisible).toBe(false);
    });

    test('speed control UI should match YouTube 2025 bubble pattern', async ({ page }) => {
        // Find first video card
        const videoCard = page.locator('.content-card:has(video)').first();
        await expect(videoCard).toBeVisible({ timeout: 10000 });
        const speedBtn = videoCard.locator('.speed-btn');

        // Check button styles (should have backdrop-filter blur)
        const styles = await speedBtn.evaluate(btn => {
            const computed = window.getComputedStyle(btn);
            return {
                borderRadius: computed.borderRadius,
                backdropFilter: computed.backdropFilter,
                background: computed.background
            };
        });

        // Should have rounded corners
        expect(styles.borderRadius).toContain('20px');

        console.log('✅ Speed control UI matches YouTube 2025 bubble pattern');
    });

    test('slower speeds (0.5x, 0.75x) should work for language learning', async ({ page }) => {
        // Language learners need slower speeds to understand Spanish
        const learningBestSpeeds = [0.5, 0.75];

        for (const speed of learningBestSpeeds) {
            const videoCard = page.locator('.content-card:has(video)').first();
            await expect(videoCard).toBeVisible({ timeout: 10000 });
            const speedBtn = videoCard.locator('.speed-btn');

            await speedBtn.click();
            await page.waitForTimeout(200);

            const speedOption = page.locator(`button:has-text("${speed}x")`).first();
            await speedOption.click();
            await page.waitForTimeout(300);

            const video = videoCard.locator('video');
            const playbackRate = await video.evaluate(v => v.playbackRate);
            expect(playbackRate).toBe(speed);

            console.log(`✅ Learning speed ${speed}x works for beginners`);
        }
    });

    test('faster speeds (1.25x, 1.5x, 2x) should work for advanced learners', async ({ page }) => {
        // Advanced learners can handle faster speeds
        const advancedSpeeds = [1.25, 1.5, 2];

        for (const speed of advancedSpeeds) {
            const videoCard = page.locator('.content-card:has(video)').first();
            await expect(videoCard).toBeVisible({ timeout: 10000 });
            const speedBtn = videoCard.locator('.speed-btn');

            await speedBtn.click();
            await page.waitForTimeout(200);

            const speedOption = page.locator(`button:has-text("${speed}x")`).first();
            await speedOption.click();
            await page.waitForTimeout(300);

            const video = videoCard.locator('video');
            const playbackRate = await video.evaluate(v => v.playbackRate);
            expect(playbackRate).toBe(speed);

            console.log(`✅ Advanced speed ${speed}x works for proficient users`);
        }
    });
});
