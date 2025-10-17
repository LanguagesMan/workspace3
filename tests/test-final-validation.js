const { chromium } = require('playwright');

async function finalValidation() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
        viewport: { width: 414, height: 896 }
    });

    console.log('🎯 FINAL VALIDATION TEST\n');

    try {
        await page.goto('http://localhost:3001/unified-infinite-feed.html', {
            waitUntil: 'networkidle',
            timeout: 15000
        });

        console.log('✅ Page loaded\n');

        // Wait for cards
        await page.waitForSelector('.content-card', { timeout: 10000 });

        // 1. COUNT EVERYTHING
        const cards = await page.locator('.content-card').count();
        const videos = await page.locator('video').count();
        const images = await page.locator('.card-media img').count();
        const translateButtons = await page.locator('.translate-btn').count();
        const likeButtons = await page.locator('.action-btn:has-text("❤️")').count();
        const spanishText = await page.locator('.spanish-text').count();

        console.log('📊 CONTENT COUNTS:');
        console.log(`   Cards: ${cards}`);
        console.log(`   Videos: ${videos}`);
        console.log(`   Images: ${images}`);
        console.log(`   Translate buttons: ${translateButtons}`);
        console.log(`   Like buttons: ${likeButtons}`);
        console.log(`   Spanish text sections: ${spanishText}\n`);

        // 2. TEST TRANSLATIONS
        if (translateButtons > 0) {
            console.log('🔍 TESTING TRANSLATIONS...');

            const firstTranslateBtn = page.locator('.translate-btn').first();
            const btnTextBefore = await firstTranslateBtn.textContent();
            console.log(`   Button before click: "${btnTextBefore}"`);

            await firstTranslateBtn.click();
            await page.waitForTimeout(500);

            const btnTextAfter = await firstTranslateBtn.textContent();
            console.log(`   Button after click: "${btnTextAfter}"`);

            // Check if translation div is now visible
            const visibleTranslations = await page.locator('[id^="translation-"]:visible').count();
            console.log(`   Visible translations: ${visibleTranslations}`);
            console.log(`   ${visibleTranslations > 0 ? '✅' : '❌'} Translations toggle: ${visibleTranslations > 0 ? 'WORKING' : 'NOT WORKING'}\n`);
        }

        // 3. TEST LIKES
        console.log('❤️  TESTING LIKES...');
        const firstLikeBtn = page.locator('button[onclick*="likeContent"]').first();

        if (await firstLikeBtn.count() > 0) {
            const likeBefore = await firstLikeBtn.textContent();
            console.log(`   Like button before: "${likeBefore.trim()}"`);

            await firstLikeBtn.click();
            await page.waitForTimeout(500);

            const likeAfter = await firstLikeBtn.textContent();
            console.log(`   Like button after: "${likeAfter.trim()}"`);

            const likeWorks = likeAfter !== likeBefore;
            console.log(`   ${likeWorks ? '✅' : '❌'} Like button: ${likeWorks ? 'WORKING' : 'NOT WORKING'}\n`);
        }

        // 4. CHECK VIDEOS
        console.log('🎥 CHECKING VIDEOS...');
        const videoElements = await page.locator('video.feed-video').all();
        console.log(`   Total video elements: ${videoElements.length}`);

        if (videoElements.length > 0) {
            const firstVideo = videoElements[0];
            const videoSrc = await firstVideo.getAttribute('src');
            const isVisible = await firstVideo.isVisible();
            console.log(`   First video src: ${videoSrc}`);
            console.log(`   First video visible: ${isVisible ? '✅ YES' : '❌ NO'}`);
        }
        console.log('');

        // 5. TEST WORD TRANSLATIONS
        console.log('💬 TESTING WORD-LEVEL TRANSLATIONS...');
        const spanishWords = await page.locator('.spanish-word').count();
        console.log(`   Tappable Spanish words: ${spanishWords}`);

        if (spanishWords > 0) {
            await page.locator('.spanish-word').first().click();
            await page.waitForTimeout(500);

            const tooltip = await page.locator('.translation-tooltip').count();
            console.log(`   ${tooltip > 0 ? '✅' : '❌'} Word tooltip: ${tooltip > 0 ? 'WORKING' : 'NOT WORKING'}\n`);
        }

        // 6. CHECK TITLE PUNCHINESS
        console.log('🔥 CHECKING TITLE QUALITY...');
        const titles = await page.locator('.title-text').allTextContents();
        const punchyTitles = titles.filter(t =>
            t.includes('🔥') || t.includes('😱') || t.includes('💯') ||
            t.includes('⚡') || t.includes('📰') || t.includes('🎥')
        );
        console.log(`   Total titles: ${titles.length}`);
        console.log(`   Punchy titles (with emojis): ${punchyTitles.length}`);
        console.log(`   Sample titles:`);
        titles.slice(0, 3).forEach((t, i) => {
            console.log(`     ${i+1}. ${t.substring(0, 60)}${t.length > 60 ? '...' : ''}`);
        });
        console.log('');

        // 7. INFINITE SCROLL TEST
        console.log('📜 TESTING INFINITE SCROLL...');
        const cardsBefore = await page.locator('.content-card').count();
        console.log(`   Cards before scroll: ${cardsBefore}`);

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(3000); // Wait for load

        const cardsAfter = await page.locator('.content-card').count();
        console.log(`   Cards after scroll: ${cardsAfter}`);
        console.log(`   ${cardsAfter > cardsBefore ? '✅' : '❌'} Infinite scroll: ${cardsAfter > cardsBefore ? 'WORKING' : 'NOT LOADING NEW CONTENT'}\n`);

        // 8. TAKE SCREENSHOT
        await page.screenshot({
            path: 'screenshots/final-validation.png',
            fullPage: true
        });

        // FINAL VERDICT
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ FINAL VERDICT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const checks = [
            { name: 'Content loading', pass: cards >= 10 },
            { name: 'Videos present', pass: videos > 0 },
            { name: 'Translate buttons', pass: translateButtons > 0 },
            { name: 'Like buttons', pass: likeButtons > 0 },
            { name: 'Spanish text', pass: spanishText > 0 },
            { name: 'Punchy titles', pass: punchyTitles.length > 0 }
        ];

        checks.forEach(check => {
            console.log(`${check.pass ? '✅' : '❌'} ${check.name}: ${check.pass ? 'PASS' : 'FAIL'}`);
        });

        const allPass = checks.every(c => c.pass);
        console.log(`\n${allPass ? '🎉 ALL TESTS PASSED!' : '⚠️  Some tests failed - review above'}`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ path: 'screenshots/final-validation-ERROR.png' });
    }

    await browser.close();
}

finalValidation().catch(console.error);
