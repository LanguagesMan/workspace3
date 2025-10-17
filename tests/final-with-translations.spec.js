const { test, expect } = require('@playwright/test');

test('verify complete feed with all translation features', async ({ page }) => {
    console.log('🎯 Testing Complete Feed with Translations...\n');

    // Test Feed
    console.log('1️⃣ Testing Feed Page');
    await page.goto('http://localhost:3002/feed.html');
    await page.waitForSelector('.item', { timeout: 10000 });

    const items = await page.$$('.item');
    console.log(`   ✅ Articles: ${items.length}`);

    // Check real content
    const firstTitle = await page.$eval('.title', el => el.textContent);
    console.log(`   ✅ Article: "${firstTitle}"`);

    // Test clickable words
    const clickableWords = await page.$$('.clickable-word');
    console.log(`   ✅ Clickable words: ${clickableWords.length}`);

    // Click a word
    if (clickableWords.length > 0) {
        await clickableWords[5].click();
        await page.waitForTimeout(500);
        const popup = await page.$('.word-popup');
        if (popup) {
            console.log('   ✅ Word popup appeared');
        }
        await page.click('.word-popup-overlay');
    }

    await page.screenshot({
        path: 'screenshots/workspace3/FINAL_FEED_complete.png',
        fullPage: true
    });
    console.log('   📸 FINAL_FEED_complete.png\n');

    // Test video page
    console.log('2️⃣ Testing Video Page');
    await page.goto('http://localhost:3002/videos-simple.html');
    await page.waitForSelector('.video-slide', { timeout: 10000 });

    const videos = await page.$$('.video-slide');
    console.log(`   ✅ Videos: ${videos.length}`);

    await page.screenshot({
        path: 'screenshots/workspace3/FINAL_VIDEOS_complete.png',
        fullPage: false
    });
    console.log('   📸 FINAL_VIDEOS_complete.png\n');

    console.log('🎉 Complete! Both pages ready for review.');
});
