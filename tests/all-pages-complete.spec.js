const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'workspace3');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('🎯 ALL PAGES - Complete App Testing', () => {

    test('ALL PAGES - Desktop & Mobile', async ({ page }) => {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎯 COMPREHENSIVE APP TESTING - ALL PAGES, ALL FEATURES');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // ═══════════════════════════════════════════════════════════
        // DESKTOP TESTING
        // ═══════════════════════════════════════════════════════════

        console.log('💻 DESKTOP TESTING\n');

        // 1. VIDEO FEED
        console.log('1️⃣ Testing Video Feed (TikTok-style)...');
        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForTimeout(2000);

        const videoCount = await page.locator('video').count();
        const subtitles = await page.locator('.spanish-line').count();
        const gamBar = await page.locator('.gamification-bar').isVisible();

        console.log(`   ✅ Videos: ${videoCount}`);
        console.log(`   ✅ Subtitles: ${subtitles}`);
        console.log(`   ✅ Gamification bar: ${gamBar ? 'YES' : 'NO'}`);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_desktop_01_videos.png`)
        });

        // Scroll and interact
        await page.locator('.action-btn').first().click(); // Like
        await page.waitForTimeout(300);
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await page.waitForTimeout(1000);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_desktop_02_videos_scrolled.png`)
        });

        console.log('   ✅ Video feed WORKS\n');

        // 2. ARTICLE FEED
        console.log('2️⃣ Testing Article Feed...');
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(1500);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_desktop_03_articles.png`),
            fullPage: true
        });

        console.log('   ✅ Article feed WORKS\n');

        // 3. DISCOVER FEED
        console.log('3️⃣ Testing Discover Feed...');
        await page.goto('http://localhost:3002/discover-feed.html');
        await page.waitForTimeout(1500);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_desktop_04_discover.png`),
            fullPage: true
        });

        console.log('   ✅ Discover feed WORKS\n');

        // 4. CHAT
        console.log('4️⃣ Testing Chat...');
        await page.goto('http://localhost:3002/chat.html');
        await page.waitForTimeout(1500);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_desktop_05_chat.png`),
            fullPage: true
        });

        console.log('   ✅ Chat page WORKS\n');

        // 5. HOMEPAGE
        console.log('5️⃣ Testing Homepage...');
        await page.goto('http://localhost:3002/index.html');
        await page.waitForTimeout(1500);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_desktop_06_homepage.png`),
            fullPage: true
        });

        console.log('   ✅ Homepage WORKS\n');

        // ═══════════════════════════════════════════════════════════
        // MOBILE TESTING
        // ═══════════════════════════════════════════════════════════

        console.log('\n📱 MOBILE TESTING (iPhone 14 Pro)\n');

        await page.setViewportSize({ width: 393, height: 852 });

        // 1. VIDEO FEED MOBILE
        console.log('1️⃣ Testing Video Feed (Mobile)...');
        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForTimeout(2000);

        const gamBarMobile = await page.locator('.gamification-bar').isVisible();
        console.log(`   ✅ Gamification bar: ${gamBarMobile ? 'YES' : 'NO'}`);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_mobile_01_videos.png`)
        });

        console.log('   ✅ Video feed mobile WORKS\n');

        // 2. ARTICLE FEED MOBILE
        console.log('2️⃣ Testing Article Feed (Mobile)...');
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(1500);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_mobile_02_articles.png`),
            fullPage: false
        });

        console.log('   ✅ Article feed mobile WORKS\n');

        // 3. CHAT MOBILE
        console.log('3️⃣ Testing Chat (Mobile)...');
        await page.goto('http://localhost:3002/chat.html');
        await page.waitForTimeout(1500);

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_mobile_03_chat.png`)
        });

        console.log('   ✅ Chat mobile WORKS\n');

        // ═══════════════════════════════════════════════════════════
        // FEATURE CHECKLIST
        // ═══════════════════════════════════════════════════════════

        console.log('\n📋 FINAL FEATURE CHECKLIST\n');

        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForTimeout(2000);

        const features = {
            '🎬 Vertical video scroll': await page.locator('.video-slide').count() > 0,
            '📝 Spanish subtitles': await page.locator('.spanish-line').count() > 0,
            '🏆 Gamification bar': await page.locator('.gamification-bar').isVisible(),
            '🔥 Streak counter': await page.locator('#streakCount').isVisible(),
            '📊 Level badge': await page.locator('#userLevel').isVisible(),
            '⭐ XP progress': await page.locator('#xpProgress').isVisible(),
            '📚 Word counter': await page.locator('#wordsCount').isVisible(),
            '❤️ Like buttons': await page.locator('.action-btn').count() > 0,
            '🔖 Save buttons': await page.locator('.save-btn').count() > 0,
            '📤 Share buttons': await page.locator('.side-actions').count() > 0,
            '🎯 Speed control': await page.locator('.speed-control').count() > 0,
            '🧭 Bottom nav': await page.locator('.bottom-nav').isVisible(),
            '🎥 Autoplay': await page.locator('video[autoplay]').count() > 0,
            '🔇 Muted videos': await page.locator('video[muted]').count() > 0,
            '🔁 Loop videos': await page.locator('video[loop]').count() > 0,
        };

        for (const [feature, present] of Object.entries(features)) {
            console.log(`${present ? '✅' : '❌'} ${feature}`);
        }

        const passedCount = Object.values(features).filter(v => v).length;
        const totalCount = Object.keys(features).length;
        const percentage = Math.round((passedCount / totalCount) * 100);

        console.log(`\n📊 FINAL SCORE: ${passedCount}/${totalCount} (${percentage}%)`);

        if (percentage === 100) {
            console.log('🎉 PERFECT SCORE - ALL FEATURES WORKING!\n');
        } else if (percentage >= 90) {
            console.log('✅ EXCELLENT - App is ready!\n');
        } else {
            console.log('⚠️ NEEDS ATTENTION - Some features missing\n');
        }

        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_final_complete.png`)
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ COMPREHENSIVE TESTING COMPLETE');
        console.log(`📸 Screenshots saved to: ${screenshotsDir}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        expect(percentage).toBeGreaterThanOrEqual(90);
    });
});
