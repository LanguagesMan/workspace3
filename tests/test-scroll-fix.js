const { chromium } = require('playwright');

async function testScrollFix() {
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const page = await browser.newPage({ viewport: { width: 414, height: 896 } });

    console.log('🧪 TESTING INFINITE SCROLL FIX\n');

    await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const initialCards = await page.locator('.content-card').count();
    console.log(`📊 Initial cards: ${initialCards}`);

    // Scroll to bottom
    console.log('\n📜 Scrolling to trigger infinite scroll...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    const afterScrollCards = await page.locator('.content-card').count();
    console.log(`📊 After scroll cards: ${afterScrollCards}`);

    await page.screenshot({ path: 'screenshots/SCROLL-FIX-TEST.png', fullPage: true });

    console.log('\n' + '='.repeat(70));
    if (afterScrollCards > initialCards) {
        console.log('✅ INFINITE SCROLL WORKS!');
        console.log(`   Loaded ${afterScrollCards - initialCards} new cards`);
        console.log(`   Total: ${initialCards} → ${afterScrollCards}`);
    } else {
        console.log('❌ Infinite scroll still broken');
        console.log(`   Cards stayed at: ${initialCards}`);
    }
    console.log('='.repeat(70));

    console.log('\n⏸️  Browser open for 20s...\n');
    await page.waitForTimeout(20000);

    await browser.close();

    return afterScrollCards > initialCards;
}

testScrollFix().catch(console.error);
