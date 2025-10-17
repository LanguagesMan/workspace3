const { test, expect } = require('@playwright/test');

test.describe('Fixed UX Validation - TikTok Pattern', () => {
    const testUrl = 'http://localhost:3002/unified-infinite-feed.html';

    test('1. Should have ONLY ONE menu (no double menu)', async ({ page }) => {
        await page.goto(testUrl);

        // Check for top navigation
        const topNav = await page.$('.top-nav-tabs');
        expect(topNav).toBeTruthy();

        // Check that bottom navigation is REMOVED
        const bottomNav = await page.$('.bottom-nav-bar');
        expect(bottomNav).toBeNull();

        console.log('✅ Single menu verified - bottom nav removed');
    });

    test('2. Videos tab should be FIRST and DEFAULT', async ({ page }) => {
        await page.goto(testUrl);
        await page.waitForTimeout(1000);

        // Check that Videos is the first tab
        const firstTab = await page.$('.nav-tab:first-child');
        const firstTabText = await firstTab.textContent();
        expect(firstTabText.trim()).toBe('Videos');

        // Check that Videos tab is active by default
        const hasActiveClass = await firstTab.evaluate(el => el.classList.contains('active'));
        expect(hasActiveClass).toBe(true);

        console.log('✅ Videos tab is FIRST and DEFAULT (active)');
    });

    test('3. Should have 3 clean tabs without emojis', async ({ page }) => {
        await page.goto(testUrl);

        const tabs = await page.$$('.nav-tab');
        expect(tabs.length).toBe(3);

        const tabTexts = await Promise.all(tabs.map(tab => tab.textContent()));

        expect(tabTexts[0].trim()).toBe('Videos');
        expect(tabTexts[1].trim()).toBe('Stories');
        expect(tabTexts[2].trim()).toBe('Articles');

        // Verify no emojis in tab text
        tabTexts.forEach(text => {
            expect(text).not.toMatch(/[🎬📰⚡]/);
        });

        console.log('✅ 3 clean tabs: Videos, Stories, Articles (no emojis)');
    });

    test('4. Videos section should load video content', async ({ page }) => {
        await page.goto(testUrl);
        await page.waitForTimeout(2000);

        // Videos tab should be active by default
        const videosTab = await page.$('[data-tab="videos"]');
        const isActive = await videosTab.evaluate(el => el.classList.contains('active'));
        expect(isActive).toBe(true);

        // Check for content cards
        const contentCards = await page.$$('.content-card');
        expect(contentCards.length).toBeGreaterThan(0);

        console.log(`✅ Videos section loaded ${contentCards.length} items`);
    });

    test('5. TikTok scroll physics should still work', async ({ page }) => {
        await page.goto(testUrl);

        const scrollSnapType = await page.evaluate(() => {
            return window.getComputedStyle(document.body).scrollSnapType;
        });

        expect(scrollSnapType).toContain('y');
        expect(scrollSnapType).toContain('mandatory');

        console.log('✅ TikTok scroll-snap physics: ACTIVE');
    });

    test('6. Take comparison screenshot', async ({ page }) => {
        await page.goto(testUrl);
        await page.waitForTimeout(2000);

        const screenshotPath = `screenshots/evidence/fixed-ux-${Date.now()}.png`;
        await page.screenshot({
            path: screenshotPath,
            fullPage: false
        });

        console.log(`✅ Screenshot saved to: ${screenshotPath}`);
    });
});
