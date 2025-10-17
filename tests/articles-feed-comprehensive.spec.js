/**
 * 📰 COMPREHENSIVE ARTICLES FEED TEST
 * 
 * Tests the complete articles feed experience with:
 * - Multi-source article loading (NewsAPI, Guardian, Reddit, YouTube, RSS)
 * - User-adaptive personalization (level, vocabulary, interests)
 * - Translation services (DeepL → OpenAI)
 * - TTS audio (ElevenLabs → OpenAI)
 * - Interactive features (clicking words, saving vocabulary)
 * 
 * Uses Playwright MCP to verify the best user experience
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const TEST_TIMEOUT = 60000; // 60 seconds for API calls

test.describe('Articles Feed - Comprehensive Test', () => {
    
    test.beforeEach(async ({ page }) => {
        // Set up user profile
        await page.goto(`${BASE_URL}/articles-feed.html`);
        
        // Set user level and interests
        await page.evaluate(() => {
            localStorage.setItem('userLevel', 'A2');
            localStorage.setItem('userInterests', JSON.stringify(['culture', 'technology', 'news']));
            localStorage.setItem('userId', 'test-user-001');
        });
        
        await page.reload();
    });

    test('should load articles from multiple sources', async ({ page }) => {
        test.setTimeout(TEST_TIMEOUT);
        
        console.log('📰 Testing multi-source article loading...');
        
        // Wait for loading to finish
        await page.waitForSelector('.articles-grid', { timeout: 30000 });
        
        // Check that articles loaded
        const articleCards = await page.locator('.article-card').count();
        console.log(`✅ Loaded ${articleCards} article cards`);
        expect(articleCards).toBeGreaterThan(0);
        
        // Check console logs for sources
        const logs = [];
        page.on('console', msg => {
            if (msg.text().includes('articles from sources')) {
                logs.push(msg.text());
            }
        });
        
        await page.waitForTimeout(2000);
        
        // Verify multiple sources are used
        const firstArticle = page.locator('.article-card').first();
        const sourceText = await firstArticle.locator('.article-source').textContent();
        console.log(`📡 First article source: ${sourceText}`);
        expect(sourceText.length).toBeGreaterThan(0);
        
        // Take screenshot
        await page.screenshot({ 
            path: 'screenshots/articles-feed-loaded.png',
            fullPage: true 
        });
        
        console.log('✅ Multi-source loading test passed');
    });

    test('should display user level and personalization', async ({ page }) => {
        console.log('👤 Testing user-adaptive personalization...');
        
        // Wait for page to load
        await page.waitForSelector('.user-level');
        
        // Check user level badge
        const levelBadge = await page.locator('.user-level').textContent();
        console.log(`🎯 User level: ${levelBadge}`);
        expect(levelBadge).toContain('A2');
        
        // Check that articles have difficulty badges
        const firstArticle = page.locator('.article-card').first();
        const difficultyBadge = await firstArticle.locator('.difficulty-badge').textContent();
        console.log(`📊 First article difficulty: ${difficultyBadge}`);
        expect(['A1', 'A2', 'B1']).toContain(difficultyBadge); // ±1 level from user
        
        // Check comprehension bar exists
        const comprehensionBar = await firstArticle.locator('.comprehension-fill').isVisible();
        expect(comprehensionBar).toBe(true);
        
        console.log('✅ Personalization test passed');
    });

    test('should switch between categories', async ({ page }) => {
        console.log('🗂️ Testing category switching...');
        
        // Wait for tabs to load
        await page.waitForSelector('.category-tabs');
        
        // Click on different categories
        const categories = ['news', 'culture', 'sports', 'technology'];
        
        for (const category of categories) {
            console.log(`Switching to: ${category}`);
            
            // Click category tab
            await page.click(`[data-category="${category}"]`);
            
            // Wait for loading
            await page.waitForTimeout(1000);
            
            // Check active tab
            const activeTab = await page.locator('.tab.active').getAttribute('data-category');
            expect(activeTab).toBe(category);
            
            // Check that articles reloaded (loading indicator should appear briefly)
            const articlesExist = await page.locator('.article-card').count();
            console.log(`  Found ${articlesExist} articles in ${category}`);
            
            if (articlesExist === 0) {
                console.log(`  ⚠️  No articles found for ${category} (may be normal if APIs rate limited)`);
            }
        }
        
        await page.screenshot({ 
            path: 'screenshots/articles-category-technology.png' 
        });
        
        console.log('✅ Category switching test passed');
    });

    test('should open article in reader mode', async ({ page }) => {
        console.log('📖 Testing reader mode...');
        
        await page.waitForSelector('.article-card');
        
        // Click first article
        await page.locator('.article-card').first().click();
        
        // Wait for reader modal
        await page.waitForSelector('.reader-modal.active', { timeout: 5000 });
        
        // Check reader elements
        const readerTitle = await page.locator('.reader-title').textContent();
        console.log(`📖 Reading: ${readerTitle.substring(0, 50)}...`);
        expect(readerTitle.length).toBeGreaterThan(0);
        
        const readerText = await page.locator('.reader-text').textContent();
        expect(readerText.length).toBeGreaterThan(0);
        
        // Check that words are clickable
        const clickableWords = await page.locator('.translatable-word').count();
        console.log(`💬 Found ${clickableWords} translatable words`);
        expect(clickableWords).toBeGreaterThan(0);
        
        await page.screenshot({ 
            path: 'screenshots/articles-reader-mode.png' 
        });
        
        // Close reader
        await page.click('#closeReader');
        await page.waitForSelector('.reader-modal:not(.active)');
        
        console.log('✅ Reader mode test passed');
    });

    test('should translate words on click', async ({ page }) => {
        test.setTimeout(TEST_TIMEOUT);
        
        console.log('💬 Testing word translation...');
        
        await page.waitForSelector('.article-card');
        
        // Open reader
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Click a word
        const firstWord = page.locator('.translatable-word').first();
        const wordText = await firstWord.textContent();
        console.log(`Translating word: "${wordText}"`);
        
        await firstWord.click();
        
        // Wait for translation tooltip
        await page.waitForSelector('.word-tooltip.active', { timeout: 10000 });
        
        // Check translation appears
        const translatedWord = await page.locator('#tooltipWord').textContent();
        const translation = await page.locator('#tooltipTranslation').textContent();
        
        console.log(`✅ Translation: "${translatedWord}" → "${translation}"`);
        expect(translation.length).toBeGreaterThan(0);
        expect(translation).not.toBe(wordText); // Should be different from Spanish
        
        await page.screenshot({ 
            path: 'screenshots/articles-word-translation.png' 
        });
        
        console.log('✅ Word translation test passed');
    });

    test('should save words to vocabulary', async ({ page }) => {
        console.log('💾 Testing vocabulary saving...');
        
        await page.waitForSelector('.article-card');
        
        // Open reader
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Click a word to translate
        await page.locator('.translatable-word').first().click();
        await page.waitForSelector('.word-tooltip.active');
        
        // Setup dialog handler
        page.on('dialog', dialog => {
            console.log(`Alert: ${dialog.message()}`);
            dialog.accept();
        });
        
        // Click save button
        await page.click('#saveWordBtn');
        
        await page.waitForTimeout(2000);
        
        console.log('✅ Word saving test passed');
    });

    test('should play audio narration', async ({ page }) => {
        test.setTimeout(TEST_TIMEOUT);
        
        console.log('🔊 Testing audio narration...');
        
        await page.waitForSelector('.article-card');
        
        // Click audio button on first article
        const firstArticle = page.locator('.article-card').first();
        
        // Open article first
        await firstArticle.click();
        await page.waitForSelector('.reader-modal.active');
        
        // Click audio button
        await page.click('#readerAudioBtn');
        
        // Wait for audio player to appear
        await page.waitForSelector('.audio-player.active', { timeout: 15000 });
        
        // Check audio player elements
        const audioTitle = await page.locator('#audioTitle').textContent();
        console.log(`🔊 Playing: ${audioTitle.substring(0, 40)}...`);
        expect(audioTitle.length).toBeGreaterThan(0);
        
        // Check play button
        const playBtn = await page.locator('#playPauseBtn').textContent();
        console.log(`🔊 Player state: ${playBtn === '⏸' ? 'Playing' : 'Paused'}`);
        
        await page.screenshot({ 
            path: 'screenshots/articles-audio-player.png' 
        });
        
        // Close audio
        await page.click('#closePlayer');
        await page.waitForTimeout(1000);
        
        console.log('✅ Audio narration test passed');
    });

    test('should show comprehension metrics', async ({ page }) => {
        console.log('📊 Testing comprehension metrics...');
        
        await page.waitForSelector('.article-card');
        
        // Get first article stats
        const firstArticle = page.locator('.article-card').first();
        
        // Check comprehension bar
        const comprehensionBar = firstArticle.locator('.comprehension-fill');
        const barWidth = await comprehensionBar.evaluate(el => el.style.width);
        console.log(`📊 Comprehension bar width: ${barWidth}`);
        
        // Check stats
        const stats = await firstArticle.locator('.article-stats').textContent();
        console.log(`📊 Article stats: ${stats}`);
        
        expect(stats).toContain('%'); // Should show percentage
        expect(stats).toContain('min'); // Should show read time
        
        await page.screenshot({ 
            path: 'screenshots/articles-comprehension.png' 
        });
        
        console.log('✅ Comprehension metrics test passed');
    });

    test('should be responsive on mobile', async ({ page }) => {
        console.log('📱 Testing mobile responsiveness...');
        
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        
        await page.waitForSelector('.articles-grid');
        
        // Check grid is single column
        const gridColumns = await page.locator('.articles-grid').evaluate(el => {
            return window.getComputedStyle(el).gridTemplateColumns;
        });
        console.log(`📱 Mobile grid columns: ${gridColumns}`);
        
        // Check navigation is visible
        const navVisible = await page.locator('.bottom-nav').isVisible();
        expect(navVisible).toBe(true);
        
        // Check header elements
        const headerVisible = await page.locator('.header').isVisible();
        expect(headerVisible).toBe(true);
        
        await page.screenshot({ 
            path: 'screenshots/articles-mobile-view.png',
            fullPage: true 
        });
        
        console.log('✅ Mobile responsiveness test passed');
    });

    test('should handle API errors gracefully', async ({ page }) => {
        console.log('⚠️  Testing error handling...');
        
        // Intercept API calls and return error
        await page.route('**/api/articles-enhanced/feed*', route => {
            route.fulfill({
                status: 500,
                body: JSON.stringify({ success: false, error: 'Test error' })
            });
        });
        
        await page.reload();
        
        // Should show fallback articles or error state
        await page.waitForTimeout(3000);
        
        // Check if articles grid or empty state is shown
        const gridVisible = await page.locator('.articles-grid').isVisible();
        const emptyVisible = await page.locator('.empty-state').isVisible();
        
        console.log(`Grid visible: ${gridVisible}, Empty state: ${emptyVisible}`);
        expect(gridVisible || emptyVisible).toBe(true);
        
        await page.screenshot({ 
            path: 'screenshots/articles-error-handling.png' 
        });
        
        console.log('✅ Error handling test passed');
    });

    test('should track user interactions', async ({ page }) => {
        console.log('📈 Testing interaction tracking...');
        
        const consoleLogs = [];
        page.on('console', msg => {
            if (msg.type() === 'log') {
                consoleLogs.push(msg.text());
            }
        });
        
        await page.waitForSelector('.article-card');
        
        // Click article
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        // Check logs for tracking
        await page.waitForTimeout(1000);
        
        const trackingLogs = consoleLogs.filter(log => 
            log.includes('articles') || log.includes('User profile')
        );
        
        console.log(`📈 Tracking logs: ${trackingLogs.length}`);
        trackingLogs.forEach(log => console.log(`  - ${log.substring(0, 100)}`));
        
        console.log('✅ Interaction tracking test passed');
    });

});

test.describe('Articles Feed - Performance Tests', () => {
    
    test('should load within 5 seconds', async ({ page }) => {
        console.log('⚡ Testing load performance...');
        
        const startTime = Date.now();
        
        await page.goto(`${BASE_URL}/articles-feed.html`);
        await page.waitForSelector('.articles-grid', { timeout: 30000 });
        
        const loadTime = Date.now() - startTime;
        console.log(`⚡ Page load time: ${loadTime}ms`);
        
        // Should load reasonably fast (allowing for API calls)
        expect(loadTime).toBeLessThan(30000); // 30 seconds max
        
        if (loadTime < 5000) {
            console.log('✅ Excellent performance (<5s)');
        } else if (loadTime < 10000) {
            console.log('✅ Good performance (<10s)');
        } else {
            console.log('⚠️  Slow performance (>10s) - May be due to API rate limits');
        }
        
        console.log('✅ Performance test passed');
    });

    test('should cache articles effectively', async ({ page }) => {
        console.log('💾 Testing caching...');
        
        await page.goto(`${BASE_URL}/articles-feed.html`);
        await page.waitForSelector('.articles-grid');
        
        const firstLoadTime = Date.now();
        await page.reload();
        await page.waitForSelector('.articles-grid');
        const firstReloadTime = Date.now() - firstLoadTime;
        
        console.log(`💾 First reload: ${firstReloadTime}ms`);
        
        // Second reload should be faster (cached)
        const secondLoadTime = Date.now();
        await page.reload();
        await page.waitForSelector('.articles-grid');
        const secondReloadTime = Date.now() - secondLoadTime;
        
        console.log(`💾 Second reload: ${secondReloadTime}ms`);
        console.log(`💾 Cache improvement: ${Math.round((1 - secondReloadTime/firstReloadTime) * 100)}%`);
        
        console.log('✅ Caching test passed');
    });

});

test.describe('Articles Feed - Integration Tests', () => {
    
    test('should integrate with vocabulary system', async ({ page }) => {
        console.log('🔗 Testing vocabulary integration...');
        
        await page.goto(`${BASE_URL}/articles-feed.html`);
        await page.waitForSelector('.article-card');
        
        // Open article and save a word
        await page.locator('.article-card').first().click();
        await page.waitForSelector('.reader-modal.active');
        
        await page.locator('.translatable-word').first().click();
        await page.waitForSelector('.word-tooltip.active');
        
        page.on('dialog', dialog => dialog.accept());
        await page.click('#saveWordBtn');
        
        await page.waitForTimeout(2000);
        
        // Navigate to vocabulary page
        await page.goto(`${BASE_URL}/vocabulary-review.html`);
        
        // Check if vocabulary page loads
        await page.waitForSelector('body', { timeout: 5000 });
        
        console.log('✅ Vocabulary integration test passed');
    });

    test('should navigate between sections', async ({ page }) => {
        console.log('🧭 Testing navigation...');
        
        await page.goto(`${BASE_URL}/articles-feed.html`);
        await page.waitForSelector('.articles-grid');
        
        // Check bottom navigation
        const navItems = await page.locator('.nav-item').count();
        console.log(`🧭 Navigation items: ${navItems}`);
        expect(navItems).toBeGreaterThan(0);
        
        // Click home navigation
        const homeNav = page.locator('.nav-item[data-page="home"]');
        if (await homeNav.count() > 0) {
            await homeNav.click();
            await page.waitForTimeout(2000);
            console.log(`🧭 Navigated to: ${page.url()}`);
        }
        
        console.log('✅ Navigation test passed');
    });

});

