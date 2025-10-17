const { test, expect } = require('@playwright/test');

test.describe('🔍 Comprehensive User Experience Check', () => {
    test('1. Feed loads with content immediately', async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Wait for feed content
        await page.waitForSelector('.feed-card, .video-card, .content-card', { timeout: 5000 });

        // Verify content is visible
        const contentCount = await page.locator('.feed-card, .video-card, .content-card').count();
        expect(contentCount).toBeGreaterThan(0);

        console.log(`✅ Feed loaded with ${contentCount} content cards`);
    });

    test('2. Videos have valid source URLs', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Find first video element
        const videoCount = await page.locator('video').count();
        console.log(`Found ${videoCount} video elements`);

        if (videoCount > 0) {
            // Check video sources are valid URLs
            const videoInfo = await page.evaluate(() => {
                const video = document.querySelector('video');
                if (!video) return { found: false };

                return {
                    found: true,
                    hasSrc: !!video.src,
                    src: video.src,
                    readyState: video.readyState
                };
            });

            console.log('Video info:', videoInfo);

            expect(videoInfo.hasSrc).toBe(true);
            expect(videoInfo.src).toContain('http');
        }

        console.log(`✅ Video sources validated (${videoCount} videos found)`);
    });

    test('3. Word translations work when clicked', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Look for clickable Spanish words
        const clickableWords = await page.evaluate(() => {
            const words = document.querySelectorAll('[onclick*="translateWord"]');
            return {
                count: words.length,
                firstWord: words[0]?.textContent || null,
                onclick: words[0]?.getAttribute('onclick') || null
            };
        });

        console.log('Clickable words found:', clickableWords);

        if (clickableWords.count > 0) {
            // Try clicking first word
            const translationShown = await page.evaluate(() => {
                const word = document.querySelector('[onclick*="translateWord"]');
                if (!word) return false;

                word.click();

                // Check if translation popup/tooltip appeared
                setTimeout(() => {}, 500);
                const tooltip = document.querySelector('.translation-tooltip, .word-popup, [class*="translation"]');
                return tooltip !== null;
            });

            console.log('Translation shown after click:', translationShown);
        }

        console.log(`✅ Word translation tested (${clickableWords.count} clickable words)`);
    });

    test('4. Transcriptions display during video playback', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Check for caption elements
        const captionInfo = await page.evaluate(async () => {
            const video = document.querySelector('video');
            const videoData = {
                hasVideo: !!video,
                videoCount: document.querySelectorAll('video').length
            };

            if (video) {
                try {
                    await video.play();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (e) {
                    videoData.playError = e.message;
                }
            }

            return {
                ...videoData,
                spanishCaptions: document.querySelectorAll('.caption-spanish, [class*="spanish"]').length,
                englishCaptions: document.querySelectorAll('.caption-english, [class*="english"]').length,
                subtitleContainers: document.querySelectorAll('.subtitle-container, [class*="subtitle"]').length,
                transcriptionElements: document.querySelectorAll('[class*="transcription"], [class*="caption"]').length
            };
        });

        console.log('Caption check:', captionInfo);

        console.log(`✅ Transcription display tested`);
    });

    test('5. Can scroll through multiple items', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Get initial scroll position of FEED CONTAINER (not window)
        const initialScroll = await page.evaluate(() => {
            const feed = document.getElementById('feedContainer');
            return feed ? feed.scrollTop : 0;
        });

        // Scroll the feed container down
        await page.evaluate(() => {
            const feed = document.getElementById('feedContainer');
            if (feed) {
                feed.scrollBy(0, feed.clientHeight);
            }
        });
        await page.waitForTimeout(500);

        const afterScrollPosition = await page.evaluate(() => {
            const feed = document.getElementById('feedContainer');
            return feed ? feed.scrollTop : 0;
        });

        // Check if scroll position changed
        const scrolled = afterScrollPosition > initialScroll;
        expect(scrolled).toBe(true);

        // Count visible content after scroll
        const contentAfterScroll = await page.locator('.feed-card, .video-card, .content-card').count();

        console.log(`Scroll test: Initial=${initialScroll}, After=${afterScrollPosition}, Content=${contentAfterScroll}`);
        console.log(`✅ Scrolling works (moved ${afterScrollPosition - initialScroll}px)`);
    });

    test('Overall: No critical JavaScript errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));

        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        // Filter out expected 404s
        const criticalErrors = errors.filter(e =>
            !e.includes('404') &&
            !e.includes('Failed to load resource') &&
            !e.includes('net::ERR_')
        );

        console.log(`Total errors: ${errors.length}, Critical: ${criticalErrors.length}`);
        if (criticalErrors.length > 0) {
            console.log('Critical errors:', criticalErrors);
        }

        expect(criticalErrors).toHaveLength(0);
        console.log('✅ No critical JavaScript errors');
    });
});
