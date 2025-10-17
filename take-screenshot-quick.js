const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    console.log('📸 Loading page...');
    await page.goto('http://localhost:3002/tiktok-videos.html', { waitUntil: 'networkidle' });

    await page.waitForTimeout(2000);

    const screenshot = `screenshots/${Date.now()}-transcription-test.png`;
    await page.screenshot({ path: screenshot, fullPage: false });
    console.log(`✅ Screenshot saved: ${screenshot}`);

    // Check if transcription elements exist
    const spanish = await page.locator('#spanish0').count();
    const english = await page.locator('#english0').count();
    console.log(`Transcription elements: spanish=${spanish}, english=${english}`);

    // Try to get video element
    const videoCount = await page.locator('video').count();
    console.log(`Video elements: ${videoCount}`);

    await browser.close();
})();
