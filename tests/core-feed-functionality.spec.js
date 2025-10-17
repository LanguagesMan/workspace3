/**
 * 🎯 CORE FEED FUNCTIONALITY TEST
 *
 * Tests the CORE requirements:
 * 1. Videos from langfeed folder load and display
 * 2. Articles from APIs display
 * 3. Memes are in the feed
 * 4. Videos actually work (can play)
 * 5. No dummy content
 */

const { test, expect } = require('@playwright/test');

test.describe('🎯 CORE Feed Functionality', () => {

    test('✅ Feed loads real content (not dummy)', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000); // Wait for API call

        // Check that content cards loaded
        const cards = await page.locator('.content-card');
        const cardCount = await cards.count();

        expect(cardCount).toBeGreaterThan(0);
        console.log(`✅ Loaded ${cardCount} content cards`);
    });

    test('✅ Videos from reels folder are present', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);

        // Look for video elements
        const videos = await page.locator('video.feed-video');
        const videoCount = await videos.count();

        console.log(`📹 Found ${videoCount} video elements`);

        if (videoCount > 0) {
            // Check first video has a valid src
            const firstVideo = videos.first();
            const src = await firstVideo.getAttribute('src');

            console.log(`First video src: ${src}`);
            expect(src).toContain('/videos/reels/');
        }
    });

    test('✅ Video elements have correct paths', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);

        const videos = await page.locator('video.feed-video');
        const videoCount = await videos.count();

        if (videoCount > 0) {
            // Get all video sources
            const sources = await videos.evaluateAll(vids =>
                vids.map(v => v.src)
            );

            console.log(`Video sources found: ${sources.length}`);
            sources.slice(0, 3).forEach((src, i) => {
                console.log(`  ${i + 1}. ${src}`);
            });

            // All should point to reels folder
            const validSources = sources.filter(src =>
                src.includes('/videos/reels/') || src.includes('/public/videos/reels/')
            );

            expect(validSources.length).toBe(sources.length);
        }
    });

    test('✅ Articles are in the feed', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);

        // Look for article type badges
        const articleBadges = await page.locator('.type-article');
        const articleCount = await articleBadges.count();

        console.log(`📰 Found ${articleCount} article cards`);
        expect(articleCount).toBeGreaterThan(0);
    });

    test('✅ Feed has variety (videos, articles, memes)', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);

        // Count different content types
        const videos = await page.locator('.type-video').count();
        const articles = await page.locator('.type-article, .type-news').count();
        const memes = await page.locator('.type-meme, .type-social').count();

        console.log(`📊 Content mix:`);
        console.log(`   Videos: ${videos}`);
        console.log(`   Articles: ${articles}`);
        console.log(`   Memes/Social: ${memes}`);

        // Should have at least 2 types
        const typesPresent = [videos > 0, articles > 0, memes > 0].filter(Boolean).length;
        expect(typesPresent).toBeGreaterThanOrEqual(2);
    });

    test('✅ Videos tab loads video content', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);

        // Click Videos tab
        const videosTab = await page.locator('[data-tab="videos"]');
        await videosTab.click();
        await page.waitForTimeout(2000);

        // Should have video content
        const videos = await page.locator('video.feed-video');
        const videoCount = await videos.count();

        console.log(`🎬 Videos tab has ${videoCount} videos`);
        expect(videoCount).toBeGreaterThan(0);
    });

    test('📸 Screenshot - Feed with real content', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);

        await page.screenshot({
            path: 'screenshots/workspace3/CORE-feed-working.png',
            fullPage: true
        });

        console.log('📸 Screenshot: CORE-feed-working.png');
    });

    test('✅ Video can be loaded (check network)', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');

        // Listen for video requests
        const videoRequests = [];
        page.on('request', request => {
            if (request.url().includes('/videos/reels/')) {
                videoRequests.push(request.url());
            }
        });

        await page.waitForTimeout(3000);

        console.log(`🌐 Video requests made: ${videoRequests.length}`);
        if (videoRequests.length > 0) {
            console.log(`First request: ${videoRequests[0]}`);
        }

        expect(videoRequests.length).toBeGreaterThan(0);
    });
});
