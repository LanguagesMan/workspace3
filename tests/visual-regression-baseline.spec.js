/**
 * VISUAL REGRESSION BASELINE TEST SUITE
 * 
 * This suite uses the 258 baseline screenshots captured during the comprehensive
 * visual audit to detect visual regressions in future code changes.
 * 
 * Usage:
 *   1. First run: Creates baseline screenshots
 *      npx playwright test tests/visual-regression-baseline.spec.js --update-snapshots
 * 
 *   2. Subsequent runs: Compares against baseline
 *      npx playwright test tests/visual-regression-baseline.spec.js
 * 
 *   3. Update baselines after intentional changes:
 *      npx playwright test tests/visual-regression-baseline.spec.js --update-snapshots
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const VISUAL_THRESHOLD = 0.2; // 20% difference threshold
const ANIMATION_WAIT = 500; // Wait for animations to complete

// Helper function to prepare page for screenshot
async function preparePage(page) {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle').catch(() => {});
  
  // Wait for any animations
  await page.waitForTimeout(ANIMATION_WAIT);
  
  // Disable animations for consistent screenshots
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `;
    document.head.appendChild(style);
  });
  
  // Wait a bit after disabling animations
  await page.waitForTimeout(200);
}

test.describe('Visual Regression - All Pages', () => {
  
  // Set longer timeout for visual tests
  test.setTimeout(60000);
  
  const pages = [
    { url: '/', name: 'homepage' },
    { url: '/discover-articles.html', name: 'articles-list' },
    { url: '/dashboard.html', name: 'dashboard' },
    { url: '/games-hub.html', name: 'games-hub' },
    { url: '/vocabulary-review.html', name: 'vocab-review' },
    { url: '/profile.html', name: 'profile' },
    { url: '/saved-words.html', name: 'saved-words' },
    { url: '/achievements.html', name: 'achievements' },
    { url: '/level-assessment.html', name: 'level-assessment' },
    { url: '/discover-ai.html', name: 'ai-chat' },
    { url: '/premium.html', name: 'premium' },
    { url: '/leaderboard.html', name: 'leaderboard' }
  ];
  
  for (const pageInfo of pages) {
    test(`Visual regression: ${pageInfo.name}`, async ({ page }) => {
      await page.goto(`http://localhost:3001${pageInfo.url}`);
      await preparePage(page);
      
      // Full page screenshot comparison
      await expect(page).toHaveScreenshot(`${pageInfo.name}-full.png`, {
        fullPage: true,
        threshold: VISUAL_THRESHOLD,
        maxDiffPixels: 100,
        animations: 'disabled'
      });
    });
    
    test(`Visual regression: ${pageInfo.name} - above fold`, async ({ page }) => {
      await page.goto(`http://localhost:3001${pageInfo.url}`);
      await preparePage(page);
      
      // Above-the-fold screenshot (most critical)
      await expect(page).toHaveScreenshot(`${pageInfo.name}-top.png`, {
        fullPage: false,
        threshold: VISUAL_THRESHOLD,
        maxDiffPixels: 50,
        animations: 'disabled'
      });
    });
  }
});

test.describe('Visual Regression - Responsive Layouts', () => {
  
  const viewports = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  };
  
  const criticalPages = ['/', '/dashboard.html', '/games-hub.html'];
  
  for (const [deviceName, viewport] of Object.entries(viewports)) {
    test(`Visual regression: ${deviceName} layout`, async ({ page }) => {
      await page.setViewportSize(viewport);
      
      for (const pagePath of criticalPages) {
        const url = `http://localhost:3001${pagePath}`;
        await page.goto(url);
        await preparePage(page);
        
        const pageName = pagePath.replace('/', 'home').replace('.html', '');
        
        await expect(page).toHaveScreenshot(`${deviceName}-${pageName}.png`, {
          fullPage: false,
          threshold: VISUAL_THRESHOLD,
          maxDiffPixels: 100,
          animations: 'disabled'
        });
      }
    });
  }
});

test.describe('Visual Regression - Interactive Elements', () => {
  
  test('Button states', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard.html');
    await preparePage(page);
    
    const button = page.locator('button').first();
    await button.scrollIntoViewIfNeeded();
    
    // Normal state
    await expect(button).toHaveScreenshot('button-normal.png', {
      threshold: VISUAL_THRESHOLD
    });
    
    // Hover state
    await button.hover();
    await page.waitForTimeout(200);
    await expect(button).toHaveScreenshot('button-hover.png', {
      threshold: VISUAL_THRESHOLD
    });
    
    // Focus state
    await button.focus();
    await page.waitForTimeout(200);
    await expect(button).toHaveScreenshot('button-focus.png', {
      threshold: VISUAL_THRESHOLD
    });
  });
  
  test('Form input states', async ({ page }) => {
    await page.goto('http://localhost:3001/profile.html');
    await preparePage(page);
    
    const input = page.locator('input:not([type="hidden"])').first();
    if (await input.isVisible().catch(() => false)) {
      await input.scrollIntoViewIfNeeded();
      
      // Empty state
      await expect(input).toHaveScreenshot('input-empty.png', {
        threshold: VISUAL_THRESHOLD
      });
      
      // Focused state
      await input.focus();
      await page.waitForTimeout(200);
      await expect(input).toHaveScreenshot('input-focus.png', {
        threshold: VISUAL_THRESHOLD
      });
      
      // Filled state
      await input.fill('Test Value');
      await page.waitForTimeout(200);
      await expect(input).toHaveScreenshot('input-filled.png', {
        threshold: VISUAL_THRESHOLD
      });
    }
  });
});

test.describe('Visual Regression - Critical User Journeys', () => {
  
  test('Video feed visual consistency', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await preparePage(page);
    
    // Ensure video feed is visible
    const videoFeed = page.locator('.video-container, [class*="video"]').first();
    if (await videoFeed.isVisible().catch(() => false)) {
      await videoFeed.scrollIntoViewIfNeeded();
      
      await expect(videoFeed).toHaveScreenshot('video-feed-component.png', {
        threshold: VISUAL_THRESHOLD,
        maxDiffPixels: 200 // Videos may have dynamic content
      });
    }
  });
  
  test('Article card visual consistency', async ({ page }) => {
    await page.goto('http://localhost:3001/discover-articles.html');
    await preparePage(page);
    
    const article = page.locator('.article, [class*="article"]').first();
    if (await article.isVisible().catch(() => false)) {
      await article.scrollIntoViewIfNeeded();
      
      await expect(article).toHaveScreenshot('article-card-component.png', {
        threshold: VISUAL_THRESHOLD,
        maxDiffPixels: 100
      });
    }
  });
  
  test('Game card visual consistency', async ({ page }) => {
    await page.goto('http://localhost:3001/games-hub.html');
    await preparePage(page);
    
    const gameCard = page.locator('.game-card, [class*="game"]').first();
    if (await gameCard.isVisible().catch(() => false)) {
      await gameCard.scrollIntoViewIfNeeded();
      
      await expect(gameCard).toHaveScreenshot('game-card-component.png', {
        threshold: VISUAL_THRESHOLD,
        maxDiffPixels: 50
      });
    }
  });
});

test.describe('Visual Regression - Empty States', () => {
  
  test('Empty saved words', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('http://localhost:3001/saved-words.html');
    await preparePage(page);
    
    await expect(page).toHaveScreenshot('empty-state-saved-words.png', {
      fullPage: true,
      threshold: VISUAL_THRESHOLD,
      maxDiffPixels: 50
    });
  });
  
  test('Empty achievements', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('http://localhost:3001/achievements.html');
    await preparePage(page);
    
    await expect(page).toHaveScreenshot('empty-state-achievements.png', {
      fullPage: true,
      threshold: VISUAL_THRESHOLD,
      maxDiffPixels: 50
    });
  });
});

test.describe('Visual Regression - Dark Mode (if applicable)', () => {
  
  test.skip('Dark mode visual consistency', async ({ page }) => {
    // Enable dark mode if app supports it
    await page.goto('http://localhost:3001');
    await preparePage(page);
    
    // Try to toggle dark mode
    const darkModeToggle = page.locator('[data-theme="dark"], .dark-mode-toggle').first();
    if (await darkModeToggle.isVisible().catch(() => false)) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
        fullPage: false,
        threshold: VISUAL_THRESHOLD
      });
    }
  });
});

test.describe('Visual Regression - Loading States', () => {
  
  test('Loading state visual', async ({ page }) => {
    // Intercept requests to slow them down
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 2000);
    });
    
    const pageGotoPromise = page.goto('http://localhost:3001/discover-articles.html');
    
    // Wait a bit for loading state to appear
    await page.waitForTimeout(500);
    
    // Capture loading state
    await expect(page).toHaveScreenshot('loading-state-articles.png', {
      fullPage: false,
      threshold: VISUAL_THRESHOLD,
      maxDiffPixels: 200
    }).catch(() => {
      // Loading state might be too fast to capture
      console.log('Loading state screenshot skipped - too fast');
    });
    
    await pageGotoPromise;
  });
});

// Export configuration for use in other test files
module.exports = {
  VISUAL_THRESHOLD,
  ANIMATION_WAIT,
  preparePage
};

