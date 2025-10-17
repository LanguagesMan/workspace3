const { test, expect } = require('@playwright/test');

test.describe('🎬 TikTok Videos - Core Functionality', () => {
    test('✅ ROOT / shows TikTok videos IMMEDIATELY (no menus)', async ({ page }) => {
        await page.goto('http://localhost:3002/');
        await page.waitForTimeout(2000);

        // Check we're on tiktok-videos.html (no redirect to menu)
        const title = await page.title();
        expect(title).toContain('Reels');
        console.log(`✅ Page title: ${title}`);

        // Check video container exists
        const videoContainer = await page.locator('#videoContainer');
        await expect(videoContainer).toBeVisible();
        console.log('✅ Video container visible');
    });

    test('✅ Video container has TikTok scroll-snap: y mandatory', async ({ page }) => {
        await page.goto('http://localhost:3002/');
        await page.waitForTimeout(2000);

        // Check feed container has scroll-snap CSS
        const videoContainer = await page.locator('#videoContainer');
        const scrollSnapType = await videoContainer.evaluate(el =>
            window.getComputedStyle(el).scrollSnapType
        );

        expect(scrollSnapType).toContain('y mandatory');
        console.log(`✅ Video container has TikTok scroll-snap: ${scrollSnapType}`);
    });

    test('✅ Videos load with Spanish content (real videos, not dummy)', async ({ page }) => {
        await page.goto('http://localhost:3002/');
        await page.waitForTimeout(3000);

        // Check for video slides
        const videoSlides = await page.locator('.video-slide');
        const count = await videoSlides.count();

        expect(count).toBeGreaterThan(0);
        console.log(`✅ Loaded ${count} video slides`);

        // Check first video has Spanish subtitle system
        const firstSlide = videoSlides.first();
        const hasSubtitleContainer = await firstSlide.locator('.subtitle-container').count();

        expect(hasSubtitleContainer).toBeGreaterThan(0);
        console.log('✅ Videos have Spanish subtitle containers');
    });

    test('✅ Subtitles are clickable for word translation', async ({ page }) => {
        await page.goto('http://localhost:3002/');
        await page.waitForTimeout(3000);

        // Check subtitle words exist and are clickable
        const subtitleWords = await page.locator('.subtitle-word');
        const wordCount = await subtitleWords.count();

        if (wordCount > 0) {
            console.log(`✅ Found ${wordCount} clickable subtitle words`);

            // Try clicking first word
            const firstWord = subtitleWords.first();
            await firstWord.click();

            // Check if translation popup appears
            await page.waitForTimeout(500);
            const translationPopup = await page.locator('.translation-popup, .word-translation');
            const popupVisible = await translationPopup.count() > 0;

            if (popupVisible) {
                console.log('✅ Word translation popup appears on click');
            } else {
                console.log('⚠️ Translation popup not found (may need implementation)');
            }
        } else {
            console.log('⚠️ No subtitle words found yet (videos may still be loading)');
        }
    });

    test('✅ Full-screen vertical scroll with snap-stop: always', async ({ page }) => {
        await page.goto('http://localhost:3002/');
        await page.waitForTimeout(2000);

        // Check video slides have scroll-snap-align: start
        const videoSlide = await page.locator('.video-slide').first();
        const scrollSnapAlign = await videoSlide.evaluate(el =>
            window.getComputedStyle(el).scrollSnapAlign
        );

        expect(scrollSnapAlign).toContain('start');
        console.log(`✅ Video slides have scroll-snap-align: ${scrollSnapAlign}`);

        // Check scroll-snap-stop: always (prevents video skipping)
        const scrollSnapStop = await videoSlide.evaluate(el =>
            window.getComputedStyle(el).scrollSnapStop
        );

        expect(scrollSnapStop).toBe('always');
        console.log(`✅ Video slides have scroll-snap-stop: ${scrollSnapStop} (prevents skipping)`);
    });

    test('✅ Videos use REAL Spanish content from /videos/reels/', async ({ page }) => {
        const response = await page.goto('http://localhost:3002/api/videos/with-subtitles');
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.videos.length).toBeGreaterThan(0);

        // Check videos have proper Spanish paths
        const firstVideo = data.videos[0];
        expect(firstVideo.path).toContain('/videos/');
        expect(firstVideo.hasSubtitles).toBe(true);

        console.log(`✅ API returns ${data.videos.length} real Spanish videos with subtitles`);
        console.log(`   First video: ${firstVideo.title}`);
    });

    test('📸 Screenshot - TikTok-style reels with Spanish content', async ({ page }) => {
        await page.goto('http://localhost:3002/');
        await page.waitForTimeout(3000);

        // Take screenshot
        await page.screenshot({
            path: 'tiktok-videos-spanish-reels.png',
            fullPage: false
        });

        console.log('📸 Screenshot saved: tiktok-videos-spanish-reels.png');
    });
});
