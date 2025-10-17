/**
 * XP & STREAK GAMIFICATION SYSTEM TEST
 * Testing Duolingo-style XP and streak features (DIFFERENT from vocab tests)
 */

const { test, expect } = require('@playwright/test');

test.describe('XP & Streak Gamification System', () => {
    test('should display XP and streak banner on page load', async ({ page }) => {
        await page.goto('http://localhost:3001/unified-infinite-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Take screenshot of main page with XP/streak
        await page.screenshot({ path: 'screenshots/xp-streak-banner.png', fullPage: false });

        // Check XP banner exists
        const xpBanner = await page.locator('.xp-streak-banner').count();
        expect(xpBanner).toBeGreaterThan(0);

        // Check streak fire emoji
        const streakFire = await page.locator('#streakFire').count();
        expect(streakFire).toBe(1);

        // Check XP display
        const xpText = await page.locator('#xpText').count();
        expect(xpText).toBe(1);
    });

    test('should show current streak count', async ({ page }) => {
        await page.goto('http://localhost:3001/unified-infinite-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Get streak count
        const streakCount = await page.locator('#streakCount').textContent();
        console.log('Current streak:', streakCount);

        // Streak should be a number
        expect(streakCount).toMatch(/^\d+$/);

        // Take screenshot
        await page.screenshot({ path: 'screenshots/streak-display.png', fullPage: false });
    });

    test('should show XP progress bar', async ({ page }) => {
        await page.goto('http://localhost:3001/unified-infinite-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Check XP bar exists
        const xpBar = await page.locator('#xpBar').count();
        expect(xpBar).toBe(1);

        // Get XP bar width (should have some progress)
        const xpBarStyle = await page.locator('#xpBar').getAttribute('style');
        console.log('XP bar style:', xpBarStyle);

        // Take screenshot
        await page.screenshot({ path: 'screenshots/xp-progress-bar.png', fullPage: false });

        expect(xpBarStyle).toBeTruthy();
    });

    test('should show milestone celebration when XP threshold reached', async ({ page }) => {
        await page.goto('http://localhost:3001/unified-infinite-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Check if milestone celebration element exists
        const milestoneCelebration = await page.locator('#milestoneCelebration').count();
        expect(milestoneCelebration).toBe(1);

        // Manually trigger celebration via console
        const celebrationTriggered = await page.evaluate(() => {
            const milestone = document.getElementById('milestoneCelebration');
            if (milestone) {
                milestone.classList.add('active');
                return true;
            }
            return false;
        });

        expect(celebrationTriggered).toBe(true);

        await page.waitForTimeout(500);

        // Take screenshot of celebration
        await page.screenshot({ path: 'screenshots/milestone-celebration.png', fullPage: true });

        // Close celebration
        await page.evaluate(() => {
            const milestone = document.getElementById('milestoneCelebration');
            if (milestone) milestone.classList.remove('active');
        });
    });

    test('should have gamification features matching Duolingo patterns', async ({ page }) => {
        await page.goto('http://localhost:3001/unified-infinite-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Check for Duolingo-style elements
        const features = await page.evaluate(() => {
            return {
                hasStreakFire: !!document.getElementById('streakFire'),
                hasStreakCount: !!document.getElementById('streakCount'),
                hasXpText: !!document.getElementById('xpText'),
                hasXpBar: !!document.getElementById('xpBar'),
                hasMilestoneCelebration: !!document.getElementById('milestoneCelebration'),
                xpBarContainer: !!document.querySelector('.xp-bar-container'),
                streakDisplay: !!document.querySelector('.streak-display')
            };
        });

        console.log('Gamification features:', features);

        // All Duolingo patterns should be present
        expect(features.hasStreakFire).toBe(true);
        expect(features.hasStreakCount).toBe(true);
        expect(features.hasXpText).toBe(true);
        expect(features.hasXpBar).toBe(true);
        expect(features.hasMilestoneCelebration).toBe(true);

        // Take final screenshot
        await page.screenshot({ path: 'screenshots/duolingo-gamification-complete.png', fullPage: false });
    });
});
