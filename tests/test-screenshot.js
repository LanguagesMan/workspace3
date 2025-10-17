const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // iPhone 14 Pro size

    console.log('📸 Testing Videos page (default landing)...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/videos-landing.png', fullPage: false });

    // Test video player state
    const videoState = await page.evaluate(() => {
        const videos = document.querySelectorAll('video');
        const container = document.querySelector('.video-container');
        const nav = document.querySelector('.bottom-nav');
        const slides = document.querySelectorAll('.video-slide');

        return {
            videoCount: videos.length,
            firstVideoSrc: videos[0]?.src || 'none',
            firstVideoPaused: videos[0]?.paused,
            hasContainer: !!container,
            hasBottomNav: !!nav,
            navTabsCount: nav?.querySelectorAll('.nav-item').length,
            activeTab: nav?.querySelector('.nav-item.active')?.textContent.trim(),
            slideCount: slides.length
        };
    });

    console.log('Videos Page State:', JSON.stringify(videoState, null, 2));

    // Test navigation to Feed
    console.log('\n📸 Testing navigation to Feed...');
    await page.click('a[href="/unified-infinite-feed.html"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/feed-page.png', fullPage: false });

    const feedState = await page.evaluate(() => {
        const nav = document.querySelector('.bottom-nav');
        const feedCards = document.querySelectorAll('.feed-card, .card');

        return {
            hasBottomNav: !!nav,
            activeTab: nav?.querySelector('.nav-item.active')?.textContent.trim(),
            cardCount: feedCards.length
        };
    });

    console.log('Feed Page State:', JSON.stringify(feedState, null, 2));

    // Test navigation to Home
    console.log('\n📸 Testing navigation to Home...');
    await page.click('a[href="/home.html"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/home-page.png', fullPage: false });

    const homeState = await page.evaluate(() => {
        const nav = document.querySelector('.bottom-nav');
        const navCards = document.querySelectorAll('.nav-card');

        return {
            hasBottomNav: !!nav,
            activeTab: nav?.querySelector('.nav-item.active')?.textContent.trim(),
            navCardCount: navCards.length
        };
    });

    console.log('Home Page State:', JSON.stringify(homeState, null, 2));

    console.log('\n✅ Screenshots saved to screenshots/');
    await browser.close();
})();
