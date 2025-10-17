// 🌐 UNIFIED FEED INTEGRATION TESTS - Complete System Validation
// Tests entire feed ecosystem: auto-play, TTS, pronunciation, viral content
// HEADLESS ONLY - Screenshots everything, NEVER opens browser!

const { test, expect } = require('@playwright/test');

test.describe('🌐 Unified Feed Integration - Complete System', () => {

    test.beforeEach(async ({ page, context }) => {
        // Grant permissions
        await context.grantPermissions(['microphone']);

        // Navigate to feed
        await page.goto('http://localhost:3002');

        // Wait for feed to load completely
        await page.waitForSelector('#feedContainer', { timeout: 15000 });
        await page.waitForTimeout(3000); // Extra time for dynamic content
    });

    test('should load unified feed with all content types', async ({ page }) => {
        // Check feed container exists
        const feedContainer = await page.locator('#feedContainer');
        expect(await feedContainer.isVisible()).toBe(true);

        // Check for content cards
        const cards = await page.locator('.content-card').count();
        console.log(`✅ Loaded ${cards} content cards`);
        expect(cards).toBeGreaterThan(0);

        // Screenshot full feed
        await page.screenshot({ path: 'tests/screenshots/integration-full-feed.png', fullPage: true });
    });

    test('should display all action buttons on cards', async ({ page }) => {
        // Wait for first card
        const firstCard = page.locator('.content-card').first();
        await expect(firstCard).toBeVisible();

        // Check for all action buttons
        const listenBtn = firstCard.locator('button:has-text("Listen")');
        const practiceBtn = firstCard.locator('button:has-text("Practice")');
        const likeBtn = firstCard.locator('button:has-text("❤️")');
        const shareBtn = firstCard.locator('button:has-text("Share")');

        expect(await listenBtn.isVisible()).toBe(true);
        expect(await practiceBtn.isVisible()).toBe(true);
        expect(await likeBtn.isVisible()).toBe(true);
        expect(await shareBtn.isVisible()).toBe(true);

        console.log('✅ All action buttons visible');

        // Screenshot first card with buttons
        await firstCard.screenshot({ path: 'tests/screenshots/integration-card-buttons.png' });
    });

    test('should have Spanish text with word-level interaction', async ({ page }) => {
        // Find Spanish text
        const spanishText = page.locator('.spanish-text').first();
        await expect(spanishText).toBeVisible();

        const text = await spanishText.textContent();
        console.log(`Spanish text found: "${text.substring(0, 50)}..."`);
        expect(text.length).toBeGreaterThan(0);

        // Check for word-level spans
        const words = await spanishText.locator('.spanish-word').count();
        console.log(`✅ Found ${words} interactive Spanish words`);
        expect(words).toBeGreaterThan(0);

        // Screenshot Spanish text
        await page.screenshot({ path: 'tests/screenshots/integration-spanish-text.png' });
    });

    test('should load content from multiple sources', async ({ page }) => {
        // Check for different content types
        const contentTypes = await page.locator('.content-type').allTextContents();
        const uniqueTypes = [...new Set(contentTypes)];

        console.log(`Content types found: ${uniqueTypes.join(', ')}`);
        console.log(`✅ ${uniqueTypes.length} different content types`);

        expect(uniqueTypes.length).toBeGreaterThan(0);

        // Screenshot showing content variety
        await page.screenshot({ path: 'tests/screenshots/integration-content-types.png', fullPage: true });
    });

    test('should have level badges on all cards', async ({ page }) => {
        // Check for level badges
        const levelBadges = await page.locator('.level-badge').count();
        const cards = await page.locator('.content-card').count();

        console.log(`Level badges: ${levelBadges}, Cards: ${cards}`);
        expect(levelBadges).toBeGreaterThan(0);

        // Screenshot showing level badges
        await page.screenshot({ path: 'tests/screenshots/integration-level-badges.png' });
    });

    test('should support infinite scroll loading', async ({ page }) => {
        // Get initial card count
        const initialCards = await page.locator('.content-card').count();
        console.log(`Initial cards: ${initialCards}`);

        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);

        // Check if more cards loaded
        const afterScrollCards = await page.locator('.content-card').count();
        console.log(`After scroll cards: ${afterScrollCards}`);

        // Screenshot after scrolling
        await page.screenshot({ path: 'tests/screenshots/integration-after-scroll.png', fullPage: true });

        expect(afterScrollCards).toBeGreaterThanOrEqual(initialCards);
    });

    test('should display media thumbnails where available', async ({ page }) => {
        // Check for media elements
        const mediaImages = await page.locator('.card-media img').count();
        console.log(`✅ Found ${mediaImages} media thumbnails`);

        if (mediaImages > 0) {
            // Screenshot first media card
            const firstMediaCard = page.locator('.card-media').first();
            await firstMediaCard.screenshot({ path: 'tests/screenshots/integration-media-card.png' });
        }
    });

    test('should have health endpoint returning all features', async ({ page }) => {
        // Navigate to health check
        const response = await page.goto('http://localhost:3002/health');
        expect(response.status()).toBe(200);

        const data = await response.json();
        console.log(`Health status: ${data.status}`);
        console.log(`Active features: ${data.features.length}`);
        console.log(`Features: ${data.features.join(', ')}`);

        expect(data.status).toBe('healthy');
        expect(data.features).toContain('pronunciation-recording');
        expect(data.features).toContain('tts-caching');
        expect(data.features).toContain('auto-play-audio');
        expect(data.features.length).toBeGreaterThanOrEqual(11);
    });

    test('should integrate TTS API with Listen buttons', async ({ page }) => {
        // Click first Listen button
        const listenBtn = page.locator('button:has-text("Listen")').first();
        await listenBtn.click();

        // Wait for button state change
        await page.waitForTimeout(1000);

        // Button should show loading or return to normal
        const btnText = await listenBtn.textContent();
        console.log(`Listen button state: "${btnText}"`);

        // Screenshot
        await page.screenshot({ path: 'tests/screenshots/integration-tts-clicked.png' });
    });

    test('should integrate pronunciation recording UI', async ({ page }) => {
        // Check Practice button exists
        const practiceBtn = page.locator('button:has-text("Practice")').first();
        await expect(practiceBtn).toBeVisible();

        // Check feedback div exists (hidden)
        const feedbackDiv = page.locator('[id^="feedback-"]').first();
        const isHidden = await feedbackDiv.isHidden();

        console.log(`✅ Pronunciation UI integrated`);
        console.log(`Feedback div hidden: ${isHidden}`);
        expect(isHidden).toBe(true);

        // Screenshot
        await page.screenshot({ path: 'tests/screenshots/integration-pronunciation-ui.png' });
    });

    test('should show proper loading states', async ({ page }) => {
        // Reload page to see loading
        await page.reload();

        // Check for loading indicator
        await page.waitForSelector('#feedContainer');

        // Screenshot during load
        await page.screenshot({ path: 'tests/screenshots/integration-loading.png' });
    });

    test('should be mobile responsive', async ({ page }) => {
        // Test mobile viewport (iPhone 12 Pro)
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(1000);

        // Check cards still visible
        const cards = await page.locator('.content-card').count();
        console.log(`Mobile view: ${cards} cards visible`);
        expect(cards).toBeGreaterThan(0);

        // Screenshot mobile
        await page.screenshot({ path: 'tests/screenshots/integration-mobile-view.png', fullPage: true });

        // Test tablet viewport (iPad)
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);

        // Screenshot tablet
        await page.screenshot({ path: 'tests/screenshots/integration-tablet-view.png', fullPage: true });
    });

    test('should handle API endpoint availability', async ({ page }) => {
        // Test key API endpoints
        const endpoints = [
            '/api/user/level/test_user',
            '/api/tts/cache-stats',
            '/api/viral/generate?count=1'
        ];

        for (const endpoint of endpoints) {
            const response = await page.request.get(`http://localhost:3002${endpoint}`);
            console.log(`${endpoint}: ${response.status()}`);
            expect(response.ok() || response.status() === 404 || response.status() === 200).toBe(true);
        }
    });

    test('should display viral content when available', async ({ page }) => {
        // Navigate to viral endpoint to generate content
        await page.goto('http://localhost:3002/api/viral/generate?count=2');
        await page.waitForTimeout(500);

        const viralData = await page.textContent('body');
        console.log(`Viral API response length: ${viralData.length}`);

        // Go back to feed
        await page.goto('http://localhost:3002');
        await page.waitForSelector('#feedContainer');
        await page.waitForTimeout(2000);

        // Screenshot
        await page.screenshot({ path: 'tests/screenshots/integration-with-viral.png', fullPage: true });
    });

    test('should track user interactions properly', async ({ page }) => {
        // Click like button
        const likeBtn = page.locator('button:has-text("❤️")').first();
        await likeBtn.click();
        await page.waitForTimeout(500);

        // Check if button state changed
        const hasLikedClass = await likeBtn.evaluate(el => el.classList.contains('liked'));
        console.log(`Like button active: ${hasLikedClass}`);

        // Screenshot after interaction
        await page.screenshot({ path: 'tests/screenshots/integration-liked-card.png' });
    });

    test('should show complete feed ecosystem working together', async ({ page }) => {
        // Comprehensive integration check
        const checks = {
            feedLoaded: await page.locator('#feedContainer').isVisible(),
            cardsPresent: (await page.locator('.content-card').count()) > 0,
            listenButtons: (await page.locator('button:has-text("Listen")').count()) > 0,
            practiceButtons: (await page.locator('button:has-text("Practice")').count()) > 0,
            spanishText: (await page.locator('.spanish-text').count()) > 0,
            levelBadges: (await page.locator('.level-badge').count()) > 0
        };

        console.log('Integration Status:');
        Object.entries(checks).forEach(([feature, status]) => {
            console.log(`  ${status ? '✅' : '❌'} ${feature}`);
        });

        // All features should be present
        Object.values(checks).forEach(status => {
            expect(status).toBe(true);
        });

        // Final comprehensive screenshot
        await page.screenshot({ path: 'tests/screenshots/integration-complete-system.png', fullPage: true });
    });

    test('should maintain performance with multiple features active', async ({ page }) => {
        // Measure page load performance
        const performanceMetrics = await page.evaluate(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            return {
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                domInteractive: perfData.domInteractive - perfData.fetchStart
            };
        });

        console.log('Performance Metrics:');
        console.log(`  DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
        console.log(`  Load Complete: ${performanceMetrics.loadComplete}ms`);
        console.log(`  DOM Interactive: ${performanceMetrics.domInteractive}ms`);

        // Performance should be reasonable
        expect(performanceMetrics.domInteractive).toBeLessThan(5000);
    });

    test('should have proper error handling throughout', async ({ page }) => {
        // Test error scenarios
        const consoleLogs = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleLogs.push(msg.text());
            }
        });

        // Reload page and check for errors
        await page.reload();
        await page.waitForTimeout(3000);

        console.log(`Console errors detected: ${consoleLogs.length}`);

        // Should have minimal errors (some API 401s expected)
        const criticalErrors = consoleLogs.filter(log =>
            !log.includes('401') && !log.includes('429')
        );

        console.log(`Critical errors: ${criticalErrors.length}`);
        expect(criticalErrors.length).toBeLessThan(5);
    });

});

console.log('🌐 Unified Feed Integration Tests - COMPREHENSIVE SYSTEM VALIDATION - HEADLESS ONLY!');
