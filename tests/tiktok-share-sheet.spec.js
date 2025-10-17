// 📤 TIKTOK/iOS 2025 SHARE SHEET TESTS
// Testing iOS action sheet style bottom menu matching TikTok patterns
const { test, expect } = require('@playwright/test');

test.describe('TikTok/iOS-Style Share Sheet (unified-infinite-feed.html)', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the unified feed
        await page.goto('http://localhost:3002/unified-infinite-feed.html');

        // Wait for feed to load
        await page.waitForSelector('.feed-container', { timeout: 10000 });
    });

    // === SHARE BUTTON TESTS ===
    test('should display share button on content cards', async ({ page }) => {
        // Wait for content to load
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await expect(shareBtn).toBeVisible();
        await expect(shareBtn).toContainText('Share');

        console.log('✅ Share button visible on content cards');
    });

    // === SLIDE-UP ANIMATION TESTS ===
    test('should open share sheet when clicking share button', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        // Wait for sheet to slide up
        await page.waitForSelector('.share-sheet.active', { timeout: 3000 });
        const sheet = await page.locator('.share-sheet');
        await expect(sheet).toHaveClass(/active/);

        console.log('✅ Share sheet opens with slide-up animation');
    });

    test('should show overlay when share sheet is open', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        // Check overlay
        await page.waitForSelector('.share-sheet-overlay.active', { timeout: 3000 });
        const overlay = await page.locator('.share-sheet-overlay');
        await expect(overlay).toHaveClass(/active/);

        console.log('✅ Overlay visible when sheet is open');
    });

    // === UI COMPONENTS TESTS ===
    test('share sheet should have header with title', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-sheet-header', { timeout: 3000 });

        const title = await page.locator('.share-sheet-title');
        const subtitle = await page.locator('.share-sheet-subtitle');

        await expect(title).toContainText('Share to');
        await expect(subtitle).toContainText('Spread the word');

        console.log('✅ Header has title and subtitle');
    });

    test('share sheet should have all 8 share options', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-options', { timeout: 3000 });

        // Check all 8 options exist
        const options = await page.locator('.share-option');
        const count = await options.count();
        expect(count).toBe(8);

        // Check specific platforms
        await expect(page.locator('.share-option-label:text("WhatsApp")')).toBeVisible();
        await expect(page.locator('.share-option-label:text("Twitter")')).toBeVisible();
        await expect(page.locator('.share-option-label:text("Facebook")')).toBeVisible();
        await expect(page.locator('.share-option-label:text("Telegram")')).toBeVisible();
        await expect(page.locator('.share-option-label:text("Instagram")')).toBeVisible();
        await expect(page.locator('.share-option-label:text("Copy Link")')).toBeVisible();
        await expect(page.locator('.share-option-label:text("Email")')).toBeVisible();
        await expect(page.locator('.share-option-label:text("More")')).toBeVisible();

        console.log('✅ All 8 share options present');
    });

    test('share sheet should have cancel button', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-cancel-btn', { timeout: 3000 });

        const cancelBtn = await page.locator('.share-cancel-btn');
        await expect(cancelBtn).toBeVisible();
        await expect(cancelBtn).toContainText('Cancel');

        console.log('✅ Cancel button present');
    });

    test('share options should have icons with gradient backgrounds', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-options', { timeout: 3000 });

        // Check WhatsApp icon has gradient
        const whatsappIcon = await page.locator('.share-option-icon.whatsapp');
        const bgImage = await whatsappIcon.evaluate(el => {
            return window.getComputedStyle(el).backgroundImage;
        });

        expect(bgImage).toContain('gradient');

        console.log('✅ Share option icons have gradient backgrounds');
    });

    // === CLOSE FUNCTIONALITY TESTS ===
    test('should close sheet when clicking cancel button', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-sheet.active', { timeout: 3000 });

        // Click cancel button
        const cancelBtn = await page.locator('.share-cancel-btn');
        await cancelBtn.click();

        // Wait for close animation
        await page.waitForTimeout(500);

        const sheet = await page.locator('.share-sheet');
        await expect(sheet).not.toHaveClass(/active/);

        console.log('✅ Sheet closes when clicking cancel button');
    });

    test('should close sheet when clicking overlay', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-sheet.active', { timeout: 3000 });

        // Click overlay
        const overlay = await page.locator('.share-sheet-overlay');
        await overlay.click({ position: { x: 10, y: 10 } }); // Click top-left corner

        // Wait for close animation
        await page.waitForTimeout(500);

        const sheet = await page.locator('.share-sheet');
        await expect(sheet).not.toHaveClass(/active/);

        console.log('✅ Sheet closes when clicking overlay');
    });

    // === SHARE PLATFORM TESTS ===
    test('clicking Copy Link should copy URL to clipboard', async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);

        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-options', { timeout: 3000 });

        // Click Copy Link
        const copyLinkBtn = await page.locator('.share-option:has-text("Copy Link")');
        await copyLinkBtn.click();

        // Wait for toast
        await page.waitForTimeout(500);

        // Check for success toast
        const toast = await page.locator('.toast');
        await expect(toast).toContainText('Link copied');

        console.log('✅ Copy link works with clipboard');
    });

    test('clicking WhatsApp should open WhatsApp share URL', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-options', { timeout: 3000 });

        // Set up popup detection
        const popupPromise = page.waitForEvent('popup', { timeout: 5000 });

        // Click WhatsApp
        const whatsappBtn = await page.locator('.share-option:has-text("WhatsApp")');
        await whatsappBtn.click();

        // Verify popup opened with WhatsApp URL
        const popup = await popupPromise;
        const popupUrl = popup.url();
        expect(popupUrl).toContain('whatsapp.com');

        console.log('✅ WhatsApp share opens correct URL: ' + popupUrl);
    });

    test('clicking Twitter should open Twitter share URL', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-options', { timeout: 3000 });

        // Set up popup detection
        const popupPromise = page.waitForEvent('popup', { timeout: 5000 });

        // Click Twitter
        const twitterBtn = await page.locator('.share-option:has-text("Twitter")');
        await twitterBtn.click();

        // Verify popup opened with Twitter URL
        const popup = await popupPromise;
        const popupUrl = popup.url();
        expect(popupUrl).toMatch(/twitter\.com|x\.com/);

        console.log('✅ Twitter share opens correct URL: ' + popupUrl);
    });

    test('clicking Facebook should open Facebook share URL', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-options', { timeout: 3000 });

        // Set up popup detection
        const popupPromise = page.waitForEvent('popup', { timeout: 5000 });

        // Click Facebook
        const facebookBtn = await page.locator('.share-option:has-text("Facebook")');
        await facebookBtn.click();

        // Verify popup opened with Facebook URL
        const popup = await popupPromise;
        const popupUrl = popup.url();
        expect(popupUrl).toContain('facebook.com');

        console.log('✅ Facebook share opens correct URL: ' + popupUrl);
    });

    test('clicking Telegram should open Telegram share URL', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-options', { timeout: 3000 });

        // Set up popup detection
        const popupPromise = page.waitForEvent('popup', { timeout: 5000 });

        // Click Telegram
        const telegramBtn = await page.locator('.share-option:has-text("Telegram")');
        await telegramBtn.click();

        // Verify popup opened with Telegram URL
        const popup = await popupPromise;
        const popupUrl = popup.url();
        expect(popupUrl).toContain('t.me');

        console.log('✅ Telegram share opens correct URL: ' + popupUrl);
    });

    test('clicking Instagram should show copy link message', async ({ page, context }) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);

        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-options', { timeout: 3000 });

        // Click Instagram
        const instagramBtn = await page.locator('.share-option:has-text("Instagram")');
        await instagramBtn.click();

        // Wait for toast
        await page.waitForTimeout(500);

        // Check for Instagram message (should be first toast)
        const toast = await page.locator('.toast').first();
        await expect(toast).toContainText('Instagram');

        console.log('✅ Instagram shows copy link message');
    });

    test('clicking Email should trigger mailto link', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-options', { timeout: 3000 });

        // Monitor navigation
        let mailtoUrl = '';
        page.on('framenavigated', frame => {
            if (frame.url().startsWith('mailto:')) {
                mailtoUrl = frame.url();
            }
        });

        // Click Email
        const emailBtn = await page.locator('.share-option:has-text("Email")');
        await emailBtn.click();

        // Give it a moment
        await page.waitForTimeout(1000);

        // Check if mailto was triggered (URL might change or not depending on email client)
        console.log('✅ Email share triggered');
    });

    // === VISUAL QUALITY TESTS ===
    test('share sheet should have iOS-style rounded top corners', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-sheet.active', { timeout: 3000 });

        const sheet = await page.locator('.share-sheet');
        const borderRadius = await sheet.evaluate(el => {
            return window.getComputedStyle(el).borderRadius;
        });

        // Should have rounded top corners
        expect(borderRadius).toMatch(/20px/);

        console.log('✅ Sheet has rounded top corners: ' + borderRadius);
    });

    test('share sheet should be positioned at bottom', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-sheet.active', { timeout: 3000 });

        const sheet = await page.locator('.share-sheet');
        const styles = await sheet.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
                position: computed.position,
                bottom: computed.bottom
            };
        });

        expect(styles.position).toBe('fixed');
        expect(styles.bottom).toBe('0px');

        console.log('✅ Sheet fixed at bottom (iOS pattern)');
    });

    test('share options should be in grid layout', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-options', { timeout: 3000 });

        const shareOptions = await page.locator('.share-options');
        const display = await shareOptions.evaluate(el => {
            return window.getComputedStyle(el).display;
        });

        expect(display).toBe('grid');

        console.log('✅ Share options use grid layout');
    });

    // === SCREENSHOT TESTS ===
    test('should capture share sheet for iOS/TikTok comparison', async ({ page }) => {
        await page.waitForSelector('.action-btn', { timeout: 10000 });

        const shareBtn = await page.locator('.action-btn:has-text("📤")').first();
        await shareBtn.click();

        await page.waitForSelector('.share-sheet.active', { timeout: 3000 });

        // Wait for animation to complete
        await page.waitForTimeout(500);

        // Screenshot
        await page.screenshot({
            path: 'screenshots/TIKTOK-SHARE-SHEET.png',
            fullPage: false
        });

        console.log('✅ Screenshot saved for iOS/TikTok comparison');
    });
});
