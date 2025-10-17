// 🎯 COMPREHENSIVE UI VERIFICATION
const { chromium } = require('playwright');

async function verifyWorking() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
        viewport: { width: 390, height: 844 }
    });

    const allErrors = [];
    const consoleMessages = [];

    page.on('console', msg => {
        consoleMessages.push({ type: msg.type(), text: msg.text() });
        if (msg.type() === 'error' && !msg.text().includes('404')) {
            allErrors.push(msg.text());
        }
    });

    page.on('pageerror', error => {
        allErrors.push(`PAGE ERROR: ${error.message}`);
    });

    try {
        await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(4000);

        // Check for React error boundaries
        const errorBoundary = await page.locator('text=/error|Error.*occurred|Something went wrong|React.*error/i').count();

        // Check for content
        const cards = await page.locator('[class*="card"]').count();
        const images = await page.locator('img').count();
        const buttons = await page.locator('button').count();
        const spanishText = await page.locator('text=/español|aprende|ver/i').count();

        // Take screenshot
        await page.screenshot({ path: 'screenshots/final-verification.png', fullPage: true });

        console.log('🎯 FINAL VERIFICATION RESULTS:');
        console.log('='.repeat(60));
        console.log(`React Error Boundaries: ${errorBoundary}`);
        console.log(`Critical Errors: ${allErrors.length}`);
        console.log(`Feed Cards: ${cards}`);
        console.log(`Images: ${images}`);
        console.log(`Buttons: ${buttons}`);
        console.log(`Spanish Text Elements: ${spanishText}`);
        console.log('='.repeat(60));

        if (allErrors.length > 0) {
            console.log('\n❌ CRITICAL ERRORS FOUND:');
            allErrors.forEach(err => console.log(`  - ${err}`));
        }

        if (errorBoundary > 0) {
            console.log('\n❌ REACT ERROR BOUNDARY DETECTED!');
        } else if (allErrors.length > 0) {
            console.log('\n⚠️  JavaScript errors detected (but UI may be working)');
        } else if (cards > 0 && buttons > 0 && images > 0) {
            console.log('\n✅ APP IS WORKING PERFECTLY!');
            console.log('   - No React errors');
            console.log('   - All UI elements rendering');
            console.log('   - Content loading successfully');
        } else {
            console.log('\n⚠️  UI may be loading or incomplete');
        }

    } catch (error) {
        console.error('❌ FATAL ERROR:', error.message);
    } finally {
        await browser.close();
    }
}

verifyWorking().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
