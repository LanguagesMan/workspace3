const { test } = require('@playwright/test');

test('Debug feed rendering', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(3000);

    // Check console errors
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.log('ERROR:', error.message));

    // Check if feed loaded
    const feedHTML = await page.locator('#feedContainer').innerHTML();
    console.log('Feed container HTML length:', feedHTML.length);
    
    // Check if UnifiedFeed class exists
    const hasClass = await page.evaluate(() => typeof UnifiedFeed !== 'undefined');
    console.log('UnifiedFeed class exists:', hasClass);

    // Check if feed instance exists
    const hasFeed = await page.evaluate(() => typeof window.feed !== 'undefined');
    console.log('window.feed exists:', hasFeed);

    // Check feedData
    const feedData = await page.evaluate(() => window.feed?.allContent?.length || 0);
    console.log('Feed data count:', feedData);

    // Check filtered content
    const filtered = await page.evaluate(() => window.feed?.filteredContent?.length || 0);
    console.log('Filtered content count:', filtered);

    // Check current tab
    const currentTab = await page.evaluate(() => window.feed?.currentTab);
    console.log('Current tab:', currentTab);

    // Try manual API fetch
    const apiResponse = await page.evaluate(async () => {
        try {
            const res = await fetch('http://localhost:3002/api/feed');
            const data = await res.json();
            return { success: true, count: data.length, first: data[0]?.type };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });
    console.log('Manual API fetch:', JSON.stringify(apiResponse, null, 2));
});
