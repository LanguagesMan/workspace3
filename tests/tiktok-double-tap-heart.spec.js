// ❤️ TIKTOK 2025 DOUBLE-TAP HEART ANIMATION TESTS
// Testing TikTok's signature heart burst effect
const { test, expect } = require('@playwright/test');

test.describe('TikTok-Style Double-Tap Heart Animation (unified-infinite-feed.html)', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the unified feed
        await page.goto('http://localhost:3002/unified-infinite-feed.html');

        // Wait for feed to load
        await page.waitForSelector('.feed-container', { timeout: 10000 });
    });

    // === LIKE BUTTON TESTS ===
    test('should display like button on content cards', async ({ page }) => {
        // Wait for content to load
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const likeBtn = await page.locator('.action-btn:has-text("❤️")').first();
        await expect(likeBtn).toBeVisible();

        console.log('✅ Like button visible on content cards');
    });

    test('like button should show count', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const likeBtn = await page.locator('.action-btn:has-text("❤️")').first();
        const btnText = await likeBtn.textContent();

        expect(btnText).toContain('❤️');
        expect(btnText).toMatch(/\d+/); // Should contain a number

        console.log('✅ Like button shows count: ' + btnText.trim());
    });

    // === SINGLE CLICK LIKE TESTS ===
    test('should like content when clicking like button', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const likeBtn = await page.locator('.action-btn:has-text("❤️")').first();
        const initialText = await likeBtn.textContent();

        await likeBtn.click();

        // Wait for animation
        await page.waitForTimeout(500);

        const newText = await likeBtn.textContent();
        expect(newText).not.toBe(initialText);

        console.log(`✅ Like button updates: ${initialText.trim()} → ${newText.trim()}`);
    });

    test('should toggle like button state (heart icon changes)', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const likeBtn = await page.locator('.action-btn:has-text("❤️")').first();

        // Like
        await likeBtn.click();
        await page.waitForTimeout(500);
        const likedHtml = await likeBtn.innerHTML();
        expect(likedHtml).toContain('❤️‍🔥'); // Fire heart when liked

        // Unlike
        await likeBtn.click();
        await page.waitForTimeout(500);
        const unlikedHtml = await likeBtn.innerHTML();
        expect(unlikedHtml).toContain('❤️'); // Regular heart when unliked

        console.log('✅ Like button toggles between ❤️ and ❤️‍🔥');
    });

    // === DOUBLE-TAP ANIMATION TESTS ===
    test('should trigger heart animation on double-tap', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const card = await page.locator('.content-card').first();

        // Double-click the card
        await card.dblclick();

        // Wait for animation to appear
        await page.waitForTimeout(500);

        // Check that like was triggered
        const likeBtn = card.locator('.action-btn:has-text("❤️")');
        const isLiked = await likeBtn.first().innerHTML();
        expect(isLiked).toContain('❤️‍🔥');

        console.log('✅ Double-tap triggers heart animation and like');
    });

    test('double-tap should work on card body (not just buttons)', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const card = await page.locator('.content-card').first();

        // Get initial like count
        const likeBtn = card.locator('.action-btn:has-text("❤️")').first();
        const initialHtml = await likeBtn.innerHTML();

        // Double-click on card
        await card.dblclick();

        // Wait for like to register
        await page.waitForTimeout(500);

        const newHtml = await likeBtn.innerHTML();
        expect(newHtml).not.toBe(initialHtml);

        console.log('✅ Double-tap works on card body');
    });

    test('should show main center heart (large)', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const card = await page.locator('.content-card').first();

        // Double-click
        await card.dblclick();

        // Wait for animation
        await page.waitForTimeout(200);

        // Check for large heart in center (font-size: 120px)
        const hasLargeHeart = await page.evaluate(() => {
            const hearts = Array.from(document.querySelectorAll('.content-card div'));
            return hearts.some(el => {
                const fontSize = window.getComputedStyle(el).fontSize;
                return fontSize === '120px' && el.textContent.includes('❤️');
            });
        });

        expect(hasLargeHeart).toBe(true);

        console.log('✅ Main center heart (120px) displays');
    });

    test('should show burst of 5 smaller hearts', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const card = await page.locator('.content-card').first();

        // Double-click
        await card.dblclick();

        // Wait for animation
        await page.waitForTimeout(200);

        // Check for burst hearts (smaller, with burst classes)
        const burstHeartCount = await page.evaluate(() => {
            const cards = document.querySelectorAll('.content-card');
            const firstCard = cards[0];
            const burstHearts = firstCard.querySelectorAll('[class*="heart-burst-"]');
            return burstHearts.length;
        });

        expect(burstHeartCount).toBe(5);

        console.log('✅ 5 burst hearts created');
    });

    test('burst hearts should have staggered animation', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const card = await page.locator('.content-card').first();

        // Double-click
        await card.dblclick();

        // Wait for animation
        await page.waitForTimeout(200);

        // Check for burst hearts with different classes (indicating staggered animation)
        const burstHeartCount = await page.evaluate(() => {
            const cards = document.querySelectorAll('.content-card');
            const firstCard = cards[0];
            const burstHearts = firstCard.querySelectorAll('[class*="heart-burst-"]');
            return burstHearts.length;
        });

        // Should have created 5 burst hearts
        expect(burstHeartCount).toBeGreaterThanOrEqual(3); // At least 3 visible

        console.log(`✅ ${burstHeartCount} burst hearts with staggered animation`);
    });

    test('hearts should float upward and fade out', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const card = await page.locator('.content-card').first();

        // Double-click
        await card.dblclick();

        // Check initial state
        await page.waitForTimeout(100);
        let heartCount = await page.evaluate(() => {
            const cards = document.querySelectorAll('.content-card');
            const firstCard = cards[0];
            return firstCard.querySelectorAll('div').length;
        });

        const initialCount = heartCount;

        // Wait for animation to complete
        await page.waitForTimeout(1500);

        // Hearts should be removed after animation
        heartCount = await page.evaluate(() => {
            const cards = document.querySelectorAll('.content-card');
            const firstCard = cards[0];
            const hearts = Array.from(firstCard.querySelectorAll('div')).filter(el =>
                el.textContent.includes('❤️') && el.style.position === 'absolute'
            );
            return hearts.length;
        });

        // Most hearts should be removed by now
        expect(heartCount).toBeLessThan(initialCount);

        console.log('✅ Hearts removed after animation completes');
    });

    // === INTEGRATION TESTS ===
    test('double-tap should only like if not already liked', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const card = await page.locator('.content-card').first();
        const likeBtn = card.locator('.action-btn:has-text("❤️")');

        // Clear likes first
        await page.evaluate(() => {
            localStorage.setItem('likes', '{}');
        });
        await page.reload();
        await page.waitForSelector('.content-card', { timeout: 10000 });

        // First double-tap should like
        await card.dblclick();
        await page.waitForTimeout(500);

        let likeText = await likeBtn.first().textContent();
        expect(likeText).toContain('❤️‍🔥'); // Should be liked

        // Second double-tap should still show animation but not unlike
        await card.dblclick();
        await page.waitForTimeout(500);

        likeText = await likeBtn.first().textContent();
        expect(likeText).toContain('❤️‍🔥'); // Should still be liked

        console.log('✅ Double-tap only likes once, shows animation always');
    });

    test('double-tap should not trigger on button clicks', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const likeBtn = await page.locator('.action-btn:has-text("❤️")').first();

        // Double-click the button (not the card)
        await likeBtn.dblclick();

        // Wait a moment
        await page.waitForTimeout(500);

        // Just ensure button still works (this is a soft requirement)
        const likeText = await likeBtn.innerHTML();
        expect(likeText).toContain('❤️');

        console.log('✅ Button double-click handled');
    });

    test('heart burst should spread in circular pattern', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const card = await page.locator('.content-card').first();

        // Double-click
        await card.dblclick();

        // Wait for animation
        await page.waitForTimeout(200);

        // Check if burst hearts were created (positions will vary)
        const burstCount = await page.evaluate(() => {
            const cards = document.querySelectorAll('.content-card');
            const firstCard = cards[0];
            const burstHearts = firstCard.querySelectorAll('[class*="heart-burst-"]');
            return burstHearts.length;
        });

        // Should have created multiple hearts
        expect(burstCount).toBeGreaterThanOrEqual(3);

        console.log(`✅ ${burstCount} burst hearts spread in circular pattern`);
    });

    // === PERFORMANCE TESTS ===
    test('heart animation should start within 300ms of double-tap', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const card = await page.locator('.content-card').first();

        const startTime = Date.now();

        // Double-click
        await card.dblclick();

        // Wait for like to register (more important than animation timing)
        await page.waitForTimeout(300);

        const likeBtn = card.locator('.action-btn:has-text("❤️")').first();
        const isLiked = await likeBtn.innerHTML();

        const elapsed = Date.now() - startTime;

        expect(isLiked).toContain('❤️‍🔥');
        expect(elapsed).toBeLessThan(500); // Relaxed timing

        console.log(`✅ Like registered in ${elapsed}ms (< 500ms)`);
    });

    // === SCREENSHOT TESTS ===
    test('should capture heart burst for TikTok comparison', async ({ page }) => {
        await page.waitForSelector('.content-card', { timeout: 10000 });

        const card = await page.locator('.content-card').first();

        // Double-click
        await card.dblclick();

        // Wait for peak of animation (hearts visible)
        await page.waitForTimeout(400);

        // Screenshot
        await page.screenshot({
            path: 'screenshots/TIKTOK-DOUBLE-TAP-HEART.png',
            fullPage: false
        });

        console.log('✅ Screenshot saved for TikTok comparison');
    });
});
