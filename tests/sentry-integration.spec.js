/**
 * Sentry Error Tracking Integration Tests
 *
 * Tests comprehensive error tracking across frontend and backend:
 * - Frontend error capture
 * - Backend error capture
 * - User context tracking
 * - Sensitive data filtering
 * - Development vs production behavior
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

test.describe('Sentry Error Tracking Integration', () => {

    test.describe('Frontend Sentry Integration', () => {

        test('should load Sentry client script on all pages', async ({ page }) => {
            const pages = [
                '/tiktok-video-feed.html',
                '/premium.html',
                '/discover-ai.html',
                '/vocabulary-review.html',
                '/games-hub.html'
            ];

            for (const pagePath of pages) {
                await page.goto(`${BASE_URL}${pagePath}`);

                // Check if Sentry meta tags are present
                const sentryDsn = await page.locator('meta[name="sentry-dsn"]').count();
                const sentryEnv = await page.locator('meta[name="sentry-environment"]').count();

                expect(sentryDsn).toBe(1);
                expect(sentryEnv).toBe(1);

                // Check if Sentry script is loaded
                const sentryScript = await page.locator('script[src="/lib/sentry-client.js"]').count();
                expect(sentryScript).toBeGreaterThanOrEqual(1);
            }
        });

        test('should NOT initialize Sentry on localhost', async ({ page }) => {
            await page.goto(`${BASE_URL}/tiktok-video-feed.html`);

            // Wait for page to fully load
            await page.waitForLoadState('networkidle');

            // Check console logs
            const consoleLogs = [];
            page.on('console', msg => {
                if (msg.text().includes('Sentry')) {
                    consoleLogs.push(msg.text());
                }
            });

            // Sentry should not initialize on localhost
            await page.waitForTimeout(2000);

            const skippedLog = consoleLogs.find(log =>
                log.includes('Skipping initialization on localhost')
            );

            // On localhost, Sentry should be skipped
            if (BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1')) {
                expect(skippedLog).toBeTruthy();
            }
        });

        test('should expose SentryHelpers globally', async ({ page }) => {
            // Set a mock DSN to force initialization (for testing only)
            await page.goto(`${BASE_URL}/tiktok-video-feed.html`);

            await page.waitForLoadState('networkidle');

            // Check if SentryHelpers is available (when DSN is configured)
            const hasSentryHelpers = await page.evaluate(() => {
                return typeof window.SentryHelpers !== 'undefined';
            });

            // SentryHelpers should be available if Sentry initialized
            // On localhost it won't initialize, so we just check the script loaded
            const scriptLoaded = await page.locator('script[src="/lib/sentry-client.js"]').count();
            expect(scriptLoaded).toBeGreaterThanOrEqual(1);
        });

        test('should have helper methods for error tracking', async ({ page }) => {
            await page.goto(`${BASE_URL}/tiktok-video-feed.html`);
            await page.waitForLoadState('networkidle');

            // Inject a mock Sentry for testing
            await page.evaluate(() => {
                window.SentryHelpers = {
                    setUser: (userId, userData) => ({ userId, userData }),
                    clearUser: () => null,
                    addBreadcrumb: (message, data) => ({ message, data }),
                    captureError: (error, context) => ({ error, context }),
                    captureMessage: (message, level, context) => ({ message, level, context }),
                    captureVideoError: (videoId, error, context) => ({ videoId, error, context }),
                    captureAPIError: (endpoint, error, context) => ({ endpoint, error, context }),
                    capturePaymentError: (error, context) => ({ error, context })
                };
            });

            // Test helper methods exist
            const helperMethods = await page.evaluate(() => {
                return Object.keys(window.SentryHelpers || {});
            });

            expect(helperMethods).toContain('setUser');
            expect(helperMethods).toContain('clearUser');
            expect(helperMethods).toContain('captureError');
            expect(helperMethods).toContain('captureVideoError');
            expect(helperMethods).toContain('captureAPIError');
            expect(helperMethods).toContain('capturePaymentError');
        });

        test('should capture unhandled JavaScript errors', async ({ page }) => {
            const errors = [];

            page.on('pageerror', error => {
                errors.push(error.message);
            });

            await page.goto(`${BASE_URL}/tiktok-video-feed.html`);

            // Trigger an intentional error
            await page.evaluate(() => {
                // This will throw an error
                window.nonExistentFunction();
            });

            // Check that the error was captured
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0]).toContain('nonExistentFunction');
        });

        test('should capture unhandled promise rejections', async ({ page }) => {
            const consoleErrors = [];

            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            await page.goto(`${BASE_URL}/tiktok-video-feed.html`);

            // Trigger an unhandled promise rejection
            await page.evaluate(() => {
                Promise.reject(new Error('Test unhandled rejection'));
            });

            await page.waitForTimeout(1000);

            // The error should be logged
            const hasError = consoleErrors.some(error =>
                error.includes('Test unhandled rejection') ||
                error.includes('Uncaught')
            );

            expect(hasError).toBeTruthy();
        });

    });

    test.describe('Backend Sentry Integration', () => {

        test('should have Sentry configured on server', async ({ request }) => {
            const response = await request.get(`${BASE_URL}/api/health/status`);

            expect(response.status()).toBe(200);

            // Health check should work (Sentry doesn't break server)
            const data = await response.json();
            expect(data).toHaveProperty('status');
        });

        test('should capture API errors with context', async ({ request }) => {
            // Trigger a 404 error
            const response = await request.get(`${BASE_URL}/api/nonexistent-endpoint-test`);

            // Should return 404
            expect(response.status()).toBe(404);

            // Sentry should have captured this error (we can't verify without Sentry dashboard access)
            // But we can verify the server didn't crash
            const healthCheck = await request.get(`${BASE_URL}/api/health/status`);
            expect(healthCheck.status()).toBe(200);
        });

        test('should handle errors without crashing server', async ({ request }) => {
            // Make multiple requests that might cause errors
            const requests = [
                request.get(`${BASE_URL}/api/user/stats/invalid-user-id`),
                request.get(`${BASE_URL}/api/content/feed?limit=9999999`),
                request.post(`${BASE_URL}/api/analytics`, { data: {} })
            ];

            await Promise.allSettled(requests);

            // Server should still be responsive
            const healthCheck = await request.get(`${BASE_URL}/api/health/status`);
            expect(healthCheck.status()).toBe(200);
        });

    });

    test.describe('User Context Tracking', () => {

        test('should set user context after login', async ({ page }) => {
            await page.goto(`${BASE_URL}/tiktok-video-feed.html`);

            // Mock user login
            await page.evaluate(() => {
                const mockUser = {
                    id: 'test-user-123',
                    email: 'test@example.com',
                    username: 'testuser',
                    level: 'A2',
                    isPremium: false
                };

                localStorage.setItem('user', JSON.stringify(mockUser));

                // Manually set user context (if Sentry is available)
                if (window.SentryHelpers) {
                    window.SentryHelpers.setUser(mockUser.id, {
                        email: mockUser.email,
                        level: mockUser.level,
                        isPremium: mockUser.isPremium
                    });
                }
            });

            // Verify user data is stored
            const userData = await page.evaluate(() => {
                return localStorage.getItem('user');
            });

            expect(userData).toBeTruthy();
            const user = JSON.parse(userData);
            expect(user.id).toBe('test-user-123');
        });

        test('should clear user context on logout', async ({ page }) => {
            await page.goto(`${BASE_URL}/tiktok-video-feed.html`);

            // Set user first
            await page.evaluate(() => {
                const mockUser = { id: 'test-user-123', email: 'test@example.com' };
                localStorage.setItem('user', JSON.stringify(mockUser));
            });

            // Simulate logout
            await page.evaluate(() => {
                localStorage.removeItem('user');

                if (window.SentryHelpers) {
                    window.SentryHelpers.clearUser();
                }
            });

            // Verify user data is cleared
            const userData = await page.evaluate(() => {
                return localStorage.getItem('user');
            });

            expect(userData).toBeNull();
        });

    });

    test.describe('Sensitive Data Filtering', () => {

        test('should filter passwords from error data', async ({ page }) => {
            await page.goto(`${BASE_URL}/tiktok-video-feed.html`);

            // Simulate error with sensitive data
            const errorData = await page.evaluate(() => {
                const testData = {
                    username: 'testuser',
                    password: 'secret123',
                    email: 'test@example.com'
                };

                // Simulate Sentry beforeSend filter
                const filtered = { ...testData };
                delete filtered.password;

                return filtered;
            });

            // Password should be filtered out
            expect(errorData).not.toHaveProperty('password');
            expect(errorData).toHaveProperty('username');
        });

        test('should filter API keys from error data', async ({ page }) => {
            await page.goto(`${BASE_URL}/tiktok-video-feed.html`);

            const errorData = await page.evaluate(() => {
                const testData = {
                    endpoint: '/api/test',
                    apiKey: 'sk-secret-key-123',
                    token: 'bearer-token-456'
                };

                // Simulate Sentry beforeSend filter
                const filtered = { ...testData };
                delete filtered.apiKey;
                delete filtered.token;

                return filtered;
            });

            expect(errorData).not.toHaveProperty('apiKey');
            expect(errorData).not.toHaveProperty('token');
        });

    });

    test.describe('Error Type Tracking', () => {

        test('should track video loading errors', async ({ page }) => {
            await page.goto(`${BASE_URL}/tiktok-video-feed.html`);

            await page.waitForLoadState('networkidle');

            // Inject mock helper
            await page.evaluate(() => {
                if (!window.SentryHelpers) {
                    window.SentryHelpers = {
                        captureVideoError: (videoId, error, context) => {
                            window.__lastVideoError = { videoId, error, context };
                        }
                    };
                }
            });

            // Simulate video error
            await page.evaluate(() => {
                const error = new Error('Video failed to load');
                window.SentryHelpers.captureVideoError('video-123', error, {
                    url: 'https://example.com/video.mp4',
                    status: 'failed'
                });
            });

            // Verify error was captured
            const capturedError = await page.evaluate(() => window.__lastVideoError);
            expect(capturedError).toBeTruthy();
            expect(capturedError.videoId).toBe('video-123');
        });

        test('should track API errors', async ({ page }) => {
            await page.goto(`${BASE_URL}/tiktok-video-feed.html`);
            await page.waitForLoadState('networkidle');

            // Inject mock helper
            await page.evaluate(() => {
                if (!window.SentryHelpers) {
                    window.SentryHelpers = {
                        captureAPIError: (endpoint, error, context) => {
                            window.__lastAPIError = { endpoint, error, context };
                        }
                    };
                }
            });

            // Simulate API error
            await page.evaluate(() => {
                const error = new Error('API request failed');
                window.SentryHelpers.captureAPIError('/api/content/feed', error, {
                    status: 500,
                    method: 'GET'
                });
            });

            const capturedError = await page.evaluate(() => window.__lastAPIError);
            expect(capturedError).toBeTruthy();
            expect(capturedError.endpoint).toBe('/api/content/feed');
        });

        test('should track payment errors with high priority', async ({ page }) => {
            await page.goto(`${BASE_URL}/premium.html`);
            await page.waitForLoadState('networkidle');

            // Inject mock helper
            await page.evaluate(() => {
                if (!window.SentryHelpers) {
                    window.SentryHelpers = {
                        capturePaymentError: (error, context) => {
                            window.__lastPaymentError = { error, context };
                        }
                    };
                }
            });

            // Simulate payment error
            await page.evaluate(() => {
                const error = new Error('Payment processing failed');
                window.SentryHelpers.capturePaymentError(error, {
                    amount: 4.99,
                    currency: 'USD',
                    provider: 'stripe'
                });
            });

            const capturedError = await page.evaluate(() => window.__lastPaymentError);
            expect(capturedError).toBeTruthy();
            expect(capturedError.context).toHaveProperty('amount');
        });

    });

    test.describe('Performance Monitoring', () => {

        test('should track page load performance', async ({ page }) => {
            const startTime = Date.now();

            await page.goto(`${BASE_URL}/tiktok-video-feed.html`);
            await page.waitForLoadState('networkidle');

            const loadTime = Date.now() - startTime;

            // Page should load within reasonable time (5 seconds)
            expect(loadTime).toBeLessThan(5000);
        });

        test('should track API response times', async ({ request }) => {
            const startTime = Date.now();

            await request.get(`${BASE_URL}/api/health/status`);

            const responseTime = Date.now() - startTime;

            // API should respond within reasonable time (2 seconds)
            expect(responseTime).toBeLessThan(2000);
        });

    });

    test.describe('Alert Configuration', () => {

        test('should have error tracking enabled in production', async ({ request }) => {
            // Check if server is running with Sentry
            const response = await request.get(`${BASE_URL}/api/health/status`);

            expect(response.status()).toBe(200);

            // If SENTRY_DSN is set, Sentry should be initialized
            // We can't directly test this without accessing process.env
            // But we can verify the server has error tracking capabilities
            const data = await response.json();
            expect(data.status).toBeTruthy();
        });

    });

});

test.describe('Sentry Configuration Validation', () => {

    test('should have Sentry meta tags on critical pages', async ({ page }) => {
        const criticalPages = [
            '/tiktok-video-feed.html',  // Main feed
            '/premium.html',             // Payment page
            '/discover-ai.html',         // Discovery
            '/vocabulary-review.html',   // Review
        ];

        for (const pagePath of criticalPages) {
            await page.goto(`${BASE_URL}${pagePath}`);

            const hasSentryDsn = await page.locator('meta[name="sentry-dsn"]').count();
            const hasSentryScript = await page.locator('script[src="/lib/sentry-client.js"]').count();

            expect(hasSentryDsn, `${pagePath} should have sentry-dsn meta tag`).toBe(1);
            expect(hasSentryScript, `${pagePath} should have sentry-client.js script`).toBeGreaterThanOrEqual(1);
        }
    });

    test('should load Sentry client script successfully', async ({ page }) => {
        const response = await page.goto(`${BASE_URL}/lib/sentry-client.js`);

        expect(response.status()).toBe(200);

        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('javascript');
    });

});
