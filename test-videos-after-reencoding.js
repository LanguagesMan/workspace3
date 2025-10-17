const { chromium } = require('playwright');

(async () => {
    console.log('🎬 Testing videos after re-encoding...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    // Collect video errors
    const videoErrors = [];
    const videoSuccesses = [];

    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Video #') && text.includes('error')) {
            videoErrors.push(text);
        }
        if (text.includes('SUCCESS') || text.includes('loaded') || text.includes('playing')) {
            videoSuccesses.push(text);
        }
    });

    try {
        console.log('📄 Loading TikTok Video Feed...');
        await page.goto('http://localhost:3001/tiktok-video-feed.html', {
            waitUntil: 'domcontentloaded',
            timeout: 15000
        });

        console.log('⏱️  Waiting for videos to load (5 seconds)...');
        await page.waitForTimeout(5000);

        // Check video elements for errors
        const videos = await page.$$('video');
        console.log(`📹 Found ${videos.length} video elements\n`);

        let playableCount = 0;
        let errorCount = 0;

        for (let i = 0; i < Math.min(videos.length, 10); i++) {
            const errorCode = await videos[i].evaluate(v => v.error?.code);
            const errorMessage = await videos[i].evaluate(v => v.error?.message);
            const readyState = await videos[i].evaluate(v => v.readyState);
            const networkState = await videos[i].evaluate(v => v.networkState);
            const src = await videos[i].evaluate(v => v.currentSrc);

            if (errorCode) {
                errorCount++;
                console.log(`❌ Video ${i + 1}: Error ${errorCode} - ${errorMessage}`);
            } else if (readyState >= 2) {
                // HAVE_CURRENT_DATA or better
                playableCount++;
                console.log(`✅ Video ${i + 1}: Playable (readyState: ${readyState})`);
            } else {
                console.log(`⏳ Video ${i + 1}: Loading (readyState: ${readyState}, networkState: ${networkState})`);
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Playable: ${playableCount}/${Math.min(videos.length, 10)}`);
        console.log(`   ❌ Errors: ${errorCount}/${Math.min(videos.length, 10)}`);
        console.log(`   📝 Console video errors: ${videoErrors.length}`);
        console.log(`   📝 Console video successes: ${videoSuccesses.length}`);

        if (errorCount === 0 && playableCount > 0) {
            console.log(`\n🎉 SUCCESS! Videos are now working after re-encoding!`);
        } else if (errorCount > 0) {
            console.log(`\n⚠️  Still have video errors. May need additional fixes.`);
            if (videoErrors.length > 0) {
                console.log(`\nFirst few console errors:`);
                videoErrors.slice(0, 3).forEach(err => console.log(`  - ${err}`));
            }
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }

    await browser.close();
})();
