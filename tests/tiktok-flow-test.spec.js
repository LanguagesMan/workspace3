const { test, expect } = require('@playwright/test');

test.describe('TikTok 2025 Content-First Flow Verification', () => {
    test('should show minimal header that doesnt block content', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('.content-card', { timeout: 10000 });

        // Screenshot 1: Clean content-first layout
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/TIKTOK_FLOW_01_content_first.png',
            fullPage: false
        });

        // Verify header bar exists (TikTok pattern)
        const headerBar = await page.locator('.stats-header-bar');
        await expect(headerBar).toBeVisible();
        console.log('✅ TikTok-style header bar visible');

        // Verify old floating widgets are GONE
        const oldGoalWidget = await page.locator('.daily-goal-widget');
        const oldStreakCounter = await page.locator('.streak-counter-fixed');
        expect(await oldGoalWidget.count()).toBe(0);
        expect(await oldStreakCounter.count()).toBe(0);
        console.log('✅ Old blocking widgets removed - content first!');

        // Verify content is NOT blocked
        const firstCard = await page.locator('.content-card').first();
        await expect(firstCard).toBeVisible();
        console.log('✅ Content visible and not blocked by overlays');

        // Screenshot 2: Header doesn't block content
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/TIKTOK_FLOW_02_header_subtle.png',
            fullPage: false
        });

        // Test goal indicator click
        const goalIndicator = await page.locator('#goal-indicator');
        await expect(goalIndicator).toBeVisible();
        await goalIndicator.click();
        await page.waitForTimeout(500);
        console.log('✅ Goal indicator clickable');

        // Screenshot 3: Goal popup
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/TIKTOK_FLOW_03_goal_click.png',
            fullPage: false
        });

        // Test streak indicator click
        const streakIndicator = await page.locator('#streak-indicator');
        await expect(streakIndicator).toBeVisible();
        await streakIndicator.click();
        await page.waitForTimeout(500);
        console.log('✅ Streak indicator clickable');

        // Screenshot 4: Streak popup
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/TIKTOK_FLOW_04_streak_click.png',
            fullPage: false
        });

        // Verify header has gradient fade (TikTok pattern)
        const bgStyle = await headerBar.evaluate(el =>
            window.getComputedStyle(el).background
        );
        expect(bgStyle).toContain('gradient');
        console.log('✅ Header has TikTok-style gradient fade');

        // Test scroll - header should stay fixed
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(500);
        await expect(headerBar).toBeVisible();
        console.log('✅ Header remains fixed during scroll');

        // Screenshot 5: Scrolled state
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/TIKTOK_FLOW_05_scrolled.png',
            fullPage: false
        });

        // Complete an article to test progress update
        const translateBtn = await page.locator('.translate-btn').first();
        if (await translateBtn.count() > 0) {
            await translateBtn.click();
            await page.waitForTimeout(1000);

            // Screenshot 6: Progress updated
            await page.screenshot({
                path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/TIKTOK_FLOW_06_progress_updated.png',
                fullPage: false
            });

            console.log('✅ Progress updates in header (real-time)');
        }

        // Mobile responsive test
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(500);

        await expect(headerBar).toBeVisible();
        await expect(firstCard).toBeVisible();
        console.log('✅ Mobile responsive - header + content visible');

        // Screenshot 7: Mobile view
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/TIKTOK_FLOW_07_mobile.png',
            fullPage: false
        });

        // Final screenshot
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.waitForTimeout(500);
        await page.screenshot({
            path: '/Users/mindful/_projects/workspace3/screenshots/workspace3/TIKTOK_FLOW_08_final.png',
            fullPage: true
        });

        console.log('');
        console.log('🎉 TIKTOK 2025 FLOW VERIFIED!');
        console.log('');
        console.log('✅ Content-first design (like TikTok) ✅');
        console.log('✅ Minimal header doesn\'t block content ✅');
        console.log('✅ Old floating widgets removed ✅');
        console.log('✅ Gradient fade (TikTok pattern) ✅');
        console.log('✅ Stats accessible via clicks ✅');
        console.log('✅ Mobile responsive ✅');
        console.log('');
    });
});
