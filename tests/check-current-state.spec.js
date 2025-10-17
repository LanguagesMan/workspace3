const { test, expect } = require('@playwright/test');

test('Check current entertainment-feed state', async ({ page }) => {
    await page.goto('http://localhost:3001/entertainment-feed.html', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
    });

    await page.waitForTimeout(5000);

    // Check for menus
    const topNav = await page.locator('.top-nav-tabs').count();
    const bottomNav = await page.locator('.bottom-nav-bar').count();

    console.log(`\n📊 CURRENT STATE:`);
    console.log(`   Top navigation: ${topNav > 0 ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`   Bottom navigation: ${bottomNav > 0 ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`   TOTAL MENUS: ${topNav + bottomNav}`);

    // Check for videos
    const videos = await page.locator('video').count();
    console.log(`   Videos loaded: ${videos}`);

    // Check for transcriptions
    const transcriptions = await page.locator('[id^="subtitle-"], .trans-line, .video-subtitle-container').count();
    console.log(`   Transcription elements: ${transcriptions}`);

    // Check for action buttons
    const actionButtons = await page.locator('.action-btn, .card-actions button').count();
    console.log(`   Action buttons: ${actionButtons}`);

    // Take screenshot
    await page.screenshot({
        path: '/tmp/current-state-check.png',
        fullPage: true
    });
    console.log(`\n✅ Screenshot: /tmp/current-state-check.png\n`);
});
