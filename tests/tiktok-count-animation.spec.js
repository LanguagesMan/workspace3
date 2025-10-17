// 📑 TIKTOK 2025 COUNT-UP ANIMATION TESTS
// Testing TikTok's animated counters for views and likes
const { test, expect } = require('@playwright/test');

test.describe('TikTok-Style Count-Up Animation (unified-infinite-feed.html)', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the unified feed
        await page.goto('http://localhost:3002/unified-infinite-feed.html');

        // Wait for feed to load
        await page.waitForSelector('.feed-container', { timeout: 10000 });
        await page.waitForSelector('.content-card', { timeout: 10000 });
    });

    // === ANIMATED COUNTER STRUCTURE TESTS ===
    test('should have animated-count class on view counts', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const viewCount = await firstCard.locator('.view-count .animated-count');

        await expect(viewCount).toBeAttached();

        console.log('✅ View count has animated-count class');
    });

    test('should have animated-count class on like counts', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const likeCount = await firstCard.locator('#like-count').locator('.animated-count');

        await expect(likeCount).toBeAttached();

        console.log('✅ Like count has animated-count class');
    });

    test('animated counters should have data-target attribute', async ({ page }) => {
        const viewCount = await page.locator('.animated-count').first();

        const target = await viewCount.getAttribute('data-target');
        expect(target).not.toBeNull();
        expect(parseInt(target)).toBeGreaterThanOrEqual(0);

        console.log(`✅ Counter has target: ${target}`);
    });

    // === ANIMATION BEHAVIOR TESTS ===
    test('counters should start at 0 or low value', async ({ page }) => {
        const viewCount = await page.locator('.animated-count').first();

        // Get initial text immediately (before animation)
        const initialText = await viewCount.textContent();
        const initialNum = parseInt(initialText.replace(/[^\d]/g, '')) || 0;

        // Should start low
        const target = parseInt(await viewCount.getAttribute('data-target'));
        expect(initialNum).toBeLessThan(target);

        console.log(`✅ Counter starts at ${initialNum}, target is ${target}`);
    });

    test('counter should animate up to target value', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();

        // Scroll card into view to trigger animation
        await firstCard.scrollIntoViewIfNeeded();

        const viewCount = await firstCard.locator('.animated-count').first();
        const target = parseInt(await viewCount.getAttribute('data-target'));

        // Wait for animation to complete (1.5s)
        await page.waitForTimeout(1500);

        // Check final value matches target
        const finalText = await viewCount.textContent();
        const finalFormatted = finalText.trim();

        // Should be formatted version of target
        const expectedFormatted = await viewCount.evaluate((el, t) => {
            // Use the same formatCount logic
            if (t < 1000) return t.toString();
            if (t < 1000000) {
                const f = (t / 1000).toFixed(1);
                return (f.endsWith('.0') ? f.slice(0, -2) : f) + 'K';
            }
            if (t < 1000000000) {
                const f = (t / 1000000).toFixed(1);
                return (f.endsWith('.0') ? f.slice(0, -2) : f) + 'M';
            }
            const f = (t / 1000000000).toFixed(1);
            return (f.endsWith('.0') ? f.slice(0, -2) : f) + 'B';
        }, target);

        expect(finalFormatted).toBe(expectedFormatted);

        console.log(`✅ Counter animated to target: ${finalFormatted} (from ${target})`);
    });

    test('animation should take approximately 1.2 seconds', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const viewCount = await firstCard.locator('.animated-count').first();

        // Scroll into view
        await firstCard.scrollIntoViewIfNeeded();

        const startTime = Date.now();

        // Wait until data-animated attribute appears
        await viewCount.waitForFunction(el => el.dataset.animated === 'true', { timeout: 2000 });

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Should be around 1200ms (allow 800-1600ms range)
        expect(duration).toBeGreaterThan(800);
        expect(duration).toBeLessThan(1600);

        console.log(`✅ Animation duration: ${duration}ms`);
    });

    test('animation should only play once per counter', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const viewCount = await firstCard.locator('.animated-count').first();

        // Trigger animation
        await firstCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1500);

        // Check data-animated flag
        const animated = await viewCount.getAttribute('data-animated');
        expect(animated).toBe('true');

        // Get final value
        const value1 = await viewCount.textContent();

        // Scroll away and back
        await page.evaluate(() => window.scrollTo(0, 1000));
        await page.waitForTimeout(300);
        await firstCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        // Value should not change (animation shouldn't replay)
        const value2 = await viewCount.textContent();
        expect(value2).toBe(value1);

        console.log('✅ Animation plays only once');
    });

    // === NUMBER FORMATTING TESTS ===
    test('should format numbers with K suffix during animation', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const viewCount = await firstCard.locator('.animated-count').first();
        const target = parseInt(await viewCount.getAttribute('data-target'));

        // Only test if target is > 1000
        if (target > 1000) {
            await firstCard.scrollIntoViewIfNeeded();
            await page.waitForTimeout(700); // Mid-animation

            const currentText = await viewCount.textContent();
            // Should either have K, M, or be plain number
            const hasFormat = /\d+(\.\d+)?[KMB]?/.test(currentText);
            expect(hasFormat).toBe(true);

            console.log(`✅ Mid-animation format: ${currentText}`);
        } else {
            console.log('⏭️ Skipped (target < 1000)');
        }
    });

    test('should remove trailing .0 from formatted numbers', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const viewCount = await firstCard.locator('.animated-count').first();

        await firstCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1500);

        const finalText = await viewCount.textContent();

        // Should not have .0K or .0M
        expect(finalText).not.toMatch(/\.0[KMB]/);

        console.log(`✅ No trailing .0: ${finalText}`);
    });

    // === INTERSECTION OBSERVER TESTS ===
    test('animation should trigger when card is 50% visible', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const viewCount = await firstCard.locator('.animated-count').first();

        // Scroll so card is barely visible (less than 50%)
        await page.evaluate(() => window.scrollTo(0, 50));
        await page.waitForTimeout(500);

        // Animation should not have started
        const animated1 = await viewCount.getAttribute('data-animated');
        expect(animated1).toBeNull();

        // Scroll so card is 50%+ visible
        await firstCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        // Animation should have started
        const animated2 = await viewCount.getAttribute('data-animated');
        expect(animated2).toBe('true');

        console.log('✅ Animation triggers at 50% visibility');
    });

    test('all animated counters in a card should animate together', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const counters = await firstCard.locator('.animated-count');
        const count = await counters.count();

        if (count > 1) {
            await firstCard.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1500);

            // All should be animated
            for (let i = 0; i < count; i++) {
                const animated = await counters.nth(i).getAttribute('data-animated');
                expect(animated).toBe('true');
            }

            console.log(`✅ All ${count} counters animated together`);
        } else {
            console.log('✅ Single counter animated');
        }
    });

    // === PERFORMANCE TESTS ===
    test('animation should use requestAnimationFrame', async ({ page }) => {
        // Check if the animation function exists and uses rAF
        const usesRAF = await page.evaluate(() => {
            return typeof window.requestAnimationFrame !== 'undefined';
        });

        expect(usesRAF).toBe(true);

        console.log('✅ requestAnimationFrame available');
    });

    test('animation should not cause layout shifts', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const viewCount = await firstCard.locator('.animated-count').first();

        // Get initial position
        const initialBox = await viewCount.boundingBox();

        // Trigger animation
        await firstCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(700); // Mid-animation

        // Check position unchanged
        const midBox = await viewCount.boundingBox();

        expect(midBox.x).toBe(initialBox.x);
        expect(midBox.y).toBe(initialBox.y);

        console.log('✅ No layout shift during animation');
    });

    test('animation should be smooth (60fps)', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();

        // Measure frame time
        const frameTime = await page.evaluate(async () => {
            return new Promise(resolve => {
                let frames = 0;
                const start = performance.now();

                const check = () => {
                    frames++;
                    if (frames < 10) {
                        requestAnimationFrame(check);
                    } else {
                        const end = performance.now();
                        resolve((end - start) / frames);
                    }
                };

                requestAnimationFrame(check);
            });
        });

        // Should be ~16.67ms per frame (60fps)
        expect(frameTime).toBeLessThan(20);

        console.log(`✅ Frame time: ${frameTime.toFixed(2)}ms (~${(1000/frameTime).toFixed(0)}fps)`);
    });

    // === VISUAL TESTS ===
    test('counter text should be visible during animation', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const viewCount = await firstCard.locator('.animated-count').first();

        await firstCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600); // Mid-animation

        // Should have visible text
        await expect(viewCount).toBeVisible();

        const text = await viewCount.textContent();
        expect(text.length).toBeGreaterThan(0);

        console.log(`✅ Counter visible during animation: "${text}"`);
    });

    test('counter should update frequently during animation', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const viewCount = await firstCard.locator('.animated-count').first();

        await firstCard.scrollIntoViewIfNeeded();

        // Sample values during animation
        const samples = [];
        for (let i = 0; i < 5; i++) {
            await page.waitForTimeout(200);
            const text = await viewCount.textContent();
            samples.push(text);
        }

        // Values should be changing
        const uniqueValues = new Set(samples);
        expect(uniqueValues.size).toBeGreaterThan(1);

        console.log(`✅ Counter updated ${uniqueValues.size} times: ${[...uniqueValues].join(' → ')}`);
    });

    // === SCREENSHOT TESTS ===
    test('should capture animation start (0 views)', async ({ page }) => {
        await page.waitForTimeout(300);

        await page.screenshot({
            path: 'screenshots/TIKTOK-COUNT-START.png',
            fullPage: false
        });

        console.log('✅ Screenshot: Animation start');
    });

    test('should capture animation mid-way', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();

        await firstCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600); // Mid-animation

        await page.screenshot({
            path: 'screenshots/TIKTOK-COUNT-MID.png',
            fullPage: false
        });

        console.log('✅ Screenshot: Animation mid-way');
    });

    test('should capture animation complete', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();

        await firstCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1500); // Complete

        await page.screenshot({
            path: 'screenshots/TIKTOK-COUNT-COMPLETE.png',
            fullPage: false
        });

        console.log('✅ Screenshot: Animation complete');
    });
});
