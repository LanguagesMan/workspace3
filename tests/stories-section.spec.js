const { test, expect } = require('@playwright/test');

test.describe('Stories Section - Instagram/TikTok Pattern', () => {
    test('should display stories bar with horizontal scroll', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');

        // Wait for stories to load
        await page.waitForSelector('.stories-bar', { timeout: 5000 });

        // Verify stories bar is visible
        const storiesBar = page.locator('.stories-bar');
        await expect(storiesBar).toBeVisible();

        // Verify stories are loaded
        const storyItems = page.locator('.story-item');
        const count = await storyItems.count();
        expect(count).toBeGreaterThan(0);

        console.log(`✅ Found ${count} stories in the bar`);
    });

    test('should show all story categories', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');

        await page.waitForSelector('.story-item', { timeout: 5000 });

        // Verify we have 15 stories loaded (including scrollable ones)
        const storyItems = page.locator('.story-item');
        const count = await storyItems.count();
        expect(count).toBe(15);

        console.log(`✅ All 15 story categories loaded`);
    });

    test('should open story on click', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');

        await page.waitForSelector('.story-item', { timeout: 5000 });

        // Set up dialog handler
        page.on('dialog', async dialog => {
            const message = dialog.message();
            expect(message).toContain('📖');
            await dialog.accept();
        });

        // Click first story
        const firstStory = page.locator('.story-item').first();
        await firstStory.click();

        console.log('✅ Story opened successfully');
    });

    test('should have Instagram-style circular avatars', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');

        await page.waitForSelector('.story-avatar', { timeout: 5000 });

        // Check avatar styling
        const avatar = page.locator('.story-avatar').first();
        const borderRadius = await avatar.evaluate(el =>
            window.getComputedStyle(el).borderRadius
        );

        expect(borderRadius).toBe('50%');

        console.log('✅ Stories have circular avatars (Instagram pattern)');
    });

    test('should support horizontal scrolling', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');

        await page.waitForSelector('.stories-bar', { timeout: 5000 });

        const storiesBar = page.locator('.stories-bar');

        // Check overflow-x is auto/scroll
        const overflowX = await storiesBar.evaluate(el =>
            window.getComputedStyle(el).overflowX
        );

        expect(['auto', 'scroll']).toContain(overflowX);

        console.log('✅ Stories bar supports horizontal scrolling');
    });

    test('should have proper story structure', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');

        await page.waitForSelector('.story-item', { timeout: 5000 });

        // Verify story structure (first visible story)
        const firstStory = page.locator('.story-item').first();
        const avatar = firstStory.locator('.story-avatar');

        await expect(avatar).toBeVisible();

        // Check story has emoji icon
        const avatarInner = firstStory.locator('.story-avatar-inner');
        const emojiText = await avatarInner.textContent();
        expect(emojiText.trim().length).toBeGreaterThan(0);

        console.log('✅ Stories have proper structure (avatar with emoji)');
    });
});
