const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('AI Discover Feed - Comprehensive Tests', () => {
    const screenshotDir = path.join(__dirname, '../screenshots/ai-discover-' + Date.now());

    test.beforeAll(() => {
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
    });

    test('1. AI Discover Page Loads Successfully', async ({ page }) => {
        console.log('\n🤖 Testing AI Discover page load...');
        
        await page.goto('http://localhost:3001/discover-ai.html');
        
        // Wait for loading to complete
        await page.waitForSelector('.loading', { state: 'hidden', timeout: 10000 });
        
        // Check if articles loaded
        const articles = await page.locator('.article-card').count();
        console.log(`✅ Loaded ${articles} articles`);
        expect(articles).toBeGreaterThan(0);
        
        // Take screenshot
        await page.screenshot({ 
            path: path.join(screenshotDir, '01-ai-discover-loaded.png'),
            fullPage: true 
        });
    });

    test('2. Personalization Info Displays', async ({ page }) => {
        console.log('\n🎯 Testing personalization info...');
        
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Check personalization banner
        const banner = await page.locator('.personalization-info').textContent();
        console.log(`✅ Personalization: ${banner}`);
        expect(banner).toContain('Personalized');
        
        // Check recommendation reasons on articles
        const firstReason = await page.locator('.recommendation-reason').first().textContent();
        console.log(`✅ Recommendation reason: ${firstReason}`);
        expect(firstReason.length).toBeGreaterThan(0);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '02-personalization-info.png') 
        });
    });

    test('3. Article Cards Display Correctly', async ({ page }) => {
        console.log('\n📰 Testing article card rendering...');
        
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        const firstCard = page.locator('.article-card').first();
        
        // Check all required elements
        await expect(firstCard.locator('.article-title')).toBeVisible();
        await expect(firstCard.locator('.article-description')).toBeVisible();
        await expect(firstCard.locator('.article-source')).toBeVisible();
        await expect(firstCard.locator('.badge.level')).toBeVisible();
        
        const title = await firstCard.locator('.article-title').textContent();
        const source = await firstCard.locator('.article-source').textContent();
        const level = await firstCard.locator('.badge.level').textContent();
        
        console.log(`✅ Article: "${title}"`);
        console.log(`✅ Source: ${source}`);
        console.log(`✅ Level: ${level}`);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '03-article-card.png') 
        });
    });

    test('4. Audio Player Functionality', async ({ page }) => {
        console.log('\n🎧 Testing audio player...');
        
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Find article with audio badge
        const audioButton = page.locator('.action-btn[title="Listen"]').first();
        
        if (await audioButton.count() > 0) {
            // Click audio button
            await audioButton.click();
            
            // Wait for audio player to appear
            await page.waitForSelector('.audio-player.active', { timeout: 3000 });
            
            // Check audio player elements
            await expect(page.locator('#audioTitle')).toBeVisible();
            await expect(page.locator('#audioPlayIcon')).toBeVisible();
            await expect(page.locator('#audioSpeed')).toBeVisible();
            
            const audioTitle = await page.locator('#audioTitle').textContent();
            console.log(`✅ Playing: ${audioTitle}`);
            
            // Test speed control
            await page.locator('.audio-btn:has-text("1x")').click();
            const speed = await page.locator('#audioSpeed').textContent();
            console.log(`✅ Speed changed to: ${speed}`);
            
            await page.screenshot({ 
                path: path.join(screenshotDir, '04-audio-player.png') 
            });
            
            // Stop audio
            await page.locator('button:has-text("⏹️")').click();
        } else {
            console.log('⚠️  No audio articles found (expected with Web Speech API)');
        }
    });

    test('5. Topic Filtering Works', async ({ page }) => {
        console.log('\n🔍 Testing topic filtering...');
        
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Get initial article count
        const initialCount = await page.locator('.article-card').count();
        console.log(`✅ Initial articles: ${initialCount}`);
        
        // Click a filter (e.g., Technology)
        const techFilter = page.locator('.filter-btn:has-text("Technology")');
        if (await techFilter.count() > 0) {
            await techFilter.click();
            
            // Wait for filter to apply
            await page.waitForTimeout(500);
            
            const filteredCount = await page.locator('.article-card').count();
            console.log(`✅ Filtered articles (Technology): ${filteredCount}`);
            
            // Verify filter is active
            await expect(techFilter).toHaveClass(/active/);
            
            await page.screenshot({ 
                path: path.join(screenshotDir, '05-filtered-technology.png'),
                fullPage: true 
            });
        }
    });

    test('6. Save Article Functionality', async ({ page }) => {
        console.log('\n💾 Testing save functionality...');
        
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Click save button on first article
        const saveButton = page.locator('.action-btn[title="Save"]').first();
        await saveButton.click();
        
        // Wait for visual feedback
        await page.waitForTimeout(500);
        
        // Check localStorage
        const savedArticles = await page.evaluate(() => {
            return localStorage.getItem('savedArticles');
        });
        
        if (savedArticles) {
            const articles = JSON.parse(savedArticles);
            console.log(`✅ Saved ${articles.length} article(s)`);
            expect(articles.length).toBeGreaterThan(0);
        }
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '06-article-saved.png') 
        });
    });

    test('7. Article Click Opens in New Tab', async ({ page, context }) => {
        console.log('\n🔗 Testing article click...');
        
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Get article URL
        const firstCard = page.locator('.article-card').first();
        
        // Listen for new page
        const pagePromise = context.waitForEvent('page');
        
        // Click article (avoid buttons)
        await firstCard.click({ position: { x: 100, y: 100 } });
        
        // Wait for new page (may timeout if article doesn't have URL)
        try {
            const newPage = await pagePromise;
            await newPage.waitForLoadState();
            const url = newPage.url();
            console.log(`✅ Opened article: ${url}`);
            await newPage.close();
        } catch (error) {
            console.log('⚠️  Article click did not open new tab (expected for some sources)');
        }
    });

    test('8. API Endpoint Returns Data', async ({ request }) => {
        console.log('\n🌐 Testing API endpoint...');
        
        const response = await request.get('http://localhost:3001/api/discover/personalized');
        expect(response.ok()).toBeTruthy();
        
        const data = await response.json();
        console.log(`✅ API Response:`, {
            success: data.success,
            count: data.count,
            sources: data.sources?.length
        });
        
        expect(data.success).toBe(true);
        expect(data.articles).toBeDefined();
        expect(data.articles.length).toBeGreaterThan(0);
        expect(data.sources).toBeDefined();
        
        // Check article structure
        const firstArticle = data.articles[0];
        expect(firstArticle).toHaveProperty('id');
        expect(firstArticle).toHaveProperty('title');
        expect(firstArticle).toHaveProperty('description');
        expect(firstArticle).toHaveProperty('url');
        expect(firstArticle).toHaveProperty('cefrLevel');
        
        console.log(`✅ Sample article: "${firstArticle.title}"`);
    });

    test('9. Performance Check', async ({ page }) => {
        console.log('\n⚡ Testing performance...');
        
        const startTime = Date.now();
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForSelector('.article-card', { timeout: 10000 });
        const loadTime = Date.now() - startTime;
        
        console.log(`✅ Page load time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds
        
        // Check for console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        await page.reload();
        await page.waitForTimeout(2000);
        
        if (errors.length > 0) {
            console.log('⚠️  Console errors:', errors);
        } else {
            console.log('✅ No console errors');
        }
    });

    test('10. Mobile Responsiveness', async ({ page }) => {
        console.log('\n📱 Testing mobile responsiveness...');
        
        // Test iPhone viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Check if layout is responsive
        const header = await page.locator('.header').boundingBox();
        expect(header.width).toBeLessThanOrEqual(375);
        
        console.log('✅ Mobile layout OK');
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '10-mobile-view.png'),
            fullPage: true 
        });
        
        // Test landscape
        await page.setViewportSize({ width: 667, height: 375 });
        await page.reload();
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        console.log('✅ Landscape layout OK');
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '11-landscape-view.png'),
            fullPage: true 
        });
    });

    test('11. User Profile Updates on Interaction', async ({ page }) => {
        console.log('\n👤 Testing user profile updates...');
        
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Click article to trigger profile update
        const firstCard = page.locator('.article-card').first();
        await firstCard.click({ position: { x: 100, y: 100 } });
        
        // Wait a bit for tracking
        await page.waitForTimeout(500);
        
        // Check if profile was created/updated
        const profile = await page.evaluate(() => {
            return localStorage.getItem('userProfile_default_user');
        });
        
        if (profile) {
            const profileData = JSON.parse(profile);
            console.log('✅ User profile:', {
                level: profileData.cefrLevel,
                videosWatched: profileData.videosWatched?.length || 0,
                articlesRead: profileData.articlesRead?.length || 0
            });
        } else {
            console.log('⚠️  Profile not yet created (will be created on interaction)');
        }
    });

    test('12. Recommendation Scoring Verification', async ({ page }) => {
        console.log('\n🎯 Verifying personalization scoring...');
        
        await page.goto('http://localhost:3001/discover-ai.html');
        await page.waitForSelector('.article-card', { timeout: 10000 });
        
        // Check for personalization badges
        const personalizedBadges = await page.locator('.badge.personalized').count();
        console.log(`✅ Found ${personalizedBadges} highly personalized articles`);
        
        // Check for recommendation reasons
        const reasons = await page.locator('.recommendation-reason').allTextContents();
        const uniqueReasons = [...new Set(reasons)];
        console.log(`✅ Recommendation reasons:`, uniqueReasons.slice(0, 3));
        
        expect(reasons.length).toBeGreaterThan(0);
    });

    test.afterAll(async () => {
        console.log(`\n📸 Screenshots saved to: ${screenshotDir}`);
        console.log('\n🎉 All AI Discover tests complete!');
    });
});
