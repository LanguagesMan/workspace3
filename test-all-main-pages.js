const { chromium, devices } = require('playwright');
const fs = require('fs');

(async () => {
    console.log('🧪 Testing ALL main pages...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext(devices['iPhone 12']);
    const page = await context.newPage();

    const pages = [
        { name: 'Home (index.html)', url: '/' },
        { name: 'TikTok Feed', url: '/tiktok-video-feed.html' },
        { name: 'Langflix', url: '/langflix-app.html' },
        { name: 'Unified Feed', url: '/unified-infinite-feed.html' },
        { name: 'Premium', url: '/premium.html' }
    ];

    for (const pageInfo of pages) {
        try {
            console.log(`📄 Testing: ${pageInfo.name}`);

            const errors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') errors.push(msg.text());
            });

            await page.goto(`http://localhost:3001${pageInfo.url}`, {
                waitUntil: 'domcontentloaded',
                timeout: 10000
            });

            await page.waitForTimeout(2000);

            const title = await page.title();
            const bodyText = await page.evaluate(() => document.body.innerText);
            const videoCount = await page.$$eval('video', v => v.length).catch(() => 0);
            const hasNav = await page.$('.bottom-nav, nav') !== null;

            console.log(`  Title: ${title}`);
            console.log(`  Videos: ${videoCount}`);
            console.log(`  Navigation: ${hasNav ? 'Yes' : 'No'}`);
            console.log(`  Errors: ${errors.length}`);
            console.log(`  Preview: ${bodyText.substring(0, 100).replace(/\n/g, ' ')}`);

            const screenshotName = pageInfo.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            await page.screenshot({
                path: `screenshots/page-compare-${screenshotName}.png`,
                fullPage: false
            });
            console.log(`  📸 Screenshot saved\n`);

        } catch (error) {
            console.log(`  ❌ ERROR: ${error.message}\n`);
        }
    }

    await browser.close();
    console.log('✅ Test complete. Check screenshots/ folder');
})();
