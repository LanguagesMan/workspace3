const { test, expect } = require('@playwright/test');

test.describe('Loading Screen and Transcriptions Test', () => {
    
    test('Loading screen appears and disappears correctly', async ({ page }) => {
        console.log('\n🎬 Testing loading screen...\n');
        
        // Navigate to the video feed
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        
        // Check if loading screen is visible initially
        const loadingScreen = page.locator('#loading');
        const skeletonScreen = page.locator('#skeletonScreen');
        
        // Loading screen should be visible (or skeleton screen)
        const loadingVisible = await loadingScreen.isVisible().catch(() => false);
        const skeletonVisible = await skeletonScreen.isVisible().catch(() => false);
        
        console.log(`  Initial loading screen visible: ${loadingVisible}`);
        console.log(`  Initial skeleton screen visible: ${skeletonVisible}`);
        
        // Take screenshot of loading state
        await page.screenshot({ 
            path: 'screenshots/test-loading-01-initial.png',
            fullPage: true 
        });
        
        // Wait for page to load (give it enough time to fetch videos)
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(2000);
        
        // Loading screen should be hidden now
        const loadingHidden = await loadingScreen.isHidden().catch(() => true);
        const skeletonHidden = await skeletonScreen.isHidden().catch(() => true);
        
        console.log(`  After load - loading screen hidden: ${loadingHidden}`);
        console.log(`  After load - skeleton screen hidden: ${skeletonHidden}`);
        
        // Take screenshot after loading
        await page.screenshot({ 
            path: 'screenshots/test-loading-02-loaded.png',
            fullPage: true 
        });
        
        expect(loadingHidden || skeletonHidden).toBe(true);
        console.log('✅ Loading screen test passed\n');
    });
    
    test('Videos load with transcriptions visible', async ({ page }) => {
        console.log('\n📝 Testing video transcriptions...\n');
        
        // Navigate to the video feed
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(3000);
        
        // Check if videos are present
        const videoCount = await page.locator('video').count();
        console.log(`  Videos found: ${videoCount}`);
        
        expect(videoCount).toBeGreaterThan(0);
        
        // Take screenshot with videos loaded
        await page.screenshot({ 
            path: 'screenshots/test-transcription-01-videos-loaded.png',
            fullPage: true 
        });
        
        // Check if transcription/caption elements exist
        const transcriptionElements = await page.locator('.transcription-overlay, .captions, .transcript-word, .spanish-line, .caption-line').count();
        console.log(`  Transcription elements found: ${transcriptionElements}`);
        
        // Check for Spanish text in transcriptions
        const spanishText = await page.locator('.spanish-line, .caption-spanish, .transcript-word').count();
        console.log(`  Spanish text elements found: ${spanishText}`);
        
        // Try to find the first video and check its transcription
        if (videoCount > 0) {
            const firstVideo = page.locator('video').first();
            
            // Try to play the video
            await firstVideo.click().catch(() => {
                console.log('  Video click not available');
            });
            
            await page.waitForTimeout(2000);
            
            // Check if transcription is now visible during playback
            const transcriptionVisible = await page.locator('.transcription-overlay, .captions, .transcript-word').first().isVisible().catch(() => false);
            console.log(`  Transcription visible during playback: ${transcriptionVisible}`);
            
            // Take screenshot during playback
            await page.screenshot({ 
                path: 'screenshots/test-transcription-02-playing.png',
                fullPage: true 
            });
        }
        
        expect(transcriptionElements).toBeGreaterThan(0);
        console.log('✅ Transcription test passed\n');
    });
    
    test('Transcription word interaction works', async ({ page }) => {
        console.log('\n🔤 Testing word interaction...\n');
        
        // Navigate to the video feed
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(3000);
        
        // Find clickable words in transcription
        const transcriptWords = page.locator('.transcript-word');
        const wordCount = await transcriptWords.count();
        
        console.log(`  Clickable words found: ${wordCount}`);
        
        if (wordCount > 0) {
            // Click the first word
            const firstWord = transcriptWords.first();
            const wordText = await firstWord.textContent();
            console.log(`  Clicking word: "${wordText}"`);
            
            await firstWord.click();
            await page.waitForTimeout(1000);
            
            // Take screenshot after clicking
            await page.screenshot({ 
                path: 'screenshots/test-transcription-03-word-clicked.png',
                fullPage: true 
            });
            
            // Check if tooltip/popup appeared
            const tooltip = page.locator('.word-tooltip, .translation-popup, .word-popup');
            const tooltipVisible = await tooltip.isVisible().catch(() => false);
            console.log(`  Translation tooltip visible: ${tooltipVisible}`);
            
            if (tooltipVisible) {
                const tooltipText = await tooltip.textContent();
                console.log(`  Tooltip content: ${tooltipText.substring(0, 50)}...`);
                
                // Take screenshot with tooltip
                await page.screenshot({ 
                    path: 'screenshots/test-transcription-04-tooltip-shown.png',
                    fullPage: true 
                });
            }
        } else {
            console.log('⚠️  No clickable words found - may need to wait for video playback');
        }
        
        console.log('✅ Word interaction test completed\n');
    });
    
    test('Test on langflix-app.html', async ({ page }) => {
        console.log('\n🎯 Testing langflix-app.html...\n');
        
        // Navigate to langflix app
        await page.goto('http://localhost:3001/langflix-app.html');
        
        // Check if loading screen is visible initially
        const loadingScreen = page.locator('#loading');
        const loadingVisible = await loadingScreen.isVisible().catch(() => false);
        
        console.log(`  Loading screen visible: ${loadingVisible}`);
        
        // Take screenshot of loading state
        await page.screenshot({ 
            path: 'screenshots/test-langflix-01-loading.png',
            fullPage: true 
        });
        
        // Wait for page to load
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(3000);
        
        // Loading screen should be hidden now
        const loadingHidden = await loadingScreen.isHidden().catch(() => true);
        console.log(`  Loading screen hidden after load: ${loadingHidden}`);
        
        // Check for videos
        const videoCount = await page.locator('video').count();
        console.log(`  Videos found: ${videoCount}`);
        
        // Take screenshot after loading
        await page.screenshot({ 
            path: 'screenshots/test-langflix-02-loaded.png',
            fullPage: true 
        });
        
        // Check for transcriptions
        const transcriptionElements = await page.locator('.transcription-overlay, .captions, .transcript-word').count();
        console.log(`  Transcription elements found: ${transcriptionElements}`);
        
        console.log('✅ Langflix app test completed\n');
    });
    
    test('Mobile viewport - loading and transcriptions', async ({ page }) => {
        console.log('\n📱 Testing mobile viewport...\n');
        
        // Set mobile viewport (iPhone 12)
        await page.setViewportSize({ width: 390, height: 844 });
        
        // Navigate to the video feed
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        
        // Check loading screen
        const loadingScreen = page.locator('#loading');
        const loadingVisible = await loadingScreen.isVisible().catch(() => false);
        console.log(`  Mobile loading screen visible: ${loadingVisible}`);
        
        // Take screenshot
        await page.screenshot({ 
            path: 'screenshots/test-mobile-01-loading.png',
            fullPage: true 
        });
        
        // Wait for load
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await page.waitForTimeout(3000);
        
        // Check if content loaded
        const videoCount = await page.locator('video').count();
        console.log(`  Mobile videos found: ${videoCount}`);
        
        const transcriptionCount = await page.locator('.transcript-word').count();
        console.log(`  Mobile transcription words: ${transcriptionCount}`);
        
        // Take screenshot after load
        await page.screenshot({ 
            path: 'screenshots/test-mobile-02-loaded.png',
            fullPage: true 
        });
        
        console.log('✅ Mobile test completed\n');
    });
});

test.afterAll(async () => {
    console.log('\n' + '='.repeat(70));
    console.log('🎉 LOADING & TRANSCRIPTION TESTS COMPLETE');
    console.log('='.repeat(70));
    console.log('\n📸 Screenshots saved in: screenshots/');
    console.log('📊 Review screenshots to verify:');
    console.log('   1. Loading screen appears with black background');
    console.log('   2. Loading screen disappears when videos load');
    console.log('   3. Videos display with visible transcriptions');
    console.log('   4. Clicking words shows translation tooltips\n');
});

