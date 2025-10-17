const { test, expect } = require('@playwright/test');

test.describe('✅ Quick App Health Check', () => {
    test('App loads and shows content immediately', async ({ page }) => {
        await page.goto('http://localhost:3002');
        
        // Wait for feed content
        await page.waitForSelector('.feed-card, .video-card, .content-card', { timeout: 5000 });
        
        // Verify content is visible
        const hasContent = await page.locator('.feed-card, .video-card, .content-card').count();
        expect(hasContent).toBeGreaterThan(0);
        
        console.log(`✅ Found ${hasContent} content cards`);
    });

    test('No JavaScript errors on page load', async ({ page }) => {
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(3000);
        
        // Filter out expected 404s for missing media
        const criticalErrors = errors.filter(e => 
            !e.includes('404') && 
            !e.includes('Failed to load resource')
        );
        
        expect(criticalErrors).toHaveLength(0);
        console.log(`✅ No critical JavaScript errors`);
    });

    test('TikTok-style UI elements present', async ({ page }) => {
        await page.goto('http://localhost:3002');
        await page.waitForTimeout(2000);
        
        // Check for engagement buttons on right side
        const hasEngagement = await page.locator('[class*="action"], [class*="button"]').count();
        expect(hasEngagement).toBeGreaterThan(0);
        
        console.log(`✅ TikTok-style UI elements found`);
    });
});
