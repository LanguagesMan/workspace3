const { chromium } = require('playwright');

async function testComprehensive() {
    const browser = await chromium.launch({ headless: true });

    console.log('🎯 COMPREHENSIVE VIDA FEED TEST\n');
    console.log('Testing as 3 different user personas...\n');

    // Test 1: Beginner (A1)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👶 TEST 1: BEGINNER USER (A1 Level)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const context1 = await browser.newContext({
        viewport: { width: 414, height: 896 }
    });
    const page1 = await context1.newPage();

    try {
        await page1.goto('http://localhost:3001/unified-infinite-feed.html');
        await page1.waitForSelector('.content-card', { timeout: 5000 });

        // Set A1 level
        await page1.evaluate(() => localStorage.setItem('userLevel', 'A1'));
        await page1.reload({ waitUntil: 'networkidle' });

        const cards1 = await page1.locator('.content-card').count();
        console.log(`✅ Loaded ${cards1} cards for A1 user`);

        // Check for videos
        const videos1 = await page1.locator('video').count();
        console.log(`🎥 Videos visible: ${videos1} ${videos1 > 0 ? '✅' : '❌ ISSUE: No videos'}`);

        // Check translate button
        const translateBtn1 = await page1.locator('.translate-btn').count();
        console.log(`👁️  Translate buttons: ${translateBtn1} ${translateBtn1 > 0 ? '✅' : '❌'}`);

        // Test translation toggle
        if (translateBtn1 > 0) {
            await page1.locator('.translate-btn').first().click();
            await page1.waitForTimeout(300);

            const visibleTranslations1 = await page1.locator('[id^="translation-"]:visible').count();
            console.log(`💡 Translation appeared: ${visibleTranslations1 > 0 ? '✅ YES' : '❌ NO'}`);
        }

        // Test like button
        const likeBtn1 = page1.locator('.action-btn').first();
        await likeBtn1.click();
        await page1.waitForTimeout(500);

        const likeBtnText1 = await likeBtn1.textContent();
        const hasLike1 = likeBtnText1.includes('❤️‍🔥') || likeBtnText1.includes('1');
        console.log(`❤️  Like works: ${hasLike1 ? '✅ YES' : '❌ NO'}`);

        await page1.screenshot({ path: 'screenshots/test-A1-beginner.png', fullPage: true });

    } catch (error) {
        console.error('❌ A1 test failed:', error.message);
    }

    await context1.close();

    // Test 2: Intermediate (B1)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💼 TEST 2: INTERMEDIATE USER (B1 Level)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const context2 = await browser.newContext({
        viewport: { width: 414, height: 896 }
    });
    const page2 = await context2.newPage();

    try {
        await page2.goto('http://localhost:3001/unified-infinite-feed.html');
        await page2.evaluate(() => localStorage.setItem('userLevel', 'B1'));
        await page2.reload({ waitUntil: 'networkidle' });

        await page2.waitForSelector('.content-card', { timeout: 5000 });

        const cards2 = await page2.locator('.content-card').count();
        console.log(`✅ Loaded ${cards2} cards for B1 user`);

        // Check content variety
        const newsCards = await page2.locator('.type-news').count();
        const videoCards = await page2.locator('.type-video').count();
        const socialCards = await page2.locator('.type-social').count();

        console.log(`📊 Content Variety:`);
        console.log(`   News: ${newsCards}`);
        console.log(`   Videos: ${videoCards}`);
        console.log(`   Social: ${socialCards}`);

        const hasVariety = (newsCards > 0 || videoCards > 0 || socialCards > 0);
        console.log(`   ${hasVariety ? '✅' : '❌'} Has content variety`);

        // Test infinite scroll
        await page2.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page2.waitForTimeout(2000);

        const cardsAfterScroll = await page2.locator('.content-card').count();
        const infiniteWorks = cardsAfterScroll > cards2;
        console.log(`\n📜 Infinite scroll: ${infiniteWorks ? '✅ Working (new content loaded)' : '⚠️  Not loading new content'}`);

        await page2.screenshot({ path: 'screenshots/test-B1-intermediate.png', fullPage: true });

    } catch (error) {
        console.error('❌ B1 test failed:', error.message);
    }

    await context2.close();

    // Test 3: Advanced (C1)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎓 TEST 3: ADVANCED USER (C1 Level)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const context3 = await browser.newContext({
        viewport: { width: 414, height: 896 }
    });
    const page3 = await context3.newPage();

    try {
        await page3.goto('http://localhost:3001/unified-infinite-feed.html');
        await page3.evaluate(() => localStorage.setItem('userLevel', 'C1'));
        await page3.reload({ waitUntil: 'networkidle' });

        await page3.waitForSelector('.content-card', { timeout: 5000 });

        const cards3 = await page3.locator('.content-card').count();
        console.log(`✅ Loaded ${cards3} cards for C1 user`);

        // Check for advanced content
        const titles = await page3.locator('.title-text').allTextContents();
        console.log(`📰 Sample titles:`);
        titles.slice(0, 3).forEach((title, i) => {
            console.log(`   ${i + 1}. ${title.substring(0, 60)}...`);
        });

        await page3.screenshot({ path: 'screenshots/test-C1-advanced.png', fullPage: true });

    } catch (error) {
        console.error('❌ C1 test failed:', error.message);
    }

    await context3.close();

    // Final Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FINAL SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('Screenshots saved:');
    console.log('  - test-A1-beginner.png');
    console.log('  - test-B1-intermediate.png');
    console.log('  - test-C1-advanced.png\n');

    console.log('Next steps:');
    console.log('  1. Fix videos if not visible');
    console.log('  2. Verify translations toggle correctly');
    console.log('  3. Ensure infinite scroll loads more content');
    console.log('  4. Add more content variety (memes, culture, etc.)');

    await browser.close();
}

testComprehensive().catch(console.error);
