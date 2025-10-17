/**
 * Visual Regression Tests
 * 
 * Captures screenshots and compares against baseline
 * Detects unintended UI changes
 */

const { test, expect } = require('@playwright/test');

test.describe('Visual Regression Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Disable animations for consistent screenshots
        await page.addInitScript(() => {
            document.documentElement.style.setProperty('animation-duration', '0s', 'important');
            document.documentElement.style.setProperty('transition-duration', '0s', 'important');
        });
    });

    test('Articles feed visual', async ({ page }) => {
        await page.goto('/discover-articles.html?test=true');
        
        // Wait for content to load
        await page.waitForTimeout(2000);
        
        // Hide dynamic elements
        await page.evaluate(() => {
            // Hide timestamps
            document.querySelectorAll('[class*="time"], [class*="date"]').forEach(el => {
                el.style.visibility = 'hidden';
            });
        });
        
        await expect(page).toHaveScreenshot('articles-feed.png', {
            fullPage: true,
            animations: 'disabled',
            maxDiffPixels: 100
        });
        
        console.log('✅ Articles feed visual captured');
    });

    test('Homepage visual', async ({ page }) => {
        await page.goto('/?test=true');
        
        await page.waitForTimeout(2000);
        
        await expect(page).toHaveScreenshot('homepage.png', {
            fullPage: false,
            animations: 'disabled',
            maxDiffPixels: 100
        });
        
        console.log('✅ Homepage visual captured');
    });

    test('Video feed visual', async ({ page }) => {
        await page.goto('/tiktok-video-feed.html?test=true');
        
        await page.waitForTimeout(2000);
        
        // Hide video player (dynamic content)
        await page.evaluate(() => {
            const video = document.querySelector('video');
            if (video) video.style.visibility = 'hidden';
        });
        
        await expect(page).toHaveScreenshot('video-feed.png', {
            fullPage: false,
            animations: 'disabled',
            maxDiffPixels: 150
        });
        
        console.log('✅ Video feed visual captured');
    });

    test('Navigation bar visual', async ({ page }) => {
        await page.goto('/?test=true');
        
        await page.waitForTimeout(1000);
        
        const nav = page.locator('nav, .navigation, [role="navigation"]').first();
        
        if (await nav.count() > 0) {
            await expect(nav).toHaveScreenshot('navigation.png', {
                animations: 'disabled',
                maxDiffPixels: 50
            });
            
            console.log('✅ Navigation visual captured');
        } else {
            console.log('⚠️ No navigation found, skipping');
        }
    });

    test('Mobile viewport - Articles', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        
        await page.goto('/discover-articles.html?test=true');
        
        await page.waitForTimeout(2000);
        
        await expect(page).toHaveScreenshot('articles-mobile.png', {
            fullPage: false,
            animations: 'disabled',
            maxDiffPixels: 100
        });
        
        console.log('✅ Mobile articles visual captured');
    });
});


