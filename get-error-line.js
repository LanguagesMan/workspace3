const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on('pageerror', err => {
        console.error('SYNTAX ERROR:', err.message);
        console.error('Stack:', err.stack);
    });

    try {
        await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (e) {
        console.log('Timeout/error during load:', e.message);
    }

    await page.waitForTimeout(2000);
    await browser.close();
})();
