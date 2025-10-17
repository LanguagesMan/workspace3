const { test, expect } = require('@playwright/test');

test.describe('Word Translation Speed Test', () => {

    test('Clicking Spanish word shows translation in <100ms (LingoPie standard)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000); // Wait for videos to load

        // Find first clickable Spanish word
        const wordElements = await page.locator('.word').all();
        expect(wordElements.length).toBeGreaterThan(0);

        const firstWord = wordElements[0];

        // Measure click-to-translation speed
        const startTime = Date.now();
        await firstWord.click();

        // Wait for translation to appear
        await page.waitForSelector('.translation', { state: 'visible', timeout: 200 });
        const endTime = Date.now();

        const responseTime = endTime - startTime;

        console.log(`⏱️  Word translation response time: ${responseTime}ms`);

        // LingoPie 2025 standard: <100ms
        expect(responseTime).toBeLessThan(100);

        // Verify translation text is shown
        const translationText = await page.locator('.translation').textContent();
        expect(translationText.length).toBeGreaterThan(0);

        // Verify video paused (LingoPie pattern)
        const videoPaused = await page.evaluate(() => {
            const video = document.querySelector('video');
            return video ? video.paused : false;
        });

        expect(videoPaused).toBe(true);
    });

    test('Multiple word clicks work smoothly', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        const wordElements = await page.locator('.word').all();
        const wordsToTest = Math.min(5, wordElements.length);

        let totalTime = 0;

        for (let i = 0; i < wordsToTest; i++) {
            const startTime = Date.now();
            await wordElements[i].click();
            await page.waitForTimeout(100); // Small delay between clicks
            const endTime = Date.now();

            totalTime += (endTime - startTime);
        }

        const averageTime = totalTime / wordsToTest;
        console.log(`⏱️  Average translation time: ${averageTime}ms`);

        // Average should be very fast
        expect(averageTime).toBeLessThan(150);
    });

    test('TikTok scroll works smoothly', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Verify scroll-snap is active
        const scrollSnapType = await page.locator('.reels-container').evaluate(el => {
            return window.getComputedStyle(el).scrollSnapType;
        });

        expect(scrollSnapType).toContain('y mandatory');

        // Simulate scroll to next reel
        await page.locator('.reels-container').evaluate(el => {
            el.scrollTop = window.innerHeight;
        });

        await page.waitForTimeout(500);

        // Verify we scrolled
        const scrollTop = await page.locator('.reels-container').evaluate(el => el.scrollTop);
        expect(scrollTop).toBeGreaterThan(0);
    });

    test('📸 Screenshot - Compare to TikTok quality', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 }); // iPhone 13 Pro
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        // Take screenshot
        await page.screenshot({
            path: 'screenshots/tiktok-comparison-test.png',
            fullPage: false
        });

        // Verify key TikTok elements present
        const hasVideo = await page.locator('video').count() > 0;
        const hasSidebar = await page.locator('.sidebar').count() > 0;
        const hasWords = await page.locator('.word').count() > 0;

        expect(hasVideo).toBe(true);
        expect(hasSidebar).toBe(true);
        expect(hasWords).toBe(true);
    });
});
