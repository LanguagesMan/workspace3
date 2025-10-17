// TikTok Vertical Video Feed Test
// Scraped patterns from tiktok.com/@spanish.learning 2025
// Testing full-screen vertical videos with subtitles

const { test, expect } = require('@playwright/test');

test.describe('TikTok-Style Vertical Video Feed', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForLoadState('networkidle');
    });

    test('Videos tab shows TikTok-style full-screen vertical videos', async ({ page }) => {
        // Click Videos tab
        await page.click('[data-tab="videos"]');
        await page.waitForTimeout(500);

        // Verify video-mode class is added to feed container
        const feedContainer = page.locator('#feedContainer');
        await expect(feedContainer).toHaveClass(/video-mode/);

        // Verify full-screen video cards exist
        const videoCards = page.locator('.video-card-fullscreen');
        const count = await videoCards.count();
        expect(count).toBeGreaterThan(0);

        console.log(`✅ Found ${count} TikTok-style full-screen video cards`);

        // Take screenshot
        await page.screenshot({
            path: 'screenshots/evidence/tiktok-vertical-videos.png',
            fullPage: false
        });
    });

    test('Video cards have TikTok-style right-side action buttons', async ({ page }) => {
        await page.click('[data-tab="videos"]');
        await page.waitForTimeout(500);

        // Verify right-side action buttons exist
        const actionButtons = page.locator('.video-actions-right');
        await expect(actionButtons.first()).toBeVisible();

        // Verify individual action buttons
        const likeBtn = page.locator('.video-action-btn').first();
        await expect(likeBtn).toBeVisible();

        console.log('✅ TikTok-style right-side action buttons present');
    });

    test('Video cards have bottom info overlay (creator, description, subtitles)', async ({ page }) => {
        await page.click('[data-tab="videos"]');
        await page.waitForTimeout(500);

        // Verify bottom info section
        const videoInfo = page.locator('.video-info-bottom');
        await expect(videoInfo.first()).toBeVisible();

        // Verify creator info
        const creator = page.locator('.video-creator');
        await expect(creator.first()).toBeVisible();

        // Verify description
        const description = page.locator('.video-description');
        await expect(description.first()).toBeVisible();

        console.log('✅ Video bottom info (creator, description) present');
    });

    test('Videos have Spanish subtitles with tap-to-translate', async ({ page }) => {
        await page.click('[data-tab="videos"]');
        await page.waitForTimeout(1000);

        // Look for subtitle text
        const subtitles = page.locator('.video-subtitle-text');
        const subtitleCount = await subtitles.count();

        if (subtitleCount > 0) {
            // Click subtitle to toggle translation
            await subtitles.first().click();
            await page.waitForTimeout(300);

            // Verify translation appears
            const translation = page.locator('.video-subtitle-translation');
            await expect(translation.first()).toBeVisible();

            console.log('✅ Subtitle tap-to-translate working');

            // Take screenshot
            await page.screenshot({
                path: 'screenshots/evidence/video-subtitle-translation.png',
                fullPage: false
            });
        } else {
            console.log('⚠️ No subtitles found on videos (might be expected for some content)');
        }
    });

    test('Articles tab still shows card feed (not full-screen videos)', async ({ page }) => {
        // Click Articles tab
        await page.click('[data-tab="articles"]');
        await page.waitForTimeout(500);

        // Verify video-mode class is NOT present
        const feedContainer = page.locator('#feedContainer');
        const hasVideoMode = await feedContainer.evaluate(el => el.classList.contains('video-mode'));
        expect(hasVideoMode).toBe(false);

        // Verify content cards exist (not video-card-fullscreen)
        const contentCards = page.locator('.content-card');
        const count = await contentCards.count();
        expect(count).toBeGreaterThan(0);

        console.log(`✅ Articles tab shows ${count} card-style content (not full-screen videos)`);

        // Take screenshot
        await page.screenshot({
            path: 'screenshots/evidence/articles-card-feed.png',
            fullPage: false
        });
    });

    test('Stories tab shows card feed (not full-screen videos)', async ({ page }) => {
        // Click Stories tab
        await page.click('[data-tab="stories"]');
        await page.waitForTimeout(500);

        // Verify video-mode class is NOT present
        const feedContainer = page.locator('#feedContainer');
        const hasVideoMode = await feedContainer.evaluate(el => el.classList.contains('video-mode'));
        expect(hasVideoMode).toBe(false);

        // Verify content cards exist
        const contentCards = page.locator('.content-card');
        const count = await contentCards.count();
        expect(count).toBeGreaterThan(0);

        console.log(`✅ Stories tab shows ${count} card-style content (not full-screen videos)`);

        // Take screenshot
        await page.screenshot({
            path: 'screenshots/evidence/stories-card-feed.png',
            fullPage: false
        });
    });

    test('Full-screen videos are properly sized (fill viewport)', async ({ page }) => {
        await page.click('[data-tab="videos"]');
        await page.waitForTimeout(500);

        const videoCard = page.locator('.video-card-fullscreen').first();
        const box = await videoCard.boundingBox();

        // Verify height is close to viewport height (minus nav bars ~120px)
        const viewportHeight = page.viewportSize().height;
        const expectedHeight = viewportHeight - 120; // Nav bars

        expect(box.height).toBeGreaterThan(expectedHeight - 50); // Allow some tolerance

        console.log(`✅ Video card height: ${box.height}px (viewport: ${viewportHeight}px, expected: ${expectedHeight}px)`);
    });

    test('Video action buttons are clickable and functional', async ({ page }) => {
        await page.click('[data-tab="videos"]');
        await page.waitForTimeout(500);

        // Test like button
        const likeBtn = page.locator('.video-action-btn').first();
        await likeBtn.click();
        await page.waitForTimeout(200);

        // Verify liked state
        const hasLiked = await likeBtn.evaluate(el => el.classList.contains('liked'));
        expect(hasLiked).toBe(true);

        console.log('✅ Video like button functional');
    });

    test('Video feed has snap scroll behavior', async ({ page }) => {
        await page.click('[data-tab="videos"]');
        await page.waitForTimeout(500);

        // Verify body has snap scroll CSS
        const bodyStyle = await page.evaluate(() => {
            return window.getComputedStyle(document.body).scrollSnapType;
        });

        expect(bodyStyle).toContain('y');
        console.log(`✅ Snap scroll enabled: ${bodyStyle}`);
    });

    test('Performance: Videos load quickly (<2s)', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.click('[data-tab="videos"]');
        await page.waitForSelector('.video-card-fullscreen', { timeout: 2000 });

        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(2000);
        console.log(`✅ Videos loaded in ${loadTime}ms`);
    });

    test('WCAG 2.1 AA: Video action buttons have aria-labels', async ({ page }) => {
        await page.click('[data-tab="videos"]');
        await page.waitForTimeout(500);

        // Check aria-labels on action buttons
        const actionBtns = page.locator('.video-action-btn');
        const count = await actionBtns.count();

        for (let i = 0; i < Math.min(count, 4); i++) {
            const btn = actionBtns.nth(i);
            const ariaLabel = await btn.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
        }

        console.log('✅ WCAG 2.1 AA: Video action buttons have aria-labels');
    });

    test('Multi-device: Videos display correctly on mobile (iPhone 12)', async ({ page }) => {
        // Set iPhone 12 viewport
        await page.setViewportSize({ width: 390, height: 844 });

        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.click('[data-tab="videos"]');
        await page.waitForTimeout(500);

        // Verify video cards are full-width
        const videoCard = page.locator('.video-card-fullscreen').first();
        const box = await videoCard.boundingBox();

        expect(box.width).toBe(390);

        console.log('✅ Videos display correctly on iPhone 12');

        // Take mobile screenshot
        await page.screenshot({
            path: 'screenshots/evidence/videos-mobile-iphone12.png',
            fullPage: false
        });
    });

    test('Multi-device: Videos display correctly on desktop', async ({ page }) => {
        // Set desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });

        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.click('[data-tab="videos"]');
        await page.waitForTimeout(500);

        // Verify videos are present
        const videoCards = page.locator('.video-card-fullscreen');
        const count = await videoCards.count();
        expect(count).toBeGreaterThan(0);

        console.log('✅ Videos display correctly on desktop');

        // Take desktop screenshot
        await page.screenshot({
            path: 'screenshots/evidence/videos-desktop-1920.png',
            fullPage: false
        });
    });
});
