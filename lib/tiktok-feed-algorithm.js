/**
 * 🎯 TIKTOK-STYLE FEED ALGORITHM
 * Research-based implementation of viral content ranking
 * 
 * Key Features:
 * - 5-point engagement scoring system
 * - Three-step viral process (300 users → wider → global)
 * - 40% exploitation / 60% exploration balance
 * - Watch time quality measurement
 * - Cold start optimization
 */

class TikTokFeedAlgorithm {
    constructor() {
        // Engagement weights (TikTok's 5-point system)
        this.ENGAGEMENT_WEIGHTS = {
            rewatch: 5,      // Highest signal
            completion: 4,   // Watch to end
            share: 3,        // Share to friends
            comment: 2,      // Meaningful engagement
            like: 1          // Basic approval
        };

        // Viral thresholds
        this.INITIAL_TEST_SIZE = 300;        // Test audience size
        this.VIRAL_THRESHOLD = 50;           // Points needed to promote
        this.COMPLETION_RATE_TARGET = 0.70;  // 70% completion for viral
        this.HOOK_WINDOW_MS = 3000;          // First 3 seconds critical

        // Exploration/Exploitation balance
        this.EXPLOIT_RATIO = 0.40;  // 40% personalized
        this.EXPLORE_RATIO = 0.60;  // 60% discovery

        // User profiles cache
        this.userProfiles = new Map();
    }

    /**
     * Calculate engagement score for a video
     * @param {Object} metrics - Video engagement metrics
     * @returns {number} Total engagement score
     */
    calculateEngagementScore(metrics) {
        const {
            rewatches = 0,
            completions = 0,
            shares = 0,
            comments = 0,
            likes = 0,
            views = 1  // Avoid division by zero
        } = metrics;

        // Calculate rates (normalized per view)
        const rewatchRate = rewatches / views;
        const completionRate = completions / views;
        const shareRate = shares / views;
        const commentRate = comments / views;
        const likeRate = likes / views;

        // Weighted score
        const score = (
            (rewatchRate * this.ENGAGEMENT_WEIGHTS.rewatch) +
            (completionRate * this.ENGAGEMENT_WEIGHTS.completion) +
            (shareRate * this.ENGAGEMENT_WEIGHTS.share) +
            (commentRate * this.ENGAGEMENT_WEIGHTS.comment) +
            (likeRate * this.ENGAGEMENT_WEIGHTS.like)
        );

        return score;
    }

    /**
     * Determine video's viral stage
     * @param {Object} video - Video with metrics
     * @returns {string} 'testing' | 'ranking' | 'spreading' | 'failed'
     */
    getViralStage(video) {
        const { views = 0, metrics = {} } = video;
        const score = this.calculateEngagementScore(metrics);

        // Step 1: Initial Test (300 users)
        if (views < this.INITIAL_TEST_SIZE) {
            return 'testing';
        }

        // Check if passed initial test
        const avgScore = score * views / this.INITIAL_TEST_SIZE;
        if (avgScore < this.VIRAL_THRESHOLD) {
            return 'failed';
        }

        // Step 2: Ranking (Wider Audience)
        const completionRate = (metrics.completions || 0) / views;
        if (views < 10000 && completionRate >= this.COMPLETION_RATE_TARGET) {
            return 'ranking';
        }

        // Step 3: Spreading (Viral)
        if (views >= 10000 && completionRate >= this.COMPLETION_RATE_TARGET) {
            return 'spreading';
        }

        return 'ranking';
    }

    /**
     * Calculate watch time quality metrics
     * @param {Object} watchData - User watch behavior
     * @returns {Object} Quality metrics
     */
    calculateWatchTimeQuality(watchData) {
        const {
            totalWatchTime = 0,      // Total seconds watched
            videoDuration = 1,        // Video length in seconds
            rewatched = false,        // Did user rewatch?
            watchedToEnd = false,     // Completed?
            dwellTime = 0             // Time before scrolling
        } = watchData;

        const completionRate = Math.min(totalWatchTime / videoDuration, 1.0);
        const avgWatchTime = totalWatchTime;
        
        return {
            completionRate,
            avgWatchTime,
            rewatchBonus: rewatched ? this.ENGAGEMENT_WEIGHTS.rewatch : 0,
            completionBonus: watchedToEnd ? this.ENGAGEMENT_WEIGHTS.completion : 0,
            dwellTime,
            quality: (completionRate * 0.4) + (dwellTime / videoDuration * 0.3) + (rewatched ? 0.3 : 0)
        };
    }

    /**
     * Cold start: Get initial recommendations for new user
     * @param {Object} userData - Initial user data (location, language, interests)
     * @returns {Array} Recommended videos
     */
    getColdStartRecommendations(userData, availableVideos) {
        const { 
            selectedInterests = [], 
            location = 'US', 
            language = 'en' 
        } = userData;

        // Phase 1: Use explicit preferences if provided
        if (selectedInterests.length > 0) {
            return availableVideos
                .filter(v => selectedInterests.some(interest => 
                    v.categories?.includes(interest)
                ))
                .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
                .slice(0, 20);
        }

        // Phase 1: No preferences - show popular content
        return availableVideos
            .filter(v => v.language === language || v.isGlobal)
            .sort((a, b) => {
                const scoreA = this.calculateEngagementScore(a.metrics || {});
                const scoreB = this.calculateEngagementScore(b.metrics || {});
                return scoreB - scoreA;
            })
            .slice(0, 20);
    }

    /**
     * Build user interest profile from watch history
     * @param {string} userId 
     * @param {Array} watchHistory - Array of {videoId, watchTime, completed, liked, etc}
     * @returns {Object} User profile
     */
    buildUserProfile(userId, watchHistory) {
        if (this.userProfiles.has(userId)) {
            return this.userProfiles.get(userId);
        }

        const profile = {
            userId,
            interests: {},           // category -> weight
            preferredLevels: {},     // level -> weight
            followedCreators: new Set(),
            videosSeen: new Set(),
            totalWatchTime: 0,
            avgCompletionRate: 0,
            interactionCount: 0,
            lastActive: Date.now()
        };

        // Analyze watch history
        let totalCompletion = 0;
        watchHistory.forEach(session => {
            const { videoId, video, watchTime, completed, liked, shared, commented } = session;
            
            profile.videosSeen.add(videoId);
            profile.totalWatchTime += watchTime;
            
            if (completed) totalCompletion += 1;

            // Track interests (categories)
            if (video?.category) {
                profile.interests[video.category] = (profile.interests[video.category] || 0) + 1;
            }

            // Track preferred difficulty
            if (video?.level) {
                profile.preferredLevels[video.level] = (profile.preferredLevels[video.level] || 0) + 1;
            }

            // High-value interactions boost interest weights
            if (liked) {
                if (video?.category) profile.interests[video.category] += 0.5;
                profile.interactionCount++;
            }
            if (shared) {
                if (video?.category) profile.interests[video.category] += 1.5;  // Shares are 3x likes
                profile.interactionCount++;
            }
            if (commented) {
                if (video?.category) profile.interests[video.category] += 1.0;  // Comments are 2x likes
                profile.interactionCount++;
            }
        });

        profile.avgCompletionRate = watchHistory.length > 0 
            ? totalCompletion / watchHistory.length 
            : 0;

        // Check personalization readiness
        profile.personalizationStage = this.getPersonalizationStage(watchHistory.length, profile.totalWatchTime);

        this.userProfiles.set(userId, profile);
        return profile;
    }

    /**
     * Determine how personalized recommendations should be
     * Based on research: 36 min = initial profile, <2 hours = robust
     */
    getPersonalizationStage(videosWatched, totalWatchTimeSec) {
        const watchTimeMin = totalWatchTimeSec / 60;

        if (videosWatched < 15) {
            return 'cold_start';  // < 3 minutes
        } else if (videosWatched < 224 || watchTimeMin < 36) {
            return 'learning';  // Learning interests
        } else if (watchTimeMin < 120) {
            return 'robust';  // Robust personalization
        } else {
            return 'stable';  // Stable algorithm
        }
    }

    /**
     * Multi-Armed Bandit: Balance exploitation vs exploration
     * @param {Object} userProfile 
     * @param {Array} availableVideos 
     * @param {number} count - Number of videos to return
     * @returns {Array} Recommended videos
     */
    getPersonalizedFeed(userProfile, availableVideos, count = 20) {
        const feed = [];
        const unseenVideos = availableVideos.filter(v => !userProfile.videosSeen.has(v.id));

        // Adjust exploration/exploitation based on personalization stage
        let exploitRatio = this.EXPLOIT_RATIO;
        if (userProfile.personalizationStage === 'cold_start') {
            exploitRatio = 0.2;  // 20% exploit, 80% explore during cold start
        } else if (userProfile.personalizationStage === 'learning') {
            exploitRatio = 0.3;  // 30% exploit during learning
        }

        const exploreRatio = 1 - exploitRatio;

        for (let i = 0; i < count; i++) {
            const rand = Math.random();
            
            if (rand < exploitRatio) {
                // EXPLOIT: Show content from user's interest graph
                const video = this.selectFromInterestGraph(userProfile, unseenVideos);
                if (video) {
                    feed.push({ ...video, source: 'exploit', personalizationScore: 0.83 });
                    unseenVideos.splice(unseenVideos.indexOf(video), 1);
                }
            } else {
                // EXPLORE: Show novel/diverse content
                const video = this.selectNovelContent(userProfile, unseenVideos);
                if (video) {
                    feed.push({ ...video, source: 'explore', personalizationScore: 0.08 });
                    unseenVideos.splice(unseenVideos.indexOf(video), 1);
                }
            }
        }

        return feed;
    }

    /**
     * Select video from user's interest graph (exploitation)
     */
    selectFromInterestGraph(userProfile, videos) {
        const { interests, preferredLevels, followedCreators } = userProfile;

        // Score videos based on user interests
        const scored = videos.map(video => {
            let score = 0;

            // Match interests (categories)
            if (video.category && interests[video.category]) {
                score += interests[video.category] * 2;
            }

            // Match preferred difficulty
            if (video.level && preferredLevels[video.level]) {
                score += preferredLevels[video.level];
            }

            // From followed creators (HIGH IMPACT)
            if (video.creatorId && followedCreators.has(video.creatorId)) {
                score += 10;  // Strong signal
            }

            // Video quality (engagement score)
            score += this.calculateEngagementScore(video.metrics || {}) * 5;

            return { video, score };
        });

        // Sort by score and pick top with some randomness
        scored.sort((a, b) => b.score - a.score);
        const topN = Math.min(10, scored.length);
        const randomIndex = Math.floor(Math.random() * topN);
        
        return scored[randomIndex]?.video;
    }

    /**
     * Select novel content for exploration
     */
    selectNovelContent(userProfile, videos) {
        const { interests } = userProfile;

        // Filter for novel content (not in top interests)
        const topInterests = Object.keys(interests)
            .sort((a, b) => interests[b] - interests[a])
            .slice(0, 3);

        const novelVideos = videos.filter(v => 
            !topInterests.includes(v.category)
        );

        if (novelVideos.length === 0) {
            // Fallback to all videos if no novel content
            const randomIndex = Math.floor(Math.random() * videos.length);
            return videos[randomIndex];
        }

        // Pick random novel content (weighted by engagement)
        const scored = novelVideos.map(video => ({
            video,
            score: this.calculateEngagementScore(video.metrics || {}) + Math.random() * 2
        }));

        scored.sort((a, b) => b.score - a.score);
        const topN = Math.min(15, scored.length);
        const randomIndex = Math.floor(Math.random() * topN);
        
        return scored[randomIndex]?.video;
    }

    /**
     * Check if video passed first 3-second hook test
     */
    passedHookTest(watchData) {
        const { watchTime, scrolledAway, videoDuration } = watchData;
        
        if (scrolledAway && watchTime < this.HOOK_WINDOW_MS) {
            return false;  // Failed hook - scrolled within 3 seconds
        }

        return watchTime >= this.HOOK_WINDOW_MS;
    }

    /**
     * Predict if video will go viral
     */
    predictVirality(video, currentMetrics) {
        const stage = this.getViralStage({ ...video, metrics: currentMetrics });
        const score = this.calculateEngagementScore(currentMetrics);
        const completionRate = (currentMetrics.completions || 0) / (currentMetrics.views || 1);

        return {
            stage,
            score,
            completionRate,
            willGoViral: stage === 'spreading' || (stage === 'ranking' && score > this.VIRAL_THRESHOLD * 1.5),
            confidence: Math.min(score / this.VIRAL_THRESHOLD, 1.0)
        };
    }
}

// Export for use in Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TikTokFeedAlgorithm;
}
