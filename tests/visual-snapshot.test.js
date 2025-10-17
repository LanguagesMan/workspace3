/**
 * 📸 VISUAL SNAPSHOT TEST
 * Takes screenshots for manual verification during development
 * Part of the safe development workflow
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Snapshot Tests', () => {
    
    test('Homepage snapshot', async ({ page }) => {
        await page.goto('http://localhost:3001');
        await page.waitForLoadState('networkidle');
        
        // Wait for main content
        await page.waitForSelector('.feed-container', { timeout: 10000 });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await page.screenshot({ 
            path: `screenshots/safe-dev/${timestamp}-homepage.png`,
            fullPage: true 
        });
    });
    
    test('Video feed snapshot', async ({ page }) => {
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForLoadState('networkidle');
        
        // Wait for video to load
        await page.waitForSelector('video', { timeout: 10000 });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await page.screenshot({ 
            path: `screenshots/safe-dev/${timestamp}-video-feed.png`,
            fullPage: true 
        });
    });
    
    test('Mobile view snapshot', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
        await page.goto('http://localhost:3001/tiktok-video-feed.html');
        await page.waitForLoadState('networkidle');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await page.screenshot({ 
            path: `screenshots/safe-dev/${timestamp}-mobile-view.png`,
            fullPage: true 
        });
    });
});
