const { chromium } = require('playwright');

(async () => {
    console.log('🧪 Quick Video Test\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Track console logs
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Video') || text.includes('error') || text.includes('Error')) {
            console.log(`[Browser] ${text}`);
        }
    });

    try {
        console.log('📱 Loading test page...');
        await page.goto('http://localhost:3001/test-minimal-video.html', {
            waitUntil: 'domcontentloaded',
            timeout: 10000
        });

        // Wait for tests to complete
        await page.waitForTimeout(5000);

        // Get status
        const status = await page.locator('#status').textContent();
        console.log('\n📊 Test Result:');
        console.log(status);

        // Take screenshot
        await page.screenshot({ path: '/tmp/video-test-quick.png', fullPage: true });
        console.log('\n📸 Screenshot: /tmp/video-test-quick.png');

        // Wait to observe
        console.log('\n⏸️  Keeping browser open for 5 seconds...');
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('❌ Test error:', error.message);
    } finally {
        await browser.close();
    }
})();
