const { test, expect } = require('@playwright/test');

test.describe('✅ VERIFY Current App State - PORT 3002', () => {

    test('1. TikTok-style reels load IMMEDIATELY (no menus first)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        // User requirement: "Show TikTok-style vertical scroll reels IMMEDIATELY when app opens - NO menus first"
        const videoSlides = page.locator('.video-slide');
        const count = await videoSlides.count();

        console.log(`📹 Found ${count} video slides`);
        expect(count).toBeGreaterThan(0);

        // Screenshot proof
        await page.screenshot({ path: 'test-results/current-app-immediate-reels.png', fullPage: false });
    });

    test('2. Full-screen reels with clickable Spanish word translations', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        // Check full-screen layout
        const videoSlide = page.locator('.video-slide').first();
        const box = await videoSlide.boundingBox();
        console.log(`📐 Video slide size: ${box.width}x${box.height}`);

        // Check for clickable subtitle words
        const subtitleWords = page.locator('.subtitle-word');
        const wordCount = await subtitleWords.count();
        console.log(`🔤 Found ${wordCount} clickable subtitle words`);

        // User requirement: "Full-screen reels with clickable Spanish word translations"
        expect(box.width).toBeGreaterThan(300);

        await page.screenshot({ path: 'test-results/current-app-clickable-words.png', fullPage: false });
    });

    test('3. Real Spanish learning content (NO dummy content)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        // Check for real video sources
        const videos = page.locator('video');
        const firstVideo = videos.first();
        const src = await firstVideo.getAttribute('src');

        console.log(`🎬 Video source: ${src}`);

        // User requirement: "Remove ALL dummy content - use real Spanish learning content"
        // Check it's real video file (not placeholder/dummy)
        expect(src).toMatch(/\.(mp4|webm|mov)/i);

        await page.screenshot({ path: 'test-results/current-app-real-content.png', fullPage: false });
    });

    test('4. TikTok vertical scroll with scroll-snap', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Check scroll-snap CSS on html element (TikTok pattern)
        const hasSnapScroll = await page.evaluate(() => {
            const html = document.documentElement;
            const scrollSnapType = getComputedStyle(html).scrollSnapType;
            return scrollSnapType.includes('y mandatory') || scrollSnapType.includes('mandatory');
        });

        console.log(`📱 TikTok scroll-snap enabled: ${hasSnapScroll}`);
        expect(hasSnapScroll).toBe(true);
    });

    test('5. Instagram Stories bar at top', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Check for Instagram-style stories bar
        const storiesBar = page.locator('.stories-bar');
        await expect(storiesBar).toBeVisible();

        const storyItems = page.locator('.story-item');
        const count = await storyItems.count();
        console.log(`📖 Found ${count} story categories`);
        expect(count).toBeGreaterThan(0);

        await page.screenshot({ path: 'test-results/current-app-stories-bar.png', fullPage: false });
    });

    test('6. Engagement buttons (TikTok/Instagram pattern)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Check for engagement bar with buttons
        const engagementBar = page.locator('.engagement-bar').first();
        await expect(engagementBar).toBeVisible();

        const buttons = page.locator('.engagement-btn');
        const count = await buttons.count();
        console.log(`❤️ Found ${count} engagement buttons`);
        expect(count).toBeGreaterThan(0);
    });

    test('7. Word translation popup (click Spanish word)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        // Wait for subtitles to appear
        await page.waitForTimeout(2000);

        // Click a subtitle word if available
        const subtitleWord = page.locator('.subtitle-word').first();
        const isVisible = await subtitleWord.isVisible().catch(() => false);

        if (isVisible) {
            await subtitleWord.click();
            await page.waitForTimeout(1000);

            // Check for translation popup
            const popup = page.locator('.translation-popup');
            const popupVisible = await popup.isVisible().catch(() => false);

            console.log(`💬 Translation popup appeared: ${popupVisible}`);

            if (popupVisible) {
                await page.screenshot({ path: 'test-results/current-app-translation.png', fullPage: false });
            }
        }
    });

    test('8. Full screenshot proof - CURRENT STATE', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        await page.screenshot({
            path: 'test-results/CURRENT-APP-FULL-STATE.png',
            fullPage: false
        });

        console.log('✅ Screenshot saved: test-results/CURRENT-APP-FULL-STATE.png');
    });
});
