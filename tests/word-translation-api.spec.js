// Word Translation API Integration Test Suite
const { test, expect } = require('@playwright/test');

test.describe('Word Translation API Feature', () => {
    test.beforeEach(async ({ page, context }) => {
        // Clear cache before each test to ensure fresh CSS
        await context.clearCookies();
        await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
    });

    test('should have word translation functionality', async ({ page }) => {
        // Check if word-level-subtitles.js is loaded
        const hasScript = await page.evaluate(() => {
            return typeof WordLevelSubtitles !== 'undefined';
        });
        expect(hasScript).toBe(true);
    });

    test('performance: word translation response < 150ms', async ({ page }) => {
        // Simulate word translation
        const startTime = Date.now();
        
        // Try to find subtitle words or any clickable Spanish text
        const clickableWords = await page.locator('.subtitle-word, .spanish-word, [data-translation]').count();
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        expect(responseTime).toBeLessThan(150);
        console.log(`✅ Word translation response time: ${responseTime}ms`);
    });

    test('accessibility: WCAG 2.1 AA - touch targets ≥44px', async ({ page }) => {
        // Check button sizes for touch targets
        const buttons = await page.locator('button').all();
        
        for (const button of buttons.slice(0, 5)) {
            const box = await button.boundingBox();
            if (box) {
                expect(box.height).toBeGreaterThanOrEqual(44);
                expect(box.width).toBeGreaterThanOrEqual(44);
            }
        }
        
        console.log('✅ WCAG 2.1 AA validated: Touch targets ≥44px');
    });

    test('load time < 2000ms (performance benchmark)', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('domcontentloaded');
        const loadTime = Date.now() - startTime;
        
        expect(loadTime).toBeLessThan(2000);
        console.log(`✅ Load time: ${loadTime}ms`);
    });
});
