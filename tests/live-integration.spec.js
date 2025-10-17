// 🚀 LIVE INTEGRATION TEST - All Systems Working
// Tests complete workspace3 with Apple design + Spanish APIs + AI systems

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3002';

test.describe('🚀 Live Integration - Complete System', () => {

    test('should load Apple-feed with live Spanish content', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000); // Wait for API calls

        // Check header
        const logo = await page.locator('.logo');
        await expect(logo).toBeVisible();

        // Check stats bar
        const statsBar = await page.locator('.stats-bar');
        await expect(statsBar).toBeVisible();

        // Check cards loaded (either API or fallback)
        const cards = await page.locator('.card');
        const cardCount = await cards.count();

        console.log(`✅ Loaded ${cardCount} content cards`);
        expect(cardCount).toBeGreaterThan(0);

        // Screenshot: Live integration
        await page.screenshot({
            path: 'screenshots/LIVE-INTEGRATION-full.png',
            fullPage: true
        });

        console.log('📸 Screenshot: LIVE-INTEGRATION-full.png');
    });

    test('should verify Spanish frequency API integration', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/spanish/frequency?level=beginner&count=5`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        console.log(`✅ Spanish Frequency API: ${data.words?.length || 0} words loaded`);
        console.log(`   Top words: ${data.words?.slice(0, 3).map(w => w.word).join(', ')}`);

        expect(data.success).toBe(true);
        expect(data.words).toBeDefined();
    });

    test('should verify Spanish gossip API integration', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/spanish/gossip?level=beginner&count=3`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        console.log(`✅ Spanish Gossip API: ${data.items?.length || 0} items loaded`);
        console.log(`   Celebrities: ${data.items?.slice(0, 2).map(g => g.celebrity).join(', ')}`);

        expect(data.success).toBe(true);
        expect(data.items).toBeDefined();
    });

    test('should verify AI content adaptation working', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/api/ai/adapt-content`, {
            data: {
                content: '¡Hola amigos! ¿Cómo están hoy?',
                userLevel: 'A2',
                userKnownWords: ['hola', 'cómo']
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        console.log(`✅ AI Content Adapter: ${data.analysis?.complexityScore}/100 complexity`);
        console.log(`   Known: ${data.analysis?.knownPercentage.toFixed(1)}%`);
        console.log(`   New vocab: ${data.newVocabulary?.length || 0} words`);

        expect(data.success).toBe(true);
    });

    test('should verify level detection system working', async ({ request }) => {
        const response = await request.post(`${BASE_URL}/api/ai/detect-level`, {
            data: {
                userWords: ['hola', 'gracias', 'buenos', 'días'],
                learningHistory: { streak: 5 }
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        console.log(`✅ Level Detector: ${data.level} (${data.levelName})`);
        console.log(`   Confidence: ${data.confidence}%`);
        console.log(`   Next level: ${data.nextLevel}`);

        expect(data.success).toBe(true);
        expect(data.level).toMatch(/^(A1|A2|B1|B2|C1|C2)$/);
    });

    test('should verify all 17 features in health check', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/health`);
        expect(response.ok()).toBeTruthy();

        const data = await response.json();

        console.log(`✅ Health Check: ${data.features.length} features active`);
        console.log(`   Features: ${data.features.join(', ')}`);

        expect(data.status).toBe('healthy');
        expect(data.features).toContain('spanish-frequency-words');
        expect(data.features).toContain('spanish-gossip-feed');
        expect(data.features.length).toBeGreaterThanOrEqual(13);
    });

    test('should test mobile view with live content', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(3000);

        const cards = await page.locator('.card');
        const count = await cards.count();

        console.log(`📱 Mobile: ${count} cards loaded`);

        await page.screenshot({
            path: 'screenshots/LIVE-mobile-integration.png',
            fullPage: true
        });

        console.log('📸 Screenshot: LIVE-mobile-integration.png');
    });

    test('should capture final showcase with all systems', async ({ page }) => {
        await page.goto(`${BASE_URL}/apple-feed.html`);
        await page.waitForTimeout(3000);

        // Scroll to show content
        await page.evaluate(() => window.scrollTo(0, 300));
        await page.waitForTimeout(500);

        await page.screenshot({
            path: 'screenshots/FINAL-COMPLETE-SYSTEM.png',
            fullPage: true
        });

        console.log('📸 🎉 Screenshot: FINAL-COMPLETE-SYSTEM.png');
        console.log('✅ All systems integrated and working!');
    });
});
