/**
 * 🧪 PLAYWRIGHT TESTS - Translation API
 * 
 * Tests real translation functionality in the UI
 */

const { test, expect } = require('@playwright/test');

test.describe('Translation API', () => {
    test.beforeEach(async ({ page }) => {
        // Start server if not running
        await page.goto('http://localhost:3002');
    });

    test('should translate word via API endpoint', async ({ page }) => {
        // Test the API endpoint directly
        const response = await page.request.get('/api/translate/word?word=hola&sourceLang=es&targetLang=en');
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.word).toBe('hola');
        expect(data.translation).toBeTruthy();
        expect(data.translation.toLowerCase()).toContain('hello');
    });

    test('should return cached translation faster on second request', async ({ page }) => {
        // First request
        const start1 = Date.now();
        const response1 = await page.request.get('/api/translate/word?word=casa&sourceLang=es&targetLang=en');
        const duration1 = Date.now() - start1;
        
        expect(response1.ok()).toBeTruthy();
        const data1 = await response1.json();
        expect(data1.success).toBe(true);

        // Second request (should be cached)
        const start2 = Date.now();
        const response2 = await page.request.get('/api/translate/word?word=casa&sourceLang=es&targetLang=en');
        const duration2 = Date.now() - start2;
        
        expect(response2.ok()).toBeTruthy();
        const data2 = await response2.json();
        expect(data2.success).toBe(true);
        
        // Cache should be faster (or at least not significantly slower)
        expect(duration2).toBeLessThanOrEqual(duration1 * 2);
    });

    test('should handle batch translation', async ({ page }) => {
        const response = await page.request.post('/api/translate/batch', {
            data: {
                texts: ['hola', 'adiós', 'gracias'],
                sourceLang: 'es',
                targetLang: 'en'
            }
        });
        
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        
        expect(data.success).toBe(true);
        expect(data.translations).toHaveLength(3);
        expect(data.count).toBe(3);
    });

    test('should get translation stats', async ({ page }) => {
        const response = await page.request.get('/api/translate/stats');
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.stats).toBeDefined();
        expect(data.stats).toHaveProperty('memoryCacheSize');
        expect(data.stats).toHaveProperty('queueLength');
    });

    test('should translate text (not just words)', async ({ page }) => {
        const response = await page.request.post('/api/translate/text', {
            data: {
                text: 'Buenos días',
                sourceLang: 'es',
                targetLang: 'en'
            }
        });
        
        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        
        expect(data.success).toBe(true);
        expect(data.original).toBe('Buenos días');
        expect(data.translation).toBeTruthy();
    });

    test('should handle empty string gracefully', async ({ page }) => {
        const response = await page.request.get('/api/translate/word?word=&sourceLang=es&targetLang=en');
        
        // Should either return empty or error gracefully
        if (response.ok()) {
            const data = await response.json();
            expect(data.translation).toBe('');
        } else {
            expect(response.status()).toBe(400);
        }
    });

    test('should handle missing word parameter', async ({ page }) => {
        const response = await page.request.get('/api/translate/word?sourceLang=es&targetLang=en');
        
        expect(response.status()).toBe(400);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toContain('word');
    });

    test('should use common words dictionary for instant translation', async ({ page }) => {
        // Test common words that should be instant
        const commonWords = ['el', 'la', 'es', 'muy'];
        
        for (const word of commonWords) {
            const start = Date.now();
            const response = await page.request.get(`/api/translate/word?word=${word}&sourceLang=es&targetLang=en`);
            const duration = Date.now() - start;
            
            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.translation).toBeTruthy();
            
            // Common words should be very fast (<100ms including network)
            expect(duration).toBeLessThan(100);
        }
    });
});

test.describe('Translation in Articles Feed', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002/discover-articles.html');
        // Wait for page to load
        await page.waitForLoadState('networkidle');
    });

    test('should display article feed with translation capability', async ({ page }) => {
        // Check if articles are loaded
        const articles = await page.locator('.article-card').count();
        expect(articles).toBeGreaterThan(0);
    });

    test('should show translation tooltip on word click', async ({ page }) => {
        // Wait for articles to load
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Click on first article to open reader
        await page.locator('.article-card').first().click();
        
        // Wait for reader modal
        await page.waitForSelector('.reader-modal', { timeout: 5000 });
        
        // Find a clickable word in the content
        const word = await page.locator('.reader-content p').first().locator('span').first();
        
        if (await word.count() > 0) {
            await word.click();
            
            // Check if tooltip appears
            const tooltip = page.locator('#wordTooltip');
            await expect(tooltip).toBeVisible({ timeout: 5000 });
        }
    });
});

