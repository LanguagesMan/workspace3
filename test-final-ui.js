const { chromium } = require('playwright');

(async () => {
    console.log('🎬 Testing Final UI Design...\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 } // iPhone 12
    });

    await page.goto('http://localhost:3001/tiktok-video-feed.html');

    // Wait for videos to load
    await page.waitForSelector('.video-card', { timeout: 10000 });

    // Check UI elements
    const uiCheck = await page.evaluate(() => ({
        // Bottom Nav
        bottomNav: {
            visible: !!document.querySelector('.bottom-nav'),
            tabs: Array.from(document.querySelectorAll('.bottom-nav .nav-label')).map(el => el.textContent.trim())
        },

        // Top Stats Bar
        topBar: {
            visible: !!document.querySelector('.stats-top-bar'),
            streak: document.querySelector('#streakDisplay')?.textContent || 'N/A',
            words: document.querySelector('#wordsDisplay')?.textContent || 'N/A',
            level: document.querySelector('#levelBadge')?.textContent || 'N/A'
        },

        // Playback Controls
        playbackControls: {
            visible: !!document.querySelector('.playback-controls'),
            buttons: Array.from(document.querySelectorAll('.playback-controls .playback-btn')).length
        },

        // Video Cards
        videos: {
            count: document.querySelectorAll('.video-card').length,
            firstVideoSrc: document.querySelector('video')?.getAttribute('src') || 'N/A'
        },

        // Difficulty Buttons
        difficulty: {
            tooEasy: !!document.querySelector('button[onclick*="Too Easy"]'),
            tooHard: !!document.querySelector('button[onclick*="Too Hard"]')
        },

        // Right Sidebar
        sidebar: {
            like: !!document.querySelector('.like-btn'),
            save: !!document.querySelector('.save-btn'),
            share: !!document.querySelector('.share-btn')
        }
    }));

    console.log('📊 UI AUDIT REPORT:\n');
    console.log('✅ Bottom Navigation:', uiCheck.bottomNav.tabs.join(' | '));
    console.log('✅ Top Stats Bar:', {
        Level: uiCheck.topBar.level,
        Streak: uiCheck.topBar.streak,
        Words: uiCheck.topBar.words
    });
    console.log('✅ Playback Controls:', `${uiCheck.playbackControls.buttons} buttons`);
    console.log('✅ Videos Loaded:', uiCheck.videos.count);
    console.log('✅ First Video Source:', uiCheck.videos.firstVideoSrc);
    console.log('✅ Difficulty Buttons:', uiCheck.difficulty);
    console.log('✅ Right Sidebar:', uiCheck.sidebar);

    // Check video loading
    await page.waitForTimeout(5000);

    const videoStatus = await page.evaluate(() => {
        const video = document.querySelector('video');
        return {
            readyState: video?.readyState,
            networkState: video?.networkState,
            error: video?.error?.message || null,
            src: video?.src || 'N/A',
            duration: video?.duration || 0
        };
    });

    console.log('\n🎥 VIDEO STATUS:', videoStatus);

    if (videoStatus.readyState >= 2) {
        console.log('✅ VIDEO IS PLAYABLE!');
    } else if (videoStatus.error) {
        console.log('❌ VIDEO ERROR:', videoStatus.error);
    } else {
        console.log('⏳ VIDEO STILL LOADING...');
    }

    // Take screenshot
    await page.screenshot({ path: 'screenshots/final-ui-check.png', fullPage: false });
    console.log('\n📸 Screenshot saved: screenshots/final-ui-check.png');

    console.log('\n⏸️  Browser staying open for 15 seconds...');
    await page.waitForTimeout(15000);

    await browser.close();
})();
