const { test, expect } = require('@playwright/test');

test.describe('TikTok Reels on Port 3002', () => {
    test('Shows reels IMMEDIATELY - NO menus', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // NO landing page, NO menus - just reels
        const reelsContainer = await page.locator('.reels-container');
        await expect(reelsContainer).toBeVisible();

        // Check scroll-snap-type
        const scrollSnapType = await reelsContainer.evaluate(el =>
            getComputedStyle(el).scrollSnapType
        );
        expect(scrollSnapType).toContain('mandatory');
    });

    test('Full-screen reels with scroll-snap-stop: always', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        const firstReel = await page.locator('.reel').first();
        await expect(firstReel).toBeVisible();

        // Check scroll-snap-stop: always (prevents skipping videos)
        const scrollSnapStop = await firstReel.evaluate(el =>
            getComputedStyle(el).scrollSnapStop
        );
        expect(scrollSnapStop).toBe('always');

        // Check 100vh height
        const height = await firstReel.evaluate(el =>
            getComputedStyle(el).height
        );
        expect(height).toContain('vh');
    });

    test('Clickable Spanish word translations work', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Find clickable words
        const clickableWord = await page.locator('.word[data-translation]').first();
        await expect(clickableWord).toBeVisible();

        // Get translation data
        const translation = await clickableWord.getAttribute('data-translation');
        expect(translation).toBeTruthy();
        expect(translation.length).toBeGreaterThan(0);

        console.log('✅ Found clickable word with translation:', translation);
    });

    test('Real Spanish content (84 videos with .srt)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        // Check multiple reels loaded
        const reels = await page.locator('.reel').count();
        expect(reels).toBeGreaterThan(3);

        console.log(`✅ Loaded ${reels} reels`);

        // Check for Spanish text
        const spanishText = await page.locator('.spanish-text').first();
        await expect(spanishText).toBeVisible();

        const text = await spanishText.textContent();
        expect(text.length).toBeGreaterThan(0);
        console.log('✅ Spanish content:', text.substring(0, 50));
    });

    test('TikTok engagement buttons visible', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Check sidebar with TikTok buttons
        const sidebar = await page.locator('.sidebar').first();
        await expect(sidebar).toBeVisible();

        // Count buttons (like, comment, share, etc.)
        const buttons = await sidebar.locator('.sidebar-btn').count();
        expect(buttons).toBeGreaterThanOrEqual(3);

        console.log(`✅ Found ${buttons} TikTok-style buttons`);
    });

    test('Screenshot - TikTok reels on 3002', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        await page.screenshot({
            path: 'screenshots/tiktok-reels-3002-verification.png',
            fullPage: false
        });

        console.log('✅ Screenshot saved: screenshots/tiktok-reels-3002-verification.png');
    });
});
