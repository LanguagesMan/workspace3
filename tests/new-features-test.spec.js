const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('New Features Test Suite', () => {
    const screenshotDir = path.join(__dirname, '../screenshots/new-features-' + Date.now());
    
    test.beforeAll(() => {
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
    });

    test('1. Word Match Game', async ({ page }) => {
        console.log('\n🎯 Testing Word Match Game...\n');
        
        await page.goto('http://localhost:3001/word-match-game.html');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '01-word-match-game.png'),
            fullPage: true 
        });
        
        // Check game loaded
        const gameGrid = await page.locator('.game-grid').count();
        console.log(`✅ Game grid loaded: ${gameGrid > 0}`);
        
        // Check cards
        const cards = await page.locator('.card').count();
        console.log(`📊 Number of cards: ${cards}`);
        expect(cards).toBeGreaterThan(0);
        
        // Try clicking a card
        if (cards > 0) {
            await page.locator('.card').first().click();
            await page.waitForTimeout(300);
            await page.screenshot({ 
                path: path.join(screenshotDir, '02-word-match-selected.png') 
            });
            console.log('✅ Card click works');
        }
    });

    test('2. Sentence Builder Game', async ({ page }) => {
        console.log('\n🔤 Testing Sentence Builder...\n');
        
        await page.goto('http://localhost:3001/sentence-builder-game.html');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '03-sentence-builder.png'),
            fullPage: true 
        });
        
        // Check prompt
        const promptText = await page.locator('#promptText').textContent();
        console.log(`📝 Prompt: ${promptText}`);
        expect(promptText).toBeTruthy();
        
        // Check word bank
        const words = await page.locator('.word-chip').count();
        console.log(`💬 Words in bank: ${words}`);
        expect(words).toBeGreaterThan(0);
        
        // Try adding a word
        if (words > 0) {
            await page.locator('.word-chip').first().click();
            await page.waitForTimeout(300);
            await page.screenshot({ 
                path: path.join(screenshotDir, '04-sentence-builder-word-added.png') 
            });
            console.log('✅ Word click works');
        }
    });

    test('3. Games Hub', async ({ page }) => {
        console.log('\n🎮 Testing Games Hub...\n');
        
        await page.goto('http://localhost:3001/games-hub.html');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '05-games-hub.png'),
            fullPage: true 
        });
        
        // Count game cards
        const gameCards = await page.locator('.game-card').count();
        console.log(`🎮 Game cards displayed: ${gameCards}`);
        expect(gameCards).toBeGreaterThan(0);
        
        // Get game titles
        const titles = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.game-title')).map(el => el.textContent);
        });
        console.log('🎯 Available games:', titles);
    });

    test('4. Discover Feed (Articles)', async ({ page }) => {
        console.log('\n📰 Testing Discover Feed...\n');
        
        await page.goto('http://localhost:3001/discover-feed.html');
        await page.waitForTimeout(5000); // Wait for API
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '06-discover-feed.png'),
            fullPage: true 
        });
        
        // Check if articles loaded
        const articles = await page.locator('.article-card').count();
        console.log(`📰 Articles loaded: ${articles}`);
        
        if (articles > 0) {
            // Get first article info
            const firstArticle = await page.evaluate(() => {
                const card = document.querySelector('.article-card');
                return {
                    title: card?.querySelector('.article-title')?.textContent,
                    source: card?.querySelector('.article-source')?.textContent
                };
            });
            console.log('📄 First article:', firstArticle);
            
            // Click first article
            await page.locator('.article-card').first().screenshot({ 
                path: path.join(screenshotDir, '07-article-card.png') 
            });
        } else {
            console.log('⚠️ No articles loaded (check API)');
        }
    });

    test('5. Check Navigation Between Pages', async ({ page }) => {
        console.log('\n🧭 Testing Navigation...\n');
        
        // Start from main feed
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(2000);
        
        const urls = [
            '/games-hub.html',
            '/word-match-game.html',
            '/sentence-builder-game.html',
            '/discover-feed.html',
            '/srs-review.html'
        ];
        
        for (const url of urls) {
            try {
                const response = await page.goto(`http://localhost:3001${url}`);
                const status = response.status();
                console.log(`✅ ${url}: ${status}`);
                await page.waitForTimeout(1000);
            } catch (err) {
                console.log(`❌ ${url}: Failed - ${err.message}`);
            }
        }
    });

    test('6. Check localStorage Persistence', async ({ page }) => {
        console.log('\n💾 Testing Data Persistence...\n');
        
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(2000);
        
        // Set test data
        await page.evaluate(() => {
            localStorage.setItem('testData', 'persist_test');
            localStorage.setItem('wordsLearned', '25');
            localStorage.setItem('userStreak', '5');
        });
        
        // Navigate away and back
        await page.goto('http://localhost:3001/games-hub.html');
        await page.waitForTimeout(1000);
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(2000);
        
        // Check if data persisted
        const persisted = await page.evaluate(() => {
            return {
                testData: localStorage.getItem('testData'),
                words: localStorage.getItem('wordsLearned'),
                streak: localStorage.getItem('userStreak')
            };
        });
        
        console.log('💾 Persisted data:', persisted);
        expect(persisted.testData).toBe('persist_test');
    });

    test('7. Performance Check', async ({ page }) => {
        console.log('\n⚡ Performance Check...\n');
        
        const pages = [
            { url: '/tiktok-video-feed.html', name: 'Main Feed' },
            { url: '/games-hub.html', name: 'Games Hub' },
            { url: '/word-match-game.html', name: 'Word Match' },
            { url: '/discover-feed.html', name: 'Discover' }
        ];
        
        for (const pageInfo of pages) {
            const startTime = Date.now();
            await page.goto(`http://localhost:3001${pageInfo.url}`);
            await page.waitForLoadState('networkidle');
            const loadTime = Date.now() - startTime;
            
            console.log(`⏱️ ${pageInfo.name}: ${loadTime}ms`);
        }
    });

    test.afterAll(() => {
        console.log(`\n✅ Screenshots saved to: ${screenshotDir}\n`);
    });
});
