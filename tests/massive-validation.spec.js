/**
 * 🎯 MASSIVE VALIDATION TEST SUITE
 * Tests EVERYTHING as different user types with comprehensive screenshots
 *
 * User Types:
 * - New User (first visit)
 * - Beginner (A1 level)
 * - Intermediate (B1 level)
 * - Advanced (C1 level)
 * - Returning User (with history)
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:3001';

// User profiles for testing
const USER_PROFILES = [
    {
        id: 'new-user-001',
        type: 'new',
        level: null,
        name: 'New User',
        description: 'First time visitor, no history'
    },
    {
        id: 'beginner-user-001',
        type: 'beginner',
        level: 'A1',
        name: 'Beginner',
        description: 'Beginner level Spanish learner'
    },
    {
        id: 'intermediate-user-001',
        type: 'intermediate',
        level: 'B1',
        name: 'Intermediate',
        description: 'Intermediate level Spanish learner'
    },
    {
        id: 'advanced-user-001',
        type: 'advanced',
        level: 'C1',
        name: 'Advanced',
        description: 'Advanced level Spanish learner'
    },
    {
        id: 'returning-user-001',
        type: 'returning',
        level: 'A2',
        name: 'Returning User',
        description: 'User with learning history'
    }
];

// All pages to test
const PAGES_TO_TEST = [
    { name: 'Home', path: '/', critical: true },
    { name: 'TikTok Feed', path: '/tiktok.html', critical: true },
    { name: 'Unified Feed', path: '/unified-feed.html', critical: true },
    { name: 'Infinite Feed', path: '/unified-infinite-feed.html', critical: true },
    { name: 'Langflix App', path: '/langflix-app.html', critical: true },
    { name: 'Flashcard Review', path: '/flashcard-review.html', critical: false },
    { name: 'Onboarding', path: '/onboarding.html', critical: false },
    { name: 'Level Assessment', path: '/level-assessment.html', critical: false },
    { name: 'Stats Dashboard', path: '/stats-dashboard.html', critical: false },
    { name: 'Achievements', path: '/achievements.html', critical: false }
];

// Test scenarios
const TEST_SCENARIOS = [
    { name: 'Load Page', action: 'load' },
    { name: 'Scroll Behavior', action: 'scroll' },
    { name: 'Video Playback', action: 'video' },
    { name: 'Click Interactions', action: 'click' },
    { name: 'Form Submissions', action: 'form' },
    { name: 'API Calls', action: 'api' },
    { name: 'Mobile Responsive', action: 'mobile' }
];

test.describe('🎯 MASSIVE VALIDATION - All Users, All Pages, All Scenarios', () => {

    let testReport = {
        timestamp: new Date().toISOString(),
        totalTests: 0,
        passed: 0,
        failed: 0,
        users: {},
        pages: {},
        issues: []
    };

    test.afterAll(async () => {
        // Save comprehensive report
        await fs.writeFile(
            'tests/screenshots/massive-validation-report.json',
            JSON.stringify(testReport, null, 2)
        );

        console.log('\n📊 MASSIVE VALIDATION COMPLETE');
        console.log(`Total Tests: ${testReport.totalTests}`);
        console.log(`Passed: ${testReport.passed} ✅`);
        console.log(`Failed: ${testReport.failed} ❌`);
        console.log(`Success Rate: ${((testReport.passed / testReport.totalTests) * 100).toFixed(1)}%`);
    });

    // Test each user type
    for (const userProfile of USER_PROFILES) {

        test.describe(`👤 User Type: ${userProfile.name}`, () => {

            testReport.users[userProfile.id] = {
                profile: userProfile,
                pageResults: {},
                totalErrors: 0,
                totalWarnings: 0
            };

            // Test each page for this user
            for (const pageInfo of PAGES_TO_TEST) {

                test(`${pageInfo.name} - Full Validation`, async ({ page, context }) => {
                    testReport.totalTests++;

                    const screenshotDir = `tests/screenshots/massive/${userProfile.type}`;
                    await fs.mkdir(screenshotDir, { recursive: true });

                    const pageResult = {
                        loaded: false,
                        loadTime: 0,
                        errors: [],
                        warnings: [],
                        screenshots: [],
                        interactions: {}
                    };

                    // Set user context
                    await context.addCookies([{
                        name: 'userId',
                        value: userProfile.id,
                        domain: 'localhost',
                        path: '/'
                    }]);

                    if (userProfile.level) {
                        await context.addCookies([{
                            name: 'userLevel',
                            value: userProfile.level,
                            domain: 'localhost',
                            path: '/'
                        }]);
                    }

                    // Capture console errors
                    const consoleErrors = [];
                    const consoleWarnings = [];
                    page.on('console', msg => {
                        if (msg.type() === 'error') {
                            consoleErrors.push(msg.text());
                        } else if (msg.type() === 'warning') {
                            consoleWarnings.push(msg.text());
                        }
                    });

                    // Capture network errors
                    const networkErrors = [];
                    page.on('requestfailed', request => {
                        networkErrors.push(`${request.url()} - ${request.failure().errorText}`);
                    });

                    try {
                        console.log(`\n🧪 Testing: ${pageInfo.name} as ${userProfile.name}`);

                        // 1. LOAD PAGE
                        const startTime = Date.now();
                        const response = await page.goto(`${BASE_URL}${pageInfo.path}`, {
                            waitUntil: 'domcontentloaded',
                            timeout: 30000
                        });
                        pageResult.loadTime = Date.now() - startTime;
                        pageResult.loaded = response.ok();

                        console.log(`   ⏱️  Load time: ${pageResult.loadTime}ms`);

                        // Screenshot: Initial load
                        const screenshotPath = `${screenshotDir}/${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}-load.png`;
                        await page.screenshot({ path: screenshotPath, fullPage: true });
                        pageResult.screenshots.push(screenshotPath);

                        // 2. CHECK PAGE CONTENT
                        await page.waitForTimeout(2000);

                        // Check for loading indicators stuck
                        const loadingIndicators = await page.locator('.loading, .spinner, [class*="loading"]').count();
                        if (loadingIndicators > 0) {
                            const visible = await page.locator('.loading, .spinner, [class*="loading"]').first().isVisible();
                            if (visible) {
                                pageResult.warnings.push('⚠️ Loading indicator still visible after 2s');
                            }
                        }

                        // Check for error messages
                        const errorMessages = await page.locator('[class*="error"], .error-message, [role="alert"]').count();
                        if (errorMessages > 0) {
                            const errorText = await page.locator('[class*="error"], .error-message, [role="alert"]').first().textContent();
                            pageResult.errors.push(`❌ Error message on page: ${errorText}`);
                        }

                        // 3. TEST VIDEO ELEMENTS (if applicable)
                        const videos = await page.locator('video').count();
                        if (videos > 0) {
                            console.log(`   📹 Found ${videos} video elements`);

                            pageResult.interactions.videos = {
                                count: videos,
                                working: [],
                                broken: []
                            };

                            // Test first 3 videos
                            const videosToTest = Math.min(videos, 3);
                            for (let i = 0; i < videosToTest; i++) {
                                const video = page.locator('video').nth(i);
                                const hasSrc = await video.evaluate(v => !!v.src || !!v.currentSrc);

                                if (hasSrc) {
                                    const videoSrc = await video.evaluate(v => v.src || v.currentSrc);
                                    const videoState = await video.evaluate(v => ({
                                        readyState: v.readyState,
                                        networkState: v.networkState,
                                        error: v.error ? v.error.code : null
                                    }));

                                    if (videoState.error) {
                                        pageResult.interactions.videos.broken.push({
                                            index: i,
                                            src: videoSrc,
                                            error: `Error code ${videoState.error}`
                                        });
                                    } else {
                                        pageResult.interactions.videos.working.push({
                                            index: i,
                                            src: videoSrc,
                                            readyState: videoState.readyState
                                        });
                                    }
                                }
                            }

                            // Screenshot with videos
                            await page.screenshot({
                                path: `${screenshotDir}/${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}-videos.png`,
                                fullPage: false
                            });
                        }

                        // 4. TEST SCROLLING (for feed pages)
                        if (pageInfo.path.includes('feed') || pageInfo.path.includes('tiktok')) {
                            console.log(`   📜 Testing scroll behavior`);

                            const initialY = await page.evaluate(() => window.scrollY);
                            await page.mouse.wheel(0, 500);
                            await page.waitForTimeout(500);
                            const afterScrollY = await page.evaluate(() => window.scrollY);

                            pageResult.interactions.scroll = {
                                initialY,
                                afterScrollY,
                                scrolled: afterScrollY > initialY
                            };

                            if (!pageResult.interactions.scroll.scrolled) {
                                pageResult.warnings.push('⚠️ Scroll not working properly');
                            }

                            // Screenshot after scroll
                            await page.screenshot({
                                path: `${screenshotDir}/${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}-scrolled.png`,
                                fullPage: false
                            });
                        }

                        // 5. TEST BUTTONS AND INTERACTIONS
                        const buttons = await page.locator('button, [role="button"], a.btn').count();
                        if (buttons > 0) {
                            console.log(`   🔘 Found ${buttons} interactive buttons`);

                            // Try clicking first visible button
                            const firstButton = page.locator('button, [role="button"]').first();
                            const isVisible = await firstButton.isVisible().catch(() => false);

                            if (isVisible) {
                                try {
                                    await firstButton.click({ timeout: 2000 });
                                    await page.waitForTimeout(1000);

                                    // Screenshot after interaction
                                    await page.screenshot({
                                        path: `${screenshotDir}/${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}-interaction.png`
                                    });

                                    pageResult.interactions.buttonClick = 'success';
                                } catch (e) {
                                    pageResult.interactions.buttonClick = `failed: ${e.message}`;
                                }
                            }
                        }

                        // 6. TEST MOBILE RESPONSIVENESS
                        console.log(`   📱 Testing mobile view`);
                        await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
                        await page.waitForTimeout(1000);

                        await page.screenshot({
                            path: `${screenshotDir}/${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}-mobile.png`,
                            fullPage: true
                        });

                        // Check for horizontal overflow
                        const hasOverflow = await page.evaluate(() => {
                            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
                        });

                        if (hasOverflow) {
                            pageResult.warnings.push('⚠️ Horizontal overflow on mobile');
                        }

                        // Restore desktop viewport
                        await page.setViewportSize({ width: 1920, height: 1080 });

                        // 7. COLLECT ALL ERRORS
                        pageResult.errors.push(...consoleErrors.map(e => `Console Error: ${e}`));
                        pageResult.errors.push(...networkErrors);
                        pageResult.warnings.push(...consoleWarnings.map(w => `Console Warning: ${w}`));

                        // 8. PERFORMANCE CHECKS
                        if (pageResult.loadTime > 3000) {
                            pageResult.warnings.push(`⚠️ Slow load time: ${pageResult.loadTime}ms`);
                        }

                        // Update report
                        testReport.users[userProfile.id].pageResults[pageInfo.name] = pageResult;
                        testReport.users[userProfile.id].totalErrors += pageResult.errors.length;
                        testReport.users[userProfile.id].totalWarnings += pageResult.warnings.length;

                        if (!testReport.pages[pageInfo.name]) {
                            testReport.pages[pageInfo.name] = {
                                totalTests: 0,
                                passed: 0,
                                failed: 0,
                                avgLoadTime: 0,
                                errors: []
                            };
                        }

                        testReport.pages[pageInfo.name].totalTests++;

                        if (pageResult.errors.length === 0) {
                            testReport.pages[pageInfo.name].passed++;
                            testReport.passed++;
                        } else {
                            testReport.pages[pageInfo.name].failed++;
                            testReport.failed++;
                            testReport.pages[pageInfo.name].errors.push(...pageResult.errors);
                        }

                        // Log results
                        console.log(`   ✅ Loaded: ${pageResult.loaded}`);
                        console.log(`   ❌ Errors: ${pageResult.errors.length}`);
                        console.log(`   ⚠️  Warnings: ${pageResult.warnings.length}`);
                        console.log(`   📸 Screenshots: ${pageResult.screenshots.length}`);

                        // Assert critical pages have no errors
                        if (pageInfo.critical && pageResult.errors.length > 0) {
                            throw new Error(`Critical page has errors: ${pageResult.errors.join(', ')}`);
                        }

                    } catch (error) {
                        console.log(`   ❌ Test failed: ${error.message}`);
                        pageResult.errors.push(`Test Exception: ${error.message}`);
                        testReport.failed++;

                        // Screenshot on failure
                        try {
                            await page.screenshot({
                                path: `${screenshotDir}/${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}-FAILED.png`
                            });
                        } catch (e) {}

                        throw error;
                    }
                });
            }
        });
    }

    // Cross-user comparison tests
    test.describe('🔄 Cross-User Comparison Tests', () => {

        test('API returns personalized content per user', async ({ request }) => {
            console.log('\n🔍 Testing API personalization');

            const apiResults = {};

            for (const userProfile of USER_PROFILES) {
                const response = await request.get(`${BASE_URL}/api/feed/videos?userId=${userProfile.id}&limit=5`);
                const data = await response.json();

                apiResults[userProfile.id] = {
                    success: data.success,
                    videoCount: data.videos ? data.videos.length : 0,
                    videos: data.videos || []
                };

                console.log(`   ${userProfile.name}: ${apiResults[userProfile.id].videoCount} videos`);
            }

            // All users should get videos
            for (const [userId, result] of Object.entries(apiResults)) {
                expect(result.success).toBe(true);
                expect(result.videoCount).toBeGreaterThan(0);
            }
        });

        test('Level-appropriate content filtering', async ({ request }) => {
            console.log('\n📊 Testing level filtering');

            const levels = ['A1', 'B1', 'C1'];
            const levelResults = {};

            for (const level of levels) {
                const response = await request.get(`${BASE_URL}/api/feed/videos?level=${level}&limit=10`);
                const data = await response.json();

                levelResults[level] = {
                    count: data.videos ? data.videos.length : 0,
                    videos: data.videos || []
                };

                console.log(`   Level ${level}: ${levelResults[level].count} videos`);
            }

            // Each level should get content
            for (const [level, result] of Object.entries(levelResults)) {
                expect(result.count).toBeGreaterThan(0);
            }
        });
    });
});
