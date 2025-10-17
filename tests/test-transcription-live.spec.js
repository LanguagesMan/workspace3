const { test, expect } = require('@playwright/test');

test.describe('Transcription System - Live Testing', () => {
    test('should show real-time dual-language transcriptions without flashing', async ({ page }) => {
        // Go to TikTok feed
        await page.goto('http://localhost:3001/tiktok-video-feed.html');

        // Wait for videos to load
        await page.waitForSelector('.video-card', { timeout: 10000 });

        console.log('✅ Videos loaded');

        // Get first video
        const firstVideo = await page.locator('.video-card').first();
        const video = await firstVideo.locator('video');
        const transcriptionOverlay = await firstVideo.locator('.transcription-overlay');

        // Play video
        await video.evaluate(v => v.play());
        console.log('▶️ Video playing');

        // Wait for transcription to appear
        await page.waitForTimeout(1000);

        // Check if transcription overlay is visible
        const isVisible = await transcriptionOverlay.evaluate(el => {
            const computedStyle = window.getComputedStyle(el);
            return computedStyle.display !== 'none' && el.classList.contains('active');
        });

        console.log(`📝 Transcription overlay visible: ${isVisible}`);

        if (isVisible) {
            // Get Spanish and English lines
            const spanishText = await firstVideo.locator('.spanish-line').innerText();
            const englishText = await firstVideo.locator('.english-line').innerText();

            console.log('🇪🇸 Spanish:', spanishText);
            console.log('🇺🇸 English:', englishText);

            // Check for punctuation
            const hasPunctuation = /[.!?]/.test(spanishText);
            console.log(`✅ Has punctuation: ${hasPunctuation}`);

            // Check for clickable words
            const wordCount = await firstVideo.locator('.spanish-line .word').count();
            console.log(`📝 Clickable words: ${wordCount}`);
        }

        // Monitor for flashing (transcription appearing/disappearing rapidly)
        let displayChanges = 0;
        let lastDisplay = await transcriptionOverlay.evaluate(el =>
            window.getComputedStyle(el).display
        );

        for (let i = 0; i < 10; i++) {
            await page.waitForTimeout(300);
            const currentDisplay = await transcriptionOverlay.evaluate(el =>
                window.getComputedStyle(el).display
            );

            if (currentDisplay !== lastDisplay) {
                displayChanges++;
                console.log(`⚡ Display changed from ${lastDisplay} to ${currentDisplay}`);
                lastDisplay = currentDisplay;
            }
        }

        console.log(`📊 Total display changes in 3 seconds: ${displayChanges}`);

        // Flashing detected if more than 3 rapid changes
        if (displayChanges > 3) {
            console.error('🚨 FLASHING DETECTED! Transcription unstable.');
        } else {
            console.log('✅ No flashing - transcription stable');
        }

        // Take screenshot
        await page.screenshot({
            path: `/Users/mindful/_projects/workspace3/screenshots/transcription-test-${Date.now()}.png`,
            fullPage: false
        });

        console.log('📸 Screenshot saved');

        // Keep browser open to see results
        await page.waitForTimeout(5000);
    });
});
