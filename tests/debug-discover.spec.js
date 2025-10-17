const { test, expect } = require('@playwright/test');

test('DEBUG: AI Discover Page Loading', async ({ page }) => {
    console.log('\n🔍 DEBUGGING AI DISCOVER PAGE...\n');
    
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push(text);
        console.log(`  [BROWSER]: ${text}`);
    });
    
    // Capture errors
    page.on('pageerror', err => {
        console.log(`  [ERROR]: ${err.message}`);
    });
    
    // Navigate to discover page
    await page.goto('http://localhost:3001/discover-ai.html');
    
    // Wait for loading to complete (API takes ~17 seconds)
    await page.waitForTimeout(25000); // Give API time to respond
    
    // Take screenshot
    await page.screenshot({ 
        path: 'screenshots/debug-discover.png',
        fullPage: true 
    });
    
    // Check what's in the DOM
    const loadingVisible = await page.locator('#loading').isVisible();
    const feedVisible = await page.locator('#feedContainer').isVisible();
    const emptyVisible = await page.locator('#emptyState').isVisible();
    const articleCount = await page.locator('.article-card').count();
    
    console.log('\n📊 DOM State:');
    console.log(`  Loading visible: ${loadingVisible}`);
    console.log(`  Feed visible: ${feedVisible}`);
    console.log(`  Empty state visible: ${emptyVisible}`);
    console.log(`  Article cards: ${articleCount}`);
    
    // Get feed container HTML
    const feedHTML = await page.locator('#feedContainer').innerHTML();
    console.log(`\n  Feed container HTML length: ${feedHTML.length} chars`);
    if (feedHTML.length < 100) {
        console.log(`  Feed HTML: ${feedHTML}`);
    }
    
    // Check if functions exist
    const hasLoadFunction = await page.evaluate(() => {
        return typeof loadPersonalizedFeed !== 'undefined';
    });
    console.log(`  loadPersonalizedFeed exists: ${hasLoadFunction}`);
    
    const hasDisplayFunction = await page.evaluate(() => {
        return typeof displayArticles !== 'undefined';
    });
    console.log(`  displayArticles exists: ${hasDisplayFunction}`);
    
    // Check currentArticles variable
    const articlesInMemory = await page.evaluate(() => {
        return window.currentArticles ? window.currentArticles.length : 0;
    });
    console.log(`  Articles in memory: ${articlesInMemory}`);
    
    console.log('\n📋 Console Messages:');
    consoleMessages.forEach(msg => {
        if (msg.includes('articles') || msg.includes('API') || msg.includes('Error') || msg.includes('❌')) {
            console.log(`    ${msg}`);
        }
    });
    
    console.log('\n✅ Debug complete\n');
});
