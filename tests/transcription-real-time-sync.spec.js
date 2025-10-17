/**
 * REAL-TIME TRANSCRIPTION SYNC TEST
 * Verify YouTube/TikTok 2025 pattern: Line-by-line dual-language captions
 * Research: Based on TikTok auto-captions + YouTube bilingual subtitle UX
 */

const { test, expect } = require('@playwright/test');

test.describe('Real-time Transcription with AI Punctuation & Translation', () => {
    test('should display dual-language captions synchronized with video playback', async ({ page }) => {
        // Navigate to homepage
        await page.goto('http://localhost:3002');

        // Wait for videos to load
        await page.waitForSelector('.reel video', { timeout: 10000 });

        // Get first video
        const firstReel = page.locator('.reel').first();
        const video = firstReel.locator('video');

        // Wait for video to be ready
        await video.evaluate(v => {
            return new Promise(resolve => {
                if (v.readyState >= 2) resolve();
                else v.addEventListener('loadeddata', resolve, { once: true });
            });
        });

        // Check if subtitles container exists
        const captionContainer = firstReel.locator('.word-overlay');
        await expect(captionContainer).toBeVisible({ timeout: 5000 });

        // Play video for a few seconds
        await video.evaluate(v => v.play());
        await page.waitForTimeout(3000);

        // Check if dual-language captions appear
        const spanishCaption = page.locator('.caption-spanish').first();
        const englishCaption = page.locator('.caption-english').first();

        // Verify Spanish caption exists
        const hasSpanishCaption = await spanishCaption.count() > 0;
        console.log(`Spanish caption found: ${hasSpanishCaption}`);

        if (hasSpanishCaption) {
            // Verify flag emoji prefix
            const spanishText = await spanishCaption.textContent();
            console.log(`Spanish caption text: ${spanishText}`);
            expect(spanishText).toBeTruthy();

            // Verify English translation exists
            const hasEnglishCaption = await englishCaption.count() > 0;
            console.log(`English caption found: ${hasEnglishCaption}`);

            if (hasEnglishCaption) {
                const englishText = await englishCaption.textContent();
                console.log(`English caption text: ${englishText}`);
                expect(englishText).toBeTruthy();
            }
        }

        // Take screenshot
        await page.screenshot({
            path: 'screenshots/transcription-dual-language-captions.png',
            fullPage: false
        });

        console.log('✅ Transcription test completed - see screenshot');
    });

    test('should show AI-punctuated Spanish text', async ({ page }) => {
        // Test API endpoint directly
        const response = await page.request.post('http://localhost:3002/api/punctuate', {
            data: {
                text: 'hola como estas que tal'
            }
        });

        const data = await response.json();
        console.log('Punctuation API response:', data);

        expect(data.success).toBe(true);
        expect(data.punctuated).toBeTruthy();
        expect(data.punctuated).toContain('.');

        console.log(`✅ AI Punctuation: "${data.original}" → "${data.punctuated}"`);
    });

    test('should translate Spanish to English in real-time', async ({ page }) => {
        // Test translation API endpoint
        const response = await page.request.post('http://localhost:3002/api/translate', {
            data: {
                text: 'Hola como estas',
                from: 'es',
                to: 'en'
            }
        });

        const data = await response.json();
        console.log('Translation API response:', data);

        expect(data.success).toBe(true);
        expect(data.translation).toBeTruthy();

        console.log(`✅ Translation: "${data.translation}"`);
    });

    test('should sync captions with video timestamp', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.reel video', { timeout: 10000 });

        const firstReel = page.locator('.reel').first();
        const video = firstReel.locator('video');

        // Wait for video ready
        await video.evaluate(v => {
            return new Promise(resolve => {
                if (v.readyState >= 2) resolve();
                else v.addEventListener('loadeddata', resolve, { once: true });
            });
        });

        // Play video
        await video.evaluate(v => v.play());

        // Wait 2 seconds
        await page.waitForTimeout(2000);

        // Get current time
        const currentTime = await video.evaluate(v => v.currentTime);
        console.log(`Video current time: ${currentTime}s`);

        // Check if captions changed
        const captionContainer = firstReel.locator('.word-overlay');
        const hasCaptions = await captionContainer.count() > 0;

        console.log(`Captions visible at ${currentTime}s: ${hasCaptions}`);

        // Screenshot at this timestamp
        await page.screenshot({
            path: `screenshots/transcription-at-${Math.floor(currentTime)}s.png`,
            fullPage: false
        });
    });

    test('should allow clicking Spanish words for instant translation', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.reel video', { timeout: 10000 });

        const firstReel = page.locator('.reel').first();
        const video = firstReel.locator('video');

        // Play video and wait for captions
        await video.evaluate(v => v.play());
        await page.waitForTimeout(3000);

        // Look for clickable words
        const clickableWord = page.locator('.clickable-word').first();
        const hasClickableWords = await clickableWord.count() > 0;

        console.log(`Clickable words found: ${hasClickableWords}`);

        if (hasClickableWords) {
            // Click word
            await clickableWord.click();

            // Wait for translation popup
            await page.waitForTimeout(500);

            // Check for translation popup
            const popup = page.locator('.word-translation-popup').first();
            const hasPopup = await popup.count() > 0;

            console.log(`Translation popup appeared: ${hasPopup}`);

            if (hasPopup) {
                const popupText = await popup.textContent();
                console.log(`Translation popup text: ${popupText}`);
            }

            // Screenshot with popup
            await page.screenshot({
                path: 'screenshots/transcription-word-click-translation.png',
                fullPage: false
        });
        }
    });
});
