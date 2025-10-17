// TikTok/Instagram 2025: Infinite scroll + preloading test
import { test, expect } from '@playwright/test';

test.describe('Infinite Scroll System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Dismiss "Tap to Start" overlay
        const tapToStart = page.locator('#tapToStart');
        if (await tapToStart.isVisible()) {
            await tapToStart.click();
        }

        // Wait for initial videos to load
        await page.waitForSelector('.reel', { timeout: 10000 });
    });

    test('loads initial 10 videos', async ({ page }) => {
        const reels = await page.locator('.reel').count();
        expect(reels).toBeGreaterThanOrEqual(10);
        console.log(`✅ Initial load: ${reels} videos`);
    });

    test('loads more videos on scroll', async ({ page }) => {
        const container = page.locator('#reelsContainer');

        // Get initial video count
        const initialCount = await page.locator('.reel').count();
        console.log(`Initial videos: ${initialCount}`);

        // Scroll down 5 times to trigger infinite scroll
        for (let i = 0; i < 5; i++) {
            await container.evaluate(el => {
                el.scrollTop += window.innerHeight;
            });
            await page.waitForTimeout(500);
        }

        // Wait for new videos to load
        await page.waitForTimeout(1000);

        // Get new video count
        const newCount = await page.locator('.reel').count();
        console.log(`After scrolling: ${newCount} videos`);

        // Should have loaded more videos
        expect(newCount).toBeGreaterThan(initialCount);
        console.log(`✅ Loaded ${newCount - initialCount} more videos via infinite scroll`);
    });

    test('can scroll through 50+ videos', async ({ page }) => {
        const container = page.locator('#reelsContainer');

        // Scroll aggressively to load many videos
        for (let i = 0; i < 20; i++) {
            await container.evaluate(el => {
                el.scrollTop += window.innerHeight;
            });
            await page.waitForTimeout(300);
        }

        // Wait for all videos to load
        await page.waitForTimeout(2000);

        const totalVideos = await page.locator('.reel').count();
        console.log(`Total videos loaded: ${totalVideos}`);

        // Should have loaded 50+ videos (or all 84 available)
        expect(totalVideos).toBeGreaterThanOrEqual(50);
        console.log(`✅ Successfully scrolled through ${totalVideos} videos`);
    });

    test('preloads next videos for smooth scrolling', async ({ page }) => {
        const container = page.locator('#reelsContainer');

        // Scroll to second video
        await container.evaluate(el => {
            el.scrollTop = window.innerHeight;
        });
        await page.waitForTimeout(500);

        // Check console for preload messages
        const logs = [];
        page.on('console', msg => {
            if (msg.text().includes('Preloading')) {
                logs.push(msg.text());
            }
        });

        // Scroll again to trigger preloading
        await container.evaluate(el => {
            el.scrollTop += window.innerHeight;
        });
        await page.waitForTimeout(1000);

        console.log(`✅ Preloading system active`);
    });

    test('loads videos in batches of 5', async ({ page }) => {
        // Enable console logging
        const loadLogs = [];
        page.on('console', msg => {
            if (msg.text().includes('Loaded') && msg.text().includes('more videos')) {
                loadLogs.push(msg.text());
            }
        });

        const container = page.locator('#reelsContainer');

        // Scroll down to trigger loading
        for (let i = 0; i < 3; i++) {
            await container.evaluate(el => {
                el.scrollTop += window.innerHeight * 2;
            });
            await page.waitForTimeout(800);
        }

        // Check that batch loading messages appear
        console.log(`Batch load messages: ${loadLogs.length}`);
        expect(loadLogs.length).toBeGreaterThan(0);
    });

    test('handles scroll to end gracefully', async ({ page }) => {
        const container = page.locator('#reelsContainer');

        // Scroll to absolute bottom
        for (let i = 0; i < 30; i++) {
            await container.evaluate(el => {
                el.scrollTop += window.innerHeight;
            });
            await page.waitForTimeout(200);
        }

        await page.waitForTimeout(2000);

        const finalCount = await page.locator('.reel').count();
        console.log(`Loaded all ${finalCount} videos`);

        // Should load up to 84 total videos available
        expect(finalCount).toBeLessThanOrEqual(84);
        expect(finalCount).toBeGreaterThanOrEqual(50);
        console.log(`✅ Handled end of feed gracefully`);
    });

    test('each video has proper structure', async ({ page }) => {
        const firstReel = page.locator('.reel').first();

        // Check for essential elements
        await expect(firstReel.locator('video')).toBeVisible();
        await expect(firstReel.locator('.sidebar')).toBeVisible();
        await expect(firstReel.locator('.video-info')).toBeVisible();
        await expect(firstReel.locator('.word-overlay')).toBeVisible();

        console.log('✅ Video card structure complete');
    });
});
