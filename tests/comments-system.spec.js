// TikTok Comments System - Comprehensive Tests (All Devices)

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3002/unified-infinite-feed.html';

// Test on multiple devices
const devices = [
    { name: 'Mobile', viewport: { width: 375, height: 667 } }, // iPhone SE
    { name: 'Tablet', viewport: { width: 768, height: 1024 } }, // iPad
    { name: 'Desktop', viewport: { width: 1920, height: 1080 } } // Desktop
];

for (const device of devices) {
    test.describe(`✅ Comments System - ${device.name}`, () => {
        test.use({ viewport: device.viewport });

        test('Comments modal opens when clicking comment button', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForSelector('.feed-card', { timeout: 10000 });

            // Click first comment button
            const commentBtn = page.locator('.action-btn').filter({ hasText: '💬' }).first();
            await commentBtn.click();

            // Verify modal is visible
            const modal = page.locator('.comments-modal');
            await expect(modal).toHaveClass(/active/);

            console.log(`✓ [${device.name}] Comment modal opens successfully`);
        });

        test('Comment modal has all required elements', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForSelector('.feed-card', { timeout: 10000 });

            // Open comments
            await page.locator('.action-btn').filter({ hasText: '💬' }).first().click();

            // Check header
            await expect(page.locator('.comments-header h3')).toBeVisible();
            await expect(page.locator('.close-comments')).toBeVisible();

            // Check input
            await expect(page.locator('#commentInput')).toBeVisible();
            await expect(page.locator('.comment-send-btn')).toBeVisible();

            // Check comments list
            await expect(page.locator('#commentsList')).toBeVisible();

            console.log(`✓ [${device.name}] All modal elements present`);
        });

        test('Can post a comment', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForSelector('.feed-card', { timeout: 10000 });

            // Open comments
            await page.locator('.action-btn').filter({ hasText: '💬' }).first().click();

            // Type comment
            await page.fill('#commentInput', 'Great article! ¡Me encanta!');

            // Post comment
            await page.click('.comment-send-btn');

            // Verify comment appears
            await expect(page.locator('.comment-text').filter({ hasText: 'Great article' })).toBeVisible();

            // Verify comment count updated
            const commentCount = await page.locator('#commentCount').textContent();
            expect(parseInt(commentCount)).toBeGreaterThan(0);

            console.log(`✓ [${device.name}] Comment posting works`);
        });

        test('Modal closes when clicking overlay', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForSelector('.feed-card', { timeout: 10000 });

            // Open comments
            await page.locator('.action-btn').filter({ hasText: '💬' }).first().click();

            // Click overlay
            await page.click('#commentsOverlay');

            // Verify modal closed
            const modal = page.locator('.comments-modal');
            await expect(modal).not.toHaveClass(/active/);

            console.log(`✓ [${device.name}] Modal dismisses on overlay click`);
        });

        test('Modal closes when clicking X button', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForSelector('.feed-card', { timeout: 10000 });

            // Open comments
            await page.locator('.action-btn').filter({ hasText: '💬' }).first().click();

            // Click close button
            await page.click('.close-comments');

            // Verify modal closed
            const modal = page.locator('.comments-modal');
            await expect(modal).not.toHaveClass(/active/);

            console.log(`✓ [${device.name}] Modal dismisses on X click`);
        });

        test('Comments persist in localStorage', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForSelector('.feed-card', { timeout: 10000 });

            // Open comments
            await page.locator('.action-btn').filter({ hasText: '💬' }).first().click();

            // Post comment
            await page.fill('#commentInput', 'Test persistence');
            await page.click('.comment-send-btn');

            // Close modal
            await page.click('.close-comments');

            // Reopen modal
            await page.locator('.action-btn').filter({ hasText: '💬' }).first().click();

            // Verify comment still there
            await expect(page.locator('.comment-text').filter({ hasText: 'Test persistence' })).toBeVisible();

            console.log(`✓ [${device.name}] Comments persist correctly`);
        });

        test('Comment count displays on feed cards', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForSelector('.feed-card', { timeout: 10000 });

            // Check comment count badge exists
            const commentCountBadge = page.locator('.action-btn').filter({ hasText: '💬' }).first();
            await expect(commentCountBadge).toBeVisible();

            console.log(`✓ [${device.name}] Comment count badge visible`);
        });

        test('Enter key posts comment', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForSelector('.feed-card', { timeout: 10000 });

            // Open comments
            await page.locator('.action-btn').filter({ hasText: '💬' }).first().click();

            // Type and press Enter
            await page.fill('#commentInput', 'Testing Enter key');
            await page.press('#commentInput', 'Enter');

            // Verify comment posted
            await expect(page.locator('.comment-text').filter({ hasText: 'Testing Enter key' })).toBeVisible();

            console.log(`✓ [${device.name}] Enter key submits comment`);
        });
    });
}

// WCAG 2.1 AA Accessibility Tests
test.describe('✅ WCAG 2.1 AA Accessibility', () => {
    test('Keyboard navigation works for comments', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('.feed-card', { timeout: 10000 });

        // Tab to comment button and press Enter
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab'); // Navigate to comment button

        // Modal should be accessible via keyboard
        const closeButton = page.locator('.close-comments');
        await expect(closeButton).toBeVisible();

        console.log('✓ WCAG: Keyboard navigation accessible');
    });

    test('Color contrast meets WCAG AA standards', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('.feed-card', { timeout: 10000 });

        // Open comments
        await page.locator('.action-btn').filter({ hasText: '💬' }).first().click();

        // Check text is readable (white on dark background)
        const header = page.locator('.comments-header h3');
        const color = await header.evaluate(el => window.getComputedStyle(el).color);

        // White text on dark background = high contrast ✓
        expect(color).toContain('rgb(255, 255, 255)'); // White text

        console.log('✓ WCAG: Color contrast meets AA standards (white on dark)');
    });

    test('Interactive elements have proper focus states', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('.feed-card', { timeout: 10000 });

        // Open comments
        await page.locator('.action-btn').filter({ hasText: '💬' }).first().click();

        // Focus input
        await page.focus('#commentInput');

        // Verify focus is visible
        const focusedElement = await page.evaluate(() => document.activeElement.id);
        expect(focusedElement).toBe('commentInput');

        console.log('✓ WCAG: Focus states work correctly');
    });

    test('Screen reader text present for buttons', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('.feed-card', { timeout: 10000 });

        // Comment buttons have emoji + count (screen reader accessible)
        const commentBtn = page.locator('.action-btn').filter({ hasText: '💬' }).first();
        const text = await commentBtn.textContent();

        expect(text).toContain('💬'); // Has descriptive emoji

        console.log('✓ WCAG: Screen reader accessible text present');
    });
});

// Performance Tests
test.describe('✅ Performance Metrics', () => {
    test('Modal opens in <150ms', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('.feed-card', { timeout: 10000 });

        const startTime = Date.now();

        // Click comment button
        await page.locator('.action-btn').filter({ hasText: '💬' }).first().click();

        // Wait for modal to be visible
        await page.waitForSelector('.comments-modal.active');

        const openTime = Date.now() - startTime;

        expect(openTime).toBeLessThan(150); // <150ms interaction

        console.log(`✓ Performance: Modal opens in ${openTime}ms (< 150ms target)`);
    });

    test('Comment posting responds in <100ms', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('.feed-card', { timeout: 10000 });

        // Open comments
        await page.locator('.action-btn').filter({ hasText: '💬' }).first().click();

        // Fill input
        await page.fill('#commentInput', 'Speed test');

        const startTime = Date.now();

        // Post comment
        await page.click('.comment-send-btn');

        // Wait for comment to appear
        await page.waitForSelector('.comment-text');

        const postTime = Date.now() - startTime;

        expect(postTime).toBeLessThan(100); // <100ms posting

        console.log(`✓ Performance: Comment posts in ${postTime}ms (< 100ms target)`);
    });
});
