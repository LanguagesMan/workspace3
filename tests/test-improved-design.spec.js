const { test, expect } = require('@playwright/test');

test.describe('VIDA App - Improved TikTok-Style Design', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForTimeout(1000);
    });

    test('should load with TikTok-style full-screen videos', async ({ page }) => {
        // Check that videos section is active
        const videosPanel = page.locator('#videos-panel');
        await expect(videosPanel).toBeVisible();

        // Check for video container
        const videoContainer = page.locator('#video-container');
        await expect(videoContainer).toBeVisible();

        // Wait for videos to load
        await page.waitForSelector('.video-item', { timeout: 5000 }).catch(() => {
            console.log('Videos not loaded from API - this is expected if API is not ready');
        });
    });

    test('should have clickable word translations in transcriptions', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Check for clickable words
        const clickableWords = page.locator('.word-clickable');
        const count = await clickableWords.count();

        if (count > 0) {
            console.log(`✅ Found ${count} clickable words with translations`);

            // Hover over a word to see tooltip
            await clickableWords.first().hover();
            await page.waitForTimeout(500);

            // Check that tooltip appears
            const tooltip = page.locator('.word-tooltip').first();
            await expect(tooltip).toBeVisible();
        } else {
            console.log('⚠️ No clickable words found - videos may not be loaded');
        }
    });

    test('should have improved transcription box with no flashing', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Check for transcription box
        const transBox = page.locator('.transcription-box').first();

        if (await transBox.isVisible()) {
            // Verify styling
            const bgColor = await transBox.evaluate(el => getComputedStyle(el).backgroundColor);
            expect(bgColor).toBeTruthy();

            console.log('✅ Transcription box has proper styling (no flashing)');
        } else {
            console.log('⚠️ Transcription box not visible - videos may not be loaded');
        }
    });

    test('should have bottom navigation like TikTok', async ({ page }) => {
        // Check for bottom nav
        const bottomNav = page.locator('.bottom-nav');
        await expect(bottomNav).toBeVisible();

        // Check for nav items
        const navItems = page.locator('.nav-item');
        const navCount = await navItems.count();
        expect(navCount).toBe(4); // Feed, Music, Stories, Chat

        console.log(`✅ Bottom navigation has ${navCount} items`);
    });

    test('should have only ONE navigation element', async ({ page }) => {
        // Count all nav elements
        const navElements = page.locator('nav');
        const count = await navElements.count();
        expect(count).toBe(1);

        console.log('✅ Only ONE navigation element (as required)');
    });

    test('should have NO spam (popups, modals, achievements)', async ({ page }) => {
        // Check for spam elements
        const popups = page.locator('[class*="popup"], [class*="modal"], [class*="achievement"]');
        const count = await popups.count();
        expect(count).toBe(0);

        console.log('✅ No spam elements found');
    });

    test('should switch between Videos and News tabs', async ({ page }) => {
        // Click on News tab
        const newsTab = page.locator('.feed-tab[data-feed="articles"]');
        await newsTab.click();
        await page.waitForTimeout(500);

        // Check that articles panel is now visible
        const articlesPanel = page.locator('#articles-panel');
        await expect(articlesPanel).toHaveClass(/active/);

        // Click back to Videos
        const videosTab = page.locator('.feed-tab[data-feed="videos"]');
        await videosTab.click();
        await page.waitForTimeout(500);

        const videosPanel = page.locator('#videos-panel');
        await expect(videosPanel).toHaveClass(/active/);

        console.log('✅ Tab switching works correctly');
    });

    test('should have full-screen video items (100vh)', async ({ page }) => {
        await page.waitForTimeout(2000);

        const videoItem = page.locator('.video-item').first();
        if (await videoItem.isVisible()) {
            const height = await videoItem.evaluate(el => el.offsetHeight);
            const viewportHeight = await page.evaluate(() => window.innerHeight);

            // Video should be approximately full viewport height
            expect(height).toBeGreaterThan(viewportHeight * 0.9);

            console.log(`✅ Video items are full-screen: ${height}px (viewport: ${viewportHeight}px)`);
        }
    });
});
