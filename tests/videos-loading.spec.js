const { test, expect } = require('@playwright/test');

test.describe('Videos Section - TikTok Pattern', () => {
    test('should load videos from Langfeed folder', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');
        
        // Click Videos tab
        const videosTab = page.locator('.nav-tab').filter({ hasText: 'Videos' });
        await videosTab.click();
        await page.waitForTimeout(2000);

        // Check if videos are loading
        const videoElements = await page.locator('video').count();
        console.log(`✓ Found ${videoElements} video elements`);
        expect(videoElements).toBeGreaterThan(0);

        // Take screenshot
        await page.screenshot({ path: 'screenshots/videos-tab.png', fullPage: false });
        console.log('✓ Screenshot saved: videos-tab.png');
    });

    test('should display video feed', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');
        
        // Navigate to videos tab
        await page.locator('.nav-tab').filter({ hasText: 'Videos' }).click();
        await page.waitForTimeout(2000);

        // Verify feed container exists
        const feedContainer = page.locator('#feedContainer');
        await expect(feedContainer).toBeVisible();

        console.log('✓ Video feed is visible');
    });
});
