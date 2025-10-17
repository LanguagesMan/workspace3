const { test, expect } = require('@playwright/test');

test('Check for console errors and network failures', async ({ page }) => {
    const consoleErrors = [];
    const networkErrors = [];

    // Capture console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    // Capture network errors
    page.on('requestfailed', request => {
        networkErrors.push(`${request.url()} - ${request.failure().errorText}`);
    });

    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

    // Wait for videos to load
    await page.waitForTimeout(5000);

    console.log('\n=== CONSOLE ERRORS ===');
    if (consoleErrors.length > 0) {
        consoleErrors.forEach(err => console.log('❌', err));
    } else {
        console.log('✅ No console errors');
    }

    console.log('\n=== NETWORK ERRORS ===');
    if (networkErrors.length > 0) {
        networkErrors.forEach(err => console.log('❌', err));
    } else {
        console.log('✅ No network errors');
    }

    console.log('\n=== PAGE STATE ===');
    const bodyText = await page.textContent('body');
    console.log('Loading indicator visible:', await page.locator('.loading').isVisible());
    console.log('Videos loaded:', await page.locator('video').count());
    console.log('Page title:', await page.title());

    // Take screenshot
    await page.screenshot({ path: `screenshots/${Date.now()}-error-diagnostic.png`, fullPage: true });
});
