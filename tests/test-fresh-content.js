const { chromium } = require('playwright');

async function testFreshContent() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 414, height: 896 }
    });
    const page = await context.newPage();

    console.log('🧪 TESTING FRESH CONTENT (NO CACHE)\n');

    // Navigate with cache cleared
    await page.goto('http://localhost:3001/unified-infinite-feed.html', {
        waitUntil: 'networkidle'
    });

    await page.waitForSelector('.content-card', { timeout: 5000 });
    await page.waitForTimeout(2000);

    // Get first 3 cards' Spanish text
    const cards = await page.locator('.content-card').all();
    console.log(`📊 Found ${cards.length} cards\n`);

    for (let i = 0; i < Math.min(cards.length, 5); i++) {
        const spanishText = await cards[i].locator('.spanish-text').textContent();
        const type = await cards[i].locator('.content-type').textContent();

        console.log(`${i+1}. Type: ${type}`);
        console.log(`   Spanish: ${spanishText.substring(0, 100)}...`);

        // Check if it's English (has common English words)
        const hasEnglish = /\b(is|are|the|and|of|to|in)\b/.test(spanishText);
        if (hasEnglish) {
            console.log(`   ⚠️  WARNING: Contains English words!`);
        } else {
            console.log(`   ✅ Looks like Spanish`);
        }
        console.log('');
    }

    await page.screenshot({ path: 'screenshots/FRESH-CONTENT-TEST.png', fullPage: true });

    console.log('⏸️  Browser open for 30s - verify Spanish content!');
    await page.waitForTimeout(30000);

    await browser.close();
}

testFreshContent().catch(console.error);
