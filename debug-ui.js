// 🔍 DEBUG UI - Check for React errors in browser console
const { chromium } = require('playwright');

async function debugUI() {
    console.log('🔍 Checking http://localhost:3001 for errors...\n');

    const browser = await chromium.launch({ headless: false }); // Open browser to see
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    // Capture console messages
    const consoleLogs = [];
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        consoleLogs.push({ type, text });

        if (type === 'error' || type === 'warning') {
            console.log(`[${type.toUpperCase()}] ${text}`);
        }
    });

    // Capture page errors
    page.on('pageerror', error => {
        console.log(`[PAGE ERROR] ${error.message}`);
    });

    try {
        console.log('🌐 Loading http://localhost:3001...');
        await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(3000);

        // Check for error elements
        const errorText = await page.locator('text=/error|Error|ERROR/i').first().textContent().catch(() => null);
        if (errorText) {
            console.log(`\n❌ ERROR DETECTED ON PAGE: ${errorText}`);
        }

        // Check if feed loaded
        const feedExists = await page.locator('#feed, .feed-container, [class*="feed"]').count();
        console.log(`\n📱 Feed elements found: ${feedExists}`);

        // Check for images
        const images = await page.locator('img').count();
        console.log(`🖼️  Images found: ${images}`);

        // Check for buttons
        const buttons = await page.locator('button').count();
        console.log(`🔘 Buttons found: ${buttons}`);

        // Take screenshot
        await page.screenshot({ path: 'screenshots/debug-ui-browser.png', fullPage: true });
        console.log('\n📸 Screenshot saved: screenshots/debug-ui-browser.png');

        // Print all console logs
        console.log('\n📋 Browser Console Logs:');
        console.log('='.repeat(60));
        consoleLogs.forEach(log => {
            console.log(`[${log.type}] ${log.text}`);
        });

        console.log('\n✅ Browser will stay open for 10 seconds for manual inspection...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('\n❌ Failed to load page:', error.message);
        await page.screenshot({ path: 'screenshots/debug-ui-error.png', fullPage: true });
    } finally {
        await browser.close();
    }
}

debugUI()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Debug failed:', error);
        process.exit(1);
    });
