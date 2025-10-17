const { chromium, devices } = require('playwright');

(async () => {
    console.log('🔍 Debugging Langflix video loading...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext(devices['iPhone 12']);
    const page = await context.newPage();

    // Collect console messages
    const consoleLogs = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleLogs.push({ type: msg.type(), text });
        if (msg.type() === 'error' || text.includes('❌') || text.includes('⚠️')) {
            console.log(`[${msg.type().toUpperCase()}] ${text}`);
        }
    });

    try {
        console.log('📄 Loading Langflix...');
        await page.goto('http://localhost:3001/langflix-app.html', {
            waitUntil: 'domcontentloaded',
            timeout: 15000
        });

        // Wait for potential loading
        await page.waitForTimeout(5000);

        // Check what's rendered
        const videoCards = await page.$$('.video-card');
        const loadingVisible = await page.$('#loading');
        const feedContainer = await page.$('.feed-container');

        console.log('\n📊 Page State:');
        console.log(`  Video cards: ${videoCards.length}`);
        console.log(`  Loading element: ${loadingVisible ? 'visible' : 'hidden'}`);
        console.log(`  Feed container: ${feedContainer ? 'exists' : 'missing'}`);

        // Check console logs for clues
        console.log('\n📝 Console Logs Summary:');
        const loadedMsg = consoleLogs.find(l => l.text.includes('Loaded') && l.text.includes('videos'));
        const personalizedMsg = consoleLogs.find(l => l.text.includes('Personalized feed'));
        const filteredMsg = consoleLogs.find(l => l.text.includes('Filtered to'));

        if (loadedMsg) console.log(`  ✅ ${loadedMsg.text}`);
        if (personalizedMsg) console.log(`  🎯 ${personalizedMsg.text}`);
        if (filteredMsg) console.log(`  ✅ ${filteredMsg.text}`);

        // Check for errors
        const errors = consoleLogs.filter(l => l.type === 'error');
        console.log(`\n❌ Errors: ${errors.length}`);
        errors.slice(0, 5).forEach(e => console.log(`  - ${e.text}`));

        // Get page HTML snippet
        const bodyHTML = await page.evaluate(() => {
            const container = document.querySelector('.feed-container');
            return container ? container.innerHTML.substring(0, 500) : 'Feed container not found';
        });
        console.log('\n📄 Feed Container HTML:');
        console.log(bodyHTML.substring(0, 300));

        await page.screenshot({ path: 'screenshots/langflix-debug.png', fullPage: true });
        console.log('\n📸 Screenshot saved: screenshots/langflix-debug.png');

    } catch (error) {
        console.error('\n💥 ERROR:', error.message);
    }

    await browser.close();
})();
