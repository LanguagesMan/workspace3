/**
 * 📊 ANALYTICS INTEGRATION
 * 
 * Central module to integrate all analytics and error tracking
 * Call this from server.js to set up everything
 */

const mixpanel = require('./mixpanel-analytics');
const errorTracking = require('./comprehensive-error-tracking');
const {
    initializeSentry,
    trackAPIRequest,
    trackSession,
    errorHandler,
    addSentryErrorHandler
} = require('./analytics-middleware');
const analyticsAPI = require('./analytics-api');
const { createLogger } = require('./logger');

const logger = createLogger('AnalyticsIntegration');

/**
 * Initialize all analytics and monitoring
 * Call this FIRST in server.js, before any routes
 */
function initializeAnalytics(app) {
    logger.info('🚀 Initializing analytics and monitoring...');

    // 1. Initialize Sentry for error tracking
    initializeSentry(app);
    errorTracking.initialize();

    // 2. Add tracking middleware (BEFORE routes)
    app.use(trackAPIRequest);
    app.use(trackSession);

    logger.info('✅ Analytics middleware initialized');

    return {
        mixpanel,
        errorTracking,
        analyticsAPI
    };
}

/**
 * Add error handler middleware
 * Call this AFTER all routes in server.js
 */
function addAnalyticsErrorHandler(app) {
    // Add Sentry error handler (must be before custom error handler)
    addSentryErrorHandler(app);

    // Add custom error handler
    app.use(errorHandler);

    logger.info('✅ Error handlers initialized');
}

/**
 * Mount analytics API routes
 */
function mountAnalyticsAPI(app) {
    app.use('/api/analytics', analyticsAPI);
    logger.info('✅ Analytics API mounted at /api/analytics');
}

/**
 * Helper functions for easy tracking
 */
const track = {
    // User events
    userSignup: (userId, data) => mixpanel.trackUserSignup(userId, data),
    userLogin: (userId, data) => mixpanel.trackUserLogin(userId, data),
    onboardingComplete: (userId, data) => mixpanel.trackOnboardingComplete(userId, data),

    // Video events
    videoStarted: (userId, videoId, data) => mixpanel.trackVideoStarted(userId, videoId, data),
    videoCompleted: (userId, videoId, data) => mixpanel.trackVideoCompleted(userId, videoId, data),
    videoSkipped: (userId, videoId, data) => mixpanel.trackVideoSkipped(userId, videoId, data),

    // Learning events
    wordClicked: (userId, word, data) => mixpanel.trackWordClicked(userId, word, data),
    wordSaved: (userId, word, data) => mixpanel.trackWordSaved(userId, word, data),
    wordReviewed: (userId, word, data) => mixpanel.trackWordReviewed(userId, word, data),
    wordMastered: (userId, word, data) => mixpanel.trackWordMastered(userId, word, data),

    // Game events
    gameStarted: (userId, gameType, data) => mixpanel.trackGameStarted(userId, gameType, data),
    gameCompleted: (userId, gameType, data) => mixpanel.trackGameCompleted(userId, gameType, data),
    gameScore: (userId, gameType, score, data) => mixpanel.trackGameScore(userId, gameType, score, data),

    // Payment events
    checkoutStarted: (userId, data) => mixpanel.trackCheckoutStarted(userId, data),
    paymentCompleted: (userId, amount, currency, data) => mixpanel.trackPaymentCompleted(userId, amount, currency, data),
    subscriptionCancelled: (userId, data) => mixpanel.trackSubscriptionCancelled(userId, data),

    // Engagement events
    dailyActive: (userId, data) => mixpanel.trackDailyActive(userId, data),
    sessionStarted: (userId, data) => mixpanel.trackSessionStarted(userId, data),
    sessionEnded: (userId, duration, data) => mixpanel.trackSessionEnded(userId, duration, data),

    // Content events
    articleRead: (userId, articleId, data) => mixpanel.trackArticleRead(userId, articleId, data),
    podcastListened: (userId, podcastId, data) => mixpanel.trackPodcastListened(userId, podcastId, data),

    // Custom event
    custom: (userId, event, properties) => mixpanel.track(userId, event, properties)
};

/**
 * Helper functions for error tracking
 */
const captureError = {
    javascript: (error, context) => errorTracking.captureJavaScriptError(error, context),
    api: (error, request, context) => errorTracking.captureAPIError(error, request, context),
    database: (error, query, context) => errorTracking.captureDatabaseError(error, query, context),
    payment: (error, context) => errorTracking.capturePaymentError(error, context),
    
    // Generic error capture
    error: (error, context) => errorTracking.captureJavaScriptError(error, context)
};

/**
 * Helper functions for user context
 */
const user = {
    set: (userData) => errorTracking.setUser(userData),
    clear: () => errorTracking.clearUser(),
    updateProfile: (userId, profile) => mixpanel.updateUserProfile(userId, profile),
    updateStreak: (userId, streak, longest) => mixpanel.updateStreak(userId, streak, longest)
};

/**
 * Helper functions for performance tracking
 */
const performance = {
    trackAPI: (endpoint, method, duration) => errorTracking.trackAPIResponseTime(endpoint, method, duration),
    trackDatabase: (query, duration) => errorTracking.trackDatabaseQueryTime(query, duration),
    trackVideo: (videoId, issue, context) => errorTracking.trackVideoPlaybackIssue(videoId, issue, context),
    startTransaction: (name, op) => errorTracking.startTransaction(name, op),
    getMetrics: () => errorTracking.getPerformanceMetrics()
};

/**
 * Complete setup function
 * Use this in server.js for easy integration
 */
function setupAnalytics(app) {
    logger.info('📊 Setting up analytics and monitoring...');

    // Initialize analytics
    const analytics = initializeAnalytics(app);

    // Mount API routes
    mountAnalyticsAPI(app);

    // Return helper functions
    return {
        analytics,
        track,
        captureError,
        user,
        performance,
        
        // Add error handler (call this AFTER all routes)
        addErrorHandler: () => addAnalyticsErrorHandler(app)
    };
}

module.exports = {
    setupAnalytics,
    initializeAnalytics,
    mountAnalyticsAPI,
    addAnalyticsErrorHandler,
    track,
    captureError,
    user,
    performance,
    mixpanel,
    errorTracking
};

