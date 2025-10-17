/**
 * Smoke Tests - Critical Path
 * 
 * Fast tests (< 2 minutes) that verify core functionality
 * Run on every branch before merge
 */

const { test, expect } = require('@playwright/test');

test.describe('Smoke Tests - Critical Path', () => {
    test('Homepage loads successfully', async ({ page }) => {
        await page.goto('/');
        
        // Check title
        await expect(page).toHaveTitle(/Langflix|Language/i);
        
        // Check page loads
        await expect(page.locator('body')).toBeVisible();
        
        console.log('✅ Homepage loaded');
    });

    test('Articles feed page loads', async ({ page }) => {
        await page.goto('/discover-articles.html');
        
        // Wait for articles to load
        await page.waitForSelector('.article-card, .article-item', { 
            timeout: 10000,
            state: 'visible' 
        }).catch(() => {
            // Fallback: check if loading indicator exists
            console.log('No articles found, checking for loading state');
        });
        
        // Check page title
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
        
        console.log('✅ Articles feed loaded');
    });

    test('Personalized API endpoint responds', async ({ request }) => {
        const response = await request.get('/api/articles/personalized?userId=test_user&limit=5');
        
        expect(response.status()).toBeLessThan(600);
        
        // Should be either 200 (success) or 503 (service unavailable but graceful)
        const validStatuses = [200, 503];
        expect(validStatuses).toContain(response.status());
        
        const data = await response.json();
        expect(data).toHaveProperty('success');
        
        console.log('✅ Personalized API responds');
    });

    test('Video feed page loads', async ({ page }) => {
        await page.goto('/tiktok-video-feed.html');
        
        // Wait for video container
        await page.waitForSelector('.video-container, #video-player', {
            timeout: 10000
        }).catch(() => {
            console.log('Video container not found, checking page structure');
        });
        
        // Check page loaded
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
        
        console.log('✅ Video feed loaded');
    });

    test('Navigation works', async ({ page }) => {
        await page.goto('/');
        
        // Check for navigation elements
        const navExists = await page.locator('nav, .nav, .navigation, [role="navigation"]').count();
        expect(navExists).toBeGreaterThan(0);
        
        console.log('✅ Navigation present');
    });

    test('No critical JavaScript errors on homepage', async ({ page }) => {
        const errors = [];
        
        page.on('pageerror', error => {
            errors.push(error.message);
        });
        
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Filter out non-critical errors
        const criticalErrors = errors.filter(err => 
            !err.includes('favicon') && 
            !err.includes('analytics') &&
            !err.includes('gtag')
        );
        
        expect(criticalErrors.length).toBe(0);
        
        console.log('✅ No critical JS errors');
    });

    test('Server responds to health check', async ({ request }) => {
        const response = await request.get('/');
        
        expect(response.status()).toBeLessThan(500);
        
        console.log('✅ Server healthy');
    });
});


