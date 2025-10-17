const { test, expect } = require('@playwright/test');

test.describe('Duolingo-Style Daily Goal Feature', () => {
    test('should display and update daily goal widget', async ({ page }) => {
        console.log('🎯 Testing Duolingo-style daily goal widget...');

        // Navigate to video feed page
        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log('✅ Video feed page loaded');

        // Screenshot 1: Initial state
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/daily-goal-feature/01_initial_state.png',
            fullPage: true
        });

        // Check Daily Goal Widget exists
        const goalWidget = await page.locator('.daily-goal-widget');
        await expect(goalWidget).toBeVisible({ timeout: 10000 });
        console.log('✅ Daily Goal Widget visible');

        // Check widget components
        const goalIcon = await page.locator('#dailyGoalIcon');
        await expect(goalIcon).toBeVisible();
        console.log('✅ Daily Goal Icon visible');

        const goalText = await page.locator('#dailyGoalText');
        const textContent = await goalText.textContent();
        console.log(`📊 Current progress: ${textContent}`);

        const goalFill = await page.locator('#dailyGoalFill');
        const fillWidth = await goalFill.evaluate(el => el.style.width);
        console.log(`📈 Progress bar width: ${fillWidth}`);

        // Screenshot 2: Widget closeup
        await goalWidget.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/daily-goal-feature/02_widget_closeup.png'
        });

        // Check gamification bar
        const gamificationBar = await page.locator('.gamification-bar');
        await expect(gamificationBar).toBeVisible();
        console.log('✅ Gamification bar visible');

        // Screenshot 3: Full UI with all elements
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/daily-goal-feature/03_full_ui.png',
            fullPage: false
        });

        // Check streak counter
        const streakCount = await page.locator('#streakCount');
        const streakValue = await streakCount.textContent();
        console.log(`🔥 Current streak: ${streakValue} days`);

        // Check XP system
        const currentXP = await page.locator('#currentXP');
        const xpValue = await currentXP.textContent();
        console.log(`⭐ Current XP: ${xpValue}`);

        // Screenshot 4: After waiting for videos to load
        await page.waitForTimeout(3000);
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/daily-goal-feature/04_videos_loaded.png',
            fullPage: true
        });

        console.log('🎉 Daily goal feature test complete!');
    });

    test('should show mobile responsive design', async ({ page }) => {
        // Set mobile viewport (iPhone 12 Pro)
        await page.setViewportSize({ width: 390, height: 844 });

        await page.goto('http://localhost:3002/tiktok-videos.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Screenshot mobile view
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/daily-goal-feature/05_mobile_view.png',
            fullPage: true
        });

        const goalWidget = await page.locator('.daily-goal-widget');
        await expect(goalWidget).toBeVisible();
        console.log('✅ Daily Goal Widget visible on mobile');

        // Widget screenshot on mobile
        await goalWidget.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/daily-goal-feature/06_mobile_widget.png'
        });

        console.log('📱 Mobile responsive test complete!');
    });
});
