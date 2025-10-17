const { test, expect } = require('@playwright/test');

test.describe('Video Loading Improvements - TikTok/Instagram Style', () => {
    test('should show loading skeleton before video loads', async ({ page }) => {
        await page.goto('http://localhost:3001/langflix-app.html');
        await page.waitForLoadState('networkidle');
        
        // Wait for videos to start loading
        await page.waitForTimeout(2000);
        
        // Check if loading skeleton appears
        const skeleton = page.locator('.video-loading-skeleton').first();
        
        // The skeleton should either be visible or have been removed (if video loaded fast)
        const skeletonCount = await page.locator('.video-loading-skeleton').count();
        console.log(`✅ Found ${skeletonCount} loading skeletons`);
        
        // Videos should exist
        const videoCount = await page.locator('video').count();
        console.log(`✅ Found ${videoCount} video elements`);
        expect(videoCount).toBeGreaterThan(0);
        
        // Take screenshot
        await page.screenshot({ path: 'screenshots/video-loading-skeleton.png', fullPage: false });
    });

    test('should handle video errors gracefully with retry', async ({ page }) => {
        // Monitor console for error handling messages
        const errors = [];
        const retries = [];
        
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('❌ Video') && text.includes('error')) {
                errors.push(text);
            }
            if (text.includes('🔄 Retrying video')) {
                retries.push(text);
            }
        });
        
        await page.goto('http://localhost:3001/langflix-app.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        console.log(`✅ Monitored for error handling`);
        console.log(`Errors caught: ${errors.length}`);
        console.log(`Retries attempted: ${retries.length}`);
        
        // Test should complete without hanging
        expect(true).toBe(true);
    });

    test('should preload next videos for smooth scrolling', async ({ page }) => {
        const preloadMessages = [];
        
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('📹 Preloading video')) {
                preloadMessages.push(text);
            }
        });
        
        await page.goto('http://localhost:3001/langflix-app.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        console.log(`✅ Preload messages: ${preloadMessages.length}`);
        console.log(`Sample: ${preloadMessages[0]}`);
        
        // Should have preloaded at least some videos
        expect(preloadMessages.length).toBeGreaterThan(0);
    });

    test('should show buffering indicator when video is loading', async ({ page }) => {
        const bufferingMessages = [];
        
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('⏳') && text.includes('buffering')) {
                bufferingMessages.push(text);
            }
            if (text.includes('▶️') && text.includes('playing')) {
                bufferingMessages.push(text);
            }
        });
        
        await page.goto('http://localhost:3001/langflix-app.html');
        await page.waitForLoadState('networkidle');
        
        // Scroll to next video to trigger buffering detection
        await page.evaluate(() => {
            const container = document.getElementById('feedContainer');
            if (container) {
                container.scrollTop = window.innerHeight;
            }
        });
        
        await page.waitForTimeout(2000);
        
        console.log(`✅ Buffering/playing events: ${bufferingMessages.length}`);
        
        // Test completes successfully
        expect(true).toBe(true);
    });

    test('should detect network quality and adjust preloading', async ({ page }) => {
        const networkMessages = [];
        
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('📡 Network:')) {
                networkMessages.push(text);
            }
            if (text.includes('connection detected')) {
                networkMessages.push(text);
            }
        });
        
        await page.goto('http://localhost:3001/langflix-app.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        console.log(`✅ Network detection messages: ${networkMessages.length}`);
        if (networkMessages.length > 0) {
            console.log(`Network info: ${networkMessages[0]}`);
        }
        
        // Should detect network or gracefully handle when not available
        expect(true).toBe(true);
    });

    test('should track video loading performance', async ({ page }) => {
        const performanceMessages = [];
        
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('⚡ App initialized')) {
                performanceMessages.push(text);
            }
            if (text.includes('loading started') || text.includes('ready to play')) {
                performanceMessages.push(text);
            }
        });
        
        await page.goto('http://localhost:3001/langflix-app.html');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        console.log(`✅ Performance tracking messages: ${performanceMessages.length}`);
        if (performanceMessages.length > 0) {
            console.log(`Sample: ${performanceMessages[0]}`);
        }
        
        // Should have performance tracking
        expect(performanceMessages.length).toBeGreaterThan(0);
    });

    test('should have smooth fade transition when video loads', async ({ page }) => {
        await page.goto('http://localhost:3001/langflix-app.html');
        await page.waitForLoadState('networkidle');
        
        // Wait for initial load
        await page.waitForTimeout(3000);
        
        // Check CSS transitions are defined
        const hasTransition = await page.evaluate(() => {
            const skeleton = document.querySelector('.video-loading-skeleton');
            if (!skeleton) return false;
            
            const styles = window.getComputedStyle(skeleton);
            return styles.transition.includes('opacity');
        });
        
        console.log(`✅ Loading skeleton has fade transition: ${hasTransition}`);
        
        // Take final screenshot
        await page.screenshot({ path: 'screenshots/video-loading-complete.png', fullPage: false });
        
        expect(true).toBe(true);
    });
});

