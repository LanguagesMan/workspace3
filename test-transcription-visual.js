const { chromium } = require('@playwright/test');

(async () => {
    const browser = await chromium.launch({ headless: false }); // HEADED - see it!
    const page = await browser.newPage();

    console.log('🎯 Opening entertainment-feed...');
    await page.goto('http://localhost:3002/entertainment-feed.html');

    // Wait for feed to load
    await page.waitForTimeout(3000);

    console.log('📹 Looking for videos...');
    const videos = await page.$$('video');
    console.log(`Found ${videos.length} videos`);

    if (videos.length > 0) {
        console.log('▶️  Playing first video...');
        await page.evaluate(() => {
            const video = document.querySelector('video');
            if (video) {
                video.play();
                console.log('Video playing:', video.currentSrc);
            }
        });

        // Wait and watch for subtitle changes
        console.log('👀 Watching for transcriptions (10 seconds)...');
        for (let i = 0; i < 10; i++) {
            await page.waitForTimeout(1000);

            const subtitleInfo = await page.evaluate(() => {
                const subtitleContainer = document.querySelector('.video-subtitle-container');
                const dualCaption = document.querySelector('.dual-caption-block');
                const spanish = document.querySelector('.caption-spanish');
                const english = document.querySelector('.caption-english');

                return {
                    containerExists: !!subtitleContainer,
                    captionExists: !!dualCaption,
                    spanishText: spanish ? spanish.textContent : 'No Spanish text',
                    englishText: english ? english.textContent : 'No English text'
                };
            });

            console.log(`[${i+1}s] Transcription:`, subtitleInfo);
        }
    }

    console.log('\n✅ Visual inspection complete. Check browser for flashing issues!');
    console.log('Press Ctrl+C when done inspecting...');

    // Keep browser open for manual inspection
    await page.waitForTimeout(300000); // 5 minutes

    await browser.close();
})();
