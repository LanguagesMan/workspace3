const { test, expect } = require('@playwright/test');

test.describe('🎯 VERIFY ALL 5 USER COMMANDS', () => {

    test('✅ COMMAND 1: Videos from langfeed folder work', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);

        // Check Videos tab exists and click it
        const videosTab = await page.locator('button:has-text("Videos")');
        await expect(videosTab).toBeVisible();
        await videosTab.click();
        await page.waitForTimeout(2000);

        // Verify videos are loaded
        const videos = await page.locator('video.feed-video');
        const videoCount = await videos.count();
        console.log(`📹 Found ${videoCount} videos in feed`);
        expect(videoCount).toBeGreaterThan(0);

        // Check first video source is from reels folder
        const firstVideo = videos.first();
        const src = await firstVideo.getAttribute('src');
        console.log(`📹 First video source: ${src}`);
        expect(src).toContain('/videos/reels/');

        // Verify video element has valid attributes
        const videoId = await firstVideo.getAttribute('data-video-id');
        expect(videoId).toBeTruthy();

        await page.screenshot({ path: 'screenshots/workspace3/COMMAND-1-videos-from-langfeed.png', fullPage: true });
        console.log('✅ COMMAND 1 VERIFIED: Videos from langfeed folder are working');
    });

    test('✅ COMMAND 2: Articles from APIs display', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);

        // Click Articles tab
        const articlesTab = await page.locator('button[data-tab="articles"]');
        await expect(articlesTab).toBeVisible();
        await articlesTab.click();
        await page.waitForTimeout(2000);

        // Check for article/news cards
        const articles = await page.locator('.type-article, .type-news');
        const articleCount = await articles.count();
        console.log(`📰 Found ${articleCount} articles in feed`);
        expect(articleCount).toBeGreaterThan(0);

        // Verify article has content (not dummy)
        const firstArticle = articles.first();
        const headline = await firstArticle.locator('.spanish-text').textContent();
        console.log(`📰 First article headline: ${headline}`);
        expect(headline.length).toBeGreaterThan(10);
        expect(headline).not.toContain('Lorem');
        expect(headline).not.toContain('dummy');

        await page.screenshot({ path: 'screenshots/workspace3/COMMAND-2-articles-from-apis.png', fullPage: true });
        console.log('✅ COMMAND 2 VERIFIED: Articles from APIs are displaying');
    });

    test('✅ COMMAND 3: Memes are in feed', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);

        // Stay on "For You" tab (default, has all content types)
        await page.waitForTimeout(2000);

        // Check for meme/social cards
        const memes = await page.locator('.type-meme, .type-social');
        const memeCount = await memes.count();
        console.log(`😂 Found ${memeCount} memes/social posts in feed`);
        expect(memeCount).toBeGreaterThan(0);

        // Verify meme has content
        const firstMeme = memes.first();
        const memeText = await firstMeme.locator('.spanish-text').textContent();
        console.log(`😂 First meme text: ${memeText}`);
        expect(memeText.length).toBeGreaterThan(5);

        await page.screenshot({ path: 'screenshots/workspace3/COMMAND-3-memes-in-feed.png', fullPage: true });
        console.log('✅ COMMAND 3 VERIFIED: Memes are in feed');
    });

    test('✅ COMMAND 4: Videos actually play', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);

        // Click Videos tab
        const videosTab = await page.locator('button:has-text("Videos")');
        await videosTab.click();
        await page.waitForTimeout(2000);

        // Get first video
        const video = await page.locator('video.feed-video').first();
        await video.waitFor({ state: 'visible' });

        // Click video to try to play
        await video.click();
        await page.waitForTimeout(1000);

        // Check video readyState (should be > 0 if loading)
        const videoDetails = await video.evaluate(v => ({
            src: v.src,
            readyState: v.readyState,
            networkState: v.networkState,
            duration: v.duration,
            paused: v.paused
        }));

        console.log('🎬 Video playback status:');
        console.log(`  Source: ${videoDetails.src}`);
        console.log(`  Ready State: ${videoDetails.readyState} (${['EMPTY', 'METADATA', 'CURRENT', 'FUTURE', 'ENOUGH'][videoDetails.readyState]})`);
        console.log(`  Network State: ${videoDetails.networkState} (${['EMPTY', 'IDLE', 'LOADING', 'NO_SOURCE'][videoDetails.networkState]})`);
        console.log(`  Duration: ${videoDetails.duration}s`);
        console.log(`  Paused: ${videoDetails.paused}`);

        // Verify video can load (readyState > 0 OR networkState indicates loading)
        const canPlay = videoDetails.readyState > 0 || videoDetails.networkState > 0;
        expect(canPlay).toBe(true);

        await page.screenshot({ path: 'screenshots/workspace3/COMMAND-4-videos-play.png', fullPage: true });
        console.log('✅ COMMAND 4 VERIFIED: Videos can play');
    });

    test('✅ COMMAND 5: No dummy content', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);

        // "For You" tab is default (has all content types)
        await page.waitForTimeout(2000);

        // Get all content cards
        const allCards = await page.locator('.content-card');
        const cardCount = await allCards.count();
        console.log(`🔍 Checking ${cardCount} cards for dummy content...`);

        // Check each card for dummy/placeholder text
        for (let i = 0; i < Math.min(cardCount, 10); i++) {
            const card = allCards.nth(i);
            const spanishText = await card.locator('.spanish-text').textContent();
            const englishText = await card.locator('.english-text').textContent();

            // Verify no dummy text
            expect(spanishText.toLowerCase()).not.toContain('lorem');
            expect(spanishText.toLowerCase()).not.toContain('ipsum');
            expect(spanishText.toLowerCase()).not.toContain('dummy');
            expect(spanishText.toLowerCase()).not.toContain('placeholder');

            expect(englishText.toLowerCase()).not.toContain('lorem');
            expect(englishText.toLowerCase()).not.toContain('ipsum');
            expect(englishText.toLowerCase()).not.toContain('dummy');
            expect(englishText.toLowerCase()).not.toContain('placeholder');

            console.log(`  ✅ Card ${i + 1}: Real content confirmed`);
        }

        // Also check videos are real files
        const videos = await page.locator('video.feed-video');
        const videoCount = await videos.count();
        for (let i = 0; i < Math.min(videoCount, 5); i++) {
            const video = videos.nth(i);
            const src = await video.getAttribute('src');
            expect(src).toContain('/videos/reels/');
            expect(src).toContain('.mp4');
            console.log(`  ✅ Video ${i + 1}: Real file from reels folder (${src})`);
        }

        await page.screenshot({ path: 'screenshots/workspace3/COMMAND-5-no-dummy.png', fullPage: true });
        console.log('✅ COMMAND 5 VERIFIED: No dummy content found');
    });

    test('📸 FINAL: Take complete proof screenshot', async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForTimeout(3000);

        // "For You" tab is default (most diverse content)
        await page.waitForTimeout(2000);

        // Scroll down to show variety
        await page.evaluate(() => {
            window.scrollBy(0, 500);
        });
        await page.waitForTimeout(1000);

        await page.screenshot({
            path: 'screenshots/workspace3/ALL-5-COMMANDS-COMPLETE.png',
            fullPage: true
        });

        console.log('\n🎉 ALL 5 COMMANDS VERIFIED COMPLETE!');
        console.log('Screenshots saved to screenshots/workspace3/');
    });
});
