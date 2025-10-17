const { chromium } = require('playwright');

async function testFeedExperience() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 414, height: 896 }, // iPhone 11 Pro
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    });
    const page = await context.newPage();

    console.log('📱 Testing VIDA Feed Experience...\n');

    try {
        // Navigate to the app
        await page.goto('http://localhost:3001/unified-infinite-feed.html', {
            waitUntil: 'networkidle',
            timeout: 10000
        });

        console.log('✅ Page loaded');

        // Take initial screenshot
        await page.screenshot({
            path: 'screenshots/feed-experience-BEFORE.png',
            fullPage: true
        });

        // Wait for content to load
        await page.waitForSelector('.content-card', { timeout: 5000 });
        const cardCount = await page.locator('.content-card').count();
        console.log(`📊 Found ${cardCount} content cards`);

        if (cardCount === 0) {
            console.log('❌ NO CONTENT LOADED - Feed is empty!');
        }

        // Test 1: Check for videos
        const videos = await page.locator('video').count();
        console.log(`🎥 Videos found: ${videos}`);
        if (videos === 0) {
            console.log('❌ NO VIDEOS - Video feed not working');
        }

        // Test 2: Check for Spanish text
        const spanishText = await page.locator('.spanish-text').count();
        console.log(`🇪🇸 Spanish text sections: ${spanishText}`);
        if (spanishText === 0) {
            console.log('⚠️  No Spanish text - Content may be in English only');
        }

        // Test 3: Check for translation functionality
        const translationWords = await page.locator('.spanish-word').count();
        console.log(`💬 Translatable words: ${translationWords}`);

        // Test 4: Try clicking a word for translation
        if (translationWords > 0) {
            await page.locator('.spanish-word').first().click();
            await page.waitForTimeout(500);
            const tooltip = await page.locator('.translation-tooltip').count();
            console.log(`📖 Translation tooltip appeared: ${tooltip > 0 ? '✅' : '❌'}`);
        }

        // Test 5: Check article titles visibility
        const titles = await page.locator('.card-title').allTextContents();
        console.log(`\n📰 Article Titles (first 3):`);
        titles.slice(0, 3).forEach((title, i) => {
            console.log(`   ${i + 1}. ${title.substring(0, 60)}${title.length > 60 ? '...' : ''}`);
        });

        // Test 6: Check if translations are visible
        const visibleTranslations = await page.locator('.card-text:visible').count();
        console.log(`\n👁️  Visible translations: ${visibleTranslations}`);

        // Test 7: Check action buttons
        const likeButtons = await page.locator('.action-btn:has-text("❤️")').count();
        console.log(`❤️  Like buttons: ${likeButtons}`);

        // Test 8: Scroll to trigger infinite scroll
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);
        const newCardCount = await page.locator('.content-card').count();
        console.log(`\n📜 After scroll: ${newCardCount} cards (${newCardCount > cardCount ? '✅ Infinite scroll works' : '❌ Infinite scroll not working'})`);

        // Take final screenshot
        await page.screenshot({
            path: 'screenshots/feed-experience-AFTER.png',
            fullPage: true
        });

        // Analysis
        console.log('\n🔍 ANALYSIS:\n');

        const issues = [];
        const good = [];

        if (cardCount === 0) issues.push('❌ Feed is completely empty');
        else good.push(`✅ ${cardCount} cards loaded`);

        if (videos === 0) issues.push('❌ No video content');
        else good.push(`✅ ${videos} videos present`);

        if (spanishText === 0) issues.push('⚠️  No Spanish immersion content');
        else good.push(`✅ ${spanishText} Spanish text sections`);

        if (translationWords === 0) issues.push('❌ No word-level translations');
        else good.push(`✅ ${translationWords} translatable words`);

        console.log('WORKING:');
        good.forEach(g => console.log('  ' + g));

        if (issues.length > 0) {
            console.log('\nISSUES:');
            issues.forEach(i => console.log('  ' + i));
        }

        console.log('\n💡 RECOMMENDATIONS:');
        if (videos === 0) {
            console.log('  - Add video content to /Langsalot feed/ folder');
            console.log('  - Verify video file paths in server.js');
        }
        if (spanishText === 0 || cardCount === 0) {
            console.log('  - Check API endpoint /api/unified-feed');
            console.log('  - Verify content is in Spanish, not English');
        }
        if (issues.length === 0) {
            console.log('  - Content is loading! Focus on making it more ENGAGING');
            console.log('  - Add punchy headlines');
            console.log('  - Make translations more visible/interactive');
            console.log('  - Add skeleton loading states');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ path: 'screenshots/feed-experience-ERROR.png' });
    }

    await browser.close();
}

testFeedExperience().catch(console.error);
