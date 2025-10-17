const { chromium } = require('playwright');

(async () => {
    console.log('🔍 DEBUGGING LOADING ISSUE\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });

    // Capture ALL console messages
    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        logs.push(text);
        console.log(`[${msg.type()}]`, text);
    });

    // Capture ALL errors
    page.on('pageerror', error => {
        console.log('💥 PAGE ERROR:', error.message);
        console.log('Stack:', error.stack);
    });

    console.log('📄 Loading page...\n');
    await page.goto('http://localhost:3001/tiktok-video-feed.html');

    // Wait 10 seconds to see what happens
    await page.waitForTimeout(10000);

    const state = await page.evaluate(() => {
        return {
            hasLoadingEl: !!document.getElementById('loading'),
            loadingVisible: document.getElementById('loading')?.style.display !== 'none',
            loadingHTML: document.getElementById('loading')?.innerHTML.substring(0, 500),
            videosArrayDefined: typeof window.videos !== 'undefined',
            videosLength: typeof window.videos !== 'undefined' ? window.videos.length : 'undefined',
            hasCards: document.querySelectorAll('.video-card').length,
            bodyText: document.body.innerText.substring(0, 800)
        };
    });

    console.log('\n📊 PAGE STATE AFTER 10 SECONDS:');
    console.log('═'.repeat(70));
    console.log('Loading element exists:', state.hasLoadingEl);
    console.log('Loading visible:', state.loadingVisible);
    console.log('Videos array defined:', state.videosArrayDefined);
    console.log('Videos length:', state.videosLength);
    console.log('Video cards:', state.hasCards);
    console.log('\nLoading HTML:', state.loadingHTML);
    console.log('\nBody text:', state.bodyText);

    // Look for specific error patterns in logs
    console.log('\n🔍 ANALYZING LOGS:');
    const errorLogs = logs.filter(l => l.includes('Error') || l.includes('❌') || l.includes('Failed'));
    if (errorLogs.length > 0) {
        console.log('Found errors:');
        errorLogs.forEach(log => console.log('  -', log));
    }

    const loadLogs = logs.filter(l => l.includes('LOAD') || l.includes('Loading') || l.includes('loaded'));
    console.log('\nLoad-related logs:');
    loadLogs.forEach(log => console.log('  -', log));

    await page.screenshot({ path: 'screenshots/debug-loading.png' });
    console.log('\n📸 Screenshot: screenshots/debug-loading.png');

    console.log('\n═'.repeat(70));
    await page.waitForTimeout(3000);
    await browser.close();
})();
