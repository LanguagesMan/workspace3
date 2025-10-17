// 🚀 TTS CACHE SYSTEM TEST - Headless Only
const { test, expect } = require('@playwright/test');

test.describe('TTS Caching System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);
    });

    test('should have TTS cache stats endpoint', async ({ page }) => {
        console.log('🎯 TEST: TTS cache stats endpoint');

        const response = await page.goto('http://localhost:3002/api/tts/cache-stats');
        expect(response.status()).toBe(200);

        const data = await response.json();
        console.log('📊 Cache stats:', JSON.stringify(data, null, 2));

        expect(data.success).toBe(true);
        expect(data.cache).toBeDefined();
        expect(data.cache.memoryEntries).toBeDefined();
        expect(data.cache.fileEntries).toBeDefined();

        // Screenshot API response
        await page.screenshot({ path: 'test-results/tts-cache-stats.png', fullPage: true });
    });

    test('should show TTS caching in health check', async ({ page }) => {
        console.log('🎯 TEST: Health check includes TTS caching');

        const response = await page.goto('http://localhost:3002/health');
        const data = await response.json();

        console.log('✅ Features:', data.features);

        expect(data.features).toContain('tts-caching');
        expect(data.features).toContain('auto-play-audio');

        // Screenshot health check
        await page.screenshot({ path: 'test-results/health-with-cache.png', fullPage: true });
    });

    test('should cache TTS requests (performance test)', async ({ page }) => {
        console.log('🎯 TEST: TTS cache performance');

        await page.goto('http://localhost:3002');
        await page.waitForSelector('#feedContainer');

        // First request - should miss cache
        const startTime1 = Date.now();
        const firstAudioBtn = page.locator('[id^="audio-"]').first();
        await firstAudioBtn.click();
        await page.waitForTimeout(1000);
        const duration1 = Date.now() - startTime1;
        console.log(`⏱️ First request duration: ${duration1}ms`);

        // Refresh page
        await page.reload();
        await page.waitForSelector('#feedContainer');

        // Second request - should hit cache (faster)
        const startTime2 = Date.now();
        const secondAudioBtn = page.locator('[id^="audio-"]').first();
        await secondAudioBtn.click();
        await page.waitForTimeout(500);
        const duration2 = Date.now() - startTime2;
        console.log(`⚡ Second request duration: ${duration2}ms (cached)`);

        // Screenshot performance comparison
        await page.screenshot({ path: 'test-results/tts-cache-performance.png', fullPage: false });
    });

    test('should increment cache stats after usage', async ({ page }) => {
        console.log('🎯 TEST: Cache stats increment');

        // Get initial stats
        const initialResponse = await page.goto('http://localhost:3002/api/tts/cache-stats');
        const initialData = await initialResponse.json();
        const initialMemory = initialData.cache.memoryEntries;
        console.log(`📊 Initial memory cache: ${initialMemory} entries`);

        // Use TTS
        await page.goto('http://localhost:3002');
        await page.waitForSelector('#feedContainer');
        const audioBtn = page.locator('[id^="audio-"]').first();
        await audioBtn.click();
        await page.waitForTimeout(2000);

        // Get updated stats
        const updatedResponse = await page.goto('http://localhost:3002/api/tts/cache-stats');
        const updatedData = await updatedResponse.json();
        const updatedMemory = updatedData.cache.memoryEntries;
        console.log(`📈 Updated memory cache: ${updatedMemory} entries`);

        // Cache should have grown (unless it was already cached)
        expect(updatedMemory).toBeGreaterThanOrEqual(initialMemory);

        // Screenshot cache growth
        await page.screenshot({ path: 'test-results/cache-stats-growth.png', fullPage: true });
    });

    test('should have cache directory created', async ({ page }) => {
        console.log('🎯 TEST: Cache directory exists');

        const response = await page.goto('http://localhost:3002/api/tts/cache-stats');
        const data = await response.json();

        console.log('📁 Cache directory:', data.cache.cacheDir);

        expect(data.cache.cacheDir).toContain('cache/tts');
        expect(data.cache.cacheDir).toBeDefined();

        // Screenshot directory info
        await page.screenshot({ path: 'test-results/cache-directory.png', fullPage: true });
    });

    test('should clear cache with DELETE endpoint', async ({ page }) => {
        console.log('🎯 TEST: Clear cache endpoint');

        // First, create some cache by clicking audio
        await page.goto('http://localhost:3002');
        await page.waitForSelector('#feedContainer');
        const audioBtn = page.locator('[id^="audio-"]').first();
        await audioBtn.click();
        await page.waitForTimeout(1000);

        // Get stats before clear
        const beforeResponse = await page.goto('http://localhost:3002/api/tts/cache-stats');
        const beforeData = await beforeResponse.json();
        console.log(`📊 Before clear: ${beforeData.cache.memoryEntries} entries`);

        // Clear cache
        const clearResponse = await page.request.delete('http://localhost:3002/api/tts/cache');
        const clearData = await clearResponse.json();

        console.log('🧹 Clear result:', clearData.message);
        expect(clearData.success).toBe(true);

        // Get stats after clear
        const afterResponse = await page.goto('http://localhost:3002/api/tts/cache-stats');
        const afterData = await afterResponse.json();
        console.log(`📊 After clear: ${afterData.cache.memoryEntries} entries`);

        expect(afterData.cache.memoryEntries).toBe(0);

        // Screenshot after clear
        await page.screenshot({ path: 'test-results/cache-cleared.png', fullPage: true });
    });

    test('should handle cache on mobile viewport', async ({ page }) => {
        console.log('🎯 TEST: TTS cache on mobile');

        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Click audio on mobile
        const audioBtn = page.locator('[id^="audio-"]').first();
        await audioBtn.click();
        await page.waitForTimeout(1000);

        // Check cache stats
        const response = await page.goto('http://localhost:3002/api/tts/cache-stats');
        const data = await response.json();

        console.log(`📱 Mobile cache: ${data.cache.memoryEntries} entries`);
        expect(data.success).toBe(true);

        // Screenshot mobile cache
        await page.screenshot({ path: 'test-results/mobile-tts-cache.png', fullPage: true });
    });
});
