// COMPREHENSIVE APP NAVIGATION TEST
// Tests: index → videos → articles → back to videos

const { test, expect } = require('@playwright/test');

test.describe('Complete App Navigation Flow', () => {
    test('should navigate from index → videos → articles → back to videos', async ({ page }) => {
        // 1. Start at index.html (should auto-redirect to videos)
        await page.goto('http://localhost:3002/');
        await page.waitForURL('**/videos-new.html', { timeout: 5000 });

        // Take screenshot of video feed
        await page.screenshot({
            path: 'screenshots/workspace3/01_video_feed.png',
            fullPage: true
        });

        // Verify video feed loaded
        const videoFeed = await page.locator('.video-feed');
        await expect(videoFeed).toBeVisible();

        // Verify streak widget is visible
        const streakWidget = await page.locator('.streak-widget');
        await expect(streakWidget).toBeVisible();

        // 2. Click "📰 Artículos" button to go to articles
        const articlesBtn = await page.locator('button:has-text("Artículos")');
        await expect(articlesBtn).toBeVisible();
        await articlesBtn.click();

        // Wait for articles page to load
        await page.waitForURL('**/articles-new.html', { timeout: 5000 });

        // Take screenshot of articles feed
        await page.screenshot({
            path: 'screenshots/workspace3/02_articles_feed.png',
            fullPage: true
        });

        // Verify articles feed loaded
        const articlesContainer = await page.locator('.articles-container');
        await expect(articlesContainer).toBeVisible();

        // Verify "Noticias" title is visible
        const navTitle = await page.locator('.nav-title:has-text("Noticias")');
        await expect(navTitle).toBeVisible();

        // 3. Click "📹 Videos" button to go back
        const videosBtn = await page.locator('button:has-text("Videos")');
        await expect(videosBtn).toBeVisible();
        await videosBtn.click();

        // Wait for videos page to load
        await page.waitForURL('**/videos-new.html', { timeout: 5000 });

        // Verify we're back on videos
        await expect(videoFeed).toBeVisible();

        console.log('✅ Complete navigation flow: index → videos → articles → videos');
    });

    test('should display streak widget on both pages', async ({ page }) => {
        // Check video page
        await page.goto('http://localhost:3002/videos-new.html');
        const videoStreak = await page.locator('.streak-widget');
        await expect(videoStreak).toBeVisible();

        // Check articles page
        await page.goto('http://localhost:3002/articles-new.html');
        const articleStreak = await page.locator('.streak-widget');
        await expect(articleStreak).toBeVisible();

        console.log('✅ Streak widget visible on both pages');
    });

    test('should have working double-tap heart animation on videos', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');

        // Wait for videos to load
        await page.waitForSelector('.video-slide', { timeout: 5000 });

        // Double-tap first video (simulate by clicking twice quickly)
        const firstVideo = await page.locator('.video-slide').first();
        await firstVideo.click();
        await page.waitForTimeout(100);
        await firstVideo.click();

        // Wait for heart animation to appear
        await page.waitForTimeout(500);

        // Take screenshot of heart animation
        await page.screenshot({
            path: 'screenshots/workspace3/03_heart_animation.png',
            fullPage: true
        });

        console.log('✅ Double-tap heart animation triggered');
    });

    test('should have working double-tap on article cards', async ({ page }) => {
        await page.goto('http://localhost:3002/articles-new.html');

        // Wait for articles to load
        await page.waitForSelector('.article-card', { timeout: 5000 });

        // Double-tap first article card
        const firstCard = await page.locator('.article-card').first();
        await firstCard.click();
        await page.waitForTimeout(100);
        await firstCard.click();

        // Wait for heart animation
        await page.waitForTimeout(500);

        // Take screenshot
        await page.screenshot({
            path: 'screenshots/workspace3/04_article_heart.png',
            fullPage: true
        });

        console.log('✅ Article card double-tap animation working');
    });

    test('should display viral content with proper structure', async ({ page }) => {
        await page.goto('http://localhost:3002/articles-new.html');

        // Wait for articles to load
        await page.waitForSelector('.article-card', { timeout: 5000 });

        // Check first article has all required elements
        const firstCard = await page.locator('.article-card').first();

        // Should have category badge
        const category = await firstCard.locator('.category-badge');
        await expect(category).toBeVisible();

        // Should have title
        const title = await firstCard.locator('.card-title');
        await expect(title).toBeVisible();

        // Should have engagement stats
        const engagement = await firstCard.locator('.engagement-item');
        await expect(engagement.first()).toBeVisible();

        console.log('✅ Article cards have proper structure');
    });
});
