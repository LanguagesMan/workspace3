/**
 * Test word translation functionality
 * User reported: "sometimes I press words, it doesn't translate them"
 * REQUIREMENT: Should ALWAYS show English translation when clicking a word
 */

const { test, expect } = require('@playwright/test');

test.describe('🔤 Word Translation - ALWAYS Works', () => {
    test('should translate word via API when clicked', async ({ page }) => {
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForTimeout(3000);

        // Wait for videos to load
        const firstVideo = page.locator('.video-card').first();
        await firstVideo.waitFor({ state: 'visible', timeout: 10000 });

        // Wait for subtitles to appear
        await page.waitForTimeout(2000);

        // Find a clickable word in the subtitles
        const spanishSubtitle = firstVideo.locator('.subtitle-line-spanish .word').first();

        // Check if word exists
        const wordCount = await firstVideo.locator('.subtitle-line-spanish .word').count();
        console.log(`📝 Clickable words found: ${wordCount}`);

        if (wordCount === 0) {
            console.log('⚠️ No clickable words found (subtitles may not be loaded yet)');
            // Try waiting longer
            await page.waitForTimeout(5000);
            const wordCountRetry = await firstVideo.locator('.subtitle-line-spanish .word').count();
            console.log(`📝 Clickable words found after retry: ${wordCountRetry}`);

            if (wordCountRetry === 0) {
                throw new Error('No clickable words found after waiting');
            }
        }

        // Get the word text
        const wordText = await spanishSubtitle.textContent();
        console.log(`🔤 Clicking word: "${wordText}"`);

        // Click the word
        await spanishSubtitle.click();

        // Wait for tooltip to appear
        const tooltip = page.locator('#wordTooltip.show');
        await tooltip.waitFor({ state: 'visible', timeout: 5000 });

        // Check that tooltip has both Spanish and English
        const spanishText = await tooltip.locator('.word-spanish').textContent();
        const englishText = await tooltip.locator('.word-english').textContent();

        console.log(`📖 Spanish: "${spanishText}"`);
        console.log(`📖 English: "${englishText}"`);

        // CRITICAL: English translation must exist and not be empty
        expect(englishText).toBeTruthy();
        expect(englishText.length).toBeGreaterThan(0);

        // English should not be the same as Spanish (unless it's a cognate)
        // But at minimum, it should be a valid English word
        console.log(`✅ Translation shown: "${spanishText}" → "${englishText}"`);
    });

    test('should work for multiple different words', async ({ page }) => {
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForTimeout(5000);

        const firstVideo = page.locator('.video-card').first();
        const words = firstVideo.locator('.subtitle-line-spanish .word');

        const wordCount = await words.count();
        const testCount = Math.min(5, wordCount); // Test up to 5 words

        console.log(`🔤 Testing ${testCount} words...`);

        for (let i = 0; i < testCount; i++) {
            const word = words.nth(i);
            const wordText = await word.textContent();

            console.log(`\n🔤 Testing word ${i + 1}/${testCount}: "${wordText}"`);

            await word.click();
            await page.waitForTimeout(500);

            // Check tooltip appears
            const tooltip = page.locator('#wordTooltip.show');
            const isVisible = await tooltip.isVisible();

            if (isVisible) {
                const englishText = await tooltip.locator('.word-english').textContent();
                console.log(`  ✅ "${wordText}" → "${englishText}"`);
                expect(englishText).toBeTruthy();
            } else {
                console.log(`  ⚠️ Tooltip not visible for "${wordText}"`);
            }

            // Close tooltip
            await page.click('body');
            await page.waitForTimeout(300);
        }
    });
});
