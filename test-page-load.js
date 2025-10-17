const { chromium } = require('playwright');

(async () => {
    console.log('🔍 CHECKING PAGE LOAD ISSUES\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });

    // Capture all console messages
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Capture errors
    const errors = [];
    page.on('pageerror', error => {
        errors.push(error.message);
    });

    console.log('📄 Loading page...');
    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForTimeout(5000);

    // Check what loaded
    const pageState = await page.evaluate(() => {
        return {
            title: document.title,
            hasVideoCards: !!document.querySelector('.video-card'),
            videoCardCount: document.querySelectorAll('.video-card').length,
            hasFeedContainer: !!document.querySelector('.feed-container'),
            hasStatsBar: !!document.querySelector('.stats-top-bar'),
            hasBottomNav: !!document.querySelector('.bottom-nav'),
            bodyText: document.body.innerText.substring(0, 500),
            hasConnectionError: document.body.innerText.includes('Connection Error'),
            hasLoadingScreen: document.body.innerText.includes('Loading'),
            videosArray: typeof window.videos !== 'undefined' ? window.videos.length : 'undefined'
        };
    });

    console.log('\n📊 PAGE STATE:');
    console.log('═'.repeat(60));
    console.log('Title:', pageState.title);
    console.log('Has video cards:', pageState.hasVideoCards ? '✅' : '❌');
    console.log('Video card count:', pageState.videoCardCount);
    console.log('Has feed container:', pageState.hasFeedContainer ? '✅' : '❌');
    console.log('Has stats bar:', pageState.hasStatsBar ? '✅' : '❌');
    console.log('Has bottom nav:', pageState.hasBottomNav ? '✅' : '❌');
    console.log('Videos array length:', pageState.videosArray);
    console.log('Has connection error:', pageState.hasConnectionError ? '❌' : '✅');
    console.log('Has loading screen:', pageState.hasLoadingScreen ? '⏳' : '✅');

    console.log('\n📝 CONSOLE MESSAGES (last 20):');
    consoleMessages.slice(-20).forEach(msg => console.log('  ', msg));

    if (errors.length > 0) {
        console.log('\n❌ PAGE ERRORS:');
        errors.forEach(err => console.log('  ', err));
    }

    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'screenshots/page-load-debug.png', fullPage: false });
    console.log('Saved to: screenshots/page-load-debug.png');

    console.log('\n═'.repeat(60));
    await page.waitForTimeout(3000);
    await browser.close();
})();
