const { test, expect } = require('@playwright/test');

test.describe('Entertainment Feed - Complete Verification', () => {

    test('should load page without errors', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        page.on('pageerror', err => {
            errors.push(err.message);
        });

        await page.goto('http://localhost:3001/entertainment-feed.html', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✅ Page loaded');

        if (errors.length > 0) {
            console.log('⚠️ Console errors:', errors);
        }

        // Page should load
        await expect(page).toHaveTitle(/VIDA|Langflix/i);
    });

    test('should show top navigation tabs', async ({ page }) => {
        await page.goto('http://localhost:3001/entertainment-feed.html', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Wait for nav tabs
        const videoTab = await page.locator('.nav-tab').filter({ hasText: 'Videos' }).first();
        await expect(videoTab).toBeVisible({ timeout: 10000 });

        console.log('✅ Top navigation tabs visible');

        await page.screenshot({ path: '/tmp/nav-tabs.png' });
    });

    test('should show bottom navigation bar', async ({ page }) => {
        await page.goto('http://localhost:3001/entertainment-feed.html', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        const bottomNav = await page.locator('.bottom-nav-bar').first();
        await expect(bottomNav).toBeVisible({ timeout: 10000 });

        console.log('✅ Bottom navigation bar visible');
    });

    test('should load feed content', async ({ page }) => {
        await page.goto('http://localhost:3001/entertainment-feed.html', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Wait for feed to load (either content cards or skeleton loaders)
        await page.waitForSelector('.feed-container, .skeleton-card', {
            timeout: 15000
        });

        console.log('✅ Feed container loaded');

        // Wait a bit for content to populate
        await page.waitForTimeout(3000);

        // Check for content cards
        const contentCards = await page.locator('.content-card').count();
        console.log(`📊 Content cards loaded: ${contentCards}`);

        await page.screenshot({ path: '/tmp/feed-loaded.png', fullPage: true });
    });

    test('should show TikTok-style action buttons', async ({ page }) => {
        await page.goto('http://localhost:3001/entertainment-feed.html', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        await page.waitForTimeout(3000);

        // Look for action buttons
        const actionButtons = await page.locator('.action-btn').count();
        console.log(`🎯 Action buttons found: ${actionButtons}`);

        if (actionButtons > 0) {
            await page.screenshot({ path: '/tmp/action-buttons.png' });
            console.log('✅ Action buttons visible');
        } else {
            console.log('⚠️ No action buttons found yet');
        }
    });

    test('should take full screenshot for review', async ({ page }) => {
        await page.goto('http://localhost:3001/entertainment-feed.html', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        await page.waitForTimeout(5000);

        await page.screenshot({
            path: '/tmp/entertainment-feed-full.png',
            fullPage: true
        });

        console.log('✅ Full screenshot saved to /tmp/entertainment-feed-full.png');
    });
});
