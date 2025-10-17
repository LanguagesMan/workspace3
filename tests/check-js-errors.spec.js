const { test } = require('@playwright/test');

test('Check JavaScript errors', async ({ page }) => {
    const errors = [];
    const logs = [];

    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        logs.push(`[${type}] ${text}`);
        console.log(`[CONSOLE ${type}] ${text}`);
    });

    page.on('pageerror', error => {
        errors.push(error.message);
        console.log(`[PAGE ERROR] ${error.message}`);
    });

    await page.goto('http://localhost:3002/');
    await page.waitForTimeout(5000);

    console.log(`\nSummary: ${logs.length} messages, ${errors.length} errors`);

    if (errors.length > 0) {
        console.log(`\nERRORS FOUND:`);
        errors.forEach(err => console.log(`  - ${err}`));
    }
});
