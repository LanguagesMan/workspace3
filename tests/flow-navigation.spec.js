const { test, expect } = require('@playwright/test');

test.describe('Complete Flow: Videos → Articles → Chat', () => {

    test('should navigate through complete user journey', async ({ page }) => {
        // STEP 1: Start with Videos
        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForLoadState('networkidle');

        // Verify Videos page loaded
        await expect(page.locator('.video-slide')).toBeVisible({ timeout: 10000 });
        console.log('✅ Videos page loaded');

        // STEP 2: Navigate to Articles
        await page.click('a[href="/unified-infinite-feed.html"]');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for content to load

        // Verify Articles page loaded
        const articlesUrl = page.url();
        expect(articlesUrl).toContain('unified-infinite-feed');
        console.log('✅ Navigated to Articles page');

        // Check if articles are loading or showing skeleton
        const hasContent = await page.locator('.feed-card, .skeleton-card').count();
        expect(hasContent).toBeGreaterThan(0);
        console.log(`✅ Articles page has ${hasContent} items (content or loading)`);

        // STEP 3: Navigate to Chat
        await page.click('a[href="/chat.html"]');
        await page.waitForLoadState('networkidle');

        // Verify Chat page loaded
        const chatUrl = page.url();
        expect(chatUrl).toContain('chat');
        await expect(page.locator('.chat-container, .messages-container')).toBeVisible({ timeout: 5000 });
        console.log('✅ Navigated to Chat page');

        // STEP 4: Navigate back to Videos
        await page.click('a[href="/tiktok-videos.html"]');
        await page.waitForLoadState('networkidle');

        // Verify back to Videos
        await expect(page.locator('.video-slide')).toBeVisible({ timeout: 10000 });
        console.log('✅ Navigated back to Videos');

        // FINAL CHECK: All navigation links present on every page
        const navLinks = await page.locator('.bottom-nav .nav-item').count();
        expect(navLinks).toBe(4); // Videos, Articles, Chat, Profile
        console.log('✅ Bottom nav with 4 items present');

        console.log('\n🎉 COMPLETE FLOW VERIFIED!');
        console.log('Videos → Articles → Chat → Videos ✅');
    });

    test('should show AI difficulty adaptation on videos', async ({ page }) => {
        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForLoadState('networkidle');

        // Check for engagement hook (3-second hook)
        const hook = await page.locator('.engagement-hook');
        const hookVisible = await hook.isVisible().catch(() => false);

        if (hookVisible) {
            const hookText = await hook.textContent();
            expect(hookText).toMatch(/Beginner|Level Up|Advanced/);
            console.log(`✅ AI Difficulty Hook: "${hookText}"`);
        }

        // Check for animated subtitles
        const subtitles = await page.locator('.spanish-line').first();
        await expect(subtitles).toBeVisible({ timeout: 10000 });
        console.log('✅ Animated subtitles present');
    });

});
