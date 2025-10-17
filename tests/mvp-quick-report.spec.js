import { test, expect } from '@playwright/test';

/**
 * MVP LAUNCH - QUICK REPORT GENERATOR
 * Generates detailed screenshots and performance data for all critical pages
 */

test.describe('MVP Quick Report', () => {
  const pages = [
    { name: 'Home', url: '/', priority: 'P0' },
    { name: 'TikTok Feed', url: '/tiktok-video-feed.html', priority: 'P0' },
    { name: 'Langflix', url: '/langflix-app.html', priority: 'P0' },
    { name: 'Discover AI', url: '/discover-ai.html', priority: 'P1' },
    { name: 'Games Hub', url: '/games-hub.html', priority: 'P1' },
    { name: 'Premium', url: '/premium.html', priority: 'P0' },
  ];

  for (const pageInfo of pages) {
    test(`${pageInfo.name} - Screenshot & Metrics`, async ({ page }) => {
      const errors = [];

      page.on('pageerror', error => {
        errors.push(error.message);
      });

      const startTime = Date.now();
      const response = await page.goto(pageInfo.url, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      const loadTime = Date.now() - startTime;

      // Wait a bit for content
      await page.waitForTimeout(2000);

      // Desktop screenshot
      await page.screenshot({
        path: `/tmp/mvp-${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}-desktop.png`,
        fullPage: true
      });

      // Mobile screenshot
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `/tmp/mvp-${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}-mobile.png`,
        fullPage: false
      });

      // Count elements
      const buttonCount = await page.locator('button').count();
      const videoCount = await page.locator('video').count();
      const linkCount = await page.locator('a[href]').count();

      console.log(`\n${'='.repeat(60)}`);
      console.log(`📄 ${pageInfo.name.toUpperCase()} (${pageInfo.priority})`);
      console.log(`${'='.repeat(60)}`);
      console.log(`URL: ${pageInfo.url}`);
      console.log(`Status: ${response?.status() || 'unknown'}`);
      console.log(`Load Time: ${loadTime}ms ${loadTime < 3000 ? '✓' : '✗ SLOW'}`);
      console.log(`Buttons: ${buttonCount}`);
      console.log(`Videos: ${videoCount}`);
      console.log(`Links: ${linkCount}`);
      console.log(`Errors: ${errors.length > 0 ? errors.length + ' ✗' : '0 ✓'}`);
      if (errors.length > 0) {
        console.log(`First Error: ${errors[0]}`);
      }
      console.log(`Screenshots: Desktop & Mobile saved to /tmp/`);
      console.log(`${'='.repeat(60)}\n`);
    });
  }
});
