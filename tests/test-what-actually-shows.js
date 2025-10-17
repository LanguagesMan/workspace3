const { chromium } = require('playwright');

async function testWhatActuallyShows() {
    const browser = await chromium.launch({ headless: false }); // SHOW browser
    const page = await browser.newPage({
        viewport: { width: 414, height: 896 }
    });

    console.log('🔍 TESTING WHAT ACTUALLY SHOWS IN BROWSER\n');

    try {
        await page.goto('http://localhost:3001/unified-infinite-feed.html', {
            waitUntil: 'networkidle',
            timeout: 15000
        });

        // Force reload to bypass cache
        await page.reload({ waitUntil: 'networkidle' });

        console.log('✅ Page loaded - browser visible\n');
        console.log('Waiting 5 seconds for you to inspect...\n');
        await page.waitForTimeout(5000);

        // Get HTML of first card to see ACTUAL structure
        const firstCardHTML = await page.locator('.content-card').first().innerHTML();
        console.log('📄 FIRST CARD HTML (first 500 chars):');
        console.log(firstCardHTML.substring(0, 500));
        console.log('...\n');

        // Check what's ACTUALLY rendered
        const checks = {
            'Content cards': await page.locator('.content-card').count(),
            'Videos': await page.locator('video').count(),
            'Images': await page.locator('img').count(),
            'Translate buttons (.translate-btn)': await page.locator('.translate-btn').count(),
            'Like buttons': await page.locator('button[onclick*="likeContent"]').count(),
            'Spanish text sections': await page.locator('.spanish-text').count(),
            'Title elements (.card-title)': await page.locator('.card-title').count(),
            'Title text (.title-text)': await page.locator('.title-text').count(),
        };

        console.log('📊 WHAT ACTUALLY RENDERED:\n');
        Object.entries(checks).forEach(([name, count]) => {
            console.log(`   ${count > 0 ? '✅' : '❌'} ${name}: ${count}`);
        });

        // Get actual title text
        const titleTexts = await page.locator('.card-title').allTextContents();
        console.log('\n📰 ACTUAL TITLE TEXT (first 5):');
        titleTexts.slice(0, 5).forEach((title, i) => {
            console.log(`   ${i+1}. "${title.trim().substring(0, 80)}"`);
        });

        // Take screenshot
        await page.screenshot({
            path: 'screenshots/ACTUAL-RENDER.png',
            fullPage: true
        });

        console.log('\n📸 Screenshot saved: screenshots/ACTUAL-RENDER.png');
        console.log('\n⏸️  Browser will stay open for 30 seconds so you can inspect...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ path: 'screenshots/ACTUAL-RENDER-ERROR.png' });
    }

    await browser.close();
}

testWhatActuallyShows().catch(console.error);
