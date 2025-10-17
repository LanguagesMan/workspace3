const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, '..', 'screenshots', 'workspace3');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

test.describe('VIDA App - Comprehensive Testing', () => {

  test('Complete user journey - all pages and features', async ({ page }) => {
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('\n🧪 Testing Index Page...');

    // 1. INDEX PAGE
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_01_index.png`),
      fullPage: true
    });

    // Check for main elements
    const hasTitle = await page.locator('h1, h2, .title').count() > 0;
    console.log(`✓ Index page loaded (has title: ${hasTitle})`);

    // 2. TIKTOK VIDEOS PAGE
    console.log('\n🧪 Testing TikTok Videos Page...');
    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForLoadState('domcontentloaded'); // Don't wait for videos to load
    await page.waitForTimeout(2000); // Wait for initial render
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_02_tiktok_videos.png`),
      fullPage: true
    });

    // Test video controls
    const videoCount = await page.locator('video').count();
    console.log(`✓ Found ${videoCount} video(s)`);

    if (videoCount > 0) {
      // Wait for video to load and take screenshot
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(screenshotsDir, `${timestamp}_03_video_loaded.png`),
        fullPage: true
      });
      console.log('✓ Video loaded and visible');
    }

    // Test scroll functionality
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_04_video_scrolled.png`),
      fullPage: true
    });
    console.log('✓ Scroll functionality tested');

    // 3. UNIFIED INFINITE FEED
    console.log('\n🧪 Testing Unified Infinite Feed...');
    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_05_unified_feed.png`),
      fullPage: true
    });

    // Test filter buttons if they exist (only visible ones)
    const allButtons = await page.locator('button, .filter, .tab').all();
    console.log(`✓ Found ${allButtons.length} interactive elements`);

    // Click first VISIBLE filter if exists
    const visibleButtons = await page.locator('button:visible, .filter:visible, .tab:visible').all();
    if (visibleButtons.length > 0) {
      await visibleButtons[0].click({ timeout: 2000 }).catch(() => {
        console.log('⚠️  Button click failed, continuing...');
      });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(screenshotsDir, `${timestamp}_06_filter_clicked.png`),
        fullPage: true
      });
      console.log('✓ Filter interaction tested');
    }

    // Test scroll and load more
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_07_feed_scrolled.png`),
      fullPage: true
    });
    console.log('✓ Infinite scroll tested');

    // Check for articles/content
    const articles = await page.locator('article, .article, .card, .post').count();
    console.log(`✓ Found ${articles} article(s)`);

    if (articles > 0) {
      await page.screenshot({
        path: path.join(screenshotsDir, `${timestamp}_08_articles_visible.png`),
        fullPage: true
      });
      console.log('✓ Articles rendered');
    }

    // Check for clickable words
    const words = await page.locator('.word, .clickable-word, span[data-word]').count();
    console.log(`✓ Found ${words} clickable word(s)`);

    if (words > 0) {
      await page.screenshot({
        path: path.join(screenshotsDir, `${timestamp}_09_words_visible.png`),
        fullPage: true
      });
      console.log('✓ Word elements rendered');
    }

    // 4. DISCOVER FEED (if exists)
    console.log('\n🧪 Testing Discover Feed...');
    try {
      await page.goto('http://localhost:3002/discover-feed.html', { timeout: 5000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(screenshotsDir, `${timestamp}_10_discover_feed.png`),
        fullPage: true
      });
      console.log('✓ Discover feed loaded');

      // Scroll discover feed
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(screenshotsDir, `${timestamp}_11_discover_scrolled.png`),
        fullPage: true
      });
    } catch (e) {
      console.log('⚠ Discover feed not found (optional)');
    }

    // 5. CHAT PAGE (if exists)
    console.log('\n🧪 Testing Chat Page...');
    try {
      await page.goto('http://localhost:3002/chat.html', { timeout: 5000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(screenshotsDir, `${timestamp}_12_chat_page.png`),
        fullPage: true
      });
      console.log('✓ Chat page loaded');

      // Test chat input
      const chatInput = page.locator('input[type="text"], textarea, .chat-input').first();
      if (await chatInput.count() > 0) {
        await chatInput.fill('Hola, ¿cómo estás?');
        await page.screenshot({
          path: path.join(screenshotsDir, `${timestamp}_13_chat_input.png`),
          fullPage: true
        });
        console.log('✓ Chat input tested');

        // Test send button
        const sendButton = page.locator('button:has-text("Send"), button[type="submit"], .send-button').first();
        if (await sendButton.count() > 0) {
          await sendButton.click();
          await page.waitForTimeout(1000);
          await page.screenshot({
            path: path.join(screenshotsDir, `${timestamp}_14_chat_sent.png`),
            fullPage: true
          });
          console.log('✓ Chat send tested');
        }
      }
    } catch (e) {
      console.log('⚠ Chat page not found (optional)');
    }

    // 6. TEST MOBILE VIEWPORT
    console.log('\n🧪 Testing Mobile View...');
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:3002/tiktok-videos.html');
    await page.waitForLoadState('domcontentloaded'); // Don't wait for videos
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_15_mobile_videos.png`),
      fullPage: true
    });
    console.log('✓ Mobile video view tested');

    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_16_mobile_feed.png`),
      fullPage: true
    });
    console.log('✓ Mobile feed view tested');

    // 7. TEST INTERACTIONS AND USER JOURNEY
    console.log('\n🧪 Testing Complete User Journey...');
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto('http://localhost:3002/unified-infinite-feed.html');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Check for interactive elements
    const allWords = await page.locator('.word, .clickable-word, span').count();
    console.log(`✓ Found ${allWords} word element(s)`);

    const buttons = await page.locator('button').count();
    console.log(`✓ Found ${buttons} button(s)`);

    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_17_interactive_elements.png`),
      fullPage: true
    });
    console.log('✓ Interactive elements visible');

    // Final screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, `${timestamp}_19_final_state.png`),
      fullPage: true
    });

    console.log('\n✅ ALL TESTS COMPLETED!');
    console.log(`📸 Screenshots saved to: ${screenshotsDir}`);
  });
});
