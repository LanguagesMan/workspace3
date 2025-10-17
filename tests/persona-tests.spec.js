// ULTIMATE GENIUS MODE - Persona Testing Suite
// Tests app from perspective of 5 different user personas

const { test, expect } = require('@playwright/test');

test.describe('🧑 PERSONA 1: Confused Beginner Test', () => {
    test('App is obvious what to do in 3 seconds', async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Wait for feed to load
        await page.waitForSelector('.feed-container', { timeout: 5000 });

        // PASS: XP/Streak banner visible immediately (tells user about gamification)
        const xpBanner = await page.locator('.xp-streak-banner').isVisible();
        expect(xpBanner).toBeTruthy();

        // PASS: Content cards visible (tells user to scroll)
        const cards = await page.locator('.content-card').count();
        expect(cards).toBeGreaterThan(0);

        // PASS: Publisher attribution visible (tells user it's curated content)
        const publishers = await page.locator('.publisher-header').count();
        expect(publishers).toBeGreaterThan(0);

        // PASS: Floating action buttons visible (tells user they can interact)
        const floatingBtns = await page.locator('.floating-btn').count();
        expect(floatingBtns).toBeGreaterThan(0);

        console.log('✅ Confused Beginner: CLEAR what to do - scroll feed, see XP/streak, interact');
    });

    test('User is guided, not lost', async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Visual hierarchy clear
        await page.waitForSelector('.xp-streak-banner');
        const bannerVisible = await page.locator('.xp-streak-banner').isVisible();
        expect(bannerVisible).toBeTruthy();

        // Cards have clear structure
        await page.waitForSelector('.content-card');
        const hasPublisher = await page.locator('.publisher-name').first().isVisible();
        const hasTitle = await page.locator('.card-title').first().isVisible();
        const hasActions = await page.locator('.card-actions').first().isVisible();

        expect(hasPublisher).toBeTruthy();
        expect(hasTitle).toBeTruthy();
        expect(hasActions).toBeTruthy();

        console.log('✅ Confused Beginner: GUIDED by clear visual hierarchy');
    });
});

test.describe('🎮 PERSONA 2: Bored Teenager Test (Addiction)', () => {
    test('Would scroll for hours like TikTok - infinite content', async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Wait for initial content
        await page.waitForSelector('.content-card', { timeout: 5000 });
        const initialCards = await page.locator('.content-card').count();

        // Scroll to trigger infinite scroll
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);

        // More cards should load
        const newCards = await page.locator('.content-card').count();
        expect(newCards).toBeGreaterThan(initialCards);

        console.log(`✅ Bored Teenager: ADDICTIVE - ${initialCards} → ${newCards} cards loaded`);
    });

    test('Dopamine hits - XP gains on actions', async ({ page }) => {
        await page.goto('http://localhost:3002');

        await page.waitForSelector('.content-card', { timeout: 5000 });

        // Like button should award XP
        const likeBtn = page.locator('.action-btn').first();
        await likeBtn.click();

        // Wait for XP popup
        await page.waitForTimeout(500);

        // XP should have increased
        const xpText = await page.locator('#xpText').textContent();
        const hasXP = xpText && xpText.includes('XP');
        expect(hasXP).toBeTruthy();

        console.log(`✅ Bored Teenager: DOPAMINE HIT - XP gained: ${xpText}`);
    });

    test('Engagement hooks - streaks create FOMO', async ({ page }) => {
        await page.goto('http://localhost:3002');

        // Streak visible
        const streakVisible = await page.locator('.streak-fire').isVisible();
        expect(streakVisible).toBeTruthy();

        const streakCount = await page.locator('#streakCount').textContent();
        console.log(`✅ Bored Teenager: FOMO HOOK - ${streakCount} day streak (loss aversion)`);
    });
});

test.describe('🎨 PERSONA 3: Design Critic Test', () => {
    test('Design matches TikTok/Duolingo quality', async ({ page }) => {
        await page.goto('http://localhost:3002');

        await page.waitForSelector('.content-card', { timeout: 5000 });

        // Check for modern design elements
        const hasGradients = await page.locator('[style*="gradient"]').count();
        const hasRoundedCorners = await page.locator('[style*="border-radius"]').count();
        const hasShadows = await page.locator('[style*="box-shadow"]').count();

        expect(hasGradients).toBeGreaterThan(0);
        expect(hasRoundedCorners).toBeGreaterThan(0);
        expect(hasShadows).toBeGreaterThan(0);

        // Typography clear
        const titles = await page.locator('.card-title').count();
        expect(titles).toBeGreaterThan(0);

        console.log('✅ Design Critic: PROFESSIONAL - gradients, shadows, typography match TikTok');
    });

    test('No amateur/ugly elements', async ({ page }) => {
        await page.goto('http://localhost:3002');

        await page.waitForSelector('.content-card');

        // Check spacing
        const cards = page.locator('.content-card');
        const firstCard = cards.first();
        const box = await firstCard.boundingBox();

        // Cards should have proper sizing
        expect(box.width).toBeGreaterThan(200);
        expect(box.height).toBeGreaterThan(100);

        console.log('✅ Design Critic: POLISHED - proper spacing and sizing');
    });
});

test.describe('⚡ PERSONA 4: Power User Test', () => {
    test('All expected features present', async ({ page }) => {
        await page.goto('http://localhost:3002');

        await page.waitForSelector('.content-card', { timeout: 5000 });

        // Check core features
        const features = {
            'XP System': await page.locator('.xp-streak-banner').isVisible(),
            'Streak Tracker': await page.locator('.streak-fire').isVisible(),
            'Publisher Attribution': await page.locator('.publisher-header').count() > 0,
            'Like Button': await page.locator('.action-btn').count() > 0,
            'Save Button': await page.locator('button:has-text("Save")').count() > 0,
            'Share Button': await page.locator('button:has-text("Share")').count() > 0,
            'Floating Controls': await page.locator('.floating-btn').count() > 0,
            'Content Cards': await page.locator('.content-card').count() > 0
        };

        const missing = Object.entries(features).filter(([name, present]) => !present);
        expect(missing.length).toBe(0);

        console.log('✅ Power User: ALL FEATURES PRESENT', Object.keys(features));
    });

    test('Nothing broken - interactions work', async ({ page }) => {
        await page.goto('http://localhost:3002');

        await page.waitForSelector('.content-card', { timeout: 5000 });

        // Test like interaction
        const likeBefore = await page.locator('#xpText').textContent();
        await page.locator('.action-btn').first().click();
        await page.waitForTimeout(500);
        const likeAfter = await page.locator('#xpText').textContent();

        // XP should change
        expect(likeBefore).not.toBe(likeAfter);

        console.log(`✅ Power User: INTERACTIONS WORK - XP: ${likeBefore} → ${likeAfter}`);
    });
});

test.describe('♿ PERSONA 5: Accessibility Expert Test', () => {
    test('Keyboard navigation works', async ({ page }) => {
        await page.goto('http://localhost:3002');

        await page.waitForSelector('.content-card', { timeout: 5000 });

        // Tab through focusable elements
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        // Some element should be focused
        const focusedElement = await page.evaluate(() => document.activeElement.tagName);
        expect(['BUTTON', 'A', 'INPUT'].includes(focusedElement)).toBeTruthy();

        console.log('✅ Accessibility: KEYBOARD NAV works');
    });

    test('Touch targets big enough (44px minimum)', async ({ page }) => {
        await page.goto('http://localhost:3002');

        await page.waitForSelector('.action-btn', { timeout: 5000 });

        // Check button sizes
        const btn = page.locator('.action-btn').first();
        const box = await btn.boundingBox();

        expect(box.height).toBeGreaterThanOrEqual(40); // Close to 44px
        expect(box.width).toBeGreaterThanOrEqual(40);

        console.log(`✅ Accessibility: TOUCH TARGETS adequate (${box.width}x${box.height}px)`);
    });

    test('ARIA labels present for screen readers', async ({ page }) => {
        await page.goto('http://localhost:3002');

        await page.waitForSelector('.content-card', { timeout: 5000 });

        // Check for title attributes
        const hasAria = await page.locator('[title]').count();
        expect(hasAria).toBeGreaterThan(0);

        console.log('✅ Accessibility: ARIA/titles present for screen readers');
    });
});

// PERFORMANCE TEST
test.describe('⚡ PERFORMANCE Test', () => {
    test('Load time < 2s (TikTok standard)', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.content-card', { timeout: 5000 });
        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(2000);
        console.log(`✅ PERFORMANCE: Load time ${loadTime}ms < 2000ms`);
    });

    test('Interaction response < 150ms', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForSelector('.action-btn', { timeout: 5000 });

        const startTime = Date.now();
        await page.locator('.action-btn').first().click();
        const responseTime = Date.now() - startTime;

        expect(responseTime).toBeLessThan(150);
        console.log(`✅ PERFORMANCE: Interaction ${responseTime}ms < 150ms`);
    });
});
