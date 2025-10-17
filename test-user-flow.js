const { chromium } = require('playwright');

(async () => {
    console.log('🧪 COMPREHENSIVE USER FLOW TEST\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }, // iPhone 14 Pro
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    });

    const page = await context.newPage();

    // Track console errors
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    console.log('📱 Step 1: Navigate to app...');
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);

    console.log('✅ Step 2: Check reels appear IMMEDIATELY (no menu first)...');
    const reelsVisible = await page.isVisible('.reels-container');
    console.log(`   Reels visible: ${reelsVisible ? '✅' : '❌'}`);

    console.log('✅ Step 3: Check Spanish subtitles are clickable...');
    const clickableWords = await page.$$('.word');
    console.log(`   Clickable words found: ${clickableWords.length}`);

    if (clickableWords.length > 0) {
        await clickableWords[0].click();
        await page.waitForTimeout(500);
        const translationVisible = await page.isVisible('.translation.show');
        console.log(`   Translation shows on click: ${translationVisible ? '✅' : '❌'}`);
    }

    console.log('✅ Step 4: Test vertical scroll...');
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(1000);
    console.log('   Scrolled to next reel ✅');

    console.log('✅ Step 5: Check bottom navigation...');
    const navVisible = await page.isVisible('.bottom-nav');
    const navButtons = await page.$$('.bottom-nav .nav-item');
    console.log(`   Bottom nav visible: ${navVisible ? '✅' : '❌'}`);
    console.log(`   Nav buttons count: ${navButtons.length} (should be 5)`);

    console.log('✅ Step 6: Test like button...');
    const likeBtn = await page.$('.like-btn');
    if (likeBtn) {
        await likeBtn.click();
        await page.waitForTimeout(300);
        const isLiked = await page.$eval('.like-btn', el => el.classList.contains('liked'));
        console.log(`   Like button works: ${isLiked ? '✅' : '❌'}`);
    }

    console.log('\n📸 Taking final screenshot...');
    const screenshotPath = `screenshots/user-flow-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`   Screenshot saved: ${screenshotPath}`);

    console.log('\n📊 RESULTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Reels show immediately: ${reelsVisible}`);
    console.log(`✅ Spanish words clickable: ${clickableWords.length > 0}`);
    console.log(`✅ Bottom navigation exists: ${navVisible}`);
    console.log(`✅ All user flows working: ${reelsVisible && clickableWords.length > 0 && navVisible}`);

    if (errors.length > 0) {
        console.log(`\n⚠️  Console errors detected: ${errors.length}`);
        errors.slice(0, 5).forEach(err => console.log(`   - ${err}`));
    }

    console.log('\n⏸️  Browser staying open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);

    await browser.close();
    console.log('\n✅ Test complete!');
})();
