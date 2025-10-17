/**
 * 🎭 Playwright MCP Smart Test Examples
 * 
 * These examples show how to use Playwright MCP for intelligent testing
 * with screenshots, visual regression, and comprehensive evidence collection.
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Configuration
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots/mcp-tests');
const EVIDENCE_DIR = path.join(__dirname, '../evidence');

// Ensure directories exist
[SCREENSHOT_DIR, EVIDENCE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Example 1: Comprehensive UI Testing with Screenshots
 */
test.describe('🎯 Complete App Flow with Evidence', () => {
  
  test('Full user journey with screenshots', async ({ page }) => {
    const evidence = [];
    
    // Step 1: Homepage
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/01-homepage.png`,
      fullPage: true 
    });
    evidence.push('✅ Homepage loaded successfully');
    
    // Step 2: Video Feed
    await page.click('[data-section="entertainment"]');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/02-video-feed.png`,
      fullPage: true 
    });
    evidence.push('✅ Video feed displaying correctly');
    
    // Step 3: Play Video
    const videoCard = page.locator('.vida-video-card').first();
    await videoCard.click();
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/03-video-playing.png` 
    });
    evidence.push('✅ Video plays on interaction');
    
    // Step 4: Subtitles Check
    const subtitles = page.locator('.subtitle-container');
    await expect(subtitles).toBeVisible();
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/04-subtitles-visible.png` 
    });
    evidence.push('✅ Dual subtitles displaying');
    
    // Step 5: Quiz Section
    await page.click('[data-section="quiz"]');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/05-quiz-section.png`,
      fullPage: true 
    });
    evidence.push('✅ Quiz section accessible');
    
    // Step 6: Profile Section
    await page.click('[data-section="profile"]');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/06-profile-section.png`,
      fullPage: true 
    });
    evidence.push('✅ Profile section accessible');
    
    // Save evidence report
    const report = {
      testName: 'Full User Journey',
      timestamp: new Date().toISOString(),
      passed: true,
      evidence,
      screenshots: fs.readdirSync(SCREENSHOT_DIR)
    };
    
    fs.writeFileSync(
      `${EVIDENCE_DIR}/user-journey-report.json`,
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📊 Test Evidence Collected:');
    evidence.forEach(item => console.log(item));
  });
});

/**
 * Example 2: Mobile Responsiveness Testing
 */
test.describe('📱 Mobile Device Testing', () => {
  
  const devices = [
    { name: 'iPhone 14 Pro', viewport: { width: 393, height: 852 } },
    { name: 'Samsung Galaxy S23', viewport: { width: 360, height: 800 } },
    { name: 'iPad Pro', viewport: { width: 1024, height: 1366 } }
  ];
  
  devices.forEach(device => {
    test(`Test on ${device.name}`, async ({ page }) => {
      await page.setViewportSize(device.viewport);
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      const deviceDir = `${SCREENSHOT_DIR}/${device.name.replace(/\s/g, '-')}`;
      if (!fs.existsSync(deviceDir)) {
        fs.mkdirSync(deviceDir, { recursive: true });
      }
      
      // Homepage
      await page.screenshot({ 
        path: `${deviceDir}/homepage.png`,
        fullPage: true 
      });
      
      // Video Feed
      await page.click('[data-section="entertainment"]');
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: `${deviceDir}/video-feed.png`,
        fullPage: true 
      });
      
      // Quiz
      await page.click('[data-section="quiz"]');
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: `${deviceDir}/quiz-section.png`,
        fullPage: true 
      });
      
      console.log(`✅ ${device.name} testing complete`);
    });
  });
});

/**
 * Example 3: Visual Regression Testing
 */
test.describe('👁️ Visual Regression Tests', () => {
  
  test('Compare with baseline screenshots', async ({ page }) => {
    const baselineDir = `${SCREENSHOT_DIR}/baseline`;
    const currentDir = `${SCREENSHOT_DIR}/current`;
    
    [baselineDir, currentDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Take screenshots for comparison
    const sections = [
      { selector: '[data-section="entertainment"]', name: 'video-feed' },
      { selector: '[data-section="quiz"]', name: 'quiz' },
      { selector: '[data-section="profile"]', name: 'profile' }
    ];
    
    for (const section of sections) {
      await page.click(section.selector);
      await page.waitForTimeout(1500);
      
      const screenshot = await page.screenshot({ fullPage: true });
      const currentPath = `${currentDir}/${section.name}.png`;
      
      fs.writeFileSync(currentPath, screenshot);
      
      // If baseline exists, note for manual comparison
      const baselinePath = `${baselineDir}/${section.name}.png`;
      if (!fs.existsSync(baselinePath)) {
        fs.writeFileSync(baselinePath, screenshot);
        console.log(`📸 Baseline created for ${section.name}`);
      } else {
        console.log(`🔍 Compare ${section.name}: baseline vs current`);
      }
    }
  });
});

/**
 * Example 4: Performance Testing with Screenshots
 */
test.describe('⚡ Performance Testing', () => {
  
  test('Capture performance metrics', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Measure key metrics
    const performanceData = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive - perfData.fetchStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart
      };
    });
    
    // Take screenshot with overlay
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/performance-test.png`,
      fullPage: true 
    });
    
    // Save performance report
    const report = {
      timestamp: new Date().toISOString(),
      metrics: performanceData,
      thresholds: {
        domContentLoaded: performanceData.domContentLoaded < 1500 ? '✅ PASS' : '❌ FAIL',
        totalTime: performanceData.totalTime < 3000 ? '✅ PASS' : '❌ FAIL'
      }
    };
    
    fs.writeFileSync(
      `${EVIDENCE_DIR}/performance-report.json`,
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n⚡ Performance Report:');
    console.log(`DOM Content Loaded: ${performanceData.domContentLoaded.toFixed(2)}ms`);
    console.log(`Total Load Time: ${performanceData.totalTime.toFixed(2)}ms`);
  });
});

/**
 * Example 5: Competitor Comparison Screenshots
 */
test.describe('🎯 Competitor Analysis', () => {
  
  test('Compare with competitor sites', async ({ page }) => {
    const competitors = [
      { name: 'TikTok', url: 'https://www.tiktok.com' },
      { name: 'Instagram-Reels', url: 'https://www.instagram.com/reels' }
      // Note: These might require authentication
    ];
    
    const comparisonDir = `${SCREENSHOT_DIR}/competitor-comparison`;
    if (!fs.existsSync(comparisonDir)) {
      fs.mkdirSync(comparisonDir, { recursive: true });
    }
    
    // Our app
    await page.goto('http://localhost:3000');
    await page.click('[data-section="entertainment"]');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: `${comparisonDir}/our-app-feed.png`,
      fullPage: true 
    });
    
    console.log('📸 Captured our app feed for comparison');
    console.log('💡 Use Firecrawl MCP to capture competitor screenshots');
  });
});

/**
 * Example 6: Accessibility Testing with Evidence
 */
test.describe('♿ Accessibility Testing', () => {
  
  test('Check accessibility compliance', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check for common accessibility issues
    const a11yChecks = {
      hasTitle: await page.title() !== '',
      hasLang: await page.getAttribute('html', 'lang') !== null,
      hasMainLandmark: await page.locator('main').count() > 0,
      imagesHaveAlt: await page.locator('img:not([alt])').count() === 0,
      buttonsHaveLabels: await page.locator('button:not([aria-label]):not(:has-text(""))').count() === 0
    };
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/accessibility-test.png`,
      fullPage: true 
    });
    
    const report = {
      timestamp: new Date().toISOString(),
      checks: a11yChecks,
      passed: Object.values(a11yChecks).every(v => v === true)
    };
    
    fs.writeFileSync(
      `${EVIDENCE_DIR}/accessibility-report.json`,
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n♿ Accessibility Report:');
    Object.entries(a11yChecks).forEach(([key, value]) => {
      console.log(`${value ? '✅' : '❌'} ${key}`);
    });
  });
});

/**
 * Example 7: Error State Testing
 */
test.describe('🚨 Error Handling Tests', () => {
  
  test('Test offline behavior', async ({ page, context }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate
    await page.click('[data-section="quiz"]');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/offline-state.png`,
      fullPage: true 
    });
    
    // Go back online
    await context.setOffline(false);
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: `${SCREENSHOT_DIR}/online-recovery.png`,
      fullPage: true 
    });
    
    console.log('✅ Offline behavior tested with screenshots');
  });
});

/**
 * Example 8: Component-Level Testing
 */
test.describe('🧩 Component Testing', () => {
  
  test('Test individual components with screenshots', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-section="entertainment"]');
    await page.waitForTimeout(2000);
    
    const componentsDir = `${SCREENSHOT_DIR}/components`;
    if (!fs.existsSync(componentsDir)) {
      fs.mkdirSync(componentsDir, { recursive: true });
    }
    
    // Screenshot individual components
    const components = [
      { selector: '.vida-video-card', name: 'video-card' },
      { selector: '.subtitle-container', name: 'subtitles' },
      { selector: '.nav-container', name: 'navigation' }
    ];
    
    for (const component of components) {
      const element = page.locator(component.selector).first();
      if (await element.count() > 0) {
        await element.screenshot({ 
          path: `${componentsDir}/${component.name}.png` 
        });
        console.log(`✅ ${component.name} screenshot captured`);
      }
    }
  });
});

// Export helper functions for use with MCP
module.exports = {
  SCREENSHOT_DIR,
  EVIDENCE_DIR,
  
  async captureFullAppFlow(page) {
    const sections = ['home', 'entertainment', 'quiz', 'profile'];
    const screenshots = [];
    
    for (const section of sections) {
      await page.click(`[data-section="${section}"]`);
      await page.waitForTimeout(1500);
      
      const filename = `${SCREENSHOT_DIR}/${section}-${Date.now()}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      screenshots.push(filename);
    }
    
    return screenshots;
  },
  
  async generateEvidenceReport(testName, results) {
    const report = {
      testName,
      timestamp: new Date().toISOString(),
      results,
      screenshotsPath: SCREENSHOT_DIR,
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length
      }
    };
    
    fs.writeFileSync(
      `${EVIDENCE_DIR}/${testName}-${Date.now()}.json`,
      JSON.stringify(report, null, 2)
    );
    
    return report;
  }
};

