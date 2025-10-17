// 💬 TIKTOK 2025 COMMENT SHEET TESTS
// Testing slide-up bottom sheet matching TikTok patterns
const { test, expect } = require('@playwright/test');

test.describe('TikTok-Style Comment Sheet (unified-infinite-feed.html)', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the unified feed
        await page.goto('http://localhost:3002/unified-infinite-feed.html');

        // Wait for feed to load
        await page.waitForSelector('.feed-container', { timeout: 10000 });
    });

    // === COMMENT BUTTON TESTS ===
    test('should display comment button on content cards', async ({ page }) => {
        // Wait for content to load
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await expect(commentBtn).toBeVisible();

        console.log('✅ Comment button visible on content cards');
    });

    test('comment button should show count', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        const countText = await commentBtn.textContent();

        expect(countText).toContain('💬');
        expect(countText).toMatch(/\d+/); // Should contain a number

        console.log('✅ Comment button shows count: ' + countText.trim());
    });

    // === SLIDE-UP ANIMATION TESTS ===
    test('should open comment sheet when clicking comment button', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        // Wait for sheet to slide up
        await page.waitForSelector('.comment-sheet.active', { timeout: 3000 });
        const sheet = await page.locator('.comment-sheet');
        await expect(sheet).toHaveClass(/active/);

        console.log('✅ Comment sheet opens with slide-up animation');
    });

    test('should show overlay when comment sheet is open', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        // Check overlay
        await page.waitForSelector('.comment-sheet-overlay.active', { timeout: 3000 });
        const overlay = await page.locator('.comment-sheet-overlay');
        await expect(overlay).toHaveClass(/active/);

        console.log('✅ Overlay visible when sheet is open');
    });

    // === UI COMPONENTS TESTS ===
    test('comment sheet should have TikTok-style drag handle', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('.comment-sheet-handle', { timeout: 3000 });
        const handle = await page.locator('.comment-sheet-handle');
        await expect(handle).toBeVisible();

        console.log('✅ Drag handle present (TikTok pattern)');
    });

    test('comment sheet should have header with title and close button', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('.comment-sheet-header', { timeout: 3000 });

        const title = await page.locator('.comment-sheet-title');
        const closeBtn = await page.locator('.comment-close-btn');

        await expect(title).toContainText('Comments');
        await expect(closeBtn).toBeVisible();

        console.log('✅ Header has title and close button');
    });

    test('comment sheet should have input at bottom', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('.comment-input-wrapper', { timeout: 3000 });

        const input = await page.locator('#global-comment-input');
        const postBtn = await page.locator('#global-comment-post-btn');

        await expect(input).toBeVisible();
        await expect(postBtn).toBeVisible();

        console.log('✅ Comment input at bottom (TikTok fixed position)');
    });

    // === CLOSE FUNCTIONALITY TESTS ===
    test('should close sheet when clicking close button', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('.comment-sheet.active', { timeout: 3000 });

        // Click close button
        const closeBtn = await page.locator('.comment-close-btn');
        await closeBtn.click();

        // Wait for close animation
        await page.waitForTimeout(500);

        const sheet = await page.locator('.comment-sheet');
        await expect(sheet).not.toHaveClass(/active/);

        console.log('✅ Sheet closes when clicking close button');
    });

    test('should close sheet when clicking overlay', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('.comment-sheet.active', { timeout: 3000 });

        // Click overlay
        const overlay = await page.locator('.comment-sheet-overlay');
        await overlay.click({ position: { x: 10, y: 10 } }); // Click top-left corner

        // Wait for close animation
        await page.waitForTimeout(500);

        const sheet = await page.locator('.comment-sheet');
        await expect(sheet).not.toHaveClass(/active/);

        console.log('✅ Sheet closes when clicking overlay');
    });

    // === EMPTY STATE TESTS ===
    test('should show empty state when no comments', async ({ page }) => {
        // Clear all comments first
        await page.evaluate(() => {
            localStorage.setItem('comments', '{}');
        });

        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('.comments-empty', { timeout: 3000 });

        const emptyIcon = await page.locator('.comments-empty-icon');
        const emptyText = await page.locator('.comments-empty-text').first();

        await expect(emptyIcon).toContainText('💬');
        await expect(emptyText).toContainText('No comments yet');

        console.log('✅ Empty state shown when no comments');
    });

    // === COMMENT POSTING TESTS ===
    test('should post comment when clicking Post button', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('#global-comment-input', { timeout: 3000 });

        // Type comment
        const input = await page.locator('#global-comment-input');
        await input.fill('¡Me encanta este contenido!');

        // Click post
        const postBtn = await page.locator('#global-comment-post-btn');
        await postBtn.click();

        // Wait for comment to appear
        await page.waitForTimeout(500);

        const commentItem = await page.locator('.comment-item');
        await expect(commentItem).toBeVisible();

        const commentText = await page.locator('.comment-text').first();
        await expect(commentText).toContainText('¡Me encanta este contenido!');

        console.log('✅ Comment posted successfully');
    });

    test('should post comment when pressing Enter', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('#global-comment-input', { timeout: 3000 });

        // Type comment and press Enter
        const input = await page.locator('#global-comment-input');
        await input.fill('Test comment via Enter key');
        await input.press('Enter');

        // Wait for comment to appear
        await page.waitForTimeout(500);

        const commentText = await page.locator('.comment-text').first();
        await expect(commentText).toContainText('Test comment via Enter key');

        console.log('✅ Comment posted via Enter key');
    });

    test('should clear input after posting', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('#global-comment-input', { timeout: 3000 });

        const input = await page.locator('#global-comment-input');
        await input.fill('Test comment');
        await input.press('Enter');

        // Wait for post
        await page.waitForTimeout(500);

        const inputValue = await input.inputValue();
        expect(inputValue).toBe('');

        console.log('✅ Input cleared after posting');
    });

    // === COMMENT DISPLAY TESTS ===
    test('posted comment should have TikTok-style layout', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('#global-comment-input', { timeout: 3000 });

        // Post a comment
        const input = await page.locator('#global-comment-input');
        await input.fill('Testing layout');
        await input.press('Enter');

        await page.waitForTimeout(500);

        // Check comment components
        const avatar = await page.locator('.comment-avatar').first();
        const author = await page.locator('.comment-author').first();
        const text = await page.locator('.comment-text').first();
        const time = await page.locator('.comment-time').first();
        const actions = await page.locator('.comment-actions').first();

        await expect(avatar).toBeVisible();
        await expect(author).toBeVisible();
        await expect(text).toBeVisible();
        await expect(time).toBeVisible();
        await expect(actions).toBeVisible();

        console.log('✅ Comment has TikTok-style layout (avatar + content)');
    });

    test('comment should show time ago', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('#global-comment-input', { timeout: 3000 });

        const input = await page.locator('#global-comment-input');
        await input.fill('Test time');
        await input.press('Enter');

        await page.waitForTimeout(500);

        const time = await page.locator('.comment-time').first();
        const timeText = await time.textContent();

        expect(timeText).toMatch(/just now|ago|now/i);

        console.log('✅ Comment shows time ago: ' + timeText);
    });

    test('comment should have like and reply buttons', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('#global-comment-input', { timeout: 3000 });

        const input = await page.locator('#global-comment-input');
        await input.fill('Test actions');
        await input.press('Enter');

        await page.waitForTimeout(500);

        const actions = await page.locator('.comment-action-btn');
        const count = await actions.count();

        expect(count).toBeGreaterThanOrEqual(2); // Like + Reply

        const firstAction = await actions.first().textContent();
        expect(firstAction).toMatch(/Like|Reply/i);

        console.log('✅ Comment has action buttons (Like, Reply)');
    });

    // === COMMENT COUNT TESTS ===
    test('should update comment count after posting', async ({ page }) => {
        // Clear comments first
        await page.evaluate(() => {
            localStorage.setItem('comments', '{}');
        });

        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();

        // Get initial count
        const initialCount = await commentBtn.textContent();

        // Open and post comment
        await commentBtn.click();
        await page.waitForSelector('#global-comment-input', { timeout: 3000 });

        const input = await page.locator('#global-comment-input');
        await input.fill('Count test');
        await input.press('Enter');

        await page.waitForTimeout(500);

        // Close sheet
        const closeBtn = await page.locator('.comment-close-btn');
        await closeBtn.click();

        await page.waitForTimeout(500);

        // Check updated count
        const newCount = await commentBtn.textContent();

        expect(newCount).not.toBe(initialCount);

        console.log(`✅ Comment count updated: ${initialCount.trim()} → ${newCount.trim()}`);
    });

    // === VISUAL QUALITY TESTS ===
    test('comment sheet should have TikTok-style rounded top corners', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('.comment-sheet.active', { timeout: 3000 });

        const sheet = await page.locator('.comment-sheet');
        const borderRadius = await sheet.evaluate(el => {
            return window.getComputedStyle(el).borderRadius;
        });

        // Should have rounded top corners
        expect(borderRadius).toMatch(/20px/);

        console.log('✅ Sheet has rounded top corners: ' + borderRadius);
    });

    test('comment sheet should be positioned at bottom', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('.comment-sheet.active', { timeout: 3000 });

        const sheet = await page.locator('.comment-sheet');
        const styles = await sheet.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                position: computed.position,
                bottom: computed.bottom
            };
        });

        expect(styles.position).toBe('fixed');
        expect(styles.bottom).toBe('0px');

        console.log('✅ Sheet fixed at bottom (TikTok pattern)');
    });

    // === SCREENSHOT TESTS ===
    test('should capture comment sheet for TikTok comparison', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const commentBtn = await page.locator('.action-btn:has-text("💬")').first();
        await commentBtn.click();

        await page.waitForSelector('.comment-sheet.active', { timeout: 3000 });

        // Add a few comments for visual richness
        const input = await page.locator('#global-comment-input');
        await input.fill('Amazing content! 🎉');
        await input.press('Enter');

        await page.waitForTimeout(300);

        await input.fill('Learning so much here!');
        await input.press('Enter');

        await page.waitForTimeout(300);

        // Screenshot
        await page.screenshot({
            path: 'screenshots/TIKTOK-COMMENT-SHEET.png',
            fullPage: false
        });

        console.log('✅ Screenshot saved for TikTok comparison');
    });
});
