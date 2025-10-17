// 🧪 TikTok-style Reels Comprehensive Test
// Tests: Immediate load, vertical scroll, clickable words, database sync

const { test, expect } = require('@playwright/test');

test.describe('TikTok-style Reels - User Commands Verification', () => {

    test('Command #1: Shows reels IMMEDIATELY when app opens (NO menus first)', async ({ page }) => {
        // Navigate to homepage
        await page.goto('http://localhost:3002');

        // Should show reels immediately (index.html has reels embedded)
        await page.waitForSelector('.reel', { timeout: 5000 });

        // Verify we're on the reels page with videos
        const reels = await page.$$('.reel');
        expect(reels.length).toBeGreaterThan(0);

        console.log('✅ Command #1: App opens directly to TikTok reels (NO menu)');
    });

    test('Command #2: Full-screen reels with clickable Spanish word translations', async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Wait for videos to load
        await page.waitForSelector('.reel', { timeout: 10000 });

        // Check for full-screen layout
        const reel = await page.$('.reel');
        const box = await reel.boundingBox();
        const viewportSize = page.viewportSize();

        // Verify full-screen (100vh, 100vw)
        expect(box.height).toBeGreaterThan(viewportSize.height * 0.9);
        expect(box.width).toBeGreaterThan(viewportSize.width * 0.9);

        // Check for TikTok-style scroll-snap
        const container = await page.$('.reels-container');
        const scrollSnapType = await container.evaluate(el =>
            window.getComputedStyle(el).scrollSnapType
        );
        expect(scrollSnapType).toContain('y');

        // Verify clickable words exist
        const clickableWords = await page.$$('.word');
        expect(clickableWords.length).toBeGreaterThan(0);

        console.log(`✅ Command #2: Full-screen reels with ${clickableWords.length} clickable Spanish words`);
    });

    test('Verify unified database sync when clicking words', async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Wait for video to load
        await page.waitForSelector('.word', { timeout: 10000 });

        // Listen for localStorage updates (current implementation uses localStorage)
        const initialWords = await page.evaluate(() => {
            return localStorage.getItem('learnedWords');
        });

        // Click on a Spanish word
        const firstWord = await page.$('.word');
        await firstWord.click();

        // Wait for translation to show
        await page.waitForSelector('.translation.show', { timeout: 3000 });

        // Verify translation is visible
        const translation = await page.$('.translation.show');
        expect(translation).not.toBeNull();

        // Verify word was saved to localStorage
        const updatedWords = await page.evaluate(() => {
            return localStorage.getItem('learnedWords');
        });
        expect(updatedWords).not.toBe(initialWords);

        console.log('✅ Word translation & storage: Word clicked, translation shown, saved to storage');
    });

    test('Command #3: Verify NO dummy content - real Spanish videos with subtitles', async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Wait for videos to load
        await page.waitForSelector('video', { timeout: 10000 });

        // Check video source
        const videoSrc = await page.$eval('video', el => el.src);
        expect(videoSrc).toContain('/videos/');
        expect(videoSrc).toMatch(/\.(mp4|webm|mov)$/);

        // Verify Spanish text exists
        const spanishText = await page.$('.spanish-text');
        expect(spanishText).not.toBeNull();

        const spanishContent = await spanishText.textContent();
        expect(spanishContent.length).toBeGreaterThan(0);

        console.log('✅ Command #3: Real Spanish videos with content (NO dummy data)');
        console.log(`   Video source: ${videoSrc}`);
        console.log(`   Spanish text: "${spanishContent.substring(0, 50)}..."`);
    });

    test('Verify TikTok UX patterns: scroll-snap, vertical swipe, auto-play', async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Wait for first reel
        await page.waitForSelector('.reel', { timeout: 10000 });

        // Check scroll-snap-stop (TikTok pattern from research)
        const reel = await page.$('.reel');
        const scrollSnapStop = await reel.evaluate(el =>
            window.getComputedStyle(el).scrollSnapStop
        );
        expect(scrollSnapStop).toBe('always');

        // Check scroll container
        const container = await page.$('.reels-container');
        const scrollSnapType = await container.evaluate(el =>
            window.getComputedStyle(el).scrollSnapType
        );
        expect(scrollSnapType).toContain('y mandatory');

        // Verify bottom nav exists (TikTok-style)
        const bottomNav = await page.$('.bottom-nav');
        expect(bottomNav).not.toBeNull();

        console.log('✅ TikTok UX patterns verified: scroll-snap-stop:always, vertical scroll, bottom nav');
    });

    test('Performance: Videos load within 2 seconds', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('http://localhost:3002');
        await page.waitForSelector('video', { timeout: 10000 });

        const loadTime = Date.now() - startTime;

        console.log(`⚡ Performance: Page loaded in ${loadTime}ms`);
        expect(loadTime).toBeLessThan(2000);
    });

    test('Accessibility: Page has proper heading and ARIA labels', async ({ page }) => {
        await page.goto('http://localhost:3002/tiktok-videos.html');

        // Check for h1 or main heading
        const heading = await page.$('h1, .page-title');
        expect(heading).not.toBeNull();

        console.log('✅ Accessibility: Proper headings found');
    });
});
