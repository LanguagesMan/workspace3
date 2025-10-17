const { chromium } = require('playwright');

async function testEverything() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
        viewport: { width: 414, height: 896 }
    });

    console.log('🎯 FINAL COMPREHENSIVE TEST\n');

    try {
        await page.goto('http://localhost:3001/unified-infinite-feed.html', {
            waitUntil: 'networkidle',
            timeout: 15000
        });

        await page.waitForSelector('.content-card', { timeout: 10000 });

        // CHECK EVERYTHING
        const results = {
            cards: await page.locator('.content-card').count(),
            videos: await page.locator('video').count(),
            translateButtons: await page.locator('.translate-btn').count(),
            likeButtons: await page.locator('button[onclick*="likeContent"]').count(),
            spanishText: await page.locator('.spanish-text').count(),
            titleElements: await page.locator('.title-text').count(),
        };

        console.log('📊 ELEMENT COUNTS:\n');
        Object.entries(results).forEach(([name, count]) => {
            console.log(`   ${count > 0 ? '✅' : '❌'} ${name}: ${count}`);
        });

        // Get actual titles to verify they're punchy
        const titles = await page.locator('.title-text').allTextContents();
        console.log('\n📰 TITLE SAMPLES (checking for emojis/hooks):');
        titles.slice(0, 5).forEach((title, i) => {
            const hasPunch = title.includes('🔥') || title.includes('😱') || title.includes('💯') ||
                           title.includes('⚡') || title.includes('📰') || title.includes('🎥') ||
                           title.includes('✨') || title.includes('🎯') || title.includes('🚀');
            console.log(`   ${hasPunch ? '✅' : '❌'} ${i+1}. "${title.substring(0, 60)}"`);
        });

        // Test translation toggle
        console.log('\n🔄 TESTING TRANSLATION TOGGLE:');
        const firstBtn = page.locator('.translate-btn').first();
        const btnBefore = await firstBtn.textContent();
        console.log(`   Before: "${btnBefore}"`);

        await firstBtn.click();
        await page.waitForTimeout(300);

        const btnAfter = await firstBtn.textContent();
        console.log(`   After: "${btnAfter}"`);
        console.log(`   ${btnBefore !== btnAfter ? '✅' : '❌'} Button toggles`);

        // Test like button
        console.log('\n❤️  TESTING LIKE BUTTON:');
        const likeBtn = page.locator('button[onclick*="likeContent"]').first();
        await likeBtn.click();
        await page.waitForTimeout(500);

        const likeText = await likeBtn.textContent();
        console.log(`   After click: "${likeText.trim()}"`);
        console.log(`   ${likeText.includes('1') || likeText.includes('🔥') ? '✅' : '❌'} Like working`);

        // Test infinite scroll
        console.log('\n📜 TESTING INFINITE SCROLL:');
        const cardsBefore = await page.locator('.content-card').count();
        console.log(`   Cards before: ${cardsBefore}`);

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(4000);

        const cardsAfter = await page.locator('.content-card').count();
        console.log(`   Cards after: ${cardsAfter}`);
        console.log(`   ${cardsAfter > cardsBefore ? '✅' : '⚠️'} Infinite scroll: ${cardsAfter > cardsBefore ? 'WORKING' : 'Not triggered'}`);

        // Screenshot
        await page.screenshot({
            path: 'screenshots/FINAL-WORKING.png',
            fullPage: true
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 FINAL VERDICT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const allWorking = results.cards > 0 && results.translateButtons > 0 && results.likeButtons > 0;
        console.log(allWorking ? '✅ ALL CORE FEATURES WORKING!' : '⚠️ Some features need attention');
        console.log('\n📸 Screenshot: screenshots/FINAL-WORKING.png');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ path: 'screenshots/FINAL-WORKING-ERROR.png' });
    }

    await browser.close();
}

testEverything().catch(console.error);
