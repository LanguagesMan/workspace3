/**
 * Debug user flow - Check what user actually sees
 */
const { test, expect } = require('@playwright/test');

test('Debug: Full user flow with console logs', async ({ page }) => {
    // Capture console logs
    const logs = [];
    const errors = [];

    page.on('console', msg => {
        logs.push(`${msg.type()}: ${msg.text()}`);
        console.log(`BROWSER ${msg.type()}: ${msg.text()}`);
    });

    page.on('pageerror', error => {
        errors.push(error.message);
        console.log(`PAGE ERROR: ${error.message}`);
    });

    // Navigate
    console.log('Navigating to http://localhost:3002');
    await page.goto('http://localhost:3002');

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/debug-initial.png' });
    console.log('Initial screenshot saved');

    // Check for Tap to Start
    const tapToStart = page.locator('#tapToStart');
    const isTapVisible = await tapToStart.isVisible();
    console.log(`Tap to Start visible: ${isTapVisible}`);

    if (isTapVisible) {
        // Click it
        console.log('Clicking Tap to Start...');
        await tapToStart.click();
        await page.waitForTimeout(2000);

        // Take screenshot after click
        await page.screenshot({ path: 'screenshots/debug-after-tap.png' });
        console.log('After-tap screenshot saved');
    }

    // Wait for videos to load
    console.log('Waiting for videos...');
    await page.waitForTimeout(5000);

    // Check video count
    const videoCount = await page.locator('.reel video').count();
    console.log(`Videos loaded: ${videoCount}`);

    // Take final screenshot
    await page.screenshot({ path: 'screenshots/debug-final.png', fullPage: true });
    console.log('Final screenshot saved');

    // Check for any error elements
    const errorElements = await page.locator('.error, .error-message, [class*="error"]').count();
    console.log(`Error elements found: ${errorElements}`);

    // Log all console messages
    console.log('\n=== CONSOLE LOGS ===');
    logs.forEach(log => console.log(log));

    if (errors.length > 0) {
        console.log('\n=== PAGE ERRORS ===');
        errors.forEach(err => console.log(err));
    }

    // Check current URL
    console.log(`\nCurrent URL: ${page.url()}`);

    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
});
