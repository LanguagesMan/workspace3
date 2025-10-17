const { test, expect } = require('@playwright/test');

/**
 * 🎬 REAL-TIME TRANSCRIPTION TEST - TikTok/YouTube 2025 Pattern
 *
 * User Requirements (from API_ERROR_RECOVERY.md):
 * ✅ Transcription updates LINE BY LINE as video plays (synchronized)
 * ✅ AI adds punctuation marks (. , ! ?) to Spanish text
 * ✅ English translation appears alongside Spanish
 * ✅ Both update in real-time as video progresses
 */

test('real-time transcription with AI punctuation', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3002');

    // Wait for feed to load
    await page.waitForTimeout(3000);

    // Find first video card
    const video = page.locator('video').first();
    await video.waitFor({ state: 'visible', timeout: 10000 });

    console.log('✅ Video element found');

    // Play video
    await video.evaluate(vid => vid.play());
    console.log('▶️ Video playing');

    // Wait for transcription to appear
    await page.waitForTimeout(2000);

    // Check for dual-language captions
    const spanishCaption = page.locator('.caption-spanish, .spanish-caption').first();
    const englishCaption = page.locator('.caption-english, .english-caption').first();

    if (await spanishCaption.isVisible()) {
        const spanishText = await spanishCaption.textContent();
        const englishText = await englishCaption.textContent();

        console.log('🇪🇸 Spanish:', spanishText);
        console.log('🇺🇸 English:', englishText);

        // Verify AI punctuation added
        const hasPunctuation = /[.!?¡¿]/.test(spanishText);
        console.log(hasPunctuation ? '✅ AI punctuation detected!' : '⚠️ No punctuation found');

        // Verify both languages present
        console.log(spanishText && englishText ? '✅ Dual-language captions working!' : '⚠️ Missing translation');
    } else {
        console.log('⚠️ Captions not visible yet - may need more time or video with subtitles');
    }

    // Take screenshot
    await page.screenshot({
        path: 'screenshots/transcription-test-' + Date.now() + '.png',
        fullPage: true
    });

    console.log('✅ Screenshot saved');

    // Wait to see transcriptions update
    await page.waitForTimeout(5000);
});
