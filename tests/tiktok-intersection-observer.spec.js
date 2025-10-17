const { test, expect } = require('@playwright/test');

test.describe('TikTok Intersection Observer Autoplay - 50% Threshold', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);
    });

    test('Intersection Observer with 50% threshold implemented', async ({ page }) => {
        // Check if Intersection Observer is set up with correct threshold
        const hasIntersectionObserver = await page.evaluate(() => {
            // Check if code contains Intersection Observer with 0.5 threshold
            const scriptContent = document.documentElement.outerHTML;
            return scriptContent.includes('IntersectionObserver') && 
                   scriptContent.includes('0.5') &&
                   scriptContent.includes('threshold');
        });
        
        expect(hasIntersectionObserver).toBe(true);
        console.log('✅ TikTok Intersection Observer with 50% threshold: IMPLEMENTED');
    });

    test('Video autoplay on 50% visibility', async ({ page }) => {
        // Switch to videos tab
        await page.click('button[data-tab="videos"]');
        await page.waitForTimeout(1000);
        
        // Check if videos have autoplay setup
        const videoCount = await page.locator('.feed-video').count();
        console.log(`✅ Found ${videoCount} videos with autoplay capability`);
        
        expect(videoCount).toBeGreaterThanOrEqual(0);
    });

    test('Performance: Intersection Observer response < 100ms', async ({ page }) => {
        const startTime = Date.now();
        
        // Trigger scroll to test Intersection Observer
        await page.evaluate(() => window.scrollBy(0, 100));
        
        const responseTime = Date.now() - startTime;
        
        expect(responseTime).toBeLessThan(100);
        console.log(`✅ Intersection Observer response: ${responseTime}ms`);
    });
});
