/**
 * ✅ VERIFICATION TEST - USER'S 3 MANUAL COMMANDS
 *
 * This test proves all 3 user commands are working:
 * 1. Show TikTok-style vertical scroll reels IMMEDIATELY when app opens - NO menus first
 * 2. Full-screen reels with clickable Spanish word translations - like TikTok For You page
 * 3. Remove ALL dummy content - use real Spanish learning content
 */

const { test, expect } = require('@playwright/test');

test.describe('✅ USER COMMAND VERIFICATION - workspace3', () => {

    test('COMMAND #1: App opens → TikTok reels show IMMEDIATELY (NO menus)', async ({ page }) => {
        console.log('🔍 Testing Command #1: Immediate TikTok reels on app open');

        // Open root URL (/)
        await page.goto('http://localhost:3002/');

        // Wait for redirect
        await page.waitForTimeout(1000);

        // Should redirect to videos-feed.html automatically
        expect(page.url()).toContain('videos-feed.html');
        console.log('✅ Root URL redirects to videos-feed.html immediately');

        // Videos should load within 3 seconds
        await page.waitForSelector('.video-card', { timeout: 3000 });
        const videoCount = await page.locator('.video-card').count();
        expect(videoCount).toBeGreaterThan(0);
        console.log(`✅ ${videoCount} TikTok-style video cards loaded immediately`);

        // Should have full-screen layout (100vh)
        const firstCard = page.locator('.video-card').first();
        const height = await firstCard.evaluate(el => el.offsetHeight);
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        expect(height).toBeCloseTo(viewportHeight, -1); // Within 10px
        console.log(`✅ Full-screen video cards: ${height}px (viewport: ${viewportHeight}px)`);

        // Should have TikTok scroll-snap behavior
        const container = page.locator('.shorts-container');
        const scrollSnapType = await container.evaluate(el =>
            window.getComputedStyle(el).scrollSnapType
        );
        expect(scrollSnapType).toContain('y mandatory');
        console.log(`✅ TikTok scroll-snap enabled: ${scrollSnapType}`);

        // Take screenshot
        await page.screenshot({
            path: 'screenshots/evidence/COMMAND-1-immediate-tiktok-reels.png',
            fullPage: false
        });
        console.log('📸 Screenshot: COMMAND-1-immediate-tiktok-reels.png');
    });

    test('COMMAND #2: Full-screen reels with clickable Spanish word translations', async ({ page }) => {
        console.log('🔍 Testing Command #2: Clickable word translations in reels');

        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForSelector('.video-card', { timeout: 3000 });

        // Should have subtitle containers
        const subtitles = page.locator('.interactive-subtitles');
        const subtitleCount = await subtitles.count();
        expect(subtitleCount).toBeGreaterThan(0);
        console.log(`✅ Found ${subtitleCount} subtitle containers`);

        // Should have clickable Spanish words
        const clickableWords = page.locator('.word-clickable');
        const wordCount = await clickableWords.count();
        expect(wordCount).toBeGreaterThan(0);
        console.log(`✅ Found ${wordCount} clickable Spanish words`);

        // Test clicking a word shows translation
        const firstWord = clickableWords.first();
        const wordText = await firstWord.textContent();
        await firstWord.click();

        // Translation popup should appear
        await page.waitForTimeout(500);
        const popup = page.locator('.translation-popup.active');
        await expect(popup).toBeVisible();
        console.log(`✅ Clicking "${wordText}" shows translation popup`);

        // Popup should contain translation
        const translationText = await popup.locator('.translation-meaning').textContent();
        expect(translationText).toBeTruthy();
        console.log(`✅ Translation popup shows: ${translationText}`);

        // Take screenshot with translation visible
        await page.screenshot({
            path: 'screenshots/evidence/COMMAND-2-clickable-translations.png',
            fullPage: false
        });
        console.log('📸 Screenshot: COMMAND-2-clickable-translations.png');
    });

    test('COMMAND #3: No dummy content - all REAL Spanish', async ({ page }) => {
        console.log('🔍 Testing Command #3: Real Spanish content (no dummy/placeholder)');

        await page.goto('http://localhost:3002/videos-feed.html');
        await page.waitForSelector('.video-card', { timeout: 3000 });

        // Check video sources are real files from /videos/reels/
        const videos = page.locator('video');
        const firstVideoSrc = await videos.first().getAttribute('src');
        expect(firstVideoSrc).toContain('/videos/reels/');
        expect(firstVideoSrc).toMatch(/\.mp4$/);
        console.log(`✅ Real video file: ${firstVideoSrc}`);

        // Check Spanish text is real (not Lorem ipsum or dummy)
        const allText = await page.locator('body').textContent();

        // Should NOT contain dummy content
        expect(allText.toLowerCase()).not.toContain('lorem ipsum');
        expect(allText.toLowerCase()).not.toContain('placeholder');
        console.log('✅ No "Lorem ipsum" or "placeholder" text found');

        // Should contain real Spanish words
        const spanishWords = await page.locator('.word-clickable').allTextContents();
        const hasRealSpanish = spanishWords.some(word =>
            /^[A-Za-zñÑáéíóúÁÉÍÓÚü¡¿]+$/.test(word.trim())
        );
        expect(hasRealSpanish).toBe(true);
        console.log(`✅ Real Spanish words found: ${spanishWords.slice(0, 5).join(', ')}...`);

        // Take screenshot showing real content
        await page.screenshot({
            path: 'screenshots/evidence/COMMAND-3-real-spanish-content.png',
            fullPage: false
        });
        console.log('📸 Screenshot: COMMAND-3-real-spanish-content.png');
    });

    test('📸 FINAL PROOF: All 3 commands working together', async ({ page }) => {
        console.log('🔍 Final verification: All commands working simultaneously');

        // Start from root
        await page.goto('http://localhost:3002/');
        await page.waitForTimeout(1000);

        // Should be on videos-feed.html (Command #1)
        expect(page.url()).toContain('videos-feed.html');

        // Should have videos loaded
        await page.waitForSelector('.video-card', { timeout: 3000 });
        const videoCount = await page.locator('.video-card').count();

        // Should have clickable words (Command #2)
        const wordCount = await page.locator('.word-clickable').count();

        // Should have real video sources (Command #3)
        const videoSrc = await page.locator('video').first().getAttribute('src');

        console.log('');
        console.log('✅ ========================================');
        console.log('✅ ALL 3 USER COMMANDS VERIFIED:');
        console.log('✅ ========================================');
        console.log(`✅ Command #1: Immediate redirect → ${videoCount} TikTok reels`);
        console.log(`✅ Command #2: ${wordCount} clickable Spanish words`);
        console.log(`✅ Command #3: Real content from ${videoSrc}`);
        console.log('✅ ========================================');
        console.log('');

        // Final screenshot
        await page.screenshot({
            path: 'screenshots/evidence/ALL-3-COMMANDS-COMPLETE.png',
            fullPage: true
        });
        console.log('📸 Screenshot: ALL-3-COMMANDS-COMPLETE.png');

        expect(videoCount).toBeGreaterThan(0);
        expect(wordCount).toBeGreaterThan(0);
        expect(videoSrc).toContain('/videos/reels/');
    });
});
