const { test } = require('@playwright/test');

test('🔍 Check JavaScript console for errors', async ({ page }) => {
    const errors = [];
    const logs = [];

    page.on('console', msg => {
        logs.push(`[${msg.type()}] ${msg.text()}`);
        console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
    });

    page.on('pageerror', error => {
        errors.push(error.message);
        console.log(`[PAGE ERROR] ${error.message}`);
        console.log(error.stack);
    });

    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(5000);

    console.log(`\n📊 Summary:`);
    console.log(`   Console messages: ${logs.length}`);
    console.log(`   JavaScript errors: ${errors.length}`);

    if (errors.length > 0) {
        console.log(`\n❌ ERRORS FOUND:`);
        errors.forEach((err, i) => console.log(`   ${i+1}. ${err}`));
    }
});
