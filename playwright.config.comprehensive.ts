import { defineConfig, devices } from '@playwright/test';

/**
 * Comprehensive Visual Audit Playwright Configuration
 * 
 * This configuration enables exhaustive testing across:
 * - Multiple browsers (Chromium, Firefox, WebKit)
 * - Multiple device viewports
 * - Mobile and desktop devices
 */

export default defineConfig({
  testDir: './tests',
  
  // Run tests in parallel for faster execution
  fullyParallel: true,
  
  // Retries for flaky tests
  retries: 2,
  
  // Use multiple workers for parallel execution
  workers: process.env.CI ? 2 : 4,
  
  // Comprehensive reporting
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  // Extended timeout for comprehensive tests
  timeout: 60000,
  
  // Global timeout
  globalTimeout: 3600000, // 1 hour for full suite
  
  use: {
    // Base URL
    baseURL: 'http://localhost:3001',
    
    // Always capture trace for visual testing
    trace: 'on',
    
    // Always capture screenshots
    screenshot: 'on',
    
    // Always capture video
    video: 'on',
    
    // Action timeout
    actionTimeout: 15000,
    
    // Navigation timeout
    navigationTimeout: 30000,
    
    // Ignore HTTPS errors for testing
    ignoreHTTPSErrors: true,
    
    // Disable animations for consistent screenshots
    reducedMotion: 'reduce',
  },
  
  // Projects for cross-browser and responsive testing
  projects: [
    // ========================================================================
    // DESKTOP BROWSERS
    // ========================================================================
    {
      name: 'chromium-desktop-hd',
      testMatch: /comprehensive-visual-audit\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'chromium-desktop-standard',
      testMatch: /comprehensive-visual-audit\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: 'firefox-desktop',
      testMatch: /comprehensive-visual-audit\.spec\.js/,
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'webkit-desktop',
      testMatch: /comprehensive-visual-audit\.spec\.js/,
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    // ========================================================================
    // MOBILE DEVICES
    // ========================================================================
    {
      name: 'mobile-iphone',
      testMatch: /comprehensive-visual-audit\.spec\.js/,
      use: {
        ...devices['iPhone 13'],
      },
    },
    {
      name: 'mobile-android',
      testMatch: /comprehensive-visual-audit\.spec\.js/,
      use: {
        ...devices['Pixel 5'],
      },
    },
    
    // ========================================================================
    // TABLET DEVICES
    // ========================================================================
    {
      name: 'tablet-ipad',
      testMatch: /comprehensive-visual-audit\.spec\.js/,
      use: {
        ...devices['iPad Pro'],
      },
    },
    {
      name: 'tablet-android',
      testMatch: /comprehensive-visual-audit\.spec\.js/,
      use: {
        ...devices['Galaxy Tab S4'],
      },
    },
  ],
  
  // Web server configuration
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3001',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});


