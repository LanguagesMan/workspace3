const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

    page.on('console', msg => console.log(`[${msg.type()}]`, msg.text()));
    page.on('pageerror', error => console.log('💥 ERROR:', error.message));

    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForTimeout(15000);
    
    await page.screenshot({ path: 'screenshots/debug-current.png' });
    console.log('Screenshot saved');
    
    await browser.close();
})();
