const { chromium } = require('playwright');

(async () => {
    console.log('📸 Quick screenshot test\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });

    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    console.log('⏳ Waiting 8 seconds...');
    await page.waitForTimeout(8000);

    await page.screenshot({ path: 'screenshots/design-test-current.png', fullPage: false });
    console.log('✅ Screenshot saved: screenshots/design-test-current.png');

    await browser.close();
})();
