/**
 * Test if transcriptions are now displaying after fix
 */

const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    console.log('🎥 Testing transcription fix at http://localhost:3002...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

    await page.waitForTimeout(3000);

    // Check for subtitle containers
    const subtitleContainers = await page.locator('.video-subtitle-container, .dual-caption-block').count();
    console.log(`💬 Found ${subtitleContainers} subtitle containers`);

    // Check for actual caption text
    const spanishCaptions = await page.locator('.caption-spanish').count();
    const englishCaptions = await page.locator('.caption-english').count();
    console.log(`🇪🇸 Spanish captions: ${spanishCaptions}`);
    console.log(`🇺🇸 English captions: ${englishCaptions}`);

    // Wait and observe
    console.log('\n⏱️  Watching for 15 seconds to see if captions update...');
    await page.waitForTimeout(15000);

    // Take screenshot
    const timestamp = Date.now();
    await page.screenshot({ path: `screenshots/${timestamp}-transcription-FIXED.png`, fullPage: true });
    console.log(`📸 Screenshot: screenshots/${timestamp}-transcription-FIXED.png`);

    // Check console for errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Error:', msg.text());
        }
        if (msg.text().includes('subtitle') || msg.text().includes('caption')) {
            console.log('💬 Subtitle log:', msg.text());
        }
    });

    console.log('\n✅ Test complete. Browser will stay open for 20 more seconds...');
    await page.waitForTimeout(20000);

    await browser.close();
})();
