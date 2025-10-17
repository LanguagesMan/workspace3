const { chromium } = require('@playwright/test');

(async () => {
    console.log('📸 COMPREHENSIVE SCREENSHOT - ALL SECTIONS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 393, height: 852 } }); // iPhone 14 Pro Max size

    try {
        const timestamp = Date.now();

        // 1. Entertainment Feed - Videos Tab (Default)
        console.log('1️⃣ Entertainment Feed - Videos Tab');
        await page.goto('http://localhost:3002/entertainment-feed.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000); // Wait for videos to load

        // Play first video
        await page.evaluate(() => {
            const video = document.querySelector('video');
            if (video) video.play();
        });
        await page.waitForTimeout(3000);

        await page.screenshot({
            path: `screenshots/${timestamp}-1-videos-tab.png`,
            fullPage: false
        });
        console.log('   ✅ Saved: videos-tab.png\n');

        // 2. Entertainment Feed - Articles Tab
        console.log('2️⃣ Entertainment Feed - Articles Tab');
        await page.click('[data-tab="articles"]');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: `screenshots/${timestamp}-2-articles-tab.png`,
            fullPage: false
        });
        console.log('   ✅ Saved: articles-tab.png\n');

        // 3. Entertainment Feed - Music Tab
        console.log('3️⃣ Entertainment Feed - Music Tab');
        await page.click('[data-tab="music"]');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: `screenshots/${timestamp}-3-music-tab.png`,
            fullPage: false
        });
        console.log('   ✅ Saved: music-tab.png\n');

        // 4. Entertainment Feed - Stories Tab
        console.log('4️⃣ Entertainment Feed - Stories Tab');
        await page.click('[data-tab="stories"]');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: `screenshots/${timestamp}-4-stories-tab.png`,
            fullPage: false
        });
        console.log('   ✅ Saved: stories-tab.png\n');

        // 5. Back to videos - Test scroll-snap
        console.log('5️⃣ Testing TikTok Scroll-Snap');
        await page.click('[data-tab="videos"]');
        await page.waitForTimeout(2000);

        // Scroll to second video
        await page.evaluate(() => {
            const feed = document.querySelector('.feed-container');
            if (feed) feed.scrollTop = window.innerHeight;
        });
        await page.waitForTimeout(1500);

        await page.screenshot({
            path: `screenshots/${timestamp}-5-scroll-snap.png`,
            fullPage: false
        });
        console.log('   ✅ Saved: scroll-snap.png\n');

        // 6. Transcription close-up
        console.log('6️⃣ Transcription Close-Up (with Spanish + English)');
        await page.evaluate(() => {
            const videos = document.querySelectorAll('video');
            if (videos[1]) {
                videos[1].play();
                videos[1].currentTime = 2;
            }
        });
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: `screenshots/${timestamp}-6-transcription-closeup.png`,
            fullPage: false
        });
        console.log('   ✅ Saved: transcription-closeup.png\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ALL SCREENSHOTS SAVED!');
        console.log(`   Check screenshots/${timestamp}-*.png`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Screenshot error:', error.message);
    } finally {
        await browser.close();
    }
})();
