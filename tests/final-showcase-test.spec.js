const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'workspace3');
const timestamp = 'FINAL';

test.describe('📸 FINAL SHOWCASE - All Pages & States', () => {

    test('Capture all pages and states', async ({ page }) => {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📸 CAPTURING FINAL SCREENSHOTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // 1. VIDEO FEED - Initial State
        console.log('1️⃣ Video Feed - Initial State');
        await page.goto('http://localhost:3002/videos-simple.html');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_01_video_feed_initial.png`)
        });

        // 2. VIDEO FEED - Speed Control
        console.log('2️⃣ Video Feed - Speed Control');
        await page.locator('.control-btn').first().click();
        await page.waitForTimeout(500);
        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_02_video_speed_control.png`)
        });

        // 3. VIDEO FEED - Word Translation Popup
        console.log('3️⃣ Video Feed - Word Translation');
        const word = await page.locator('.word').first();
        await word.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_03_video_word_translation.png`)
        });

        // Close popup
        await page.locator('.word-popup-overlay').click();
        await page.waitForTimeout(500);

        // 4. VIDEO FEED - Translation Toggle ON
        console.log('4️⃣ Video Feed - Translation ON');
        await page.locator('.control-btn').nth(2).click();
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_04_video_translation_on.png`)
        });

        // 5. VIDEO FEED - Subtitles OFF
        console.log('5️⃣ Video Feed - Subtitles OFF');
        await page.locator('.control-btn').nth(1).click();
        await page.waitForTimeout(500);
        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_05_video_subtitles_off.png`)
        });

        // 6. VIDEO FEED - Mobile View
        console.log('6️⃣ Video Feed - Mobile');
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3002/videos-simple.html');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_06_video_mobile.png`)
        });

        // 7. UNIFIED FEED - Desktop
        console.log('7️⃣ Unified Feed - Desktop');
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('http://localhost:3002/feed.html');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_07_feed_desktop.png`),
            fullPage: true
        });

        // 8. UNIFIED FEED - After Scroll
        console.log('8️⃣ Unified Feed - Scrolled');
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(1500);
        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_08_feed_scrolled.png`),
            fullPage: true
        });

        // 9. UNIFIED FEED - Translation Toggle
        console.log('9️⃣ Unified Feed - Translation');
        const transBtn = await page.locator('.translate-btn').first();
        if (await transBtn.count() > 0) {
            await transBtn.click();
            await page.waitForTimeout(1000);
            await page.screenshot({
                path: path.join(screenshotsDir, `${timestamp}_09_feed_translation.png`),
                fullPage: true
            });
        }

        // 10. UNIFIED FEED - Mobile
        console.log('🔟 Unified Feed - Mobile');
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3002/feed.html');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_10_feed_mobile.png`),
            fullPage: false
        });

        // 11. VIDEO FEED - Second Video (Scrolled)
        console.log('1️⃣1️⃣ Video Feed - Scrolled State');
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('http://localhost:3002/videos-simple.html');
        await page.waitForTimeout(2000);
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await page.waitForTimeout(1500);
        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_11_video_scrolled.png`)
        });

        // 12. ALL CONTROLS VISIBLE
        console.log('1️⃣2️⃣ All Controls Visible');
        await page.goto('http://localhost:3002/videos-simple.html');
        await page.waitForTimeout(2000);
        await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_12_all_controls.png`)
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ALL SCREENSHOTS CAPTURED');
        console.log(`📁 Location: ${screenshotsDir}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });
});
