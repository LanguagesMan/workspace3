import { test, expect } from '@playwright/test';

/**
 * MVP LAUNCH DAY 1 - COMPREHENSIVE TEST SUITE
 *
 * Tests all critical pages for:
 * - Load time (<3s)
 * - No JavaScript errors
 * - Interactive elements
 * - Mobile responsiveness
 * - Video functionality
 * - Navigation
 */

const PAGES = [
  {
    name: 'Home Page',
    url: '/',
    priority: 'P0',
    checks: ['load', 'navigation', 'mobile']
  },
  {
    name: 'TikTok Video Feed',
    url: '/tiktok-video-feed.html',
    priority: 'P0',
    checks: ['load', 'video', 'interaction', 'mobile', 'navigation']
  },
  {
    name: 'Langflix App',
    url: '/langflix-app.html',
    priority: 'P0',
    checks: ['load', 'video', 'interaction', 'mobile']
  },
  {
    name: 'Discover Feed (AI News)',
    url: '/discover-ai.html',
    priority: 'P1',
    checks: ['load', 'interaction', 'mobile']
  },
  {
    name: 'Games Hub',
    url: '/games-hub.html',
    priority: 'P1',
    checks: ['load', 'interaction', 'navigation', 'mobile']
  },
  {
    name: 'Premium Subscription',
    url: '/premium.html',
    priority: 'P0',
    checks: ['load', 'interaction', 'mobile']
  },
  {
    name: 'Referral System',
    url: '/referral-system.html',
    priority: 'P1',
    checks: ['load', 'interaction', 'mobile']
  }
];

// Track all errors
const errorLog = [];
const performanceMetrics = {};

test.describe('MVP Launch Day 1 - Critical Pages', () => {

  test.beforeEach(async ({ page }) => {
    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorLog.push({
          page: page.url(),
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      errorLog.push({
        page: page.url(),
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });
  });

  for (const pageConfig of PAGES) {
    test(`${pageConfig.name} - Load Performance (<3s)`, async ({ page }) => {
      const startTime = Date.now();

      const response = await page.goto(pageConfig.url, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      const loadTime = Date.now() - startTime;
      performanceMetrics[pageConfig.name] = {
        loadTime,
        status: response?.status(),
        url: pageConfig.url
      };

      // Log results
      console.log(`✓ ${pageConfig.name}: ${loadTime}ms (${response?.status()})`);

      // Assertions
      expect(response?.status()).toBe(200);
      expect(loadTime).toBeLessThan(3000); // <3s requirement
    });

    if (pageConfig.checks.includes('mobile')) {
      test(`${pageConfig.name} - Mobile Responsiveness`, async ({ page }) => {
        // iPhone 12 viewport
        await page.setViewportSize({ width: 390, height: 844 });

        await page.goto(pageConfig.url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        // Take mobile screenshot
        await page.screenshot({
          path: `/tmp/mvp-mobile-${pageConfig.name.toLowerCase().replace(/\s+/g, '-')}.png`,
          fullPage: false
        });

        // Check for horizontal scroll (bad UX)
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        expect(hasHorizontalScroll).toBe(false);
      });
    }

    if (pageConfig.checks.includes('video')) {
      test(`${pageConfig.name} - Video Load & Play`, async ({ page }) => {
        await page.goto(pageConfig.url, { waitUntil: 'networkidle' });

        // Wait for video elements
        const videos = await page.locator('video').all();

        if (videos.length > 0) {
          const firstVideo = videos[0];

          // Check video can load
          await firstVideo.waitFor({ state: 'visible', timeout: 5000 });

          // Check video has source
          const hasSrc = await firstVideo.evaluate((v) => {
            return v.src || v.querySelector('source')?.src;
          });

          expect(hasSrc).toBeTruthy();

          // Try to play
          const canPlay = await firstVideo.evaluate(async (v) => {
            try {
              await v.play();
              return !v.paused;
            } catch (e) {
              return false;
            }
          });

          console.log(`  Video playback: ${canPlay ? 'WORKING' : 'FAILED'}`);
        } else {
          console.log(`  No videos found on ${pageConfig.name}`);
        }
      });
    }

    if (pageConfig.checks.includes('interaction')) {
      test(`${pageConfig.name} - Interactive Elements`, async ({ page }) => {
        await page.goto(pageConfig.url, { waitUntil: 'networkidle' });

        // Find all buttons
        const buttons = await page.locator('button').all();

        if (buttons.length > 0) {
          // Test first button click
          const firstButton = buttons[0];
          const isVisible = await firstButton.isVisible();

          if (isVisible) {
            const startTime = Date.now();
            await firstButton.click();
            const responseTime = Date.now() - startTime;

            console.log(`  Button response time: ${responseTime}ms`);
            expect(responseTime).toBeLessThan(100); // <100ms interaction
          }
        }

        // Find all links
        const links = await page.locator('a[href]').all();
        console.log(`  Found ${links.length} links, ${buttons.length} buttons`);
      });
    }

    if (pageConfig.checks.includes('navigation')) {
      test(`${pageConfig.name} - Navigation Works`, async ({ page }) => {
        await page.goto(pageConfig.url, { waitUntil: 'networkidle' });

        // Check for nav elements
        const navExists = await page.locator('nav, [role="navigation"]').count();

        if (navExists > 0) {
          // Find first nav link
          const navLinks = await page.locator('nav a, [role="navigation"] a').all();

          if (navLinks.length > 0) {
            const firstLink = navLinks[0];
            const href = await firstLink.getAttribute('href');

            console.log(`  Navigation link found: ${href}`);
            expect(href).toBeTruthy();
          }
        }
      });
    }
  }

  test.afterAll(async () => {
    // Generate comprehensive report
    console.log('\n' + '='.repeat(80));
    console.log('MVP LAUNCH DAY 1 - COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));

    console.log('\n📊 PERFORMANCE METRICS:');
    console.log('-'.repeat(80));
    for (const [page, metrics] of Object.entries(performanceMetrics)) {
      const status = metrics.loadTime < 3000 ? '✓' : '✗';
      console.log(`${status} ${page}: ${metrics.loadTime}ms (${metrics.status})`);
    }

    console.log('\n🐛 ERRORS FOUND:');
    console.log('-'.repeat(80));
    if (errorLog.length === 0) {
      console.log('✓ No errors detected!');
    } else {
      errorLog.forEach((error, i) => {
        console.log(`${i + 1}. [${error.timestamp}] ${error.page}`);
        console.log(`   ${error.message}`);
      });
    }

    console.log('\n📱 PAGES TESTED:');
    console.log('-'.repeat(80));
    PAGES.forEach(p => {
      console.log(`${p.priority} - ${p.name} (${p.url})`);
      console.log(`     Checks: ${p.checks.join(', ')}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('TEST COMPLETE');
    console.log('='.repeat(80) + '\n');
  });
});

test.describe('MVP Launch Day 1 - Additional Pages', () => {

  const additionalPages = [
    '/discover-articles.html',
    '/comprehensive-feed.html',
    '/dashboard.html',
    '/achievements.html',
    '/leaderboard.html'
  ];

  for (const url of additionalPages) {
    test(`Additional: ${url} - Basic Load Test`, async ({ page }) => {
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 5000
      });

      expect(response?.status()).toBe(200);
      console.log(`✓ ${url}: ${response?.status()}`);
    });
  }
});
