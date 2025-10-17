const { test, expect } = require('@playwright/test');

test('Quick visual inspection - See the app NOW', async ({ page }) => {
    console.log('🎬 Opening app in VISIBLE browser...');

    // Open the HTML file directly
    await page.goto('file://' + __dirname + '/unified-infinite-feed.html');

    console.log('✅ Page loaded - Browser will stay open for 30 seconds');
    console.log('👀 LOOK AT THE APP - Is it beautiful? Does it work?');

    // Wait so user can see
    await page.waitForTimeout(30000);

    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: `screenshots/quick-test-${Date.now()}.png`, fullPage: true });

    console.log('✅ Screenshot saved!');
});
