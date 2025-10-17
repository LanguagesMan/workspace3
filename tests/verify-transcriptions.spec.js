// Test that transcriptions appear when video plays
const { test, expect } = require('@playwright/test');

test('Transcriptions appear when video plays', async ({ page }) => {
    await page.goto('http://localhost:3001/tiktok-video-feed.html');

    // Wait for videos to load
    await page.waitForSelector('.video-card', { timeout: 10000 });

    console.log('✅ Videos loaded');

    // Get first video element
    const firstVideo = await page.locator('video').first();

    // Play the video
    await firstVideo.evaluate(video => {
        video.currentTime = 0.5; // Jump to 0.5s where first transcription should be
        video.play();
    });

    // Wait for transcription overlay to appear
    await page.waitForTimeout(1000);

    // Check if transcription overlay is visible
    const overlayVisible = await page.locator('.transcription-overlay.active').count();
    console.log(`Transcription overlays visible: ${overlayVisible}`);

    // Check for Spanish text
    const spanishText = await page.locator('.spanish-line').first().textContent();
    console.log(`Spanish text: "${spanishText}"`);

    // Check for English text
    const englishText = await page.locator('.english-line').first().textContent();
    console.log(`English text: "${englishText}"`);

    // Check for clickable words
    const clickableWords = await page.locator('.word').count();
    console.log(`Clickable words: ${clickableWords}`);

    // Verify bottom menu (should be 1 only)
    const bottomNav = await page.locator('.bottom-nav').count();
    console.log(`Bottom navigation menus: ${bottomNav}`);

    // Verify sidebar buttons
    const sidebarButtons = await page.locator('.sidebar-button').count();
    console.log(`Sidebar buttons: ${sidebarButtons}`);

    expect(overlayVisible).toBeGreaterThan(0);
    expect(spanishText.length).toBeGreaterThan(0);
    expect(englishText.length).toBeGreaterThan(0);
    expect(clickableWords).toBeGreaterThan(0);
    expect(bottomNav).toBe(1);
});
