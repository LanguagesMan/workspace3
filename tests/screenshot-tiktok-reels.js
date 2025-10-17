const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Go directly to tiktok-videos.html (the actual reels page)
    await page.goto('http://localhost:3001/tiktok-videos.html');
    await page.waitForTimeout(3000);

    // Take screenshot showing Stories button in bottom nav
    await page.screenshot({ path: 'screenshots/reels-with-stories-nav.png', fullPage: false });
    console.log('✅ Screenshot: Reels page with Stories button in navigation');

    await browser.close();
})();
