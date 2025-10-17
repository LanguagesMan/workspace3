const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('CRITICAL: Video Loading Diagnostic Suite', () => {
    const issuesFound = [];
    const diagnosticDir = path.join(__dirname, '..', 'screenshots', 'diagnostic');

    test.beforeAll(() => {
        if (!fs.existsSync(diagnosticDir)) {
            fs.mkdirSync(diagnosticDir, { recursive: true });
        }
    });

    test('Diagnose TikTok Video Feed - Video Loading Issues', async ({ page }) => {
        const consoleErrors = [];
        const networkErrors = [];
        const videoStates = [];

        // Capture all console messages
        page.on('console', msg => {
            const text = msg.text();
            if (msg.type() === 'error') {
                consoleErrors.push(text);
            }
            console.log(`[BROWSER ${msg.type()}]:`, text);
        });

        // Capture network failures
        page.on('requestfailed', request => {
            networkErrors.push({
                url: request.url(),
                failure: request.failure().errorText
            });
        });

        console.log('\n=== DIAGNOSTIC TEST: TikTok Video Feed ===\n');

        // Navigate to page
        await page.goto('http://localhost:3001/tiktok-video-feed.html', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        // Screenshot 1: Initial load
        await page.screenshot({
            path: path.join(diagnosticDir, '01-initial-load.png'),
            fullPage: true
        });

        // Wait for loading to complete
        await page.waitForTimeout(3000);

        // Screenshot 2: After 3 seconds
        await page.screenshot({
            path: path.join(diagnosticDir, '02-after-3s.png'),
            fullPage: true
        });

        // Check loading screen state
        const loadingScreenVisible = await page.locator('#loading').isVisible().catch(() => false);
        console.log('Loading screen visible:', loadingScreenVisible);

        // Check achievement popup state
        const achievementVisible = await page.locator('.achievement-popup').isVisible().catch(() => false);
        console.log('Achievement popup visible:', achievementVisible);

        if (achievementVisible) {
            issuesFound.push('Achievement popup appears on page load, potentially blocking content');

            // Get achievement popup z-index
            const achievementZIndex = await page.locator('.achievement-popup').evaluate(el => {
                return window.getComputedStyle(el).zIndex;
            }).catch(() => 'unknown');
            console.log('Achievement popup z-index:', achievementZIndex);
        }

        // Find all video elements
        const videos = await page.locator('video').all();
        console.log(`Found ${videos.length} video elements`);

        if (videos.length === 0) {
            issuesFound.push('CRITICAL: No video elements found on page');
        }

        // Diagnose each video
        for (let i = 0; i < Math.min(videos.length, 5); i++) {
            const video = videos[i];

            const videoInfo = await video.evaluate((vid, index) => {
                const rect = vid.getBoundingClientRect();
                const styles = window.getComputedStyle(vid);

                return {
                    index,
                    src: vid.currentSrc || vid.src,
                    readyState: vid.readyState,
                    networkState: vid.networkState,
                    error: vid.error ? {
                        code: vid.error.code,
                        message: vid.error.message
                    } : null,
                    paused: vid.paused,
                    duration: vid.duration,
                    currentTime: vid.currentTime,
                    videoWidth: vid.videoWidth,
                    videoHeight: vid.videoHeight,
                    visible: {
                        display: styles.display,
                        visibility: styles.visibility,
                        opacity: styles.opacity,
                        zIndex: styles.zIndex,
                        position: styles.position
                    },
                    bounds: {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                        inViewport: rect.top >= 0 && rect.left >= 0 &&
                                   rect.bottom <= window.innerHeight &&
                                   rect.right <= window.innerWidth
                    }
                };
            }, i);

            videoStates.push(videoInfo);

            console.log(`\n--- Video ${i + 1} ---`);
            console.log('SRC:', videoInfo.src);
            console.log('Ready State:', videoInfo.readyState, '(4=HAVE_ENOUGH_DATA)');
            console.log('Network State:', videoInfo.networkState, '(2=NETWORK_LOADING, 3=NETWORK_IDLE)');
            console.log('Error:', videoInfo.error || 'none');
            console.log('Paused:', videoInfo.paused);
            console.log('Duration:', videoInfo.duration);
            console.log('Video Dimensions:', `${videoInfo.videoWidth}x${videoInfo.videoHeight}`);
            console.log('Display:', videoInfo.visible.display);
            console.log('Visibility:', videoInfo.visible.visibility);
            console.log('Opacity:', videoInfo.visible.opacity);
            console.log('In Viewport:', videoInfo.bounds.inViewport);

            // Identify issues
            if (!videoInfo.src) {
                issuesFound.push(`Video ${i + 1}: No src attribute`);
            }
            if (videoInfo.error) {
                issuesFound.push(`Video ${i + 1}: Error code ${videoInfo.error.code} - ${videoInfo.error.message}`);
            }
            if (videoInfo.readyState < 4) {
                issuesFound.push(`Video ${i + 1}: Not fully loaded (readyState=${videoInfo.readyState})`);
            }
            if (videoInfo.videoWidth === 0 || videoInfo.videoHeight === 0) {
                issuesFound.push(`Video ${i + 1}: Video dimensions are 0x0 (black screen)`);
            }
            if (videoInfo.visible.display === 'none') {
                issuesFound.push(`Video ${i + 1}: CSS display:none`);
            }
            if (videoInfo.visible.visibility === 'hidden') {
                issuesFound.push(`Video ${i + 1}: CSS visibility:hidden`);
            }
            if (parseFloat(videoInfo.visible.opacity) === 0) {
                issuesFound.push(`Video ${i + 1}: CSS opacity:0`);
            }
        }

        // Check feed container
        const feedContainer = await page.locator('#feed').first();
        const feedExists = await feedContainer.count() > 0;
        console.log('\nFeed container exists:', feedExists);

        if (feedExists) {
            const feedInfo = await feedContainer.evaluate(el => {
                const styles = window.getComputedStyle(el);
                return {
                    childCount: el.children.length,
                    display: styles.display,
                    height: styles.height,
                    overflow: styles.overflow
                };
            });
            console.log('Feed child count:', feedInfo.childCount);
            console.log('Feed display:', feedInfo.display);
            console.log('Feed height:', feedInfo.height);
        }

        // Check API endpoint directly
        const apiResponse = await page.evaluate(async () => {
            try {
                const response = await fetch('/api/videos');
                const data = await response.json();
                return {
                    success: true,
                    status: response.status,
                    videoCount: data.videos ? data.videos.length : 0,
                    data: data
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        });

        console.log('\nAPI Response:', JSON.stringify(apiResponse, null, 2));

        if (!apiResponse.success) {
            issuesFound.push(`API Error: ${apiResponse.error}`);
        } else if (apiResponse.videoCount === 0) {
            issuesFound.push('API returns 0 videos');
        }

        // Screenshot 3: Final state
        await page.screenshot({
            path: path.join(diagnosticDir, '03-final-state.png'),
            fullPage: true
        });

        // Generate diagnostic report
        const report = {
            timestamp: new Date().toISOString(),
            page: 'tiktok-video-feed.html',
            issues: issuesFound,
            consoleErrors: consoleErrors,
            networkErrors: networkErrors,
            videoStates: videoStates,
            apiResponse: apiResponse,
            loadingScreenVisible: loadingScreenVisible,
            achievementVisible: achievementVisible
        };

        fs.writeFileSync(
            path.join(diagnosticDir, 'diagnostic-report.json'),
            JSON.stringify(report, null, 2)
        );

        console.log('\n=== DIAGNOSTIC SUMMARY ===');
        console.log(`Issues found: ${issuesFound.length}`);
        issuesFound.forEach((issue, i) => {
            console.log(`${i + 1}. ${issue}`);
        });
        console.log(`Console errors: ${consoleErrors.length}`);
        console.log(`Network errors: ${networkErrors.length}`);
        console.log('\nDiagnostic report saved to:', path.join(diagnosticDir, 'diagnostic-report.json'));
        console.log('Screenshots saved to:', diagnosticDir);

        // Test should always pass - we're just collecting diagnostics
        expect(true).toBe(true);
    });

    test('Test all critical pages for video loading', async ({ page }) => {
        const pages = [
            { name: 'Home', url: 'http://localhost:3001/' },
            { name: 'TikTok Feed', url: 'http://localhost:3001/tiktok.html' },
            { name: 'Langflix App', url: 'http://localhost:3001/langflix-app.html' }
        ];

        for (const pageInfo of pages) {
            console.log(`\n=== Testing ${pageInfo.name} ===`);

            await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);

            const videoCount = await page.locator('video').count();
            const buttonCount = await page.locator('button').count();

            console.log(`Videos: ${videoCount}`);
            console.log(`Buttons: ${buttonCount}`);

            const screenshotName = pageInfo.name.toLowerCase().replace(/\s+/g, '-');
            await page.screenshot({
                path: path.join(diagnosticDir, `${screenshotName}.png`),
                fullPage: true
            });

            if (videoCount === 0 && pageInfo.name.includes('TikTok')) {
                issuesFound.push(`${pageInfo.name}: Expected videos but found none`);
            }
        }
    });
});
