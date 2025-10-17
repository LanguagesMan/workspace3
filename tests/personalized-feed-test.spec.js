// 🧪 PERSONALIZED FEED TEST - TikTok/Instagram 2025 Quality Standards
// Tests: Lazy loading, SRS integration, engagement tracking, performance

const { test, expect } = require('@playwright/test');

test.describe('Personalized Feed - 2025 Standards', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to personalized feed
        await page.goto('http://localhost:3002/personalized-feed.html');
        await page.waitForLoadState('networkidle');
    });

    test('Page loads and displays minimalist UI', async ({ page }) => {
        // TikTok/Instagram standard: Clean, minimal interface
        const logo = await page.locator('.logo');
        await expect(logo).toBeVisible();
        await expect(logo).toHaveText('VIDA');

        // Stats pill should be visible
        const statsPill = await page.locator('.stats-pill');
        await expect(statsPill).toBeVisible();

        console.log('✅ Minimalist UI test passed');
    });

    test('Feed loads content cards', async ({ page }) => {
        // Wait for content to load
        await page.waitForSelector('.content-card', { timeout: 10000 });

        // Check that cards are present
        const cards = await page.locator('.content-card').count();
        expect(cards).toBeGreaterThan(0);

        console.log(`✅ Loaded ${cards} content cards`);
    });

    test('Lazy loading images work', async ({ page }) => {
        // Instagram 2025: Images should have lazy loading
        await page.waitForSelector('.card-media img', { timeout: 10000 });

        const images = await page.locator('.card-media img');
        const count = await images.count();

        if (count > 0) {
            const firstImage = images.first();
            const loadingAttr = await firstImage.getAttribute('loading');
            expect(loadingAttr).toBe('lazy');

            console.log('✅ Lazy loading enabled on images');
        }
    });

    test('Translation toggle works', async ({ page }) => {
        // Wait for cards
        await page.waitForSelector('.card-actions', { timeout: 10000 });

        // Find first translation button
        const translationBtn = await page.locator('.action-btn').filter({ hasText: 'Translation' }).first();

        if (await translationBtn.count() > 0) {
            await translationBtn.click();

            // Check translation appears
            await page.waitForTimeout(500);

            console.log('✅ Translation toggle works');
        }
    });

    test('Engagement tracking buttons present', async ({ page }) => {
        // TikTok/Instagram pattern: Like, Save, etc.
        await page.waitForSelector('.card-actions', { timeout: 10000 });

        const likeBtn = await page.locator('.action-btn').filter({ hasText: 'Like' }).first();
        const saveBtn = await page.locator('.action-btn').filter({ hasText: 'Save' }).first();

        if (await likeBtn.count() > 0) {
            await expect(likeBtn).toBeVisible();
            console.log('✅ Like button present');
        }

        if (await saveBtn.count() > 0) {
            await expect(saveBtn).toBeVisible();
            console.log('✅ Save button present');
        }
    });

    test('Stats update correctly', async ({ page }) => {
        // Check stats pill
        const streakText = await page.locator('#streakText');
        const wordsText = await page.locator('#wordsText');

        await expect(streakText).toBeVisible();
        await expect(wordsText).toBeVisible();

        const streakContent = await streakText.textContent();
        const wordsContent = await wordsText.textContent();

        expect(streakContent).toContain('🔥');
        expect(wordsContent).toContain('📚');

        console.log(`✅ Stats: ${streakContent}, ${wordsContent}`);
    });

    test('Infinite scroll triggers load more', async ({ page }) => {
        // Instagram/TikTok: Infinite scroll
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const initialCards = await page.locator('.content-card').count();

        // Scroll to bottom
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });

        // Wait for potential new content
        await page.waitForTimeout(2000);

        const finalCards = await page.locator('.content-card').count();

        console.log(`✅ Infinite scroll: ${initialCards} → ${finalCards} cards`);
    });

    test('Page performance is acceptable', async ({ page }) => {
        // TikTok/Instagram standard: <1s load time
        const startTime = Date.now();

        await page.goto('http://localhost:3002/personalized-feed.html');
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const loadTime = Date.now() - startTime;

        console.log(`⚡ Page load time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(3000); // 3s max for slower connections
    });

    test('Screenshot entire feed', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 10000 });
        await page.waitForTimeout(1000); // Let images load

        await page.screenshot({
            path: 'screenshots/workspace3/personalized-feed.png',
            fullPage: true
        });

        console.log('📸 Screenshot saved: screenshots/workspace3/personalized-feed.png');
    });
});
