// 🔍 Check for React errors in browser console
const { chromium } = require('playwright');

async function checkErrors() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    const errors = [];
    const warnings = [];

    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();

        if (type === 'error') {
            errors.push(text);
            console.log(`❌ ERROR: ${text}`);
        } else if (type === 'warning') {
            warnings.push(text);
            console.log(`⚠️  WARNING: ${text}`);
        }
    });

    page.on('pageerror', error => {
        errors.push(error.message);
        console.log(`❌ PAGE ERROR: ${error.message}`);
    });

    try {
        console.log('🔍 Loading http://localhost:3001...\n');
        await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(5000);

        // Take screenshot
        await page.screenshot({ path: 'screenshots/error-check.png', fullPage: true });

        console.log(`\n📊 Summary:`);
        console.log(`Errors: ${errors.length}`);
        console.log(`Warnings: ${warnings.length}`);

        if (errors.length > 0) {
            console.log('\n🔴 ERRORS FOUND:');
            errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
        } else {
            console.log('\n✅ NO ERRORS - App is working!');
        }

        console.log('\n⏳ Keeping browser open for 30 seconds for inspection...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Failed:', error.message);
    } finally {
        await browser.close();
    }
}

checkErrors();
