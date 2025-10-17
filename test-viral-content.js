const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('🔥 Testing Viral Content Enhancer...');

    await page.goto('http://localhost:3001/viral-content-demo.html');
    await page.waitForTimeout(1500);

    // Screenshot 1: Boring content
    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/viral-content/01-boring-content.png',
        fullPage: false
    });
    console.log('✅ Screenshot 1: Boring language learning content');

    // Click "Show Viral Content"
    await page.click('button:has-text("Show Viral Content")');
    await page.waitForTimeout(500);

    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/viral-content/02-viral-content.png',
        fullPage: false
    });
    console.log('✅ Screenshot 2: Viral content with hooks');

    // Click "Enhance Content"
    await page.click('button:has-text("Enhance Content")');
    await page.waitForTimeout(500);

    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/viral-content/03-enhanced-content.png',
        fullPage: false
    });
    console.log('✅ Screenshot 3: Enhanced content (boring → viral)');

    await browser.close();
    console.log('\n✅ Viral content testing complete!');
    console.log('📸 Screenshots saved to: /Users/mindful/_projects/workspace3/screenshots/viral-content/');
})();
