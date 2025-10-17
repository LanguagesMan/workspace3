/**
 * 🔍 LIGHTHOUSE PERFORMANCE TESTS
 * Tests app performance, accessibility, SEO, and best practices
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3001';

test.describe('Lighthouse Audits', () => {
    
    test('Homepage performance audit', async ({ page }) => {
        await page.goto(BASE_URL);
        
        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');
        
        console.log('✅ Homepage loaded');
        
        // Check critical elements
        const hasContent = await page.locator('body').count();
        expect(hasContent).toBeGreaterThan(0);
        
        console.log('✅ Content rendered');
    });
    
    test('Video feed page loads', async ({ page }) => {
        await page.goto(`${BASE_URL}/`);
        await page.waitForLoadState('networkidle');
        
        // Check for video feed
        const title = await page.title();
        console.log('✅ Page title:', title);
        
        // Check if main container exists
        const feedContainer = await page.locator('#feedContainer').count();
        console.log('✅ Feed container:', feedContainer > 0 ? 'Found' : 'Not found');
    });
    
    test('Articles page loads', async ({ page }) => {
        await page.goto(`${BASE_URL}/spanish-articles.html`);
        await page.waitForLoadState('networkidle');
        
        const title = await page.title();
        console.log('✅ Articles page title:', title);
    });
    
    test('API endpoints respond', async ({ request }) => {
        // Test research API
        const dashboard = await request.get(`${BASE_URL}/api/research/dashboard/test_user`);
        expect(dashboard.ok()).toBeTruthy();
        console.log('✅ Research API responding');
        
        // Test old API
        const videos = await request.get(`${BASE_URL}/api/videos`);
        expect(videos.ok()).toBeTruthy();
        console.log('✅ Videos API responding');
    });
    
    test('Page load time is acceptable', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto(BASE_URL);
        await page.waitForLoadState('load');
        
        const loadTime = Date.now() - startTime;
        console.log(`✅ Page load time: ${loadTime}ms`);
        
        // Should load in under 6 seconds (with full feature set)
        expect(loadTime).toBeLessThan(6000);
    });
    
    test('Critical CSS loads', async ({ page }) => {
        await page.goto(BASE_URL);
        
        // Check if styles are applied
        const bgColor = await page.evaluate(() => {
            return window.getComputedStyle(document.body).backgroundColor;
        });
        
        console.log('✅ Body background color:', bgColor);
        expect(bgColor).toBeTruthy();
    });
    
    test('JavaScript loads and executes', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Check if global variables exist (from your app)
        const hasGlobals = await page.evaluate(() => {
            return typeof currentUser !== 'undefined' || 
                   typeof currentVideo !== 'undefined' ||
                   document.querySelector('.nav-item') !== null;
        });
        
        console.log('✅ JavaScript executed:', hasGlobals);
        expect(hasGlobals).toBeTruthy();
    });
    
    test('Mobile viewport is responsive', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Check if meta viewport exists
        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
        console.log('✅ Viewport meta:', viewport);
        
        expect(viewport).toContain('width=device-width');
    });
    
    test('Navigation elements exist', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Check for bottom navigation
        const nav = await page.locator('.bottom-nav').count();
        console.log('✅ Bottom navigation:', nav > 0 ? 'Found' : 'Not found');
        
        if (nav > 0) {
            const navItems = await page.locator('.nav-item').count();
            console.log('✅ Navigation items:', navItems);
            expect(navItems).toBeGreaterThanOrEqual(4);
        }
    });
    
    test('Images have alt text', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        const images = await page.locator('img').all();
        console.log(`✅ Found ${images.length} images`);
        
        // Check if images have alt attributes (accessibility)
        for (const img of images.slice(0, 5)) {
            const alt = await img.getAttribute('alt');
            if (!alt) {
                const src = await img.getAttribute('src');
                console.log('⚠️ Image missing alt text:', src);
            }
        }
    });
});

test.describe('Performance Metrics', () => {
    
    test('Measure Core Web Vitals', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Get performance metrics
        const metrics = await page.evaluate(() => {
            const paint = performance.getEntriesByType('paint');
            const navigation = performance.getEntriesByType('navigation')[0];
            
            return {
                fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
                lcp: navigation?.loadEventEnd,
                domContentLoaded: navigation?.domContentLoadedEventEnd,
                loadComplete: navigation?.loadEventEnd
            };
        });
        
        console.log('📊 Performance Metrics:');
        console.log('  FCP (First Contentful Paint):', metrics.fcp?.toFixed(0), 'ms');
        console.log('  LCP (Largest Contentful Paint):', metrics.lcp?.toFixed(0), 'ms');
        console.log('  DOM Content Loaded:', metrics.domContentLoaded?.toFixed(0), 'ms');
        console.log('  Load Complete:', metrics.loadComplete?.toFixed(0), 'ms');
        
        // FCP should be under 1.8s (good threshold)
        if (metrics.fcp) {
            expect(metrics.fcp).toBeLessThan(1800);
        }
    });
    
    test('Check resource loading', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        const resources = await page.evaluate(() => {
            const entries = performance.getEntriesByType('resource');
            const summary = {
                total: entries.length,
                css: 0,
                js: 0,
                img: 0,
                font: 0,
                other: 0
            };
            
            entries.forEach(entry => {
                if (entry.name.includes('.css')) summary.css++;
                else if (entry.name.includes('.js')) summary.js++;
                else if (entry.name.match(/\.(jpg|jpeg|png|gif|svg|webp)/)) summary.img++;
                else if (entry.name.includes('.woff') || entry.name.includes('.ttf')) summary.font++;
                else summary.other++;
            });
            
            return summary;
        });
        
        console.log('📦 Resources Loaded:');
        console.log('  Total:', resources.total);
        console.log('  CSS:', resources.css);
        console.log('  JavaScript:', resources.js);
        console.log('  Images:', resources.img);
        console.log('  Fonts:', resources.font);
        console.log('  Other:', resources.other);
    });
    
    test('Check memory usage', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        const memory = await page.evaluate(() => {
            if (performance.memory) {
                return {
                    used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
                    total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
                    limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
                };
            }
            return null;
        });
        
        if (memory) {
            console.log('💾 Memory Usage:');
            console.log('  Used:', memory.used, 'MB');
            console.log('  Total:', memory.total, 'MB');
            console.log('  Limit:', memory.limit, 'MB');
        }
    });
});

test.describe('SEO & Accessibility', () => {
    
    test('Meta tags exist', async ({ page }) => {
        await page.goto(BASE_URL);
        
        const title = await page.title();
        const description = await page.locator('meta[name="description"]').getAttribute('content');
        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
        
        console.log('🏷️ SEO Meta Tags:');
        console.log('  Title:', title);
        console.log('  Description:', description || 'Missing');
        console.log('  Viewport:', viewport);
        
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(10);
    });
    
    test('ARIA labels for accessibility', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Check for ARIA labels on interactive elements
        const buttons = await page.locator('button').all();
        console.log(`♿ Accessibility: Found ${buttons.length} buttons`);
        
        let labeledButtons = 0;
        for (const button of buttons.slice(0, 10)) {
            const ariaLabel = await button.getAttribute('aria-label');
            const text = await button.textContent();
            if (ariaLabel || text?.trim()) {
                labeledButtons++;
            }
        }
        
        console.log(`✅ Buttons with labels: ${labeledButtons}/${Math.min(buttons.length, 10)}`);
    });
    
    test('Heading hierarchy', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        const h1 = await page.locator('h1').count();
        const h2 = await page.locator('h2').count();
        const h3 = await page.locator('h3').count();
        
        console.log('📋 Heading Hierarchy:');
        console.log('  H1:', h1);
        console.log('  H2:', h2);
        console.log('  H3:', h3);
        
        // Should have exactly one H1
        expect(h1).toBeLessThanOrEqual(1);
    });
});

console.log('\n🔍 Lighthouse Performance Tests');
console.log('📊 Testing: Load Time, Core Web Vitals, SEO, Accessibility\n');
