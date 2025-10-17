const { chromium } = require('playwright');

(async () => {
    console.log('🔍 FINDING SYNTAX ERROR\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });

    // Capture errors with full details
    page.on('pageerror', error => {
        console.log('\n💥 PAGE ERROR:');
        console.log('Message:', error.message);
        console.log('Stack:', error.stack);
        console.log('Name:', error.name);
    });

    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForTimeout(5000);

    await browser.close();
})();
