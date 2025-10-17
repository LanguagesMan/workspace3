const { test, expect } = require('@playwright/test');

test('Diagnose infinite loading issue', async ({ page }) => {
    console.log('=== INFINITE LOADING DIAGNOSTIC ===\n');

    const consoleLogs = [];
    const errors = [];

    // Capture console
    page.on('console', msg => {
        const text = msg.text();
        consoleLogs.push(text);
        console.log(`[CONSOLE ${msg.type()}]:`, text);
    });

    // Capture errors
    page.on('pageerror', error => {
        errors.push(error.message);
        console.error('[PAGE ERROR]:', error.message);
    });

    // Navigate
    console.log('Navigating to tiktok-video-feed.html...');
    await page.goto('http://localhost:3001/tiktok-video-feed.html', {
        waitUntil: 'domcontentloaded',
        timeout: 15000
    });

    // Check loading screen
    await page.waitForTimeout(3000);

    const loadingVisible = await page.locator('#loading').isVisible().catch(() => false);
    console.log('\n✅ Loading screen visible:', loadingVisible);

    // Check if videos loaded
    const videoCount = await page.locator('video').count();
    console.log('✅ Video elements:', videoCount);

    // Check if feed has content
    const feedHasChildren = await page.evaluate(() => {
        const feed = document.getElementById('feedContainer');
        return feed ? feed.children.length : 0;
    });
    console.log('✅ Feed children count:', feedHasChildren);

    // Wait longer
    console.log('\nWaiting 10 more seconds...');
    await page.waitForTimeout(10000);

    const loadingStillVisible = await page.locator('#loading').isVisible().catch(() => false);
    const videoCountAfter = await page.locator('video').count();
    const feedChildrenAfter = await page.evaluate(() => {
        const feed = document.getElementById('feedContainer');
        return feed ? feed.children.length : 0;
    });

    console.log('\n=== AFTER 13s TOTAL ===');
    console.log('Loading screen still visible:', loadingStillVisible);
    console.log('Videos:', videoCountAfter);
    console.log('Feed children:', feedChildrenAfter);

    // Check for specific error messages
    const loadingFilterMessage = consoleLogs.find(log => log.includes('browser-compatible encoding only'));
    console.log('\n✅ Found filtering message:', !!loadingFilterMessage);
    if (loadingFilterMessage) {
        console.log('   Message:', loadingFilterMessage);
    }

    // Check if getPersonalizedFeed completed
    const personalizedComplete = consoleLogs.find(log => log.includes('Final personalized feed'));
    console.log('✅ Personalization complete:', !!personalizedComplete);
    if (personalizedComplete) {
        console.log('   Message:', personalizedComplete);
    }

    // Check if renderVideosBatch was called
    const renderBatchCalled = consoleLogs.find(log => log.includes('Calling renderVideosBatch'));
    console.log('✅ Render batch called:', !!renderBatchCalled);
    if (renderBatchCalled) {
        console.log('   Message:', renderBatchCalled);
    }

    // Screenshot
    await page.screenshot({
        path: 'screenshots/diagnostic/infinite-loading-state.png',
        fullPage: true
    });

    console.log('\n📸 Screenshot saved to screenshots/diagnostic/infinite-loading-state.png');

    if (errors.length > 0) {
        console.log('\n❌ Page Errors Found:');
        errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
    }

    // Report
    console.log('\n=== DIAGNOSTIC SUMMARY ===');
    console.log('Issue:', loadingStillVisible ? '❌ STUCK ON LOADING' : '✅ Loading dismissed');
    console.log('Videos loaded:', videoCountAfter > 0 ? '✅ Yes' : '❌ No');
    console.log('Console logs:', consoleLogs.length);
    console.log('Page errors:', errors.length);
});
