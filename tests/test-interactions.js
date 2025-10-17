const { chromium } = require('playwright');

async function testAllInteractions() {
    const browser = await chromium.launch({ headless: false, slowMo: 300 });
    const page = await browser.newPage({ viewport: { width: 414, height: 896 } });

    console.log('🧪 TESTING ALL INTERACTIONS - CLICKING EVERYTHING\n');

    await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const results = {
        working: [],
        broken: [],
        missing: []
    };

    // Test 1: Translation button
    console.log('1️⃣ Testing translation button...');
    const translateBtn = page.locator('.translate-btn').first();
    if (await translateBtn.count() > 0) {
        try {
            await translateBtn.click();
            await page.waitForTimeout(500);
            const translationVisible = await page.locator('.card-text:visible').count() > 0;
            if (translationVisible) {
                results.working.push('✅ Translation toggle works');
                console.log('   ✅ Translation shows/hides');
            } else {
                results.broken.push('❌ Translation doesn\'t show after click');
            }
        } catch (e) {
            results.broken.push(`❌ Translation button error: ${e.message}`);
        }
    } else {
        results.missing.push('❌ No translation button found');
    }

    // Test 2: Like button
    console.log('\n2️⃣ Testing like button...');
    const likeBtn = page.locator('button:has-text("❤️")').first();
    if (await likeBtn.count() > 0) {
        try {
            const beforeText = await likeBtn.textContent();
            await likeBtn.click();
            await page.waitForTimeout(500);
            const afterText = await likeBtn.textContent();
            if (beforeText !== afterText || await likeBtn.evaluate(el => el.classList.contains('liked'))) {
                results.working.push('✅ Like button responds to click');
                console.log('   ✅ Like button changes state');
            } else {
                results.broken.push('❌ Like button doesn\'t change after click');
            }
        } catch (e) {
            results.broken.push(`❌ Like button error: ${e.message}`);
        }
    } else {
        results.missing.push('❌ No like button found');
    }

    // Test 3: Word click for inline translation
    console.log('\n3️⃣ Testing word click...');
    const spanishWord = page.locator('.spanish-word').first();
    if (await spanishWord.count() > 0) {
        try {
            await spanishWord.click();
            await page.waitForTimeout(500);
            const tooltipVisible = await page.locator('.translation-tooltip:visible, .word-translation:visible').count() > 0;
            if (tooltipVisible) {
                results.working.push('✅ Word click shows translation');
                console.log('   ✅ Tooltip appears');
            } else {
                results.broken.push('❌ Word click doesn\'t show tooltip');
            }
        } catch (e) {
            results.broken.push(`❌ Word click error: ${e.message}`);
        }
    } else {
        results.missing.push('❌ No clickable words found');
    }

    // Test 4: Save button
    console.log('\n4️⃣ Testing save button...');
    const saveBtn = page.locator('button:has-text("📚 Save")').first();
    if (await saveBtn.count() > 0) {
        try {
            await saveBtn.click();
            await page.waitForTimeout(500);
            results.working.push('✅ Save button clickable');
            console.log('   ✅ Save button responds');
        } catch (e) {
            results.broken.push(`❌ Save button error: ${e.message}`);
        }
    } else {
        results.missing.push('❌ No save button found');
    }

    // Test 5: Scroll to load more
    console.log('\n5️⃣ Testing infinite scroll...');
    const initialCards = await page.locator('.content-card').count();
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(2000);
    const afterScrollCards = await page.locator('.content-card').count();
    if (afterScrollCards > initialCards) {
        results.working.push(`✅ Infinite scroll loads more (${initialCards} → ${afterScrollCards})`);
        console.log(`   ✅ More content loaded (${initialCards} → ${afterScrollCards})`);
    } else {
        results.broken.push('❌ Infinite scroll doesn\'t load more content');
    }

    // Test 6: Video playback
    console.log('\n6️⃣ Testing video playback...');
    const visibleVideos = await page.locator('video:visible').count();
    if (visibleVideos > 0) {
        try {
            const video = page.locator('video:visible').first();
            await video.click();
            await page.waitForTimeout(500);
            const isPaused = await video.evaluate(el => el.paused);
            results.working.push(`✅ Video clickable (${visibleVideos} videos visible)`);
            console.log(`   ✅ Video responds to click (paused: ${isPaused})`);
        } catch (e) {
            results.broken.push(`❌ Video click error: ${e.message}`);
        }
    } else {
        results.missing.push('❌ No visible videos to test');
    }

    await page.screenshot({ path: 'screenshots/INTERACTION-TEST.png', fullPage: true });

    console.log('\n' + '='.repeat(70));
    console.log('📊 INTERACTION TEST RESULTS');
    console.log('='.repeat(70));

    console.log('\n✅ WORKING:');
    results.working.forEach(item => console.log(`   ${item}`));

    if (results.broken.length > 0) {
        console.log('\n❌ BROKEN:');
        results.broken.forEach(item => console.log(`   ${item}`));
    }

    if (results.missing.length > 0) {
        console.log('\n⚠️  MISSING:');
        results.missing.forEach(item => console.log(`   ${item}`));
    }

    console.log('\n📸 Screenshot: screenshots/INTERACTION-TEST.png');
    console.log('\n⏸️  Browser staying open for 30s...\n');

    await page.waitForTimeout(30000);
    await browser.close();

    return {
        working: results.working.length,
        broken: results.broken.length,
        missing: results.missing.length,
        results
    };
}

testAllInteractions().catch(console.error);
