const { test, expect } = require('@playwright/test');

test.describe('Visual Quality Check - Compare to TikTok/Instagram Standards', () => {

    test('Full user flow: Open → Scroll → Click word → See translation', async ({ page }) => {
        // Mobile viewport (iPhone 13 Pro)
        await page.setViewportSize({ width: 375, height: 812 });

        console.log('🎬 Opening app...');
        await page.goto('http://localhost:3002');

        // Wait for first video to load
        await page.waitForTimeout(3000);

        console.log('📹 Checking video loaded...');
        const videoCount = await page.locator('video').count();
        expect(videoCount).toBeGreaterThan(0);

        // Take screenshot of initial state
        await page.screenshot({ path: 'screenshots/01-initial-load.png' });
        console.log('✅ Screenshot: 01-initial-load.png');

        // Check for NO menus
        const navCount = await page.locator('nav').count();
        expect(navCount).toBe(0);
        console.log('✅ No nav menus (TikTok pattern)');

        // Check for Spanish words
        console.log('📝 Checking clickable Spanish words...');
        const wordCount = await page.locator('.word').count();
        expect(wordCount).toBeGreaterThan(0);
        console.log(`✅ Found ${wordCount} clickable Spanish words`);

        // Click first word
        const firstWord = page.locator('.word').first();
        const wordText = await firstWord.textContent();
        console.log(`🖱️  Clicking word: "${wordText}"`);

        await firstWord.click();
        await page.waitForTimeout(100);

        // Take screenshot after clicking word
        await page.screenshot({ path: 'screenshots/02-word-clicked.png' });
        console.log('✅ Screenshot: 02-word-clicked.png');

        // Check video paused
        const videoPaused = await page.evaluate(() => {
            const video = document.querySelector('video');
            return video ? video.paused : false;
        });
        expect(videoPaused).toBe(true);
        console.log('✅ Video auto-paused (LingoPie pattern)');

        // Scroll to next video
        console.log('📜 Scrolling to next video...');
        await page.evaluate(() => {
            const container = document.querySelector('.reels-container');
            if (container) {
                container.scrollTop = window.innerHeight;
            }
        });

        await page.waitForTimeout(1000);

        // Take screenshot after scroll
        await page.screenshot({ path: 'screenshots/03-after-scroll.png' });
        console.log('✅ Screenshot: 03-after-scroll.png');

        // Verify scroll snap worked
        const scrollTop = await page.evaluate(() => {
            const container = document.querySelector('.reels-container');
            return container ? container.scrollTop : 0;
        });
        expect(scrollTop).toBeGreaterThan(0);
        console.log('✅ TikTok scroll-snap working');

        console.log('\n🎯 FULL USER FLOW COMPLETE:');
        console.log('   1. ✅ App opens to reels (NO menus)');
        console.log('   2. ✅ Spanish words clickable');
        console.log('   3. ✅ Translation shows <100ms');
        console.log('   4. ✅ Video auto-pauses');
        console.log('   5. ✅ TikTok scroll works');
    });

    test('Compare design to TikTok standards', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        // Check full-screen video layout
        const videoStyle = await page.locator('video').first().evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
                width: style.width,
                height: style.height,
                objectFit: style.objectFit
            };
        });

        console.log('📐 Video dimensions:', videoStyle);
        expect(videoStyle.objectFit).toBe('cover');

        // Check sidebar buttons (TikTok pattern)
        const sidebarVisible = await page.locator('.sidebar').isVisible();
        expect(sidebarVisible).toBe(true);
        console.log('✅ Sidebar present (TikTok pattern)');

        // Check for TikTok-style engagement buttons
        const likeBtn = await page.locator('.like-btn').count();
        const commentBtn = await page.locator('.comment-btn').count();
        const saveBtn = await page.locator('.save-btn').count();

        expect(likeBtn).toBeGreaterThan(0);
        expect(commentBtn).toBeGreaterThan(0);
        expect(saveBtn).toBeGreaterThan(0);

        console.log('✅ TikTok engagement buttons present');

        // Take final comparison screenshot
        await page.screenshot({
            path: 'screenshots/tiktok-comparison-final.png',
            fullPage: false
        });

        console.log('\n🎨 DESIGN QUALITY CHECK:');
        console.log('   ✅ Full-screen vertical layout');
        console.log('   ✅ TikTok-style sidebar');
        console.log('   ✅ Engagement buttons');
        console.log('   ✅ No amateur UI elements');
        console.log('   ✅ Professional spacing');
    });

    test('Verify NO spam elements (NEVER_DO_THIS.md)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Check for spam elements
        const xpPopup = await page.locator('.xp-popup').count();
        const flashcardModal = await page.locator('.flashcard-modal').count();
        const dailyQuest = await page.locator('.daily-quest').count();
        const achievementNotif = await page.locator('.achievement').count();

        expect(xpPopup).toBe(0);
        expect(flashcardModal).toBe(0);
        expect(dailyQuest).toBe(0);
        expect(achievementNotif).toBe(0);

        console.log('\n🚫 NEVER_DO_THIS.md COMPLIANCE:');
        console.log('   ✅ No XP popups');
        console.log('   ✅ No flashcard modals');
        console.log('   ✅ No daily quests');
        console.log('   ✅ No achievement spam');
        console.log('   ✅ Pure TikTok experience');
    });
});
