/**
 * 📰 ULTIMATE ARTICLES FEED - USER PERSONA TESTING
 * 
 * Tests the articles feed as different user personas:
 * - Maria (A1 beginner, interested in culture & food)
 * - Carlos (B1 intermediate, interested in tech & sports)
 * - Sofia (C1 advanced, interested in politics & science)
 * 
 * Takes screenshots to identify UX issues for each persona
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// User Personas
const personas = {
    maria: {
        name: 'Maria',
        level: 'A1',
        interests: ['culture', 'entertainment', 'food'],
        vocabulary: 300,
        description: 'Complete beginner, loves culture and food'
    },
    carlos: {
        name: 'Carlos',
        level: 'B1',
        interests: ['technology', 'sports', 'news'],
        vocabulary: 1500,
        description: 'Intermediate learner, tech enthusiast'
    },
    sofia: {
        name: 'Sofia',
        level: 'C1',
        interests: ['news', 'science', 'culture'],
        vocabulary: 5000,
        description: 'Advanced learner, intellectually curious'
    }
};

test.describe('Articles Ultimate - User Persona Testing', () => {

    Object.entries(personas).forEach(([key, persona]) => {
        
        test.describe(`Persona: ${persona.name} (${persona.level}) - ${persona.description}`, () => {
            
            test.beforeEach(async ({ page }) => {
                // Set up persona profile
                await page.goto(`${BASE_URL}/articles-ultimate.html`);
                
                await page.evaluate((p) => {
                    localStorage.setItem('userLevel', p.level);
                    localStorage.setItem('userInterests', JSON.stringify(p.interests));
                    localStorage.setItem('userId', `test-${p.name.toLowerCase()}`);
                }, persona);
                
                await page.reload();
            });

            test(`should load personalized feed for ${persona.name}`, async ({ page }) => {
                test.setTimeout(60000);
                
                console.log(`\n👤 Testing as ${persona.name} (${persona.level} level)`);
                console.log(`   Interests: ${persona.interests.join(', ')}`);
                
                // Wait for articles to load
                await page.waitForSelector('.feed-grid', { timeout: 30000 });
                
                // Take initial screenshot
                await page.screenshot({
                    path: `screenshots/persona-${key}-01-initial-load.png`,
                    fullPage: true
                });
                
                // Check user level badge
                const levelBadge = await page.locator('#userLevel').textContent();
                console.log(`   ✅ Level badge: ${levelBadge}`);
                expect(levelBadge).toContain(persona.level);
                
                // Count articles loaded
                await page.waitForTimeout(3000); // Wait for skeleton to be replaced
                const articleCount = await page.locator('.article-card:not(.skeleton-card)').count();
                console.log(`   ✅ Articles loaded: ${articleCount}`);
                
                // Check that articles have appropriate difficulty
                if (articleCount > 0) {
                    const firstArticle = page.locator('.article-card').first();
                    const difficultyTag = await firstArticle.locator('.tag.level').textContent();
                    console.log(`   ✅ Article difficulty: ${difficultyTag}`);
                    
                    // Verify difficulty is appropriate (±1 level)
                    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                    const userLevelIndex = levels.indexOf(persona.level);
                    const allowedLevels = [
                        levels[userLevelIndex - 1],
                        levels[userLevelIndex],
                        levels[userLevelIndex + 1]
                    ].filter(Boolean);
                    
                    expect(allowedLevels).toContain(difficultyTag);
                }
                
                expect(articleCount).toBeGreaterThan(0);
            });

            test(`should switch between categories for ${persona.name}`, async ({ page }) => {
                console.log(`\n📂 Testing category switching for ${persona.name}`);
                
                await page.waitForSelector('.feed-grid');
                
                // Test each of their interests
                for (const interest of persona.interests.slice(0, 2)) {
                    console.log(`   Switching to: ${interest}`);
                    
                    // Find and click category
                    const categoryBtn = page.locator(`.category-pill[data-category="${interest}"]`);
                    if (await categoryBtn.count() > 0) {
                        await categoryBtn.click();
                        
                        // Wait for new articles
                        await page.waitForTimeout(2000);
                        
                        // Take screenshot
                        await page.screenshot({
                            path: `screenshots/persona-${key}-category-${interest}.png`,
                            fullPage: true
                        });
                        
                        // Check active pill
                        const isActive = await categoryBtn.evaluate(el => el.classList.contains('active'));
                        console.log(`   ✅ ${interest} category ${isActive ? 'active' : 'not active'}`);
                        expect(isActive).toBe(true);
                    }
                }
            });

            test(`should display appropriate content for ${persona.name}'s level`, async ({ page }) => {
                console.log(`\n🎯 Checking content appropriateness for ${persona.name}`);
                
                await page.waitForSelector('.article-card:not(.skeleton-card)');
                
                // Get all article difficulty levels
                const difficulties = await page.locator('.tag.level').allTextContents();
                console.log(`   Article difficulties: ${difficulties.slice(0, 5).join(', ')}`);
                
                // Take screenshot of article grid
                await page.screenshot({
                    path: `screenshots/persona-${key}-02-article-grid.png`,
                    fullPage: true
                });
                
                // Verify most articles are at appropriate level
                const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                const userLevelIndex = levels.indexOf(persona.level);
                const allowedLevels = [
                    levels[userLevelIndex - 1],
                    levels[userLevelIndex],
                    levels[userLevelIndex + 1]
                ].filter(Boolean);
                
                const appropriateCount = difficulties.filter(d => allowedLevels.includes(d)).length;
                const appropriatePercentage = (appropriateCount / difficulties.length) * 100;
                
                console.log(`   ✅ ${appropriatePercentage.toFixed(0)}% articles at appropriate level`);
                expect(appropriatePercentage).toBeGreaterThan(50); // At least 50% should be appropriate
            });

            test(`should show comprehension match for ${persona.name}`, async ({ page }) => {
                console.log(`\n📊 Checking comprehension metrics for ${persona.name}`);
                
                await page.waitForSelector('.article-card:not(.skeleton-card)');
                
                // Get comprehension scores
                const matches = await page.locator('.article-match').allTextContents();
                const scores = matches.map(m => parseInt(m.replace(/[^\d]/g, '')));
                const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                
                console.log(`   Comprehension scores: ${scores.slice(0, 5).join('%, ')}%`);
                console.log(`   ✅ Average comprehension: ${avgScore.toFixed(0)}%`);
                
                // For beginners, scores should be higher (easier content)
                // For advanced, scores can be lower (more challenging)
                if (persona.level === 'A1') {
                    expect(avgScore).toBeGreaterThan(70); // Beginners need easy content
                } else if (persona.level === 'C1') {
                    expect(avgScore).toBeGreaterThan(50); // Advanced can handle harder
                }
                
                await page.screenshot({
                    path: `screenshots/persona-${key}-03-comprehension.png`
                });
            });

            test(`should interact with article for ${persona.name}`, async ({ page }) => {
                console.log(`\n🖱️  Testing article interaction for ${persona.name}`);
                
                await page.waitForSelector('.article-card:not(.skeleton-card)');
                
                // Hover over first article
                const firstArticle = page.locator('.article-card').first();
                await firstArticle.hover();
                
                await page.waitForTimeout(500);
                
                // Take screenshot of hover state
                await page.screenshot({
                    path: `screenshots/persona-${key}-04-article-hover.png`
                });
                
                // Click Read button
                const readBtn = firstArticle.locator('.action-btn.primary');
                const articleTitle = await firstArticle.locator('.article-title').textContent();
                console.log(`   Reading: ${articleTitle.substring(0, 50)}...`);
                
                await readBtn.click();
                
                await page.waitForTimeout(2000);
                
                // Take screenshot after action
                await page.screenshot({
                    path: `screenshots/persona-${key}-05-after-read-click.png`
                });
            });

            test(`should be mobile responsive for ${persona.name}`, async ({ page }) => {
                console.log(`\n📱 Testing mobile view for ${persona.name}`);
                
                // Set mobile viewport
                await page.setViewportSize({ width: 375, height: 812 });
                await page.reload();
                
                await page.waitForSelector('.feed-grid');
                await page.waitForTimeout(2000);
                
                // Take mobile screenshot
                await page.screenshot({
                    path: `screenshots/persona-${key}-06-mobile.png`,
                    fullPage: true
                });
                
                // Check single column layout
                const gridColumns = await page.locator('.feed-grid').evaluate(el => {
                    return window.getComputedStyle(el).gridTemplateColumns;
                });
                console.log(`   Mobile grid columns: ${gridColumns}`);
                
                // Check that categories are scrollable
                const categoriesScroll = page.locator('.categories-scroll');
                const scrollWidth = await categoriesScroll.evaluate(el => el.scrollWidth);
                const clientWidth = await categoriesScroll.evaluate(el => el.clientWidth);
                
                console.log(`   ✅ Categories scrollable: ${scrollWidth > clientWidth}`);
                expect(scrollWidth).toBeGreaterThan(clientWidth);
            });

            test(`should handle loading states for ${persona.name}`, async ({ page }) => {
                console.log(`\n⏳ Testing loading states for ${persona.name}`);
                
                // Navigate and immediately check loading
                const navigationPromise = page.goto(`${BASE_URL}/articles-ultimate.html`);
                
                // Try to catch loading state
                try {
                    await page.waitForSelector('.loading-container', { timeout: 1000 });
                    
                    await page.screenshot({
                        path: `screenshots/persona-${key}-07-loading.png`
                    });
                    
                    console.log(`   ✅ Loading state captured`);
                } catch (e) {
                    console.log(`   ⚠️  Loading too fast to capture`);
                }
                
                await navigationPromise;
                
                // Wait for content
                await page.waitForSelector('.feed-grid:not([style*="display: none"])');
                
                console.log(`   ✅ Content loaded successfully`);
            });

            test(`should show appropriate UI elements for ${persona.name}`, async ({ page }) => {
                console.log(`\n🎨 Checking UI elements for ${persona.name}`);
                
                await page.waitForSelector('.feed-grid');
                
                // Check all UI elements are present
                const elements = {
                    'Header': '.header',
                    'Logo': '.logo',
                    'User Badge': '.user-badge',
                    'Categories': '.categories',
                    'Category Pills': '.category-pill',
                    'Feed Grid': '.feed-grid',
                    'FAB': '.fab'
                };
                
                for (const [name, selector] of Object.entries(elements)) {
                    const exists = await page.locator(selector).count();
                    console.log(`   ${exists > 0 ? '✅' : '❌'} ${name}`);
                    expect(exists).toBeGreaterThan(0);
                }
                
                await page.screenshot({
                    path: `screenshots/persona-${key}-08-ui-elements.png`,
                    fullPage: true
                });
            });

        });
    });

});

test.describe('Articles Ultimate - Cross-Persona Comparison', () => {
    
    test('should generate comparison report', async ({ page }) => {
        console.log('\n📊 GENERATING CROSS-PERSONA COMPARISON REPORT\n');
        
        const results = {};
        
        for (const [key, persona] of Object.entries(personas)) {
            console.log(`\n👤 Testing ${persona.name} (${persona.level})...`);
            
            await page.goto(`${BASE_URL}/articles-ultimate.html`);
            
            await page.evaluate((p) => {
                localStorage.setItem('userLevel', p.level);
                localStorage.setItem('userInterests', JSON.stringify(p.interests));
                localStorage.setItem('userId', `test-${p.name.toLowerCase()}`);
            }, persona);
            
            await page.reload();
            await page.waitForSelector('.feed-grid', { timeout: 30000 });
            await page.waitForTimeout(3000);
            
            // Collect metrics
            const articleCount = await page.locator('.article-card:not(.skeleton-card)').count();
            const difficulties = await page.locator('.tag.level').allTextContents();
            const matches = await page.locator('.article-match').allTextContents();
            const scores = matches.map(m => parseInt(m.replace(/[^\d]/g, '')));
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length || 0;
            
            results[persona.name] = {
                level: persona.level,
                interests: persona.interests,
                articleCount,
                difficulties: difficulties.slice(0, 10),
                avgComprehension: avgScore.toFixed(1),
                timestamp: new Date().toISOString()
            };
            
            console.log(`   Articles: ${articleCount}`);
            console.log(`   Avg Comprehension: ${avgScore.toFixed(1)}%`);
            console.log(`   Difficulties: ${difficulties.slice(0, 5).join(', ')}`);
            
            // Take comparison screenshot
            await page.screenshot({
                path: `screenshots/comparison-${key}.png`,
                fullPage: true
            });
        }
        
        // Generate report
        console.log('\n\n═══════════════════════════════════════════');
        console.log('           PERSONA COMPARISON REPORT');
        console.log('═══════════════════════════════════════════\n');
        
        for (const [name, data] of Object.entries(results)) {
            console.log(`👤 ${name} (${data.level})`);
            console.log(`   Interests: ${data.interests.join(', ')}`);
            console.log(`   Articles Loaded: ${data.articleCount}`);
            console.log(`   Avg Comprehension: ${data.avgComprehension}%`);
            console.log(`   Sample Difficulties: ${data.difficulties.slice(0, 5).join(', ')}`);
            console.log('');
        }
        
        console.log('═══════════════════════════════════════════\n');
        
        // Verify all personas got content
        Object.values(results).forEach(data => {
            expect(data.articleCount).toBeGreaterThan(0);
        });
    });

});


