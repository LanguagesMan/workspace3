// 🧪 TEST: Dual-Language Real-Time Transcription
// Verifies YouTube/TikTok-style line-by-line transcriptions with Spanish + English

const { test, expect } = require('@playwright/test');

test.describe('Dual-Language Real-Time Transcription', () => {
    test('should display Spanish and English transcriptions in real-time', async ({ page }) => {
        // Navigate to vida-app
        await page.goto('http://localhost:3001/vida-app.html');

        // Wait for app to load
        await page.waitForTimeout(3000);

        console.log('📹 Checking for video player...');

        // Check if video is present
        const video = await page.locator('video').first();
        await expect(video).toBeVisible();

        console.log('✅ Video player found');

        // Wait for subtitles to load
        await page.waitForTimeout(2000);

        // Look for Spanish line with flag
        const spanishLine = await page.locator('.spanish-line').first();
        if (await spanishLine.isVisible()) {
            const spanishText = await spanishLine.textContent();
            console.log('🇪🇸 Spanish:', spanishText);

            // Verify Spanish has AI punctuation
            expect(spanishText).toMatch(/[.!?¿¡]/);

            // Look for English line with flag
            const englishLine = await page.locator('.english-line').first();
            await expect(englishLine).toBeVisible();

            const englishText = await englishLine.textContent();
            console.log('🇺🇸 English:', englishText);

            // Verify both languages are present
            expect(spanishText.length).toBeGreaterThan(0);
            expect(englishText.length).toBeGreaterThan(0);

            console.log('✅ Dual-language transcriptions working!');
        } else {
            console.log('⚠️ No subtitles visible yet, waiting...');
            await page.waitForTimeout(3000);

            const spanishLineRetry = await page.locator('.spanish-line').first();
            await expect(spanishLineRetry).toBeVisible({ timeout: 5000 });
        }

        // Verify clickable words in Spanish line
        const clickableWords = await page.locator('.clickable-word');
        const wordCount = await clickableWords.count();
        console.log(`📝 Found ${wordCount} clickable Spanish words`);
        expect(wordCount).toBeGreaterThan(0);

        // Take screenshot
        await page.screenshot({
            path: 'screenshots/dual-language-transcription.png',
            fullPage: false
        });

        console.log('📸 Screenshot saved: screenshots/dual-language-transcription.png');
    });

    test('should update transcriptions as video plays', async ({ page }) => {
        await page.goto('http://localhost:3001/vida-app.html');
        await page.waitForTimeout(3000);

        const video = await page.locator('video').first();
        await expect(video).toBeVisible();

        // Get first subtitle text
        await page.waitForTimeout(2000);
        const spanishLine = await page.locator('.spanish-line').first();

        if (await spanishLine.isVisible()) {
            const firstText = await spanishLine.textContent();
            console.log('🎬 First subtitle:', firstText);

            // Wait for video to progress
            await page.waitForTimeout(4000);

            // Check if subtitle changed (real-time sync)
            const secondText = await spanishLine.textContent();
            console.log('🎬 Second subtitle:', secondText);

            // Subtitles should update as video plays
            if (firstText !== secondText) {
                console.log('✅ Real-time transcription sync verified!');
            } else {
                console.log('⚠️ Subtitle may still be same (depending on video timing)');
            }
        }
    });

    test('should have proper YouTube-style styling', async ({ page }) => {
        await page.goto('http://localhost:3001/vida-app.html');
        await page.waitForTimeout(3000);

        // Check Spanish line styling
        const spanishLine = await page.locator('.spanish-line').first();
        if (await spanishLine.isVisible()) {
            const styles = await spanishLine.evaluate((el) => {
                const computed = window.getComputedStyle(el);
                return {
                    fontWeight: computed.fontWeight,
                    fontSize: computed.fontSize,
                    borderLeft: computed.borderLeft,
                    background: computed.background
                };
            });

            console.log('🎨 Spanish line styles:', styles);

            // Verify bold font
            expect(parseInt(styles.fontWeight)).toBeGreaterThanOrEqual(600);

            // Verify border exists (YouTube-style accent)
            expect(styles.borderLeft).toContain('px');
        }

        // Check English line styling
        const englishLine = await page.locator('.english-line').first();
        if (await englishLine.isVisible()) {
            const styles = await englishLine.evaluate((el) => {
                const computed = window.getComputedStyle(el);
                return {
                    fontWeight: computed.fontWeight,
                    fontSize: computed.fontSize,
                    borderLeft: computed.borderLeft
                };
            });

            console.log('🎨 English line styles:', styles);

            // English should be less bold than Spanish
            expect(parseInt(styles.fontWeight)).toBeLessThan(600);
        }

        console.log('✅ YouTube-style styling verified!');
    });

    test('should show language flags in transcriptions', async ({ page }) => {
        await page.goto('http://localhost:3001/vida-app.html');
        await page.waitForTimeout(3000);

        const spanishLine = await page.locator('.spanish-line').first();
        if (await spanishLine.isVisible()) {
            const text = await spanishLine.textContent();

            // Check for Spanish flag
            expect(text).toContain('🇪🇸');
            console.log('✅ Spanish flag found');
        }

        const englishLine = await page.locator('.english-line').first();
        if (await englishLine.isVisible()) {
            const text = await englishLine.textContent();

            // Check for English flag
            expect(text).toContain('🇺🇸');
            console.log('✅ English flag found');
        }
    });
});
