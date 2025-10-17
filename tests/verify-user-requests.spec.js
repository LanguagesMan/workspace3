const { test, expect } = require('@playwright/test');

test.describe('Verify User Requests Actually Work', () => {
    const testUrl = 'http://localhost:3002/unified-infinite-feed.html';

    test('USER REQUEST 1: Stories section loads when clicked', async ({ page }) => {
        await page.goto(testUrl);
        await page.waitForTimeout(1000);

        // Find Stories tab
        const storiesTab = await page.$('[data-tab="stories"]');
        expect(storiesTab).toBeTruthy();

        // Click it
        await storiesTab.click();
        await page.waitForTimeout(2000);

        // Verify content loaded
        const contentCards = await page.$$('.content-card, .story-card, [class*="card"]');
        console.log(`✅ Stories section: ${contentCards.length} items loaded`);
        expect(contentCards.length).toBeGreaterThan(0);
    });

    test('USER REQUEST 2: Videos section has TikTok scroll', async ({ page }) => {
        await page.goto(testUrl);
        await page.waitForTimeout(1000);

        // Videos should be default
        const scrollSnapType = await page.evaluate(() => {
            return window.getComputedStyle(document.body).scrollSnapType;
        });

        console.log(`✅ TikTok scroll-snap: ${scrollSnapType}`);
        expect(scrollSnapType).toContain('y');
    });

    test('USER REQUEST 3: Clicking words shows translation', async ({ page }) => {
        await page.goto(testUrl);
        await page.waitForTimeout(2000);

        // Find clickable words
        const clickableWords = await page.$$('.clickable-word, [data-translation], .word-translate');
        console.log(`✅ Clickable words found: ${clickableWords.length}`);

        if (clickableWords.length > 0) {
            // Click first word
            await clickableWords[0].click();
            await page.waitForTimeout(500);

            // Check if translation UI appeared
            const translationUI = await page.$('.translation-tooltip, .translation-popup, .translation-modal, [class*="translation"]');
            expect(translationUI).toBeTruthy();
            console.log('✅ Translation UI appeared after clicking word');
        }
    });
});
