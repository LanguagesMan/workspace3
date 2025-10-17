const { test, expect } = require('@playwright/test');

/**
 * Test: Transcription Fix - No Flashing/Flickering
 *
 * USER COMPLAINT: "transcriptions are flashing/broken"
 * ROOT CAUSE: DOM was being recreated every timeupdate event (60+ times/sec)
 * FIX: Only update DOM when active line INDEX changes
 *
 * This test verifies the fix works by:
 * 1. Loading a video with transcriptions
 * 2. Playing video for 5 seconds
 * 3. Counting DOM mutations to transcription overlay
 * 4. Verifying mutations are minimal (only when line changes, not every frame)
 */

test('Transcriptions update smoothly without flashing', async ({ page }) => {
    // Navigate to feed
    await page.goto('http://localhost:3001');

    // Wait for first video to load
    await page.waitForSelector('video', { timeout: 10000 });

    const video = page.locator('video').first();

    // Start playing video
    await video.evaluate(v => v.play());

    // Track DOM mutations to transcription overlay
    const mutationCount = await page.evaluate(() => {
        return new Promise((resolve) => {
            let mutations = 0;
            const overlay = document.querySelector('.transcription-overlay');

            if (!overlay) {
                resolve(0);
                return;
            }

            const observer = new MutationObserver(() => {
                mutations++;
            });

            observer.observe(overlay, {
                childList: true,
                subtree: true,
                characterData: true
            });

            // Monitor for 5 seconds
            setTimeout(() => {
                observer.disconnect();
                resolve(mutations);
            }, 5000);
        });
    });

    console.log(`📊 DOM mutations in 5 seconds: ${mutationCount}`);

    // BEFORE FIX: ~300 mutations (60 fps × 5 sec = 300 updates)
    // AFTER FIX: ~10 mutations (only when subtitle lines change, typically 2-3 lines per 5 sec)

    // Assert: Should have < 30 mutations (generous threshold allowing for 6 line changes)
    expect(mutationCount).toBeLessThan(30);

    // Take screenshot
    await page.screenshot({
        path: `screenshots/transcription-no-flash-${Date.now()}.png`,
        fullPage: false
    });
});

test('Transcription overlay shows and hides correctly', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Wait for video
    await page.waitForSelector('video', { timeout: 10000 });

    const video = page.locator('video').first();
    const overlay = page.locator('.transcription-overlay').first();

    // Play video
    await video.evaluate(v => v.play());

    // Wait for transcription to appear
    await page.waitForTimeout(2000);

    // Check if overlay has 'active' class (visible)
    const isActive = await overlay.evaluate(el => el.classList.contains('active'));

    // Should show transcription overlay when playing
    expect(isActive).toBe(true);

    // Verify Spanish and English text are visible
    const spanishText = await page.locator('.spanish-line').first().textContent();
    const englishText = await page.locator('.english-line').first().textContent();

    console.log(`🇪🇸 Spanish: ${spanishText}`);
    console.log(`🇺🇸 English: ${englishText}`);

    expect(spanishText.length).toBeGreaterThan(0);
    expect(englishText.length).toBeGreaterThan(0);
});

test('Clickable words work without breaking transcription', async ({ page }) => {
    await page.goto('http://localhost:3001');

    await page.waitForSelector('video', { timeout: 10000 });
    const video = page.locator('video').first();

    // Play video
    await video.evaluate(v => v.play());

    // Wait for transcription
    await page.waitForTimeout(2000);

    // Click a word in Spanish line
    const firstWord = page.locator('.spanish-line .word').first();
    await firstWord.click();

    // Verify tooltip appears
    const tooltip = page.locator('.word-tooltip');
    await expect(tooltip).toBeVisible();

    // Take screenshot of tooltip
    await page.screenshot({
        path: `screenshots/word-tooltip-${Date.now()}.png`,
        fullPage: false
    });
});
