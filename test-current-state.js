const { chromium, devices } = require('playwright');

(async () => {
    console.log('🧪 Testing current app state...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext(devices['iPhone 12']);
    const page = await context.newPage();

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    try {
        console.log('📄 Loading TikTok Video Feed...');
        await page.goto('http://localhost:3001/tiktok-video-feed.html', {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });

        await page.waitForTimeout(3000);

        // Check what's on the page
        const bodyText = await page.evaluate(() => document.body.innerText);
        const videoCount = await page.$$eval('video', videos => videos.length);
        const hasNavigation = await page.$('.bottom-nav') !== null;

        console.log('\n📊 Current State:');
        console.log(`  Videos: ${videoCount}`);
        console.log(`  Navigation: ${hasNavigation ? 'Yes' : 'No'}`);
        console.log(`  Console Errors: ${errors.length}`);
        console.log(`  Body preview: ${bodyText.substring(0, 200)}`);

        if (errors.length > 0) {
            console.log('\n❌ Errors found:');
            errors.slice(0, 5).forEach(err => console.log(`  - ${err}`));
        }

        await page.screenshot({ path: 'screenshots/current-state.png', fullPage: true });
        console.log('\n📸 Screenshot saved: screenshots/current-state.png');

    } catch (error) {
        console.error('\n💥 FATAL ERROR:', error.message);
    }

    await browser.close();
})();
