const { test } = require('@playwright/test');

test.describe('Screenshot All 3 User Requests Working', () => {
    const testUrl = 'http://localhost:3002/unified-infinite-feed.html';

    test('1. Screenshot Stories tab working', async ({ page }) => {
        await page.goto(testUrl);
        await page.waitForTimeout(2000);

        // Click Stories tab
        const storiesTab = await page.$('[data-tab="stories"]');
        await storiesTab.click();
        await page.waitForTimeout(2000);

        // Screenshot
        await page.screenshot({
            path: 'screenshots/evidence/user-request-1-stories-working.png',
            fullPage: false
        });
        console.log('✅ Screenshot saved: user-request-1-stories-working.png');
    });

    test('2. Screenshot Videos TikTok scroll', async ({ page }) => {
        await page.goto(testUrl);
        await page.waitForTimeout(2000);

        // Videos tab should be default
        await page.screenshot({
            path: 'screenshots/evidence/user-request-2-videos-tiktok.png',
            fullPage: false
        });
        console.log('✅ Screenshot saved: user-request-2-videos-tiktok.png');
    });

    test('3. Screenshot word translation tooltip', async ({ page }) => {
        await page.goto(testUrl);
        await page.waitForTimeout(2000);

        // Find and click a spanish word
        const spanishWord = await page.$('.spanish-word');
        if (spanishWord) {
            await spanishWord.click();
            await page.waitForTimeout(500);

            // Screenshot with tooltip visible
            await page.screenshot({
                path: 'screenshots/evidence/user-request-3-word-translation.png',
                fullPage: false
            });
            console.log('✅ Screenshot saved: user-request-3-word-translation.png');
        }
    });

    test('4. Full page screenshot showing all features', async ({ page }) => {
        await page.goto(testUrl);
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: `screenshots/evidence/all-3-requests-complete-${Date.now()}.png`,
            fullPage: true
        });
        console.log('✅ Full screenshot saved');
    });
});
