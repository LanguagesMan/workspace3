/**
 * 📊 MIXPANEL ANALYTICS SERVICE
 * 
 * Comprehensive event tracking, user properties, and analytics integration
 * Following AGENT 5 requirements
 */

const Mixpanel = require('mixpanel');

class MixpanelAnalytics {
    constructor() {
        this.mixpanel = null;
        this.isEnabled = false;
        this.initialize();
    }

    /**
     * Initialize Mixpanel
     */
    initialize() {
        const token = process.env.MIXPANEL_TOKEN;
        
        if (!token) {
            console.warn('⚠️  Mixpanel not configured (MIXPANEL_TOKEN not set)');
            return;
        }

        try {
            this.mixpanel = Mixpanel.init(token, {
                protocol: 'https',
                keepAlive: false
            });
            this.isEnabled = true;
            console.log('✅ Mixpanel Analytics initialized');
        } catch (error) {
            console.error('❌ Mixpanel initialization error:', error);
        }
    }

    /**
     * Track event
     * @param {string} userId - User ID
     * @param {string} eventName - Event name
     * @param {Object} properties - Event properties
     */
    track(userId, eventName, properties = {}) {
        if (!this.isEnabled) return;

        try {
            // Add standard properties
            const eventData = {
                distinct_id: userId,
                ...properties,
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            };

            this.mixpanel.track(eventName, eventData);
        } catch (error) {
            console.error('Mixpanel track error:', error);
        }
    }

    /**
     * Set user properties
     * @param {string} userId - User ID
     * @param {Object} properties - User properties
     */
    setUserProperties(userId, properties) {
        if (!this.isEnabled) return;

        try {
            this.mixpanel.people.set(userId, properties);
        } catch (error) {
            console.error('Mixpanel set user properties error:', error);
        }
    }

    /**
     * Increment user property
     * @param {string} userId - User ID
     * @param {string} property - Property name
     * @param {number} amount - Amount to increment
     */
    incrementUserProperty(userId, property, amount = 1) {
        if (!this.isEnabled) return;

        try {
            this.mixpanel.people.increment(userId, property, amount);
        } catch (error) {
            console.error('Mixpanel increment error:', error);
        }
    }

    // ==================== USER EVENTS ====================

    /**
     * Track User Signed Up
     */
    trackUserSignup(userId, properties = {}) {
        this.track(userId, 'User Signed Up', properties);
        this.setUserProperties(userId, {
            'Signup Date': new Date().toISOString(),
            'Days Since Signup': 0,
            ...properties
        });
    }

    /**
     * Track User Logged In
     */
    trackUserLogin(userId, properties = {}) {
        this.track(userId, 'User Logged In', properties);
    }

    /**
     * Track User Completed Onboarding
     */
    trackOnboardingComplete(userId, properties = {}) {
        this.track(userId, 'User Completed Onboarding', properties);
        this.setUserProperties(userId, {
            'Onboarding Completed': true,
            'Onboarding Date': new Date().toISOString(),
            ...properties
        });
    }

    // ==================== VIDEO EVENTS ====================

    /**
     * Track Video Started
     */
    trackVideoStarted(userId, videoId, properties = {}) {
        this.track(userId, 'Video Started', {
            videoId,
            ...properties
        });
        this.incrementUserProperty(userId, 'Total Videos Watched');
    }

    /**
     * Track Video Completed
     */
    trackVideoCompleted(userId, videoId, properties = {}) {
        this.track(userId, 'Video Completed', {
            videoId,
            ...properties
        });
    }

    /**
     * Track Video Skipped
     */
    trackVideoSkipped(userId, videoId, properties = {}) {
        this.track(userId, 'Video Skipped', {
            videoId,
            ...properties
        });
    }

    // ==================== LEARNING EVENTS ====================

    /**
     * Track Word Clicked
     */
    trackWordClicked(userId, word, properties = {}) {
        this.track(userId, 'Word Clicked', {
            word,
            ...properties
        });
    }

    /**
     * Track Word Saved
     */
    trackWordSaved(userId, word, properties = {}) {
        this.track(userId, 'Word Saved', {
            word,
            ...properties
        });
        this.incrementUserProperty(userId, 'Total Words Learned');
    }

    /**
     * Track Word Reviewed
     */
    trackWordReviewed(userId, word, properties = {}) {
        this.track(userId, 'Word Reviewed', {
            word,
            ...properties
        });
    }

    /**
     * Track Word Mastered
     */
    trackWordMastered(userId, word, properties = {}) {
        this.track(userId, 'Word Mastered', {
            word,
            ...properties
        });
    }

    // ==================== GAME EVENTS ====================

    /**
     * Track Game Started
     */
    trackGameStarted(userId, gameType, properties = {}) {
        this.track(userId, 'Game Started', {
            gameType,
            ...properties
        });
    }

    /**
     * Track Game Completed
     */
    trackGameCompleted(userId, gameType, properties = {}) {
        this.track(userId, 'Game Completed', {
            gameType,
            ...properties
        });
    }

    /**
     * Track Game Score
     */
    trackGameScore(userId, gameType, score, properties = {}) {
        this.track(userId, 'Game Score', {
            gameType,
            score,
            ...properties
        });
    }

    // ==================== PAYMENT EVENTS ====================

    /**
     * Track Checkout Started
     */
    trackCheckoutStarted(userId, properties = {}) {
        this.track(userId, 'Checkout Started', properties);
    }

    /**
     * Track Payment Completed
     */
    trackPaymentCompleted(userId, amount, currency, properties = {}) {
        this.track(userId, 'Payment Completed', {
            amount,
            currency,
            ...properties
        });
        this.setUserProperties(userId, {
            'Subscription Status': 'active',
            'Last Payment Date': new Date().toISOString(),
            ...properties
        });
    }

    /**
     * Track Subscription Cancelled
     */
    trackSubscriptionCancelled(userId, properties = {}) {
        this.track(userId, 'Subscription Cancelled', properties);
        this.setUserProperties(userId, {
            'Subscription Status': 'cancelled',
            'Cancellation Date': new Date().toISOString()
        });
    }

    // ==================== ENGAGEMENT EVENTS ====================

    /**
     * Track Daily Active User
     */
    trackDailyActive(userId, properties = {}) {
        this.track(userId, 'Daily Active User', properties);
    }

    /**
     * Track Session Started
     */
    trackSessionStarted(userId, properties = {}) {
        this.track(userId, 'Session Started', properties);
    }

    /**
     * Track Session Ended
     */
    trackSessionEnded(userId, sessionDuration, properties = {}) {
        this.track(userId, 'Session Ended', {
            sessionDuration,
            ...properties
        });
    }

    // ==================== CONTENT EVENTS ====================

    /**
     * Track Article Read
     */
    trackArticleRead(userId, articleId, properties = {}) {
        this.track(userId, 'Article Read', {
            articleId,
            ...properties
        });
    }

    /**
     * Track Podcast Listened
     */
    trackPodcastListened(userId, podcastId, properties = {}) {
        this.track(userId, 'Podcast Listened', {
            podcastId,
            ...properties
        });
    }

    // ==================== USER PROPERTY UPDATES ====================

    /**
     * Update comprehensive user properties
     */
    updateUserProfile(userId, profile) {
        const properties = {
            'Language Level': profile.languageLevel,
            'Target Language': profile.targetLanguage,
            'Native Language': profile.nativeLanguage,
            'Current Streak': profile.streak || 0,
            'Longest Streak': profile.longestStreak || 0,
            'Total Videos Watched': profile.totalVideosWatched || 0,
            'Total Words Learned': profile.totalWordsLearned || 0,
            'Days Since Signup': profile.daysSinceSignup || 0,
            'Subscription Status': profile.subscriptionStatus || 'free',
            'Device Type': profile.deviceType || 'unknown',
            'Last Active': new Date().toISOString()
        };

        this.setUserProperties(userId, properties);
    }

    /**
     * Update streak
     */
    updateStreak(userId, streak, longestStreak) {
        this.setUserProperties(userId, {
            'Current Streak': streak,
            'Longest Streak': longestStreak
        });
    }

    /**
     * Identify user (alias)
     */
    identify(userId, newId) {
        if (!this.isEnabled) return;

        try {
            this.mixpanel.alias(userId, newId);
        } catch (error) {
            console.error('Mixpanel identify error:', error);
        }
    }
}

// Export singleton instance
module.exports = new MixpanelAnalytics();

