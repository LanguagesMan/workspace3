/**
 * 📊 MIXPANEL VIDEO TRACKING INTEGRATION
 *
 * Integrates Mixpanel tracking with existing video behavior tracking
 * Call this after video events to send data to Mixpanel
 */

// Enhanced video tracking with Mixpanel integration
(function() {
    'use strict';

    // Check if Mixpanel client is available
    if (typeof window.MixpanelClient === 'undefined') {
        console.warn('⚠️ MixpanelClient not loaded - video tracking disabled');
        return;
    }

    // Store video start times for duration tracking
    const videoStartTimes = new Map();
    const videoData = new Map();

    /**
     * Track video started
     * Call when video begins playing
     */
    window.trackMixpanelVideoStarted = function(videoId, videoInfo = {}) {
        videoStartTimes.set(videoId, Date.now());
        videoData.set(videoId, videoInfo);

        window.MixpanelClient.trackVideoStarted(videoId, {
            title: videoInfo.title || 'Unknown',
            difficulty: videoInfo.level || videoInfo.difficulty || 'unknown',
            category: videoInfo.category || 'general',
            language: videoInfo.language || 'Spanish',
            duration: videoInfo.duration || 0
        });
    };

    /**
     * Track video completed
     * Call when user watches >= 80% of video
     */
    window.trackMixpanelVideoCompleted = function(videoId, watchPercentage = 100) {
        const startTime = videoStartTimes.get(videoId);
        const info = videoData.get(videoId);
        const watchDuration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

        window.MixpanelClient.trackVideoCompleted(videoId, {
            watchPercentage: watchPercentage,
            watchDuration: watchDuration,
            title: info?.title,
            difficulty: info?.level || info?.difficulty,
            category: info?.category
        });
    };

    /**
     * Track video skipped
     * Call when user skips before watching 30%
     */
    window.trackMixpanelVideoSkipped = function(videoId) {
        const startTime = videoStartTimes.get(videoId);
        const watchedSeconds = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

        window.MixpanelClient.trackVideoSkipped(videoId, watchedSeconds);
    };

    /**
     * Track video progress milestones (25%, 50%, 75%)
     */
    window.trackMixpanelVideoProgress = function(videoId, percentage) {
        window.MixpanelClient.trackVideoProgress(videoId, percentage);
    };

    /**
     * Track word clicked for translation
     */
    window.trackMixpanelWordClicked = function(word, context = {}) {
        window.MixpanelClient.trackWordClicked(word, {
            translation: context.translation,
            context: context.sentence || context.context,
            videoId: context.videoId,
            articleId: context.articleId
        });
    };

    /**
     * Track word saved to vocabulary
     */
    window.trackMixpanelWordSaved = function(word, context = {}) {
        window.MixpanelClient.trackWordSaved(word, {
            translation: context.translation,
            context: context.sentence || context.context,
            difficulty: context.difficulty
        });
    };

    /**
     * Track quiz started
     */
    window.trackMixpanelQuizStarted = function(quizId, quizInfo = {}) {
        window.MixpanelClient.trackQuizStarted(quizId, {
            quizType: quizInfo.type || 'video_comprehension',
            difficulty: quizInfo.difficulty,
            questionCount: quizInfo.questionCount
        });
    };

    /**
     * Track quiz completed
     */
    window.trackMixpanelQuizCompleted = function(quizId, score, quizInfo = {}) {
        window.MixpanelClient.trackQuizCompleted(quizId, score, {
            correctAnswers: quizInfo.correctAnswers,
            totalQuestions: quizInfo.totalQuestions,
            accuracy: quizInfo.accuracy,
            timeTaken: quizInfo.timeTaken
        });
    };

    /**
     * Track streak milestone
     */
    window.trackMixpanelStreakMilestone = function(streakDays) {
        window.MixpanelClient.trackStreakMilestone(streakDays);
    };

    /**
     * Track achievement unlocked
     */
    window.trackMixpanelAchievement = function(achievementId, achievementInfo = {}) {
        window.MixpanelClient.trackAchievementUnlocked(achievementId, {
            name: achievementInfo.name,
            category: achievementInfo.category,
            xpEarned: achievementInfo.xp
        });
    };

    /**
     * Track premium upgrade clicked
     */
    window.trackMixpanelPremiumClicked = function(location) {
        window.MixpanelClient.trackPremiumUpgradeClicked(location);
    };

    /**
     * Set user identity
     * Call this on login/signup
     */
    window.identifyMixpanelUser = function(userId) {
        window.MixpanelClient.identify(userId);
    };

    /**
     * Update user properties
     */
    window.updateMixpanelUserProperties = function(properties) {
        window.MixpanelClient.setUserProperties(properties);
    };

    console.log('✅ Mixpanel video tracking integration loaded');
})();
