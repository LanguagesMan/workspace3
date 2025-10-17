const { chromium } = require('playwright');

(async () => {
    console.log('🧪 TESTING FRESH LOAD - Clear Everything\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });

    const page = await context.newPage();

    // Clear everything
    console.log('🗑️  Clearing localStorage and cookies...');
    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    // Reload fresh
    console.log('🔄 Reloading page fresh...');
    await page.reload();

    // Wait and watch console
    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        logs.push(text);
        if (text.includes('Error') || text.includes('❌')) {
            console.log(`❌ ${text}`);
        } else if (text.includes('✅') || text.includes('Loaded')) {
            console.log(`✅ ${text}`);
        }
    });

    page.on('pageerror', error => {
        console.log(`💥 PAGE ERROR: ${error.message}`);
    });

    await page.waitForTimeout(8000);

    const state = await page.evaluate(() => {
        return {
            videosLoaded: typeof window.videos !== 'undefined' ? window.videos.length : 'undefined',
            hasCards: document.querySelectorAll('.video-card').length,
            bodyText: document.body.innerText.substring(0, 300),
            hasError: document.body.innerText.includes('Connection Error')
        };
    });

    console.log('\n📊 FINAL STATE:');
    console.log('  Videos array:', state.videosLoaded);
    console.log('  Video cards:', state.hasCards);
    console.log('  Has error:', state.hasError ? '❌ YES' : '✅ NO');

    await page.screenshot({ path: 'screenshots/fresh-load.png' });
    console.log('\n📸 Screenshot: screenshots/fresh-load.png');

    await page.waitForTimeout(3000);
    await browser.close();
})();
