const playwright = require('playwright');

(async () => {
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('🚀 Testing Virtual Scroll Performance Demo...');

    // Navigate to demo
    await page.goto('http://localhost:3001/virtual-scroll-demo.html');
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/virtual-scroll-demo/01-initial-load.png',
        fullPage: false
    });
    console.log('✅ Screenshot 1: Initial load');

    // Scroll down to load more content
    await page.evaluate(() => window.scrollBy(0, 2000));
    await page.waitForTimeout(1000);

    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/virtual-scroll-demo/02-scrolled-2000px.png',
        fullPage: false
    });
    console.log('✅ Screenshot 2: Scrolled 2000px');

    // Scroll more to trigger loading
    await page.evaluate(() => window.scrollBy(0, 3000));
    await page.waitForTimeout(1000);

    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/virtual-scroll-demo/03-scrolled-5000px.png',
        fullPage: false
    });
    console.log('✅ Screenshot 3: Scrolled 5000px (performance test)');

    // Get performance stats
    const stats = await page.evaluate(() => {
        return {
            totalItems: document.getElementById('totalItems').textContent,
            renderedItems: document.getElementById('renderedItems').textContent,
            efficiency: document.getElementById('efficiency').textContent,
            fps: document.getElementById('fps').textContent
        };
    });

    console.log('\n📊 PERFORMANCE STATS:');
    console.log(`   Total Items: ${stats.totalItems}`);
    console.log(`   Rendered Items: ${stats.renderedItems}`);
    console.log(`   Memory Efficiency: ${stats.efficiency}%`);
    console.log(`   FPS: ${stats.fps}`);

    // Take final stats screenshot
    await page.screenshot({
        path: '/Users/mindful/_projects/workspace3/screenshots/virtual-scroll-demo/04-performance-stats.png',
        fullPage: false
    });
    console.log('✅ Screenshot 4: Final performance stats');

    await browser.close();
    console.log('\n✅ Virtual scroll testing complete!');
    console.log('📸 Screenshots saved to: /Users/mindful/_projects/workspace3/screenshots/virtual-scroll-demo/');
})();
