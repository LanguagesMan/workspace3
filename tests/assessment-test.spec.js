const { test } = require('@playwright/test');

test('Complete User Journey Assessment', async ({ page }) => {
    const timestamp = Date.now();
    const dir = `screenshots/assessment/${timestamp}`;

    // 1. Homepage load
    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${dir}/01-homepage-initial-load.png`, fullPage: true });

    // 2. Check feed loads
    await page.waitForSelector('.feed-card', { timeout: 5000 });
    await page.screenshot({ path: `${dir}/02-feed-loaded.png`, fullPage: true });

    // 3. Scroll through feed
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${dir}/03-feed-scrolled.png`, fullPage: true });

    // 4. Test video interaction
    const videoCard = await page.$('.feed-card video');
    if (videoCard) {
        await videoCard.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${dir}/04-video-playing.png`, fullPage: true });
    }

    // 5. Check for dual-language captions
    const captions = await page.$('.dual-caption-block');
    await page.screenshot({ path: `${dir}/05-captions-check.png`, fullPage: true });

    // 6. Test clickable word translation
    const clickableWord = await page.$('.clickable-word');
    if (clickableWord) {
        await clickableWord.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${dir}/06-word-translation.png`, fullPage: true });
    }

    // 7. Scroll more
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${dir}/07-infinite-scroll.png`, fullPage: true });

    // 8. Final state
    await page.screenshot({ path: `${dir}/08-final-state.png`, fullPage: true });

    console.log(`✅ Assessment complete! Screenshots saved to ${dir}/`);
});
