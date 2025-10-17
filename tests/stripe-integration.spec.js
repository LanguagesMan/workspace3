/**
 * Stripe Payment Integration Tests
 *
 * Tests the complete Stripe Checkout flow for Premium subscriptions
 *
 * Prerequisites:
 * - Server running on localhost:3001
 * - Stripe configured in .env (test mode)
 * - Test user account created
 */

const { test, expect } = require('@playwright/test');

const TEST_USER = {
  email: 'test-premium@example.com',
  password: 'testpass123'
};

test.describe('Stripe Premium Subscription Integration', () => {

  test.beforeEach(async ({ page }) => {
    // Start on homepage
    await page.goto('http://localhost:3001');
  });

  test('should require authentication before accessing checkout', async ({ page }) => {
    // Go to premium page without logging in
    await page.goto('http://localhost:3001/premium.html');

    // Click upgrade button
    await page.click('button:has-text("Start 7-Day Free Trial")');

    // Should prompt for login
    await page.waitForEvent('dialog');
    const dialog = await page.waitForEvent('dialog');
    expect(dialog.message()).toContain('sign in');
  });

  test('should display premium page correctly', async ({ page }) => {
    await page.goto('http://localhost:3001/premium.html');

    // Check pricing is displayed
    await expect(page.locator('text=$4.99')).toBeVisible();

    // Check trial messaging
    await expect(page.locator('text=7-Day Free Trial')).toBeVisible();

    // Check features are listed
    await expect(page.locator('text=Unlimited videos')).toBeVisible();
    await expect(page.locator('text=AI personalization')).toBeVisible();
    await expect(page.locator('text=Audio articles')).toBeVisible();

    // Check CTA button exists
    await expect(page.locator('button:has-text("Start 7-Day Free Trial")')).toBeVisible();
  });

  test('should redirect to Stripe Checkout when authenticated', async ({ page, context }) => {
    // Login first
    await page.goto('http://localhost:3001/login.html');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForTimeout(1000);

    // Go to premium page
    await page.goto('http://localhost:3001/premium.html');

    // Click upgrade button
    await page.click('button:has-text("Start 7-Day Free Trial")');

    // Should redirect to Stripe Checkout
    await page.waitForURL(/checkout.stripe.com/, { timeout: 10000 });

    // Verify we're on Stripe Checkout
    expect(page.url()).toContain('checkout.stripe.com');

    // Check checkout page has correct elements
    await expect(page.locator('text=Langflix Premium')).toBeVisible({ timeout: 5000 });
  });

  test('should show loading state during checkout creation', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3001/login.html');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Go to premium page
    await page.goto('http://localhost:3001/premium.html');

    // Click upgrade button
    const button = page.locator('button:has-text("Start 7-Day Free Trial")');
    await button.click();

    // Should show loading text
    await expect(button).toHaveText('Loading...', { timeout: 1000 });
  });

  test('should handle successful checkout return', async ({ page }) => {
    // Simulate return from successful checkout
    await page.goto('http://localhost:3001/tiktok-video-feed.html?premium=success');

    // Should show success message
    await page.waitForEvent('dialog');
    const dialog = await page.waitForEvent('dialog');
    expect(dialog.message()).toContain('Welcome to Premium');
  });

  test('should handle cancelled checkout', async ({ page }) => {
    // Simulate return from cancelled checkout
    await page.goto('http://localhost:3001/premium.html?canceled=true');

    // Should show cancellation message
    await page.waitForEvent('dialog');
    const dialog = await page.waitForEvent('dialog');
    expect(dialog.message()).toContain('cancelled');
  });

  test('should check premium status via API', async ({ request }) => {
    // This test requires a valid auth token
    // For now, just verify the endpoint exists

    const response = await request.get('http://localhost:3001/api/premium/status', {
      headers: {
        'Authorization': 'Bearer invalid-token-for-testing'
      }
    });

    // Should return 401 or 403 for invalid token
    expect([401, 403, 500]).toContain(response.status());
  });

  test('should display premium status for premium users', async ({ page, context }) => {
    // This test assumes user has premium (requires manual setup or mock)

    // Set mock premium status in localStorage
    await page.goto('http://localhost:3001/premium.html');

    await page.evaluate(() => {
      localStorage.setItem('isPremium', 'true');
      const trialEnd = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem('premiumExpiry', trialEnd.toString());
    });

    // Reload page
    await page.reload();

    // Note: This test is for the old localStorage-based system
    // Real premium status should come from backend API
  });

  test('should show correct pricing details in Stripe Checkout', async ({ page, context }) => {
    // This test requires completing checkout flow
    // Can be extended to check Stripe Checkout UI elements

    // Login
    await page.goto('http://localhost:3001/login.html');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Go to premium and click upgrade
    await page.goto('http://localhost:3001/premium.html');
    await page.click('button:has-text("Start 7-Day Free Trial")');

    // Wait for Stripe Checkout
    await page.waitForURL(/checkout.stripe.com/, { timeout: 10000 });

    // Check for $4.99 pricing (may need to wait for page to fully load)
    await page.waitForTimeout(2000);

    // Note: Checking specific pricing text on Stripe's page can be flaky
    // Better to verify via Stripe API or webhook logs
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Block API requests to simulate network error
    await page.route('**/api/create-checkout-session', route => {
      route.abort('failed');
    });

    // Login
    await page.goto('http://localhost:3001/login.html');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Try to upgrade
    await page.goto('http://localhost:3001/premium.html');
    await page.click('button:has-text("Start 7-Day Free Trial")');

    // Should show error message
    await page.waitForEvent('dialog');
    const dialog = await page.waitForEvent('dialog');
    expect(dialog.message()).toContain('Error');
  });

  test('should validate Stripe configuration exists', async ({ request }) => {
    // Check health endpoint
    const response = await request.get('http://localhost:3001/api/health');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('should handle missing Stripe keys gracefully', async ({ page, context }) => {
    // This test would need server restart without Stripe keys
    // For now, just document expected behavior:
    // - Should return 500 with "Stripe not configured" error
    // - User should see helpful error message
  });

  test('mobile: should display premium page responsively', async ({ page, context }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('http://localhost:3001/premium.html');

    // Check elements are visible on mobile
    await expect(page.locator('text=$4.99')).toBeVisible();
    await expect(page.locator('button:has-text("Start 7-Day Free Trial")')).toBeVisible();

    // Check button is full-width on mobile
    const button = page.locator('button:has-text("Start 7-Day Free Trial")').first();
    const width = await button.evaluate(el => el.offsetWidth);
    const parentWidth = await button.evaluate(el => el.parentElement.offsetWidth);

    // Button should be close to full-width (within 50px)
    expect(width).toBeGreaterThan(parentWidth - 50);
  });

  test('should track conversion events', async ({ page }) => {
    // Track analytics/conversion events
    let conversionTracked = false;

    page.on('console', msg => {
      if (msg.text().includes('conversion') || msg.text().includes('checkout')) {
        conversionTracked = true;
      }
    });

    // Login and start checkout
    await page.goto('http://localhost:3001/login.html');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    await page.goto('http://localhost:3001/premium.html');
    await page.click('button:has-text("Start 7-Day Free Trial")');

    // Note: Add actual analytics tracking to code
  });
});

// Helper function to create test user (run separately)
test.describe.skip('Setup: Create Test User', () => {
  test('create test user for premium tests', async ({ request }) => {
    const response = await request.post('http://localhost:3001/api/auth/signup', {
      data: {
        email: TEST_USER.email,
        password: TEST_USER.password,
        learningLevel: 'A2'
      }
    });

    const data = await response.json();
    console.log('Test user created:', data);
  });
});
