// 🧪 VERIFY: Duolingo-Style Gamification in TikTok Reels
const { test, expect } = require('@playwright/test');

test.describe('Duolingo Gamification Features', () => {
    test('should display XP counter and streak in UI', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // Check for XP counter
        const xpCounter = await page.locator('.xp-counter');
        await expect(xpCounter).toBeVisible();

        const xpText = await xpCounter.textContent();
        expect(xpText).toContain('XP');

        // Check for streak counter
        const streakCounter = await page.locator('.streak-counter');
        await expect(streakCounter).toBeVisible();

        const streakText = await streakCounter.textContent();
        expect(streakText).toContain('streak');

        console.log('✅ XP and streak counters visible');
    });

    test('should award +10 XP when clicking new Spanish word', async ({ page }) => {
        // Clear localStorage to start fresh
        await page.goto('http://localhost:3002');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForTimeout(2000);

        // Get initial XP
        const initialXP = await page.locator('#xpCount').textContent();
        console.log('Initial XP:', initialXP);

        // Click a Spanish word
        const word = await page.locator('.word').first();
        await word.click();
        await page.waitForTimeout(1500);

        // Check XP increased
        const newXP = await page.locator('#xpCount').textContent();
        console.log('New XP:', newXP);

        expect(parseInt(newXP)).toBeGreaterThan(parseInt(initialXP));
        expect(parseInt(newXP)).toBe(10); // First word should give 10 XP
    });

    test('should show +10 XP popup when learning new word', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForTimeout(2000);

        // Click word
        const word = await page.locator('.word').first();
        await word.click();

        // Check for XP popup
        await page.waitForTimeout(500);
        const popup = await page.locator('.xp-popup');

        const isVisible = await popup.evaluate(el => {
            return el.classList.contains('show');
        });

        expect(isVisible).toBe(true);
        console.log('✅ XP popup shown');
    });

    test('should track words learned today', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForTimeout(2000);

        // Learn first word
        const word1 = await page.locator('.word').nth(0);
        await word1.click();
        await page.waitForTimeout(1000);

        // Learn second word
        const word2 = await page.locator('.word').nth(1);
        await word2.click();
        await page.waitForTimeout(1000);

        // Check learned count
        const learnedCount = await page.locator('#learnedCount').textContent();
        console.log('Words learned today:', learnedCount);

        expect(parseInt(learnedCount)).toBeGreaterThan(0);
    });

    test('should persist XP and progress in localStorage', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForTimeout(2000);

        // Learn a word
        const word = await page.locator('.word').first();
        await word.click();
        await page.waitForTimeout(1000);

        // Check localStorage
        const xpStored = await page.evaluate(() => localStorage.getItem('spanishXP'));
        const learnedWords = await page.evaluate(() => localStorage.getItem('learnedWords'));

        expect(xpStored).toBeTruthy();
        expect(learnedWords).toBeTruthy();
        console.log('✅ Progress persisted in localStorage');
    });

    test('should take screenshot showing gamification UI', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3002');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await page.waitForTimeout(2000);

        // Learn a word to show XP popup
        const word = await page.locator('.word').first();
        await word.click();
        await page.waitForTimeout(600);

        // Take screenshot
        await page.screenshot({
            path: '/tmp/duolingo-gamification-proof.png',
            fullPage: false
        });

        console.log('✅ Screenshot saved: /tmp/duolingo-gamification-proof.png');
    });
});
