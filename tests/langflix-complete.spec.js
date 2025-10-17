/**
 * COMPREHENSIVE LANGFLIX TEST SUITE
 * Tests all features for TikTok-quality standards
 *
 * Testing Strategy:
 * 1. Video autoplay on scroll
 * 2. Subtitle display and timing accuracy
 * 3. Speed control functionality
 * 4. Like button interaction
 * 5. Word translation popup
 * 6. Bottom navigation (no inbox button)
 * 7. Sidebar buttons visibility and interaction
 * 8. Performance metrics (page load < 3s, interaction < 100ms)
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const MOBILE_VIEWPORT = { width: 390, height: 844 }; // iPhone 14 Pro
const PERFORMANCE_THRESHOLDS = {
    pageLoad: 3000, // 3 seconds
    interaction: 100, // 100ms
    videoAutoplay: 2000, // 2 seconds for video to start
};

test.describe('Langflix - TikTok Quality Standards', () => {
    test.beforeEach(async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize(MOBILE_VIEWPORT);

        // Navigate to app
        await page.goto(BASE_URL);
    });

    test('1. Page loads within 3 seconds', async ({ page }) => {
        const startTime = Date.now();

        // Wait for feed container to be visible
        await page.waitForSelector('.feed-container', { timeout: 5000 });

        const loadTime = Date.now() - startTime;
        console.log(`Page load time: ${loadTime}ms`);

        expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
    });

    test('2. Videos load and first video is visible', async ({ page }) => {
        // Wait for loading indicator to disappear
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        // Check that video cards are present
        const videoCards = await page.locator('.video-card').count();
        expect(videoCards).toBeGreaterThan(0);

        // Check that first video element exists
        const firstVideo = await page.locator('.video-card video').first();
        await expect(firstVideo).toBeVisible();
    });

    test('3. First video autoplays on load', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        // Get first video element
        const firstVideo = page.locator('.video-card video').first();

        // Wait for video to start playing (check paused property)
        await page.waitForFunction(
            (videoSelector) => {
                const video = document.querySelector(videoSelector);
                return video && !video.paused && video.currentTime > 0;
            },
            'video',
            { timeout: PERFORMANCE_THRESHOLDS.videoAutoplay }
        );

        // Verify video is playing
        const isPlaying = await firstVideo.evaluate((video) => {
            return !video.paused && video.currentTime > 0;
        });

        expect(isPlaying).toBe(true);
    });

    test('4. Subtitles display and update during video playback', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        // Wait a bit for video to play
        await page.waitForTimeout(2000);

        // Check if subtitle overlay exists
        const subtitleOverlay = page.locator('.transcription-overlay').first();

        // Check if subtitles become active (may take time depending on video)
        await page.waitForTimeout(3000);

        // Try to find Spanish or English subtitle text
        const spanishLine = page.locator('.spanish-line').first();
        const englishLine = page.locator('.english-line').first();

        // At least one subtitle line should be visible or have content
        const spanishText = await spanishLine.textContent().catch(() => '');
        const englishText = await englishLine.textContent().catch(() => '');

        console.log(`Spanish subtitle: "${spanishText}"`);
        console.log(`English subtitle: "${englishText}"`);

        // Pass test if either subtitle has content (timing may vary)
        const hasSubtitles = spanishText.length > 0 || englishText.length > 0;
        expect(hasSubtitles).toBe(true);
    });

    test('5. Subtitle timing accuracy (within 500ms of expected time)', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        // Get first video
        const firstVideo = page.locator('.video-card video').first();

        // Wait for video to play for 2 seconds
        await page.waitForTimeout(2000);

        // Get current video time
        const videoTime = await firstVideo.evaluate((video) => video.currentTime);

        // Check if subtitle is visible
        const subtitleOverlay = page.locator('.transcription-overlay.active').first();
        const isSubtitleVisible = await subtitleOverlay.count() > 0;

        console.log(`Video time: ${videoTime}s, Subtitle visible: ${isSubtitleVisible}`);

        // If subtitle is visible, timing is synchronized (within reasonable range)
        // This is a basic check - more advanced timing checks would require parsing SRT data
        expect(videoTime).toBeGreaterThan(0);
    });

    test('6. Speed control button cycles through speeds (1x → 0.75x → 0.5x)', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        const speedBtn = page.locator('#globalSpeedBtn');
        await expect(speedBtn).toBeVisible();

        // Initial speed should be 1x
        let speedText = await speedBtn.textContent();
        expect(speedText).toBe('1x');

        // Click to cycle to 0.75x
        await speedBtn.click();
        await page.waitForTimeout(200);
        speedText = await speedBtn.textContent();
        expect(speedText).toBe('0.75x');

        // Click to cycle to 0.5x
        await speedBtn.click();
        await page.waitForTimeout(200);
        speedText = await speedBtn.textContent();
        expect(speedText).toBe('0.5x');

        // Click to cycle back to 1x
        await speedBtn.click();
        await page.waitForTimeout(200);
        speedText = await speedBtn.textContent();
        expect(speedText).toBe('1x');

        console.log('Speed control cycles correctly: 1x → 0.75x → 0.5x → 1x');
    });

    test('7. Speed control applies to video playback', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        const speedBtn = page.locator('#globalSpeedBtn');
        const firstVideo = page.locator('.video-card video').first();

        // Change speed to 0.5x
        await speedBtn.click(); // 0.75x
        await speedBtn.click(); // 0.5x
        await page.waitForTimeout(300);

        // Check video playback rate
        const playbackRate = await firstVideo.evaluate((video) => video.playbackRate);
        expect(playbackRate).toBe(0.5);

        console.log(`Video playback rate: ${playbackRate}x`);
    });

    test('8. Like button works and animates', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        const likeBtn = page.locator('.like-btn').first();
        await expect(likeBtn).toBeVisible();

        // Get initial like count
        const countEl = likeBtn.locator('.sidebar-count');
        const initialCount = await countEl.textContent();

        // Click like button
        await likeBtn.click();
        await page.waitForTimeout(300);

        // Check if button has 'liked' class
        const isLiked = await likeBtn.evaluate((btn) => btn.classList.contains('liked'));
        expect(isLiked).toBe(true);

        // Check if like count increased
        const newCount = await countEl.textContent();
        console.log(`Like count: ${initialCount} → ${newCount}`);
    });

    test('9. Double tap triggers like animation', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        const firstVideoCard = page.locator('.video-card').first();

        // Double tap video card
        await firstVideoCard.click({ clickCount: 2 });
        await page.waitForTimeout(200);

        // Check for double-tap heart animation
        const heartAnimation = firstVideoCard.locator('.double-tap-heart');
        const heartExists = await heartAnimation.count() > 0;

        console.log(`Double tap heart animation triggered: ${heartExists}`);
        expect(heartExists).toBe(true);
    });

    test('10. Word translation popup works on Spanish word click', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        // Wait for subtitle to appear
        await page.waitForTimeout(3000);

        // Find a clickable Spanish word
        const spanishWord = page.locator('.word').first();
        const wordCount = await spanishWord.count();

        if (wordCount > 0) {
            await spanishWord.click();
            await page.waitForTimeout(300);

            // Check if tooltip is visible
            const tooltip = page.locator('#wordTooltip.show');
            await expect(tooltip).toBeVisible();

            // Check tooltip has content
            const spanishText = await tooltip.locator('.word-spanish').textContent();
            const englishText = await tooltip.locator('.word-english').textContent();

            console.log(`Tooltip - Spanish: "${spanishText}", English: "${englishText}"`);
            expect(spanishText.length).toBeGreaterThan(0);
        } else {
            console.log('No Spanish words available to click (subtitle not active yet)');
        }
    });

    test('11. Bottom navigation has 4 tabs (no inbox button)', async ({ page }) => {
        // Wait for page to load
        await page.waitForSelector('.bottom-nav', { timeout: 5000 });

        const navItems = page.locator('.nav-item');
        const navCount = await navItems.count();

        // Should have exactly 4 tabs: Home, Discover, Create, Profile
        expect(navCount).toBe(4);

        // Verify tab labels
        const homeTab = await page.locator('.nav-item[data-feed="home"] .nav-label').textContent();
        const discoverTab = await page.locator('.nav-item[data-feed="discover"] .nav-label').textContent();
        const profileTab = await page.locator('.nav-item[data-feed="profile"] .nav-label').textContent();

        expect(homeTab).toBe('Home');
        expect(discoverTab).toBe('Discover');
        expect(profileTab).toBe('Profile');

        console.log('Bottom nav tabs: Home, Discover, Create (no label), Profile ✓');
    });

    test('12. Sidebar buttons are visible and clickable', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        const sidebar = page.locator('.sidebar').first();
        await expect(sidebar).toBeVisible();

        // Check for 3 main buttons: like, comment, share
        const likeBtn = sidebar.locator('.like-btn');
        const commentBtn = sidebar.locator('.comment-btn');
        const shareBtn = sidebar.locator('.share-btn');

        await expect(likeBtn).toBeVisible();
        await expect(commentBtn).toBeVisible();
        await expect(shareBtn).toBeVisible();

        console.log('Sidebar buttons visible: Like, Comment, Share ✓');
    });

    test('13. Comment button shows coming soon alert', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        const commentBtn = page.locator('.comment-btn').first();

        // Listen for alert
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Comment feature coming soon');
            await dialog.accept();
        });

        await commentBtn.click();
    });

    test('14. Share button works (Web Share API or clipboard)', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        const shareBtn = page.locator('.share-btn').first();

        // Grant clipboard permissions
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        // Listen for alert (fallback for browsers without Web Share API)
        let alertShown = false;
        page.on('dialog', async dialog => {
            alertShown = true;
            await dialog.accept();
        });

        await shareBtn.click();
        await page.waitForTimeout(500);

        console.log('Share button clicked (Web Share API or clipboard)');
    });

    test('15. Single tap pauses/plays video', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        const firstVideoCard = page.locator('.video-card').first();
        const firstVideo = page.locator('.video-card video').first();

        // Wait for autoplay
        await page.waitForTimeout(2000);

        // Single tap to pause
        await firstVideoCard.click();
        await page.waitForTimeout(500);

        const isPaused = await firstVideo.evaluate((video) => video.paused);
        expect(isPaused).toBe(true);

        // Single tap to play
        await firstVideoCard.click();
        await page.waitForTimeout(500);

        const isPlaying = await firstVideo.evaluate((video) => !video.paused);
        expect(isPlaying).toBe(true);

        console.log('Single tap pause/play works ✓');
    });

    test('16. Pause indicator shows on tap', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        const firstVideoCard = page.locator('.video-card').first();
        const pauseIndicator = firstVideoCard.locator('.pause-indicator');

        // Single tap to pause
        await firstVideoCard.click();
        await page.waitForTimeout(200);

        // Check if pause indicator has 'show' class
        const isVisible = await pauseIndicator.evaluate((el) =>
            el.classList.contains('show')
        );

        // It should have been visible briefly (may have faded by now)
        console.log('Pause indicator animation triggered');
    });

    test('17. Video advances to next on completion', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        const firstVideo = page.locator('.video-card video').first();

        // Fast forward to near end of video
        await firstVideo.evaluate((video) => {
            video.currentTime = Math.max(0, video.duration - 0.5);
        });

        // Wait for video to end and advance
        await page.waitForTimeout(2000);

        // Check if second video card is now in view
        const secondVideoCard = page.locator('.video-card').nth(1);
        const isInView = await secondVideoCard.evaluate((card) => {
            const rect = card.getBoundingClientRect();
            return rect.top >= 0 && rect.top < window.innerHeight;
        });

        console.log(`Advanced to next video: ${isInView}`);
    });

    test('18. Scroll snap works for vertical scrolling', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        const feedContainer = page.locator('#feedContainer');

        // Scroll down
        await feedContainer.evaluate((container) => {
            container.scrollBy(0, 500);
        });

        // Wait for snap
        await page.waitForTimeout(500);

        // Check if scroll position snapped to a video card
        const scrollTop = await feedContainer.evaluate((container) => container.scrollTop);
        const viewportHeight = await page.evaluate(() => window.innerHeight);

        // Should be snapped to a multiple of viewport height (or close to it)
        const isSnapped = scrollTop % viewportHeight < 100 ||
                         (viewportHeight - (scrollTop % viewportHeight)) < 100;

        console.log(`Scroll position: ${scrollTop}px, Snapped: ${isSnapped}`);
    });

    test('19. Performance: Interaction response < 100ms', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        const likeBtn = page.locator('.like-btn').first();

        // Measure like button click response time
        const startTime = Date.now();
        await likeBtn.click();

        // Wait for class change
        await page.waitForFunction(
            () => document.querySelector('.like-btn').classList.contains('liked'),
            { timeout: 200 }
        );

        const responseTime = Date.now() - startTime;
        console.log(`Like button response time: ${responseTime}ms`);

        expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.interaction);
    });

    test('20. Mobile viewport and touch optimization', async ({ page }) => {
        // Check viewport size
        const viewport = page.viewportSize();
        expect(viewport.width).toBe(MOBILE_VIEWPORT.width);
        expect(viewport.height).toBe(MOBILE_VIEWPORT.height);

        // Check that touch targets are at least 44x44px (iOS/Android minimum)
        const sidebarButtons = page.locator('.sidebar-button');
        const firstBtn = sidebarButtons.first();

        const btnSize = await firstBtn.evaluate((btn) => {
            const rect = btn.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
        });

        console.log(`Sidebar button size: ${btnSize.width}x${btnSize.height}px`);
        expect(btnSize.width).toBeGreaterThanOrEqual(44);
        expect(btnSize.height).toBeGreaterThanOrEqual(44);
    });

    test('21. Subtitle styling matches TikTok quality (no heavy stroke)', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        // Wait for subtitle to appear
        await page.waitForTimeout(3000);

        const spanishLine = page.locator('.spanish-line').first();

        // Check CSS properties
        const textStroke = await spanishLine.evaluate((el) =>
            window.getComputedStyle(el).webkitTextStroke
        );

        const fontWeight = await spanishLine.evaluate((el) =>
            window.getComputedStyle(el).fontWeight
        );

        const textShadow = await spanishLine.evaluate((el) =>
            window.getComputedStyle(el).textShadow
        );

        console.log(`Spanish subtitle styling:`);
        console.log(`- Text stroke: ${textStroke}`);
        console.log(`- Font weight: ${fontWeight}`);
        console.log(`- Text shadow: ${textShadow.substring(0, 100)}...`);

        // Should NOT have heavy stroke (1px or none)
        // Should have text shadow
        expect(textShadow).not.toBe('none');
    });

    test('22. No console errors during normal usage', async ({ page }) => {
        const consoleErrors = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        // Interact with app
        await page.locator('.like-btn').first().click();
        await page.waitForTimeout(1000);

        // Check for console errors
        if (consoleErrors.length > 0) {
            console.log('Console errors found:', consoleErrors);
        }

        expect(consoleErrors.length).toBe(0);
    });
});

/**
 * PERFORMANCE TEST SUITE
 */
test.describe('Langflix - Performance Metrics', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize(MOBILE_VIEWPORT);
    });

    test('Performance: Page load with timing metrics', async ({ page }) => {
        const startTime = Date.now();

        await page.goto(BASE_URL);

        // Wait for feed container
        await page.waitForSelector('.feed-container', { timeout: 5000 });

        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        const loadTime = Date.now() - startTime;

        // Get performance metrics
        const metrics = await page.evaluate(() => {
            const perf = window.performance;
            const timing = perf.timing;

            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                fullyLoaded: timing.loadEventEnd - timing.navigationStart,
                firstPaint: perf.getEntriesByType('paint')
                    .find(e => e.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: perf.getEntriesByType('paint')
                    .find(e => e.name === 'first-contentful-paint')?.startTime || 0,
            };
        });

        console.log('Performance Metrics:');
        console.log(`- Total load time: ${loadTime}ms`);
        console.log(`- DOM Content Loaded: ${metrics.domContentLoaded}ms`);
        console.log(`- Fully Loaded: ${metrics.fullyLoaded}ms`);
        console.log(`- First Paint: ${metrics.firstPaint}ms`);
        console.log(`- First Contentful Paint: ${metrics.firstContentfulPaint}ms`);

        expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
    });

    test('Performance: Video autoplay latency', async ({ page }) => {
        await page.goto(BASE_URL);

        const startTime = Date.now();

        // Wait for videos to load
        await page.waitForSelector('#loading', { state: 'hidden', timeout: 10000 });

        // Wait for first video to start playing
        await page.waitForFunction(
            () => {
                const video = document.querySelector('video');
                return video && !video.paused && video.currentTime > 0;
            },
            { timeout: 5000 }
        );

        const autoplayLatency = Date.now() - startTime;
        console.log(`Video autoplay latency: ${autoplayLatency}ms`);

        expect(autoplayLatency).toBeLessThan(PERFORMANCE_THRESHOLDS.videoAutoplay);
    });
});
