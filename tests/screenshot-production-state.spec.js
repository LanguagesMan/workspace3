const { test } = require('@playwright/test');

test('Take screenshot of current production state', async ({ page }) => {
    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForTimeout(5000);

    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/production-state.png',
        fullPage: false
    });

    console.log('Screenshot saved to: /Users/mindful/_projects/workspace3/production-state.png');
});
