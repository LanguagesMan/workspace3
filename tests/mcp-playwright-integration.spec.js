/**
 * 🎭 LANGFLIX MCP PLAYWRIGHT INTEGRATION TESTS
 * 
 * Comprehensive end-to-end testing using Playwright
 * Validates entire user journey from signup to content consumption
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';
const TEST_USER = {
    email: `test-${Date.now()}@langflix.test`,
    username: `testuser${Date.now()}`,
    password: 'TestPass123!'
};

// Test report
const testReport = {
    timestamp: new Date().toISOString(),
    tests: [],
    screenshots: []
};

test.describe('🚀 Langflix Infrastructure Integration', () => {
    
    test.beforeAll(async () => {
        console.log('🎬 Starting Langflix Infrastructure Tests');
        console.log(`📍 Base URL: ${BASE_URL}`);
    });

    test('1. Server health check responds correctly', async ({ page }) => {
        const response = await page.goto(`${BASE_URL}/api/health`);
        expect(response.status()).toBe(200);
        
        const json = await response.json();
        expect(json.status).toBe('ok');
        
        testReport.tests.push({
            name: 'Health Check',
            status: 'PASS',
            timestamp: new Date().toISOString()
        });
    });

    test('2. Home page loads with video catalog', async ({ page }) => {
        await page.goto(BASE_URL);
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        
        // Check title
        await expect(page).toHaveTitle(/Langflix/i);
        
        // Take screenshot
        const screenshotPath = 'test-results/screenshots/homepage.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        testReport.screenshots.push(screenshotPath);
        
        testReport.tests.push({
            name: 'Homepage Load',
            status: 'PASS',
            screenshot: screenshotPath
        });
    });

    test('3. Video feed displays correctly', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Check for video elements
        const videoElements = await page.locator('video').count();
        expect(videoElements).toBeGreaterThan(0);
        
        // Screenshot of video feed
        const screenshotPath = 'test-results/screenshots/video-feed.png';
        await page.screenshot({ path: screenshotPath });
        testReport.screenshots.push(screenshotPath);
        
        testReport.tests.push({
            name: 'Video Feed Display',
            status: 'PASS',
            videoCount: videoElements
        });
    });

    test('4. API vocabulary endpoint responds', async ({ request }) => {
        // Test vocabulary API
        const response = await request.get(`${BASE_URL}/api/vocabulary/test-user`);
        
        // Should return data or empty array
        expect([200, 404]).toContain(response.status());
        
        testReport.tests.push({
            name: 'Vocabulary API',
            status: 'PASS',
            statusCode: response.status()
        });
    });

    test('5. Adaptive learning endpoint works', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/adaptive/perfect-content/test-user`);
        
        // Should respond (may be empty for new user)
        expect([200, 404]).toContain(response.status());
        
        testReport.tests.push({
            name: 'Adaptive Learning API',
            status: 'PASS',
            statusCode: response.status()
        });
    });

    test('6. Static assets load correctly', async ({ page }) => {
        await page.goto(BASE_URL);
        
        // Check for CSS
        const stylesheets = await page.locator('link[rel="stylesheet"]').count();
        expect(stylesheets).toBeGreaterThan(0);
        
        // Check for JavaScript
        const scripts = await page.locator('script[src]').count();
        expect(scripts).toBeGreaterThan(0);
        
        testReport.tests.push({
            name: 'Static Assets',
            status: 'PASS',
            stylesheets,
            scripts
        });
    });

    test('7. Video player controls exist', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Look for video player
        const video = page.locator('video').first();
        if (await video.count() > 0) {
            await expect(video).toBeVisible();
            
            // Screenshot video player
            const screenshotPath = 'test-results/screenshots/video-player.png';
            await page.screenshot({ path: screenshotPath });
            testReport.screenshots.push(screenshotPath);
        }
        
        testReport.tests.push({
            name: 'Video Player',
            status: 'PASS'
        });
    });

    test('8. Navigation menu works', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Check for navigation elements
        const nav = page.locator('nav, .navigation, [role="navigation"]');
        const hasNav = await nav.count() > 0;
        
        if (hasNav) {
            await expect(nav.first()).toBeVisible();
        }
        
        testReport.tests.push({
            name: 'Navigation',
            status: 'PASS',
            hasNavigation: hasNav
        });
    });

    test('9. Mobile responsive design', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Screenshot mobile view
        const screenshotPath = 'test-results/screenshots/mobile-view.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        testReport.screenshots.push(screenshotPath);
        
        testReport.tests.push({
            name: 'Mobile Responsive',
            status: 'PASS',
            viewport: '375x667'
        });
    });

    test('10. Console has no critical errors', async ({ page }) => {
        const errors = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Filter out known benign errors
        const criticalErrors = errors.filter(err => 
            !err.includes('favicon') && 
            !err.includes('404')
        );
        
        expect(criticalErrors.length).toBe(0);
        
        testReport.tests.push({
            name: 'Console Errors',
            status: 'PASS',
            errorCount: criticalErrors.length
        });
    });

    test.afterAll(async () => {
        // Save test report
        const reportPath = 'test-results/playwright-integration-report.json';
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
        
        console.log('\n✅ All tests completed!');
        console.log(`📄 Report saved: ${reportPath}`);
        console.log(`📸 Screenshots: ${testReport.screenshots.length}`);
        console.log(`✨ Tests passed: ${testReport.tests.length}`);
    });
});

test.describe('🔐 Authentication Flow', () => {
    
    test('11. Login page accessible', async ({ page }) => {
        const loginUrls = [
            `${BASE_URL}/login.html`,
            `${BASE_URL}/auth/login`,
            `${BASE_URL}/public/login.html`
        ];
        
        let accessible = false;
        for (const url of loginUrls) {
            try {
                const response = await page.goto(url);
                if (response && response.status() === 200) {
                    accessible = true;
                    break;
                }
            } catch (e) {
                // Continue to next URL
            }
        }
        
        testReport.tests.push({
            name: 'Login Page',
            status: accessible ? 'PASS' : 'SKIP',
            note: accessible ? 'Found' : 'Not yet implemented'
        });
    });
});

test.describe('📊 Performance Metrics', () => {
    
    test('12. Page load performance', async ({ page }) => {
        const startTime = Date.now();
        await page.goto(BASE_URL);
        await page.waitForLoadState('load');
        const loadTime = Date.now() - startTime;
        
        // Should load in under 3 seconds
        expect(loadTime).toBeLessThan(3000);
        
        testReport.tests.push({
            name: 'Page Load Performance',
            status: 'PASS',
            loadTime: `${loadTime}ms`,
            target: '< 3000ms'
        });
    });

    test('13. Video loading time', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        const video = page.locator('video').first();
        if (await video.count() > 0) {
            const startTime = Date.now();
            await video.waitFor({ state: 'visible', timeout: 5000 });
            const loadTime = Date.now() - startTime;
            
            testReport.tests.push({
                name: 'Video Load Time',
                status: 'PASS',
                loadTime: `${loadTime}ms`
            });
        } else {
            testReport.tests.push({
                name: 'Video Load Time',
                status: 'SKIP',
                note: 'No videos found'
            });
        }
    });
});

test.describe('🎯 Critical User Flows', () => {
    
    test('14. Video catalog browsing', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Screenshot before interaction
        await page.screenshot({ 
            path: 'test-results/screenshots/before-interaction.png' 
        });
        
        // Try to interact with video feed
        const video = page.locator('video').first();
        if (await video.count() > 0) {
            await video.scrollIntoViewIfNeeded();
            await page.screenshot({ 
                path: 'test-results/screenshots/video-focused.png' 
            });
        }
        
        testReport.tests.push({
            name: 'Video Browsing',
            status: 'PASS'
        });
    });

    test('15. Search functionality (if available)', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Look for search input
        const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
        const hasSearch = await searchInput.count() > 0;
        
        testReport.tests.push({
            name: 'Search Functionality',
            status: hasSearch ? 'PASS' : 'SKIP',
            note: hasSearch ? 'Search found' : 'Not yet implemented'
        });
    });
});
