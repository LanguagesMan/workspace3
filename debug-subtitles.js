const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Listen to console logs
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('ERROR:', err.message));

    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);

    console.log('Clicking Tap to Start...');
    await page.click('text=Tap to Start');
    await page.waitForTimeout(3000);

    // Check for video
    const videoExists = await page.locator('video').count();
    console.log(`Videos found: ${videoExists}`);

    if (videoExists > 0) {
        const videoId = await page.locator('video').first().getAttribute('data-video-id');
        console.log(`Video ID: ${videoId}`);

        // Check for subtitle container
        const containerExists = await page.locator(`.video-subtitle-container[data-video-id="${videoId}"]`).count();
        console.log(`Subtitle container found: ${containerExists > 0}`);

        // Check if video is playing
        const isPaused = await page.evaluate(() => {
            const video = document.querySelector('video');
            return video ? video.paused : true;
        });
        console.log(`Video paused: ${isPaused}`);

        //Wait and check for subtitles
        await page.waitForTimeout(5000);

        const subtitles = await page.evaluate(() => {
            const container = document.querySelector('.video-subtitle-container');
            return container ? container.innerHTML : 'NO CONTAINER';
        });

        console.log('Subtitle container HTML:', subtitles);

        // Check if WordLevelSubtitles is loaded
        const wlsExists = await page.evaluate(() => {
            return typeof WordLevelSubtitles !== 'undefined';
        });
        console.log(`WordLevelSubtitles class loaded: ${wlsExists}`);
    }

    await page.waitForTimeout(5000);
    await browser.close();
})();
