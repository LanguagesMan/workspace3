const { test, expect } = require('@playwright/test');

test.describe('Word Translation Deep Test', () => {
    const testUrl = 'http://localhost:3002/unified-infinite-feed.html';

    test('Check if spanish-word class exists in rendered content', async ({ page }) => {
        await page.goto(testUrl);
        await page.waitForTimeout(3000);

        // Check for spanish-word spans
        const spanishWords = await page.$$('.spanish-word');
        console.log(`✅ .spanish-word elements found: ${spanishWords.length}`);

        // Check for spanish-text divs
        const spanishTextDivs = await page.$$('.spanish-text');
        console.log(`✅ .spanish-text divs found: ${spanishTextDivs.length}`);

        // Get a sample of the content HTML
        const contentHTML = await page.evaluate(() => {
            const card = document.querySelector('.content-card');
            return card ? card.innerHTML.substring(0, 500) : 'No content card found';
        });
        console.log('✅ Sample content HTML:', contentHTML.substring(0, 200));

        // Try to click a spanish word if exists
        if (spanishWords.length > 0) {
            await spanishWords[0].click();
            await page.waitForTimeout(500);

            // Check for translation tooltip
            const tooltip = await page.$('.translation-tooltip, .translation-popup, [class*="translation"]');
            console.log(`✅ Translation tooltip appeared: ${tooltip !== null}`);
        } else {
            console.log('⚠️ No spanish words to click - checking why...');

            // Get feed data
            const feedDataInfo = await page.evaluate(() => {
                return {
                    hasFeed: typeof feed !== 'undefined',
                    feedDataLength: (typeof feed !== 'undefined' && feed.feedData) ? feed.feedData.length : 0,
                    sampleItem: (typeof feed !== 'undefined' && feed.feedData && feed.feedData[0]) ?
                        JSON.stringify(feed.feedData[0]).substring(0, 200) : 'No data'
                };
            });
            console.log('✅ Feed data info:', feedDataInfo);
        }
    });
});
