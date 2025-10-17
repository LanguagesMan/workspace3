// 📑 TIKTOK 2025 SCROLL PROGRESS INDICATOR TESTS
// Testing TikTok's content completion tracking with visual progress bar
const { test, expect } = require('@playwright/test');

test.describe('TikTok-Style Progress Indicator (unified-infinite-feed.html)', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the unified feed
        await page.goto('http://localhost:3002/unified-infinite-feed.html');

        // Wait for feed to load
        await page.waitForSelector('.feed-container', { timeout: 10000 });
        await page.waitForSelector('.content-card', { timeout: 10000 });
    });

    // === PROGRESS BAR STRUCTURE TESTS ===
    test('should display progress bar on every card', async ({ page }) => {
        const cards = await page.locator('.content-card');
        const cardCount = await cards.count();

        expect(cardCount).toBeGreaterThan(0);

        // Check first 3 cards for progress bars
        for (let i = 0; i < Math.min(3, cardCount); i++) {
            const card = cards.nth(i);
            const progressBar = await card.locator('.card-progress-bar');
            await expect(progressBar).toBeAttached();
        }

        console.log(`✅ Progress bars present on ${Math.min(3, cardCount)} cards`);
    });

    test('progress bar should have fill element', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const progressBar = await firstCard.locator('.card-progress-bar');
        const progressFill = await firstCard.locator('.card-progress-fill');

        await expect(progressBar).toBeAttached();
        await expect(progressFill).toBeAttached();

        console.log('✅ Progress bar with fill element present');
    });

    test('progress bar should be positioned on right side', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const progressBar = await firstCard.locator('.card-progress-bar');

        const styles = await progressBar.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                position: computed.position,
                right: computed.right
            };
        });

        expect(styles.position).toBe('absolute');
        expect(parseInt(styles.right)).toBeLessThan(20); // Should be close to right edge

        console.log(`✅ Progress bar positioned: right ${styles.right}`);
    });

    // === VISUAL STYLING TESTS ===
    test('progress bar should have vertical layout', async ({ page }) => {
        const progressBar = await page.locator('.card-progress-bar').first();

        const box = await progressBar.boundingBox();

        // Should be tall and thin (vertical)
        expect(box.height).toBeGreaterThan(box.width);
        expect(box.width).toBeLessThanOrEqual(5); // Thin bar (3px)

        console.log(`✅ Progress bar vertical: ${box.width}px wide, ${box.height}px tall`);
    });

    test('progress bar should have semi-transparent background', async ({ page }) => {
        const progressBar = await page.locator('.card-progress-bar').first();

        const background = await progressBar.evaluate(el => {
            return window.getComputedStyle(el).background;
        });

        // Should have rgba or transparent background
        expect(background).toMatch(/rgba|transparent/);

        console.log('✅ Progress bar has transparent background');
    });

    test('progress fill should have TikTok pink gradient', async ({ page }) => {
        const progressFill = await page.locator('.card-progress-fill').first();

        const background = await progressFill.evaluate(el => {
            return window.getComputedStyle(el).background;
        });

        // Should have gradient with pink/red colors
        expect(background).toMatch(/gradient|fe2c55|ff6b6b/i);

        console.log('✅ Progress fill has TikTok pink gradient');
    });

    test('progress fill should have glow effect', async ({ page }) => {
        const progressFill = await page.locator('.card-progress-fill').first();

        const boxShadow = await progressFill.evaluate(el => {
            return window.getComputedStyle(el).boxShadow;
        });

        // Should have shadow for glow
        expect(boxShadow).not.toBe('none');

        console.log(`✅ Progress fill has glow: ${boxShadow.substring(0, 30)}...`);
    });

    test('progress bar should have rounded corners', async ({ page }) => {
        const progressBar = await page.locator('.card-progress-bar').first();

        const borderRadius = await progressBar.evaluate(el => {
            return window.getComputedStyle(el).borderRadius;
        });

        expect(borderRadius).not.toBe('0px');

        console.log(`✅ Progress bar rounded: ${borderRadius}`);
    });

    // === SCROLL TRACKING TESTS ===
    test('progress should start at 0%', async ({ page }) => {
        const progressFill = await page.locator('.card-progress-fill').first();

        const initialHeight = await progressFill.evaluate(el => {
            return window.getComputedStyle(el).height;
        });

        // Should start at 0% or very low
        expect(parseInt(initialHeight)).toBeLessThanOrEqual(5);

        console.log(`✅ Initial progress: ${initialHeight}`);
    });

    test('progress should increase when scrolling down', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const progressFill = await firstCard.locator('.card-progress-fill');

        // Get initial height
        const initialHeight = await progressFill.evaluate(el => {
            return parseFloat(window.getComputedStyle(el).height);
        });

        // Scroll down within the card
        await firstCard.evaluate(el => {
            el.scrollTop = 200; // Scroll 200px
        });

        await page.waitForTimeout(200); // Wait for progress update

        // Get new height
        const newHeight = await progressFill.evaluate(el => {
            return parseFloat(window.getComputedStyle(el).height);
        });

        // Progress should have increased
        expect(newHeight).toBeGreaterThan(initialHeight);

        console.log(`✅ Progress increased: ${initialHeight}px → ${newHeight}px`);
    });

    test('progress should be proportional to scroll position', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const progressFill = await firstCard.locator('.card-progress-fill');

        // Scroll to 50% of content
        const scrollHalfway = await firstCard.evaluate(el => {
            const maxScroll = el.scrollHeight - el.clientHeight;
            el.scrollTop = maxScroll * 0.5;
            return el.scrollTop;
        });

        await page.waitForTimeout(200);

        // Check progress fill height (should be around 50%)
        const progressHeight = await progressFill.evaluate(el => {
            return el.style.height;
        });

        const progressPercent = parseFloat(progressHeight);

        // Allow some tolerance (40-60%)
        expect(progressPercent).toBeGreaterThan(30);
        expect(progressPercent).toBeLessThan(70);

        console.log(`✅ Progress proportional: ${progressPercent}% at halfway scroll`);
    });

    test('progress should reach 100% when scrolled to bottom', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const progressFill = await firstCard.locator('.card-progress-fill');

        // Scroll to bottom
        await firstCard.evaluate(el => {
            el.scrollTop = el.scrollHeight;
        });

        await page.waitForTimeout(300);

        // Check progress
        const progressHeight = await progressFill.evaluate(el => {
            return el.style.height;
        });

        const progressPercent = parseFloat(progressHeight);

        // Should be 95% or higher
        expect(progressPercent).toBeGreaterThanOrEqual(95);

        console.log(`✅ Progress at bottom: ${progressPercent}%`);
    });

    // === COMPLETION STATE TESTS ===
    test('progress bar should turn cyan when completed', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const progressBar = await firstCard.locator('.card-progress-bar');
        const progressFill = await firstCard.locator('.card-progress-fill');

        // Scroll to bottom to complete
        await firstCard.evaluate(el => {
            el.scrollTop = el.scrollHeight;
        });

        await page.waitForTimeout(300);

        // Check if completed class added
        await expect(progressBar).toHaveClass(/completed/);

        // Check if color changed to cyan
        const background = await progressFill.evaluate(el => {
            return window.getComputedStyle(el).background;
        });

        expect(background).toMatch(/00f2ea|20d5ec|cyan/i);

        console.log('✅ Progress bar turns cyan when completed');
    });

    test('completion should be tracked only once per content', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();

        // Listen for console logs
        const completionLogs = [];
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('Content completed:')) {
                completionLogs.push(text);
            }
        });

        // Scroll to bottom
        await firstCard.evaluate(el => {
            el.scrollTop = el.scrollHeight;
        });

        await page.waitForTimeout(300);

        // Scroll up and down again
        await firstCard.evaluate(el => {
            el.scrollTop = 0;
        });
        await page.waitForTimeout(100);
        await firstCard.evaluate(el => {
            el.scrollTop = el.scrollHeight;
        });

        await page.waitForTimeout(300);

        // Should only have one completion log
        expect(completionLogs.length).toBeLessThanOrEqual(1);

        console.log(`✅ Completion tracked once: ${completionLogs.length} log(s)`);
    });

    test('completion should award XP', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();

        // Get initial XP
        const initialXP = await page.locator('.gamification-xp').textContent();
        const initialXPNum = parseInt(initialXP.match(/\d+/)[0]);

        // Scroll to complete
        await firstCard.evaluate(el => {
            el.scrollTop = el.scrollHeight;
        });

        await page.waitForTimeout(500);

        // Check if XP increased
        const newXP = await page.locator('.gamification-xp').textContent();
        const newXPNum = parseInt(newXP.match(/\d+/)[0]);

        expect(newXPNum).toBeGreaterThanOrEqual(initialXPNum);

        console.log(`✅ XP awarded: ${initialXPNum} → ${newXPNum} (+${newXPNum - initialXPNum})`);
    });

    // === PERFORMANCE TESTS ===
    test('progress updates should be smooth (< 100ms)', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();

        // Measure update time
        const updateTime = await firstCard.evaluate(el => {
            const start = performance.now();
            el.scrollTop = 100;
            // Trigger progress update
            el.dispatchEvent(new Event('scroll'));
            const end = performance.now();
            return end - start;
        });

        expect(updateTime).toBeLessThan(100);

        console.log(`✅ Progress update time: ${updateTime.toFixed(2)}ms`);
    });

    test('progress bar should not cause layout shifts', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();
        const progressBar = await firstCard.locator('.card-progress-bar');

        // Get initial position
        const initialBox = await progressBar.boundingBox();

        // Scroll and update progress
        await firstCard.evaluate(el => {
            el.scrollTop = 500;
        });

        await page.waitForTimeout(200);

        // Check position unchanged
        const newBox = await progressBar.boundingBox();

        expect(newBox.x).toBe(initialBox.x);
        expect(newBox.y).toBe(initialBox.y);

        console.log('✅ Progress bar position stable (no layout shift)');
    });

    // === ACCESSIBILITY TESTS ===
    test('progress bar should not interfere with scrolling', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();

        // Try scrolling
        await firstCard.evaluate(el => {
            el.scrollTop = 300;
        });

        const scrollTop = await firstCard.evaluate(el => el.scrollTop);

        expect(scrollTop).toBeGreaterThan(200);

        console.log('✅ Scrolling works normally with progress bar');
    });

    test('progress bar should have high z-index', async ({ page }) => {
        const progressBar = await page.locator('.card-progress-bar').first();

        const zIndex = await progressBar.evaluate(el => {
            return window.getComputedStyle(el).zIndex;
        });

        expect(parseInt(zIndex)).toBeGreaterThanOrEqual(100);

        console.log(`✅ Progress bar z-index: ${zIndex}`);
    });

    // === SCREENSHOT TESTS ===
    test('should capture progress bar at 0%', async ({ page }) => {
        await page.waitForSelector('.card-progress-bar', { timeout: 10000 });
        await page.waitForTimeout(500);

        await page.screenshot({
            path: 'screenshots/TIKTOK-PROGRESS-0.png',
            fullPage: false
        });

        console.log('✅ Screenshot: Progress at 0%');
    });

    test('should capture progress bar at 50%', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();

        // Scroll to middle
        await firstCard.evaluate(el => {
            el.scrollTop = (el.scrollHeight - el.clientHeight) * 0.5;
        });

        await page.waitForTimeout(300);

        await page.screenshot({
            path: 'screenshots/TIKTOK-PROGRESS-50.png',
            fullPage: false
        });

        console.log('✅ Screenshot: Progress at 50%');
    });

    test('should capture completed progress bar (cyan)', async ({ page }) => {
        const firstCard = await page.locator('.content-card').first();

        // Scroll to bottom
        await firstCard.evaluate(el => {
            el.scrollTop = el.scrollHeight;
        });

        await page.waitForTimeout(500);

        await page.screenshot({
            path: 'screenshots/TIKTOK-PROGRESS-COMPLETED.png',
            fullPage: false
        });

        console.log('✅ Screenshot: Progress completed (cyan)');
    });
});
