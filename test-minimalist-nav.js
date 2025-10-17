const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('🎯 Testing Ultra-Minimalist Navigation (2 items only)...');

    await page.goto('http://localhost:3001');
    await page.waitForTimeout(1500);

    // Screenshot: 2-item navigation
    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/minimalist-nav/01-two-item-navigation.png',
        fullPage: false
    });
    console.log('✅ Screenshot 1: Ultra-minimalist 2-item nav (Videos + Feed)');

    // Count nav items
    const navCount = await page.evaluate(() => {
        return document.querySelectorAll('.nav-item').length;
    });

    console.log(`\n📊 NAVIGATION STATS:`);
    console.log(`   Total Nav Items: ${navCount} (Target: 2)`);
    console.log(`   ${navCount === 2 ? '✅' : '❌'} Minimalist requirement met`);

    // Get nav item labels
    const navLabels = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.nav-label')).map(el => el.textContent);
    });

    console.log(`   Nav Items: ${navLabels.join(', ')}`);

    // Test navigation clicks
    await page.click('text=Videos');
    await page.waitForTimeout(500);

    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/minimalist-nav/02-videos-page.png',
        fullPage: false
    });
    console.log('✅ Screenshot 2: Videos page');

    // Go back to Feed
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(500);

    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/minimalist-nav/03-feed-page.png',
        fullPage: false
    });
    console.log('✅ Screenshot 3: Feed page');

    await browser.close();
    console.log('\n✅ Ultra-minimalist navigation testing complete!');
    console.log('📸 Screenshots saved to: /Users/mindful/_projects/workspace3/screenshots/minimalist-nav/');
})();
