const { chromium } = require('@playwright/test');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3002/entertainment-feed.html');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `screenshots/${Date.now()}.png`, fullPage: true });
    console.log('✅ Screenshot saved to screenshots/');
    await browser.close();
})();
