/**
 * Visual Inspection - Check transcription issues
 * Purpose: See what's wrong with the flashing/broken transcriptions
 */

const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    console.log('🎥 Opening app at http://localhost:3002...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

    await page.waitForTimeout(2000);

    // Check for console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Console Error:', msg.text());
        }
    });

    // Check for video elements
    const videoCount = await page.locator('video').count();
    console.log(`📹 Found ${videoCount} video elements`);

    // Check for subtitle containers
    const subtitleContainers = await page.locator('.subtitle-overlay, .dual-caption-block, .caption-spanish').count();
    console.log(`💬 Found ${subtitleContainers} subtitle elements`);

    // Wait to observe behavior
    console.log('⏱️  Waiting 10 seconds to observe transcription behavior...');
    console.log('👀 WATCH the browser - are subtitles flashing/broken?');

    await page.waitForTimeout(10000);

    // Take screenshot
    const timestamp = Date.now();
    await page.screenshot({ path: `screenshots/${timestamp}-transcription-check.png`, fullPage: true });
    console.log(`📸 Screenshot saved: screenshots/${timestamp}-transcription-check.png`);

    // Check if videos are playing
    const firstVideo = page.locator('video').first();
    const isPlaying = await firstVideo.evaluate((video) => {
        return !video.paused && !video.ended && video.readyState > 2;
    });
    console.log(`▶️  First video playing: ${isPlaying}`);

    console.log('\n✅ Inspection complete. Browser will stay open for 30 more seconds...');
    await page.waitForTimeout(30000);

    await browser.close();
})();
