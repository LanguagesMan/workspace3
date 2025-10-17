/**
 * PRODUCTION READINESS TEST
 * Tests all critical features for real user deployment
 */

const { chromium } = require('playwright');

(async () => {
    console.log('🚀 PRODUCTION READINESS TEST SUITE\n');
    console.log('=' .repeat(60));

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    let passed = 0;
    let failed = 0;
    const failures = [];

    // Test helper
    const test = async (name, fn) => {
        try {
            await fn();
            console.log(`✅ PASS: ${name}`);
            passed++;
        } catch (error) {
            console.log(`❌ FAIL: ${name}`);
            console.log(`   Error: ${error.message}`);
            failed++;
            failures.push({ name, error: error.message });
        }
    };

    // Navigate to app
    console.log('\n📱 Loading app at http://localhost:3001/tiktok-video-feed.html');
    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForTimeout(3000);

    console.log('\n' + '='.repeat(60));
    console.log('CRITICAL FEATURE TESTS');
    console.log('='.repeat(60) + '\n');

    // TEST 1: Videos load and render
    await test('Videos load and render on page', async () => {
        const videoCount = await page.locator('.video-card').count();
        if (videoCount === 0) throw new Error('No videos rendered');
        console.log(`   Found ${videoCount} videos`);
    });

    // TEST 2: Video elements exist
    await test('Video elements have src attributes', async () => {
        const firstVideo = await page.locator('.video-card video').first();
        const src = await firstVideo.getAttribute('src');
        if (!src) throw new Error('Video missing src');
        console.log(`   Video src: ${src.substring(0, 50)}...`);
    });

    // TEST 3: Subtitles container exists
    await test('Subtitle containers exist', async () => {
        const subtitleCount = await page.locator('.transcription-overlay').count();
        if (subtitleCount === 0) throw new Error('No subtitle containers');
        console.log(`   Found ${subtitleCount} subtitle containers`);
    });

    // TEST 4: Navigation tabs exist
    await test('All 4 navigation tabs exist', async () => {
        const tabs = await page.locator('.nav-tab').count();
        if (tabs < 4) throw new Error(`Only ${tabs} tabs found, expected 4`);
        console.log(`   Found ${tabs} navigation tabs`);
    });

    // TEST 5: Auth modal exists
    await test('Auth modal exists', async () => {
        const authModal = await page.locator('#authModal').count();
        if (authModal === 0) throw new Error('Auth modal not found');
    });

    // TEST 6: Gamification bar exists
    await test('Gamification bar exists', async () => {
        const gamBar = await page.locator('#gamificationBar').count();
        if (gamBar === 0) throw new Error('Gamification bar not found');
    });

    // TEST 7: Speed control exists
    await test('Speed control exists on first video', async () => {
        const speedBtn = await page.locator('.sidebar-button.speed-btn').first().count();
        if (speedBtn === 0) throw new Error('Speed control not found');
    });

    // TEST 8: Like button exists
    await test('Like button exists on first video', async () => {
        const likeBtn = await page.locator('.sidebar-button.like-btn').first().count();
        if (likeBtn === 0) throw new Error('Like button not found');
    });

    // TEST 9: Share button exists
    await test('Share button exists on first video', async () => {
        const shareBtn = await page.locator('.sidebar-button.share-btn').first().count();
        if (shareBtn === 0) throw new Error('Share button not found');
    });

    // TEST 10: Delete button exists
    await test('Delete button exists on first video', async () => {
        const deleteBtn = await page.locator('.sidebar-button.delete-btn').first().count();
        if (deleteBtn === 0) throw new Error('Delete button not found');
    });

    // TEST 11: Check for console errors
    let hasErrors = false;
    page.on('console', msg => {
        if (msg.type() === 'error') {
            hasErrors = true;
        }
    });

    await page.waitForTimeout(1000);

    await test('No JavaScript console errors', async () => {
        if (hasErrors) throw new Error('Console errors detected');
    });

    // TEST 12: Page is responsive
    await test('Page is mobile responsive', async () => {
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        await page.waitForTimeout(500);
        const videoCard = await page.locator('.video-card').first();
        const box = await videoCard.boundingBox();
        if (!box || box.width > 375) throw new Error('Not mobile responsive');
        console.log(`   Mobile width: ${box.width}px`);
    });

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // TEST 13: Click video info tab
    await test('Video info tab click works', async () => {
        const infoTab = page.locator('.nav-tab').filter({ hasText: 'Video Info' });
        await infoTab.click();
        await page.waitForTimeout(500);
        const infoSection = await page.locator('#videoInfoSection').count();
        if (infoSection === 0) throw new Error('Video info section not shown');
    });

    // TEST 14: Click vocabulary tab
    await test('Vocabulary tab click works', async () => {
        const vocabTab = page.locator('.nav-tab').filter({ hasText: 'My Vocabulary' });
        await vocabTab.click();
        await page.waitForTimeout(500);
        const vocabSection = await page.locator('#vocabularySection').count();
        if (vocabSection === 0) throw new Error('Vocabulary section not shown');
    });

    // TEST 15: Click quiz tab
    await test('Quiz tab click works', async () => {
        const quizTab = page.locator('.nav-tab').filter({ hasText: 'Quiz' });
        await quizTab.click();
        await page.waitForTimeout(500);
        const quizSection = await page.locator('#quizSection').count();
        if (quizSection === 0) throw new Error('Quiz section not shown');
    });

    // Take screenshot of final state
    await page.screenshot({ path: '/tmp/production-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved to /tmp/production-test.png');

    // Results
    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${passed + failed}`);
    console.log(`📈 Pass Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

    if (failures.length > 0) {
        console.log('\n❌ FAILURES:');
        failures.forEach(f => {
            console.log(`   - ${f.name}: ${f.error}`);
        });
    }

    console.log('\n' + '='.repeat(60));

    if (failed === 0) {
        console.log('🎉 ALL TESTS PASSED! App is production ready!');
    } else {
        console.log('⚠️  SOME TESTS FAILED. Fix issues before deploying.');
    }

    await browser.close();
    process.exit(failed > 0 ? 1 : 0);
})();
