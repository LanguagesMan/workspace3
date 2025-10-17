// Debug test to see what's happening when page loads
const { test, expect } = require('@playwright/test');

test('Debug page load and check for errors', async ({ page }) => {
    const errors = [];
    const consoleMessages = [];

    // Capture console errors
    page.on('console', msg => {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    // Capture page errors
    page.on('pageerror', error => {
        errors.push(`Page Error: ${error.message}`);
    });

    console.log('🔍 Loading page...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

    console.log('📄 Page title:', await page.title());
    console.log('🌐 Page URL:', page.url());

    // Wait a bit for JS to execute
    await page.waitForTimeout(5000);

    // Check what's on the page
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('📝 Body text (first 500 chars):', bodyText.substring(0, 500));

    // Check for loading indicator
    const loadingEl = await page.locator('#loading').count();
    console.log('⏳ Loading element count:', loadingEl);
    if (loadingEl > 0) {
        const loadingVisible = await page.locator('#loading').isVisible();
        const loadingText = await page.locator('#loading').textContent();
        console.log('⏳ Loading visible?', loadingVisible);
        console.log('⏳ Loading text:', loadingText);
    }

    // Check for video cards
    const videoCardCount = await page.locator('.video-card').count();
    console.log('🎬 Video card count:', videoCardCount);

    // Check for feed container
    const feedContainer = await page.locator('#feedContainer').count();
    console.log('📦 Feed container count:', feedContainer);

    // Print all errors
    console.log('\n❌ JavaScript Errors:');
    errors.forEach(err => console.log('  -', err));

    // Print last 20 console messages
    console.log('\n📋 Last 20 console messages:');
    consoleMessages.slice(-20).forEach(msg => console.log('  -', msg));

    // Take a screenshot
    await page.screenshot({ path: '/tmp/debug-page-load.png', fullPage: true });
    console.log('📸 Screenshot saved to /tmp/debug-page-load.png');
});
