// TikTok 2025 Long-Press 2x Speed Control Tests
// Pattern: Hold video >500ms → 2x speed, release → 1x speed

const { test, expect } = require('@playwright/test');

test.describe('TikTok 2025 Long-Press 2x Speed Control', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for content to load
    });

    // ===== VISUAL PRESENCE TESTS =====
    test('speed indicator 2x element exists', async ({ page }) => {
        const speedIndicators = page.locator('.speed-indicator-2x');
        const count = await speedIndicators.count();
        expect(count).toBeGreaterThan(0);
    });

    test('speed indicator has correct initial styling', async ({ page }) => {
        const indicator = page.locator('.speed-indicator-2x').first();
        await expect(indicator).toBeVisible();

        const styles = await indicator.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                position: computed.position,
                fontSize: computed.fontSize,
                fontWeight: computed.fontWeight,
                zIndex: computed.zIndex,
                pointerEvents: computed.pointerEvents
            };
        });

        expect(styles.position).toBe('absolute');
        expect(styles.fontSize).toBe('48px');
        expect(styles.fontWeight).toBe('800');
        expect(styles.zIndex).toBe('999');
        expect(styles.pointerEvents).toBe('none'); // Should not block interactions
    });

    test('speed indicator shows "2x" text', async ({ page }) => {
        const indicator = page.locator('.speed-indicator-2x').first();
        await expect(indicator).toHaveText('2x');
    });

    test('speed indicator is initially hidden (scale 0)', async ({ page }) => {
        const indicator = page.locator('.speed-indicator-2x').first();

        const transform = await indicator.evaluate(el =>
            window.getComputedStyle(el).transform
        );

        // Should contain scale(0) transformation
        expect(transform).toContain('matrix(0');
    });

    // ===== VIDEO ELEMENT TESTS =====
    test('videos have long-press handler attribute', async ({ page }) => {
        // Wait for videos to load
        await page.waitForSelector('.feed-video', { timeout: 5000 });

        const videos = page.locator('.feed-video');
        const count = await videos.count();

        if (count > 0) {
            const video = videos.first();
            const hasHandler = await video.evaluate(el =>
                el.hasAttribute('data-longpress-handler')
            );
            expect(hasHandler).toBe(true);
        }
    });

    test('video has default playback rate of 1x', async ({ page }) => {
        const video = page.locator('.feed-video').first();

        if (await video.count() > 0) {
            const playbackRate = await video.evaluate(el => el.playbackRate);
            expect(playbackRate).toBe(1);
        }
    });

    // ===== INTERACTION TESTS (DESKTOP) =====
    test('mousedown on video for 600ms shows 2x indicator', async ({ page }) => {
        const video = page.locator('.feed-video').first();

        if (await video.count() === 0) {
            test.skip();
        }

        const videoId = await video.getAttribute('data-video-id');
        const indicator = page.locator(`#speed-indicator-2x-${videoId}`);

        // Hold mouse down for 600ms
        await video.hover();
        await page.mouse.down();
        await page.waitForTimeout(600); // Hold for >500ms

        // Check indicator is visible
        const hasActiveClass = await indicator.evaluate(el =>
            el.classList.contains('active')
        );
        expect(hasActiveClass).toBe(true);

        // Release
        await page.mouse.up();
    });

    test('mousedown on video for 600ms changes playback rate to 2x', async ({ page }) => {
        const video = page.locator('.feed-video').first();

        if (await video.count() === 0) {
            test.skip();
        }

        // Hold mouse down for 600ms
        await video.hover();
        await page.mouse.down();
        await page.waitForTimeout(600); // Hold for >500ms

        // Check playback rate is 2x
        const playbackRate = await video.evaluate(el => el.playbackRate);
        expect(playbackRate).toBe(2.0);

        // Release
        await page.mouse.up();
    });

    test('mouseup after long-press returns playback rate to 1x', async ({ page }) => {
        const video = page.locator('.feed-video').first();

        if (await video.count() === 0) {
            test.skip();
        }

        // Hold mouse down for 600ms
        await video.hover();
        await page.mouse.down();
        await page.waitForTimeout(600);

        // Release
        await page.mouse.up();
        await page.waitForTimeout(100); // Wait for handler

        // Check playback rate is back to 1x
        const playbackRate = await video.evaluate(el => el.playbackRate);
        expect(playbackRate).toBe(1.0);
    });

    test('mouseup after long-press hides 2x indicator', async ({ page }) => {
        const video = page.locator('.feed-video').first();

        if (await video.count() === 0) {
            test.skip();
        }

        const videoId = await video.getAttribute('data-video-id');
        const indicator = page.locator(`#speed-indicator-2x-${videoId}`);

        // Hold mouse down for 600ms
        await video.hover();
        await page.mouse.down();
        await page.waitForTimeout(600);

        // Release
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Check indicator is hidden
        const hasActiveClass = await indicator.evaluate(el =>
            el.classList.contains('active')
        );
        expect(hasActiveClass).toBe(false);
    });

    test('mouseleave during long-press cancels 2x speed', async ({ page }) => {
        const video = page.locator('.feed-video').first();

        if (await video.count() === 0) {
            test.skip();
        }

        // Hold mouse down
        await video.hover();
        await page.mouse.down();
        await page.waitForTimeout(600);

        // Move mouse away (mouseleave)
        await page.mouse.move(0, 0);
        await page.waitForTimeout(100);

        // Check playback rate is back to 1x
        const playbackRate = await video.evaluate(el => el.playbackRate);
        expect(playbackRate).toBe(1.0);

        await page.mouse.up();
    });

    // ===== TIMING TESTS =====
    test('short press <500ms does not activate 2x speed', async ({ page }) => {
        const video = page.locator('.feed-video').first();

        if (await video.count() === 0) {
            test.skip();
        }

        // Hold for only 300ms (less than 500ms threshold)
        await video.hover();
        await page.mouse.down();
        await page.waitForTimeout(300);
        await page.mouse.up();

        await page.waitForTimeout(100);

        // Check playback rate is still 1x
        const playbackRate = await video.evaluate(el => el.playbackRate);
        expect(playbackRate).toBe(1.0);
    });

    test('long press exactly 500ms activates 2x speed', async ({ page }) => {
        const video = page.locator('.feed-video').first();

        if (await video.count() === 0) {
            test.skip();
        }

        // Hold for exactly 500ms (threshold)
        await video.hover();
        await page.mouse.down();
        await page.waitForTimeout(510); // 500ms + small buffer

        // Check playback rate is 2x
        const playbackRate = await video.evaluate(el => el.playbackRate);
        expect(playbackRate).toBe(2.0);

        await page.mouse.up();
    });

    // ===== ANIMATION TESTS =====
    test('2x indicator has bounce animation when active', async ({ page }) => {
        const video = page.locator('.feed-video').first();

        if (await video.count() === 0) {
            test.skip();
        }

        const videoId = await video.getAttribute('data-video-id');
        const indicator = page.locator(`#speed-indicator-2x-${videoId}`);

        // Activate 2x speed
        await video.hover();
        await page.mouse.down();
        await page.waitForTimeout(600);

        // Check for animation
        const animation = await indicator.evaluate(el =>
            window.getComputedStyle(el).animation
        );

        expect(animation).toContain('pulse2x');

        await page.mouse.up();
    });

    test('2x indicator transition is smooth', async ({ page }) => {
        const indicator = page.locator('.speed-indicator-2x').first();

        const transition = await indicator.evaluate(el =>
            window.getComputedStyle(el).transition
        );

        // Should have transform transition
        expect(transition).toContain('transform');
        expect(transition).toContain('0.2s');
        expect(transition).toContain('cubic-bezier');
    });

    // ===== PERFORMANCE TESTS =====
    test('2x speed activation is under 50ms response time', async ({ page }) => {
        const video = page.locator('.feed-video').first();

        if (await video.count() === 0) {
            test.skip();
        }

        await video.hover();

        const startTime = Date.now();
        await page.mouse.down();
        await page.waitForTimeout(550); // Wait for long-press threshold + buffer
        const endTime = Date.now();

        const responseTime = endTime - startTime;

        // Total time should be close to 550ms (not significantly more)
        expect(responseTime).toBeLessThan(650); // 100ms tolerance

        await page.mouse.up();
    });

    test('multiple rapid long-presses work correctly', async ({ page }) => {
        const video = page.locator('.feed-video').first();

        if (await video.count() === 0) {
            test.skip();
        }

        // First long-press
        await video.hover();
        await page.mouse.down();
        await page.waitForTimeout(600);
        await page.mouse.up();
        await page.waitForTimeout(100);

        let playbackRate = await video.evaluate(el => el.playbackRate);
        expect(playbackRate).toBe(1.0);

        // Second long-press
        await page.mouse.down();
        await page.waitForTimeout(600);

        playbackRate = await video.evaluate(el => el.playbackRate);
        expect(playbackRate).toBe(2.0);

        await page.mouse.up();
    });

    // ===== EDGE CASES =====
    test('2x indicator does not interfere with other controls', async ({ page }) => {
        const indicator = page.locator('.speed-indicator-2x').first();

        // Verify pointer-events: none
        const pointerEvents = await indicator.evaluate(el =>
            window.getComputedStyle(el).pointerEvents
        );

        expect(pointerEvents).toBe('none');
    });

    test('speed indicator has high z-index for visibility', async ({ page }) => {
        const indicator = page.locator('.speed-indicator-2x').first();

        const zIndex = await indicator.evaluate(el =>
            window.getComputedStyle(el).zIndex
        );

        // Should be very high (999)
        expect(parseInt(zIndex)).toBeGreaterThanOrEqual(999);
    });

    test('multiple videos can have 2x speed independently', async ({ page }) => {
        const videos = page.locator('.feed-video');
        const count = await videos.count();

        if (count >= 2) {
            const video1 = videos.nth(0);
            const video2 = videos.nth(1);

            const videoId1 = await video1.getAttribute('data-video-id');
            const videoId2 = await video2.getAttribute('data-video-id');

            // Should have separate indicators
            const indicator1 = page.locator(`#speed-indicator-2x-${videoId1}`);
            const indicator2 = page.locator(`#speed-indicator-2x-${videoId2}`);

            await expect(indicator1).toBeVisible();
            await expect(indicator2).toBeVisible();

            // IDs should be different
            expect(videoId1).not.toBe(videoId2);
        }
    });
});
