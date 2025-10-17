// 📸 COMPREHENSIVE PAGE SCREENSHOT TEST
// Captures all pages in headless mode - NO browser opening!

const { test, expect } = require('@playwright/test');

test.describe('📸 Screenshot All Pages - Headless', () => {
    const baseUrl = 'http://localhost:3002';

    test('should screenshot main index page', async ({ page }) => {
        await page.goto(`${baseUrl}/index.html`);
        await page.waitForLoadState('networkidle');
        await page.screenshot({
            path: 'screenshots/index-main.png',
            fullPage: true
        });
        console.log('✅ Screenshot: index-main.png');
    });

    test('should screenshot unified feed page', async ({ page }) => {
        await page.goto(`${baseUrl}/unified-infinite-feed.html`);
        await page.waitForLoadState('networkidle');
        await page.screenshot({
            path: 'screenshots/unified-feed.png',
            fullPage: true
        });
        console.log('✅ Screenshot: unified-feed.png');
    });

    test('should screenshot stats dashboard', async ({ page }) => {
        await page.goto(`${baseUrl}/stats-dashboard.html`);
        await page.waitForLoadState('networkidle');
        await page.screenshot({
            path: 'screenshots/stats-dashboard.png',
            fullPage: true
        });
        console.log('✅ Screenshot: stats-dashboard.png');
    });

    test('should screenshot ultimate feed', async ({ page }) => {
        await page.goto(`${baseUrl}/ultimate-feed.html`);
        await page.waitForLoadState('networkidle');
        await page.screenshot({
            path: 'screenshots/ultimate-feed.png',
            fullPage: true
        });
        console.log('✅ Screenshot: ultimate-feed.png');
    });

    test('should screenshot comedy creator', async ({ page }) => {
        await page.goto(`${baseUrl}/BILLION_DOLLAR_DESIGN_comedy-creator.html`);
        await page.waitForLoadState('networkidle');
        await page.screenshot({
            path: 'screenshots/comedy-creator.png',
            fullPage: true
        });
        console.log('✅ Screenshot: comedy-creator.png');
    });

    test('should screenshot AI feed', async ({ page }) => {
        await page.goto(`${baseUrl}/ai-feed.html`);
        await page.waitForLoadState('networkidle');
        await page.screenshot({
            path: 'screenshots/ai-feed.png',
            fullPage: true
        });
        console.log('✅ Screenshot: ai-feed.png');
    });

    test('should test Spanish frequency API visual', async ({ page }) => {
        await page.goto(`${baseUrl}/index.html`);
        await page.waitForTimeout(2000); // Wait for content load

        // Check if Spanish content is visible
        const spanishText = await page.locator('.spanish-text').first();
        if (await spanishText.count() > 0) {
            await page.screenshot({
                path: 'screenshots/spanish-content-loaded.png',
                fullPage: true
            });
            console.log('✅ Screenshot: spanish-content-loaded.png');
        }
    });

    test('should capture mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
        await page.goto(`${baseUrl}/index.html`);
        await page.waitForLoadState('networkidle');
        await page.screenshot({
            path: 'screenshots/mobile-view.png',
            fullPage: true
        });
        console.log('✅ Screenshot: mobile-view.png');
    });

    test('should capture tablet viewport', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 }); // iPad
        await page.goto(`${baseUrl}/index.html`);
        await page.waitForLoadState('networkidle');
        await page.screenshot({
            path: 'screenshots/tablet-view.png',
            fullPage: true
        });
        console.log('✅ Screenshot: tablet-view.png');
    });

    test('should verify feed loading animation', async ({ page }) => {
        await page.goto(`${baseUrl}/index.html`);

        // Wait for loading spinner
        const spinner = page.locator('#loadingSpinner');
        await page.screenshot({
            path: 'screenshots/loading-state.png'
        });

        // Wait for content
        await page.waitForLoadState('networkidle');
        await page.screenshot({
            path: 'screenshots/content-loaded.png',
            fullPage: true
        });
        console.log('✅ Screenshots: loading-state.png, content-loaded.png');
    });
});
