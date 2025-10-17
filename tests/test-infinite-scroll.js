const { chromium } = require('playwright');

async function testInfiniteScroll() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
        viewport: { width: 414, height: 896 }
    });

    console.log('📜 TESTING INFINITE SCROLL\n');

    try {
        await page.goto('http://localhost:3001/unified-infinite-feed.html', {
            waitUntil: 'networkidle',
            timeout: 15000
        });

        console.log('✅ Page loaded\n');

        // Initial count
        await page.waitForSelector('.content-card', { timeout: 5000 });
        const initialCards = await page.locator('.content-card').count();
        console.log(`📊 Initial cards: ${initialCards}`);

        // Scroll to bottom
        console.log('📜 Scrolling to bottom...');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);

        // Check for loading indicator
        const loadingVisible = await page.locator('#loadingSpinner').isVisible();
        console.log(`⏳ Loading spinner visible: ${loadingVisible ? '✅ YES' : '❌ NO'}`);

        // Wait for new content
        await page.waitForTimeout(3000);

        // New count
        const newCards = await page.locator('.content-card').count();
        console.log(`📊 Cards after scroll: ${newCards}`);

        const loaded = newCards > initialCards;
        console.log(`\n${loaded ? '✅ SUCCESS' : '❌ FAIL'}: Infinite scroll ${loaded ? 'WORKING' : 'NOT WORKING'}`);

        if (loaded) {
            console.log(`   Loaded ${newCards - initialCards} new cards`);

            // Check content variety
            const contentTypes = await page.evaluate(() => {
                const cards = Array.from(document.querySelectorAll('.content-card'));
                return cards.map(card => {
                    const badge = card.querySelector('.content-type');
                    return badge ? badge.textContent.trim() : 'unknown';
                });
            });

            const typeCounts = {};
            contentTypes.forEach(type => {
                typeCounts[type] = (typeCounts[type] || 0) + 1;
            });

            console.log('\n📊 CONTENT VARIETY:');
            Object.entries(typeCounts).forEach(([type, count]) => {
                console.log(`   ${type}: ${count} cards`);
            });

            const varietyScore = Object.keys(typeCounts).length;
            console.log(`\n${varietyScore >= 3 ? '✅' : '⚠️'} Variety: ${varietyScore} different types ${varietyScore >= 3 ? '(TikTok-level variety!)' : '(needs more variety)'}`);
        }

        // Test SECOND scroll
        console.log('\n📜 Testing SECOND scroll...');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(4000);

        const finalCards = await page.locator('.content-card').count();
        console.log(`📊 Cards after 2nd scroll: ${finalCards}`);

        const secondLoadWorked = finalCards > newCards;
        console.log(`${secondLoadWorked ? '✅' : '❌'} Second scroll: ${secondLoadWorked ? 'WORKING' : 'NOT WORKING'}`);

        // Screenshot
        await page.screenshot({
            path: 'screenshots/infinite-scroll-test.png',
            fullPage: true
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 FINAL RESULTS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Initial: ${initialCards} cards`);
        console.log(`After 1st scroll: ${newCards} cards (+${newCards - initialCards})`);
        console.log(`After 2nd scroll: ${finalCards} cards (+${finalCards - newCards})`);
        console.log(`\n${loaded && secondLoadWorked ? '🎉 INFINITE SCROLL WORKING PERFECTLY!' : '⚠️ Infinite scroll needs fixes'}`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ path: 'screenshots/infinite-scroll-ERROR.png' });
    }

    await browser.close();
}

testInfiniteScroll().catch(console.error);
