const { test, expect } = require('@playwright/test');

test.describe('AI Discover - Simple Verification', () => {
    test('Page loads and displays articles', async ({ page }) => {
        console.log('\n🤖 Testing AI Discover feed...\n');
        
        // Navigate to page
        await page.goto('http://localhost:3001/discover-ai.html');
        
        // Wait up to 15 seconds for articles to load
        try {
            await page.waitForSelector('.article-card', { timeout: 15000 });
            const count = await page.locator('.article-card').count();
            console.log(`✅ Loaded ${count} articles`);
            expect(count).toBeGreaterThan(0);
        } catch (error) {
            // Check if loading is still showing
            const loadingVisible = await page.locator('.loading').isVisible();
            console.log(`Loading visible: ${loadingVisible}`);
            
            // Take screenshot for debugging
            await page.screenshot({ path: 'ai-discover-error.png', fullPage: true });
            
            // Check for errors in console
            const errors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    console.log('Console error:', msg.text());
                    errors.push(msg.text());
                }
            });
            
            throw new Error(`Articles did not load. Loading visible: ${loadingVisible}`);
        }
        
        console.log('✅ AI Discover feed working!\n');
    });
    
    test('API returns data correctly', async ({ request }) => {
        console.log('🌐 Testing API endpoint...\n');
        
        const response = await request.get('http://localhost:3001/api/discover/personalized');
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        console.log(`✅ Success: ${data.success}`);
        console.log(`✅ Article count: ${data.count}`);
        console.log(`✅ Sources: ${data.sources?.join(', ')}`);
        
        expect(data.success).toBe(true);
        expect(data.articles.length).toBeGreaterThan(0);
        
        console.log('✅ API working correctly!\n');
    });
});
