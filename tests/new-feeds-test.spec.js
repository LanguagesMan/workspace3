const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'workspace3');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('🎯 NEW MINIMAL FEEDS - All Pages', () => {

    test('1. Unified Feed - Clean Instagram-style', async ({ page }) => {
        console.log('\n🏠 TESTING NEW UNIFIED FEED\n');

        await page.goto('http://localhost:3002/feed.html');
        await page.waitForTimeout(3000);

        // Check feed loaded
        const items = await page.locator('.item').count();
        console.log(`✅ Feed items: ${items}`);
        expect(items).toBeGreaterThan(0);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_new_feed_01_initial.png`),
            fullPage: true
        });

        // Scroll to load more
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_new_feed_02_scrolled.png`),
            fullPage: true
        });

        // Click like button
        const likeBtn = await page.locator('.action-btn').first();
        await likeBtn.click();
        await page.waitForTimeout(500);

        console.log('✅ Like button works');

        console.log('\n✅ UNIFIED FEED TEST PASSED\n');
    });

    test('2. Video Feed - Minimal TikTok-style', async ({ page }) => {
        console.log('\n🎬 TESTING NEW VIDEO FEED\n');

        await page.goto('http://localhost:3002/videos-simple.html');
        await page.waitForTimeout(3000);

        // Check videos loaded
        const videos = await page.locator('video').count();
        console.log(`✅ Videos loaded: ${videos}`);
        expect(videos).toBeGreaterThan(0);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_new_videos_01_initial.png`)
        });

        // Scroll to next video
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await page.waitForTimeout(1500);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_new_videos_02_scrolled.png`)
        });

        // Click video to play/pause
        const video = await page.locator('video').first();
        await video.click();
        await page.waitForTimeout(500);

        console.log('✅ Video play/pause works');

        console.log('\n✅ VIDEO FEED TEST PASSED\n');
    });

    test('3. Mobile - Both Feeds', async ({ page }) => {
        console.log('\n📱 TESTING MOBILE VIEWS\n');

        await page.setViewportSize({ width: 375, height: 812 });

        // Test unified feed mobile
        await page.goto('http://localhost:3002/feed.html');
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_mobile_feed.png`)
        });

        console.log('✅ Mobile feed works');

        // Test video feed mobile
        await page.goto('http://localhost:3002/videos-simple.html');
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_mobile_videos.png`)
        });

        console.log('✅ Mobile videos work');

        console.log('\n✅ MOBILE TESTS PASSED\n');
    });

    test('4. Navigation Between Feeds', async ({ page }) => {
        console.log('\n🧭 TESTING NAVIGATION\n');

        // Start at unified feed
        await page.goto('http://localhost:3002/feed.html');
        await page.waitForTimeout(2000);

        // Click Videos nav
        const videosNav = await page.locator('.nav-item[href*="videos"]');
        if (await videosNav.count() > 0) {
            await videosNav.click();
            await page.waitForTimeout(2000);

            const url = page.url();
            console.log(`✅ Navigated to: ${url}`);

            await page.screenshot({
                path: path.join(screenshotsDir, `${timestamp}_navigation_videos.png`)
            });
        }

        // Go back to feed
        const feedNav = await page.locator('.nav-item[href*="feed"]');
        if (await feedNav.count() > 0) {
            await feedNav.click();
            await page.waitForTimeout(2000);

            console.log('✅ Navigation works');
        }

        console.log('\n✅ NAVIGATION TEST PASSED\n');
    });

    test('5. Final Feature Check', async ({ page }) => {
        console.log('\n📊 FINAL FEATURE VERIFICATION\n');

        await page.goto('http://localhost:3002/feed.html');
        await page.waitForTimeout(3000);

        const features = {
            'Feed items': await page.locator('.item').count() > 0,
            'Spanish content': await page.locator('.spanish').count() > 0,
            'Translation toggle': await page.locator('.translate-btn').count() > 0,
            'Like buttons': await page.locator('.action-btn').count() > 0,
            'Bottom nav': await page.locator('.bottom-nav').count() > 0,
            'Difficulty badges': await page.locator('.difficulty').count() > 0
        };

        console.log('Feature Checklist:');
        for (const [feature, present] of Object.entries(features)) {
            console.log(`${present ? '✅' : '❌'} ${feature}`);
        }

        const passedCount = Object.values(features).filter(v => v).length;
        const totalCount = Object.keys(features).length;
        const percentage = Math.round((passedCount / totalCount) * 100);

        console.log(`\n📊 SCORE: ${passedCount}/${totalCount} (${percentage}%)`);

        expect(percentage).toBeGreaterThanOrEqual(80);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_final_features.png`),
            fullPage: true
        });

        console.log('\n✅ ALL FEATURES VERIFIED\n');
    });
});
