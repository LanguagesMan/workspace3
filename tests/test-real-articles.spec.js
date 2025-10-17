const { test, expect } = require('@playwright/test');

test('verify real articles are showing', async ({ page }) => {
    console.log('📰 Testing Real Articles Feed...\n');

    await page.goto('http://localhost:3002/feed.html');
    await page.waitForSelector('.item', { timeout: 10000 });

    // Take screenshot
    await page.screenshot({
        path: 'screenshots/workspace3/REAL_ARTICLES_01.png',
        fullPage: true
    });

    const items = await page.$$('.item');
    console.log(`✅ Articles loaded: ${items.length}`);

    // Check first article title
    const firstTitle = await page.$eval('.title', el => el.textContent);
    console.log(`✅ First article: "${firstTitle}"`);

    console.log('✅ Screenshot saved: REAL_ARTICLES_01.png');
});
