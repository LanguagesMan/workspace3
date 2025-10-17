/**
 * 📸 SHARE CARD VISUAL REGRESSION TEST
 *
 * Tests visual rendering of all 6 share card templates
 * Captures screenshots for manual inspection
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Share Card Visual Tests', () => {
    const screenshotsDir = path.join(__dirname, 'screenshots', 'share-cards');

    test.beforeAll(() => {
        // Ensure screenshots directory exists
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }
    });

    test('should load share card generator page', async ({ page }) => {
        await page.goto('http://localhost:3001/share-card-generator.html');
        await expect(page.locator('h1')).toContainText('Share Your Progress');
    });

    test('should render streak template correctly', async ({ page }) => {
        await page.goto('http://localhost:3001/share-card-generator.html');
        await page.click('.template-btn:has-text("Streak")');

        // Wait for card to render
        await page.waitForTimeout(500);

        // Take screenshot of card preview
        const cardPreview = page.locator('.card-preview');
        await cardPreview.screenshot({
            path: path.join(screenshotsDir, '1-streak-card.png')
        });

        // Verify elements
        await expect(page.locator('.card-icon')).toContainText('🔥');
        await expect(page.locator('.card-title')).toContainText('Day Streak!');
    });

    test('should render words template correctly', async ({ page }) => {
        await page.goto('http://localhost:3001/share-card-generator.html');
        await page.click('.template-btn:has-text("Words")');
        await page.waitForTimeout(500);

        const cardPreview = page.locator('.card-preview');
        await cardPreview.screenshot({
            path: path.join(screenshotsDir, '2-words-card.png')
        });

        await expect(page.locator('.card-icon')).toContainText('📚');
        await expect(page.locator('.card-title')).toContainText('Words Learned!');
    });

    test('should render level template correctly', async ({ page }) => {
        await page.goto('http://localhost:3001/share-card-generator.html');
        await page.click('.template-btn:has-text("Level")');
        await page.waitForTimeout(500);

        const cardPreview = page.locator('.card-preview');
        await cardPreview.screenshot({
            path: path.join(screenshotsDir, '3-level-card.png')
        });

        await expect(page.locator('.card-icon')).toContainText('⭐');
    });

    test('should render videos template correctly', async ({ page }) => {
        await page.goto('http://localhost:3001/share-card-generator.html');
        await page.click('.template-btn:has-text("Videos")');
        await page.waitForTimeout(500);

        const cardPreview = page.locator('.card-preview');
        await cardPreview.screenshot({
            path: path.join(screenshotsDir, '4-videos-card.png')
        });

        await expect(page.locator('.card-icon')).toContainText('📹');
    });

    test('should render weekly template correctly', async ({ page }) => {
        await page.goto('http://localhost:3001/share-card-generator.html');
        await page.click('.template-btn:has-text("Weekly")');
        await page.waitForTimeout(500);

        const cardPreview = page.locator('.card-preview');
        await cardPreview.screenshot({
            path: path.join(screenshotsDir, '5-weekly-card.png')
        });

        await expect(page.locator('.card-icon')).toContainText('📊');
    });

    test('should render milestone template correctly', async ({ page }) => {
        await page.goto('http://localhost:3001/share-card-generator.html');
        await page.click('.template-btn:has-text("Milestone")');
        await page.waitForTimeout(500);

        const cardPreview = page.locator('.card-preview');
        await cardPreview.screenshot({
            path: path.join(screenshotsDir, '6-milestone-card.png')
        });

        await expect(page.locator('.card-icon')).toContainText('🏆');
    });

    test('should download card image', async ({ page }) => {
        await page.goto('http://localhost:3001/share-card-generator.html');

        // Click download button
        const downloadPromise = page.waitForEvent('download');
        await page.click('button:has-text("Download")');

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/langflix-progress-.*\.png/);
    });

    test('should have responsive design', async ({ page }) => {
        await page.goto('http://localhost:3001/share-card-generator.html');

        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(300);

        const cardPreview = page.locator('.card-preview');
        await cardPreview.screenshot({
            path: path.join(screenshotsDir, 'mobile-view.png')
        });

        // Verify card is still visible
        await expect(cardPreview).toBeVisible();
    });
});
