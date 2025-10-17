/**
 * Error Tracking and Monitoring
 * Integrates Sentry for comprehensive error tracking across the application
 */

const Sentry = require('@sentry/node');

// Gracefully handle optional profiling integration
let ProfilingIntegration;
try {
  ProfilingIntegration = require('@sentry/profiling-node').ProfilingIntegration;
} catch (err) {
  console.warn('⚠️  @sentry/profiling-node not installed. Profiling disabled.');
  ProfilingIntegration = null;
}

// Initialize Sentry
const initErrorTracking = () => {
  if (!process.env.SENTRY_DSN) {
    console.warn('⚠️  SENTRY_DSN not configured. Error tracking disabled.');
    return false;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // In production, you might want to reduce this
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Set profilesSampleRate to capture profiling data (only if profiling is available)
    profilesSampleRate: ProfilingIntegration ? (process.env.NODE_ENV === 'production' ? 0.1 : 1.0) : undefined,

    integrations: ProfilingIntegration ? [
      new ProfilingIntegration(),
    ] : [],
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      
      // Remove sensitive query params
      if (event.request?.query_string) {
        const sensitiveParams = ['token', 'api_key', 'password', 'secret'];
        sensitiveParams.forEach(param => {
          if (event.request.query_string.includes(param)) {
            event.request.query_string = event.request.query_string.replace(
              new RegExp(`${param}=[^&]+`, 'gi'),
              `${param}=REDACTED`
            );
          }
        });
      }
      
      return event;
    },
  });

  console.log('✅ Sentry error tracking initialized');
  return true;
};

/**
 * Capture API error with context
 */
const captureAPIError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    endpoint: context.endpoint || 'unknown',
    method: context.method || 'unknown',
    statusCode: context.statusCode || 500,
    userId: context.userId,
    requestId: context.requestId,
  };

  console.error('API Error:', errorInfo);

  if (Sentry.isInitialized()) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'api_error');
      scope.setTag('endpoint', context.endpoint);
      scope.setTag('method', context.method);
      scope.setLevel(context.statusCode >= 500 ? 'error' : 'warning');
      
      if (context.userId) {
        scope.setUser({ id: context.userId });
      }
      
      scope.setContext('api', {
        endpoint: context.endpoint,
        method: context.method,
        statusCode: context.statusCode,
        requestId: context.requestId,
        params: context.params,
        query: context.query,
      });
      
      Sentry.captureException(error);
    });
  }

  return errorInfo;
};

/**
 * Capture frontend error
 */
const captureFrontendError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    component: context.component || 'unknown',
    action: context.action,
    userId: context.userId,
  };

  console.error('Frontend Error:', errorInfo);

  if (Sentry.isInitialized()) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'frontend_error');
      scope.setTag('component', context.component);
      scope.setLevel('error');
      
      if (context.userId) {
        scope.setUser({ id: context.userId });
      }
      
      scope.setContext('frontend', {
        component: context.component,
        action: context.action,
        props: context.props,
        state: context.state,
      });
      
      Sentry.captureException(error);
    });
  }

  return errorInfo;
};

/**
 * Capture database error
 */
const captureDatabaseError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    query: context.query,
    operation: context.operation || 'unknown',
  };

  console.error('Database Error:', errorInfo);

  if (Sentry.isInitialized()) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'database_error');
      scope.setTag('operation', context.operation);
      scope.setLevel('error');
      
      scope.setContext('database', {
        operation: context.operation,
        table: context.table,
        query: context.query ? context.query.substring(0, 200) : undefined, // Limit query length
      });
      
      Sentry.captureException(error);
    });
  }

  return errorInfo;
};

/**
 * Capture custom message/warning
 */
const captureMessage = (message, level = 'info', context = {}) => {
  console.log(`[${level.toUpperCase()}]`, message, context);

  if (Sentry.isInitialized()) {
    Sentry.withScope((scope) => {
      scope.setLevel(level);
      
      Object.keys(context).forEach(key => {
        scope.setExtra(key, context[key]);
      });
      
      Sentry.captureMessage(message);
    });
  }
};

/**
 * Set user context for all subsequent errors
 */
const setUserContext = (userId, userData = {}) => {
  if (Sentry.isInitialized()) {
    Sentry.setUser({
      id: userId,
      ...userData,
    });
  }
};

/**
 * Clear user context (e.g., on logout)
 */
const clearUserContext = () => {
  if (Sentry.isInitialized()) {
    Sentry.setUser(null);
  }
};

/**
 * Express middleware for automatic error capture
 */
const sentryMiddleware = () => {
  return (err, req, res, next) => {
    captureAPIError(err, {
      endpoint: req.path,
      method: req.method,
      statusCode: err.statusCode || 500,
      userId: req.user?.id,
      requestId: req.id,
      params: req.params,
      query: req.query,
    });
    
    next(err);
  };
};

/**
 * Express request handler (must be first middleware)
 */
const requestHandler = () => {
  if (Sentry.isInitialized()) {
    return Sentry.Handlers.requestHandler();
  }
  return (req, res, next) => next();
};

/**
 * Express error handler (must be after all other middleware)
 */
const errorHandler = () => {
  if (Sentry.isInitialized()) {
    return Sentry.Handlers.errorHandler();
  }
  return (err, req, res, next) => next(err);
};

/**
 * Graceful shutdown
 */
const closeErrorTracking = async () => {
  if (Sentry.isInitialized()) {
    await Sentry.close(2000);
    console.log('✅ Sentry closed gracefully');
  }
};

module.exports = {
  initErrorTracking,
  captureAPIError,
  captureFrontendError,
  captureDatabaseError,
  captureMessage,
  setUserContext,
  clearUserContext,
  sentryMiddleware,
  requestHandler,
  errorHandler,
  closeErrorTracking,
  Sentry, // Export for advanced usage
};

