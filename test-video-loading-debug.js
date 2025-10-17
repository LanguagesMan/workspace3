const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Listen to all console messages
    page.on('console', msg => {
        console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });

    // Listen to page errors
    page.on('pageerror', error => {
        console.error(`[PAGE ERROR] ${error.message}`);
    });

    // Navigate to the page
    console.log('📱 Opening page...');
    await page.goto('http://localhost:3001/tiktok-video-feed.html');

    // Wait a bit for videos to load
    console.log('⏳ Waiting for videos to load...');
    await page.waitForTimeout(5000);

    // Check if videos are rendered
    const videoCount = await page.locator('.video-card').count();
    console.log(`\n✅ Found ${videoCount} video cards on page`);

    // Check feedContainer
    const feedContainer = await page.locator('#feedContainer').count();
    console.log(`✅ feedContainer elements: ${feedContainer}`);

    // Get innerHTML of feedContainer to see what's there
    const containerHTML = await page.locator('#feedContainer').innerHTML();
    console.log(`📦 feedContainer innerHTML length: ${containerHTML.length} characters`);

    // Take screenshot
    await page.screenshot({ path: '/tmp/video-debug.png', fullPage: true });
    console.log('📸 Screenshot saved to /tmp/video-debug.png');

    console.log('\n✅ Test complete!');
    await browser.close();
})();
