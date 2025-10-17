/**
 * 🔍 COMPREHENSIVE ERROR TRACKING
 * 
 * Enhanced error tracking with Sentry, performance monitoring, and alerting
 * Following AGENT 5 requirements
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const { createLogger } = require('./logger');

const logger = createLogger('ErrorTracking');

class ErrorTrackingService {
    constructor() {
        this.isInitialized = false;
        this.performanceMetrics = new Map();
        this.errorCounts = new Map();
        this.alertThreshold = 10; // errors per hour
        this.lastAlertTime = new Map();
    }

    /**
     * Initialize comprehensive error tracking
     */
    initialize() {
        const dsn = process.env.SENTRY_DSN;
        
        if (!dsn) {
            logger.warn('Sentry not configured (SENTRY_DSN not set)');
            return false;
        }

        try {
            const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
            const tracesSampleRate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1');
            const profilesSampleRate = parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1');

            Sentry.init({
                dsn,
                environment,
                
                // Performance monitoring
                tracesSampleRate,
                profilesSampleRate,
                
                // Integrations
                integrations: [
                    new ProfilingIntegration(),
                    new Sentry.Integrations.Http({ tracing: true }),
                    new Sentry.Integrations.OnUncaughtException(),
                    new Sentry.Integrations.OnUnhandledRejection(),
                ],
                
                // Release tracking
                release: process.env.VERCEL_GIT_COMMIT_SHA || 'local-dev',
                
                // Enhanced filtering
                beforeSend: this.beforeSend.bind(this),
                
                // Ignore specific errors
                ignoreErrors: [
                    'ResizeObserver loop limit exceeded',
                    'Non-Error promise rejection captured',
                    'Too Many Requests',
                    'NetworkError',
                    'Network request failed',
                    'Failed to fetch',
                ],
            });

            this.isInitialized = true;
            logger.info(`Sentry initialized (environment: ${environment})`);
            
            // Start error monitoring
            this.startErrorMonitoring();
            
            return true;
        } catch (error) {
            logger.error('Sentry initialization failed:', error);
            return false;
        }
    }

    /**
     * Filter and enrich errors before sending to Sentry
     */
    beforeSend(event, hint) {
        // Remove sensitive data
        if (event.breadcrumbs) {
            event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
                if (breadcrumb.data?.headers) {
                    delete breadcrumb.data.headers.authorization;
                    delete breadcrumb.data.headers.cookie;
                    delete breadcrumb.data.headers['x-api-key'];
                }
                return breadcrumb;
            });
        }

        if (event.request) {
            if (event.request.headers) {
                delete event.request.headers.authorization;
                delete event.request.headers.cookie;
                delete event.request.headers['x-api-key'];
            }
            if (event.request.data && typeof event.request.data === 'object') {
                delete event.request.data.password;
                delete event.request.data.passwordHash;
                delete event.request.data.token;
                delete event.request.data.apiKey;
            }
        }

        // Add custom context
        const error = hint?.originalException;
        if (error) {
            event.contexts = {
                ...event.contexts,
                custom: {
                    errorType: error.constructor?.name,
                    errorCode: error.code,
                    errorStatus: error.status,
                }
            };
        }

        return event;
    }

    /**
     * Start error monitoring and alerting
     */
    startErrorMonitoring() {
        // Reset error counts every hour
        setInterval(() => {
            this.errorCounts.clear();
        }, 60 * 60 * 1000);
    }

    /**
     * Capture JavaScript error
     */
    captureJavaScriptError(error, context = {}) {
        if (!this.isInitialized) {
            logger.error('JavaScript Error:', error);
            return;
        }

        try {
            Sentry.captureException(error, {
                tags: { type: 'javascript' },
                extra: context,
                level: 'error'
            });

            this.trackErrorCount('javascript');
        } catch (e) {
            logger.error('Failed to capture JS error:', e);
        }
    }

    /**
     * Capture API error
     */
    captureAPIError(error, request = {}, context = {}) {
        if (!this.isInitialized) {
            logger.error('API Error:', error);
            return;
        }

        try {
            Sentry.captureException(error, {
                tags: {
                    type: 'api',
                    endpoint: request.path,
                    method: request.method
                },
                extra: {
                    ...context,
                    statusCode: error.status || error.statusCode,
                    requestBody: request.body,
                    requestQuery: request.query
                },
                level: 'error'
            });

            this.trackErrorCount('api');
        } catch (e) {
            logger.error('Failed to capture API error:', e);
        }
    }

    /**
     * Capture database error
     */
    captureDatabaseError(error, query = '', context = {}) {
        if (!this.isInitialized) {
            logger.error('Database Error:', error);
            return;
        }

        try {
            Sentry.captureException(error, {
                tags: { type: 'database' },
                extra: {
                    ...context,
                    query: query.substring(0, 1000), // Limit query length
                },
                level: 'error'
            });

            this.trackErrorCount('database');
        } catch (e) {
            logger.error('Failed to capture DB error:', e);
        }
    }

    /**
     * Capture payment error
     */
    capturePaymentError(error, context = {}) {
        if (!this.isInitialized) {
            logger.error('Payment Error:', error);
            return;
        }

        try {
            Sentry.captureException(error, {
                tags: { type: 'payment' },
                extra: context,
                level: 'error'
            });

            this.trackErrorCount('payment');
            
            // Payment errors are critical - always alert
            this.sendAlert('payment', error.message);
        } catch (e) {
            logger.error('Failed to capture payment error:', e);
        }
    }

    /**
     * Track error counts for alerting
     */
    trackErrorCount(type) {
        const count = (this.errorCounts.get(type) || 0) + 1;
        this.errorCounts.set(type, count);

        // Check if threshold exceeded
        if (count >= this.alertThreshold) {
            const lastAlert = this.lastAlertTime.get(type) || 0;
            const now = Date.now();
            
            // Only alert once per hour per type
            if (now - lastAlert > 60 * 60 * 1000) {
                this.sendAlert(type, `${count} ${type} errors in the last hour`);
                this.lastAlertTime.set(type, now);
            }
        }
    }

    /**
     * Send alert (email/Slack notification via Sentry)
     */
    sendAlert(type, message) {
        if (!this.isInitialized) return;

        try {
            Sentry.captureMessage(`ALERT: ${message}`, {
                level: 'fatal',
                tags: { alert: true, type }
            });
            
            logger.error(`ALERT: ${message}`);
        } catch (e) {
            logger.error('Failed to send alert:', e);
        }
    }

    /**
     * Track API response time
     */
    trackAPIResponseTime(endpoint, method, duration) {
        const key = `${method}:${endpoint}`;
        
        if (!this.performanceMetrics.has(key)) {
            this.performanceMetrics.set(key, []);
        }
        
        const metrics = this.performanceMetrics.get(key);
        metrics.push(duration);
        
        // Keep only last 100 measurements
        if (metrics.length > 100) {
            metrics.shift();
        }

        // Alert if response time is consistently slow
        if (metrics.length >= 10) {
            const avg = metrics.reduce((a, b) => a + b, 0) / metrics.length;
            if (avg > 5000) { // 5 seconds
                logger.warn(`Slow API endpoint: ${key} (avg: ${avg}ms)`);
            }
        }
    }

    /**
     * Monitor slow database queries
     */
    trackDatabaseQueryTime(query, duration) {
        if (duration > 1000) { // Slower than 1 second
            if (this.isInitialized) {
                Sentry.captureMessage(`Slow database query: ${duration}ms`, {
                    level: 'warning',
                    extra: {
                        query: query.substring(0, 500),
                        duration
                    }
                });
            }
            logger.warn(`Slow database query: ${duration}ms`);
        }
    }

    /**
     * Monitor video playback performance
     */
    trackVideoPlaybackIssue(videoId, issue, context = {}) {
        if (!this.isInitialized) return;

        try {
            Sentry.captureMessage(`Video playback issue: ${issue}`, {
                level: 'warning',
                tags: { type: 'video_playback' },
                extra: {
                    videoId,
                    ...context
                }
            });
        } catch (e) {
            logger.error('Failed to track video playback issue:', e);
        }
    }

    /**
     * Set user context
     */
    setUser(user) {
        if (!this.isInitialized) return;

        try {
            Sentry.setUser({
                id: user.id,
                email: user.email,
                username: user.username,
                level: user.currentLevel
            });
        } catch (e) {
            logger.error('Failed to set user context:', e);
        }
    }

    /**
     * Clear user context
     */
    clearUser() {
        if (!this.isInitialized) return;

        try {
            Sentry.setUser(null);
        } catch (e) {
            logger.error('Failed to clear user context:', e);
        }
    }

    /**
     * Add breadcrumb for debugging
     */
    addBreadcrumb(message, category, data = {}) {
        if (!this.isInitialized) return;

        try {
            Sentry.addBreadcrumb({
                message,
                category,
                data,
                level: 'info',
                timestamp: Date.now() / 1000
            });
        } catch (e) {
            logger.error('Failed to add breadcrumb:', e);
        }
    }

    /**
     * Start transaction for performance monitoring
     */
    startTransaction(name, op = 'http.server') {
        if (!this.isInitialized) {
            return {
                finish: () => {},
                setStatus: () => {},
                setData: () => {}
            };
        }

        try {
            return Sentry.startTransaction({ name, op });
        } catch (e) {
            logger.error('Failed to start transaction:', e);
            return {
                finish: () => {},
                setStatus: () => {},
                setData: () => {}
            };
        }
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const metrics = {};
        
        for (const [key, durations] of this.performanceMetrics.entries()) {
            const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
            const max = Math.max(...durations);
            const min = Math.min(...durations);
            
            metrics[key] = {
                average: Math.round(avg),
                max,
                min,
                count: durations.length
            };
        }
        
        return metrics;
    }

    /**
     * Get error summary
     */
    getErrorSummary() {
        const summary = {};
        
        for (const [type, count] of this.errorCounts.entries()) {
            summary[type] = count;
        }
        
        return summary;
    }
}

// Export singleton instance
module.exports = new ErrorTrackingService();

