const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:3001/unified-infinite-feed.html');
    await page.waitForTimeout(3000);

    // Take screenshot of initial page
    await page.screenshot({ path: 'screenshots/01-app-loads-to-reels.png', fullPage: false });
    console.log('✅ Screenshot 1: App loads to Reels tab');

    // Click Stories tab
    const storiesTab = await page.$('[data-tab="stories"]');
    if (storiesTab) {
        await storiesTab.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/02-stories-tab.png', fullPage: false });
        console.log('✅ Screenshot 2: Stories tab');
    }

    // Click Feed tab
    const feedTab = await page.$('[data-tab="feed"]');
    if (feedTab) {
        await feedTab.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/03-feed-tab.png', fullPage: false });
        console.log('✅ Screenshot 3: Feed tab');
    }

    // Go back to Reels
    const reelsTab = await page.$('[data-tab="reels"]');
    if (reelsTab) {
        await reelsTab.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/04-reels-tab.png', fullPage: false });
        console.log('✅ Screenshot 4: Back to Reels tab');
    }

    console.log('\n✅ All screenshots saved to screenshots/ directory');

    await browser.close();
})();
