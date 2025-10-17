/**
 * Frontend Sentry Integration for Browser
 * Captures client-side errors, unhandled rejections, and performance metrics
 *
 * Usage: Include this script in the <head> of all HTML pages:
 * <script src="/lib/sentry-client.js"></script>
 */

(function() {
    'use strict';

    // Configuration from meta tags or defaults
    const sentryConfig = {
        dsn: document.querySelector('meta[name="sentry-dsn"]')?.content || null,
        environment: document.querySelector('meta[name="sentry-environment"]')?.content || 'production',
        tracesSampleRate: parseFloat(document.querySelector('meta[name="sentry-traces-sample-rate"]')?.content || '0.1'),
        replaysSessionSampleRate: parseFloat(document.querySelector('meta[name="sentry-replays-session-rate"]')?.content || '0.1'),
        replaysOnErrorSampleRate: parseFloat(document.querySelector('meta[name="sentry-replays-error-rate"]')?.content || '1.0'),
    };

    // Skip initialization if in development or DSN not set
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Sentry: Skipping initialization on localhost');
        return;
    }

    if (!sentryConfig.dsn) {
        console.warn('Sentry: DSN not configured, error tracking disabled');
        return;
    }

    // Load Sentry SDK from CDN
    const sentryScript = document.createElement('script');
    sentryScript.src = 'https://browser.sentry-cdn.com/10.20.0/bundle.min.js';
    sentryScript.crossOrigin = 'anonymous';
    sentryScript.integrity = 'sha384-example'; // Update with actual integrity hash if needed
    sentryScript.async = true;

    sentryScript.onload = function() {
        if (typeof Sentry === 'undefined') {
            console.error('Sentry: Failed to load SDK');
            return;
        }

        // Initialize Sentry
        Sentry.init({
            dsn: sentryConfig.dsn,
            environment: sentryConfig.environment,

            // Performance monitoring
            tracesSampleRate: sentryConfig.tracesSampleRate,

            // Session replay (optional - captures user sessions on errors)
            integrations: [
                // Capture console logs
                new Sentry.Integrations.CaptureConsole({
                    levels: ['error', 'warn']
                }),

                // HTTP breadcrumbs
                new Sentry.Integrations.HttpClient(),

                // Browser tracing
                new Sentry.Integrations.BrowserTracing({
                    tracePropagationTargets: [
                        'localhost',
                        window.location.origin,
                        /^\//
                    ]
                }),
            ],

            // Release tracking (from git commit or version)
            release: document.querySelector('meta[name="app-version"]')?.content || 'unknown',

            // Filter sensitive data
            beforeSend(event, hint) {
                // Don't send errors from browser extensions
                if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
                    frame => frame.filename?.includes('extensions/')
                )) {
                    return null;
                }

                // Don't send ad blocker errors
                if (event.message?.includes('adsbygoogle') ||
                    event.message?.includes('ads.')) {
                    return null;
                }

                // Don't send ResizeObserver errors (browser quirk)
                if (event.message?.includes('ResizeObserver')) {
                    return null;
                }

                // Remove sensitive data from breadcrumbs
                if (event.breadcrumbs) {
                    event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
                        if (breadcrumb.data) {
                            delete breadcrumb.data.password;
                            delete breadcrumb.data.token;
                            delete breadcrumb.data.apiKey;
                        }
                        return breadcrumb;
                    });
                }

                // Remove sensitive request data
                if (event.request?.data) {
                    if (typeof event.request.data === 'object') {
                        delete event.request.data.password;
                        delete event.request.data.passwordHash;
                        delete event.request.data.token;
                        delete event.request.data.apiKey;
                    }
                }

                return event;
            },

            // Ignore specific errors
            ignoreErrors: [
                // Browser quirks
                'ResizeObserver loop limit exceeded',
                'ResizeObserver loop completed with undelivered notifications',

                // Network errors (user's connection issues)
                'NetworkError',
                'Network request failed',
                'Failed to fetch',
                'Load failed',

                // Ad blocker errors
                'adsbygoogle',

                // Extension errors
                'chrome-extension://',
                'moz-extension://',

                // Random noise
                'Non-Error promise rejection captured',
                'Script error',
            ],
        });

        console.log('✅ Sentry initialized (environment: ' + sentryConfig.environment + ')');

        // Make Sentry available globally for manual error capture
        window.Sentry = Sentry;

        // Expose helper functions
        window.SentryHelpers = {
            /**
             * Set user context (call after login)
             */
            setUser(userId, userData = {}) {
                Sentry.setUser({
                    id: userId,
                    ...userData
                });
                console.log('Sentry: User context set', userId);
            },

            /**
             * Clear user context (call on logout)
             */
            clearUser() {
                Sentry.setUser(null);
                console.log('Sentry: User context cleared');
            },

            /**
             * Add breadcrumb for debugging
             */
            addBreadcrumb(message, data = {}) {
                Sentry.addBreadcrumb({
                    message,
                    level: 'info',
                    data
                });
            },

            /**
             * Capture custom error with context
             */
            captureError(error, context = {}) {
                Sentry.captureException(error, {
                    extra: context
                });
                console.error('Sentry: Error captured', error, context);
            },

            /**
             * Capture custom message
             */
            captureMessage(message, level = 'info', context = {}) {
                Sentry.captureMessage(message, {
                    level,
                    extra: context
                });
                console.log('Sentry: Message captured', message, context);
            },

            /**
             * Track video loading error
             */
            captureVideoError(videoId, error, context = {}) {
                Sentry.withScope(scope => {
                    scope.setTag('error_type', 'video_loading');
                    scope.setTag('video_id', videoId);
                    scope.setContext('video', {
                        videoId,
                        ...context
                    });
                    Sentry.captureException(error);
                });
                console.error('Sentry: Video error captured', videoId, error);
            },

            /**
             * Track API error
             */
            captureAPIError(endpoint, error, context = {}) {
                Sentry.withScope(scope => {
                    scope.setTag('error_type', 'api_error');
                    scope.setTag('endpoint', endpoint);
                    scope.setContext('api', {
                        endpoint,
                        ...context
                    });
                    Sentry.captureException(error);
                });
                console.error('Sentry: API error captured', endpoint, error);
            },

            /**
             * Track payment error
             */
            capturePaymentError(error, context = {}) {
                Sentry.withScope(scope => {
                    scope.setTag('error_type', 'payment_error');
                    scope.setLevel('critical');
                    scope.setContext('payment', context);
                    Sentry.captureException(error);
                });
                console.error('Sentry: Payment error captured', error);
            }
        };

        // Auto-track user info from localStorage (if available)
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                if (user.id) {
                    window.SentryHelpers.setUser(user.id, {
                        email: user.email,
                        username: user.username,
                        level: user.level,
                        isPremium: user.isPremium
                    });
                }
            }
        } catch (e) {
            // Silently fail if user data not available
        }

        // Track page navigation
        window.SentryHelpers.addBreadcrumb('Page loaded', {
            url: window.location.href,
            referrer: document.referrer
        });
    };

    sentryScript.onerror = function() {
        console.error('Sentry: Failed to load SDK from CDN');
    };

    // Inject script into page
    document.head.appendChild(sentryScript);

})();
