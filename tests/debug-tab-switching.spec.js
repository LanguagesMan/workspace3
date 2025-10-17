const { test } = require('@playwright/test');

test('Debug tab switching', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(3000);

    // Wait for window.feed to be defined
    await page.waitForFunction(() => typeof window.feed !== 'undefined', { timeout: 10000 });

    console.log('\n=== INITIAL STATE (Videos) ===');
    let currentTab = await page.evaluate(() => window.feed?.currentTab);
    let allContent = await page.evaluate(() => window.feed?.allContent?.length || 0);
    let filtered = await page.evaluate(() => window.feed?.filteredContent?.length || 0);
    console.log('Current tab:', currentTab);
    console.log('All content:', allContent);
    console.log('Filtered:', filtered);

    // Click Articles tab
    console.log('\n=== CLICKING ARTICLES TAB ===');
    await page.click('.nav-tab[data-tab="articles"]');
    await page.waitForTimeout(2000);

    currentTab = await page.evaluate(() => window.feed?.currentTab);
    allContent = await page.evaluate(() => window.feed?.allContent?.length || 0);
    filtered = await page.evaluate(() => window.feed?.filteredContent?.length || 0);
    const feedHTML = await page.locator('#feedContainer').innerHTML();
    console.log('Current tab:', currentTab);
    console.log('All content:', allContent);
    console.log('Filtered:', filtered);
    console.log('Feed HTML length:', feedHTML.length);
    console.log('Has "ARTICLE" badge:', feedHTML.includes('ARTICLE'));
    console.log('Has "VIDEO" badge:', feedHTML.includes('VIDEO'));

    // Check console for filter messages
    const logs = [];
    page.on('console', msg => {
        if (msg.text().includes('Filtered') || msg.text().includes('Switched')) {
            logs.push(msg.text());
        }
    });

    // Click Music tab
    console.log('\n=== CLICKING MUSIC TAB ===');
    await page.click('.nav-tab[data-tab="music"]');
    await page.waitForTimeout(2000);

    currentTab = await page.evaluate(() => window.feed?.currentTab);
    filtered = await page.evaluate(() => window.feed?.filteredContent?.length || 0);
    const musicHTML = await page.locator('#feedContainer').innerHTML();
    console.log('Current tab:', currentTab);
    console.log('Filtered:', filtered);
    console.log('Has "MUSIC" badge:', musicHTML.includes('MUSIC'));

    console.log('\n=== CONSOLE LOGS ===');
    logs.forEach(log => console.log(log));
});
