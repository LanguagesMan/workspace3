const { test } = require('@playwright/test');

test('Screenshot all tabs', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);

    // Screenshot 1: Reels tab (default view)
    await page.screenshot({ path: '/tmp/tab-1-reels.png', fullPage: false });
    console.log('✅ Reels tab screenshot saved');

    // Screenshot 2: Feed tab
    await page.click('button:has-text("Feed")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/tab-2-feed.png', fullPage: false });
    console.log('✅ Feed tab screenshot saved');

    // Screenshot 3: Music tab
    await page.click('button:has-text("Music")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/tab-3-music.png', fullPage: false });
    console.log('✅ Music tab screenshot saved');
});
