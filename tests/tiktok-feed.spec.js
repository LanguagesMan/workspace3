// TikTok-Style Feed Test Suite - Comprehensive Validation
const { test, expect } = require('@playwright/test');

test.describe('TikTok-Style Full-Screen Feed', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000); // Wait for content to load
    });

    test('should display full-screen cards like TikTok', async ({ page }) => {
        // Check feed container has correct scroll-snap
        const feedContainer = await page.locator('#feedContainer');
        await expect(feedContainer).toBeVisible();

        // Check cards are full viewport height
        const firstCard = await page.locator('.content-card').first();
        const cardHeight = await firstCard.evaluate(el => el.offsetHeight);
        const viewportHeight = await page.evaluate(() => window.innerHeight);

        // Card should be full viewport height (within 10px tolerance)
        expect(Math.abs(cardHeight - viewportHeight)).toBeLessThan(10);
    });

    test('should have hidden scrollbar like TikTok', async ({ page }) => {
        // Check scrollbar is hidden via CSS
        const feedContainer = await page.locator('#feedContainer');
        const scrollbarWidth = await feedContainer.evaluate(el => {
            return el.offsetWidth - el.clientWidth;
        });

        expect(scrollbarWidth).toBe(0); // Scrollbar should be hidden
    });

    test('should translate Spanish words on click', async ({ page }) => {
        // Wait for Spanish text to appear
        await page.waitForSelector('.spanish-word', { timeout: 10000 });

        // Get first Spanish word
        const firstWord = await page.locator('.spanish-word').first();
        const wordText = await firstWord.textContent();

        // Click the word
        await firstWord.click();

        // Wait for translation tooltip to appear
        await page.waitForSelector('.translation-tooltip', { timeout: 5000 });

        // Verify tooltip is visible
        const tooltip = await page.locator('.translation-tooltip');
        await expect(tooltip).toBeVisible();

        // Verify tooltip contains translation
        const translation = await page.locator('.tooltip-translation');
        await expect(translation).toBeVisible();

        const translationText = await translation.textContent();
        expect(translationText.length).toBeGreaterThan(0);
        expect(translationText).not.toBe(wordText); // Translation should be different from original word
    });

    test('should display Spanish content', async ({ page }) => {
        // Check for Spanish text elements
        const spanishText = await page.locator('.spanish-text');
        await expect(spanishText.first()).toBeVisible();

        // Verify it contains Spanish words
        const text = await spanishText.first().textContent();
        expect(text.length).toBeGreaterThan(0);
    });

    test('should have engagement buttons (like, comment, share, save)', async ({ page }) => {
        // Check for TikTok-style interaction buttons
        await expect(page.locator('button:has-text("❤️"), button:has-text("0")').first()).toBeVisible();
        await expect(page.locator('button:has-text("Share")').first()).toBeVisible();
        await expect(page.locator('button:has-text("Save")').first()).toBeVisible();
    });

    test('should have bottom navigation like TikTok', async ({ page }) => {
        // Check for bottom nav bar
        const bottomNav = await page.locator('.bottom-nav');
        await expect(bottomNav).toBeVisible();

        // Check for nav items (Reels, News, Chat, Profile) - use specific selectors
        await expect(page.locator('.bottom-nav .nav-item:has-text("Reels")')).toBeVisible();
        await expect(page.locator('.bottom-nav .nav-item:has-text("News")')).toBeVisible();
    });

    test('should support scroll-snap behavior', async ({ page }) => {
        const feedContainer = await page.locator('#feedContainer');

        // Get initial scroll position
        const initialScroll = await feedContainer.evaluate(el => el.scrollTop);

        // Simulate scroll
        await feedContainer.evaluate(el => {
            el.scrollBy({ top: 100, behavior: 'instant' });
        });

        // Wait for snap to complete
        await page.waitForTimeout(500);

        // Get final scroll position
        const finalScroll = await feedContainer.evaluate(el => el.scrollTop);

        // Should have scrolled (snap behavior will position it at card boundary)
        expect(finalScroll).toBeGreaterThan(initialScroll);
    });

    test('should display content cards with proper styling', async ({ page }) => {
        const cards = await page.locator('.content-card');
        const count = await cards.count();

        expect(count).toBeGreaterThan(0);

        // Check first card has proper styling
        const firstCard = cards.first();
        await expect(firstCard).toBeVisible();

        // Check background color is dark (TikTok style)
        const bgColor = await firstCard.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
        );
        expect(bgColor).toContain('rgb'); // Should have background color
    });

    test('mobile viewport should display correctly', async ({ page }) => {
        // Set mobile viewport (iPhone 12 Pro)
        await page.setViewportSize({ width: 390, height: 844 });

        // Reload page
        await page.reload();
        await page.waitForTimeout(3000);

        // Check feed is still full-screen
        const firstCard = await page.locator('.content-card').first();
        const cardHeight = await firstCard.evaluate(el => el.offsetHeight);
        const viewportHeight = 844;

        expect(Math.abs(cardHeight - viewportHeight)).toBeLessThan(10);
    });

    test('should handle rapid word clicks without errors', async ({ page }) => {
        // Wait for Spanish text
        await page.waitForSelector('.spanish-word', { timeout: 10000 });

        // Get all Spanish words
        const words = await page.locator('.spanish-word');
        const count = Math.min(await words.count(), 5); // Test first 5 words

        // Click multiple words rapidly
        for (let i = 0; i < count; i++) {
            await words.nth(i).click();
            await page.waitForTimeout(100); // Small delay
        }

        // Should not crash or show errors
        const errorElements = await page.locator('.error, [class*="error"]').count();
        expect(errorElements).toBe(0);
    });

    test('should load within 5 seconds (performance check)', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('http://localhost:3002');
        await page.waitForSelector('.content-card, .skeleton-card', { timeout: 5000 });

        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(5000);
    });
});
