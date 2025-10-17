// Screenshot current design for analysis
const { test } = require('@playwright/test');

test('Screenshot current video feed design', async ({ page }) => {
    await page.goto('http://localhost:3002/videos-new.html');
    await page.waitForSelector('.video-feed', { timeout: 5000 });

    // Full page screenshot
    await page.screenshot({
        path: 'screenshots/workspace3/competitors/CURRENT_video_feed_full.png',
        fullPage: true
    });

    // Scroll down and capture another video
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(500);
    await page.screenshot({
        path: 'screenshots/workspace3/competitors/CURRENT_video_feed_scrolled.png',
        fullPage: false
    });
});

test('Screenshot current article feed design', async ({ page }) => {
    await page.goto('http://localhost:3002/articles-new.html');
    await page.waitForSelector('#articleFeed', { timeout: 5000 });

    // Full page screenshot
    await page.screenshot({
        path: 'screenshots/workspace3/competitors/CURRENT_article_feed_full.png',
        fullPage: true
    });

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(500);
    await page.screenshot({
        path: 'screenshots/workspace3/competitors/CURRENT_article_feed_scrolled.png',
        fullPage: false
    });
});
