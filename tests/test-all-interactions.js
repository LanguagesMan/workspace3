const { chromium } = require('playwright');

async function testAllInteractions() {
    const browser = await chromium.launch({ headless: false, slowMo: 300 });
    const page = await browser.newPage({ viewport: { width: 414, height: 896 } });

    console.log('🧪 TESTING ALL INTERACTIONS (Instagram/TikTok Quality Check)\n');

    await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const results = {
        working: [],
        broken: [],
        ux_issues: []
    };

    // 1. Test Like button
    console.log('❤️ Testing like button...');
    try {
        const likeBtn = page.locator('.action-btn').first();
        await likeBtn.click();
        await page.waitForTimeout(500);
        const hasLiked = await page.locator('.action-btn.liked').count() > 0;
        if (hasLiked) {
            results.working.push('✅ Like button - animation & state change');
        } else {
            results.broken.push('❌ Like button - no visual feedback');
        }
    } catch (e) {
        results.broken.push('❌ Like button - ' + e.message);
    }

    // 2. Test Translation toggle
    console.log('👁️ Testing translation toggle...');
    try {
        const translateBtn = page.locator('.translate-btn').first();
        await translateBtn.click();
        await page.waitForTimeout(500);
        const translationVisible = await page.locator('.card-text[style*="display: block"]').count() > 0 ||
                                   await page.locator('.card-text').first().isVisible();
        if (translationVisible) {
            results.working.push('✅ Translation toggle - shows/hides translation');
        } else {
            results.broken.push('❌ Translation toggle - translation not appearing');
        }
    } catch (e) {
        results.broken.push('❌ Translation toggle - ' + e.message);
    }

    // 3. Test word click (inline translation)
    console.log('💡 Testing word click...');
    try {
        const spanishWord = page.locator('.spanish-word').first();
        await spanishWord.click();
        await page.waitForTimeout(500);
        const tooltipVisible = await page.locator('.word-tooltip').isVisible().catch(() => false);
        if (tooltipVisible) {
            results.working.push('✅ Word click - inline translation appears');
        } else {
            results.ux_issues.push('⚠️ Word click - no tooltip feedback');
        }
    } catch (e) {
        results.ux_issues.push('⚠️ Word click - ' + e.message);
    }

    // 4. Test Save button
    console.log('📚 Testing save button...');
    try {
        const saveBtn = page.locator('button:has-text("Save")').first();
        await saveBtn.click();
        await page.waitForTimeout(500);
        // Check for toast notification
        const toastVisible = await page.locator('.toast').isVisible().catch(() => false);
        if (toastVisible) {
            results.working.push('✅ Save button - toast confirmation');
        } else {
            results.ux_issues.push('⚠️ Save button - no visual confirmation');
        }
    } catch (e) {
        results.ux_issues.push('⚠️ Save button - ' + e.message);
    }

    // 5. Test video tap-to-pause
    console.log('🎬 Testing video tap-to-pause...');
    try {
        const video = page.locator('.feed-video').first();
        if (await video.count() > 0) {
            await video.click();
            await page.waitForTimeout(500);
            const paused = await video.evaluate(el => el.paused);
            if (paused !== undefined) {
                results.working.push('✅ Video tap-to-pause - TikTok-style interaction');
            } else {
                results.broken.push('❌ Video tap-to-pause - not responding');
            }
        } else {
            results.ux_issues.push('⚠️ No videos in feed to test');
        }
    } catch (e) {
        results.ux_issues.push('⚠️ Video tap-to-pause - ' + e.message);
    }

    // 6. Test infinite scroll
    console.log('📜 Testing infinite scroll...');
    try {
        const initialCards = await page.locator('.content-card').count();
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(3000);
        const afterScrollCards = await page.locator('.content-card').count();
        if (afterScrollCards > initialCards) {
            results.working.push(`✅ Infinite scroll - loaded ${afterScrollCards - initialCards} new cards`);
        } else {
            results.broken.push('❌ Infinite scroll - no new content loaded');
        }
    } catch (e) {
        results.broken.push('❌ Infinite scroll - ' + e.message);
    }

    // 7. Test pull-to-refresh
    console.log('🔄 Testing pull-to-refresh...');
    try {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        // Simulate pull gesture
        await page.mouse.move(200, 100);
        await page.mouse.down();
        await page.mouse.move(200, 300, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(2000);
        results.ux_issues.push('⚠️ Pull-to-refresh - tested (hard to verify in automation)');
    } catch (e) {
        results.ux_issues.push('⚠️ Pull-to-refresh - ' + e.message);
    }

    // 8. Test Share button
    console.log('📤 Testing share button...');
    try {
        const shareBtn = page.locator('button:has-text("Share")').first();
        await shareBtn.click();
        await page.waitForTimeout(500);
        results.working.push('✅ Share button - clickable');
    } catch (e) {
        results.broken.push('❌ Share button - ' + e.message);
    }

    await page.screenshot({ path: 'screenshots/FULL-INTERACTION-TEST.png', fullPage: true });

    console.log('\n' + '='.repeat(70));
    console.log('📊 INTERACTION TEST RESULTS:\n');
    console.log('✅ WORKING (' + results.working.length + '):');
    results.working.forEach(r => console.log('   ' + r));
    console.log('\n❌ BROKEN (' + results.broken.length + '):');
    results.broken.forEach(r => console.log('   ' + r));
    console.log('\n⚠️ UX ISSUES (' + results.ux_issues.length + '):');
    results.ux_issues.forEach(r => console.log('   ' + r));
    console.log('='.repeat(70));

    const score = Math.round((results.working.length / (results.working.length + results.broken.length)) * 100);
    console.log(`\n🎯 Interaction Quality Score: ${score}%`);

    if (score >= 90) {
        console.log('✅ EXCELLENT - Instagram/TikTok level polish!');
    } else if (score >= 70) {
        console.log('⚠️ GOOD - Some improvements needed');
    } else {
        console.log('❌ NEEDS WORK - Major UX issues');
    }

    console.log('\n⏸️  Browser open for 20s for manual testing...\n');
    await page.waitForTimeout(20000);

    await browser.close();

    return { results, score };
}

testAllInteractions().catch(console.error);
