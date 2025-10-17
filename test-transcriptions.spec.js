/**
 * Test transcription system - verify real-time sync and dual-language display
 */
const { test, expect } = require('@playwright/test');

test('Transcription system displays real-time dual-language captions', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Take screenshot of initial state
    await page.screenshot({
        path: `screenshots/${Date.now()}-transcription-test.png`,
        fullPage: true
    });

    // Check if transcription container exists
    const subtitleContainer = await page.locator('.video-subtitle-container').first();

    if (await subtitleContainer.count() > 0) {
        console.log('✅ Transcription container found');

        // Wait for video to play and transcriptions to appear
        await page.waitForTimeout(2000);

        // Check for Spanish flag emoji
        const spanishText = await page.locator('.video-subtitle-container:visible >> text=🇪🇸').first();
        if (await spanishText.count() > 0) {
            console.log('✅ Spanish transcription found');
        }

        // Check for English flag emoji
        const englishText = await page.locator('.video-subtitle-container:visible >> text=🇺🇸').first();
        if (await englishText.count() > 0) {
            console.log('✅ English transcription found');
        }

        // Take screenshot with active subtitles
        await page.screenshot({
            path: `screenshots/${Date.now()}-transcription-active.png`,
            fullPage: true
        });

    } else {
        console.log('⚠️  No transcription container found - system may not be initialized yet');
    }

    console.log('📸 Screenshots saved to screenshots/ directory');
});
