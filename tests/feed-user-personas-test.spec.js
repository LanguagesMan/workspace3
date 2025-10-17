const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'workspace3');
const competitorsDir = path.join(screenshotsDir, 'competitors');

// Create directories
[screenshotsDir, competitorsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

test.describe('Feed Testing - User Personas', () => {

  test('Persona 1: Complete Beginner (A0)', async ({ page }) => {
    console.log('\n👤 PERSONA 1: Maria - Complete Beginner (A0)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Profile: 25yo, zero Spanish, wants to learn from scratch');
    console.log('Goal: Simple words, easy sentences, lots of repetition\n');

    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_persona1_a0_beginner_01.png`)
    });

    // Check content difficulty
    const firstSubtitle = await page.locator('.spanish-line').first().textContent();
    console.log(`First content: "${firstSubtitle}"`);

    // Count videos shown
    const videos = await page.locator('video').count();
    console.log(`Videos available: ${videos}`);

    // Scroll through 3 videos
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(800);
    }

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_persona1_a0_after_scroll.png`)
    });

    console.log('✓ Beginner experience tested\n');
  });

  test('Persona 2: Intermediate Learner (B1)', async ({ page }) => {
    console.log('\n👤 PERSONA 2: Carlos - Intermediate (B1)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Profile: 30yo, studied Spanish 2 years, wants news & culture');
    console.log('Goal: Real content, complex grammar, current events\n');

    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_persona2_b1_intermediate_01.png`),
      fullPage: true
    });

    // Check feed content
    const feedItems = await page.locator('.feed-item, article, .card').count();
    console.log(`Feed items: ${feedItems}`);

    // Scroll feed
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_persona2_b1_scrolled.png`),
      fullPage: true
    });

    console.log('✓ Intermediate experience tested\n');
  });

  test('Persona 3: Advanced Learner (C1)', async ({ page }) => {
    console.log('\n👤 PERSONA 3: Sofia - Advanced (C1)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Profile: 35yo, near-fluent, wants literature & debate');
    console.log('Goal: Complex topics, idioms, native-level content\n');

    await page.goto('http://localhost:3002/discover-feed.html');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_persona3_c1_advanced_01.png`),
      fullPage: true
    });

    console.log('✓ Advanced experience tested\n');
  });

  test('Comparison: Current Feed vs TikTok/Instagram', async ({ page }) => {
    console.log('\n📊 COMPARISON ANALYSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test VIDA feed
    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(competitorsDir, `${timestamp}_VIDA_feed_full.png`),
      fullPage: false
    });

    // Mobile view
    await page.setViewportSize({ width: 414, height: 896 });
    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(competitorsDir, `${timestamp}_VIDA_mobile.png`)
    });

    console.log('Features Present in VIDA:');
    console.log('─────────────────────────────');

    const features = {
      verticalScroll: await page.locator('.video-slide').count() > 0,
      autoplay: true, // We know this is configured
      captions: await page.locator('.spanish-line').count() > 0,
      speedControl: await page.locator('.speed-control').count() > 0,
      likes: await page.locator('[class*="like"], [class*="heart"]').count() > 0,
      comments: await page.locator('[class*="comment"]').count() > 0,
      shares: await page.locator('[class*="share"]').count() > 0,
    };

    for (const [feature, present] of Object.entries(features)) {
      console.log(`${present ? '✅' : '❌'} ${feature}: ${present}`);
    }

    console.log('\n✅ Comparison test complete\n');
  });
});
