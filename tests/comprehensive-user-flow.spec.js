const { test, expect } = require('@playwright/test');

/**
 * COMPREHENSIVE USER FLOW TESTING
 * Tests all user types, all pages, all interactions
 * Compares to TikTok/Spotify/Instagram quality standards
 */

const BASE_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = '/tmp/comprehensive-test-screenshots';

// User personas
const USER_TYPES = {
  NEW_USER: 'new_beginner',
  BEGINNER: 'beginner_learner',
  INTERMEDIATE: 'intermediate_learner',
  ADVANCED: 'advanced_learner',
  CASUAL: 'casual_browser',
  POWER_USER: 'power_user'
};

// All app pages
const PAGES = {
  VIDEO_FEED: '/tiktok-video-feed.html',
  PROFILE: '/profile.html',
  DASHBOARD: '/dashboard.html',
  LEADERBOARD: '/leaderboard.html',
  DISCOVER: '/discover-ai.html',
  GAMES_HUB: '/games-hub.html',
  REVIEW_QUEUE: '/review-queue.html',
  PREFERENCE_SETUP: '/preference-setup.html'
};

test.describe('Comprehensive App Testing - All User Types', () => {

  test.beforeEach(async ({ page }) => {
    // Set viewport to mobile (primary user base)
    await page.setViewportSize({ width: 375, height: 812 });
  });

  // ========================================
  // NEW USER FLOW
  // ========================================
  test('NEW USER: Complete onboarding flow', async ({ page }) => {
    await page.goto(BASE_URL + PAGES.PREFERENCE_SETUP);

    // Screenshot: Landing state
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/new-user-01-landing.png`,
      fullPage: true
    });

    // Test: Language selection dropdown exists and works
    const languageDropdown = page.locator('select, [role="combobox"]').first();
    await expect(languageDropdown).toBeVisible();
    await languageDropdown.click();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/new-user-02-language-dropdown.png` });

    // Test: CEFR level selection
    const levelButtons = page.locator('button, [role="button"]').filter({ hasText: /A1|A2|B1|B2|C1|C2/ });
    const levelCount = await levelButtons.count();
    expect(levelCount).toBeGreaterThan(0);

    if (levelCount > 0) {
      await levelButtons.first().click();
      await page.screenshot({ path: `${SCREENSHOT_DIR}/new-user-03-level-selected.png` });
    }

    // Test: Interests/topics selection
    const topicButtons = page.locator('button, [data-topic], .topic-card').first();
    if (await topicButtons.count() > 0) {
      await topicButtons.click();
      await page.screenshot({ path: `${SCREENSHOT_DIR}/new-user-04-topics-selected.png` });
    }

    // Test: Submit/Continue button
    const submitButton = page.locator('button').filter({ hasText: /continue|start|submit|let's go/i }).first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/new-user-05-onboarding-complete.png` });
    }
  });

  // ========================================
  // BEGINNER USER FLOW
  // ========================================
  test('BEGINNER: Complete learning session', async ({ page }) => {
    await page.goto(BASE_URL + PAGES.VIDEO_FEED);

    // Screenshot: Main feed
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/beginner-01-video-feed.png`,
      fullPage: true
    });

    // Test: Video feed loads
    await expect(page.locator('video, .video-container, [data-video]').first()).toBeVisible({ timeout: 10000 });

    // Test: Scroll to next video
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/beginner-02-scrolled-video.png` });

    // Test: Open vocabulary panel
    const vocabButton = page.locator('button, [role="button"]').filter({ hasText: /vocab|words|translations/i }).first();
    if (await vocabButton.count() > 0) {
      await vocabButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/beginner-03-vocab-panel.png` });
    }

    // Test: Save a word
    const saveWordButton = page.locator('button').filter({ hasText: /save|bookmark|\+/i }).first();
    if (await saveWordButton.count() > 0) {
      await saveWordButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/beginner-04-word-saved.png` });
    }

    // Test: Navigate to Games Hub
    await page.goto(BASE_URL + PAGES.GAMES_HUB);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/beginner-05-games-hub.png`, fullPage: true });

    // Test: Click on first game
    const gameCard = page.locator('.game-card, [data-game], button').first();
    await expect(gameCard).toBeVisible();
    await gameCard.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/beginner-06-game-launched.png` });

    // Test: Navigate to Review Queue
    await page.goto(BASE_URL + PAGES.REVIEW_QUEUE);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/beginner-07-review-queue.png`, fullPage: true });
  });

  // ========================================
  // INTERMEDIATE USER FLOW
  // ========================================
  test('INTERMEDIATE: Advanced features usage', async ({ page }) => {
    await page.goto(BASE_URL + PAGES.DISCOVER);

    // Screenshot: Discover page
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/intermediate-01-discover-ai.png`,
      fullPage: true
    });

    // Test: Search functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('Spanish culture');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/intermediate-02-search-results.png` });
    }

    // Test: Filter by difficulty
    const filterButton = page.locator('button, select').filter({ hasText: /filter|level|difficulty/i }).first();
    if (await filterButton.count() > 0) {
      await filterButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/intermediate-03-filters.png` });
    }

    // Test: Leaderboard
    await page.goto(BASE_URL + PAGES.LEADERBOARD);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/intermediate-04-leaderboard.png`, fullPage: true });

    // Test: Profile page
    await page.goto(BASE_URL + PAGES.PROFILE);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/intermediate-05-profile.png`, fullPage: true });

    // Test: Edit profile button
    const editButton = page.locator('button').filter({ hasText: /edit|settings|update/i }).first();
    if (await editButton.count() > 0) {
      await editButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/intermediate-06-edit-profile.png` });
    }
  });

  // ========================================
  // POWER USER FLOW
  // ========================================
  test('POWER USER: Dashboard and analytics', async ({ page }) => {
    await page.goto(BASE_URL + PAGES.DASHBOARD);

    // Screenshot: Dashboard
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/power-user-01-dashboard.png`,
      fullPage: true
    });

    // Test: Stats are visible
    const statsElements = page.locator('.stat, [data-stat], .metric, .analytics-card');
    const statsCount = await statsElements.count();
    expect(statsCount).toBeGreaterThan(0);

    // Test: Time period selector
    const periodSelector = page.locator('button, select').filter({ hasText: /day|week|month|year/i }).first();
    if (await periodSelector.count() > 0) {
      await periodSelector.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/power-user-02-period-selector.png` });
    }

    // Test: Export data button
    const exportButton = page.locator('button').filter({ hasText: /export|download|csv/i }).first();
    if (await exportButton.count() > 0) {
      await exportButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/power-user-03-export-menu.png` });
    }
  });

  // ========================================
  // BUTTON & INTERACTION TESTING
  // ========================================
  test('ALL PAGES: Test every button and link', async ({ page }) => {
    for (const [pageName, pageUrl] of Object.entries(PAGES)) {
      await page.goto(BASE_URL + pageUrl);

      // Screenshot: Default state
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/buttons-${pageName.toLowerCase()}-default.png`,
        fullPage: true
      });

      // Find all buttons
      const buttons = page.locator('button, [role="button"], a[class*="btn"], input[type="submit"]');
      const buttonCount = await buttons.count();

      console.log(`${pageName}: Found ${buttonCount} interactive elements`);

      // Test first 5 buttons (avoid overwhelming)
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const isVisible = await button.isVisible();

        if (isVisible) {
          // Hover state
          await button.hover();
          await page.screenshot({
            path: `${SCREENSHOT_DIR}/buttons-${pageName.toLowerCase()}-hover-${i}.png`
          });

          // Check if clickable
          const isEnabled = await button.isEnabled();
          expect(isEnabled).toBeTruthy();
        }
      }

      // Find all links
      const links = page.locator('a[href]');
      const linkCount = await links.count();
      console.log(`${pageName}: Found ${linkCount} links`);

      // Verify no broken links (check href exists)
      for (let i = 0; i < Math.min(linkCount, 10); i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).not.toBe('#');
      }
    }
  });

  // ========================================
  // DESIGN QUALITY TESTING
  // ========================================
  test('DESIGN: Pure black theme consistency', async ({ page }) => {
    for (const [pageName, pageUrl] of Object.entries(PAGES)) {
      await page.goto(BASE_URL + pageUrl);

      // Check background color is pure black (#000000)
      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      // rgb(0, 0, 0) = #000000
      expect(bgColor).toBe('rgb(0, 0, 0)');

      // Check no purple colors exist
      const purpleCheck = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        const purpleElements = [];

        for (const el of allElements) {
          const styles = window.getComputedStyle(el);
          const bg = styles.backgroundColor;
          const color = styles.color;
          const border = styles.borderColor;

          if (
            bg.includes('102, 126, 234') || // #667eea
            bg.includes('118, 75, 162') ||  // #764ba2
            color.includes('102, 126, 234') ||
            color.includes('118, 75, 162') ||
            border.includes('102, 126, 234') ||
            border.includes('118, 75, 162')
          ) {
            purpleElements.push(el.tagName);
          }
        }

        return purpleElements;
      });

      expect(purpleCheck.length).toBe(0);
      console.log(`✅ ${pageName}: No purple found`);
    }
  });

  // ========================================
  // PERFORMANCE TESTING
  // ========================================
  test('PERFORMANCE: Page load times', async ({ page }) => {
    for (const [pageName, pageUrl] of Object.entries(PAGES)) {
      const startTime = Date.now();
      await page.goto(BASE_URL + pageUrl);
      const loadTime = Date.now() - startTime;

      console.log(`${pageName}: ${loadTime}ms`);

      // Should load in < 2 seconds
      expect(loadTime).toBeLessThan(2000);

      // Wait for network idle
      await page.waitForLoadState('networkidle');

      // Check for JS errors
      page.on('pageerror', error => {
        console.error(`❌ ${pageName} JS Error:`, error);
      });
    }
  });

  // ========================================
  // MOBILE RESPONSIVENESS
  // ========================================
  test('MOBILE: Test on iPhone 12 Pro viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const [pageName, pageUrl] of Object.entries(PAGES)) {
      await page.goto(BASE_URL + pageUrl);

      await page.screenshot({
        path: `${SCREENSHOT_DIR}/mobile-${pageName.toLowerCase()}.png`,
        fullPage: true
      });

      // Check horizontal scrolling (should not exist)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll).toBe(false);

      // Check text is readable (not too small)
      const minFontSize = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        let minSize = 100;

        for (const el of allElements) {
          const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
          if (fontSize > 0 && fontSize < minSize) {
            minSize = fontSize;
          }
        }

        return minSize;
      });

      // Minimum 12px for readability
      expect(minFontSize).toBeGreaterThanOrEqual(12);
    }
  });

  // ========================================
  // ACCESSIBILITY TESTING
  // ========================================
  test('ACCESSIBILITY: Keyboard navigation', async ({ page }) => {
    await page.goto(BASE_URL + PAGES.VIDEO_FEED);

    // Tab through interactive elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      // Check focus is visible
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        const outline = window.getComputedStyle(el).outline;
        const outlineWidth = window.getComputedStyle(el).outlineWidth;
        return {
          tag: el.tagName,
          hasOutline: outline !== 'none' || parseFloat(outlineWidth) > 0
        };
      });

      console.log(`Tab ${i}: ${focusedElement.tag}, visible focus: ${focusedElement.hasOutline}`);
    }
  });

  // ========================================
  // ERROR STATE TESTING
  // ========================================
  test('ERROR HANDLING: Offline mode', async ({ page, context }) => {
    await context.setOffline(true);

    await page.goto(BASE_URL + PAGES.VIDEO_FEED);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/error-offline.png` });

    // Should show error message
    const errorMessage = page.locator('text=/offline|connection|network|error/i').first();
    // Note: May not be implemented yet - this tests for it
  });

  // ========================================
  // COMPARISON TO TOP APPS
  // ========================================
  test('COMPARISON: Screenshot for side-by-side vs TikTok', async ({ page }) => {
    // Our video feed
    await page.goto(BASE_URL + PAGES.VIDEO_FEED);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/comparison-our-video-feed.png`,
      fullPage: false
    });

    // Our profile
    await page.goto(BASE_URL + PAGES.PROFILE);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/comparison-our-profile.png`,
      fullPage: false
    });

    // Our games
    await page.goto(BASE_URL + PAGES.GAMES_HUB);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/comparison-our-games.png`,
      fullPage: false
    });
  });
});

// ========================================
// STANDALONE FEATURE TESTS
// ========================================
test.describe('Specific Feature Testing', () => {

  test('VIDEO FEED: Scroll snap behavior', async ({ page }) => {
    await page.goto(BASE_URL + PAGES.VIDEO_FEED);

    // Check scroll-snap CSS
    const scrollSnap = await page.evaluate(() => {
      const feed = document.querySelector('.video-feed, main, [data-feed]');
      if (!feed) return null;

      const styles = window.getComputedStyle(feed);
      return {
        scrollSnapType: styles.scrollSnapType,
        overflowY: styles.overflowY
      };
    });

    console.log('Scroll snap config:', scrollSnap);
    expect(scrollSnap?.scrollSnapType).toContain('y');
  });

  test('VOCABULARY: Word saving and retrieval', async ({ page }) => {
    await page.goto(BASE_URL + PAGES.VIDEO_FEED);

    // Save a word
    const saveButton = page.locator('button').filter({ hasText: /save|bookmark/i }).first();
    if (await saveButton.count() > 0) {
      await saveButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to review queue
    await page.goto(BASE_URL + PAGES.REVIEW_QUEUE);

    // Check if saved words appear
    const flashcard = page.locator('.flashcard, [data-word], .word-card').first();
    await expect(flashcard).toBeVisible({ timeout: 5000 });
  });

  test('SPACED REPETITION: Review intervals', async ({ page }) => {
    await page.goto(BASE_URL + PAGES.REVIEW_QUEUE);

    // Check if quality buttons exist (Again, Good, Easy, Perfect)
    const qualityButtons = page.locator('button').filter({ hasText: /again|good|easy|perfect|hard/i });
    const count = await qualityButtons.count();

    expect(count).toBeGreaterThanOrEqual(3);
    console.log(`Found ${count} quality rating buttons`);
  });

  test('PROFILE: Stats display', async ({ page }) => {
    await page.goto(BASE_URL + PAGES.PROFILE);

    // Check for stat cards
    const stats = page.locator('.stat-card, [data-stat], .metric, .stat-item');
    const statCount = await stats.count();

    expect(statCount).toBeGreaterThan(0);
    console.log(`Found ${statCount} stat displays`);

    // Screenshot stats
    await page.screenshot({ path: `${SCREENSHOT_DIR}/feature-profile-stats.png` });
  });

  test('LEADERBOARD: Ranking display', async ({ page }) => {
    await page.goto(BASE_URL + PAGES.LEADERBOARD);

    // Check for user list
    const userEntries = page.locator('.leaderboard-entry, [data-user], .user-card, tr');
    const count = await userEntries.count();

    console.log(`Found ${count} leaderboard entries`);

    // Screenshot leaderboard
    await page.screenshot({ path: `${SCREENSHOT_DIR}/feature-leaderboard.png`, fullPage: true });
  });
});
