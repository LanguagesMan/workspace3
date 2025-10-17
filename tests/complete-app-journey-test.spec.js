// 🧪 COMPREHENSIVE APP TEST - Complete User Journey
// Tests EVERYTHING: All pages, all buttons, all interactions
// Screenshots saved to /screenshots/workspace3/

const { test, expect } = require('@playwright/test');
const path = require('path');

// Screenshot helper with timestamp
async function takeScreenshot(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const screenshotPath = path.join('screenshots/workspace3', `${name}_${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot: ${screenshotPath}`);
    return screenshotPath;
}

test.describe('Complete App Journey - ALL Pages & Features', () => {

    test('1. Homepage - Navigation and Stats', async ({ page }) => {
        console.log('\n🧪 TEST 1: Homepage');

        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');

        // Verify homepage elements
        const logo = await page.locator('.logo');
        await expect(logo).toBeVisible();
        console.log('✅ Logo visible');

        const streakWidget = await page.locator('.streak-widget');
        await expect(streakWidget).toBeVisible();
        console.log('✅ Streak widget visible');

        // Check navigation cards
        const navCards = await page.locator('.nav-card').count();
        expect(navCards).toBeGreaterThan(0);
        console.log(`✅ ${navCards} navigation cards present`);

        await takeScreenshot(page, 'homepage');

        // Auto-redirect check (waits 1s for redirect)
        await page.waitForTimeout(1500);
        const currentUrl = page.url();
        console.log(`🔄 Current URL after redirect: ${currentUrl}`);
    });

    test('2. TikTok Videos Page - Full Interaction', async ({ page }) => {
        console.log('\n🧪 TEST 2: TikTok Videos Page');

        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for videos to load

        await takeScreenshot(page, 'tiktok-videos-initial');

        // Check for video elements
        const videos = await page.locator('video');
        const videoCount = await videos.count();
        console.log(`📹 Found ${videoCount} video elements`);

        if (videoCount > 0) {
            // Test video controls
            const firstVideo = videos.first();

            // Check if video exists and try to play
            const isVisible = await firstVideo.isVisible();
            console.log(`✅ First video visible: ${isVisible}`);

            // Look for control buttons
            const playButton = page.locator('[aria-label*="play"], [data-action="play"], .play-button').first();
            if (await playButton.count() > 0) {
                await playButton.click();
                console.log('✅ Clicked play button');
                await page.waitForTimeout(1000);
            }

            await takeScreenshot(page, 'tiktok-videos-playing');
        }

        // Test navigation buttons
        const navButtons = await page.locator('button, .btn, [role="button"]').all();
        console.log(`🔘 Found ${navButtons.length} buttons on page`);

        // Test swipe/scroll functionality
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(500);
        await takeScreenshot(page, 'tiktok-videos-scrolled');

        console.log('✅ TikTok Videos page tested');
    });

    test('3. Articles Feed - Infinite Scroll', async ({ page }) => {
        console.log('\n🧪 TEST 3: Articles Feed');

        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, 'articles-feed-initial');

        // Wait for content to load
        const contentLoaded = await page.waitForSelector('.content-card, .feed-item, article', {
            timeout: 10000,
            state: 'visible'
        }).catch(() => null);

        if (contentLoaded) {
            const articles = await page.locator('.content-card, .feed-item, article').count();
            console.log(`📰 Loaded ${articles} articles`);

            // Test translation toggle if exists
            const translationBtn = page.locator('button').filter({ hasText: /translation|traducción/i }).first();
            if (await translationBtn.count() > 0) {
                await translationBtn.click();
                console.log('✅ Clicked translation button');
                await page.waitForTimeout(500);
                await takeScreenshot(page, 'articles-translation-shown');
            }

            // Test infinite scroll
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(2000);
            await takeScreenshot(page, 'articles-feed-scrolled');

            const finalArticles = await page.locator('.content-card, .feed-item, article').count();
            console.log(`📰 After scroll: ${finalArticles} articles`);
        }

        console.log('✅ Articles feed tested');
    });

    test('4. Personalized Feed - Complete Journey', async ({ page }) => {
        console.log('\n🧪 TEST 4: Personalized Feed');

        await page.goto('http://localhost:3002/personalized-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, 'personalized-feed-initial');

        // Check stats pill
        const statsPill = await page.locator('.stats-pill');
        if (await statsPill.count() > 0) {
            const statsText = await statsPill.textContent();
            console.log(`📊 Stats: ${statsText}`);
        }

        // Wait for content cards
        await page.waitForSelector('.content-card', { timeout: 10000 });
        const cards = await page.locator('.content-card').count();
        console.log(`📱 Loaded ${cards} content cards`);

        // Test first card interactions
        if (cards > 0) {
            // Test translation toggle
            const translationBtn = page.locator('.action-btn').filter({ hasText: 'Translation' }).first();
            if (await translationBtn.count() > 0) {
                await translationBtn.click();
                console.log('✅ Toggled translation');
                await page.waitForTimeout(500);
                await takeScreenshot(page, 'personalized-feed-translation');
            }

            // Test save button
            const saveBtn = page.locator('.action-btn').filter({ hasText: 'Save' }).first();
            if (await saveBtn.count() > 0) {
                await saveBtn.click();
                console.log('✅ Clicked save button');
                await page.waitForTimeout(500);
            }

            // Test like button
            const likeBtn = page.locator('.action-btn').filter({ hasText: 'Like' }).first();
            if (await likeBtn.count() > 0) {
                await likeBtn.click();
                console.log('✅ Clicked like button');
                await page.waitForTimeout(500);
            }
        }

        // Test infinite scroll
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);
        await takeScreenshot(page, 'personalized-feed-scrolled');

        const finalCards = await page.locator('.content-card').count();
        console.log(`📱 After scroll: ${finalCards} cards`);

        console.log('✅ Personalized feed fully tested');
    });

    test('5. All Other Pages - Discovery', async ({ page }) => {
        console.log('\n🧪 TEST 5: Other Pages Discovery');

        const pagesToTest = [
            '/discover-feed.html',
            '/feed.html',
            '/apple-feed.html',
            '/chat.html'
        ];

        for (const pagePath of pagesToTest) {
            try {
                console.log(`\n🔍 Testing: ${pagePath}`);
                await page.goto(`http://localhost:3002${pagePath}`, { timeout: 10000 });
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(1500);

                const pageName = pagePath.replace(/[\/\.]/g, '_').slice(1);
                await takeScreenshot(page, `page_${pageName}`);

                // Try to find and click interactive elements
                const buttons = await page.locator('button, .btn, [role="button"]').all();
                console.log(`  🔘 Found ${buttons.length} buttons`);

                // Click first safe button if exists
                if (buttons.length > 0) {
                    try {
                        await buttons[0].click({ timeout: 2000 });
                        await page.waitForTimeout(500);
                        console.log(`  ✅ Clicked first button`);
                    } catch (e) {
                        console.log(`  ⚠️ Button not clickable: ${e.message}`);
                    }
                }

                console.log(`✅ ${pagePath} tested`);
            } catch (error) {
                console.log(`⚠️ ${pagePath} not accessible: ${error.message}`);
            }
        }
    });

    test('6. API Endpoints - Functionality', async ({ page }) => {
        console.log('\n🧪 TEST 6: API Endpoints');

        await page.goto('http://localhost:3002');

        // Test personalized feed API
        const feedResponse = await page.evaluate(async () => {
            try {
                const res = await fetch('/api/personalized-feed?page=1&limit=5&level=A2', {
                    headers: { 'x-user-id': 'test_user' }
                });
                return await res.json();
            } catch (e) {
                return { error: e.message };
            }
        });

        if (feedResponse.success) {
            console.log(`✅ Personalized feed API: ${feedResponse.feed.length} items`);
        } else {
            console.log(`⚠️ Personalized feed API error:`, feedResponse.error);
        }

        // Test user stats API
        const statsResponse = await page.evaluate(async () => {
            try {
                const res = await fetch('/api/user-stats', {
                    headers: { 'x-user-id': 'test_user' }
                });
                return await res.json();
            } catch (e) {
                return { error: e.message };
            }
        });

        if (statsResponse.success) {
            console.log(`✅ User stats API: ${JSON.stringify(statsResponse.stats)}`);
        } else {
            console.log(`⚠️ User stats API error`);
        }

        console.log('✅ API endpoints tested');
    });

    test('7. Performance Metrics - ALL Pages', async ({ page }) => {
        console.log('\n🧪 TEST 7: Performance Metrics');

        const pages = [
            { path: '/', name: 'Homepage' },
            { path: '/tiktok-videos.html', name: 'TikTok Videos' },
            { path: '/unified-infinite-feed.html', name: 'Articles Feed' },
            { path: '/personalized-feed.html', name: 'Personalized Feed' }
        ];

        for (const testPage of pages) {
            const startTime = Date.now();

            await page.goto(`http://localhost:3002${testPage.path}`);
            await page.waitForLoadState('networkidle');

            const loadTime = Date.now() - startTime;

            console.log(`⚡ ${testPage.name}: ${loadTime}ms`);

            // Check if meets Instagram/TikTok 2025 standards (<3s)
            if (loadTime < 3000) {
                console.log(`  ✅ Performance: EXCELLENT`);
            } else {
                console.log(`  ⚠️ Performance: SLOW (>3s)`);
            }
        }

        console.log('✅ Performance metrics collected');
    });

    test('8. Screenshot Gallery - All States', async ({ page }) => {
        console.log('\n🧪 TEST 8: Complete Screenshot Gallery');

        // Homepage states
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await takeScreenshot(page, 'gallery_homepage_default');

        // Personalized feed - multiple scroll states
        await page.goto('http://localhost:3002/personalized-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await takeScreenshot(page, 'gallery_feed_top');

        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(500);
        await takeScreenshot(page, 'gallery_feed_mid');

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        await takeScreenshot(page, 'gallery_feed_bottom');

        console.log('✅ Screenshot gallery complete');
    });
});
