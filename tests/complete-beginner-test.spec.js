const { test, expect } = require('@playwright/test');

/**
 * COMPLETE BEGINNER PERSONA TEST
 *
 * Profile: Alex, 19, Never studied Spanish before (A0-A1)
 * Goals: Learn basic phrases, build vocabulary, have fun
 * Tech comfort: High (uses TikTok daily), but language learning newbie
 *
 * Pain Points to Test:
 * 1. Overwhelming - too many words at once?
 * 2. No guidance - where to start?
 * 3. Can't tell if they're learning - no progress feedback?
 * 4. Too fast - videos move too quickly?
 * 5. No explanations - what does this word mean in context?
 */

test.describe('Complete Beginner (A0-A1) Experience', () => {
  test('should load IMMEDIATELY with videos (no onboarding bloat)', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3002');

    // Beginners need INSTANT gratification (TikTok style)
    await page.waitForSelector('.reel', { timeout: 3000 });

    const loadTime = Date.now() - startTime;
    console.log(`⏱️  Load time: ${loadTime}ms`);

    // TikTok standard: < 2s
    expect(loadTime).toBeLessThan(2000);
  });

  test('should show reels FIRST (not settings/profile/tutorial)', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // First visible element should be content, not UI chrome
    const reel = page.locator('.reel').first();
    await expect(reel).toBeVisible({ timeout: 2000 });

    console.log('✅ Shows content immediately (TikTok style)');
  });

  test('should have SIMPLE Spanish words (not complex sentences)', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.subtitle-container, .word-overlay');

    // Check if words are beginner-friendly
    const text = await page.locator('.subtitle-container, .word-overlay').first().textContent();
    const wordCount = text.trim().split(/\s+/).length;

    console.log(`📝 Subtitle words: ${wordCount}`);
    console.log(`📝 Text: "${text.substring(0, 50)}..."`);

    // Beginners prefer short phrases (3-5 words max per line)
    if (wordCount > 8) {
      console.log('⚠️  PAIN POINT: Subtitles too long for beginners');
    }
  });

  test('should have clickable word translations (learn-by-tapping)', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.subtitle-container, .word-overlay');

    // Find clickable words
    const words = page.locator('.subtitle-container .word, .subtitle-container span[data-word], .word-overlay .word');
    const count = await words.count();

    console.log(`🎯 Clickable words: ${count}`);

    if (count === 0) {
      console.log('❌ PAIN POINT: No clickable words (beginners need tap-to-translate)');
    }

    expect(count).toBeGreaterThan(0);
  });

  test('PAIN POINT: No visual feedback for beginners (am I learning?)', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Look for beginner-friendly progress indicators
    const progressBar = page.locator('[class*="progress"], [class*="level"], [class*="streak"]');
    const hasProgress = await progressBar.count() > 0;

    if (!hasProgress) {
      console.log('❌ PAIN POINT: No progress feedback (beginners need encouragement)');
      console.log('   Suggestion: Add simple "Words Learned: 5" counter');
    } else {
      console.log('✅ Has progress indicators');
    }
  });

  test('PAIN POINT: No "slow down" option for beginners', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.reel');

    // Look for speed control
    const speedControl = page.locator('[class*="speed"], button:has-text("0.5x"), button:has-text("Slow")');
    const hasSpeed = await speedControl.count() > 0;

    if (!hasSpeed) {
      console.log('❌ PAIN POINT: No speed control (beginners need slower playback)');
      console.log('   Suggestion: Add 0.5x speed button (Lingopie style)');
    } else {
      console.log('✅ Has speed control');
    }
  });

  test('PAIN POINT: No explanations (what does this mean?)', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.subtitle-container, .word-overlay');

    // Try clicking a word
    const words = page.locator('.subtitle-container .word, .word-overlay .word');

    if (await words.count() > 0) {
      await words.first().click();
      await page.waitForTimeout(500);

      // Look for explanation/translation
      const translation = page.locator('.translation-popup, .word-translation, [class*="translation"]');
      const hasTranslation = await translation.isVisible().catch(() => false);

      if (!hasTranslation) {
        console.log('❌ PAIN POINT: Clicked word but no translation shown');
        console.log('   Suggestion: Show instant popup with English meaning');
      } else {
        console.log('✅ Word translation appears on click');
      }
    }
  });

  test('PAIN POINT: Overwhelming (too many unknown words at once)', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.subtitle-container, .word-overlay');

    // Count total words on screen
    const allText = await page.locator('.subtitle-container, .word-overlay').first().textContent();
    const totalWords = allText.trim().split(/\s+/).length;

    console.log(`📊 Total words on screen: ${totalWords}`);

    if (totalWords > 10) {
      console.log('⚠️  PAIN POINT: Too many words for complete beginners');
      console.log('   Suggestion: Highlight only 1-2 new words per video');
    }
  });

  test('PAIN POINT: No guidance (where should I start?)', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Look for beginner-friendly hints/guidance
    const hints = page.locator('[class*="hint"], [class*="tooltip"], [class*="guide"]');
    const hasHints = await hints.count() > 0;

    if (!hasHints) {
      console.log('❌ PAIN POINT: No onboarding hints for first-time users');
      console.log('   Suggestion: Show "Tap any word to learn" tooltip on first load');
    }
  });

  test('should have simple UI (not cluttered)', async ({ page }) => {
    await page.goto('http://localhost:3002');

    // Count UI elements (beginners prefer minimal)
    const buttons = await page.locator('button').count();
    const navs = await page.locator('nav').count();

    console.log(`🎨 UI elements: ${buttons} buttons, ${navs} navs`);

    // TikTok style: minimal UI, content-first
    expect(navs).toBeLessThanOrEqual(1);
  });

  test('VISUAL: Take screenshot for complete_beginner persona', async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForSelector('.reel');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `screenshots/complete_beginner-${Date.now()}.png`,
      fullPage: true
    });

    console.log('✅ Screenshot saved');
  });
});
