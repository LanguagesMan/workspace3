const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    console.log('🔍 VISUAL AUDIT - FINDING ALL PROBLEMS\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });

    // Enable console logging
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ BROWSER ERROR:', msg.text());
        }
    });

    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForTimeout(5000);

    // Screenshot 1: Initial load
    await page.screenshot({ path: 'screenshots/audit-1-initial.png', fullPage: false });
    console.log('📸 Screenshot 1: Initial load');

    // Check what's actually visible
    const audit = await page.evaluate(() => {
        const video = document.querySelector('video');
        const spanishText = document.querySelector('.spanish-line')?.textContent || '';
        const englishText = document.querySelector('.english-line')?.textContent || '';

        return {
            videoSrc: video?.currentSrc || video?.src || 'NO VIDEO',
            videoError: video?.error?.message || null,
            videoReadyState: video?.readyState || 0,
            videoNetworkState: video?.networkState || 0,
            spanishSubtitle: spanishText,
            englishSubtitle: englishText,
            subtitleVisible: window.getComputedStyle(document.querySelector('.transcription-overlay') || document.body).display !== 'none',
            videoCards: document.querySelectorAll('.video-card').length,
            bodyText: document.body.innerText.substring(0, 500)
        };
    });

    console.log('\n🔍 AUDIT RESULTS:');
    console.log('═'.repeat(60));
    console.log('📹 Video:', audit.videoSrc.split('/').pop());
    console.log('   Ready State:', audit.videoReadyState, '(0=nothing, 2=enough, 4=all)');
    console.log('   Network State:', audit.videoNetworkState);
    if (audit.videoError) {
        console.log('   ❌ ERROR:', audit.videoError);
    }
    console.log('\n💬 Subtitles:');
    console.log('   Spanish:', audit.spanishSubtitle || 'NONE');
    console.log('   English:', audit.englishSubtitle || 'NONE');
    console.log('   Visible:', audit.subtitleVisible);
    console.log('\n📊 Stats:');
    console.log('   Video cards:', audit.videoCards);
    console.log('\n📄 Screen text preview:');
    console.log(audit.bodyText);
    console.log('═'.repeat(60));

    // Wait for video to try loading
    await page.waitForTimeout(8000);

    // Screenshot 2: After loading attempt
    await page.screenshot({ path: 'screenshots/audit-2-after-load.png', fullPage: false });
    console.log('\n📸 Screenshot 2: After 8s load time');

    // Check transcription timing
    const timingTest = await page.evaluate(() => {
        const video = document.querySelector('video');
        const spanish = document.querySelector('.spanish-line');
        const english = document.querySelector('.english-line');

        // Try to play video
        if (video && video.readyState >= 2) {
            video.currentTime = 1;
            video.play().catch(e => console.error('Play failed:', e));
        }

        return {
            videoTime: video?.currentTime || 0,
            spanish: spanish?.textContent || '',
            english: english?.textContent || '',
            videoPlaying: video && !video.paused
        };
    });

    console.log('\n⏱️  TIMING TEST:');
    console.log('   Video time:', timingTest.videoTime + 's');
    console.log('   Playing:', timingTest.videoPlaying);
    console.log('   Spanish shown:', timingTest.spanish);
    console.log('   English shown:', timingTest.english);

    await page.waitForTimeout(3000);

    // Screenshot 3: During playback
    await page.screenshot({ path: 'screenshots/audit-3-playback.png', fullPage: false });
    console.log('\n📸 Screenshot 3: During playback');

    // Scroll to next video
    await page.evaluate(() => {
        const cards = document.querySelectorAll('.video-card');
        if (cards[1]) {
            cards[1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    await page.waitForTimeout(3000);

    // Screenshot 4: Second video
    await page.screenshot({ path: 'screenshots/audit-4-second-video.png', fullPage: false });
    console.log('📸 Screenshot 4: Second video');

    // Check second video
    const secondVideo = await page.evaluate(() => {
        const videos = document.querySelectorAll('video');
        const video = videos[1] || videos[0];
        return {
            src: video?.currentSrc || video?.src || 'NONE',
            error: video?.error?.message || null,
            readyState: video?.readyState || 0
        };
    });

    console.log('\n📹 SECOND VIDEO:');
    console.log('   Src:', secondVideo.src.split('/').pop());
    console.log('   Ready:', secondVideo.readyState);
    if (secondVideo.error) {
        console.log('   ❌ ERROR:', secondVideo.error);
    }

    // Test navigation
    console.log('\n🧭 TESTING NAVIGATION...');

    // Click Discover
    try {
        await page.click('text=Discover');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/audit-5-discover.png', fullPage: false });
        console.log('📸 Screenshot 5: Discover page');

        const discoverNav = await page.evaluate(() => ({
            url: window.location.pathname,
            hasNav: !!document.querySelector('.bottom-nav'),
            navTabs: Array.from(document.querySelectorAll('.bottom-nav .nav-label')).map(el => el.textContent.trim())
        }));

        console.log('   URL:', discoverNav.url);
        console.log('   Has nav:', discoverNav.hasNav);
        console.log('   Tabs:', discoverNav.navTabs.join(' | '));
    } catch (e) {
        console.log('   ❌ Navigation failed:', e.message);
    }

    console.log('\n═'.repeat(60));
    console.log('✅ AUDIT COMPLETE');
    console.log('📸 Screenshots saved to screenshots/');
    console.log('═'.repeat(60));

    await page.waitForTimeout(5000);
    await browser.close();
})();
