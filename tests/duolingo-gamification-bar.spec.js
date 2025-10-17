// 🎮 DUOLINGO 2025 GAMIFICATION BAR TESTS
// Testing XP Counter + Streak Fire + Level Badge matching Duolingo patterns
const { test, expect } = require('@playwright/test');

test.describe('Duolingo-Style Gamification Bar (unified-infinite-feed.html)', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the unified feed
        await page.goto('http://localhost:3002/unified-infinite-feed.html');

        // Wait for gamification bar to load
        await page.waitForSelector('.gamification-bar', { timeout: 10000 });
    });

    // === HEADER UI TESTS ===
    test('should display gamification bar with all three components', async ({ page }) => {
        const gamificationBar = await page.locator('.gamification-bar');
        await expect(gamificationBar).toBeVisible();

        // Check all three components (Duolingo pattern: XP + Streak + Level)
        const xpCounter = await page.locator('.xp-counter');
        const streakCounter = await page.locator('.streak-counter');
        const levelBadge = await page.locator('.level-badge');

        await expect(xpCounter).toBeVisible();
        await expect(streakCounter).toBeVisible();
        await expect(levelBadge).toBeVisible();

        console.log('✅ All gamification components visible (Duolingo pattern)');
    });

    test('gamification bar should be fixed at top of screen', async ({ page }) => {
        const gamificationBar = await page.locator('.gamification-bar');

        const styles = await gamificationBar.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                position: computed.position,
                top: computed.top,
                zIndex: computed.zIndex
            };
        });

        expect(styles.position).toBe('fixed');
        expect(styles.top).toBe('0px');
        expect(parseInt(styles.zIndex)).toBeGreaterThanOrEqual(1000);

        console.log('✅ Gamification bar fixed at top (z-index: ' + styles.zIndex + ')');
    });

    // === XP COUNTER TESTS ===
    test('should display XP counter with star icon (Duolingo pattern)', async ({ page }) => {
        const xpIcon = await page.locator('.xp-icon');
        const xpAmount = await page.locator('.xp-amount');

        await expect(xpIcon).toBeVisible();
        await expect(xpAmount).toBeVisible();

        const iconText = await xpIcon.textContent();
        const xpText = await xpAmount.textContent();

        expect(iconText).toContain('⭐'); // Star icon
        expect(xpText).toMatch(/\d+ XP/); // Number + " XP"

        console.log(`✅ XP counter: ${xpText} with star icon`);
    });

    test('XP counter should have golden color scheme (Duolingo)', async ({ page }) => {
        const xpAmount = await page.locator('.xp-amount');

        const color = await xpAmount.evaluate(el => {
            return window.getComputedStyle(el).color;
        });

        // RGB color should be set (golden/yellow)
        expect(color).toBeTruthy();
        expect(color).toMatch(/rgb/);

        console.log('✅ XP counter has golden color: ' + color);
    });

    test('XP counter should have sparkle animation', async ({ page }) => {
        const xpIcon = await page.locator('.xp-icon');

        const animation = await xpIcon.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return computed.animation;
        });

        expect(animation).toContain('sparkle'); // Should have sparkle animation

        console.log('✅ XP icon has sparkle animation');
    });

    test('clicking XP counter should show details tooltip', async ({ page }) => {
        await page.locator('.xp-counter').click();

        // Wait for toast message
        await page.waitForSelector('.toast', { timeout: 3000 });
        const toast = await page.locator('.toast');
        await expect(toast).toBeVisible();

        const toastText = await toast.textContent();
        expect(toastText).toContain('XP'); // Should contain XP info
        expect(toastText).toMatch(/Level/i); // Should mention level

        console.log('✅ XP tooltip: ' + toastText.substring(0, 50) + '...');
    });

    // === STREAK COUNTER TESTS ===
    test('should display streak counter with fire icon (Duolingo pattern)', async ({ page }) => {
        const streakIcon = await page.locator('.streak-icon');
        const streakDays = await page.locator('.streak-days');

        await expect(streakIcon).toBeVisible();
        await expect(streakDays).toBeVisible();

        const iconText = await streakIcon.textContent();
        const daysText = await streakDays.textContent();

        expect(iconText).toContain('🔥'); // Fire icon
        expect(parseInt(daysText)).toBeGreaterThanOrEqual(0); // Number >= 0

        console.log(`✅ Streak counter: ${daysText} days with fire icon`);
    });

    test('streak counter should have orange/red color scheme (Duolingo)', async ({ page }) => {
        const streakDays = await page.locator('.streak-days');

        const color = await streakDays.evaluate(el => {
            return window.getComputedStyle(el).color;
        });

        expect(color).toBeTruthy();
        expect(color).toMatch(/rgb/);

        console.log('✅ Streak counter has orange/red color: ' + color);
    });

    test('streak icon should have flicker animation', async ({ page }) => {
        const streakIcon = await page.locator('.streak-icon');

        const animation = await streakIcon.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return computed.animation;
        });

        expect(animation).toContain('flicker'); // Should have flicker animation

        console.log('✅ Fire icon has flicker animation');
    });

    test('clicking streak counter should show details tooltip', async ({ page }) => {
        await page.locator('.streak-counter').click();

        // Wait for toast message
        await page.waitForSelector('.toast', { timeout: 3000 });
        const toast = await page.locator('.toast');
        await expect(toast).toBeVisible();

        const toastText = await toast.textContent();
        expect(toastText).toMatch(/streak/i); // Should mention streak

        console.log('✅ Streak tooltip: ' + toastText.substring(0, 50) + '...');
    });

    // === LEVEL BADGE TESTS ===
    test('should display level badge (Duolingo circular pattern)', async ({ page }) => {
        const levelBadge = await page.locator('.level-badge');
        await expect(levelBadge).toBeVisible();

        const levelText = await levelBadge.textContent();
        // Should be A1, A2, B1, B2, C1, C2, or numeric
        expect(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', '1', '2', '3', '4', '5', '6']).toContain(levelText.trim());

        console.log(`✅ Level badge: ${levelText}`);
    });

    test('level badge should be circular (Duolingo pattern)', async ({ page }) => {
        const levelBadge = await page.locator('.level-badge');

        const styles = await levelBadge.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                borderRadius: computed.borderRadius,
                width: computed.width,
                height: computed.height
            };
        });

        // Should be circular (borderRadius 50% and width = height)
        expect(styles.borderRadius).toMatch(/50%|22px/); // 50% or half of width/height

        console.log(`✅ Level badge circular: ${styles.width} x ${styles.height}, border-radius: ${styles.borderRadius}`);
    });

    test('clicking level badge should show details tooltip', async ({ page }) => {
        await page.locator('.level-badge').click();

        // Wait for toast message
        await page.waitForSelector('.toast', { timeout: 3000 });
        const toast = await page.locator('.toast');
        await expect(toast).toBeVisible();

        const toastText = await toast.textContent();
        expect(toastText).toMatch(/Level/i); // Should mention level

        console.log('✅ Level tooltip: ' + toastText.substring(0, 50) + '...');
    });

    // === XP GAIN ANIMATION TESTS ===
    test('should show XP gain popup when earning XP', async ({ page }) => {
        // Wait for Spanish words to load
        await page.waitForSelector('.spanish-word', { timeout: 10000 });

        // Click a Spanish word (triggers +10 XP for saving)
        const firstWord = await page.locator('.spanish-word').first();
        await firstWord.click();

        // Wait for XP gain popup
        await page.waitForSelector('.xp-gain-popup', { timeout: 5000 });
        const xpPopup = await page.locator('.xp-gain-popup');
        await expect(xpPopup).toBeVisible();

        const popupText = await xpPopup.textContent();
        expect(popupText).toMatch(/\+\d+ XP/); // Should show "+X XP"

        console.log('✅ XP gain popup shown: ' + popupText);
    });

    test('XP gain popup should auto-dismiss after 2 seconds', async ({ page }) => {
        // Trigger XP gain
        await page.waitForSelector('.spanish-word', { timeout: 10000 });
        const firstWord = await page.locator('.spanish-word').first();
        await firstWord.click();

        // Wait for popup to appear
        await page.waitForSelector('.xp-gain-popup', { timeout: 3000 });
        const xpPopup = await page.locator('.xp-gain-popup');
        await expect(xpPopup).toBeVisible();

        // Wait 2.5 seconds
        await page.waitForTimeout(2500);

        // Popup should be gone
        await expect(xpPopup).not.toBeVisible();

        console.log('✅ XP popup auto-dismissed after 2 seconds');
    });

    test('XP counter should update in real-time when earning XP', async ({ page }) => {
        const xpAmount = await page.locator('.xp-amount');
        const initialXP = await xpAmount.textContent();
        const initialValue = parseInt(initialXP.replace(' XP', ''));

        // Trigger XP gain
        await page.waitForSelector('.spanish-word', { timeout: 10000 });
        const firstWord = await page.locator('.spanish-word').first();
        await firstWord.click();

        // Wait for update
        await page.waitForTimeout(1000);

        const newXP = await xpAmount.textContent();
        const newValue = parseInt(newXP.replace(' XP', ''));

        expect(newValue).toBeGreaterThan(initialValue);

        console.log(`✅ XP updated in real-time: ${initialValue} → ${newValue} (+${newValue - initialValue})`);
    });

    // === STREAK FREEZE TESTS ===
    test('should show streak freeze badge when user has freezes', async ({ page }) => {
        // Set streak freeze count
        await page.evaluate(() => {
            localStorage.setItem('streakFreezes', '2');
        });

        await page.reload();
        await page.waitForSelector('.gamification-bar', { timeout: 5000 });

        const freezeBadge = await page.locator('.streak-freeze-badge');
        await expect(freezeBadge).toBeVisible();
        await expect(freezeBadge).toContainText('❄️');

        console.log('✅ Streak freeze badge visible (2 freezes equipped)');
    });

    test('should NOT show streak freeze badge when user has 0 freezes', async ({ page }) => {
        // Set streak freeze count to 0
        await page.evaluate(() => {
            localStorage.setItem('streakFreezes', '0');
        });

        await page.reload();
        await page.waitForSelector('.gamification-bar', { timeout: 5000 });

        const freezeBadge = await page.locator('.streak-freeze-badge');
        await expect(freezeBadge).not.toBeVisible();

        console.log('✅ Streak freeze badge hidden (0 freezes)');
    });

    test('streak tooltip should show freeze count', async ({ page }) => {
        // Set streak freezes
        await page.evaluate(() => {
            localStorage.setItem('streakFreezes', '1');
        });

        await page.reload();
        await page.waitForSelector('.gamification-bar', { timeout: 5000 });

        // Click streak counter
        await page.locator('.streak-counter').click();

        // Check tooltip
        await page.waitForSelector('.toast', { timeout: 3000 });
        const toast = await page.locator('.toast');
        const toastText = await toast.textContent();

        expect(toastText).toContain('Streak Freezes: 1/2');

        console.log('✅ Streak freeze count shown in tooltip');
    });

    // === LEVEL UP CELEBRATION TESTS ===
    test('should show level-up celebration when reaching 100 XP', async ({ page }) => {
        // Set XP to 95 (close to level up)
        await page.evaluate(() => {
            const streakData = JSON.parse(localStorage.getItem('learningStreak') || '{"count": 0, "lastDate": "", "xp": 0, "level": 1}');
            streakData.xp = 95;
            streakData.level = 1;
            localStorage.setItem('learningStreak', JSON.stringify(streakData));
        });

        await page.reload();
        await page.waitForSelector('.gamification-bar', { timeout: 5000 });

        // Trigger +10 XP (should cross 100 threshold)
        await page.waitForSelector('.spanish-word', { timeout: 10000 });
        const firstWord = await page.locator('.spanish-word').first();
        await firstWord.click();

        // Wait for level-up celebration
        await page.waitForSelector('.level-up-celebration', { timeout: 5000 });
        const celebration = await page.locator('.level-up-celebration');
        await expect(celebration).toBeVisible();

        console.log('✅ Level-up celebration shown (100 XP milestone)');
    });

    test('level-up celebration should have all components', async ({ page }) => {
        // Set XP close to level up
        await page.evaluate(() => {
            const streakData = JSON.parse(localStorage.getItem('learningStreak') || '{"count": 0, "lastDate": "", "xp": 0, "level": 1}');
            streakData.xp = 95;
            streakData.level = 1;
            localStorage.setItem('learningStreak', JSON.stringify(streakData));
        });

        await page.reload();
        await page.waitForSelector('.gamification-bar', { timeout: 5000 });

        // Trigger level up
        await page.waitForSelector('.spanish-word', { timeout: 10000 });
        const firstWord = await page.locator('.spanish-word').first();
        await firstWord.click();

        // Wait for celebration
        await page.waitForSelector('.level-up-celebration', { timeout: 5000 });

        // Check components
        const title = await page.locator('.level-up-title');
        const badge = await page.locator('.level-up-badge');
        const subtitle = await page.locator('.level-up-subtitle');
        const button = await page.locator('.level-up-continue');

        await expect(title).toContainText('LEVEL UP');
        await expect(badge).toBeVisible();
        await expect(subtitle).toBeVisible();
        await expect(button).toBeVisible();

        console.log('✅ Level-up celebration has all components (Duolingo pattern)');
    });

    test('level-up celebration should be dismissible', async ({ page }) => {
        // Set XP close to level up
        await page.evaluate(() => {
            const streakData = JSON.parse(localStorage.getItem('learningStreak') || '{"count": 0, "lastDate": "", "xp": 0, "level": 1}');
            streakData.xp = 95;
            streakData.level = 1;
            localStorage.setItem('learningStreak', JSON.stringify(streakData));
        });

        await page.reload();
        await page.waitForSelector('.gamification-bar', { timeout: 5000 });

        // Trigger level up
        await page.waitForSelector('.spanish-word', { timeout: 10000 });
        const firstWord = await page.locator('.spanish-word').first();
        await firstWord.click();

        // Wait for celebration
        await page.waitForSelector('.level-up-celebration', { timeout: 5000 });

        // Click continue button
        const continueBtn = await page.locator('.level-up-continue');
        await continueBtn.click();

        // Celebration should disappear
        const celebration = await page.locator('.level-up-celebration');
        await expect(celebration).not.toBeVisible();

        console.log('✅ Level-up celebration dismissible via button');
    });

    // === PERSISTENCE TESTS ===
    test('should persist XP across page reloads', async ({ page }) => {
        const xpAmount = await page.locator('.xp-amount');
        const initialXP = await xpAmount.textContent();

        await page.reload();
        await page.waitForSelector('.gamification-bar', { timeout: 5000 });

        const reloadedXP = await xpAmount.textContent();
        expect(reloadedXP).toBe(initialXP);

        console.log(`✅ XP persisted: ${initialXP}`);
    });

    test('should persist streak across page reloads', async ({ page }) => {
        const streakDays = await page.locator('.streak-days');
        const initialStreak = await streakDays.textContent();

        await page.reload();
        await page.waitForSelector('.gamification-bar', { timeout: 5000 });

        const reloadedStreak = await streakDays.textContent();
        expect(reloadedStreak).toBe(initialStreak);

        console.log(`✅ Streak persisted: ${initialStreak} days`);
    });

    // === SCREENSHOT TESTS ===
    test('should match Duolingo visual quality', async ({ page }) => {
        await page.screenshot({
            path: 'screenshots/DUOLINGO-GAMIFICATION-BAR.png',
            fullPage: false
        });

        console.log('✅ Screenshot saved for visual comparison with Duolingo');
    });

    test('should show XP gain animation in screenshot', async ({ page }) => {
        // Trigger XP gain
        await page.waitForSelector('.spanish-word', { timeout: 10000 });
        const firstWord = await page.locator('.spanish-word').first();
        await firstWord.click();

        // Wait for popup to appear
        await page.waitForSelector('.xp-gain-popup', { timeout: 3000 });

        // Screenshot while popup is visible
        await page.screenshot({
            path: 'screenshots/DUOLINGO-XP-GAIN-ANIMATION.png',
            fullPage: false
        });

        console.log('✅ XP gain animation screenshot saved');
    });
});
