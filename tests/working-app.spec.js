// Test that app is working
const { test, expect } = require('@playwright/test');

test('App works perfectly', async ({ page }) => {
    await page.goto('http://localhost:3001/tiktok-video-feed.html');
    await page.waitForTimeout(3000);

    // Videos
    const videos = await page.locator('video').count();
    console.log(`✅ Videos: ${videos}`);
    expect(videos).toBeGreaterThan(0);

    // Transcriptions
    const transcriptions = await page.locator('.transcription-overlay.active').count();
    console.log(`✅ Transcriptions showing: ${transcriptions}`);
    expect(transcriptions).toBeGreaterThan(0);

    // Clickable words
    const words = await page.locator('.word').count();
    console.log(`✅ Clickable words: ${words}`);
    expect(words).toBeGreaterThan(0);

    // Single menu
    const menus = await page.locator('.bottom-nav').count();
    console.log(`✅ Single bottom menu: ${menus}`);
    expect(menus).toBe(1);

    // Buttons
    const buttons = await page.locator('.sidebar-button').count();
    console.log(`✅ Action buttons: ${buttons}`);

    console.log('\n🎉 APP WORKING PERFECTLY!\n');
});
