const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Current State Verification', () => {
    const screenshotDir = path.join(__dirname, '../screenshots/current-state-' + Date.now());
    
    test.beforeAll(() => {
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
    });

    test('1. Take full homepage screenshot', async ({ page }) => {
        console.log('🧪 Loading homepage...');
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '01-homepage.png'),
            fullPage: true 
        });
        
        const url = page.url();
        console.log(`✅ Current URL: ${url}`);
        
        // Get page title
        const title = await page.title();
        console.log(`✅ Page title: ${title}`);
    });

    test('2. Analyze page structure', async ({ page }) => {
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(3000);
        
        const structure = await page.evaluate(() => {
            return {
                hasVideoCard: document.querySelectorAll('.video-card').length,
                hasVideo: document.querySelectorAll('video').length,
                hasTranscription: document.querySelectorAll('.transcription-overlay').length,
                hasWords: document.querySelectorAll('.word').length,
                hasSidebar: document.querySelectorAll('.sidebar').length,
                hasGamificationBar: document.querySelectorAll('.gamification-bar').length,
                bodyHTML: document.body.innerHTML.substring(0, 500)
            };
        });
        
        console.log('\n📊 PAGE STRUCTURE:');
        console.log(`Video cards: ${structure.hasVideoCard}`);
        console.log(`Videos: ${structure.hasVideo}`);
        console.log(`Transcriptions: ${structure.hasTranscription}`);
        console.log(`Clickable words: ${structure.hasWords}`);
        console.log(`Sidebar: ${structure.hasSidebar}`);
        console.log(`Gamification bar: ${structure.hasGamificationBar}`);
        console.log(`\nBody HTML preview: ${structure.bodyHTML}...`);
    });

    test('3. Test video loading', async ({ page }) => {
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(3000);
        
        const firstVideo = page.locator('video').first();
        const videoExists = await firstVideo.count() > 0;
        
        if (videoExists) {
            await firstVideo.screenshot({ 
                path: path.join(screenshotDir, '02-first-video.png') 
            });
            
            const videoState = await firstVideo.evaluate((v) => ({
                src: v.src ? v.src.substring(v.src.length - 50) : 'no src',
                paused: v.paused,
                readyState: v.readyState,
                currentTime: v.currentTime,
                duration: v.duration
            }));
            
            console.log('\n📹 VIDEO STATE:');
            console.log(JSON.stringify(videoState, null, 2));
        } else {
            console.log('❌ No video found on page');
        }
    });

    test('4. Test transcription system', async ({ page }) => {
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(3000);
        
        const transcriptionBox = page.locator('.transcription-overlay').first();
        const exists = await transcriptionBox.count() > 0;
        
        if (exists) {
            await transcriptionBox.screenshot({ 
                path: path.join(screenshotDir, '03-transcription.png') 
            });
            
            const text = await transcriptionBox.textContent();
            console.log(`\n📝 TRANSCRIPTION TEXT: "${text.substring(0, 100)}..."`);
            
            // Check if clickable words exist
            const words = await page.locator('.word').count();
            console.log(`✅ Clickable words found: ${words}`);
        } else {
            console.log('❌ No transcription overlay found');
        }
    });

    test('5. Test interactive elements', async ({ page }) => {
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(3000);
        
        // Count all buttons
        const buttons = await page.locator('button').count();
        console.log(`\n🔘 Total buttons: ${buttons}`);
        
        // Get all button details
        const buttonDetails = await page.evaluate(() => {
            const btns = [];
            document.querySelectorAll('button').forEach((btn, i) => {
                btns.push({
                    index: i,
                    text: btn.textContent.trim().substring(0, 30),
                    classes: Array.from(btn.classList).join(' '),
                    visible: btn.offsetWidth > 0 && btn.offsetHeight > 0
                });
            });
            return btns;
        });
        
        console.log('\n🔘 BUTTON INVENTORY:');
        buttonDetails.forEach(btn => {
            console.log(`  [${btn.index}] "${btn.text}" - ${btn.classes} - ${btn.visible ? 'VISIBLE' : 'HIDDEN'}`);
        });
        
        // Screenshot the sidebar
        const sidebar = page.locator('.sidebar').first();
        if (await sidebar.count() > 0) {
            await sidebar.screenshot({ 
                path: path.join(screenshotDir, '04-sidebar.png') 
            });
        }
    });

    test('6. Test gamification bar', async ({ page }) => {
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(3000);
        
        const gamBar = page.locator('.gamification-bar').first();
        const exists = await gamBar.count() > 0;
        
        if (exists) {
            await gamBar.screenshot({ 
                path: path.join(screenshotDir, '05-gamification-bar.png') 
            });
            
            const data = await page.evaluate(() => {
                const bar = document.querySelector('.gamification-bar');
                return {
                    xp: bar?.querySelector('.xp-count')?.textContent,
                    streak: bar?.querySelector('.streak-count')?.textContent,
                    level: bar?.querySelector('.level-indicator')?.textContent
                };
            });
            
            console.log('\n🎮 GAMIFICATION DATA:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('❌ No gamification bar found');
        }
    });

    test('7. Test scroll behavior', async ({ page }) => {
        await page.goto('http://localhost:3001/');
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '06-before-scroll.png'),
            fullPage: false 
        });
        
        // Try to scroll
        await page.evaluate(() => {
            const container = document.querySelector('.feed-container');
            if (container) {
                container.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
            }
        });
        
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: path.join(screenshotDir, '07-after-scroll.png'),
            fullPage: false 
        });
        
        console.log('✅ Scroll test complete');
    });

    test.afterAll(() => {
        console.log(`\n✅ Screenshots saved to: ${screenshotDir}`);
    });
});
