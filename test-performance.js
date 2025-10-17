/**
 * Performance test for TikTok video feed
 * Target: <3s load time
 */

const { chromium } = require('playwright');

(async () => {
    console.log('⚡ Performance Test\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    const startTime = Date.now();

    try {
        await page.goto('http://localhost:3001/tiktok-video-feed.html', {
            waitUntil: 'networkidle',
            timeout: 10000
        });

        // Wait for first video to be visible
        await page.waitForSelector('.video-card', { timeout: 5000 });

        const loadTime = Date.now() - startTime;
        const videoCount = await page.locator('.video-card').count();

        console.log('📊 Results:');
        console.log(`  Load time: ${(loadTime / 1000).toFixed(2)}s`);
        console.log(`  Videos rendered: ${videoCount}`);
        console.log(`  Target: <3.00s`);
        console.log(`  Status: ${loadTime < 3000 ? '✅ PASS' : '❌ FAIL'}`);

        // Check for JavaScript errors
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));

        await page.waitForTimeout(1000);

        console.log(`  JavaScript errors: ${errors.length === 0 ? '✅ None' : `⚠️  ${errors.length}`}`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
})();
