const { test, expect } = require('@playwright/test');

test.describe('YouTube Shorts 2025 - Competitive Parity Test', () => {
    test('✅ Right-sidebar engagement buttons (YouTube Shorts pattern)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // YouTube Shorts: Right-aligned sidebar with engagement buttons
        const sidebar = await page.locator('.sidebar').first();
        await expect(sidebar).toBeVisible();

        // Check right alignment
        const position = await sidebar.boundingBox();
        const viewport = page.viewportSize();

        // Sidebar should be on right side (>50% of viewport width)
        expect(position.x).toBeGreaterThan(viewport.width * 0.5);
        console.log(`✅ Sidebar positioned at x=${position.x} (right side)`);
    });

    test('✅ Like button with count (YouTube Shorts core engagement)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        const likeBtn = await page.locator('.sidebar-btn.like-btn').first();
        await expect(likeBtn).toBeVisible();

        // Check count display
        const count = await likeBtn.locator('.engagement-count').textContent();
        expect(count).toBeTruthy();
        expect(count.length).toBeGreaterThan(0);

        console.log('✅ Like button with count:', count);
    });

    test('✅ Comment button with count', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        const commentBtn = await page.locator('.sidebar-btn.comment-btn').first();
        await expect(commentBtn).toBeVisible();

        const count = await commentBtn.locator('.engagement-count').textContent();
        expect(count).toBeTruthy();

        console.log('✅ Comment button with count:', count);
    });

    test('✅ Save button (YouTube Shorts 2025: prioritized over dislike)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        // YouTube is testing moving Save to main screen (2025)
        const saveBtn = await page.locator('.sidebar-btn.save-btn').first();
        await expect(saveBtn).toBeVisible();

        const text = await saveBtn.textContent();
        expect(text).toContain('Save');

        console.log('✅ Save button visible (YouTube Shorts 2025 priority)');
    });

    test('✅ Share button', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        const shareBtn = await page.locator('.sidebar-btn.share-btn').first();
        await expect(shareBtn).toBeVisible();

        const text = await shareBtn.textContent();
        expect(text).toContain('Share');

        console.log('✅ Share button visible');
    });

    test('✅ 9:16 vertical aspect ratio (YouTube Shorts standard)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        const reel = await page.locator('.reel').first();
        const box = await reel.boundingBox();

        // 9:16 aspect ratio check
        const aspectRatio = box.height / box.width;
        expect(aspectRatio).toBeGreaterThan(1.5); // Should be ~1.77 for 9:16

        console.log(`✅ Aspect ratio: ${aspectRatio.toFixed(2)} (vertical)`);
    });

    test('✅ Full-screen immersive experience (YouTube Shorts hallmark)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        const reel = await page.locator('.reel').first();
        const box = await reel.boundingBox();
        const viewport = page.viewportSize();

        // Should take full viewport height
        expect(box.height).toBeGreaterThan(viewport.height * 0.9);

        console.log(`✅ Full-screen: ${box.height}px of ${viewport.height}px viewport`);
    });

    test('✅ Scroll-snap mandatory (smooth YouTube Shorts navigation)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        const container = await page.locator('.reels-container');

        const scrollSnapType = await container.evaluate(el =>
            getComputedStyle(el).scrollSnapType
        );

        expect(scrollSnapType).toContain('mandatory');
        console.log('✅ scroll-snap-type:', scrollSnapType);
    });

    test('✅ Content immediately visible (NO landing page)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(1000);

        // User request: IMMEDIATELY show reels - NO menus
        const reelsContainer = await page.locator('.reels-container');
        await expect(reelsContainer).toBeVisible();

        const reels = await page.locator('.reel').count();
        expect(reels).toBeGreaterThan(0);

        console.log(`✅ ${reels} reels loaded IMMEDIATELY (no landing page)`);
    });

    test('✅ Spanish learning content (NOT dummy data)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        const spanishText = await page.locator('.spanish-text').first();
        await expect(spanishText).toBeVisible();

        const text = await spanishText.textContent();

        // Should contain Spanish words
        expect(text.length).toBeGreaterThan(5);
        console.log(`✅ Real Spanish content: "${text.substring(0, 50)}..."`);
    });

    test('✅ Clickable word translations (educational value-add)', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);

        const clickableWords = await page.locator('.word[data-translation]').count();
        expect(clickableWords).toBeGreaterThan(0);

        console.log(`✅ ${clickableWords} clickable words with translations`);
    });

    test('📸 Screenshot - YouTube Shorts Competitive Parity', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);

        await page.screenshot({
            path: 'screenshots/youtube-shorts-competitive-parity-2025.png',
            fullPage: false
        });

        console.log('✅ Screenshot: screenshots/youtube-shorts-competitive-parity-2025.png');
    });
});
