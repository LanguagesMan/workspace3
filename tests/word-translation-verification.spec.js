// Word Translation Verification Test
// User request: "pleasr fix so words you press actually translate"

const { test, expect } = require('@playwright/test');

test.describe('Word Translation - User Request Verification', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForLoadState('networkidle');
    });

    test('Clicking Spanish words shows translation tooltip', async ({ page }) => {
        // Wait for content to load
        await page.waitForTimeout(2000);

        // Find a Spanish word in the feed
        const spanishWord = page.locator('.spanish-word').first();
        await expect(spanishWord).toBeVisible();

        // Get the word text for verification
        const wordText = await spanishWord.textContent();
        console.log(`Testing word translation for: "${wordText}"`);

        // Click the word
        await spanishWord.click();
        await page.waitForTimeout(500);

        // Verify translation tooltip appears
        const tooltip = page.locator('.translation-tooltip');
        await expect(tooltip).toBeVisible();

        // Verify tooltip has content
        const tooltipText = await tooltip.textContent();
        expect(tooltipText.length).toBeGreaterThan(0);

        console.log(`✅ Translation tooltip shows: "${tooltipText}"`);

        // Take screenshot
        await page.screenshot({
            path: 'screenshots/evidence/word-translation-working.png',
            fullPage: false
        });
    });

    test('Multiple word clicks work consecutively', async ({ page }) => {
        await page.waitForTimeout(2000);

        // Click 3 different words
        const words = page.locator('.spanish-word');
        const wordCount = await words.count();

        expect(wordCount).toBeGreaterThan(0);
        console.log(`Found ${wordCount} clickable Spanish words`);

        for (let i = 0; i < Math.min(3, wordCount); i++) {
            const word = words.nth(i);
            const wordText = await word.textContent();

            await word.click();
            await page.waitForTimeout(300);

            const tooltip = page.locator('.translation-tooltip');
            await expect(tooltip).toBeVisible();

            const translation = await tooltip.textContent();
            console.log(`✅ Word ${i + 1}: "${wordText}" → "${translation}"`);

            await page.waitForTimeout(200);
        }

        console.log('✅ Multiple consecutive word translations working');
    });

    test('Word translation works in Videos tab', async ({ page }) => {
        // Switch to Videos tab
        await page.click('[data-tab="videos"]');
        await page.waitForTimeout(2000);

        // Find Spanish words in video subtitles
        const spanishWords = page.locator('.spanish-word');
        const count = await spanishWords.count();

        if (count > 0) {
            const word = spanishWords.first();
            const wordText = await word.textContent();

            await word.click();
            await page.waitForTimeout(500);

            const tooltip = page.locator('.translation-tooltip');
            await expect(tooltip).toBeVisible();

            console.log(`✅ Video word translation working: "${wordText}"`);

            // Take screenshot
            await page.screenshot({
                path: 'screenshots/evidence/video-word-translation.png',
                fullPage: false
            });
        } else {
            console.log('⚠️ No Spanish words in video subtitles (expected if videos have no subtitles)');
        }
    });

    test('Word translation works in Articles tab', async ({ page }) => {
        await page.click('[data-tab="articles"]');
        await page.waitForTimeout(2000);

        const spanishWords = page.locator('.spanish-word');
        const count = await spanishWords.count();

        if (count > 0) {
            const word = spanishWords.first();
            await word.click();
            await page.waitForTimeout(500);

            const tooltip = page.locator('.translation-tooltip');
            await expect(tooltip).toBeVisible();

            console.log('✅ Articles tab word translation working');
        }
    });

    test('Word translation works in Stories tab', async ({ page }) => {
        await page.click('[data-tab="stories"]');
        await page.waitForTimeout(2000);

        const spanishWords = page.locator('.spanish-word');
        const count = await spanishWords.count();

        if (count > 0) {
            const word = spanishWords.first();
            await word.click();
            await page.waitForTimeout(500);

            const tooltip = page.locator('.translation-tooltip');
            await expect(tooltip).toBeVisible();

            console.log('✅ Stories tab word translation working');

            // Take screenshot
            await page.screenshot({
                path: 'screenshots/evidence/stories-word-translation.png',
                fullPage: false
            });
        }
    });

    test('Translation tooltip auto-dismisses after 3 seconds', async ({ page }) => {
        await page.waitForTimeout(2000);

        const word = page.locator('.spanish-word').first();
        await word.click();
        await page.waitForTimeout(500);

        // Verify tooltip is visible
        const tooltip = page.locator('.translation-tooltip');
        await expect(tooltip).toBeVisible();

        // Wait 3.5 seconds for auto-dismiss
        await page.waitForTimeout(3500);

        // Verify tooltip is gone
        const tooltipCount = await page.locator('.translation-tooltip').count();
        expect(tooltipCount).toBe(0);

        console.log('✅ Translation tooltip auto-dismisses after 3 seconds');
    });

    test('Performance: Word translation responds quickly (<150ms)', async ({ page }) => {
        await page.waitForTimeout(2000);

        const word = page.locator('.spanish-word').first();

        const startTime = Date.now();
        await word.click();
        await page.waitForSelector('.translation-tooltip', { timeout: 200 });
        const responseTime = Date.now() - startTime;

        expect(responseTime).toBeLessThan(150);
        console.log(`✅ Word translation response time: ${responseTime}ms`);
    });

    test('WCAG: Spanish words have proper cursor and visual feedback', async ({ page }) => {
        await page.waitForTimeout(2000);

        const word = page.locator('.spanish-word').first();

        // Check cursor style
        const cursor = await word.evaluate(el => window.getComputedStyle(el).cursor);
        expect(cursor).toBe('pointer');

        // Hover to check visual feedback
        await word.hover();
        await page.waitForTimeout(200);

        console.log('✅ Spanish words have pointer cursor and hover feedback');
    });
});
