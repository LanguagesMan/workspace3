/**
 * Debug subtitle rendering
 */
const { test } = require('@playwright/test');

test('Debug subtitle rendering', async ({ page }) => {
    // Listen for console messages
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err));

    await page.goto('http://localhost:3002');

    // Click tap to start
    const tapBtn = page.locator('text=Tap to Start');
    if (await tapBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tapBtn.click();
    }

    // Wait and check what's rendered
    await page.waitForTimeout(8000);

    // Check for subtitle elements
    const captionContainer = await page.locator('.caption-container-0, .word-overlay').count();
    console.log('Caption containers found:', captionContainer);

    const dualCaptionBlock = await page.locator('.dual-caption-block').count();
    console.log('Dual caption blocks found:', dualCaptionBlock);

    const spanishText = await page.locator('.caption-spanish, .spanish-text').count();
    console.log('Spanish text elements found:', spanishText);

    // Check if WordLevelSubtitles is defined
    const hasWordLevelSubtitles = await page.evaluate(() => {
        return typeof window.WordLevelSubtitles !== 'undefined';
    });
    console.log('WordLevelSubtitles defined:', hasWordLevelSubtitles);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/debug-subtitles.png' });
});
