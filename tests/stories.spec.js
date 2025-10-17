const { test, expect } = require('@playwright/test');

test.describe('Stories Section', () => {
    test('should display stories carousel', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const storiesContainer = page.locator('.stories-container');
        await expect(storiesContainer).toBeVisible();

        await page.screenshot({ path: 'screenshots/stories-carousel.png', fullPage: false });
        
        const storyItems = await page.locator('.story-item').count();
        expect(storyItems).toBeGreaterThan(0);
        console.log(`✓ Found ${storyItems} stories`);
    });

    test('should open story on click', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await page.locator('.story-item').first().click();
        await page.waitForTimeout(500);

        const storyViewer = page.locator('.story-viewer.active');
        await expect(storyViewer).toBeVisible();

        await page.screenshot({ path: 'screenshots/story-viewer.png', fullPage: false });
        console.log('✓ Story viewer opened successfully');
    });
});
