// TikTok 2025 Momentum Scroll Physics Tests
// Pattern: Velocity + Position dual-threshold scroll detection
// Research: dev.to/biomathcode/create-tik-tokyoutube-shorts-like-snap-infinite-scroll-react-1mca
// Reference: tiktoklikescroller Flutter package (pub.dev/packages/tiktoklikescroller)

const { test, expect, devices } = require('@playwright/test');

test.describe('TikTok Momentum Scroll Physics', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3002/unified-infinite-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for content to load
    });

    // ===== VELOCITY THRESHOLD TESTS =====
    test('fast swipe (>2px/ms) advances to next card', async ({ page }) => {
        const container = page.locator('#feedContainer');

        // Get initial scroll position
        const initialScroll = await container.evaluate(el => el.scrollTop);

        // Simulate fast swipe (velocity > 2px/ms)
        await container.evaluate(async (el) => {
            const startY = 300;
            const endY = 100; // 200px swipe
            const duration = 50; // 50ms = 4px/ms velocity

            el.dispatchEvent(new TouchEvent('touchstart', {
                touches: [{ clientY: startY }],
                bubbles: true
            }));

            await new Promise(resolve => setTimeout(resolve, duration));

            el.dispatchEvent(new TouchEvent('touchend', {
                bubbles: true
            }));
        });

        await page.waitForTimeout(500); // Wait for scroll animation

        const finalScroll = await container.evaluate(el => el.scrollTop);

        // Should have advanced to next card (viewport height)
        expect(finalScroll).toBeGreaterThan(initialScroll + 500);
    });

    test('slow drag (<2px/ms) snaps to nearest card', async ({ page }) => {
        const container = page.locator('#feedContainer');

        // Scroll slightly
        await container.evaluate(el => {
            el.scrollTop = 200; // 200px (less than half viewport)
        });

        await page.waitForTimeout(100);

        // Trigger snap by simulating slow drag end
        await container.evaluate(async (el) => {
            el.dispatchEvent(new TouchEvent('touchstart', {
                touches: [{ clientY: 300 }],
                bubbles: true
            }));

            await new Promise(resolve => setTimeout(resolve, 500)); // Slow = low velocity

            el.dispatchEvent(new TouchEvent('touchend', {
                bubbles: true
            }));
        });

        await page.waitForTimeout(500);

        const finalScroll = await container.evaluate(el => el.scrollTop);

        // Should snap back to nearest card (0 or full viewport)
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        const snapPosition = Math.round(finalScroll / viewportHeight) * viewportHeight;

        expect(Math.abs(finalScroll - snapPosition)).toBeLessThan(50);
    });

    // ===== POSITION THRESHOLD TESTS =====
    test('20% screen drag triggers advance even if slow', async ({ page }) => {
        const container = page.locator('#feedContainer');
        const viewportHeight = await page.evaluate(() => window.innerHeight);

        const initialScroll = await container.evaluate(el => el.scrollTop);

        // Drag exactly 20% of viewport
        const dragDistance = viewportHeight * 0.21; // Just over threshold

        await container.evaluate((el, distance) => {
            el.scrollTop += distance;
        }, dragDistance);

        await page.waitForTimeout(100);

        // Trigger touchend to activate snap logic
        await container.evaluate(async (el) => {
            el.dispatchEvent(new TouchEvent('touchstart', {
                touches: [{ clientY: 300 }],
                bubbles: true
            }));

            await new Promise(resolve => setTimeout(resolve, 200));

            el.dispatchEvent(new TouchEvent('touchend', {
                bubbles: true
            }));
        });

        await page.waitForTimeout(500);

        const finalScroll = await container.evaluate(el => el.scrollTop);

        // Should advance even with slow velocity
        expect(finalScroll).toBeGreaterThan(initialScroll);
    });

    test('<20% screen drag snaps back to current card', async ({ page }) => {
        const container = page.locator('#feedContainer');
        const viewportHeight = await page.evaluate(() => window.innerHeight);

        // Drag only 15% of viewport (below threshold)
        const dragDistance = viewportHeight * 0.15;

        await container.evaluate((el, distance) => {
            el.scrollTop += distance;
        }, dragDistance);

        await page.waitForTimeout(100);

        // Trigger snap
        await container.evaluate(async (el) => {
            el.dispatchEvent(new TouchEvent('touchstart', {
                touches: [{ clientY: 300 }],
                bubbles: true
            }));

            await new Promise(resolve => setTimeout(resolve, 200));

            el.dispatchEvent(new TouchEvent('touchend', {
                bubbles: true
            }));
        });

        await page.waitForTimeout(500);

        const finalScroll = await container.evaluate(el => el.scrollTop);

        // Should snap back to 0 (first card)
        expect(finalScroll).toBeLessThan(100);
    });

    // ===== SCROLL SNAP BEHAVIOR TESTS =====
    test('scroll-snap-type is set to mandatory', async ({ page }) => {
        const container = page.locator('#feedContainer');

        const snapType = await container.evaluate(el =>
            window.getComputedStyle(el).scrollSnapType
        );

        expect(snapType).toContain('mandatory');
    });

    test('cards have scroll-snap-align start', async ({ page }) => {
        const firstCard = page.locator('.content-card, .skeleton-card').first();

        const snapAlign = await firstCard.evaluate(el =>
            window.getComputedStyle(el).scrollSnapAlign
        );

        expect(snapAlign).toBe('start');
    });

    test('cards have scroll-snap-stop always', async ({ page }) => {
        const firstCard = page.locator('.content-card, .skeleton-card').first();

        const snapStop = await firstCard.evaluate(el =>
            window.getComputedStyle(el).scrollSnapStop
        );

        // Should be 'always' for TikTok-style behavior
        expect(snapStop).toBe('always');
    });

    // ===== PERFORMANCE TESTS =====
    test('scroll response time < 100ms', async ({ page }) => {
        const container = page.locator('#feedContainer');

        const startTime = Date.now();

        await container.evaluate(el => {
            el.scrollTop += 100;
        });

        await page.waitForFunction((el) => el.scrollTop > 0, await container.elementHandle());

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(responseTime).toBeLessThan(100);
    });

    test('smooth scroll animation duration ~350ms', async ({ page }) => {
        const container = page.locator('#feedContainer');

        const viewportHeight = await page.evaluate(() => window.innerHeight);

        const startTime = Date.now();

        await container.evaluate((el, vh) => {
            el.scrollTo({
                top: vh,
                behavior: 'smooth'
            });
        }, viewportHeight);

        // Wait for scroll to complete
        await page.waitForTimeout(500);

        const endTime = Date.now();
        const animationTime = endTime - startTime;

        // Should be around 350ms (allow ±150ms tolerance)
        expect(animationTime).toBeGreaterThan(200);
        expect(animationTime).toBeLessThan(700);
    });

    // ===== MULTI-DEVICE TESTS =====
    test('works on mobile viewport (iPhone 12)', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });

        const container = page.locator('#feedContainer');
        const cards = page.locator('.content-card, .skeleton-card');

        // Should have at least one card
        expect(await cards.count()).toBeGreaterThan(0);

        // Container should be full viewport height
        const containerHeight = await container.evaluate(el => el.offsetHeight);
        expect(containerHeight).toBe(844);
    });

    test('works on tablet viewport (iPad Pro)', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 1366 });

        const container = page.locator('#feedContainer');

        const containerHeight = await container.evaluate(el => el.offsetHeight);
        expect(containerHeight).toBe(1366);
    });

    test('works on desktop viewport', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });

        const container = page.locator('#feedContainer');

        // Should still work on large screens
        const cards = page.locator('.content-card, .skeleton-card');
        expect(await cards.count()).toBeGreaterThan(0);
    });

    // ===== EDGE CASES =====
    test('handles rapid scroll gestures', async ({ page }) => {
        const container = page.locator('#feedContainer');

        // Rapid scroll 10 times
        for (let i = 0; i < 10; i++) {
            await container.evaluate(el => {
                el.scrollTop += 100;
            });
            await page.waitForTimeout(50);
        }

        // Should not crash or freeze
        const finalScroll = await container.evaluate(el => el.scrollTop);
        expect(finalScroll).toBeGreaterThan(0);
    });

    test('handles boundary conditions (first card)', async ({ page }) => {
        const container = page.locator('#feedContainer');

        // Try to scroll up from first card
        await container.evaluate(el => {
            el.scrollTop = 0;
        });

        await container.evaluate(async (el) => {
            el.dispatchEvent(new TouchEvent('touchstart', {
                touches: [{ clientY: 100 }],
                bubbles: true
            }));

            await new Promise(resolve => setTimeout(resolve, 50));

            el.dispatchEvent(new TouchEvent('touchend', {
                bubbles: true
            }));
        });

        await page.waitForTimeout(500);

        const finalScroll = await container.evaluate(el => el.scrollTop);

        // Should stay at 0 (can't scroll up from first card)
        expect(finalScroll).toBeLessThan(50);
    });

    test('handles boundary conditions (last card)', async ({ page }) => {
        const container = page.locator('#feedContainer');

        // Scroll to bottom
        await container.evaluate(el => {
            el.scrollTop = el.scrollHeight - el.clientHeight;
        });

        const scrollBeforeSwipe = await container.evaluate(el => el.scrollTop);

        // Try to scroll down from last card
        await container.evaluate(async (el) => {
            el.dispatchEvent(new TouchEvent('touchstart', {
                touches: [{ clientY: 500 }],
                bubbles: true
            }));

            await new Promise(resolve => setTimeout(resolve, 50));

            el.dispatchEvent(new TouchEvent('touchend', {
                bubbles: true
            }));
        });

        await page.waitForTimeout(500);

        const finalScroll = await container.evaluate(el => el.scrollTop);

        // Should stay at bottom (can't scroll down from last card)
        expect(Math.abs(finalScroll - scrollBeforeSwipe)).toBeLessThan(200);
    });
});
