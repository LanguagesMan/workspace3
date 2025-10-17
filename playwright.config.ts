import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // Parallel execution (disabled in CI for consistency)
  fullyParallel: process.env.CI ? false : true,
  
  // Retries
  retries: process.env.CI ? 2 : 0,
  
  // Workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: process.env.CI ? [['html'], ['list']] : 'list',
  
  // Test timeout
  timeout: 30000,
  
  // Global setup/teardown
  globalSetup: process.env.CI ? './scripts/seed-test-data.js' : undefined,
  
  use: {
    // Base URL
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    
    // Trace on failure
    trace: 'retain-on-failure',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Fixed viewport for visual tests (if enabled)
    viewport: process.env.FIXED_VIEWPORT === 'true' 
      ? { width: 1280, height: 720 } 
      : null,
    
    // Disable animations in test mode
    actionTimeout: 10000,
  },
  
  // Projects (test suites)
  projects: [
    {
      name: 'smoke',
      testMatch: /smoke\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'visual',
      testMatch: /visual\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }, // Fixed for visual tests
      },
    },
    {
      name: 'functional',
      testMatch: /(?!smoke|visual).*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  
  // Web server (auto-start in CI)
  webServer: process.env.CI ? {
    command: 'NODE_ENV=test FIXED_VIEWPORT=true DISABLE_ANIMATIONS=true npm start',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    timeout: 120000,
    reuseExistingServer: false,
  } : undefined,
});
