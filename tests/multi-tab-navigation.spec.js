const { test, expect } = require('@playwright/test');

test.describe('Multi-Tab Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000); // Wait for videos to load
    });

    test('should show Reels tab by default', async ({ page }) => {
        // Reels section should be active
        const reelsSection = page.locator('#reelsSection');
        await expect(reelsSection).toHaveClass(/active/);

        // Reels nav button should be active
        const reelsBtn = page.locator('button:has-text("Reels")');
        await expect(reelsBtn).toHaveClass(/active/);

        // Should show videos
        const videos = page.locator('video');
        await expect(videos).toHaveCount(await videos.count());
    });

    test('should switch to Feed tab and load articles', async ({ page }) => {
        // Click Feed button
        await page.click('button:has-text("Feed")');
        await page.waitForTimeout(500);

        // Feed section should be active
        const feedSection = page.locator('#feedSection');
        await expect(feedSection).toHaveClass(/active/);

        // Feed nav button should be active
        const feedBtn = page.locator('button:has-text("Feed")');
        await expect(feedBtn).toHaveClass(/active/);

        // Should show article cards
        const articles = page.locator('.article-card');
        await expect(articles.first()).toBeVisible();
    });

    test('should switch to Music tab and load songs', async ({ page }) => {
        // Click Music button
        await page.click('button:has-text("Music")');
        await page.waitForTimeout(500);

        // Music section should be active
        const musicSection = page.locator('#musicSection');
        await expect(musicSection).toHaveClass(/active/);

        // Music nav button should be active
        const musicBtn = page.locator('button:has-text("Music")');
        await expect(musicBtn).toHaveClass(/active/);

        // Should show music cards
        const musicCards = page.locator('.music-card');
        await expect(musicCards.first()).toBeVisible();
    });

    test('should switch between all tabs correctly', async ({ page }) => {
        // Start at Reels
        let reelsSection = page.locator('#reelsSection');
        await expect(reelsSection).toHaveClass(/active/);

        // Switch to Feed
        await page.click('button:has-text("Feed")');
        await page.waitForTimeout(300);
        const feedSection = page.locator('#feedSection');
        await expect(feedSection).toHaveClass(/active/);
        await expect(reelsSection).not.toHaveClass(/active/);

        // Switch to Music
        await page.click('button:has-text("Music")');
        await page.waitForTimeout(300);
        const musicSection = page.locator('#musicSection');
        await expect(musicSection).toHaveClass(/active/);
        await expect(feedSection).not.toHaveClass(/active/);

        // Switch back to Reels
        await page.click('button:has-text("Reels")');
        await page.waitForTimeout(300);
        await expect(reelsSection).toHaveClass(/active/);
        await expect(musicSection).not.toHaveClass(/active/);
    });

    test('should make words clickable in Feed articles', async ({ page }) => {
        // Switch to Feed tab
        await page.click('button:has-text("Feed")');
        await page.waitForTimeout(1000); // Wait for articles to load and words to become clickable

        // Check for clickable words
        const clickableWords = page.locator('.clickable-word');
        await expect(clickableWords.first()).toBeVisible({ timeout: 10000 });

        // Clickable words should have hover effect
        const firstWord = clickableWords.first();
        await expect(firstWord).toHaveCSS('cursor', 'pointer');
    });

    test('should make words clickable in Music lyrics', async ({ page }) => {
        // Switch to Music tab
        await page.click('button:has-text("Music")');
        await page.waitForTimeout(1000); // Wait for music to load and lyrics to become clickable

        // Check for clickable words in lyrics
        const clickableWords = page.locator('.music-lyrics .clickable-word');
        await expect(clickableWords.first()).toBeVisible({ timeout: 10000 });

        // Clickable words should have hover effect
        const firstWord = clickableWords.first();
        await expect(firstWord).toHaveCSS('cursor', 'pointer');
    });

    test('should show bottom navigation on all tabs', async ({ page }) => {
        const bottomNav = page.locator('.bottom-nav');

        // Nav should be visible on Reels
        await expect(bottomNav).toBeVisible();

        // Nav should be visible on Feed
        await page.click('button:has-text("Feed")');
        await page.waitForTimeout(300);
        await expect(bottomNav).toBeVisible();

        // Nav should be visible on Music
        await page.click('button:has-text("Music")');
        await page.waitForTimeout(300);
        await expect(bottomNav).toBeVisible();
    });
});
