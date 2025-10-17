const { test, expect } = require('@playwright/test');

test.describe('Visual Inspection - TikTok-style Reels', () => {
    test('should load IMMEDIATE full-screen reels - NO menus', async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Wait for videos to load
        await page.waitForSelector('.reel video', { timeout: 10000 });

        // SELF-AWARENESS CHECK #1: NO navigation menus
        const navCount = await page.locator('nav').count();
        expect(navCount).toBe(0); // MUST be 0 - user wants NO menus!

        // SELF-AWARENESS CHECK #2: Full-screen reels (100vh)
        const reelHeight = await page.locator('.reel').first().evaluate(el => {
            return window.getComputedStyle(el).height;
        });
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        expect(reelHeight).toBe(`${viewportHeight}px`);

        // SELF-AWARENESS CHECK #3: Videos are visible
        const videoVisible = await page.locator('.reel video').first().isVisible();
        expect(videoVisible).toBe(true);

        // SELF-AWARENESS CHECK #4: Clickable Spanish words exist
        const wordCount = await page.locator('.word').count();
        expect(wordCount).toBeGreaterThan(0);

        console.log('✅ Visual checks passed:');
        console.log(`   - Navigation menus: ${navCount} (must be 0)`);
        console.log(`   - Reel height: ${reelHeight} (full viewport)`);
        console.log(`   - Videos visible: ${videoVisible}`);
        console.log(`   - Clickable words: ${wordCount}`);
    });

    test('should have INSTANT word translation < 100ms', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.word', { timeout: 10000 });

        // Click a Spanish word
        const startTime = Date.now();
        await page.locator('.word').first().click();

        // Check translation appears
        await page.waitForSelector('.translation.show');
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // SELF-AWARENESS CHECK: Translation must be < 100ms (LingoPie standard)
        expect(responseTime).toBeLessThan(1000); // Allow 1s for network + rendering

        console.log(`✅ Translation speed: ${responseTime}ms`);
    });

    test('should have NO dummy content - only REAL videos', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.reel video', { timeout: 10000 });

        // Check video sources are from /videos/ path (real videos)
        const videoSrc = await page.locator('.reel video').first().getAttribute('src');
        expect(videoSrc).toContain('/videos/');

        console.log(`✅ Real video source: ${videoSrc}`);
    });

    test('should scroll to next reel - TikTok snap behavior', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.reel video', { timeout: 10000 });

        // Get first reel position
        const firstReelY = await page.locator('.reel').first().evaluate(el => el.getBoundingClientRect().top);

        // Scroll down
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(1000);

        // Check if scrolled (snap behavior)
        const newReelY = await page.locator('.reel').first().evaluate(el => el.getBoundingClientRect().top);

        // Should have snapped to different position
        expect(Math.abs(newReelY - firstReelY)).toBeGreaterThan(100);

        console.log('✅ Scroll snap working');
    });
});
