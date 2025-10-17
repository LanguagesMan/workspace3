/**
 * Quick Visual Test - TikTok Reels & Stories Features
 * Simple test to verify core functionality and take screenshots
 */

const { test, expect } = require('@playwright/test');

test('Visual test - TikTok features and screenshots', async ({ page }) => {
    // Go to page
    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Take screenshot of initial state
    await page.screenshot({ path: 'screenshots/1-initial-feed.png', fullPage: true });
    console.log('✅ Screenshot 1: Initial feed');

    // Try to find and click Videos tab
    try {
        const videosTab = await page.locator('text=Videos').first();
        if (await videosTab.isVisible({ timeout: 5000 })) {
            await videosTab.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: 'screenshots/2-videos-mode.png', fullPage: false });
            console.log('✅ Screenshot 2: Videos mode (TikTok-style)');
        }
    } catch (e) {
        console.log('⚠️ Could not click Videos tab:', e.message);
    }

    // Check for Stories
    try {
        const storiesTab = await page.locator('text=Stories').first();
        if (await storiesTab.isVisible({ timeout: 5000 })) {
            console.log('✅ Stories tab found');
            await page.screenshot({ path: 'screenshots/3-stories-visible.png', fullPage: false });
        }
    } catch (e) {
        console.log('⚠️ Stories not found:', e.message);
    }

    // Check for word translations
    const spanishWords = await page.locator('.spanish-word').count();
    console.log(`📚 Spanish words found: ${spanishWords}`);

    // Check feed container
    const feedContainer = await page.locator('#feedContainer');
    const exists = await feedContainer.count();
    console.log(`📦 Feed container exists: ${exists > 0}`);

    console.log('\n✅ Visual test complete - check screenshots/ folder');
});
