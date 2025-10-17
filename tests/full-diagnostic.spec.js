// Comprehensive diagnostic test
const { test, expect } = require('@playwright/test');

test('Full TikTok UI Diagnostic', async ({ page }) => {
    console.log('🔍 Starting full diagnostic...');

    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForTimeout(3000);

    // 1. Check videos loaded
    const videoCount = await page.locator('video').count();
    console.log(`📹 Videos loaded: ${videoCount}`);

    // 2. Check bottom menu
    const bottomNav = await page.locator('.bottom-nav').count();
    console.log(`📱 Bottom navigation: ${bottomNav}`);

    // 3. Check sidebar buttons
    const sidebarButtons = await page.locator('.sidebar-button').count();
    console.log(`🔘 Sidebar buttons: ${sidebarButtons}`);

    // 4. Play first video and check transcription
    if (videoCount > 0) {
        const firstVideo = await page.locator('video').first();

        // Play video
        await firstVideo.evaluate(video => {
            video.currentTime = 0.5;
            video.play();
        });

        await page.waitForTimeout(2000);

        // Check transcription overlay
        const overlayVisible = await page.locator('.transcription-overlay.active').count();
        console.log(`💬 Transcription overlays visible: ${overlayVisible}`);

        if (overlayVisible > 0) {
            const spanishText = await page.locator('.spanish-line').first().textContent();
            const englishText = await page.locator('.english-line').first().textContent();
            console.log(`🇪🇸 Spanish: "${spanishText}"`);
            console.log(`🇺🇸 English: "${englishText}"`);
        } else {
            console.log('❌ NO TRANSCRIPTIONS SHOWING!');
        }
    }

    // 5. Check video info
    const videoInfo = await page.locator('.video-info').count();
    console.log(`ℹ️ Video info panels: ${videoInfo}`);

    // 6. Screenshot current state
    await page.screenshot({ path: '/tmp/diagnostic-screenshot.png', fullPage: false });
    console.log('📸 Screenshot saved to /tmp/diagnostic-screenshot.png');

    // Report
    console.log('\n📊 SUMMARY:');
    console.log(`Videos: ${videoCount > 0 ? '✅' : '❌'}`);
    console.log(`Bottom Nav: ${bottomNav === 1 ? '✅' : '❌'}`);
    console.log(`Sidebar: ${sidebarButtons > 0 ? '✅' : '❌'}`);
});
