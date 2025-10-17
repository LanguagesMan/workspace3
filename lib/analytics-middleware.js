/**
 * 📊 ANALYTICS MIDDLEWARE
 * 
 * Express middleware for automatic tracking and error monitoring
 */

const mixpanel = require('./mixpanel-analytics');
const errorTracking = require('./comprehensive-error-tracking');
const { createLogger } = require('./logger');

const logger = createLogger('AnalyticsMiddleware');

/**
 * Track API requests automatically
 */
function trackAPIRequest(req, res, next) {
    const startTime = Date.now();
    const userId = req.user?.id || req.session?.userId || 'anonymous';

    // Add breadcrumb for debugging
    errorTracking.addBreadcrumb(
        `${req.method} ${req.path}`,
        'http',
        {
            query: req.query,
            body: req.body?.email ? { ...req.body, password: '[REDACTED]' } : req.body
        }
    );

    // Capture response
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - startTime;
        
        // Track performance
        errorTracking.trackAPIResponseTime(req.path, req.method, duration);

        // Track successful requests
        if (res.statusCode >= 200 && res.statusCode < 400) {
            // Don't track health checks
            if (!req.path.includes('/health') && !req.path.includes('/ping')) {
                mixpanel.track(userId, 'API Request', {
                    endpoint: req.path,
                    method: req.method,
                    statusCode: res.statusCode,
                    duration
                });
            }
        }

        // Track errors
        if (res.statusCode >= 400) {
            const error = new Error(`HTTP ${res.statusCode}: ${req.method} ${req.path}`);
            error.status = res.statusCode;
            errorTracking.captureAPIError(error, req, { duration });
        }

        originalSend.call(this, data);
    };

    next();
}

/**
 * Track user sessions
 */
function trackSession(req, res, next) {
    const userId = req.user?.id || req.session?.userId;
    
    if (userId) {
        // Set user context for error tracking
        errorTracking.setUser({
            id: userId,
            email: req.user?.email,
            username: req.user?.username,
            currentLevel: req.user?.currentLevel
        });

        // Track daily active user
        const lastActive = req.session?.lastActive;
        const now = Date.now();
        
        if (!lastActive || now - lastActive > 24 * 60 * 60 * 1000) {
            mixpanel.trackDailyActive(userId);
        }
        
        req.session.lastActive = now;
    }

    next();
}

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
    const userId = req.user?.id || req.session?.userId || 'anonymous';

    // Log error
    logger.error('Request error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId
    });

    // Track error based on type
    if (err.name === 'DatabaseError' || err.code?.startsWith('P')) {
        errorTracking.captureDatabaseError(err, '', { path: req.path });
    } else {
        errorTracking.captureAPIError(err, req);
    }

    // Track failed event
    mixpanel.track(userId, 'API Error', {
        endpoint: req.path,
        method: req.method,
        error: err.message,
        statusCode: err.status || 500
    });

    // Send response
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        code: err.code,
        path: req.path
    });
}

/**
 * Initialize Sentry middleware
 */
function initializeSentry(app) {
    const Sentry = require('@sentry/node');
    const dsn = process.env.SENTRY_DSN;

    if (!dsn) {
        logger.warn('Sentry not configured - skipping middleware');
        return;
    }

    // Initialize error tracking
    errorTracking.initialize();

    // Request handler must be first
    app.use(Sentry.Handlers.requestHandler());

    // Tracing handler
    app.use(Sentry.Handlers.tracingHandler());

    logger.info('Sentry middleware initialized');
}

/**
 * Add Sentry error handler (must be after all routes)
 */
function addSentryErrorHandler(app) {
    const Sentry = require('@sentry/node');
    
    if (process.env.SENTRY_DSN) {
        app.use(Sentry.Handlers.errorHandler({
            shouldHandleError(error) {
                // Capture 4xx and 5xx errors
                return error.status >= 400;
            }
        }));
    }
}

module.exports = {
    trackAPIRequest,
    trackSession,
    errorHandler,
    initializeSentry,
    addSentryErrorHandler
};

