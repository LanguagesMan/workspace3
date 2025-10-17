const { chromium } = require('playwright');

(async () => {
    console.log('🎬 Final Video Feed Test\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Track console
    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        logs.push(text);
        if (text.includes('Video') || text.includes('error') || text.includes('Error') || text.includes('▶️') || text.includes('✅') || text.includes('❌')) {
            console.log(`[Browser] ${text}`);
        }
    });

    // Track network
    const videoRequests = [];
    page.on('response', response => {
        if (response.url().includes('/videos/')) {
            videoRequests.push({
                url: response.url().split('/').pop(),
                status: response.status(),
                type: response.headers()['content-type']
            });
            console.log(`📡 Video: ${response.url().split('/').pop()} - ${response.status()}`);
        }
    });

    try {
        console.log('📱 Loading feed...');
        await page.goto('http://localhost:3001/tiktok-video-feed.html', {
            waitUntil: 'domcontentloaded',
            timeout: 15000
        });

        // Wait for videos to load
        console.log('⏳ Waiting 10 seconds for videos to load...\n');
        await page.waitForTimeout(10000);

        // Check video elements
        const videoCount = await page.locator('video').count();
        console.log(`\n📊 Found ${videoCount} video elements`);

        if (videoCount > 0) {
            // Check first video
            const firstVideo = page.locator('video').first();
            const readyState = await firstVideo.evaluate(v => v.readyState);
            const paused = await firstVideo.evaluate(v => v.paused);
            const duration = await firstVideo.evaluate(v => v.duration);
            const error = await firstVideo.evaluate(v => v.error ? {code: v.error.code, message: v.error.message} : null);

            console.log('\n🎬 First Video Status:');
            console.log(`  Ready State: ${readyState} (0=nothing, 1=metadata, 2=current, 3=future, 4=enough)`);
            console.log(`  Paused: ${paused}`);
            console.log(`  Duration: ${duration}s`);
            console.log(`  Error: ${error ? JSON.stringify(error) : 'None'}`);

            if (error) {
                console.log('\n❌ VIDEO ERROR DETECTED:');
                console.log(`   Code: ${error.code}`);
                console.log(`   Message: ${error.message}`);
            } else if (readyState >= 3) {
                console.log('\n✅ VIDEO LOADED SUCCESSFULLY!');
            } else {
                console.log('\n⚠️  Video loading but not ready yet');
            }
        }

        // Screenshot
        await page.screenshot({ path: '/tmp/feed-final-test.png', fullPage: false });
        console.log('\n📸 Screenshot: /tmp/feed-final-test.png');

        // Summary
        console.log('\n📈 Summary:');
        console.log(`  Video elements: ${videoCount}`);
        console.log(`  Video requests: ${videoRequests.length}`);
        console.log(`  Console logs: ${logs.length}`);

        // Keep open for observation
        console.log('\n⏸️  Keeping browser open for 10 seconds...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ Test error:', error.message);
    } finally {
        await browser.close();
    }
})();
