const { test, expect } = require('@playwright/test');

test.describe('Critical Fixes Verification', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app
        await page.goto('http://localhost:3001');
        // Wait for video cards to load
        await page.waitForSelector('.video-card', { timeout: 10000 });
    });

    test('1. Delete button visible in sidebar', async ({ page }) => {
        // Check delete button exists in sidebar
        const deleteBtn = page.locator('.sidebar-button.delete-btn').first();
        await expect(deleteBtn).toBeVisible({ timeout: 5000 });

        // Check it has trash icon (SVG)
        const icon = deleteBtn.locator('svg');
        await expect(icon).toBeVisible();

        // Check it has "Delete" text
        const deleteText = deleteBtn.locator('.sidebar-count');
        await expect(deleteText).toContainText('Delete');

        console.log('✅ Test 1 passed: Delete button visible in sidebar');
    });

    test('2. Speed button in sidebar with correct cycle (1x → 0.5x → 0.75x)', async ({ page }) => {
        // Find speed button in sidebar
        const speedBtn = page.locator('.sidebar-button.speed-btn').first();
        await expect(speedBtn).toBeVisible({ timeout: 5000 });

        // Initial speed should be 1x
        let speedText = await speedBtn.locator('.speed-display').textContent();
        expect(speedText).toBe('1x');
        console.log(`Initial speed: ${speedText}`);

        // Click once → should go to 0.5x (half speed)
        await speedBtn.click();
        await page.waitForTimeout(500);
        speedText = await speedBtn.locator('.speed-display').textContent();
        expect(speedText).toBe('0.5x');
        console.log(`After 1st click: ${speedText}`);

        // Click twice → should go to 0.75x
        await speedBtn.click();
        await page.waitForTimeout(500);
        speedText = await speedBtn.locator('.speed-display').textContent();
        expect(speedText).toBe('0.75x');
        console.log(`After 2nd click: ${speedText}`);

        // Click three times → back to 1x
        await speedBtn.click();
        await page.waitForTimeout(500);
        speedText = await speedBtn.locator('.speed-display').textContent();
        expect(speedText).toBe('1x');
        console.log(`After 3rd click: ${speedText} (back to normal)`);

        console.log('✅ Test 2 passed: Speed button cycle works correctly');
    });

    test('3. Subtitles show only ONE line at a time (Spanish only)', async ({ page }) => {
        // Wait for transcription overlay to appear
        await page.waitForTimeout(2000); // Let video start playing

        // Check Spanish line is present
        const spanishLine = page.locator('.spanish-line').first();
        await expect(spanishLine).toBeVisible({ timeout: 5000 });

        // Check English line is HIDDEN (display: none)
        const englishLine = page.locator('.english-line').first();
        const englishVisible = await englishLine.isVisible();
        expect(englishVisible).toBe(false);
        console.log('✅ English line is hidden (display: none)');

        // Verify only Spanish is showing
        const spanishText = await spanishLine.textContent();
        console.log(`Spanish subtitle showing: "${spanishText.substring(0, 50)}..."`);

        console.log('✅ Test 3 passed: Only Spanish subtitles visible');
    });

    test('4. Subtitles have professional black outline (TikTok-style)', async ({ page }) => {
        // Wait for subtitles to appear
        await page.waitForTimeout(2000);

        const spanishLine = page.locator('.spanish-line').first();
        await expect(spanishLine).toBeVisible({ timeout: 5000 });

        // Check CSS has text-stroke
        const textStroke = await spanishLine.evaluate(el =>
            window.getComputedStyle(el).webkitTextStroke ||
            window.getComputedStyle(el).textStroke
        );

        // Should have stroke defined (may be "2px black" or similar)
        expect(textStroke).toBeTruthy();
        console.log(`Text stroke: ${textStroke}`);

        // Check if stroke contains "2px" and "black"
        const strokeLower = textStroke.toLowerCase();
        const hasStroke = strokeLower.includes('2px') || strokeLower.includes('black') || strokeLower.includes('rgb(0, 0, 0)');
        expect(hasStroke).toBeTruthy();

        console.log('✅ Test 4 passed: Subtitles have black outline');
    });

    test('5. All sidebar buttons match style and count', async ({ page }) => {
        // Wait for sidebar to be fully rendered
        await page.waitForSelector('.sidebar', { timeout: 5000 });

        // Check first video card's sidebar (should have 5 buttons)
        const firstSidebar = page.locator('.sidebar').first();
        const buttons = firstSidebar.locator('.sidebar-button');
        const count = await buttons.count();

        // Should have: speed, like, comment, share, delete = 5 buttons
        expect(count).toBe(5);
        console.log(`First sidebar has ${count} buttons`);

        // Check all buttons in first sidebar are visible
        for (let i = 0; i < count; i++) {
            const btn = buttons.nth(i);
            await expect(btn).toBeVisible();

            // Check button has SVG icon
            const svg = btn.locator('svg');
            await expect(svg).toBeVisible();

            // Check button has label/count
            const label = btn.locator('.sidebar-count');
            await expect(label).toBeVisible();
        }

        // Verify buttons are in correct order (speed, like, comment, share, delete)
        const speedBtn = buttons.nth(0);
        const likeBtn = buttons.nth(1);
        const commentBtn = buttons.nth(2);
        const shareBtn = buttons.nth(3);
        const deleteBtn = buttons.nth(4);

        // Check each button has correct icon
        await expect(speedBtn.locator('.speed-display')).toBeVisible();
        await expect(likeBtn.locator('svg path[d*="20.84"]')).toBeVisible(); // Heart path
        await expect(commentBtn.locator('svg path[d*="21 15"]')).toBeVisible(); // Comment path
        await expect(shareBtn.locator('svg path[d*="4 12"]')).toBeVisible(); // Share path

        // Delete button has polyline element (trash icon)
        const deleteIcon = deleteBtn.locator('svg polyline, svg line');
        const deleteIconCount = await deleteIcon.count();
        expect(deleteIconCount).toBeGreaterThan(0); // Should have polyline or line elements

        console.log('✅ Test 5 passed: All sidebar buttons present and styled correctly');
    });

    test('6. Old speed button removed (not present on page)', async ({ page }) => {
        // Check that old .speed-btn-thumb button does NOT exist
        const oldSpeedBtn = page.locator('.speed-btn-thumb');
        const count = await oldSpeedBtn.count();
        expect(count).toBe(0);

        console.log('✅ Test 6 passed: Old speed button completely removed');
    });

    test('7. Delete button functionality (confirmation dialog)', async ({ page }) => {
        // Find delete button
        const deleteBtn = page.locator('.sidebar-button.delete-btn').first();
        await expect(deleteBtn).toBeVisible({ timeout: 5000 });

        // Set up dialog handler to catch confirmation
        let dialogAppeared = false;
        page.on('dialog', async dialog => {
            dialogAppeared = true;
            expect(dialog.message()).toContain('Delete this video permanently');
            await dialog.dismiss(); // Cancel the deletion
        });

        // Click delete button
        await deleteBtn.click();
        await page.waitForTimeout(1000);

        // Verify confirmation dialog appeared
        expect(dialogAppeared).toBe(true);

        console.log('✅ Test 7 passed: Delete confirmation dialog works');
    });
});
