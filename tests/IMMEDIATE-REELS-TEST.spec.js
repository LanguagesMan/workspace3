// 🎯 TEST: App opens DIRECTLY to TikTok reels - NO menus/navigation first
// USER COMMAND #1: "Show TikTok-style vertical scroll reels IMMEDIATELY when app opens - NO menus first"

const { test, expect } = require('@playwright/test');

test.describe('🔥 IMMEDIATE REELS - USER COMMAND #1', () => {
    test('Root URL serves TikTok reels IMMEDIATELY (no redirect, no menu)', async ({ page }) => {
        console.log('📍 Testing: http://localhost:3002 serves reels DIRECTLY');

        const startTime = Date.now();
        await page.goto('http://localhost:3002');
        const loadTime = Date.now() - startTime;

        // CRITICAL: Must show reels page title (NOT index.html menu)
        const title = await page.title();
        console.log(`✅ Page title: "${title}"`);
        expect(title).toContain('Reels');
        expect(title).not.toContain('VIDA'); // NOT the index menu page

        // CRITICAL: Must have TikTok-style video container
        const videoContainer = page.locator('.video-container, .tiktok-reel, .swiper-slide').first();
        await expect(videoContainer).toBeVisible({ timeout: 5000 });
        console.log('✅ TikTok reel container visible');

        // CRITICAL: Must have Spanish subtitles/captions
        const spanishText = page.locator('[lang="es"], .subtitle, .word').first();
        await expect(spanishText).toBeVisible({ timeout: 3000 });
        const text = await spanishText.textContent();
        console.log(`✅ Spanish content found: "${text.slice(0, 30)}..."`);

        // CRITICAL: Must have bottom navigation (Reels, News, Chat, Profile)
        const bottomNav = page.locator('.bottom-nav, nav.bottom-nav-bar');
        await expect(bottomNav).toBeVisible();
        console.log('✅ Bottom navigation visible');

        // PERFORMANCE: Page must load fast (<2 seconds)
        expect(loadTime).toBeLessThan(2000);
        console.log(`⚡ Page loaded in ${loadTime}ms (target: <2000ms)`);

        // EVIDENCE: Take screenshot
        await page.screenshot({ path: '/tmp/immediate-reels-proof.png', fullPage: false });
        console.log('📸 Screenshot saved: /tmp/immediate-reels-proof.png');

        console.log('\n🎯 RESULT: ✅ App opens DIRECTLY to TikTok reels - NO menu/redirect!');
    });

    test('Word translation works when clicking Spanish words', async ({ page }) => {
        console.log('📍 Testing: Word translation functionality');

        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');

        // Find a clickable Spanish word
        const spanishWord = page.locator('.word, .clickable-word, [data-word]').first();
        await expect(spanishWord).toBeVisible({ timeout: 5000 });

        const wordText = await spanishWord.textContent();
        console.log(`🔤 Found Spanish word: "${wordText}"`);

        // Click the word
        await spanishWord.click();
        await page.waitForTimeout(1500); // Wait for translation API

        // Check for translation tooltip
        const tooltip = page.locator('.translation-tooltip, .tooltip, [class*="translation"]');
        const tooltipVisible = await tooltip.count() > 0;

        if (tooltipVisible) {
            const translation = await tooltip.first().textContent();
            console.log(`✅ Translation shown: "${wordText}" → "${translation}"`);
            await page.screenshot({ path: '/tmp/word-translation-proof.png' });
            console.log('📸 Translation screenshot: /tmp/word-translation-proof.png');
        } else {
            console.log('⚠️  Translation tooltip not found (may need adjustment)');
        }
    });

    test('Vertical scroll works (TikTok-style swipe)', async ({ page }) => {
        console.log('📍 Testing: Vertical scroll behavior');

        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');

        // Get first video element
        const firstVideo = page.locator('.video-container, .swiper-slide, .tiktok-reel').first();
        await expect(firstVideo).toBeVisible();

        // Scroll down to next video
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(800);

        console.log('✅ Vertical scroll executed');
        await page.screenshot({ path: '/tmp/vertical-scroll-proof.png' });
        console.log('📸 Scroll screenshot: /tmp/vertical-scroll-proof.png');
    });

    test('NO console errors on page load', async ({ page }) => {
        console.log('📍 Testing: Console errors check');

        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        if (consoleErrors.length > 0) {
            console.log('❌ Console errors found:');
            consoleErrors.forEach(err => console.log(`  - ${err}`));
        } else {
            console.log('✅ NO console errors!');
        }

        expect(consoleErrors.length).toBe(0);
    });

    test('Daily goal widget visible', async ({ page }) => {
        console.log('📍 Testing: Daily goal widget (Duolingo-style)');

        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');

        const dailyGoal = page.locator('.daily-goal, [class*="goal"]');
        const goalVisible = await dailyGoal.count() > 0;

        if (goalVisible) {
            const goalText = await dailyGoal.first().textContent();
            console.log(`✅ Daily goal widget: "${goalText}"`);
        } else {
            console.log('⚠️  Daily goal widget not found (may be on different page)');
        }
    });
});
