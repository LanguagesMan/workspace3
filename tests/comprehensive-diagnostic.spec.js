const { test, expect } = require('@playwright/test');

// Comprehensive diagnostic test for ALL app issues
test.describe('Comprehensive App Diagnostic - Find ALL Problems', () => {
    
    test('CRITICAL: Video Loading Test on TikTok Video Feed', async ({ page }) => {
        console.log('\n' + '='.repeat(80));
        console.log('🎥 CRITICAL TEST: Video Loading on TikTok Video Feed');
        console.log('='.repeat(80) + '\n');

        const issues = [];
        const consoleErrors = [];
        const networkErrors = [];

        // Capture console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
                console.log(`  ❌ Console Error: ${msg.text()}`);
            }
        });

        // Capture network failures
        page.on('requestfailed', request => {
            networkErrors.push({
                url: request.url(),
                failure: request.failure().errorText
            });
            console.log(`  ❌ Network Failure: ${request.url()} - ${request.failure().errorText}`);
        });

        // Navigate to page
        console.log('📍 Navigating to http://localhost:3001/tiktok-video-feed.html...\n');
        await page.goto('http://localhost:3001/tiktok-video-feed.html', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });

        // Wait for content to load
        await page.waitForTimeout(5000);

        // Screenshot initial state
        await page.screenshot({ 
            path: 'screenshots/diagnostic/01-initial-load.png',
            fullPage: true 
        });

        // TEST 1: Check if loading screen exists and disappears
        console.log('🔍 TEST 1: Loading Screen Behavior');
        const loadingExists = await page.locator('#loading, .loading').count();
        console.log(`  Loading element count: ${loadingExists}`);
        
        if (loadingExists > 0) {
            const loadingVisible = await page.locator('#loading, .loading').isVisible();
            console.log(`  Loading visible: ${loadingVisible}`);
            if (loadingVisible) {
                issues.push('⚠️ Loading screen stuck visible after 5s');
            }
        }

        // TEST 2: Check for videos
        console.log('\n🔍 TEST 2: Video Element Detection');
        const videoCount = await page.locator('video').count();
        console.log(`  Video elements found: ${videoCount}`);

        if (videoCount === 0) {
            issues.push('❌ CRITICAL: No video elements on page');
        } else {
            // Check first video
            const firstVideo = page.locator('video').first();
            const videoSrc = await firstVideo.getAttribute('src');
            const videoDisplay = await firstVideo.evaluate(el => {
                const styles = window.getComputedStyle(el);
                return {
                    display: styles.display,
                    visibility: styles.visibility,
                    opacity: styles.opacity,
                    width: styles.width,
                    height: styles.height
                };
            });

            console.log(`  First video src: ${videoSrc || 'MISSING SRC'}`);
            console.log(`  Video styles:`, videoDisplay);

            if (!videoSrc) {
                issues.push('❌ CRITICAL: Video elements missing src attribute');
            }

            // Check if video is actually visible
            const isVisible = await firstVideo.isVisible();
            console.log(`  First video visible: ${isVisible}`);

            if (!isVisible) {
                issues.push('❌ CRITICAL: Videos present but not visible');
            }

            // Try to get video state
            const videoState = await firstVideo.evaluate((video) => {
                return {
                    readyState: video.readyState,
                    networkState: video.networkState,
                    error: video.error ? video.error.message : null,
                    currentSrc: video.currentSrc,
                    paused: video.paused,
                    ended: video.ended
                };
            });

            console.log(`  Video state:`, videoState);

            if (videoState.error) {
                issues.push(`❌ CRITICAL: Video error - ${videoState.error}`);
            }

            if (videoState.readyState === 0) {
                issues.push('❌ CRITICAL: Video not loading (readyState = 0)');
            }
        }

        // Screenshot after analysis
        await page.screenshot({ 
            path: 'screenshots/diagnostic/02-after-analysis.png',
            fullPage: true 
        });

        // TEST 3: Check API response
        console.log('\n🔍 TEST 3: API Endpoint Check');
        try {
            const apiResponse = await page.evaluate(async () => {
                const response = await fetch('/api/feed/videos?limit=1');
                const data = await response.json();
                return {
                    status: response.status,
                    success: data.success,
                    videoCount: data.videos?.length || 0,
                    firstVideo: data.videos?.[0] || null
                };
            });

            console.log(`  API Response:`, apiResponse);

            if (apiResponse.status !== 200) {
                issues.push(`❌ API returning status ${apiResponse.status}`);
            }

            if (!apiResponse.success) {
                issues.push('❌ API returning success: false');
            }

            if (apiResponse.videoCount === 0) {
                issues.push('❌ API returning zero videos');
            }

            if (apiResponse.firstVideo) {
                console.log(`  First video from API: ${apiResponse.firstVideo.videoUrl || apiResponse.firstVideo.filename}`);
            }
        } catch (apiError) {
            issues.push(`❌ CRITICAL: API call failed - ${apiError.message}`);
            console.log(`  ❌ API Error: ${apiError.message}`);
        }

        // TEST 4: Check for JavaScript errors
        console.log('\n🔍 TEST 4: JavaScript Errors');
        if (consoleErrors.length > 0) {
            console.log(`  Found ${consoleErrors.length} console errors:`);
            consoleErrors.forEach((err, i) => {
                console.log(`    ${i + 1}. ${err.substring(0, 100)}`);
            });
            issues.push(`❌ ${consoleErrors.length} JavaScript errors in console`);
        } else {
            console.log(`  ✅ No console errors`);
        }

        // TEST 5: Check for network failures
        console.log('\n🔍 TEST 5: Network Failures');
        if (networkErrors.length > 0) {
            console.log(`  Found ${networkErrors.length} network failures:`);
            networkErrors.forEach((err, i) => {
                console.log(`    ${i + 1}. ${err.url} - ${err.failure}`);
            });
            issues.push(`❌ ${networkErrors.length} network request failures`);
        } else {
            console.log(`  ✅ No network failures`);
        }

        // TEST 6: Check feed container
        console.log('\n🔍 TEST 6: Feed Container State');
        const feedContainer = await page.locator('#feedContainer, .feed-container').first();
        const feedExists = await feedContainer.count() > 0;
        
        if (!feedExists) {
            issues.push('❌ Feed container element not found');
        } else {
            const feedChildren = await feedContainer.evaluate(el => el.children.length);
            console.log(`  Feed container children: ${feedChildren}`);
            
            if (feedChildren === 0) {
                issues.push('❌ Feed container is empty (no video cards)');
            }
        }

        // SUMMARY
        console.log('\n' + '='.repeat(80));
        console.log('📊 DIAGNOSTIC SUMMARY');
        console.log('='.repeat(80));
        
        if (issues.length === 0) {
            console.log('✅ NO ISSUES FOUND - Everything working correctly!\n');
        } else {
            console.log(`❌ FOUND ${issues.length} ISSUES:\n`);
            issues.forEach((issue, i) => {
                console.log(`  ${i + 1}. ${issue}`);
            });
            console.log();
        }

        // Save diagnostic report
        const report = {
            timestamp: new Date().toISOString(),
            videoCount,
            issues,
            consoleErrors,
            networkErrors
        };

        await page.evaluate((reportData) => {
            localStorage.setItem('diagnostic-report', JSON.stringify(reportData, null, 2));
        }, report);

        console.log('💾 Diagnostic report saved to localStorage\n');
        console.log('='.repeat(80) + '\n');
    });
});
