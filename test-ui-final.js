// 📸 FINAL UI TEST - Confirm app is working
const { chromium } = require('playwright');

async function testUIFinal() {
    console.log('📱 Testing UI at http://localhost:3001...\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();

    try {
        await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(3000);

        // Check for content
        const feedItems = await page.locator('[class*="card"], [class*="item"], .skeleton-card').count();
        console.log(`✅ Feed items/skeletons found: ${feedItems}`);

        // Check for images
        const images = await page.locator('img').count();
        console.log(`🖼️  Images found: ${images}`);

        // Check for buttons
        const buttons = await page.locator('button').count();
        console.log(`🔘 Buttons found: ${buttons}`);

        // Check if there's a React error screen
        const errorScreen = await page.locator('text=/React.*error|error.*boundary|Something went wrong/i').count();
        console.log(`❌ Error screens: ${errorScreen}`);

        // Take screenshot
        await page.screenshot({ path: 'screenshots/ui-final-test.png', fullPage: true });
        console.log('\n📸 Screenshot: screenshots/ui-final-test.png');

        console.log('\n🎯 VERDICT:');
        if (errorScreen > 0) {
            console.log('❌ BROKEN - React error detected!');
        } else if (feedItems > 0 || images > 0) {
            console.log('✅ WORKING - UI loaded with content!');
        } else {
            console.log('⚠️  LOADING - Content may still be loading');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ path: 'screenshots/ui-error-final.png', fullPage: true });
    } finally {
        await browser.close();
    }
}

testUIFinal()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
