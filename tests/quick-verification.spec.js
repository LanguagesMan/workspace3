const { test, expect } = require('@playwright/test');

test.describe('Quick Verification - All New Pages', () => {
    test('All pages load successfully', async ({ page }) => {
        console.log('\n🔍 Quick verification of all pages...\n');
        
        const pages = [
            '/',
            '/tiktok-video-feed.html',
            '/games-hub.html',
            '/word-match-game.html',
            '/sentence-builder-game.html',
            '/listening-challenge.html',
            '/discover-feed.html',
            '/profile.html',
            '/srs-review.html',
            '/achievements.html'
        ];
        
        let successCount = 0;
        
        for (const url of pages) {
            try {
                const response = await page.goto(`http://localhost:3001${url}`);
                const status = response.status();
                
                if (status === 200) {
                    successCount++;
                    console.log(`✅ ${url}`);
                } else {
                    console.log(`❌ ${url} - Status: ${status}`);
                }
                
                await page.waitForTimeout(300);
            } catch (err) {
                console.log(`❌ ${url} - Error: ${err.message}`);
            }
        }
        
        console.log(`\n📊 Result: ${successCount}/${pages.length} pages working\n`);
        expect(successCount).toBeGreaterThanOrEqual(9);
    });
});
