const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Capture all console messages
    page.on('console', msg => {
        console.log(`[${msg.type().toUpperCase()}]`, msg.text());
    });

    // Capture errors
    page.on('pageerror', err => {
        console.error('PAGE ERROR:', err.message);
    });

    // Capture network errors
    page.on('requestfailed', request => {
        console.error('NETWORK ERROR:', request.url(), request.failure().errorText);
    });

    console.log('Opening http://localhost:3002...\n');
    await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(5000);

    // Check DOM state
    const feedContainer = await page.locator('#feedContainer').count();
    console.log(`\nFeed container exists: ${feedContainer > 0}`);

    const feedItems = await page.locator('.feed-card').count();
    console.log(`Feed items: ${feedItems}`);

    await page.waitForTimeout(5000);
    await browser.close();
})();
