/**
 * Check the actual rendered HTML to see what's happening
 */

const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Capture errors
    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error' || text.includes('ERROR') || text.includes('Failed')) {
            console.log('❌', text);
        }
    });

    page.on('pageerror', error => {
        console.log('💥 PAGE ERROR:', error.message);
    });

    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Get the actual HTML of feed container
    const html = await page.evaluate(() => {
        const container = document.getElementById('feedContainer');
        return container ? container.innerHTML.substring(0, 5000) : 'NO CONTAINER';
    });

    console.log('\n📄 RENDERED HTML (first 5000 chars):');
    console.log('═'.repeat(80));
    console.log(html);
    console.log('═'.repeat(80));

    // Check video count
    const videoCount = await page.locator('video').count();
    const cardCount = await page.locator('.content-card').count();
    console.log(`\n📊 Videos: ${videoCount}, Cards: ${cardCount}`);

    await page.waitForTimeout(5000);
    await browser.close();
})();
