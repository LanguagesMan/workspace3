/**
 * Detailed diagnostic test for video feed
 */

const { chromium } = require('playwright');

(async () => {
    console.log('🔍 Detailed Video Feed Diagnostic\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    // Track all network requests
    const failedRequests = [];
    page.on('requestfailed', request => {
        failedRequests.push({
            url: request.url(),
            failure: request.failure().errorText
        });
        console.log('❌ Request failed:', request.url());
    });

    page.on('response', response => {
        if (response.status() >= 400) {
            console.log(`❌ ${response.status()}: ${response.url()}`);
        }
    });

    // Track console logs
    const consoleLogs = [];
    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        consoleLogs.push({ type, text });

        if (type === 'error') {
            console.log(`❌ Console Error: ${text}`);
        }
    });

    // Track page errors
    page.on('pageerror', error => {
        console.log(`❌ Page Error: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
    });

    try {
        console.log('📱 Loading page...');
        await page.goto('http://localhost:3001/tiktok-video-feed.html', {
            waitUntil: 'domcontentloaded',
            timeout: 15000
        });

        // Wait a bit for async operations
        await page.waitForTimeout(3000);

        // Check DOM elements
        const feedContainer = await page.locator('.feed-container').count();
        const videoCards = await page.locator('.video-card').count();
        const videoElements = await page.locator('video').count();

        console.log('\n📊 DOM Elements:');
        console.log(`  Feed containers: ${feedContainer}`);
        console.log(`  Video cards: ${videoCards}`);
        console.log(`  Video elements: ${videoElements}`);

        // Check if videos are actually playing
        if (videoCards > 0) {
            const firstVideoSrc = await page.locator('video').first().getAttribute('src');
            console.log(`  First video src: ${firstVideoSrc}`);
        }

        // Take screenshot
        await page.screenshot({ path: '/tmp/video-feed-detailed.png', fullPage: true });
        console.log('\n📸 Screenshot: /tmp/video-feed-detailed.png');

        console.log('\n🎯 Status:');
        console.log(`  Videos loaded: ${videoCards >= 5 ? '✅' : '⚠️ '} ${videoCards}/5`);
        console.log(`  Failed requests: ${failedRequests.length === 0 ? '✅' : '❌'} ${failedRequests.length}`);

        if (failedRequests.length > 0) {
            console.log('\n❌ Failed Requests:');
            failedRequests.forEach(r => {
                console.log(`   - ${r.url}`);
                console.log(`     Error: ${r.failure}`);
            });
        }

        // Keep browser open
        console.log('\n⏸️  Browser open for 10 seconds...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ Test error:', error.message);
    } finally {
        await browser.close();
    }
})();
