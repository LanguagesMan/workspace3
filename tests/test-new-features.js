const { chromium } = require('playwright');

async function testNewFeatures() {
    const browser = await chromium.launch({ headless: false }); // Show browser
    const context = await browser.newContext({
        viewport: { width: 414, height: 896 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    });
    const page = await context.newPage();

    console.log('🎯 Testing NEW Features (Instagram/TikTok-style improvements)...\n');

    try {
        // Navigate with cache bypass
        await page.goto('http://localhost:3001/unified-infinite-feed.html', {
            waitUntil: 'networkidle',
            timeout: 10000
        });

        // Force reload to bypass cache
        await page.reload({ waitUntil: 'networkidle' });

        console.log('✅ Page loaded (cache bypassed)');

        // Wait for content
        await page.waitForSelector('.content-card', { timeout: 5000 });

        // Test 1: Check for punchy titles (should have emojis)
        const firstTitle = await page.locator('.title-text').first().textContent();
        console.log(`\n📰 First Title: "${firstTitle}"`);
        const hasPunchyTitle = firstTitle.includes('🔥') || firstTitle.includes('😱') || firstTitle.includes('📰') || firstTitle.includes('🎥');
        console.log(`   ${hasPunchyTitle ? '✅' : '❌'} Punchy Instagram-style title: ${hasPunchyTitle}`);

        // Test 2: Check for translation toggle buttons
        const translateButtons = await page.locator('.translate-btn').count();
        console.log(`\n👁️  Translation Toggle Buttons: ${translateButtons}`);
        console.log(`   ${translateButtons > 0 ? '✅' : '❌'} Visible translation buttons present`);

        // Test 3: Test like button functionality
        const likeButton = page.locator('.action-btn').first();
        const initialText = await likeButton.textContent();
        console.log(`\n❤️  Testing Like Button...`);
        console.log(`   Initial: ${initialText.trim()}`);

        await likeButton.click();
        await page.waitForTimeout(500);

        const afterText = await likeButton.textContent();
        console.log(`   After click: ${afterText.trim()}`);
        const likeWorks = afterText.includes('❤️‍🔥') || afterText.includes('1');
        console.log(`   ${likeWorks ? '✅' : '❌'} Like button working: ${likeWorks}`);

        // Test 4: Check for skeleton loading (need to scroll first)
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);

        const hasSkeletons = await page.locator('.skeleton-card').count() > 0;
        console.log(`\n💀 Skeleton Loading States: ${hasSkeletons ? '✅ Present' : '⚠️  Not visible (may have loaded too fast)'}`);

        // Test 5: Check for video autoplay setup
        const videos = await page.locator('video.feed-video').count();
        console.log(`\n🎥 Videos with autoplay class: ${videos}`);
        console.log(`   ${videos > 0 ? '✅' : '❌'} TikTok-style video setup present`);

        // Test 6: Test translation toggle
        const translateBtn = page.locator('.translate-btn').first();
        await translateBtn.click();
        await page.waitForTimeout(300);

        const btnTextAfter = await translateBtn.textContent();
        const translationWorks = btnTextAfter.includes('Visto');
        console.log(`\n🔄 Translation Toggle Test:`);
        console.log(`   Button text after click: "${btnTextAfter}"`);
        console.log(`   ${translationWorks ? '✅' : '❌'} Toggle working: ${translationWorks}`);

        // Take final screenshot
        await page.screenshot({
            path: 'screenshots/feed-NEW-FEATURES.png',
            fullPage: true
        });

        // Summary
        console.log(`\n\n🎯 NEW FEATURES SUMMARY:`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`${hasPunchyTitle ? '✅' : '❌'} Instagram-style punchy titles`);
        console.log(`${translateButtons > 0 ? '✅' : '❌'} Visible translation toggles`);
        console.log(`${likeWorks ? '✅' : '❌'} Working like buttons with counts`);
        console.log(`${videos > 0 ? '✅' : '❌'} TikTok-style video autoplay`);
        console.log(`${translationWorks ? '✅' : '❌'} Interactive translation buttons`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        const allWorking = hasPunchyTitle && translateButtons > 0 && likeWorks && videos > 0 && translationWorks;

        if (allWorking) {
            console.log('🎉 ALL NEW FEATURES WORKING! Feed is Instagram/TikTok-level addictive!');
        } else {
            console.log('⚠️  Some features need attention. Review above checklist.');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ path: 'screenshots/feed-NEW-FEATURES-ERROR.png' });
    }

    await page.waitForTimeout(3000); // Keep browser open to see results
    await browser.close();
}

testNewFeatures().catch(console.error);
