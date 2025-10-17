// Visual proof tests - capture screenshots of working features
import { test } from '@playwright/test';

test('Screenshot: Feed with real videos loaded', async ({ page }) => {
  await page.goto('http://localhost:3002/unified-infinite-feed.html');
  await page.waitForSelector('.content-card', { timeout: 10000 });
  await page.screenshot({ path: 'screenshots/PROOF-feed-loaded.png', fullPage: true });
});

test('Screenshot: Videos mode TikTok-style scroll', async ({ page }) => {
  await page.goto('http://localhost:3002/unified-infinite-feed.html');
  await page.locator('.nav-tab').filter({ hasText: 'Videos' }).click();
  await page.waitForSelector('.feed-container.videos-mode', { timeout: 5000 });
  await page.screenshot({ path: 'screenshots/PROOF-tiktok-scroll.png', fullPage: true });
});

test('Screenshot: Clickable word translations', async ({ page }) => {
  await page.goto('http://localhost:3002/unified-infinite-feed.html');
  await page.waitForSelector('.spanish-word', { timeout: 10000 });
  const firstWord = page.locator('.spanish-word').first();
  await firstWord.hover();
  await page.screenshot({ path: 'screenshots/PROOF-word-translation.png' });
});

test('Screenshot: Mobile responsive 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:3002/unified-infinite-feed.html');
  await page.waitForSelector('.content-card', { timeout: 10000 });
  await page.screenshot({ path: 'screenshots/PROOF-mobile-responsive.png', fullPage: true });
});
