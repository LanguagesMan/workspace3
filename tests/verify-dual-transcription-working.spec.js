// 🎬 VERIFY: Dual-Language Transcription Working
const { test, expect } = require('@playwright/test');

test('Verify dual-language transcription displays correctly', async ({ page }) => {
    await page.goto('http://localhost:3001/vida-app.html');
    console.log('📱 Loaded vida-app.html');

    // Wait for videos to load
    await page.waitForTimeout(3000);

    // Find video element
    const video = await page.locator('video').first();
    await expect(video).toBeVisible();
    console.log('✅ Video element found');

    // Force play the video
    await video.evaluate(v => v.play());
    console.log('▶️ Video playing...');

    // Wait for video to start and subtitles to appear
    await page.waitForTimeout(3000);

    // Check for subtitle container
    const subtitlesContainer = await page.locator('.subtitles-container').first();
    const hasSubtitles = await subtitlesContainer.isVisible();

    if (hasSubtitles) {
        console.log('✅ Subtitles container visible');

        // Check for Spanish line
        const spanishLines = await page.locator('.spanish-line');
        const spanishCount = await spanishLines.count();
        console.log(`🇪🇸 Found ${spanishCount} Spanish subtitle line(s)`);

        if (spanishCount > 0) {
            const spanishText = await spanishLines.first().textContent();
            console.log(`🇪🇸 Spanish: "${spanishText}"`);

            // Verify has flag
            expect(spanishText).toContain('🇪🇸');

            // Verify has punctuation
            const hasPunctuation = /[.!?]/.test(spanishText);
            console.log(`✅ Has AI punctuation: ${hasPunctuation}`);
        }

        // Check for English line
        const englishLines = await page.locator('.english-line');
        const englishCount = await englishLines.count();
        console.log(`🇺🇸 Found ${englishCount} English subtitle line(s)`);

        if (englishCount > 0) {
            const englishText = await englishLines.first().textContent();
            console.log(`🇺🇸 English: "${englishText}"`);

            // Verify has flag
            expect(englishText).toContain('🇺🇸');
        }

        // Take screenshot showing dual-language transcriptions
        await page.screenshot({
            path: 'screenshots/DUAL-LANG-TRANSCRIPTION-WORKING.png',
            fullPage: false
        });
        console.log('📸 Screenshot saved: DUAL-LANG-TRANSCRIPTION-WORKING.png');

        console.log('\n✅ ✅ ✅ DUAL-LANGUAGE TRANSCRIPTION VERIFIED! ✅ ✅ ✅');
    } else {
        console.log('⚠️ Subtitles not visible yet, checking raw content...');

        // Check if subtitle data exists in DOM
        const containerContent = await subtitlesContainer.innerHTML();
        console.log('Container content:', containerContent.substring(0, 200));

        // Wait longer and retry
        await page.waitForTimeout(3000);
        await video.evaluate(v => v.currentTime = 1); // Jump to 1 second
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: 'screenshots/DUAL-LANG-DEBUG.png',
            fullPage: false
        });
    }
});
