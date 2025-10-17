/**
 * Test the simple transcription system
 */

const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Capture console
    page.on('console', msg => {
        console.log(`[${msg.type()}]`, msg.text());
    });

    console.log('\n🎥 Testing simple transcription system...\n');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

    console.log('\n⏱️  Waiting 5 seconds for transcriptions to initialize...\n');
    await page.waitForTimeout(5000);

    // Check for transcriptions
    const containers = await page.locator('.video-subtitle-container').count();
    const captions = await page.evaluate(() => {
        const containers = document.querySelectorAll('.video-subtitle-container');
        return Array.from(containers).map(c => c.innerHTML.length > 0);
    });

    const activeCaptions = captions.filter(Boolean).length;

    console.log(`\n📊 RESULTS:`);
    console.log(`   Subtitle containers: ${containers}`);
    console.log(`   Active captions: ${activeCaptions}`);

    if (activeCaptions > 0) {
        console.log(`\n✅ SUCCESS! Transcriptions are displaying!`);
    } else {
        console.log(`\n❌ FAIL! No transcriptions displaying`);
    }

    // Screenshot
    const timestamp = Date.now();
    await page.screenshot({ path: `screenshots/${timestamp}-simple-transcriptions.png`, fullPage: true });
    console.log(`\n📸 Screenshot: screenshots/${timestamp}-simple-transcriptions.png`);

    console.log('\n⏱️  Keeping browser open for 15 seconds to observe...\n');
    await page.waitForTimeout(15000);

    await browser.close();
})();
