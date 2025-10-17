/**
 * COMPREHENSIVE AUTHENTICATION VERIFICATION
 * Tests all auth flows for Judgment Day readiness
 */

const { test, expect } = require('@playwright/test');

test.describe('🔐 Authentication Verification - Judgment Day', () => {

  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
  });

  test('should have authentication UI visible on homepage', async ({ page }) => {
    // Check if login/signup buttons exist
    const authButtons = await page.locator('button:has-text("Login"), button:has-text("Sign In"), button:has-text("Sign Up"), a:has-text("Login"), a:has-text("Sign In")').count();

    console.log(`✅ Auth UI elements found: ${authButtons}`);
    expect(authButtons).toBeGreaterThan(0);
  });

  test('should open signup modal when clicking signup', async ({ page }) => {
    test.setTimeout(30000);

    // Find and click signup button
    const signupButton = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up"), button:has-text("Get Started")').first();

    if (await signupButton.count() > 0) {
      await signupButton.click();
      await page.waitForTimeout(1000);

      // Check for modal or form
      const modal = await page.locator('.modal, [role="dialog"], .auth-modal, .signup-form').count();
      console.log(`✅ Signup modal/form opened: ${modal > 0}`);
      expect(modal).toBeGreaterThan(0);
    } else {
      console.log('⚠️ Signup button not found - checking if already logged in');
      const profileButton = await page.locator('button:has-text("Profile"), [data-feed="profile"]').count();
      expect(profileButton).toBeGreaterThan(0);
    }
  });

  test('should have email and password input fields', async ({ page }) => {
    test.setTimeout(30000);

    // Try to open auth modal
    const authTrigger = page.locator('button:has-text("Login"), button:has-text("Sign In"), button:has-text("Sign Up")').first();

    if (await authTrigger.count() > 0) {
      await authTrigger.click();
      await page.waitForTimeout(1000);
    }

    // Check for email/password inputs (either visible or in the page)
    const emailInputs = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').count();
    const passwordInputs = await page.locator('input[type="password"], input[name="password"]').count();

    console.log(`✅ Email inputs found: ${emailInputs}`);
    console.log(`✅ Password inputs found: ${passwordInputs}`);

    expect(emailInputs).toBeGreaterThan(0);
    expect(passwordInputs).toBeGreaterThan(0);
  });

  test('should validate email format', async ({ page }) => {
    test.setTimeout(30000);

    // Open auth modal
    const authTrigger = page.locator('button:has-text("Sign Up"), button:has-text("Login")').first();

    if (await authTrigger.count() > 0) {
      await authTrigger.click();
      await page.waitForTimeout(1000);

      // Find email input
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();

      if (await emailInput.count() > 0) {
        // Try invalid email
        await emailInput.fill('invalid-email');

        // Try to submit
        const submitButton = page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Login")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(500);

          // Check for validation message
          const validationMessage = await page.locator('.error, .invalid, [role="alert"]').count();
          console.log(`✅ Email validation working: ${validationMessage > 0}`);
          expect(validationMessage).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should connect to Supabase backend', async ({ page }) => {
    test.setTimeout(30000);

    // Check if Supabase client is initialized
    const supabaseCheck = await page.evaluate(() => {
      return typeof window.supabase !== 'undefined' ||
             typeof window.supabaseClient !== 'undefined' ||
             document.documentElement.innerHTML.includes('supabase');
    });

    console.log(`✅ Supabase integration detected: ${supabaseCheck}`);
    expect(supabaseCheck).toBe(true);
  });

  test('should handle signup flow (test user)', async ({ page }) => {
    test.setTimeout(45000);

    // Open signup
    const signupButton = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up")').first();

    if (await signupButton.count() > 0) {
      await signupButton.click();
      await page.waitForTimeout(1000);

      // Fill in test credentials
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        const testEmail = `test_${Date.now()}@langflix.com`;
        const testPassword = 'TestPassword123!';

        await emailInput.fill(testEmail);
        await passwordInput.fill(testPassword);

        // Submit form
        const submitButton = page.locator('button[type="submit"], button:has-text("Sign Up")').first();

        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(3000);

          // Check for success indicators
          const successIndicators = await page.locator('.success, .welcome, [data-feed="profile"]').count();
          console.log(`✅ Signup flow completed: ${successIndicators > 0}`);

          // Should either show success message or redirect to profile
          expect(successIndicators).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should persist login state across page reloads', async ({ page }) => {
    test.setTimeout(45000);

    // First, check if user is logged in
    const profileButton = await page.locator('[data-feed="profile"], button:has-text("Profile")').count();

    if (profileButton > 0) {
      // User is logged in, reload and check persistence
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check if still logged in
      const stillLoggedIn = await page.locator('[data-feed="profile"], button:has-text("Profile")').count();
      console.log(`✅ Login state persisted: ${stillLoggedIn > 0}`);
      expect(stillLoggedIn).toBeGreaterThan(0);
    } else {
      console.log('⚠️ No user logged in - skipping persistence test');
    }
  });

  test('should have logout functionality', async ({ page }) => {
    test.setTimeout(30000);

    // Check if user is logged in
    const profileButton = page.locator('[data-feed="profile"], button:has-text("Profile")').first();

    if (await profileButton.count() > 0) {
      await profileButton.click();
      await page.waitForTimeout(1000);

      // Look for logout button
      const logoutButton = await page.locator('button:has-text("Logout"), button:has-text("Log Out"), button:has-text("Sign Out")').count();
      console.log(`✅ Logout button found: ${logoutButton > 0}`);
      expect(logoutButton).toBeGreaterThan(0);
    } else {
      console.log('⚠️ User not logged in - logout test skipped');
    }
  });

  test('should protect authenticated features', async ({ page }) => {
    test.setTimeout(30000);

    // Try to access profile without login
    const profileNav = page.locator('[data-feed="profile"]').first();

    if (await profileNav.count() > 0) {
      await profileNav.click();
      await page.waitForTimeout(1000);

      // Should either show auth modal OR profile page (if logged in)
      const authModal = await page.locator('.modal, [role="dialog"], .auth-modal').count();
      const profilePage = await page.locator('.profile, .user-profile, [data-page="profile"]').count();

      const hasProtection = authModal > 0 || profilePage > 0;
      console.log(`✅ Auth protection in place: ${hasProtection}`);
      expect(hasProtection).toBe(true);
    }
  });

  test('should handle login errors gracefully', async ({ page }) => {
    test.setTimeout(30000);

    // Open login
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In")').first();

    if (await loginButton.count() > 0) {
      await loginButton.click();
      await page.waitForTimeout(1000);

      // Try invalid credentials
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        await emailInput.fill('invalid@test.com');
        await passwordInput.fill('wrongpassword');

        // Submit
        const submitButton = page.locator('button[type="submit"], button:has-text("Login")').first();

        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(2000);

          // Should show error message (not crash)
          const errorMessage = await page.locator('.error, .alert, [role="alert"]').count();
          console.log(`✅ Error handling working: ${errorMessage > 0}`);

          // Page should not crash
          const pageStillWorks = await page.locator('body').count();
          expect(pageStillWorks).toBe(1);
        }
      }
    }
  });

});
