const { chromium } = require('playwright');

(async () => {
    console.log('🎬 Testing ULTRA-COMPAT video...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    // Collect console messages
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.text().includes('ERROR')) {
            console.log(`[Console Error] ${msg.text()}`);
        }
    });

    // Navigate
    await page.goto('http://localhost:3001/test-ultra-compat-video.html');

    // Wait for video element
    await page.waitForSelector('video');

    // Wait for video to load
    await page.waitForTimeout(7000);

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
            videoHeight: video.videoHeight,
            paused: video.paused,
            currentTime: video.currentTime
        };
    });

    console.log('\n📊 Ultra-Compat Video State:');
    console.log(JSON.stringify(videoState, null, 2));

    if (videoState.error) {
        console.log('\n❌ ULTRA-COMPAT VIDEO FAILED');
        console.log(`Error Code: ${videoState.error.code}`);
        console.log(`Error Message: ${videoState.error.message}`);
        console.log('\n🔍 This means even ultra-conservative encoding doesn\'t work!');
        console.log('   The issue is likely NOT related to video encoding.');
    } else if (videoState.readyState >= 3 && videoState.duration > 0) {
        console.log('\n✅ ULTRA-COMPAT VIDEO WORKS!');
        console.log(`Duration: ${videoState.duration}s`);
        console.log(`Resolution: ${videoState.videoWidth}x${videoState.videoHeight}`);
        console.log(`Playing: ${!videoState.paused}`);
        console.log('\n🎉 This proves the encoding settings are correct!');
        console.log('   The issue with other videos might be different.');
    } else {
        console.log('\n⏳ VIDEO LOADING...');
        console.log(`Ready State: ${videoState.readyState} (need >= 3)`);
    }

    await browser.close();
})();
