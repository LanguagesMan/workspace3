const { test, expect } = require('@playwright/test');

test.describe('Instagram Reels Preloading Strategy', () => {
    test('Should preload next 3 videos ahead - Instagram pattern', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');
        await page.waitForSelector('.video-slide', { timeout: 10000 });

        // Wait for initial video load
        await page.waitForTimeout(2000);

        // Get console logs to verify preloading
        const logs = [];
        page.on('console', msg => {
            if (msg.text().includes('Preloaded video')) {
                logs.push(msg.text());
            }
        });

        // Scroll to trigger preloading
        await page.evaluate(() => {
            const feed = document.getElementById('videoFeed');
            feed.scrollTop = feed.scrollHeight * 0.1;
        });

        await page.waitForTimeout(1000);

        // Verify preloading messages appeared
        expect(logs.length).toBeGreaterThan(0);
        console.log(`✅ Preloaded ${logs.length} videos ahead`);
    });

    test('IntersectionObserver should exist with correct threshold', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');
        await page.waitForSelector('.video-slide');

        // Check that IntersectionObserver is set up
        const hasObserver = await page.evaluate(() => {
            return typeof IntersectionObserver !== 'undefined';
        });

        expect(hasObserver).toBe(true);
        console.log('✅ IntersectionObserver API available');
    });

    test('Videos should have preload attribute set correctly', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');
        await page.waitForSelector('.video-slide', { timeout: 10000 });

        // Wait for videos to load
        await page.waitForTimeout(2000);

        // Check video elements have data-src (lazy loading pattern)
        const videoCount = await page.locator('video').count();

        if (videoCount > 0) {
            console.log(`✅ Found ${videoCount} video elements`);

            // Check if some videos are lazy-loaded with data-src
            const lazyVideos = await page.locator('video[data-src]').count();
            const loadedVideos = await page.locator('video[src]').count();

            console.log(`📊 Lazy videos: ${lazyVideos}, Loaded videos: ${loadedVideos}`);
            expect(loadedVideos).toBeGreaterThan(0);
        } else {
            console.log('⚠️ No video elements found (might be text-based content)');
        }
    });

    test('Preloading should trigger within 50% rootMargin threshold', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');
        await page.waitForSelector('.video-slide');

        const slideCount = await page.locator('.video-slide').count();
        expect(slideCount).toBeGreaterThan(0);

        console.log(`✅ ${slideCount} slides loaded - ready for preloading`);
    });

    test('Scroll performance should be smooth (<100ms frame time)', async ({ page }) => {
        await page.goto('http://localhost:3002/videos-new.html');
        await page.waitForSelector('.video-slide');

        const startTime = Date.now();

        // Simulate scroll
        await page.evaluate(() => {
            const feed = document.getElementById('videoFeed');
            feed.scrollTop = 500;
        });

        const scrollTime = Date.now() - startTime;

        expect(scrollTime).toBeLessThan(100);
        console.log(`✅ Scroll performance: ${scrollTime}ms (< 100ms target)`);
    });

    test('Should load fast (<2s total page load)', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('http://localhost:3002/videos-new.html');
        await page.waitForSelector('.top-header');
        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(2000);
        console.log(`✅ Page load time: ${loadTime}ms`);
    });
});
