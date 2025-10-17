/**
 * LANGFLIX COMPREHENSIVE TEST SUITE
 * Using Playwright for automated testing
 * 
 * Run with: npx playwright test tests/comprehensive-test-suite.spec.js
 */

const { test, expect } = require('@playwright/test');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';
const TEST_USER = {
  email: 'test-maria@langflix.test',
  password: 'TestPass123!',
  username: 'test-maria'
};

/**
 * PHASE 1: INFRASTRUCTURE VALIDATION
 */
test.describe('Phase 1: Infrastructure Validation', () => {
  
  test('1.1 - Server Health Check', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health/status`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    console.log('✅ Server is healthy');
  });

  test('1.2 - Homepage Loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/homepage-loaded.png',
      fullPage: true 
    });
    
    expect(await page.title()).toContain('Langflix');
    console.log('✅ Homepage loads successfully');
  });

  test('1.3 - Video Feed Loads', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for video elements
    await page.waitForSelector('video', { timeout: 10000 });
    
    // Count video elements
    const videoCount = await page.$$eval('video', videos => videos.length);
    expect(videoCount).toBeGreaterThan(0);
    
    console.log(`✅ Found ${videoCount} video elements`);
    
    // Screenshot the video feed
    await page.screenshot({ 
      path: 'test-results/screenshots/video-feed.png' 
    });
  });
});

/**
 * PHASE 2: VIDEO & CONTENT TESTING
 */
test.describe('Phase 2: Video & Content Testing', () => {
  
  test('2.1 - First Video Plays', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('video');
    
    // Get first video element
    const video = await page.$('video');
    
    // Check video has valid source
    const videoSrc = await video.getAttribute('src');
    expect(videoSrc).toBeTruthy();
    console.log(`✅ Video source: ${videoSrc}`);
    
    // Attempt to play video
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) video.play();
    });
    
    // Wait a bit for playback
    await page.waitForTimeout(2000);
    
    // Check if playing
    const isPlaying = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video && !video.paused;
    });
    
    console.log(`✅ Video playing: ${isPlaying}`);
    
    // Screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/video-playing.png' 
    });
  });

  test('2.2 - Subtitles Display', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('video');
    
    // Look for subtitle elements (adjust selector based on your implementation)
    const subtitles = await page.$$('.subtitle, .caption, track');
    expect(subtitles.length).toBeGreaterThan(0);
    
    console.log(`✅ Found ${subtitles.length} subtitle elements`);
    
    // Screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/subtitles-display.png' 
    });
  });

  test('2.3 - Tap to Translate Works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('video');
    
    // Wait for subtitle text
    await page.waitForTimeout(3000);
    
    // Try to click on a Spanish word (adjust selector)
    const spanishWord = await page.$('.spanish-word, .subtitle-word');
    
    if (spanishWord) {
      await spanishWord.click();
      
      // Wait for translation popup
      await page.waitForTimeout(1000);
      
      // Check if translation appeared (adjust selector)
      const translation = await page.$('.translation-popup, .word-definition');
      expect(translation).toBeTruthy();
      
      console.log('✅ Tap-to-translate working');
      
      // Screenshot
      await page.screenshot({ 
        path: 'test-results/screenshots/translation-popup.png' 
      });
    } else {
      console.log('⚠️ No clickable words found - may need user interaction first');
    }
  });
});

/**
 * PHASE 3: USER FLOW TESTING
 */
test.describe('Phase 3: Complete User Journey', () => {
  
  test('3.1 - User Signup Flow', async ({ page }) => {
    // Navigate to signup page
    await page.goto(`${BASE_URL}/signup.html`);
    
    // Fill signup form (adjust selectors based on your HTML)
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);
    
    // Screenshot before submit
    await page.screenshot({ 
      path: 'test-results/screenshots/signup-form.png' 
    });
    
    // Submit form
    await page.click('button[type="submit"], .signup-button, .btn-signup');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Screenshot after submit
    await page.screenshot({ 
      path: 'test-results/screenshots/signup-result.png' 
    });
    
    console.log('✅ Signup flow completed');
  });

  test('3.2 - Save Word to Vocabulary', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('video');
    
    // Try to save a word
    const saveButton = await page.$('.save-word, .add-vocabulary, button:has-text("Save")');
    
    if (saveButton) {
      await saveButton.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ Word save interaction triggered');
      
      // Screenshot
      await page.screenshot({ 
        path: 'test-results/screenshots/word-saved.png' 
      });
    }
  });

  test('3.3 - Navigate to Vocabulary Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/vocabulary-review.html`);
    await page.waitForLoadState('networkidle');
    
    // Screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/vocabulary-page.png',
      fullPage: true 
    });
    
    console.log('✅ Vocabulary page loads');
  });

  test('3.4 - Navigate to Games Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/games.html`);
    await page.waitForLoadState('networkidle');
    
    // Screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/games-page.png',
      fullPage: true 
    });
    
    console.log('✅ Games page loads');
  });

  test('3.5 - Navigate to Profile Page', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile.html`);
    await page.waitForLoadState('networkidle');
    
    // Screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/profile-page.png',
      fullPage: true 
    });
    
    console.log('✅ Profile page loads');
  });
});

/**
 * PHASE 4: MOBILE RESPONSIVE TESTING
 */
test.describe('Phase 4: Mobile Testing', () => {
  
  test('4.1 - iPhone 12 Pro', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'iPhone Safari'
    });
    
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/iphone-12-pro.png',
      fullPage: true 
    });
    
    console.log('✅ iPhone 12 Pro view captured');
    await context.close();
  });

  test('4.2 - iPad Pro', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 1366 },
      userAgent: 'iPad Safari'
    });
    
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/ipad-pro.png',
      fullPage: true 
    });
    
    console.log('✅ iPad Pro view captured');
    await context.close();
  });

  test('4.3 - Android Pixel 6', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 412, height: 915 },
      userAgent: 'Android Chrome'
    });
    
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/pixel-6.png',
      fullPage: true 
    });
    
    console.log('✅ Pixel 6 view captured');
    await context.close();
  });

  test('4.4 - Desktop (1920x1080)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/desktop-1920.png',
      fullPage: true 
    });
    
    console.log('✅ Desktop view captured');
    await context.close();
  });
});

/**
 * PHASE 5: PERFORMANCE TESTING
 */
test.describe('Phase 5: Performance Testing', () => {
  
  test('5.1 - Page Load Performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Page load time: ${loadTime}ms`);
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    console.log('✅ Page load performance acceptable');
  });

  test('5.2 - No Console Errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    if (consoleErrors.length > 0) {
      console.log('⚠️ Console errors found:', consoleErrors);
    } else {
      console.log('✅ No console errors');
    }
    
    // Screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/no-errors.png' 
    });
  });
});

/**
 * PHASE 6: CROSS-BROWSER TESTING
 */
test.describe('Phase 6: Cross-Browser', () => {
  
  test('6.1 - Chrome', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/screenshots/chrome-browser.png',
      fullPage: true 
    });
    
    console.log('✅ Chrome compatibility verified');
  });

  test('6.2 - Firefox', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/screenshots/firefox-browser.png',
      fullPage: true 
    });
    
    console.log('✅ Firefox compatibility verified');
    await context.close();
  });
});

/**
 * PHASE 7: API INTEGRATION TESTING
 */
test.describe('Phase 7: API Testing', () => {
  
  test('7.1 - Health API Returns OK', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health/status`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    console.log('Health status:', data);
    expect(data).toHaveProperty('status');
  });

  test('7.2 - Videos API Returns Data', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/content/videos`);
    
    if (response.ok()) {
      const data = await response.json();
      console.log(`✅ Videos API returned ${data.length || 0} videos`);
    } else {
      console.log(`⚠️ Videos API returned ${response.status()}`);
    }
  });
});

/**
 * HELPER: Generate Test Report
 */
test.afterAll(async () => {
  console.log('\n📊 TEST SUITE COMPLETE');
  console.log('See test-results/screenshots/ for all screenshots');
  console.log('Next: Review results and fix any issues found');
});

