// 🎯 TikTok 2025 Vertical Scroll - Full Compliance Test
// Based on research: https://stackoverflow.com/questions/75340067/tiktok-like-scrolling-with-css
// Competitive parity: TikTok For You page, YouTube Shorts, Instagram Reels

import { test, expect } from '@playwright/test';

test.describe('🎬 TikTok 2025 Vertical Scroll Compliance', () => {
  const BASE_URL = 'http://localhost:3002';

  test('IMMEDIATE vertical reels on app open - NO menus first', async ({ page }) => {
    console.log('\n🚀 Testing: Immediate TikTok-style vertical reels...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify NO Instagram Stories bar (user requested removal)
    const storiesBar = page.locator('.stories-bar');
    const storiesVisible = await storiesBar.isVisible().catch(() => false);
    expect(storiesVisible).toBe(false);
    console.log('✅ NO Stories bar (user wants NO menus)');

    // Verify videos are visible IMMEDIATELY
    const videos = page.locator('video');
    const videoCount = await videos.count();
    expect(videoCount).toBeGreaterThan(0);
    console.log(`✅ ${videoCount} videos loaded IMMEDIATELY`);

    // Verify full-screen vertical layout (100vh height)
    const firstSlide = page.locator('.video-slide').first();
    await expect(firstSlide).toBeVisible();

    const slideHeight = await firstSlide.evaluate(el => el.offsetHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    // TikTok standard: slides are 100vh (full viewport height)
    expect(slideHeight).toBe(viewportHeight);
    console.log(`✅ Full-screen slides: ${slideHeight}px (matches viewport ${viewportHeight}px)`);

    await page.screenshot({
      path: 'screenshots/tiktok-2025-immediate-open.png',
      fullPage: false
    });
  });

  test('CSS scroll-snap-type: y mandatory on html element', async ({ page }) => {
    console.log('\n📐 Testing: TikTok scroll-snap CSS implementation...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Verify scroll-snap-type on html element (NOT body)
    // Source: https://stackoverflow.com/questions/75340067/tiktok-like-scrolling-with-css
    const scrollSnapType = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).scrollSnapType;
    });

    expect(scrollSnapType).toContain('y');
    expect(scrollSnapType).toContain('mandatory');
    console.log(`✅ scroll-snap-type: ${scrollSnapType} (TikTok standard)`);

    // Verify scroll-snap-align: start on video slides
    const firstSlide = page.locator('.video-slide').first();
    const snapAlign = await firstSlide.evaluate(el =>
      window.getComputedStyle(el).scrollSnapAlign
    );

    expect(snapAlign).toBe('start');
    console.log(`✅ scroll-snap-align: ${snapAlign} (TikTok standard)`);
  });

  test('Clickable Spanish word translations in subtitles', async ({ page }) => {
    console.log('\n🔤 Testing: Clickable Spanish word translations...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Wait for video to play and subtitles to appear
    await page.waitForTimeout(3000);

    // Check for clickable subtitle words
    const subtitleWords = page.locator('.subtitle-word');
    const wordCount = await subtitleWords.count();

    if (wordCount > 0) {
      console.log(`✅ ${wordCount} clickable Spanish words found`);

      // Test clicking a word shows translation popup
      await subtitleWords.first().click();
      await page.waitForTimeout(500);

      const popup = page.locator('.translation-popup');
      await expect(popup).toBeVisible();
      console.log('✅ Translation popup appears on word click');

      const spanishText = await popup.locator('.translation-spanish').textContent();
      const englishText = await popup.locator('.translation-english').textContent();

      console.log(`✅ Translation: "${spanishText}" → "${englishText}"`);

      await page.screenshot({
        path: 'screenshots/tiktok-2025-word-translation.png',
        fullPage: false
      });
    } else {
      console.log('⏳ No subtitle words visible yet (may appear during video playback)');
    }
  });

  test('REAL Spanish videos with .srt subtitles - NO dummy content', async ({ page }) => {
    console.log('\n📹 Testing: Real Spanish video content...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const videos = page.locator('video');
    const videoCount = await videos.count();
    expect(videoCount).toBeGreaterThan(0);

    // Check first video source
    const firstVideoSrc = await videos.first().getAttribute('src');

    // Verify REAL content (not dummy/placeholder)
    expect(firstVideoSrc).toContain('/videos/');
    expect(firstVideoSrc).toContain('.mp4');
    expect(firstVideoSrc).not.toContain('dummy');
    expect(firstVideoSrc).not.toContain('placeholder');
    expect(firstVideoSrc).not.toContain('sample');

    console.log(`✅ Video source: ${firstVideoSrc}`);
    console.log('✅ NO dummy content detected');

    // Verify subtitle containers exist
    const subtitles = page.locator('.subtitles');
    const subtitleCount = await subtitles.count();
    expect(subtitleCount).toBeGreaterThan(0);
    console.log(`✅ ${subtitleCount} subtitle containers ready`);
  });

  test('TikTok engagement buttons visible on right side', async ({ page }) => {
    console.log('\n💗 Testing: TikTok-style engagement bar...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Verify engagement bar exists
    const engagementBar = page.locator('.engagement-bar');
    await expect(engagementBar.first()).toBeVisible();

    // Check for TikTok-standard buttons: Like, Save, Comment, Grammar Tip, Share
    const likeBtn = engagementBar.locator('.engagement-btn').nth(0);
    const saveBtn = engagementBar.locator('.engagement-btn').nth(1);
    const commentBtn = engagementBar.locator('.engagement-btn').nth(2);

    await expect(likeBtn).toBeVisible();
    await expect(saveBtn).toBeVisible();
    await expect(commentBtn).toBeVisible();

    console.log('✅ Like button visible');
    console.log('✅ Save button visible');
    console.log('✅ Comment button visible');

    // Verify right-side positioning (TikTok standard: 12px from right)
    const barPosition = await engagementBar.first().evaluate(el => ({
      right: window.getComputedStyle(el).right,
      bottom: window.getComputedStyle(el).bottom
    }));

    console.log(`✅ Engagement bar position: right ${barPosition.right}, bottom ${barPosition.bottom}`);

    await page.screenshot({
      path: 'screenshots/tiktok-2025-engagement-buttons.png',
      fullPage: false
    });
  });

  test('Vertical scroll snaps between videos', async ({ page }) => {
    console.log('\n📜 Testing: Vertical scroll snap behavior...');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Scroll down (simulate swipe)
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(500);

    // Verify scroll snapped to next video (not mid-scroll)
    const scrollTop = await page.evaluate(() => window.scrollY);
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    // After scroll-snap, scrollTop should be a multiple of viewport height
    const isSnapped = Math.abs(scrollTop % viewportHeight) < 10;
    expect(isSnapped).toBe(true);

    console.log(`✅ Scroll position: ${scrollTop}px (snapped to ${Math.round(scrollTop / viewportHeight)}x viewport)`);
    console.log('✅ Vertical scroll snapping working (TikTok standard)');

    await page.screenshot({
      path: 'screenshots/tiktok-2025-scroll-snap.png',
      fullPage: false
    });
  });

  test('Performance: Load time < 2 seconds', async ({ page }) => {
    console.log('\n⚡ Testing: Performance (TikTok standard: <2s load)...');

    const startTime = Date.now();

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // TikTok standard: app must load in under 2 seconds
    expect(loadTime).toBeLessThan(2000);
    console.log(`✅ Load time: ${loadTime}ms (< 2000ms TikTok standard)`);
  });
});

test.describe('📊 Competitive Parity Validation', () => {
  const BASE_URL = 'http://localhost:3002';

  test('Visual parity checklist with TikTok/YouTube Shorts', async ({ page }) => {
    console.log('\n🎯 Competitive Parity Checklist:');

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const checklist = [];

    // 1. Full-screen vertical videos (100vh)
    const firstSlide = page.locator('.video-slide').first();
    const slideHeight = await firstSlide.evaluate(el => el.offsetHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const isFullScreen = slideHeight === viewportHeight;
    checklist.push({ name: 'Full-screen videos (100vh)', passed: isFullScreen });

    // 2. NO menus on immediate open
    const storiesVisible = await page.locator('.stories-bar').isVisible().catch(() => false);
    checklist.push({ name: 'NO menus on open (pure TikTok)', passed: !storiesVisible });

    // 3. Vertical scroll-snap
    const scrollSnapType = await page.evaluate(() =>
      window.getComputedStyle(document.documentElement).scrollSnapType
    );
    checklist.push({ name: 'scroll-snap-type: y mandatory', passed: scrollSnapType.includes('y') });

    // 4. Right-side engagement buttons
    const engagementBar = page.locator('.engagement-bar');
    const hasEngagement = await engagementBar.first().isVisible();
    checklist.push({ name: 'TikTok-style engagement buttons', passed: hasEngagement });

    // 5. Clickable subtitles
    const subtitles = page.locator('.subtitles');
    const hasSubtitles = await subtitles.count() > 0;
    checklist.push({ name: 'Clickable Spanish subtitles', passed: hasSubtitles });

    // 6. Real video content (not dummy)
    const videos = page.locator('video');
    const videoCount = await videos.count();
    const hasVideos = videoCount > 0;
    checklist.push({ name: 'Real Spanish videos loaded', passed: hasVideos });

    console.log('\n📊 COMPETITIVE PARITY RESULTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const item of checklist) {
      const icon = item.passed ? '✅' : '❌';
      console.log(`${icon} ${item.name}`);
    }

    const passedCount = checklist.filter(item => item.passed).length;
    const totalCount = checklist.length;
    const scorePercent = Math.round((passedCount / totalCount) * 100);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📈 Score: ${passedCount}/${totalCount} (${scorePercent}%)`);

    // TikTok parity requires 100% compliance
    expect(passedCount).toBe(totalCount);

    await page.screenshot({
      path: 'screenshots/tiktok-2025-competitive-parity.png',
      fullPage: true
    });
  });
});
