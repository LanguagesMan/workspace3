const { chromium, devices } = require('playwright');

(async () => {
    console.log('🔍 Debugging Unified Feed...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext(devices['iPhone 12']);
    const page = await context.newPage();

    const consoleLogs = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleLogs.push({ type: msg.type(), text });
        console.log(`[${msg.type().toUpperCase()}] ${text}`);
    });

    try {
        console.log('📄 Loading Unified Feed...');
        await page.goto('http://localhost:3001/unified-infinite-feed.html', {
            waitUntil: 'domcontentloaded',
            timeout: 15000
        });

        await page.waitForTimeout(5000);

        const videoCards = await page.$$('.content-card');
        const feedContainer = await page.$('#feedContainer');

        console.log('\n📊 State:');
        console.log(`  Content cards: ${videoCards.length}`);
        console.log(`  Feed container: ${feedContainer ? 'exists' : 'missing'}`);

        // Check for errors
        const errors = consoleLogs.filter(l => l.type === 'error');
        console.log(`\n❌ Errors: ${errors.length}`);
        errors.forEach(e => console.log(`  - ${e.text}`));

        await page.screenshot({ path: 'screenshots/unified-debug.png', fullPage: true });
        console.log('\n📸 Screenshot saved');

    } catch (error) {
        console.error('\n💥 ERROR:', error.message);
    }

    await browser.close();
})();
