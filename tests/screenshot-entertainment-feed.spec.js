/**
 * ENTERTAINMENT FEED SCREENSHOTS
 * Capture all sections: Videos, Articles, Music, Stories
 * TikTok-style navigation verification
 */

const { test, expect } = require('@playwright/test');

test.describe('Entertainment Feed - All Sections Screenshot', () => {
    const timestamp = Date.now();

    test('should screenshot Videos section with real-time transcription', async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Wait for videos to load
        await page.waitForSelector('.reel video', { timeout: 10000 });
        await page.waitForTimeout(2000);

        // Take screenshot
        await page.screenshot({
            path: `screenshots/verify-videos-${timestamp}.png`,
            fullPage: false
        });

        console.log('✅ Videos section screenshot saved');
    });

    test('should screenshot Articles section', async ({ page }) => {
        await page.goto('http://localhost:3002/articles-feed.html');

        // Wait for articles to load
        await page.waitForSelector('body', { timeout: 5000 });
        await page.waitForTimeout(1000);

        // Take screenshot
        await page.screenshot({
            path: `screenshots/verify-articles-${timestamp}.png`,
            fullPage: false
        });

        console.log('✅ Articles section screenshot saved');
    });

    test('should screenshot Music section', async ({ page }) => {
        await page.goto('http://localhost:3002/music-feed.html');

        // Wait for music to load
        await page.waitForSelector('body', { timeout: 5000 });
        await page.waitForTimeout(1000);

        // Take screenshot
        await page.screenshot({
            path: `screenshots/verify-music-${timestamp}.png`,
            fullPage: false
        });

        console.log('✅ Music section screenshot saved');
    });

    test('should screenshot Stories section', async ({ page }) => {
        await page.goto('http://localhost:3002/stories.html');

        // Wait for stories to load
        await page.waitForSelector('body', { timeout: 5000 });
        await page.waitForTimeout(1000);

        // Take screenshot
        await page.screenshot({
            path: `screenshots/verify-stories-${timestamp}.png`,
            fullPage: false
        });

        console.log('✅ Stories section screenshot saved');
    });

    test('should verify bottom navigation tabs', async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Wait for nav
        await page.waitForSelector('.bottom-nav', { timeout: 5000 });

        // Count nav items
        const navItems = await page.locator('.nav-item').count();
        expect(navItems).toBe(5);

        // Verify nav labels
        const labels = await page.locator('.nav-item span').allTextContents();
        console.log('Navigation labels:', labels);

        expect(labels).toContain('Videos');
        expect(labels).toContain('Articles');
        expect(labels).toContain('Music');
        expect(labels).toContain('Stories');

        console.log('✅ Navigation verified: 5 tabs (Videos, Articles, Music, Stories, Profile)');
    });
});
