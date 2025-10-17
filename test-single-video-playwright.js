const { chromium } = require('playwright');

(async () => {
    console.log('🎬 Testing single video playback...\n');

    const browser = await chromium.launch({ headless: false }); // Non-headless to see what's happening
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    // Collect console messages
    page.on('console', msg => {
        console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    // Navigate
    await page.goto('http://localhost:3001/test-single-video.html');

    // Wait for video element
    await page.waitForSelector('video');

    // Wait a bit for video to load
    await page.waitForTimeout(5000);

    // Check video state
    const videoState = await page.evaluate(() => {
        const video = document.getElementById('testVideo');
        return {
            readyState: video.readyState,
            networkState: video.networkState,
            error: video.error ? {
                code: video.error.code,
                message: video.error.message
            } : null,
            duration: video.duration,
            currentSrc: video.currentSrc,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight
        };
    });

    console.log('\n📊 Video State:');
    console.log(JSON.stringify(videoState, null, 2));

    if (videoState.error) {
        console.log('\n❌ VIDEO FAILED TO LOAD');
        console.log(`Error Code: ${videoState.error.code}`);
        console.log(`Error Message: ${videoState.error.message}`);
    } else if (videoState.readyState >= 2) {
        console.log('\n✅ VIDEO LOADED SUCCESSFULLY!');
        console.log(`Duration: ${videoState.duration}s`);
        console.log(`Resolution: ${videoState.videoWidth}x${videoState.videoHeight}`);
    } else {
        console.log('\n⏳ VIDEO STILL LOADING...');
        console.log(`Ready State: ${videoState.readyState} (need >= 2)`);
    }

    // Take screenshot
    await page.screenshot({ path: 'screenshots/single-video-test.png' });
    console.log('\n📸 Screenshot saved: screenshots/single-video-test.png');

    await page.waitForTimeout(2000);
    await browser.close();
})();
