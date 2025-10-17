const { test } = require('@playwright/test');

test('Screenshot: Unified Database - Killer Feature', async ({ page }) => {
    // Save multiple words
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.video-card', { timeout: 10000 });

    // Save first word
    await page.locator('.word-clickable').first().click();
    await page.waitForSelector('.translation-popup.active', { timeout: 5000 });
    await page.screenshot({ path: 'screenshots/unified-database/01-word-translation-popup.png', fullPage: true });

    await page.click('.save-flashcard-btn');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/unified-database/02-word-saved-feedback.png', fullPage: true });

    // Navigate to Saved Words page
    await page.click('a[href="/saved-words.html"]');
    await page.waitForURL('**/saved-words.html');
    await page.waitForSelector('.words-grid', { timeout: 5000 });
    await page.screenshot({ path: 'screenshots/unified-database/03-saved-words-page.png', fullPage: true });

    console.log('✅ Screenshots saved to screenshots/unified-database/');
});
