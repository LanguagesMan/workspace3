const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

    console.log('🔍 Checking what user sees...\n');

    page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));

    await page.goto('http://localhost:3001/tiktok-video-feed.html', {
        waitUntil: 'domcontentloaded',
        timeout: 10000
    });

    await page.waitForTimeout(3000);

    // Check what's visible
    const visible = await page.evaluate(() => {
        const elements = {
            bottomNav: !!document.querySelector('.bottom-nav'),
            feedContainer: !!document.querySelector('.feed-container'),
            videos: document.querySelectorAll('video').length,
            videoCards: document.querySelectorAll('.video-card').length,
            statsBar: document.querySelector('#statsTopBar')?.style.display !== 'none',
            xpBadges: document.querySelectorAll('.xp-badge, .level-badge').length,
            textOnScreen: document.body.innerText.substring(0, 500)
        };
        return elements;
    });

    console.log('\n📊 WHAT USER SEES:');
    console.log(`  Bottom Nav: ${visible.bottomNav ? '✅ Visible' : '❌ Hidden'}`);
    console.log(`  Feed Container: ${visible.feedContainer ? '✅ Present' : '❌ Missing'}`);
    console.log(`  Videos: ${visible.videos}`);
    console.log(`  Video Cards: ${visible.videoCards}`);
    console.log(`  Stats Bar: ${visible.statsBar ? '❌ Showing' : '✅ Hidden'}`);
    console.log(`  Badges: ${visible.xpBadges}`);
    console.log(`\n📄 Text on screen:\n${visible.textOnScreen}`);

    await page.screenshot({ path: 'screenshots/visual-check.png', fullPage: true });
    console.log('\n📸 Screenshot: screenshots/visual-check.png');

    console.log('\n⏸️  Browser staying open for 10 seconds...');
    await page.waitForTimeout(10000);

    await browser.close();
})();
