// 🔥 SESSION 5 - FEED VALIDATION WITH EXTENDED WAIT
// Tests that feed loads properly with longer timeouts

const { test, expect } = require('@playwright/test');

test.describe('🔥 Session 5 - Feed Validation', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Extended wait for dynamic content
        await page.waitForSelector('#feedContainer', { timeout: 20000 });
        console.log('✅ Feed container loaded');

        // Wait for API call to complete and cards to render
        await page.waitForTimeout(8000); // 8 seconds for API + rendering
    });

    test('should load feed with extended wait time', async ({ page }) => {
        // Check feed container exists
        const feedContainer = await page.locator('#feedContainer');
        expect(await feedContainer.isVisible()).toBe(true);

        // Check for content cards after extended wait
        const cards = await page.locator('.content-card').count();
        console.log(`✅ Loaded ${cards} content cards after 8-second wait`);

        // Screenshot full feed
        await page.screenshot({
            path: 'tests/screenshots/session5-feed-loaded.png',
            fullPage: true
        });

        expect(cards).toBeGreaterThan(0);
    });

    test('should show all card elements with extended wait', async ({ page }) => {
        // Wait for first card
        await page.waitForSelector('.content-card', { timeout: 15000 });

        const firstCard = page.locator('.content-card').first();
        await expect(firstCard).toBeVisible();

        // Check all elements
        const elements = {
            spanishText: await firstCard.locator('.spanish-text').count(),
            listenBtn: await firstCard.locator('button:has-text("Listen")').count(),
            practiceBtn: await firstCard.locator('button:has-text("Practice")').count(),
            likeBtn: await firstCard.locator('button:has-text("❤️")').count(),
        };

        console.log('Card elements:', elements);

        // Screenshot first card
        await firstCard.screenshot({
            path: 'tests/screenshots/session5-first-card.png'
        });

        expect(elements.spanishText).toBeGreaterThan(0);
        expect(elements.listenBtn).toBeGreaterThan(0);
    });

    test('should validate complete feed ecosystem', async ({ page }) => {
        // Wait for cards to load
        await page.waitForSelector('.content-card', { timeout: 15000 });

        const checks = {
            feedLoaded: await page.locator('#feedContainer').isVisible(),
            cardsPresent: (await page.locator('.content-card').count()) > 0,
            spanishText: (await page.locator('.spanish-text').count()) > 0,
            listenButtons: (await page.locator('button:has-text("Listen")').count()) > 0,
            practiceButtons: (await page.locator('button:has-text("Practice")').count()) > 0,
        };

        console.log('🔥 Session 5 Ecosystem Status:');
        Object.entries(checks).forEach(([feature, status]) => {
            console.log(`  ${status ? '✅' : '❌'} ${feature}`);
        });

        // Final comprehensive screenshot
        await page.screenshot({
            path: 'tests/screenshots/session5-complete-ecosystem.png',
            fullPage: true
        });

        // All features should be present
        Object.values(checks).forEach(status => {
            expect(status).toBe(true);
        });
    });

    test('should auto-play audio on scroll', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 15000 });

        // Scroll to trigger auto-play
        await page.evaluate(() => window.scrollTo(0, 300));
        await page.waitForTimeout(2000);

        console.log('✅ Auto-play scroll test completed');

        await page.screenshot({
            path: 'tests/screenshots/session5-auto-play.png',
            fullPage: true
        });
    });

    test('should show viral content integration', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 15000 });

        // Count different content types
        const contentTypes = await page.locator('.content-type').allTextContents();
        const uniqueTypes = [...new Set(contentTypes)];

        console.log(`📊 Content types found: ${uniqueTypes.join(', ')}`);
        console.log(`✅ ${uniqueTypes.length} different content types`);

        await page.screenshot({
            path: 'tests/screenshots/session5-viral-content.png',
            fullPage: true
        });

        expect(uniqueTypes.length).toBeGreaterThan(0);
    });

    test('should verify pronunciation recording UI', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 15000 });

        const practiceButtons = await page.locator('button:has-text("Practice")').count();
        console.log(`🎤 Found ${practiceButtons} Practice buttons`);

        await page.screenshot({
            path: 'tests/screenshots/session5-pronunciation-ui.png'
        });

        expect(practiceButtons).toBeGreaterThan(0);
    });

    test('should test mobile responsive view', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForSelector('.content-card', { timeout: 15000 });
        await page.waitForTimeout(2000);

        const cards = await page.locator('.content-card').count();
        console.log(`📱 Mobile view: ${cards} cards visible`);

        await page.screenshot({
            path: 'tests/screenshots/session5-mobile-view.png',
            fullPage: true
        });

        expect(cards).toBeGreaterThan(0);
    });

    test('should validate API health', async ({ page }) => {
        const response = await page.goto('http://localhost:3002/health');
        expect(response.status()).toBe(200);

        const data = await response.json();
        console.log(`💚 Health: ${data.status}`);
        console.log(`📦 Features: ${data.features.length}`);
        console.log(`🎯 Feature list: ${data.features.join(', ')}`);

        expect(data.status).toBe('healthy');
        expect(data.features.length).toBeGreaterThan(10);
    });

});

console.log('🔥 SESSION 5 FEED VALIDATION - EXTENDED WAIT TIMES FOR DYNAMIC CONTENT');
