import { test, expect } from '@playwright/test';
import { writeFileSync, unlinkSync, existsSync } from 'fs';

test.describe('AI Feed Health Check', () => {
  const healthFile = 'autopilot/state/health.ok';

  test('server responds on port 3001 with app-root element', async ({ page }) => {
    const startTime = Date.now();

    try {
      // Navigate to the app
      const response = await page.goto('http://localhost:3001', {
        waitUntil: 'domcontentloaded',
        timeout: 5000
      });

      const loadTime = Date.now() - startTime;

      // Verify server responds with 200
      expect(response?.status()).toBe(200);

      // Verify TTFB is reasonable (< 800ms)
      expect(loadTime).toBeLessThan(800);

      // Wait for and verify app-root element exists and is visible
      const appRoot = page.locator('[data-testid="app-root"]');
      await expect(appRoot).toBeVisible({ timeout: 3000 });

      // Verify the page contains Spanish learning content indicators
      await expect(page.locator('body')).toContainText(/español|spanish/i);

      // Create health check file on success
      writeFileSync(healthFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        status: 'PASS',
        loadTime: loadTime,
        checks: {
          server_response: true,
          app_root_visible: true,
          spanish_content: true,
          ttfb_under_800ms: loadTime < 800
        }
      }));

      console.log(`✅ Health check passed - Load time: ${loadTime}ms`);

    } catch (error) {
      // Delete health file on failure
      if (existsSync(healthFile)) {
        unlinkSync(healthFile);
      }
      throw error;
    }
  });
});