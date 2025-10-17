/**
 * Test with console logs to debug subtitle issue
 */

const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Capture ALL console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();

        if (type === 'error') {
            console.log('❌ ERROR:', text);
        } else if (text.includes('subtitle') || text.includes('caption') || text.includes('🎬') || text.includes('🎯') || text.includes('📝')) {
            console.log(`[${type.toUpperCase()}]`, text);
        }
    });

    console.log('\n🎥 Loading app...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

    console.log('\n⏱️  Waiting 5 seconds for videos to load and subtitles to attach...\n');
    await page.waitForTimeout(5000);

    // Check subtitle counts
    const subtitleContainers = await page.locator('.video-subtitle-container').count();
    const dualCaptions = await page.locator('.dual-caption-block').count();
    const spanishCaptions = await page.locator('.caption-spanish').count();

    console.log(`\n📊 RESULTS:`);
    console.log(`   Subtitle containers: ${subtitleContainers}`);
    console.log(`   Dual caption blocks: ${dualCaptions}`);
    console.log(`   Spanish captions: ${spanishCaptions}`);

    // Take screenshot
    const timestamp = Date.now();
    await page.screenshot({ path: `screenshots/${timestamp}-debug.png`, fullPage: true });
    console.log(`\n📸 Screenshot: screenshots/${timestamp}-debug.png`);

    console.log('\n✅ Test complete. Browser stays open for 15 seconds...\n');
    await page.waitForTimeout(15000);

    await browser.close();
})();
