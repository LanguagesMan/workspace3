/**
 * 🔍 SENTRY ERROR TRACKING CONFIGURATION
 * 
 * Comprehensive error tracking and performance monitoring with Sentry
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry
 */
function initializeSentry() {
    const dsn = process.env.SENTRY_DSN;
    
    // Skip if Sentry not configured
    if (!dsn) {
        console.warn('⚠️  Sentry not configured (SENTRY_DSN not set)');
        return null;
    }
    
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
            // Profiling
            new ProfilingIntegration(),
            
            // HTTP requests
            new Sentry.Integrations.Http({ tracing: true }),
            
            // Express (added via middleware)
        ],
        
        // Release tracking
        release: process.env.VERCEL_GIT_COMMIT_SHA || 'local-dev',
        
        // Filter sensitive data
        beforeSend(event, hint) {
            // Remove sensitive data from breadcrumbs
            if (event.breadcrumbs) {
                event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
                    if (breadcrumb.data) {
                        // Remove sensitive headers
                        if (breadcrumb.data.headers) {
                            delete breadcrumb.data.headers.authorization;
                            delete breadcrumb.data.headers.cookie;
                        }
                    }
                    return breadcrumb;
                });
            }
            
            // Remove sensitive request data
            if (event.request) {
                if (event.request.headers) {
                    delete event.request.headers.authorization;
                    delete event.request.headers.cookie;
                }
                if (event.request.data && typeof event.request.data === 'object') {
                    delete event.request.data.password;
                    delete event.request.data.passwordHash;
                    delete event.request.data.token;
                }
            }
            
            return event;
        },
        
        // Ignore specific errors
        ignoreErrors: [
            // Browser errors we can't control
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection captured',
            
            // Rate limiting errors (expected)
            'Too Many Requests',
            
            // Network errors
            'NetworkError',
            'Network request failed',
        ],
    });
    
    console.log(`✅ Sentry initialized (environment: ${environment})`);
    return Sentry;
}

/**
 * Express middleware for Sentry request tracking
 */
function sentryRequestHandler() {
    return Sentry.Handlers.requestHandler({
        ip: true,
        user: true,
    });
}

/**
 * Express middleware for Sentry tracing
 */
function sentryTracingHandler() {
    return Sentry.Handlers.tracingHandler();
}

/**
 * Express error handler for Sentry
 */
function sentryErrorHandler() {
    return Sentry.Handlers.errorHandler({
        shouldHandleError(error) {
            // Capture 4xx and 5xx errors
            return error.status >= 400;
        },
    });
}

/**
 * Capture exception with context
 */
function captureException(error, context = {}) {
    Sentry.captureException(error, {
        extra: context,
    });
}

/**
 * Capture message with context
 */
function captureMessage(message, level = 'info', context = {}) {
    Sentry.captureMessage(message, {
        level,
        extra: context,
    });
}

/**
 * Add breadcrumb for debugging
 */
function addBreadcrumb(breadcrumb) {
    Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Set user context
 */
function setUser(user) {
    Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
    });
}

/**
 * Clear user context
 */
function clearUser() {
    Sentry.setUser(null);
}

/**
 * Start transaction for performance monitoring
 */
function startTransaction(name, op = 'http.server') {
    return Sentry.startTransaction({
        name,
        op,
    });
}

module.exports = {
    initializeSentry,
    sentryRequestHandler,
    sentryTracingHandler,
    sentryErrorHandler,
    captureException,
    captureMessage,
    addBreadcrumb,
    setUser,
    clearUser,
    startTransaction,
    Sentry,
};

