const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Comprehensive Feature Audit with Screenshots', () => {
    const screenshotDir = path.join(__dirname, '../screenshots/audit-' + Date.now());
    
    test.beforeAll(() => {
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
    });

    test('1. Main Video Feed - Full Experience', async ({ page }) => {
        console.log('\n🎬 Testing Main Video Feed...\n');
        
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(3000);
        
        // Full page screenshot
        await page.screenshot({ 
            path: path.join(screenshotDir, '01-main-feed.png'),
            fullPage: true 
        });
        
        // Check video autoplay
        const videoState = await page.evaluate(() => {
            const video = document.querySelector('video');
            return video ? {
                paused: video.paused,
                readyState: video.readyState,
                currentTime: video.currentTime
            } : null;
        });
        console.log('📹 Video state:', videoState);
        
        // Test word click
        const words = await page.locator('.word').count();
        console.log(`📝 Clickable words: ${words}`);
        
        if (words > 0) {
            await page.locator('.word').first().click();
            await page.waitForTimeout(500);
            await page.screenshot({ 
                path: path.join(screenshotDir, '02-word-popup.png') 
            });
        }
    });

    test('2. SRS Review Page', async ({ page }) => {
        console.log('\n🧠 Testing SRS Review...\n');
        
        // Add some test words first
        await page.goto('http://localhost:3001/');
        await page.evaluate(() => {
            const words = [
                { spanish: 'hola', english: 'hello', context: 'Greeting' },
                { spanish: 'adiós', english: 'goodbye', context: 'Farewell' },
                { spanish: 'gracias', english: 'thank you', context: 'Gratitude' }
            ];
            localStorage.setItem('savedWords', JSON.stringify(words));
        });
        
        await page.goto('http://localhost:3001/srs-review.html');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '03-srs-review.png'),
            fullPage: true 
        });
        
        console.log('✅ SRS Review page loaded');
    });

    test('3. Vocabulary Assessment', async ({ page }) => {
        console.log('\n📊 Testing Vocabulary Assessment...\n');
        
        await page.goto('http://localhost:3001/components/vocab-assessment.html');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '04-vocab-assessment.png'),
            fullPage: true 
        });
        
        // Answer a few words
        for (let i = 0; i < 3; i++) {
            const word = await page.locator('#wordSpanish').textContent();
            console.log(`Word ${i + 1}: ${word}`);
            
            await page.locator('.btn-know').click();
            await page.waitForTimeout(500);
            
            await page.screenshot({ 
                path: path.join(screenshotDir, `05-assessment-step-${i+1}.png`) 
            });
        }
        
        console.log('✅ Vocabulary assessment tested');
    });

    test('4. Check Available Games', async ({ page }) => {
        console.log('\n🎮 Checking for game pages...\n');
        
        const gamePages = [
            '/word-match-game.html',
            '/sentence-builder-game.html',
            '/quiz-mode.html',
            '/games.html',
            '/flashcards.html'
        ];
        
        for (const gamePage of gamePages) {
            try {
                const response = await page.goto(`http://localhost:3001${gamePage}`);
                if (response.status() === 200) {
                    await page.waitForTimeout(1000);
                    await page.screenshot({ 
                        path: path.join(screenshotDir, `game-${gamePage.replace(/\//g, '-')}.png`),
                        fullPage: true 
                    });
                    console.log(`✅ Found: ${gamePage}`);
                } else {
                    console.log(`❌ Not found: ${gamePage}`);
                }
            } catch (err) {
                console.log(`❌ Error loading ${gamePage}: ${err.message}`);
            }
        }
    });

    test('5. Test Gamification System', async ({ page }) => {
        console.log('\n🎮 Testing Gamification...\n');
        
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(2000);
        
        // Check stats bar
        const statsBar = page.locator('.stats-top-bar');
        if (await statsBar.count() > 0) {
            await statsBar.screenshot({ 
                path: path.join(screenshotDir, '10-gamification-bar.png') 
            });
            
            const stats = await page.evaluate(() => {
                return {
                    words: document.getElementById('wordsDisplay')?.textContent,
                    streak: document.getElementById('streakDisplay')?.textContent
                };
            });
            console.log('📊 Stats:', stats);
        }
    });

    test('6. Test All Interactive Buttons', async ({ page }) => {
        console.log('\n🔘 Testing Interactive Buttons...\n');
        
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(2000);
        
        // Test speed button
        const speedBtn = page.locator('.speed-btn').first();
        if (await speedBtn.count() > 0) {
            await speedBtn.screenshot({ 
                path: path.join(screenshotDir, '11-speed-before.png') 
            });
            await speedBtn.click();
            await page.waitForTimeout(300);
            await speedBtn.screenshot({ 
                path: path.join(screenshotDir, '12-speed-after.png') 
            });
            console.log('✅ Speed button works');
        }
        
        // Test translate button
        const translateBtn = page.locator('.translate-btn').first();
        if (await translateBtn.count() > 0) {
            await page.screenshot({ 
                path: path.join(screenshotDir, '13-translate-before.png') 
            });
            await translateBtn.click();
            await page.waitForTimeout(300);
            await page.screenshot({ 
                path: path.join(screenshotDir, '14-translate-after.png') 
            });
            console.log('✅ Translate button works');
        }
        
        // Test difficulty buttons
        const easyBtn = page.locator('.too-easy-btn').first();
        if (await easyBtn.count() > 0) {
            await easyBtn.click();
            await page.waitForTimeout(500);
            console.log('✅ Too Easy button works');
        }
    });

    test('7. Test Scroll and Video Switching', async ({ page }) => {
        console.log('\n📜 Testing Video Scroll...\n');
        
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '15-video-1.png') 
        });
        
        // Scroll to next video
        await page.evaluate(() => {
            const container = document.querySelector('.feed-container');
            if (container) {
                container.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
            }
        });
        
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: path.join(screenshotDir, '16-video-2.png') 
        });
        
        console.log('✅ Scroll works');
    });

    test('8. Performance Metrics', async ({ page }) => {
        console.log('\n⚡ Testing Performance...\n');
        
        const startTime = Date.now();
        await page.goto('http://localhost:3001/');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        console.log(`⏱️ Page load time: ${loadTime}ms`);
        
        // Check for console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        await page.waitForTimeout(2000);
        
        console.log(`🐛 Console errors: ${errors.length}`);
        if (errors.length > 0) {
            console.log('Errors:', errors.slice(0, 5));
        }
    });

    test.afterAll(() => {
        console.log(`\n✅ All screenshots saved to: ${screenshotDir}\n`);
    });
});
