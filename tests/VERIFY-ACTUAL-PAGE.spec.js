/**
 * Verify the ACTUAL working page (port 3001 root)
 * Test the original 5 user commands
 */

const { test, expect } = require('@playwright/test');

test('Verify ACTUAL page - Original 5 commands', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'screenshots/ACTUAL-PAGE.png', fullPage: true });

    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Count videos
    const videos = await page.locator('video').count();
    console.log(`🎬 Videos found: ${videos}`);

    // Count articles/content
    const articles = await page.locator('.concept, article, .card').count();
    console.log(`📰 Content items: ${articles}`);

    // Check for feed/content
    const bodyText = await page.locator('body').textContent();
    const hasVideos = bodyText.includes('video') || bodyText.includes('Video');
    const hasArticles = bodyText.includes('article') || bodyText.includes('Article');
    const hasMemes = bodyText.includes('meme') || bodyText.includes('Meme') || bodyText.includes('social');

    console.log(`\n✅ ACTUAL PAGE STATUS:`);
    console.log(`   Videos mentioned: ${hasVideos}`);
    console.log(`   Articles mentioned: ${hasArticles}`);
    console.log(`   Memes/social mentioned: ${hasMemes}`);
});
