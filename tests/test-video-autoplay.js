const { chromium } = require('playwright');

async function testVideoAutoplay() {
    const browser = await chromium.launch({
        headless: false, // Must be visible to test autoplay
        slowMo: 500
    });
    const page = await browser.newPage({ viewport: { width: 414, height: 896 } });

    console.log('🎬 TESTING TIKTOK-STYLE VIDEO AUTOPLAY\n');

    await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    console.log('📊 Testing autoplay on scroll...\n');

    // Get initial video states
    const initialStates = await page.evaluate(() => {
        const videos = Array.from(document.querySelectorAll('.feed-video'));
        return videos.slice(0, 3).map((v, i) => ({
            index: i,
            paused: v.paused,
            src: v.src,
            visible: v.offsetHeight > 0
        }));
    });

    console.log('Initial video states:', initialStates);

    // Wait for autoplay to trigger
    await page.waitForTimeout(2000);

    // Check if first video autoplayed
    const afterAutoplay = await page.evaluate(() => {
        const videos = Array.from(document.querySelectorAll('.feed-video'));
        return videos.slice(0, 3).map((v, i) => ({
            index: i,
            paused: v.paused,
            currentTime: v.currentTime,
            readyState: v.readyState
        }));
    });

    console.log('After autoplay:', afterAutoplay);

    // Test tap-to-pause interaction
    console.log('\n🎯 Testing tap-to-pause interaction...');
    const firstVideo = page.locator('.feed-video').first();
    await firstVideo.click();
    await page.waitForTimeout(500);

    const afterTap = await page.evaluate(() => {
        const video = document.querySelector('.feed-video');
        return {
            paused: video.paused,
            currentTime: video.currentTime
        };
    });

    console.log('After tap:', afterTap);

    // Scroll down to test pause on scroll
    console.log('\n📜 Scrolling down to test pause...');
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(2000);

    const afterScroll = await page.evaluate(() => {
        const videos = Array.from(document.querySelectorAll('.feed-video'));
        return videos.slice(0, 3).map((v, i) => ({
            index: i,
            paused: v.paused,
            visible: v.getBoundingClientRect().top >= 0 && v.getBoundingClientRect().top <= window.innerHeight
        }));
    });

    console.log('After scroll:', afterScroll);

    await page.screenshot({ path: 'screenshots/VIDEO-AUTOPLAY-TEST.png', fullPage: true });

    console.log('\n' + '='.repeat(70));
    console.log('✅ VIDEO AUTOPLAY TEST SUMMARY:');
    console.log('   - Videos detected:', initialStates.length);
    console.log('   - Autoplay triggered:', !afterAutoplay[0].paused);
    console.log('   - Tap-to-pause works:', afterTap.paused);
    console.log('   - Pause on scroll:', afterScroll[0].paused);
    console.log('='.repeat(70));

    console.log('\n⏸️  Browser open for 20s for manual testing...\n');
    await page.waitForTimeout(20000);

    await browser.close();
}

testVideoAutoplay().catch(console.error);
