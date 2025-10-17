/**
 * VISUAL TRANSCRIPTION CHECK - HEADED BROWSER
 * Verify dual-language captions appear and sync with video
 */

const { test, expect } = require('@playwright/test');

test.describe('Visual Transcription Verification', () => {
    test('should show dual-language captions on video', async ({ page }) => {
        // Go to homepage
        await page.goto('http://localhost:3002');
        console.log('✅ Navigated to homepage');

        // Wait for videos to load
        await page.waitForSelector('.reel video', { timeout: 10000 });
        console.log('✅ Videos loaded');

        // Get first video and reel
        const firstReel = page.locator('.reel').first();
        const video = firstReel.locator('video');

        // Check video src
        const videoSrc = await video.getAttribute('src');
        console.log(`📹 Video source: ${videoSrc}`);

        // Wait for video to be ready
        await page.waitForTimeout(2000);

        // Play video
        await video.evaluate(v => {
            v.muted = true;
            v.play().catch(e => console.log('Play error:', e));
        });
        console.log('▶️ Video playing');

        // Wait for captions to appear
        await page.waitForTimeout(3000);

        // Check for word overlay
        const wordOverlay = firstReel.locator('.word-overlay');
        const hasOverlay = await wordOverlay.count() > 0;
        console.log(`\n📝 Word overlay present: ${hasOverlay}`);

        if (hasOverlay) {
            const overlayHTML = await wordOverlay.innerHTML();
            console.log(`\n📄 Overlay HTML:\n${overlayHTML.substring(0, 500)}...\n`);

            // Check for caption containers
            const hasDualCaptions = await page.locator('.dual-caption-block').count();
            const hasSpanishCaption = await page.locator('.caption-spanish').count();
            const hasEnglishCaption = await page.locator('.caption-english').count();

            console.log(`🇪🇸 Spanish captions found: ${hasSpanishCaption}`);
            console.log(`🇺🇸 English captions found: ${hasEnglishCaption}`);
            console.log(`📦 Dual caption blocks: ${hasDualCaptions}`);

            if (hasSpanishCaption > 0) {
                const spanishText = await page.locator('.caption-spanish .subtitle-text').first().textContent();
                console.log(`\n🇪🇸 Spanish text: "${spanishText}"`);
            }

            if (hasEnglishCaption > 0) {
                const englishText = await page.locator('.caption-english .subtitle-text').first().textContent();
                console.log(`🇺🇸 English text: "${englishText}"\n`);
            }
        } else {
            console.log('\n⚠️ No word overlay found - checking why...');

            // Check if subtitles exist in video data
            const hasSubtitles = await video.evaluate(v => {
                const reelIndex = Array.from(document.querySelectorAll('.reel')).indexOf(v.closest('.reel'));
                console.log('Video reel index:', reelIndex);
                return false;
            });

            // Check page console for errors
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    console.log(`❌ Browser error: ${msg.text()}`);
                }
            });
        }

        // Take screenshot
        await page.screenshot({
            path: `screenshots/transcription-visual-check-${Date.now()}.png`,
            fullPage: false
        });

        console.log('\n📸 Screenshot saved');
        console.log('✅ Visual check complete\n');
    });

    test('should check if WordLevelSubtitles is loaded', async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Check if WordLevelSubtitles class exists
        const hasClass = await page.evaluate(() => {
            return typeof window.WordLevelSubtitles !== 'undefined';
        });

        console.log(`\n🎬 WordLevelSubtitles loaded: ${hasClass}`);

        if (hasClass) {
            // Check if it's being initialized
            await page.waitForTimeout(2000);

            const videoCount = await page.locator('.reel video').count();
            console.log(`📹 Videos on page: ${videoCount}`);
        }
    });

    test('should check video subtitles data from API', async ({ page }) => {
        // Fetch videos with subtitles from API
        const response = await page.request.get('http://localhost:3002/api/videos/with-subtitles');
        const data = await response.json();

        console.log(`\n📊 API Response:`);
        console.log(`Success: ${data.success}`);
        console.log(`Videos with subtitles: ${data.videos?.length || 0}`);

        if (data.videos && data.videos.length > 0) {
            const firstVideo = data.videos[0];
            console.log(`\n📹 First video:`);
            console.log(`Title: ${firstVideo.title}`);
            console.log(`Path: ${firstVideo.path}`);
            console.log(`Subtitles count: ${firstVideo.subtitles?.length || 0}`);

            if (firstVideo.subtitles && firstVideo.subtitles.length > 0) {
                console.log(`\n📝 First subtitle:`);
                console.log(JSON.stringify(firstVideo.subtitles[0], null, 2));
            }
        }
    });
});
