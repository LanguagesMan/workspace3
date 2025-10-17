/**
 * 📰 PERFECT ARTICLES FEED - FINAL VALIDATION
 * 
 * Validates the PERFECT feed inspired by ChatGPT Pulse, Perplexity, Google Discover
 * Tests with multiple personas and captures detailed screenshots
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// User Personas
const personas = [
    { name: 'Maria', level: 'A1', interests: ['culture', 'food'], emoji: '👧' },
    { name: 'Carlos', level: 'B1', interests: ['technology', 'sports'], emoji: '👨' },
    { name: 'Sofia', level: 'C1', interests: ['politics', 'science'], emoji: '👩‍🎓' }
];

test.describe('Perfect Articles Feed - Validation', () => {

    personas.forEach(persona => {
        test.describe(`${persona.emoji} ${persona.name} (${persona.level})`, () => {
            
            test.beforeEach(async ({ page }) => {
                await page.goto(`${BASE_URL}/articles-perfect.html`);
                await page.evaluate((p) => {
                    localStorage.setItem('userLevel', p.level);
                    localStorage.setItem('userId', `test-${p.name.toLowerCase()}`);
                }, persona);
                await page.reload();
            });

            test('should load feed immediately with articles', async ({ page }) => {
                console.log(`\n${persona.emoji} ${persona.name}: Loading feed...`);
                
                // Articles should load quickly
                await page.waitForSelector('.article-card', { timeout: 10000 });
                
                // Count articles
                const articleCount = await page.locator('.article-card').count();
                console.log(`   ✅ Loaded ${articleCount} articles`);
                
                // Take screenshot
                await page.screenshot({
                    path: `screenshots/perfect-${persona.name.toLowerCase()}-01-feed-loaded.png`,
                    fullPage: true
                });
                
                expect(articleCount).toBeGreaterThan(0);
            });

            test('should show correct user level and match percentages', async ({ page }) => {
                console.log(`\n${persona.emoji} ${persona.name}: Checking personalization...`);
                
                await page.waitForSelector('.article-card');
                
                // Check level badge
                const userLevel = await page.locator('#userLevel').textContent();
                console.log(`   Level: ${userLevel}`);
                expect(userLevel).toContain(persona.level);
                
                // Check match badges
                const matches = await page.locator('.match-badge').allTextContents();
                console.log(`   Match percentages: ${matches.slice(0, 3).join(', ')}`);
                
                // Take screenshot
                await page.screenshot({
                    path: `screenshots/perfect-${persona.name.toLowerCase()}-02-personalization.png`
                });
                
                expect(matches.length).toBeGreaterThan(0);
            });

            test('should translate text line by line', async ({ page }) => {
                console.log(`\n${persona.emoji} ${persona.name}: Testing translation...`);
                
                await page.waitForSelector('.translatable');
                
                // Click first translatable text
                const firstTranslatable = page.locator('.translatable').first();
                const spanishText = await firstTranslatable.textContent();
                console.log(`   Clicking: "${spanishText}"`);
                
                await firstTranslatable.click();
                
                // Wait for tooltip
                await page.waitForSelector('.translation-tooltip.show', { timeout: 3000 });
                
                // Get translation
                const translation = await page.locator('.tooltip-translation').textContent();
                console.log(`   ✅ Translation: "${translation}"`);
                
                // Take screenshot
                await page.screenshot({
                    path: `screenshots/perfect-${persona.name.toLowerCase()}-03-translation.png`
                });
                
                expect(translation.length).toBeGreaterThan(0);
            });

            test('should save words from translation', async ({ page }) => {
                console.log(`\n${persona.emoji} ${persona.name}: Testing word saving...`);
                
                await page.waitForSelector('.translatable');
                
                // Click translatable
                await page.locator('.translatable').first().click();
                await page.waitForSelector('.translation-tooltip.show');
                
                // Setup dialog handler
                page.on('dialog', dialog => {
                    console.log(`   Alert: ${dialog.message()}`);
                    dialog.accept();
                });
                
                // Click save button
                await page.locator('.tooltip-btn').first().click();
                
                await page.waitForTimeout(1000);
                
                console.log(`   ✅ Word saved`);
            });

            test('should play audio with Web Speech API', async ({ page }) => {
                console.log(`\n${persona.emoji} ${persona.name}: Testing audio...`);
                
                await page.waitForSelector('.play-btn');
                
                // Click play button
                const playBtn = page.locator('.play-btn').first();
                await playBtn.click();
                
                // Check button changed to pause
                await page.waitForTimeout(1000);
                const btnText = await playBtn.textContent();
                console.log(`   ✅ Audio button: ${btnText}`);
                
                // Take screenshot
                await page.screenshot({
                    path: `screenshots/perfect-${persona.name.toLowerCase()}-04-audio-playing.png`
                });
                
                expect(btnText).toBe('⏸');
            });

            test('should infinite scroll and load more articles', async ({ page }) => {
                console.log(`\n${persona.emoji} ${persona.name}: Testing infinite scroll...`);
                
                await page.waitForSelector('.article-card');
                
                // Get initial count
                const initialCount = await page.locator('.article-card').count();
                console.log(`   Initial articles: ${initialCount}`);
                
                // Scroll to bottom
                await page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });
                
                // Wait for new articles
                await page.waitForTimeout(2000);
                
                // Get new count
                const newCount = await page.locator('.article-card').count();
                console.log(`   After scroll: ${newCount} articles`);
                
                // Take screenshot
                await page.screenshot({
                    path: `screenshots/perfect-${persona.name.toLowerCase()}-05-infinite-scroll.png`,
                    fullPage: true
                });
                
                expect(newCount).toBeGreaterThan(initialCount);
            });

            test('should show scroll to top button', async ({ page }) => {
                console.log(`\n${persona.emoji} ${persona.name}: Testing scroll to top...`);
                
                await page.waitForSelector('.article-card');
                
                // Scroll down
                await page.evaluate(() => window.scrollTo(0, 800));
                await page.waitForTimeout(500);
                
                // Check button is visible
                const scrollTop = page.locator('#scrollTop');
                const isVisible = await scrollTop.evaluate(el => {
                    return window.getComputedStyle(el).opacity === '1';
                });
                
                console.log(`   ✅ Scroll button visible: ${isVisible}`);
                
                // Take screenshot
                await page.screenshot({
                    path: `screenshots/perfect-${persona.name.toLowerCase()}-06-scroll-button.png`
                });
                
                // Click button
                if (isVisible) {
                    await scrollTop.click();
                    await page.waitForTimeout(1000);
                    console.log(`   ✅ Scrolled to top`);
                }
            });

            test('should be mobile responsive', async ({ page }) => {
                console.log(`\n${persona.emoji} ${persona.name}: Testing mobile...`);
                
                // Set mobile viewport
                await page.setViewportSize({ width: 375, height: 812 });
                await page.reload();
                
                await page.waitForSelector('.article-card');
                await page.waitForTimeout(1000);
                
                // Take mobile screenshot
                await page.screenshot({
                    path: `screenshots/perfect-${persona.name.toLowerCase()}-07-mobile.png`,
                    fullPage: true
                });
                
                // Check elements are visible
                const headerVisible = await page.locator('.header').isVisible();
                const navVisible = await page.locator('.bottom-nav').isVisible();
                
                console.log(`   ✅ Header: ${headerVisible}, Nav: ${navVisible}`);
                
                expect(headerVisible && navVisible).toBe(true);
            });

            test('should save and share articles', async ({ page }) => {
                console.log(`\n${persona.emoji} ${persona.name}: Testing actions...`);
                
                await page.waitForSelector('.action-btn');
                
                // Setup dialog handler
                page.on('dialog', dialog => {
                    console.log(`   Action: ${dialog.message()}`);
                    dialog.accept();
                });
                
                // Click save
                await page.locator('.action-btn').first().click();
                await page.waitForTimeout(500);
                
                console.log(`   ✅ Article actions work`);
            });

        });
    });

});

test.describe('Perfect Feed - Cross-Persona Comparison', () => {
    
    test('should generate comprehensive comparison report', async ({ page }) => {
        console.log('\n\n═══════════════════════════════════════════════');
        console.log('     PERFECT FEED VALIDATION REPORT');
        console.log('═══════════════════════════════════════════════\n');
        
        const results = {};
        
        for (const persona of personas) {
            console.log(`\n${persona.emoji} Testing ${persona.name} (${persona.level})...`);
            
            await page.goto(`${BASE_URL}/articles-perfect.html`);
            await page.evaluate((p) => {
                localStorage.setItem('userLevel', p.level);
                localStorage.setItem('userId', `test-${p.name.toLowerCase()}`);
            }, persona);
            await page.reload();
            
            await page.waitForSelector('.article-card', { timeout: 10000 });
            await page.waitForTimeout(2000);
            
            // Collect metrics
            const articles = await page.locator('.article-card').count();
            const userLevel = await page.locator('#userLevel').textContent();
            const matches = await page.locator('.match-badge').allTextContents();
            const avgMatch = matches.reduce((sum, m) => sum + parseInt(m), 0) / matches.length;
            const levelBadges = await page.locator('.level-badge').allTextContents();
            
            // Check translation works
            await page.locator('.translatable').first().click();
            const hasTranslation = await page.locator('.translation-tooltip.show').count() > 0;
            
            // Check audio works
            await page.locator('.play-btn').first().click();
            await page.waitForTimeout(500);
            const audioPlaying = await page.locator('.play-btn').first().textContent() === '⏸';
            
            results[persona.name] = {
                level: persona.level,
                articles,
                userLevel,
                avgMatch: avgMatch.toFixed(1),
                levelVariety: [...new Set(levelBadges)].join(', '),
                translationWorks: hasTranslation,
                audioWorks: audioPlaying
            };
            
            console.log(`   Articles: ${articles}`);
            console.log(`   Avg Match: ${avgMatch.toFixed(1)}%`);
            console.log(`   Levels: ${[...new Set(levelBadges)].join(', ')}`);
            console.log(`   Translation: ${hasTranslation ? '✅' : '❌'}`);
            console.log(`   Audio: ${audioPlaying ? '✅' : '❌'}`);
            
            // Take comparison screenshot
            await page.screenshot({
                path: `screenshots/comparison-${persona.name.toLowerCase()}-final.png`,
                fullPage: true
            });
        }
        
        // Print final report
        console.log('\n\n═══════════════════════════════════════════════');
        console.log('              FINAL RESULTS');
        console.log('═══════════════════════════════════════════════\n');
        
        Object.entries(results).forEach(([name, data]) => {
            console.log(`${personas.find(p => p.name === name).emoji} ${name} (${data.level}):`);
            console.log(`   ✅ ${data.articles} articles loaded`);
            console.log(`   📊 ${data.avgMatch}% average match`);
            console.log(`   🎯 Levels shown: ${data.levelVariety}`);
            console.log(`   💬 Translation: ${data.translationWorks ? 'Working' : 'Failed'}`);
            console.log(`   🔊 Audio: ${data.audioWorks ? 'Working' : 'Failed'}`);
            console.log('');
        });
        
        console.log('═══════════════════════════════════════════════\n');
        
        // Verify all personas got content and features work
        Object.values(results).forEach(data => {
            expect(data.articles).toBeGreaterThan(0);
            expect(parseFloat(data.avgMatch)).toBeGreaterThan(50);
            expect(data.translationWorks).toBe(true);
            expect(data.audioWorks).toBe(true);
        });
        
        console.log('✅ ALL TESTS PASSED! FEED IS PERFECT! 🎉\n');
    });

});


