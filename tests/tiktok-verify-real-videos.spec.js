// 🧪 VERIFY: TikTok-Style Reels with Real Spanish Videos
const { test, expect } = require('@playwright/test');

test.describe('TikTok-Style Spanish Reels - Real Content Verification', () => {
    test('should load real Spanish videos immediately on app open', async ({ page }) => {
        // Navigate to root URL
        await page.goto('http://localhost:3002');

        // Wait for videos to load
        await page.waitForTimeout(3000);

        // Check console for success message
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));

        // Reload to capture console
        await page.reload();
        await page.waitForTimeout(2000);

        // Should show loading success
        const hasSuccessLog = logs.some(log => log.includes('Loaded') && log.includes('videos'));
        console.log('Console logs:', logs);

        // Check for reel elements
        const reels = await page.locator('.reel');
        const count = await reels.count();

        console.log(`✅ Found ${count} reels`);
        expect(count).toBeGreaterThan(0);

        // Check first video source
        const firstVideo = await page.locator('.reel video').first();
        const videoSrc = await firstVideo.getAttribute('src');

        console.log('First video src:', videoSrc);

        // Should be real video from /videos/ directory
        expect(videoSrc).toContain('/videos/');
        expect(videoSrc).toMatch(/\.(mp4|webm)$/);

        // Should NOT be dummy/placeholder
        expect(videoSrc).not.toContain('placeholder');
        expect(videoSrc).not.toContain('dummy');
    });

    test('should display clickable Spanish words', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Check for Spanish word overlay
        const words = await page.locator('.word');
        const count = await words.count();

        console.log(`✅ Found ${count} clickable Spanish words`);
        expect(count).toBeGreaterThan(0);

        // Click first word
        const firstWord = words.first();
        await expect(firstWord).toBeVisible();

        const spanish = await firstWord.getAttribute('data-spanish');
        const translation = await firstWord.getAttribute('data-translation');

        console.log(`Word: ${spanish} = ${translation}`);

        expect(spanish).toBeTruthy();
        expect(translation).toBeTruthy();

        // Click to show translation
        await firstWord.click();
        await page.waitForTimeout(500);

        const translationEl = await page.locator('.translation').first();
        const text = await translationEl.textContent();

        expect(text).toContain(spanish);
        expect(text).toContain(translation);
    });

    test('should have TikTok snap scroll CSS', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(1000);

        const container = await page.locator('.reels-container');

        // Verify scroll-snap-type: y mandatory
        const scrollSnapType = await container.evaluate(el =>
            window.getComputedStyle(el).scrollSnapType
        );

        console.log('scroll-snap-type:', scrollSnapType);
        expect(scrollSnapType).toContain('y');

        // Check reel snap alignment
        const reel = await page.locator('.reel').first();
        const scrollSnapAlign = await reel.evaluate(el =>
            window.getComputedStyle(el).scrollSnapAlign
        );

        console.log('scroll-snap-align:', scrollSnapAlign);
        expect(scrollSnapAlign).toBe('start');
    });

    test('should show TikTok-style sidebar buttons', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(1000);

        // Check sidebar exists
        const sidebar = await page.locator('.sidebar').first();
        await expect(sidebar).toBeVisible();

        // Check standard TikTok buttons
        const likeBtn = await page.locator('.like-btn').first();
        const saveBtn = await page.locator('.save-btn').first();
        const shareBtn = await page.locator('.share-btn').first();

        await expect(likeBtn).toBeVisible();
        await expect(saveBtn).toBeVisible();
        await expect(shareBtn).toBeVisible();

        console.log('✅ All TikTok sidebar buttons present');
    });

    test('should take screenshot for visual proof', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 }); // iPhone X size

        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        // Take screenshot
        await page.screenshot({
            path: '/tmp/tiktok-spanish-reels-proof.png',
            fullPage: false
        });

        console.log('✅ Screenshot saved: /tmp/tiktok-spanish-reels-proof.png');

        // Verify app is showing content
        const reels = await page.locator('.reel');
        const count = await reels.count();

        expect(count).toBeGreaterThan(0);
    });
});
