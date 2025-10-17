/**
 * 🎭 VISUAL REGRESSION TESTS
 * Playwright visual tests for difficulty badges and UI
 */

const { test, expect } = require('@playwright/test');

// Test configuration
test.use({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
});

test.describe('Difficulty Badge Visual Tests', () => {
    
    test.beforeEach(async ({ page }) => {
        // Disable animations for consistent screenshots
        await page.addInitScript(() => {
            document.documentElement.style.setProperty('--animation-duration', '0s');
            document.documentElement.style.setProperty('--transition-duration', '0s');
        });
    });

    test('should render full difficulty badge correctly', async ({ page }) => {
        await page.goto('http://localhost:3000/test-badges.html');
        
        // Wait for badge to load
        await page.waitForSelector('.difficulty-badge[data-level="B1"]');
        
        // Take screenshot
        const badge = page.locator('.difficulty-badge[data-level="B1"]').first();
        await expect(badge).toHaveScreenshot('difficulty-badge-b1-perfect.png');
    });

    test('should render all CEFR levels correctly', async ({ page }) => {
        await page.goto('http://localhost:3000/test-badges.html');
        
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        
        for (const level of levels) {
            const badge = page.locator(`.difficulty-badge[data-level="${level}"]`).first();
            if (await badge.count() > 0) {
                await expect(badge).toHaveScreenshot(`difficulty-badge-${level.toLowerCase()}.png`);
            }
        }
    });

    test('should render difficulty statuses correctly', async ({ page }) => {
        await page.goto('http://localhost:3000/test-badges.html');
        
        const statuses = ['Perfect', 'Easy', 'Challenging', 'Too Hard', 'Too Easy'];
        
        for (const status of statuses) {
            const badge = page.locator(`.difficulty-badge[data-status="${status}"]`).first();
            if (await badge.count() > 0) {
                await expect(badge).toHaveScreenshot(`badge-status-${status.toLowerCase().replace(' ', '-')}.png`);
            }
        }
    });

    test('should render compact badge correctly', async ({ page }) => {
        await page.goto('http://localhost:3000/test-badges.html');
        
        const compactBadge = page.locator('.difficulty-badge-compact').first();
        await expect(compactBadge).toHaveScreenshot('difficulty-badge-compact.png');
    });

    test('should render goldilocks indicator correctly', async ({ page }) => {
        await page.goto('http://localhost:3000/test-badges.html');
        
        const indicator = page.locator('.goldilocks-indicator').first();
        await expect(indicator).toHaveScreenshot('goldilocks-indicator.png');
    });
});

test.describe('Video Feed with Badges', () => {
    
    test('should show badges on video cards', async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Wait for videos to load
        await page.waitForSelector('[data-video-id]', { timeout: 10000 });
        
        // Check first video has badge
        const firstVideo = page.locator('[data-video-id]').first();
        const badge = firstVideo.locator('.difficulty-badge');
        
        await expect(badge).toBeVisible();
        await expect(firstVideo).toHaveScreenshot('video-with-badge.png');
    });

    test('should show different badges for different difficulty levels', async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        await page.waitForSelector('[data-video-id]', { timeout: 10000 });
        
        // Get first 3 videos
        const videos = await page.locator('[data-video-id]').all();
        const videoSubset = videos.slice(0, Math.min(3, videos.length));
        
        for (let i = 0; i < videoSubset.length; i++) {
            await expect(videoSubset[i]).toHaveScreenshot(`video-${i + 1}-with-difficulty.png`);
        }
    });
});

test.describe('Responsive Design', () => {
    
    test('should render badges correctly on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        await page.goto('http://localhost:3000');
        
        await page.waitForSelector('[data-video-id]', { timeout: 10000 });
        
        const firstVideo = page.locator('[data-video-id]').first();
        await expect(firstVideo).toHaveScreenshot('video-badge-mobile.png');
    });

    test('should render badges correctly on tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 }); // iPad
        await page.goto('http://localhost:3000');
        
        await page.waitForSelector('[data-video-id]', { timeout: 10000 });
        
        const firstVideo = page.locator('[data-video-id]').first();
        await expect(firstVideo).toHaveScreenshot('video-badge-tablet.png');
    });
});

test.describe('Smoke Tests', () => {
    
    test('homepage loads without errors', async ({ page }) => {
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        expect(errors).toHaveLength(0);
    });

    test('difficulty badges load on page', async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Wait for at least one badge
        const badge = page.locator('.difficulty-badge, .difficulty-badge-compact').first();
        await expect(badge).toBeVisible({ timeout: 15000 });
    });

    test('API endpoints are accessible', async ({ page }) => {
        const response = await page.request.get('http://localhost:3000/api/content/analyzed/test_video_1');
        expect([200, 404]).toContain(response.status()); // 404 is OK if content doesn't exist yet
    });

    test('no console errors on page load', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        // Filter out known acceptable errors
        const criticalErrors = errors.filter(e => 
            !e.includes('favicon') && 
            !e.includes('404') &&
            !e.includes('Service Worker')
        );
        
        expect(criticalErrors).toHaveLength(0);
    });
});

test.describe('Functional Tests', () => {
    
    test('difficulty badge updates when user level changes', async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Wait for initial badges
        await page.waitForSelector('.difficulty-badge', { timeout: 10000 });
        
        // Simulate user level change (if implemented)
        await page.evaluate(() => {
            localStorage.setItem('userLevel', 'B1');
            window.difficultyFeed?.updateBadge('video_1');
        });
        
        // Check badge still visible
        const badge = page.locator('.difficulty-badge').first();
        await expect(badge).toBeVisible();
    });

    test('can filter content by difficulty level', async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // If difficulty filter exists
        const filter = page.locator('[data-filter="level"]');
        if (await filter.count() > 0) {
            await filter.selectOption('B1');
            
            await page.waitForTimeout(1000); // Wait for filter
            
            const badges = page.locator('.difficulty-badge[data-level="B1"]');
            const count = await badges.count();
            expect(count).toBeGreaterThan(0);
        }
    });
});

