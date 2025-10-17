const { chromium } = require('playwright');

(async () => {
    console.log('🧪 COMPREHENSIVE TEST SUITE\n');
    console.log('Testing all critical functionality...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    const results = {
        passed: [],
        failed: [],
        warnings: []
    };

    // TEST 1: Page loads
    console.log('📄 TEST 1: Page Load');
    try {
        await page.goto('http://localhost:3001/tiktok-video-feed.html', { timeout: 10000 });
        results.passed.push('Page loads successfully');
        console.log('   ✅ PASS\n');
    } catch (e) {
        results.failed.push(`Page load failed: ${e.message}`);
        console.log('   ❌ FAIL\n');
    }

    // TEST 2: Videos load
    console.log('📹 TEST 2: Videos Load');
    try {
        await page.waitForSelector('.video-card', { timeout: 8000 });
        const videoCount = await page.evaluate(() => document.querySelectorAll('.video-card').length);
        if (videoCount > 0) {
            results.passed.push(`${videoCount} video cards loaded`);
            console.log(`   ✅ PASS: ${videoCount} videos\n`);
        } else {
            results.failed.push('No videos loaded');
            console.log('   ❌ FAIL: 0 videos\n');
        }
    } catch (e) {
        results.failed.push(`Videos load failed: ${e.message}`);
        console.log('   ❌ FAIL\n');
    }

    // TEST 3: Transcriptions visible
    console.log('💬 TEST 3: Transcriptions Display');
    try {
        await page.waitForTimeout(3000);
        const transcript = await page.evaluate(() => {
            const spanish = document.querySelector('.spanish-line')?.textContent || '';
            const english = document.querySelector('.english-line')?.textContent || '';
            return { spanish, english };
        });

        if (transcript.spanish.length > 0) {
            results.passed.push(`Spanish transcript: "${transcript.spanish.substring(0, 30)}..."`);
            console.log(`   ✅ Spanish: ${transcript.spanish.substring(0, 50)}...\n`);
        } else {
            results.failed.push('No Spanish transcript');
            console.log('   ❌ No Spanish transcript\n');
        }

        if (transcript.english.length > 0) {
            results.passed.push(`English translation: "${transcript.english.substring(0, 30)}..."`);
            console.log(`   ✅ English: ${transcript.english.substring(0, 50)}...\n`);
        } else {
            results.warnings.push('No English translation');
            console.log('   ⚠️  No English translation\n');
        }
    } catch (e) {
        results.failed.push(`Transcription test failed: ${e.message}`);
        console.log('   ❌ FAIL\n');
    }

    // TEST 4: Bottom nav
    console.log('🧭 TEST 4: Bottom Navigation');
    try {
        const nav = await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('.bottom-nav .nav-label'));
            return tabs.map(t => t.textContent.trim());
        });

        if (nav.length === 4) {
            results.passed.push(`Bottom nav: ${nav.join(' | ')}`);
            console.log(`   ✅ ${nav.join(' | ')}\n`);
        } else {
            results.failed.push(`Wrong nav count: ${nav.length}`);
            console.log(`   ❌ Expected 4 tabs, got ${nav.length}\n`);
        }
    } catch (e) {
        results.failed.push(`Nav test failed: ${e.message}`);
        console.log('   ❌ FAIL\n');
    }

    // TEST 5: Gamification bar
    console.log('🎮 TEST 5: Top Gamification Bar');
    try {
        const stats = await page.evaluate(() => ({
            visible: !!document.querySelector('.stats-top-bar'),
            streak: document.querySelector('#streakDisplay')?.textContent || 'N/A',
            level: document.querySelector('#levelBadge')?.textContent || 'N/A'
        }));

        if (stats.visible) {
            results.passed.push(`Gamification: Level ${stats.level}, Streak ${stats.streak}`);
            console.log(`   ✅ Level: ${stats.level}, Streak: 🔥${stats.streak}\n`);
        } else {
            results.failed.push('Gamification bar not visible');
            console.log('   ❌ Not visible\n');
        }
    } catch (e) {
        results.failed.push(`Gamification test failed: ${e.message}`);
        console.log('   ❌ FAIL\n');
    }

    // TEST 6: Spammy popups (should NOT be visible)
    console.log('🚫 TEST 6: Popup Spam Check');
    try {
        const popups = await page.evaluate(() => ({
            quizPrompt: window.getComputedStyle(document.querySelector('#videoQuizPrompt')).display !== 'none',
            milestone: document.querySelector('.milestone-modal.show') !== null
        }));

        if (!popups.quizPrompt && !popups.milestone) {
            results.passed.push('No spammy popups visible');
            console.log('   ✅ Clean UI, no spam\n');
        } else {
            results.warnings.push(`Popups visible: quiz=${popups.quizPrompt}, milestone=${popups.milestone}`);
            console.log(`   ⚠️  Popups showing: ${JSON.stringify(popups)}\n`);
        }
    } catch (e) {
        results.warnings.push(`Popup check failed: ${e.message}`);
        console.log('   ⚠️  Check failed\n');
    }

    // TEST 7: Video playability
    console.log('▶️  TEST 7: Video Playability');
    try {
        const videoStatus = await page.evaluate(() => {
            const video = document.querySelector('video');
            return {
                src: video?.src?.split('/').pop() || 'N/A',
                readyState: video?.readyState || 0,
                error: video?.error?.message || null
            };
        });

        if (videoStatus.readyState >= 2) {
            results.passed.push(`Video playable: ${videoStatus.src}`);
            console.log(`   ✅ ${videoStatus.src} is playable\n`);
        } else if (videoStatus.error) {
            results.failed.push(`Video error: ${videoStatus.error}`);
            console.log(`   ❌ ERROR: ${videoStatus.error}\n`);
        } else {
            results.warnings.push(`Video loading: readyState=${videoStatus.readyState}`);
            console.log(`   ⚠️  Still loading (readyState: ${videoStatus.readyState})\n`);
        }
    } catch (e) {
        results.failed.push(`Video playability test failed: ${e.message}`);
        console.log('   ❌ FAIL\n');
    }

    // Screenshot
    await page.screenshot({ path: 'screenshots/comprehensive-test.png' });
    console.log('📸 Screenshot: screenshots/comprehensive-test.png\n');

    // FINAL REPORT
    console.log('═'.repeat(60));
    console.log('📊 FINAL REPORT');
    console.log('═'.repeat(60));
    console.log(`✅ PASSED: ${results.passed.length}`);
    results.passed.forEach(p => console.log(`   ✓ ${p}`));
    console.log(`\n⚠️  WARNINGS: ${results.warnings.length}`);
    results.warnings.forEach(w => console.log(`   ! ${w}`));
    console.log(`\n❌ FAILED: ${results.failed.length}`);
    results.failed.forEach(f => console.log(`   ✗ ${f}`));
    console.log('═'.repeat(60));

    const score = results.passed.length / (results.passed.length + results.failed.length) * 100;
    console.log(`\n🎯 TEST SCORE: ${score.toFixed(0)}%\n`);

    await page.waitForTimeout(10000);
    await browser.close();
})();
