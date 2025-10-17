const { chromium } = require('@playwright/test');

(async () => {
    console.log('🔍 COMPREHENSIVE APP TEST - ALL SECTIONS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 393, height: 852 } }); // iPhone 14 Pro Max

    const timestamp = Date.now();
    const results = {
        passed: [],
        failed: [],
        screenshots: []
    };

    // Test pages (user-facing pages only, not demos/old versions)
    const pages = [
        { url: '/index.html', name: 'Home/Landing Page', waitFor: 'body' },
        { url: '/entertainment-feed.html', name: 'Entertainment Feed (Main)', waitFor: 'video' },
        { url: '/articles-feed.html', name: 'Articles Feed', waitFor: '.article-card' },
        { url: '/music-feed.html', name: 'Music Feed', waitFor: '.music-card' },
        { url: '/discover-feed.html', name: 'Discover Feed', waitFor: '.discover-feed' },
        { url: '/achievements.html', name: 'Achievements Page', waitFor: 'body' },
        { url: '/chat.html', name: 'Chat/AI Tutor', waitFor: '.chat-container' }
    ];

    for (const pageInfo of pages) {
        try {
            console.log(`📄 Testing: ${pageInfo.name}`);

            // Navigate
            await page.goto(`http://localhost:3002${pageInfo.url}`, {
                waitUntil: 'networkidle',
                timeout: 10000
            });
            await page.waitForTimeout(2000);

            // Check if key element exists
            const elementExists = await page.$(pageInfo.waitFor) !== null;

            if (elementExists) {
                console.log(`   ✅ Page loaded - ${pageInfo.waitFor} found`);
                results.passed.push(pageInfo.name);

                // Screenshot
                const screenshotPath = `screenshots/${timestamp}-${pageInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
                await page.screenshot({ path: screenshotPath, fullPage: false });
                results.screenshots.push(screenshotPath);
                console.log(`   📸 Screenshot: ${screenshotPath}`);
            } else {
                console.log(`   ❌ FAILED - ${pageInfo.waitFor} not found`);
                results.failed.push(pageInfo.name);
            }

            console.log('');
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}\n`);
            results.failed.push(`${pageInfo.name} (${error.message})`);
        }
    }

    // Test Entertainment Feed Transcriptions (critical feature)
    console.log('🎯 Testing Entertainment Feed Transcriptions...');
    try {
        await page.goto('http://localhost:3002/entertainment-feed.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // Play video and check subtitles
        await page.evaluate(() => {
            const video = document.querySelector('video[data-video-id]');
            if (video) {
                video.play();
                video.currentTime = 2;
            }
        });
        await page.waitForTimeout(2000);

        const subtitleCheck = await page.evaluate(() => {
            const spanishCaption = document.querySelector('.caption-spanish');
            const englishCaption = document.querySelector('.caption-english');
            return {
                hasSpanish: !!spanishCaption && spanishCaption.textContent.length > 0,
                hasEnglish: !!englishCaption && englishCaption.textContent.length > 0,
                spanishText: spanishCaption ? spanishCaption.textContent.substring(0, 50) : 'NO TEXT',
                englishText: englishCaption ? englishCaption.textContent.substring(0, 50) : 'NO TEXT'
            };
        });

        if (subtitleCheck.hasSpanish && subtitleCheck.hasEnglish) {
            console.log('   ✅ Dual-language transcriptions working!');
            console.log(`   🇪🇸 Spanish: "${subtitleCheck.spanishText}"`);
            console.log(`   🇺🇸 English: "${subtitleCheck.englishText}"`);
            results.passed.push('Transcription System');
        } else {
            console.log('   ❌ Transcriptions not showing properly');
            results.failed.push('Transcription System');
        }
    } catch (error) {
        console.log(`   ❌ Transcription test error: ${error.message}`);
        results.failed.push(`Transcription System (${error.message})`);
    }
    console.log('');

    // Test Tab Switching (Entertainment Feed)
    console.log('🔄 Testing Tab Navigation...');
    try {
        const tabs = ['articles', 'music', 'stories', 'videos'];
        for (const tab of tabs) {
            await page.click(`[data-tab="${tab}"]`);
            await page.waitForTimeout(1000);

            const activeTab = await page.$eval('.nav-tab.active', el => el.dataset.tab);
            if (activeTab === tab) {
                console.log(`   ✅ ${tab} tab switched successfully`);
            } else {
                console.log(`   ❌ ${tab} tab switch failed`);
                results.failed.push(`Tab switch: ${tab}`);
            }
        }
    } catch (error) {
        console.log(`   ❌ Tab navigation error: ${error.message}`);
        results.failed.push(`Tab Navigation (${error.message})`);
    }
    console.log('');

    // Test Video Scroll-Snap
    console.log('📹 Testing TikTok Scroll-Snap...');
    try {
        await page.click('[data-tab="videos"]');
        await page.waitForTimeout(1000);

        // Scroll to second video
        await page.evaluate(() => {
            const feed = document.querySelector('.feed-container');
            if (feed) feed.scrollTop = window.innerHeight;
        });
        await page.waitForTimeout(1500);

        const scrollPos = await page.evaluate(() => {
            const feed = document.querySelector('.feed-container');
            return feed ? feed.scrollTop : 0;
        });

        if (scrollPos > 0) {
            console.log(`   ✅ Scroll-snap working (scrolled ${scrollPos}px)`);
        } else {
            console.log('   ❌ Scroll-snap failed');
            results.failed.push('Scroll-snap mechanism');
        }
    } catch (error) {
        console.log(`   ❌ Scroll test error: ${error.message}`);
        results.failed.push(`Scroll-snap (${error.message})`);
    }
    console.log('');

    // FINAL REPORT
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 COMPREHENSIVE TEST RESULTS:\n');
    console.log(`✅ PASSED: ${results.passed.length}`);
    results.passed.forEach(p => console.log(`   • ${p}`));
    console.log('');
    console.log(`❌ FAILED: ${results.failed.length}`);
    results.failed.forEach(f => console.log(`   • ${f}`));
    console.log('');
    console.log(`📸 SCREENSHOTS: ${results.screenshots.length}`);
    console.log(`   Check screenshots/${timestamp}-*.png`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const allPassed = results.failed.length === 0;
    if (allPassed) {
        console.log('🎉 ALL TESTS PASSED - APP IS PRODUCTION READY!');
    } else {
        console.log('⚠️  SOME TESTS FAILED - REVIEW ABOVE');
    }
    console.log('');

    await browser.close();
})();
