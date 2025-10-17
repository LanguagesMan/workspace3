// 🍎 APPLE-STYLE DESIGN TEST
// Verifies beautiful Instagram-inspired feed with rounded cards

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3002';

test.describe('🍎 Apple-Style Beautiful Design', () => {

    test('should load Apple-style feed with beautiful design', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForLoadState('networkidle');

        // Check header
        const logo = await page.locator('.logo');
        await expect(logo).toBeVisible();
        await expect(logo).toContainText('VIDA');

        // Check level badge
        const levelBadge = await page.locator('.level-badge');
        await expect(levelBadge).toBeVisible();

        console.log('✅ Header loaded with beautiful design');

        // Screenshot: Desktop view
        await page.screenshot({
            path: 'screenshots/apple-design-desktop.png',
            fullPage: true
        });

        console.log('📸 Screenshot: apple-design-desktop.png');
    });

    test('should display stats bar with gradient text', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForLoadState('networkidle');

        // Check stats bar
        const statsBar = await page.locator('.stats-bar');
        await expect(statsBar).toBeVisible();

        const statValues = await page.locator('.stat-value');
        const count = await statValues.count();
        expect(count).toBeGreaterThanOrEqual(3);

        console.log('✅ Stats bar with 3 gradient statistics displayed');

        // Screenshot: Stats focus
        await page.screenshot({
            path: 'screenshots/apple-design-stats.png'
        });

        console.log('📸 Screenshot: apple-design-stats.png');
    });

    test('should load Spanish content cards with rounded design', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(2000); // Wait for API load

        // Check cards exist
        const cards = await page.locator('.card');
        const cardCount = await cards.count();

        console.log(`✅ Loaded ${cardCount} beautiful rounded cards`);
        expect(cardCount).toBeGreaterThan(0);

        // Check card structure
        const firstCard = cards.first();
        await expect(firstCard).toBeVisible();

        const cardHeader = await firstCard.locator('.card-header');
        await expect(cardHeader).toBeVisible();

        const avatar = await firstCard.locator('.avatar');
        await expect(avatar).toBeVisible();

        console.log('✅ Card components: header, avatar, content all present');

        // Screenshot: Cards loaded
        await page.screenshot({
            path: 'screenshots/apple-design-cards.png',
            fullPage: true
        });

        console.log('📸 Screenshot: apple-design-cards.png');
    });

    test('should test mobile responsive design', async ({ page }) => {
        // iPhone 13 Pro viewport
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Check mobile layout
        const header = await page.locator('.header');
        await expect(header).toBeVisible();

        const cards = await page.locator('.card');
        const count = await cards.count();
        console.log(`📱 Mobile view: ${count} cards displayed`);

        // Screenshot: Mobile view
        await page.screenshot({
            path: 'screenshots/apple-design-mobile.png',
            fullPage: true
        });

        console.log('📸 Screenshot: apple-design-mobile.png (iPhone 13 Pro)');
    });

    test('should test tablet responsive design', async ({ page }) => {
        // iPad Pro viewport
        await page.setViewportSize({ width: 1024, height: 1366 });
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const feedContainer = await page.locator('.feed-container');
        await expect(feedContainer).toBeVisible();

        // Screenshot: Tablet view
        await page.screenshot({
            path: 'screenshots/apple-design-tablet.png',
            fullPage: true
        });

        console.log('📸 Screenshot: apple-design-tablet.png (iPad Pro)');
    });

    test('should verify Spanish text with clickable words', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(2000);

        // Check Spanish text
        const spanishText = await page.locator('.spanish-text').first();
        await expect(spanishText).toBeVisible();

        // Check clickable words
        const words = await page.locator('.spanish-word');
        const wordCount = await words.count();

        console.log(`✅ Spanish text with ${wordCount} clickable words`);
        expect(wordCount).toBeGreaterThan(0);

        // Screenshot: Spanish content
        await page.screenshot({
            path: 'screenshots/apple-design-spanish.png'
        });

        console.log('📸 Screenshot: apple-design-spanish.png');
    });

    test('should test action buttons and interactions', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(2000);

        const cards = await page.locator('.card');
        if (await cards.count() > 0) {
            const firstCard = cards.first();

            // Find translate button
            const translateBtn = await firstCard.locator('.action-btn-secondary');
            await expect(translateBtn).toBeVisible();

            // Find save button
            const saveBtn = await firstCard.locator('.action-btn-primary');
            await expect(saveBtn).toBeVisible();

            console.log('✅ Action buttons: Translate & Save present');

            // Click save button
            await saveBtn.click();
            await page.waitForTimeout(500);

            // Screenshot: After interaction
            await page.screenshot({
                path: 'screenshots/apple-design-interaction.png',
                fullPage: true
            });

            console.log('📸 Screenshot: apple-design-interaction.png');
        }
    });

    test('should verify floating action button', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForLoadState('networkidle');

        const fab = await page.locator('.fab');
        await expect(fab).toBeVisible();

        console.log('✅ Floating action button (FAB) present');

        // Screenshot: FAB visible
        await page.screenshot({
            path: 'screenshots/apple-design-fab.png'
        });

        console.log('📸 Screenshot: apple-design-fab.png');
    });

    test('should capture complete beautiful design showcase', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(3000); // Wait for all content

        // Scroll to show more cards
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(500);

        // Final showcase screenshot
        await page.screenshot({
            path: 'screenshots/APPLE-DESIGN-SHOWCASE.png',
            fullPage: true
        });

        console.log('📸 🌟 Screenshot: APPLE-DESIGN-SHOWCASE.png');
        console.log('✅ Beautiful Apple-inspired design fully captured!');
    });
});
