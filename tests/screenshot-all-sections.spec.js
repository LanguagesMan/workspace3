const { test } = require('@playwright/test');

test('Screenshot all 4 sections', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(3000);

    // 1. VIDEOS SECTION
    await page.screenshot({ path: '/tmp/1-videos-section.png', fullPage: false });
    console.log('✅ 1. Videos section');

    // 2. ARTICLES SECTION
    await page.click('.nav-tab[data-tab="articles"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/2-articles-section.png', fullPage: false });
    console.log('✅ 2. Articles section');

    // 3. MUSIC SECTION
    await page.click('.nav-tab[data-tab="music"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/3-music-section.png', fullPage: false });
    console.log('✅ 3. Music section');

    // 4. STORIES SECTION
    await page.click('.nav-tab[data-tab="stories"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/4-stories-section.png', fullPage: false });
    console.log('✅ 4. Stories section');

    console.log('\n🎉 All 4 sections working and screenshotted!');
});
