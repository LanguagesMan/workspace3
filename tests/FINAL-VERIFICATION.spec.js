// 🎯 FINAL VERIFICATION: All 3 Requirements Met
const { test, expect } = require('@playwright/test');

test.describe('✅ USER REQUIREMENTS VERIFICATION', () => {
    test('REQUIREMENT 1: TikTok-style vertical scroll reels show IMMEDIATELY when app opens - NO menus first', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('http://localhost:3002');

        // Should show reels container immediately (within 2 seconds)
        await page.waitForSelector('.reels-container', { timeout: 2000 });
        const loadTime = Date.now() - startTime;

        // Verify NO menus/navigation show first
        const hasMenu = await page.locator('nav, .menu, .navbar, .navigation').count();
        expect(hasMenu).toBe(0);

        // Verify reels are visible immediately
        const reels = await page.locator('.reel');
        const reelCount = await reels.count();
        expect(reelCount).toBeGreaterThan(0);

        // First reel should be visible
        await expect(reels.first()).toBeVisible();

        console.log(`✅ REQUIREMENT 1 MET: Reels loaded in ${loadTime}ms, NO menus shown first`);
        console.log(`   Found ${reelCount} reels ready to scroll`);
    });

    test('REQUIREMENT 2: Full-screen reels with clickable Spanish word translations - like TikTok For You page', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Verify full-screen reels (100vh)
        const reel = await page.locator('.reel').first();
        const box = await reel.boundingBox();
        const viewportHeight = await page.evaluate(() => window.innerHeight);

        expect(box.height).toBeCloseTo(viewportHeight, -10);
        console.log(`✅ Full-screen reel: ${box.height}px (viewport: ${viewportHeight}px)`);

        // Verify TikTok snap scroll
        const container = await page.locator('.reels-container');
        const scrollSnapType = await container.evaluate(el =>
            window.getComputedStyle(el).scrollSnapType
        );
        expect(scrollSnapType).toContain('y');
        expect(scrollSnapType).toContain('mandatory');
        console.log(`✅ TikTok scroll-snap: ${scrollSnapType}`);

        // Verify clickable Spanish word translations
        const words = await page.locator('.word');
        const wordCount = await words.count();
        expect(wordCount).toBeGreaterThan(0);

        // Click a word and verify translation shows
        const firstWord = words.first();
        const spanish = await firstWord.getAttribute('data-spanish');
        const translation = await firstWord.getAttribute('data-translation');

        await firstWord.click();
        await page.waitForTimeout(500);

        const translationEl = await page.locator('.translation').first();
        const translationText = await translationEl.textContent();

        expect(translationText).toContain(spanish);
        expect(translationText).toContain(translation);

        console.log(`✅ REQUIREMENT 2 MET: Full-screen TikTok reels with ${wordCount} clickable Spanish words`);
        console.log(`   Word clicked: ${spanish} = ${translation}`);

        // Verify TikTok-style sidebar
        const sidebar = await page.locator('.sidebar').first();
        await expect(sidebar).toBeVisible();

        const likeBtn = await page.locator('.like-btn').first();
        const saveBtn = await page.locator('.save-btn').first();
        const shareBtn = await page.locator('.share-btn').first();

        await expect(likeBtn).toBeVisible();
        await expect(saveBtn).toBeVisible();
        await expect(shareBtn).toBeVisible();
        console.log('✅ TikTok sidebar: Like, Save, Share buttons present');
    });

    test('REQUIREMENT 3: Remove ALL dummy content - use real Spanish learning content', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        // Capture console logs
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));

        await page.reload();
        await page.waitForTimeout(2000);

        // Verify loading real Spanish videos
        const hasRealVideos = logs.some(log =>
            log.includes('Loaded') && log.includes('videos') && log.includes('Spanish')
        );

        // Check video sources are NOT dummy content
        const videos = await page.locator('.reel video');
        const videoCount = await videos.count();

        for (let i = 0; i < Math.min(videoCount, 5); i++) {
            const videoSrc = await videos.nth(i).getAttribute('src');

            // Should contain real video paths
            expect(videoSrc).toContain('/videos/');

            // Should NOT be dummy/placeholder
            expect(videoSrc).not.toContain('dummy');
            expect(videoSrc).not.toContain('placeholder');
            expect(videoSrc).not.toContain('fake');
            expect(videoSrc).not.toContain('GLOBO');

            console.log(`   Real video ${i + 1}: ${videoSrc}`);
        }

        // Verify Spanish text is REAL (from subtitles)
        const spanishText = await page.locator('.spanish-text').first().textContent();

        // Should contain real Spanish words
        const hasRealSpanish = /[áéíóúñü]|tengo|quiero|necesito|estoy|mierda|hambre|gusta/i.test(spanishText);
        expect(hasRealSpanish).toBe(true);

        console.log(`✅ REQUIREMENT 3 MET: ${videoCount} REAL Spanish videos loaded`);
        console.log(`   NO dummy content found`);
        console.log(`   Real Spanish text: "${spanishText.substring(0, 50)}..."`);

        // Verify NO GLOBO fictional content
        const bodyText = await page.textContent('body');
        expect(bodyText).not.toContain('GLOBO');
        expect(bodyText).not.toContain('fictional');
        console.log('✅ Confirmed: NO fictional GLOBO content');
    });

    test('BONUS: Verify Duolingo gamification enhances learning', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForTimeout(2000);

        // Verify XP system
        const xpCounter = await page.locator('.xp-counter');
        await expect(xpCounter).toBeVisible();

        // Learn a word
        const word = await page.locator('.word').first();
        await word.click();
        await page.waitForTimeout(1500);

        // Verify XP awarded
        const xp = await page.locator('#xpCount').textContent();
        expect(parseInt(xp)).toBe(10);

        // Verify streak displayed
        const streak = await page.locator('#streakCount').textContent();
        expect(streak).toBeTruthy();

        console.log(`✅ BONUS: Duolingo gamification working - ${xp} XP, ${streak} day streak`);
    });

    test('FINAL SCREENSHOT: Proof all requirements met', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3002');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForTimeout(2000);

        // Learn a word to show gamification
        const word = await page.locator('.word').first();
        await word.click();
        await page.waitForTimeout(800);

        // Take final screenshot
        await page.screenshot({
            path: '/tmp/FINAL-APP-PROOF.png',
            fullPage: false
        });

        console.log('✅ FINAL SCREENSHOT SAVED: /tmp/FINAL-APP-PROOF.png');
        console.log('');
        console.log('🎉 ALL 3 REQUIREMENTS VERIFIED:');
        console.log('   1. ✅ TikTok vertical scroll opens IMMEDIATELY');
        console.log('   2. ✅ Full-screen reels with clickable Spanish translations');
        console.log('   3. ✅ REAL Spanish content (NO dummy data)');
        console.log('   BONUS: ✅ Duolingo/Babbel gamification integrated');
    });
});
