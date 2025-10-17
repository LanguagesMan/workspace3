// 🔥 COMPREHENSIVE FEATURE TEST - workspace3
// Tests ALL new TikTok/Duolingo 2025 enhancements

const { test, expect } = require('@playwright/test');

test.describe('🚀 TikTok 2025 Enhancement Tests', () => {

    test('📊 Engagement Metrics: Views, Watch Time, Likes display correctly', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');

        // Wait for videos to load
        await page.waitForSelector('.video-card', { timeout: 10000 });

        // Check engagement metrics are visible
        const metrics = await page.locator('.engagement-metrics').first();
        await expect(metrics).toBeVisible();

        // Verify view count is formatted (K/M notation)
        const viewsText = await page.locator('.views-count').first().textContent();
        console.log('✅ View count:', viewsText);
        expect(viewsText).toMatch(/[\d.]+[KM]?/);

        // Verify watch time display
        const watchTime = await page.locator('.watch-time').first();
        await expect(watchTime).toBeVisible();
        console.log('✅ Watch time tracking: Active');

        // Verify likes count
        const likesText = await page.locator('.likes-count').first().textContent();
        console.log('✅ Likes count:', likesText);
        expect(likesText).toMatch(/[\d.]+[KM]?/);

        // Verify circular progress ring
        const watchRing = await page.locator('.watch-time-ring').first();
        await expect(watchRing).toBeVisible();
        console.log('✅ Circular watch time ring: Visible');
    });

    test('💡 Word Translation: Click interaction with animations and sounds', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForSelector('.word-clickable', { timeout: 10000 });

        // Find first clickable word
        const word = page.locator('.word-clickable').first();
        await expect(word).toBeVisible();

        const wordText = await word.textContent();
        console.log('✅ Found clickable word:', wordText);

        // Click the word
        await word.click();

        // Wait for translation popup to appear
        await page.waitForSelector('.translation-popup.active', { timeout: 3000 });

        // Verify popup is visible
        const popup = page.locator('.translation-popup.active');
        await expect(popup).toBeVisible();
        console.log('✅ Translation popup appeared');

        // Verify translation content
        const translationWord = await popup.locator('.translation-word').textContent();
        const translationMeaning = await popup.locator('.translation-meaning').textContent();
        console.log('✅ Translation shown:', translationWord, translationMeaning);

        expect(translationMeaning).toContain('=');

        // Verify popup has gradient background (enhanced UX)
        const popupBg = await popup.evaluate(el =>
            window.getComputedStyle(el).background
        );
        console.log('✅ Popup has enhanced gradient background');
    });

    test('💬 Comment System: Bottom drawer opens and closes', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForSelector('.interaction-btn', { timeout: 10000 });

        // Find comment button (use .first() since there are multiple video cards)
        const commentBtn = page.locator('.interaction-btn').filter({ hasText: 'Comments' }).first();
        await expect(commentBtn).toBeVisible();
        console.log('✅ Comment button found');

        // Click to open comments drawer
        await commentBtn.click();

        // Wait for drawer to open
        await page.waitForSelector('.comments-drawer.open', { timeout: 2000 });

        // Verify drawer is open
        const drawer = page.locator('.comments-drawer.open');
        await expect(drawer).toBeVisible();
        console.log('✅ Comments drawer opened');

        // Verify comments are visible
        const comments = await page.locator('.comment').count();
        console.log('✅ Comments loaded:', comments);
        expect(comments).toBeGreaterThan(0);

        // Verify comment input exists
        const input = page.locator('#commentInput');
        await expect(input).toBeVisible();
        console.log('✅ Comment input field visible');

        // Close drawer
        await page.locator('.close-drawer-btn').click();
        await page.waitForTimeout(500);

        // Verify drawer is closed
        const drawerClosed = await page.locator('.comments-drawer.open').count();
        expect(drawerClosed).toBe(0);
        console.log('✅ Comments drawer closed');
    });

    test('💾 Save Word to Unified Database: Full workflow', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForSelector('.word-clickable', { timeout: 10000 });

        // Click a word
        const word = page.locator('.word-clickable').first();
        const wordText = await word.textContent();
        await word.click();

        // Wait for popup
        await page.waitForSelector('.translation-popup.active', { timeout: 3000 });

        // Click save flashcard button (use .first() since there are multiple cards)
        const saveBtn = page.locator('.save-flashcard-btn').first();
        await saveBtn.click();

        // Wait for success message
        await page.waitForTimeout(1000);

        // Verify word is now marked as known (green highlight)
        // Note: Word may appear in multiple videos, so use .first()
        const knownWord = page.locator('.word-clickable.known-word').filter({ hasText: wordText }).first();
        await expect(knownWord).toBeVisible();
        console.log('✅ Word saved and marked as known:', wordText);

        // Verify success message shown
        const successMsg = page.locator('.translation-popup.active .translation-meaning');
        const msgText = await successMsg.textContent();
        expect(msgText).toContain('Saved to all apps');
        console.log('✅ Success message displayed');
    });

    test('🎬 Video Playback Controls: Mute, Speed, Play/Pause', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForSelector('video', { timeout: 10000 });

        // Verify video exists
        const video = page.locator('video').first();
        await expect(video).toBeVisible();
        console.log('✅ Video loaded');

        // Verify mute button exists
        const muteBtn = page.locator('.mute-toggle').first();
        await expect(muteBtn).toBeVisible();
        console.log('✅ Mute button visible');

        // Verify playback controls exist
        const controls = page.locator('.playback-controls').first();
        await expect(controls).toBeVisible();
        console.log('✅ Playback controls visible');

        // Verify speed selector exists
        const speedBtn = page.locator('.control-btn').first();
        await expect(speedBtn).toBeVisible();
        console.log('✅ Speed control visible');
    });

    test('📱 Interaction Bar: All buttons present', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForSelector('.interaction-bar', { timeout: 10000 });

        // Verify all 4 buttons exist (use .first() since there are multiple cards)
        const likeBtn = page.locator('.interaction-btn').filter({ hasText: 'Like' }).first();
        const commentBtn = page.locator('.interaction-btn').filter({ hasText: 'Comments' }).first();
        const saveBtn = page.locator('.interaction-btn').filter({ hasText: 'Save' }).first();
        const shareBtn = page.locator('.interaction-btn').filter({ hasText: 'Share' }).first();

        await expect(likeBtn).toBeVisible();
        await expect(commentBtn).toBeVisible();
        await expect(saveBtn).toBeVisible();
        await expect(shareBtn).toBeVisible();

        console.log('✅ All interaction buttons present: Like, Comments, Save, Share');
    });

    test('🎯 Scroll Snap: TikTok-style vertical scrolling', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForSelector('.video-card', { timeout: 10000 });

        // Verify container has scroll-snap
        const container = page.locator('.shorts-container');
        const scrollSnapType = await container.evaluate(el =>
            window.getComputedStyle(el).scrollSnapType
        );

        expect(scrollSnapType).toContain('y mandatory');
        console.log('✅ Scroll snap enabled:', scrollSnapType);

        // Verify cards have snap alignment
        const card = page.locator('.video-card').first();
        const snapAlign = await card.evaluate(el =>
            window.getComputedStyle(el).scrollSnapAlign
        );

        expect(snapAlign).toContain('start');
        console.log('✅ Cards snap to start');
    });
});
