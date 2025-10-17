// Quick screenshot test for dual-language transcriptions
const { test } = require('@playwright/test');

test('Screenshot dual-language transcriptions', async ({ page }) => {
    await page.goto('http://localhost:3001/vida-app.html');
    console.log('📱 Loaded vida-app');

    // Wait for videos to load
    await page.waitForTimeout(5000);

    // Take full screenshot
    await page.screenshot({
        path: 'screenshots/vida-dual-language-' + Date.now() + '.png',
        fullPage: true
    });

    console.log('📸 Screenshot saved');

    // Log what we see
    const spanishLines = await page.locator('.spanish-line');
    const count = await spanishLines.count();
    console.log(`Found ${count} Spanish subtitle lines`);

    if (count > 0) {
        const firstText = await spanishLines.first().textContent();
        console.log('🇪🇸 First Spanish line:', firstText);
    }

    const englishLines = await page.locator('.english-line');
    const enCount = await englishLines.count();
    console.log(`Found ${enCount} English subtitle lines`);

    if (enCount > 0) {
        const firstEnText = await englishLines.first().textContent();
        console.log('🇺🇸 First English line:', firstEnText);
    }
});
