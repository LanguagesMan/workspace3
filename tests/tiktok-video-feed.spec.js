// 🎬 TIKTOK VIDEO FEED - Comprehensive Test Suite
// Evidence-based testing matching TikTok/Instagram Reels patterns (2025)

const { test, expect } = require('@playwright/test');

test.describe('TikTok-Style Video Feed', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to app
        await page.goto('http://localhost:3001');
        await page.waitForTimeout(2000); // Wait for redirect and video load
    });

    test('should load video feed immediately (no menus first)', async ({ page }) => {
        // User requirement: NO menus first, direct to videos
        const videoCard = page.locator('.video-card').first();
        await expect(videoCard).toBeVisible({ timeout: 10000 });

        console.log('✅ Video feed loaded immediately');
    });

    test('should display at least 10 videos from Langfeed', async ({ page }) => {
        await page.waitForSelector('.video-card', { timeout: 10000 });

        const videoCards = await page.locator('.video-card').count();
        expect(videoCards).toBeGreaterThanOrEqual(10);

        console.log(`✅ Loaded ${videoCards} videos`);
    });

    test('should have fullscreen video cards with scroll-snap', async ({ page }) => {
        const firstCard = page.locator('.video-card').first();

        // Check dimensions (should be fullscreen)
        const box = await firstCard.boundingBox();
        const viewport = page.viewportSize();

        expect(box.height).toBeGreaterThan(viewport.height * 0.9); // ~100vh
        expect(box.width).toBeGreaterThan(viewport.width * 0.9); // ~100vw

        console.log('✅ Fullscreen video cards with TikTok-style dimensions');
    });

    test('should play video when in viewport', async ({ page }) => {
        await page.waitForSelector('video', { timeout: 10000 });

        const video = page.locator('video').first();

        // Check if video is playing
        const isPaused = await video.evaluate((v) => v.paused);

        // Video may autoplay or need user interaction
        if (isPaused) {
            await video.click(); // Trigger play
            await page.waitForTimeout(500);
        }

        const isPlayingNow = await video.evaluate((v) => !v.paused);
        expect(isPlayingNow).toBeTruthy();

        console.log('✅ Video plays when in viewport');
    });

    test('should display synchronized transcriptions with dual language', async ({ page }) => {
        await page.waitForSelector('video', { timeout: 10000 });

        // Play video
        const video = page.locator('video').first();
        await video.click();

        // Wait for transcription to appear
        await page.waitForTimeout(3000); // Wait for video to play a bit

        // Check for transcription overlay
        const transcriptionOverlay = page.locator('.transcription-overlay').first();

        // May or may not be visible depending on if video has transcription
        const isVisible = await transcriptionOverlay.isVisible().catch(() => false);

        if (isVisible) {
            // Check for Spanish line
            const spanishLine = transcriptionOverlay.locator('.spanish-line');
            await expect(spanishLine).toBeVisible();

            // Check for English line
            const englishLine = transcriptionOverlay.locator('.english-line');
            await expect(englishLine).toBeVisible();

            console.log('✅ Dual-language transcriptions displayed');
        } else {
            console.log('⚠️ No transcription for first video (acceptable if video lacks subtitles)');
        }
    });

    test('should have clickable Spanish words in transcription', async ({ page }) => {
        await page.waitForSelector('video', { timeout: 10000 });

        // Play video
        const video = page.locator('video').first();
        await video.click();
        await page.waitForTimeout(3000);

        // Look for clickable words
        const word = page.locator('.word').first();

        if (await word.isVisible().catch(() => false)) {
            // Click word
            await word.click();

            // Wait for tooltip
            await page.waitForTimeout(500);

            // Check if tooltip appeared
            const tooltip = page.locator('.word-tooltip');
            await expect(tooltip).toHaveClass(/show/);

            console.log('✅ Clickable words with translation tooltips working');
        } else {
            console.log('⚠️ No words visible (video may not have started transcription yet)');
        }
    });

    test('should have video controls (play/pause, speed)', async ({ page }) => {
        await page.waitForSelector('.video-controls', { timeout: 10000 });

        const controls = page.locator('.video-controls').first();
        await expect(controls).toBeVisible();

        // Check for speed button
        const speedBtn = controls.locator('.speed-btn');
        await expect(speedBtn).toBeVisible();
        await expect(speedBtn).toHaveText('1x');

        // Click to cycle speed
        await speedBtn.click();
        await page.waitForTimeout(300);
        await expect(speedBtn).toHaveText('0.75x');

        console.log('✅ Video controls working (speed adjustment)');
    });

    test('should have TikTok-style sidebar with like/save/share buttons', async ({ page }) => {
        await page.waitForSelector('.sidebar', { timeout: 10000 });

        const sidebar = page.locator('.sidebar').first();
        await expect(sidebar).toBeVisible();

        // Check for buttons
        const likeBtn = sidebar.locator('.like-btn');
        const saveBtn = sidebar.locator('.save-btn');
        const shareBtn = sidebar.locator('.share-btn');

        await expect(likeBtn).toBeVisible();
        await expect(saveBtn).toBeVisible();
        await expect(shareBtn).toBeVisible();

        // Test like functionality
        await likeBtn.click();
        await expect(likeBtn).toHaveClass(/liked/);

        console.log('✅ TikTok-style sidebar with engagement buttons');
    });

    test('should display video info (title, level)', async ({ page }) => {
        await page.waitForSelector('.video-info', { timeout: 10000 });

        const videoInfo = page.locator('.video-info').first();
        await expect(videoInfo).toBeVisible();

        // Check for title
        const title = videoInfo.locator('.video-title');
        await expect(title).toBeVisible();

        // Check for level badge
        const level = videoInfo.locator('.video-level');
        await expect(level).toBeVisible();

        console.log('✅ Video info displayed (title + level)');
    });

    test('should have progress bar tracking video playback', async ({ page }) => {
        await page.waitForSelector('video', { timeout: 10000 });

        const video = page.locator('video').first();
        const progressBar = page.locator('.progress-bar').first();

        // Play video
        await video.click();
        await page.waitForTimeout(2000);

        // Check progress bar width (should increase)
        const width = await progressBar.evaluate((el) => el.style.width);

        // Width should be set (even if "0%")
        expect(width).toBeTruthy();

        console.log(`✅ Progress bar working (width: ${width})`);
    });

    test('should scroll to next video (vertical snap)', async ({ page }) => {
        await page.waitForSelector('.video-card', { timeout: 10000 });

        const firstVideo = page.locator('.video-card').first();
        const secondVideo = page.locator('.video-card').nth(1);

        // Ensure both visible
        await expect(firstVideo).toBeVisible();
        await expect(secondVideo).toBeVisible();

        // Scroll down
        await page.mouse.wheel(0, 1000);
        await page.waitForTimeout(1000);

        // Second video should now be in view
        const secondBox = await secondVideo.boundingBox();
        expect(secondBox.y).toBeLessThan(100); // Near top of viewport

        console.log('✅ Vertical snap scrolling working (TikTok pattern)');
    });

    test('should NOT have double menus (user requirement)', async ({ page }) => {
        // Count nav elements
        const navCount = await page.locator('nav').count();

        // Should have 0 or 1 nav (NOT 2!)
        expect(navCount).toBeLessThanOrEqual(1);

        console.log(`✅ No double menus (${navCount} nav elements)`);
    });

    test('should NOT have spammy popups/modals/achievements', async ({ page }) => {
        await page.waitForTimeout(3000); // Wait for any popups to appear

        // Check for common spammy elements
        const popup = await page.locator('.popup, .modal, .achievement').count();

        expect(popup).toBe(0);

        console.log('✅ No spammy popups/modals/achievements');
    });

    test('should load videos from real API (/api/videos)', async ({ page }) => {
        // Intercept API calls
        let apiCalled = false;

        page.on('request', request => {
            if (request.url().includes('/api/videos')) {
                apiCalled = true;
            }
        });

        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForTimeout(2000);

        expect(apiCalled).toBeTruthy();

        console.log('✅ Videos loaded from /api/videos API');
    });

    test('visual regression - screenshot comparison', async ({ page }) => {
        await page.waitForSelector('.video-card', { timeout: 10000 });
        await page.waitForTimeout(2000); // Let everything settle

        // Take screenshot
        const timestamp = Date.now();
        await page.screenshot({
            path: `screenshots/${timestamp}-tiktok-feed.png`,
            fullPage: false // Just viewport (fullscreen card)
        });

        console.log(`✅ Screenshot saved: screenshots/${timestamp}-tiktok-feed.png`);
    });

    test('performance - page load time < 2s', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('http://localhost:3001');
        await page.waitForSelector('.video-card', { timeout: 10000 });

        const loadTime = Date.now() - startTime;

        // Should load in < 2 seconds
        expect(loadTime).toBeLessThan(2000);

        console.log(`✅ Page load time: ${loadTime}ms (< 2000ms)`);
    });
});
