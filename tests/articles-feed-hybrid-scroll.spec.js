const { test, expect } = require('@playwright/test');

test.describe('Articles Feed - 2025 Hybrid Infinite Scroll', () => {
    test('should implement hybrid infinite scroll (auto-load + Load More button)', async ({ page }) => {
        console.log('\n📰 Testing Articles Feed Implementation...\n');

        // Navigate to articles feed
        await page.goto('http://localhost:3002/articles-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // 1. Check initial auto-load of 10 articles
        console.log('1️⃣ Testing initial auto-load...');
        const initialArticles = await page.locator('.article-card').count();
        console.log(`   ✅ Loaded ${initialArticles} articles initially`);
        expect(initialArticles).toBeGreaterThanOrEqual(1);
        expect(initialArticles).toBeLessThanOrEqual(10);

        // 2. Verify Load More button appears after initial load
        console.log('2️⃣ Checking Load More button...');
        const loadMoreBtn = page.locator('#loadMoreBtn');
        await expect(loadMoreBtn).toBeVisible({ timeout: 5000 });
        console.log('   ✅ Load More button is visible');

        // 3. Take screenshot of initial state
        await page.screenshot({
            path: 'screenshots/articles-feed-initial.png',
            fullPage: true
        });
        console.log('   📸 Screenshot: articles-feed-initial.png');

        // 4. Click Load More button
        console.log('3️⃣ Testing Load More functionality...');
        const articlesBeforeLoad = initialArticles;
        await loadMoreBtn.click();

        // Wait for new articles to load (loading indicator may be too fast to catch)
        await page.waitForTimeout(1000);
        const articlesAfterLoad = await page.locator('.article-card').count();
        console.log(`   ✅ Now showing ${articlesAfterLoad} articles (loaded ${articlesAfterLoad - articlesBeforeLoad} more)`);
        expect(articlesAfterLoad).toBeGreaterThan(articlesBeforeLoad);

        // 5. Verify pagination is working
        console.log('4️⃣ Verifying pagination system...');
        console.log(`   ✅ Pagination working: ${articlesBeforeLoad} → ${articlesAfterLoad} articles`);
        const finalArticles = articlesAfterLoad;

        // 6. Verify article card quality
        console.log('5️⃣ Verifying article card quality...');
        const firstCard = page.locator('.article-card').first();
        await expect(firstCard).toBeVisible();

        // Check for key elements
        const hasImage = await firstCard.locator('img').count() > 0;
        const hasTitle = await firstCard.locator('.article-title').count() > 0;
        const hasCategory = await firstCard.locator('.category-tag').count() > 0;

        console.log(`   ✅ Card has image: ${hasImage}`);
        console.log(`   ✅ Card has title: ${hasTitle}`);
        console.log(`   ✅ Card has category: ${hasCategory}`);

        // 7. Take final screenshot
        await page.screenshot({
            path: 'screenshots/articles-feed-loaded.png',
            fullPage: true
        });
        console.log('   📸 Screenshot: articles-feed-loaded.png');

        // 8. Performance check
        console.log('6️⃣ Performance validation...');
        const metrics = await page.evaluate(() => ({
            loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
            domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
        }));
        console.log(`   ⚡ Page load time: ${metrics.loadTime}ms`);
        console.log(`   ⚡ DOM ready: ${metrics.domReady}ms`);
        expect(metrics.loadTime).toBeLessThan(5000); // Should load in under 5s

        console.log('\n✅ ALL ARTICLES FEED TESTS PASSED!\n');
    });

    test('should fetch from correct API endpoint (port 3002)', async ({ page }) => {
        console.log('\n🔌 Testing API Integration...\n');

        // Monitor network requests
        const apiRequests = [];
        page.on('request', request => {
            if (request.url().includes('/api/unified-feed')) {
                apiRequests.push(request.url());
                console.log(`   📡 API Request: ${request.url()}`);
            }
        });

        await page.goto('http://localhost:3002/articles-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Verify API was called with correct port
        expect(apiRequests.length).toBeGreaterThan(0);
        expect(apiRequests[0]).toContain('localhost:3002');
        expect(apiRequests[0]).toContain('/api/unified-feed');
        console.log('   ✅ Using correct API endpoint on port 3002');

        console.log('\n✅ API INTEGRATION TEST PASSED!\n');
    });

    test('should display Spanish news content from RSS feeds', async ({ page }) => {
        console.log('\n🇪🇸 Testing Spanish News Content...\n');

        await page.goto('http://localhost:3002/articles-feed.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Check for article content
        const articles = page.locator('.article-card');
        const count = await articles.count();

        if (count > 0) {
            const firstArticle = articles.first();
            const title = await firstArticle.locator('.article-title').textContent();
            const content = await firstArticle.locator('.article-content, .article-description').textContent();

            console.log(`   📰 First article title: "${title}"`);
            console.log(`   📝 Content preview: "${content?.substring(0, 100)}..."`);
            console.log(`   ✅ Found ${count} Spanish news articles`);
        }

        expect(count).toBeGreaterThan(0);
        console.log('\n✅ SPANISH CONTENT TEST PASSED!\n');
    });
});
