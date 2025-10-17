const { test } = require('@playwright/test');

test('Diagnose video loading issue', async ({ page }) => {
    // Listen to console messages
    page.on('console', msg => console.log(`BROWSER: ${msg.type()}: ${msg.text()}`));

    // Listen to errors
    page.on('pageerror', err => console.log(`PAGE ERROR: ${err.message}`));

    // Navigate
    console.log('Navigating to http://localhost:3002...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle', timeout: 30000 });

    // Wait a bit for videos to load
    await page.waitForTimeout(8000);

    // Check what's on the page
    const videoCount = await page.locator('video').count();
    console.log(`✅ Found ${videoCount} video elements`);

    const subtitleText = await page.locator('.interactive-subtitles').first().textContent();
    console.log(`✅ First subtitle text: ${subtitleText}`);

    const clickableWords = await page.locator('.word-clickable').count();
    console.log(`✅ Found ${clickableWords} clickable words`);
});
