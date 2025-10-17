const { test, expect } = require('@playwright/test');

test.describe('Comprehensive Feed Test', () => {
    test('should load all features correctly', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // 1. Check stories carousel
        const stories = page.locator('.stories-container');
        await expect(stories).toBeVisible();
        console.log('✓ Stories carousel visible');

        // 2. Check feed loads
        const feedItems = await page.locator('.content-card').count();
        console.log(`✓ Feed loaded: ${feedItems} items`);
        expect(feedItems).toBeGreaterThan(0);

        // 3. Check videos tab
        await page.locator('.nav-tab').filter({ hasText: 'Videos' }).click();
        await page.waitForTimeout(2000);
        const videos = await page.locator('video').count();
        console.log(`✓ Videos tab: ${videos} videos`);

        // 4. Take final screenshot
        await page.screenshot({ path: 'screenshots/feed-complete.png', fullPage: true });
        console.log('✓ Screenshot: feed-complete.png');
    });
});
