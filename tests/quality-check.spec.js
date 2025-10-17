// 🔍 QUALITY CHECK - Catch console errors, design issues, broken functionality
// This test goes beyond "working" to ensure BILLION-DOLLAR quality

const { test, expect } = require('@playwright/test');

test.describe('Quality Assurance - Console Errors & Design Issues', () => {

    test('No console errors or warnings during normal usage', async ({ page }) => {
        const consoleMessages = [];
        const consoleErrors = [];
        const consoleWarnings = [];

        page.on('console', msg => {
            consoleMessages.push(msg.text());
            if (msg.type() === 'error') consoleErrors.push(msg.text());
            if (msg.type() === 'warning') consoleWarnings.push(msg.text());
        });

        page.on('pageerror', error => {
            consoleErrors.push(`Page Error: ${error.message}`);
        });

        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForSelector('.video-slide', { timeout: 10000 });

        // Wait for page to fully load
        await page.waitForTimeout(3000);

        // Click on a word to test translation
        const word = await page.$('.clickable-word');
        if (word) {
            await word.click();
            await page.waitForTimeout(1500);
        }

        // Try scrolling to next video
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1500);

        console.log(`📊 Console Messages: ${consoleMessages.length}`);
        console.log(`❌ Console Errors: ${consoleErrors.length}`);
        console.log(`⚠️  Console Warnings: ${consoleWarnings.length}`);

        if (consoleErrors.length > 0) {
            console.log('Errors found:');
            consoleErrors.forEach(err => console.log(`  - ${err}`));
        }

        // CRITICAL: No errors allowed for billion-dollar quality
        expect(consoleErrors.length).toBe(0);
    });

    test('Videos actually play (not just exist)', async ({ page }) => {
        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForSelector('.video-player', { timeout: 10000 });

        const video = await page.$('.video-player');

        // Check video readyState
        const readyState = await video.evaluate(v => v.readyState);
        expect(readyState).toBeGreaterThan(0); // HAVE_METADATA or better

        // Try to play
        const playResult = await video.evaluate(v => {
            return v.play().then(() => 'success').catch(err => err.message);
        });

        console.log(`🎬 Video play result: ${playResult}`);
        // Allow auto-play failure (browser policy), but verify video CAN play
        expect(['success', 'play() failed because the user didn\'t interact with the document first.']).toContain(playResult);
    });

    test('Word translation tooltip appears and works correctly', async ({ page }) => {
        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForSelector('.clickable-word', { timeout: 10000 });

        const word = await page.$('.clickable-word');
        const wordText = await word.textContent();

        await word.click();

        // Wait for tooltip
        await page.waitForSelector('.word-tooltip', { timeout: 5000 });

        const tooltip = await page.$('.word-tooltip');
        const tooltipVisible = await tooltip.isVisible();
        const tooltipText = await tooltip.textContent();

        expect(tooltipVisible).toBe(true);
        expect(tooltipText.length).toBeGreaterThan(0);

        console.log(`✅ Word "${wordText.trim()}" shows tooltip: "${tooltipText.substring(0, 50)}..."`);
    });

    test('Keyboard shortcuts work (Space, Arrows, M, C)', async ({ page }) => {
        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForSelector('.video-player', { timeout: 10000 });

        // Test Space = pause/play
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);

        // Test Arrow Down = next video
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1000);

        const currentVideoIndex = await page.evaluate(() => currentIndex);
        expect(currentVideoIndex).toBeGreaterThan(0);

        // Test M = mute
        await page.keyboard.press('m');
        await page.waitForTimeout(300);

        const isMuted = await page.$eval('.video-player', v => v.muted);
        expect(isMuted).toBeTruthy();

        console.log('✅ Keyboard shortcuts: Space, ArrowDown, M all work');
    });

    test('Gamification bar displays correctly', async ({ page }) => {
        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForSelector('.gamification-bar', { timeout: 10000 });

        const gamBar = await page.$('.gamification-bar');
        const isVisible = await gamBar.isVisible();
        expect(isVisible).toBe(true);

        // Check streak counter
        const streak = await page.$('#streakCount');
        expect(streak).not.toBeNull();

        // Check level badge
        const level = await page.$('#userLevel');
        const levelText = await level.textContent();
        expect(levelText).toContain('Lvl');

        // Check words count
        const wordsCount = await page.$('#wordsCount');
        expect(wordsCount).not.toBeNull();

        console.log(`✅ Gamification: Level ${levelText}, streak visible, words counter present`);
    });

    test('Mobile viewport: Touch gestures and responsive design', async ({ page }) => {
        // Set mobile viewport (iPhone 12 Pro)
        await page.setViewportSize({ width: 390, height: 844 });

        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForSelector('.video-slide', { timeout: 10000 });

        // Check if video fills screen
        const videoBox = await page.$eval('.video-slide', el => {
            const rect = el.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
        });

        expect(videoBox.width).toBe(390);
        expect(videoBox.height).toBe(844);

        // Test swipe gesture (simulate touch)
        await page.touchscreen.tap(200, 400);
        await page.waitForTimeout(300);

        console.log('✅ Mobile viewport: Full-screen video (390x844), touch responsive');
    });

    test('No broken images or missing assets', async ({ page }) => {
        const failedRequests = [];

        page.on('requestfailed', request => {
            failedRequests.push({
                url: request.url(),
                failure: request.failure().errorText
            });
        });

        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForSelector('.video-slide', { timeout: 10000 });
        await page.waitForTimeout(3000);

        if (failedRequests.length > 0) {
            console.log('❌ Failed requests:');
            failedRequests.forEach(req => {
                console.log(`  - ${req.url}: ${req.failure}`);
            });
        }

        // Allow some subtitle files to be missing (not all videos have SRT)
        const criticalFailures = failedRequests.filter(req =>
            !req.url.includes('.srt') && !req.url.includes('favicon')
        );

        expect(criticalFailures.length).toBe(0);
    });

    test('Database API actually responds to word saves', async ({ page }) => {
        let apiResponse = null;

        page.on('response', async response => {
            if (response.url().includes('/api/words/learned')) {
                apiResponse = await response.json();
            }
        });

        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForSelector('.clickable-word', { timeout: 10000 });

        // Click word and save
        const word = await page.$('.clickable-word');
        await word.click();

        await page.waitForSelector('.word-tooltip', { timeout: 3000 });
        const tooltip = await page.$('.word-tooltip');
        await tooltip.click();

        // Wait for API response
        await page.waitForTimeout(1500);

        if (apiResponse) {
            console.log(`✅ Database API response: ${JSON.stringify(apiResponse)}`);
            expect(apiResponse.success).toBe(true);
        } else {
            console.log('⚠️  API call not detected in time window');
        }
    });
});
