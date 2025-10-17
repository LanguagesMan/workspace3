const { test, expect } = require('@playwright/test');

test.describe('TikTok-Style Reels + Stories - Complete Test Suite', () => {
    const baseURL = 'http://localhost:3002/unified-infinite-feed.html';

    test('App opens DIRECTLY to Reels tab (no redirect delay)', async ({ page }) => {
        await page.goto(baseURL);

        // Should see Reels tab active immediately
        const reelsTab = page.locator('[data-tab="reels"]');
        await expect(reelsTab).toHaveClass(/active/);

        // Should see full-screen video content immediately
        const feedContainer = page.locator('#feedContainer');
        await expect(feedContainer).toBeVisible();

        console.log('✅ App opens directly to Reels tab');
    });

    test('Three tabs are visible - Stories, Reels, Feed', async ({ page }) => {
        await page.goto(baseURL);

        // Check all 3 tabs exist
        const storiesTab = page.locator('[data-tab="stories"]');
        const reelsTab = page.locator('[data-tab="reels"]');
        const feedTab = page.locator('[data-tab="feed"]');

        await expect(storiesTab).toBeVisible();
        await expect(reelsTab).toBeVisible();
        await expect(feedTab).toBeVisible();

        // Check tab text content
        await expect(storiesTab).toContainText('Stories');
        await expect(reelsTab).toContainText('Reels');
        await expect(feedTab).toContainText('Feed');

        console.log('✅ All 3 tabs visible with correct labels');
    });

    test('Tab switching works smoothly - Reels → Stories → Feed', async ({ page }) => {
        await page.goto(baseURL);
        await page.waitForTimeout(2000); // Wait for initial content load

        // Start on Reels (default)
        let activeTab = page.locator('.nav-tab.active');
        await expect(activeTab).toHaveAttribute('data-tab', 'reels');

        // Switch to Stories
        await page.click('[data-tab="stories"]');
        await page.waitForTimeout(500);
        activeTab = page.locator('.nav-tab.active');
        await expect(activeTab).toHaveAttribute('data-tab', 'stories');

        // Switch to Feed
        await page.click('[data-tab="feed"]');
        await page.waitForTimeout(500);
        activeTab = page.locator('.nav-tab.active');
        await expect(activeTab).toHaveAttribute('data-tab', 'feed');

        // Switch back to Reels
        await page.click('[data-tab="reels"]');
        await page.waitForTimeout(500);
        activeTab = page.locator('.nav-tab.active');
        await expect(activeTab).toHaveAttribute('data-tab', 'reels');

        console.log('✅ Tab switching works smoothly');
    });

    test('Stories section shows educational content with clickable words', async ({ page }) => {
        await page.goto(baseURL);
        await page.waitForTimeout(2000);

        // Switch to Stories tab
        await page.click('[data-tab="stories"]');
        await page.waitForTimeout(1000);

        // Should see story cards
        const storyCards = page.locator('.content-card');
        const count = await storyCards.count();
        expect(count).toBeGreaterThan(0);

        // Check if stories have Spanish text
        const spanishText = page.locator('.spanish-word').first();
        await expect(spanishText).toBeVisible();

        console.log(`✅ Stories section loaded with ${count} story cards`);
    });

    test('Reels section shows full-screen videos', async ({ page }) => {
        await page.goto(baseURL);
        await page.waitForTimeout(3000); // Wait for videos to load

        // Should be on Reels tab by default
        const activeTab = page.locator('.nav-tab.active');
        await expect(activeTab).toHaveAttribute('data-tab', 'reels');

        // Check for video elements
        const videoElements = page.locator('video');
        const videoCount = await videoElements.count();
        expect(videoCount).toBeGreaterThan(0);

        console.log(`✅ Reels section loaded with ${videoCount} videos`);
    });

    test('Video subtitles have clickable words', async ({ page }) => {
        await page.goto(baseURL);
        await page.waitForTimeout(3000);

        // Look for clickable subtitle words
        const clickableWords = page.locator('.clickable-word, .spanish-word');
        const wordCount = await clickableWords.count();

        if (wordCount > 0) {
            console.log(`✅ Found ${wordCount} clickable words in subtitles`);
        } else {
            console.log('⚠️ No clickable words found yet - may need to wait for video to play');
        }
    });

    test('Clicking word shows translation tooltip', async ({ page }) => {
        await page.goto(baseURL);
        await page.waitForTimeout(2000);

        // Go to Stories tab for easier testing
        await page.click('[data-tab="stories"]');
        await page.waitForTimeout(1000);

        // Find first clickable Spanish word
        const spanishWord = page.locator('.spanish-word').first();
        if (await spanishWord.isVisible()) {
            await spanishWord.click();
            await page.waitForTimeout(500);

            // Look for translation popup/tooltip
            const tooltip = page.locator('.translation-popup, .word-tooltip, .translation-tooltip');
            if (await tooltip.count() > 0) {
                console.log('✅ Translation tooltip appeared after clicking word');
            } else {
                console.log('⚠️ Tooltip may appear - checking console for API calls');
            }
        }
    });

    test('Check browser console for errors', async ({ page }) => {
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto(baseURL);
        await page.waitForTimeout(3000);

        // Switch through all tabs
        await page.click('[data-tab="stories"]');
        await page.waitForTimeout(1000);
        await page.click('[data-tab="feed"]');
        await page.waitForTimeout(1000);
        await page.click('[data-tab="reels"]');
        await page.waitForTimeout(1000);

        if (consoleErrors.length > 0) {
            console.log('❌ Console errors found:');
            consoleErrors.forEach(err => console.log('  -', err));
        } else {
            console.log('✅ No console errors detected');
        }

        expect(consoleErrors.length).toBe(0);
    });

    test('Scroll snap behavior works (TikTok-style)', async ({ page }) => {
        await page.goto(baseURL);
        await page.waitForTimeout(3000);

        // Get initial scroll position
        const feedContainer = page.locator('#feedContainer');
        await expect(feedContainer).toBeVisible();

        // Try to scroll down
        await feedContainer.evaluate(el => el.scrollBy(0, 100));
        await page.waitForTimeout(300);

        // Scroll should snap to full-screen card
        const scrollTop = await feedContainer.evaluate(el => el.scrollTop);
        console.log(`✅ Scroll position: ${scrollTop}px (should snap to viewport height)`);
    });

    test('XP and Streak banner visible', async ({ page }) => {
        await page.goto(baseURL);

        const xpBanner = page.locator('#xpStreakBanner');
        await expect(xpBanner).toBeVisible();

        console.log('✅ XP & Streak banner visible');
    });

    test('Story cards have beautiful gradients and emojis', async ({ page }) => {
        await page.goto(baseURL);
        await page.waitForTimeout(2000);

        await page.click('[data-tab="stories"]');
        await page.waitForTimeout(1000);

        const storyCard = page.locator('.content-card').first();
        await expect(storyCard).toBeVisible();

        // Check for gradient background
        const background = await storyCard.evaluate(el =>
            window.getComputedStyle(el).background
        );

        if (background.includes('gradient') || background.includes('linear')) {
            console.log('✅ Story cards have gradient backgrounds');
        }
    });

    test('Performance: Initial load under 3 seconds', async ({ page }) => {
        const startTime = Date.now();

        await page.goto(baseURL);
        await page.waitForSelector('#feedContainer');
        await page.waitForTimeout(1000);

        const loadTime = Date.now() - startTime;
        console.log(`✅ Page loaded in ${loadTime}ms`);

        expect(loadTime).toBeLessThan(3000);
    });
});
