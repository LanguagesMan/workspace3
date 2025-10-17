const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('🎬 COMPREHENSIVE SECTION TEST\n');

    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);

    // Dismiss "Tap to Start" if present
    const tapToStart = await page.locator('#tapToStart').isVisible();
    if (tapToStart) {
        console.log('Clicking "Tap to Start"...');
        await page.click('#tapToStart');
        await page.waitForTimeout(1000);
    }

    // 1. Test Homepage
    console.log('1️⃣ HOMEPAGE (default view)');
    await page.waitForTimeout(2000);
    const homepageCards = await page.locator('.feed-card').count();
    console.log(`   ✅ ${homepageCards} feed items`);
    await page.screenshot({ path: 'screenshots/1-homepage.png' });

    // 2. Test Articles
    console.log('\n2️⃣ ARTICLES TAB');
    const articlesTab = await page.locator('text=Articles').first();
    await articlesTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/2-articles.png' });
    console.log('   ✅ Screenshot saved');

    // 3. Test Videos
    console.log('\n3️⃣ VIDEOS TAB');
    const videosTab = await page.locator('text=Videos').first();
    await videosTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/3-videos.png' });
    console.log('   ✅ Screenshot saved');

    // 4. Test Music
    console.log('\n4️⃣ MUSIC TAB');
    const musicTab = await page.locator('text=Music').first();
    await musicTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/4-music.png' });
    console.log('   ✅ Screenshot saved');

    // 5. Test Stories
    console.log('\n5️⃣ STORIES TAB');
    const storiesTab = await page.locator('text=Stories').first();
    await storiesTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/5-stories.png' });
    console.log('   ✅ Screenshot saved');

    console.log('\n✅ ALL SECTIONS TESTED!\n');

    await browser.close();
})();
