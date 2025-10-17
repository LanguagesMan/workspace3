const { test, expect } = require('@playwright/test');

test.describe('Clean Feed - Real Content Only', () => {
    test('should display only real articles/videos (no dummy content)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Check no quiz cards (dummy content)
        const quizCards = await page.locator('.type-quiz').count();
        expect(quizCards).toBe(0);
        console.log('✓ No quiz cards - dummy content removed');

        // Verify real content exists
        const contentCards = await page.locator('.content-card').count();
        expect(contentCards).toBeGreaterThan(0);
        console.log(`✓ Found ${contentCards} real content cards`);

        // Take screenshot
        await page.screenshot({ path: 'screenshots/clean-feed.png', fullPage: true });
        console.log('✓ Screenshot: clean-feed.png');
    });
});
