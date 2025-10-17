const { test, expect } = require('@playwright/test');

test.describe('Final Showcase - All Pages', () => {
    test('capture all page states for review', async ({ page }) => {
        console.log('📸 Capturing Final Screenshots for Review...\n');

        // 1. Video Feed - Initial State
        console.log('1️⃣ Video Feed - Initial State');
        await page.goto('http://localhost:3002/videos-simple.html');
        await page.waitForSelector('.video-slide', { timeout: 10000 });
        await page.screenshot({
            path: 'screenshots/workspace3/SHOWCASE_01_videos_initial.png',
            fullPage: false
        });
        console.log('   ✅ SHOWCASE_01_videos_initial.png\n');

        // 2. Video Feed - With Translations (EN button)
        console.log('2️⃣ Video Feed - Line-by-Line Translations');
        const enBtn = await page.$$('.control-btn');
        if (enBtn[2]) {
            await enBtn[2].click();
            await page.waitForTimeout(1500);
        }
        await page.screenshot({
            path: 'screenshots/workspace3/SHOWCASE_02_videos_translations.png',
            fullPage: false
        });
        console.log('   ✅ SHOWCASE_02_videos_translations.png\n');

        // 3. Video Feed - Speed Control
        console.log('3️⃣ Video Feed - Speed Control');
        if (enBtn[0]) {
            await enBtn[0].click();
        }
        await page.screenshot({
            path: 'screenshots/workspace3/SHOWCASE_03_videos_speed.png',
            fullPage: false
        });
        console.log('   ✅ SHOWCASE_03_videos_speed.png\n');

        // 4. Video Feed - Word Popup
        console.log('4️⃣ Video Feed - Clickable Word Translation');
        const words = await page.$$('.word');
        if (words[0]) {
            await words[0].click();
            await page.waitForTimeout(500);
        }
        await page.screenshot({
            path: 'screenshots/workspace3/SHOWCASE_04_videos_word_popup.png',
            fullPage: false
        });
        console.log('   ✅ SHOWCASE_04_videos_word_popup.png\n');

        // Close popup
        const overlay = await page.$('.word-popup-overlay');
        if (overlay) await overlay.click();

        // 5. Unified Feed - Desktop View
        console.log('5️⃣ Unified Feed - Desktop View');
        await page.goto('http://localhost:3002/feed.html');
        await page.waitForSelector('.item', { timeout: 10000 });
        await page.screenshot({
            path: 'screenshots/workspace3/SHOWCASE_05_feed_desktop.png',
            fullPage: false
        });
        console.log('   ✅ SHOWCASE_05_feed_desktop.png\n');

        // 6. Unified Feed - Scrolled
        console.log('6️⃣ Unified Feed - Scrolled Content');
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(500);
        await page.screenshot({
            path: 'screenshots/workspace3/SHOWCASE_06_feed_scrolled.png',
            fullPage: false
        });
        console.log('   ✅ SHOWCASE_06_feed_scrolled.png\n');

        // 7. Unified Feed - Full Page (shows multiple items)
        console.log('7️⃣ Unified Feed - Full Page View');
        await page.goto('http://localhost:3002/feed.html');
        await page.waitForSelector('.item', { timeout: 10000 });
        await page.screenshot({
            path: 'screenshots/workspace3/SHOWCASE_07_feed_full_page.png',
            fullPage: true
        });
        console.log('   ✅ SHOWCASE_07_feed_full_page.png\n');

        // 8. Mobile - Video Feed
        console.log('8️⃣ Mobile View - Video Feed');
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:3002/videos-simple.html');
        await page.waitForSelector('.video-slide', { timeout: 10000 });
        await page.screenshot({
            path: 'screenshots/workspace3/SHOWCASE_08_mobile_videos.png',
            fullPage: false
        });
        console.log('   ✅ SHOWCASE_08_mobile_videos.png\n');

        // 9. Mobile - Feed
        console.log('9️⃣ Mobile View - Feed');
        await page.goto('http://localhost:3002/feed.html');
        await page.waitForSelector('.item', { timeout: 10000 });
        await page.screenshot({
            path: 'screenshots/workspace3/SHOWCASE_09_mobile_feed.png',
            fullPage: false
        });
        console.log('   ✅ SHOWCASE_09_mobile_feed.png\n');

        // 10. Quality Check - Content Items
        console.log('🔟 Content Quality Analysis');
        const items = await page.$$('.item');
        console.log(`   📊 Feed items loaded: ${items.length}`);

        const badges = await page.$$('.difficulty');
        console.log(`   🎯 Difficulty badges: ${badges.length}`);

        let spanishCount = 0;
        for (let i = 0; i < Math.min(3, items.length); i++) {
            const text = await items[i].textContent();
            if (/[¿¡ñáéíóúü]/i.test(text)) spanishCount++;
        }
        console.log(`   🇪🇸 Spanish content detected: ${spanishCount}/${Math.min(3, items.length)}`);

        console.log('\n📸 All Screenshots Captured!');
        console.log('📂 Location: /screenshots/workspace3/SHOWCASE_*.png');
        console.log('\n✅ Ready for user review!\n');
    });
});
