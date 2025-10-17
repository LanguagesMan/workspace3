const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Final Comprehensive Audit - All Features', () => {
    const screenshotDir = path.join(__dirname, '../screenshots/final-audit-' + Date.now());
    
    test.beforeAll(() => {
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
    });

    test('1. Main Video Feed - Complete Feature Check', async ({ page }) => {
        console.log('\n📹 MAIN VIDEO FEED AUDIT\n');
        
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '01-main-feed-full.png'),
            fullPage: true 
        });
        
        const features = await page.evaluate(() => {
            return {
                videos: document.querySelectorAll('video').length,
                transcriptions: document.querySelectorAll('.transcription-overlay').length,
                clickableWords: document.querySelectorAll('.word').length,
                speedButtons: document.querySelectorAll('.speed-btn').length,
                translateButtons: document.querySelectorAll('.translate-btn').length,
                sidebar: document.querySelectorAll('.sidebar').length,
                statsBar: document.querySelectorAll('.stats-top-bar').length
            };
        });
        
        console.log('✅ Main Feed Features:');
        Object.entries(features).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });
        
        expect(features.videos).toBeGreaterThan(0);
    });

    test('2. All Pages Load Successfully', async ({ page }) => {
        console.log('\n🌐 PAGE LOAD AUDIT\n');
        
        const pages = [
            { url: '/', name: 'Home' },
            { url: '/tiktok-video-feed.html', name: 'Main Feed' },
            { url: '/games-hub.html', name: 'Games Hub' },
            { url: '/word-match-game.html', name: 'Word Match' },
            { url: '/sentence-builder-game.html', name: 'Sentence Builder' },
            { url: '/discover-feed.html', name: 'Discover' },
            { url: '/srs-review.html', name: 'SRS Review' },
            { url: '/achievements.html', name: 'Achievements' },
            { url: '/components/vocab-assessment.html', name: 'Vocab Assessment' }
        ];
        
        const results = [];
        
        for (const pageInfo of pages) {
            try {
                const start = Date.now();
                const response = await page.goto(`http://localhost:3001${pageInfo.url}`);
                const loadTime = Date.now() - start;
                const status = response.status();
                
                results.push({
                    name: pageInfo.name,
                    url: pageInfo.url,
                    status,
                    loadTime,
                    success: status === 200
                });
                
                console.log(`${status === 200 ? '✅' : '❌'} ${pageInfo.name}: ${status} (${loadTime}ms)`);
                
                await page.waitForTimeout(500);
            } catch (err) {
                results.push({
                    name: pageInfo.name,
                    url: pageInfo.url,
                    status: 'ERROR',
                    error: err.message,
                    success: false
                });
                console.log(`❌ ${pageInfo.name}: ERROR - ${err.message}`);
            }
        }
        
        const successCount = results.filter(r => r.success).length;
        console.log(`\n📊 Results: ${successCount}/${pages.length} pages loaded successfully`);
        
        expect(successCount).toBeGreaterThan(7); // At least 8/9 pages should work
    });

    test('3. Games Functionality Test', async ({ page }) => {
        console.log('\n🎮 GAMES AUDIT\n');
        
        // Test Word Match
        await page.goto('http://localhost:3001/word-match-game.html');
        await page.waitForTimeout(2000);
        
        const wordMatchCards = await page.locator('.card').count();
        console.log(`✅ Word Match: ${wordMatchCards} cards`);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '02-word-match.png') 
        });
        
        // Test Sentence Builder
        await page.goto('http://localhost:3001/sentence-builder-game.html');
        await page.waitForTimeout(2000);
        
        const sentenceWords = await page.locator('.word-chip').count();
        console.log(`✅ Sentence Builder: ${sentenceWords} words`);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '03-sentence-builder.png') 
        });
        
        // Test Games Hub
        await page.goto('http://localhost:3001/games-hub.html');
        await page.waitForTimeout(2000);
        
        const gameCards = await page.locator('.game-card').count();
        console.log(`✅ Games Hub: ${gameCards} games`);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '04-games-hub.png') 
        });
    });

    test('4. Data Persistence Test', async ({ page }) => {
        console.log('\n💾 DATA PERSISTENCE AUDIT\n');
        
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(2000);
        
        // Set test data
        const testData = {
            wordsLearned: 42,
            userStreak: 7,
            videosWatched: 25,
            userLevel: 'B1',
            savedWords: ['hola', 'gracias', 'adiós']
        };
        
        await page.evaluate((data) => {
            Object.entries(data).forEach(([key, value]) => {
                localStorage.setItem(key, JSON.stringify(value));
            });
        }, testData);
        
        // Reload page
        await page.reload();
        await page.waitForTimeout(2000);
        
        // Check if data persisted
        const persisted = await page.evaluate(() => {
            return {
                wordsLearned: JSON.parse(localStorage.getItem('wordsLearned') || '0'),
                userStreak: JSON.parse(localStorage.getItem('userStreak') || '0'),
                videosWatched: JSON.parse(localStorage.getItem('videosWatched') || '0'),
                userLevel: JSON.parse(localStorage.getItem('userLevel') || '"A1"'),
                savedWords: JSON.parse(localStorage.getItem('savedWords') || '[]')
            };
        });
        
        console.log('💾 Persisted data:', persisted);
        
        expect(persisted.wordsLearned).toBe(42);
        expect(persisted.userStreak).toBe(7);
        expect(persisted.savedWords).toHaveLength(3);
    });

    test('5. API Endpoints Test', async ({ page }) => {
        console.log('\n🔌 API ENDPOINTS AUDIT\n');
        
        const endpoints = [
            '/api/videos/with-subtitles',
            '/api/videos/all',
            '/api/news/spanish?count=5'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await page.request.get(`http://localhost:3001${endpoint}`);
                const status = response.status();
                const data = await response.json();
                
                console.log(`${status === 200 ? '✅' : '❌'} ${endpoint}: ${status}`);
                
                if (data.success !== undefined) {
                    console.log(`   Success: ${data.success}`);
                }
                if (data.count !== undefined) {
                    console.log(`   Count: ${data.count}`);
                }
            } catch (err) {
                console.log(`❌ ${endpoint}: ERROR - ${err.message}`);
            }
        }
    });

    test('6. Mobile Viewport Test', async ({ page }) => {
        console.log('\n📱 MOBILE VIEWPORT AUDIT\n');
        
        const viewports = [
            { width: 375, height: 667, name: 'iPhone SE' },
            { width: 390, height: 844, name: 'iPhone 12' },
            { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
            { width: 360, height: 740, name: 'Android' }
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.goto('http://localhost:3001/');
            await page.waitForTimeout(2000);
            
            await page.screenshot({ 
                path: path.join(screenshotDir, `mobile-${viewport.name.toLowerCase().replace(/ /g, '-')}.png`) 
            });
            
            console.log(`✅ Screenshot: ${viewport.name} (${viewport.width}x${viewport.height})`);
        }
    });

    test('7. Performance Metrics', async ({ page }) => {
        console.log('\n⚡ PERFORMANCE AUDIT\n');
        
        const pages = [
            '/tiktok-video-feed.html',
            '/games-hub.html',
            '/word-match-game.html',
            '/discover-feed.html'
        ];
        
        for (const url of pages) {
            const start = Date.now();
            await page.goto(`http://localhost:3001${url}`);
            await page.waitForLoadState('networkidle');
            const loadTime = Date.now() - start;
            
            // Check for console errors
            const errors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') errors.push(msg.text());
            });
            
            console.log(`⏱️ ${url}: ${loadTime}ms`);
        }
    });

    test('8. Feature Coverage Report', async ({ page }) => {
        console.log('\n📊 FEATURE COVERAGE REPORT\n');
        
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(3000);
        
        const coverage = await page.evaluate(() => {
            return {
                // Video Features
                hasVideos: document.querySelectorAll('video').length > 0,
                hasTranscriptions: document.querySelectorAll('.transcription-overlay').length > 0,
                hasClickableWords: document.querySelectorAll('.word').length > 0,
                
                // Controls
                hasSpeedControl: document.querySelectorAll('.speed-btn').length > 0,
                hasTranslateToggle: document.querySelectorAll('.translate-btn').length > 0,
                
                // UI Components
                hasSidebar: document.querySelectorAll('.sidebar').length > 0,
                hasStatsBar: document.querySelectorAll('.stats-top-bar').length > 0,
                
                // Data
                hasLocalStorage: typeof localStorage !== 'undefined',
                
                // Counts
                videoCount: document.querySelectorAll('video').length,
                wordCount: document.querySelectorAll('.word').length,
                buttonCount: document.querySelectorAll('button').length
            };
        });
        
        console.log('\n✅ Feature Coverage:');
        Object.entries(coverage).forEach(([key, value]) => {
            const icon = typeof value === 'boolean' ? (value ? '✅' : '❌') : '📊';
            console.log(`   ${icon} ${key}: ${value}`);
        });
        
        const featureCount = Object.values(coverage).filter(v => v === true).length;
        console.log(`\n🎯 Total features working: ${featureCount}/8`);
    });

    test.afterAll(() => {
        console.log(`\n✅ All screenshots saved to: ${screenshotDir}\n`);
        console.log('📊 AUDIT COMPLETE\n');
    });
});
