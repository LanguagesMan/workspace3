/**
 * 🧠 GENIUS RECOMMENDATION ENGINE
 * Smart content recommendations based on user level, interests, and engagement
 */

const fs = require('fs');
const path = require('path');

class RecommendationEngine {
    constructor() {
        this.videoCatalog = this.loadVideoCatalog();
        this.userProgressService = null; // Will be injected
    }

    loadVideoCatalog() {
        try {
            const data = fs.readFileSync(
                path.join(__dirname, '../../data/video-catalog.json'),
                'utf8'
            );
            return JSON.parse(data);
        } catch (error) {
            console.warn('Video catalog not found');
            return { videos: [] };
        }
    }

    /**
     * Get personalized video recommendations
     */
    getRecommendations(user, count = 10, options = {}) {
        const {
            diversityFactor = 0.3, // 30% diversity
            difficultyRange = 1,   // ±1 level
            includeReviewed = false
        } = options;

        // Get user's current level
        const userLevel = user.progress.level;
        const userInterests = user.profile.interests || ['general'];

        // Filter videos by level range
        const levelVideos = this.getVideosInLevelRange(userLevel, difficultyRange);

        // Score each video
        const scored = levelVideos.map(video => ({
            video,
            score: this.calculateRecommendationScore(video, user)
        }));

        // Sort by score
        scored.sort((a, b) => b.score - a.score);

        // Apply diversity (mix in some different themes)
        const recommendations = this.applyDiversity(scored, diversityFactor, count);

        // Filter out already watched (unless includeReviewed)
        let final = recommendations;
        if (!includeReviewed) {
            final = recommendations.filter(item => 
                !user.engagement.videosCompleted.includes(item.video.id)
            );
        }

        // Take top count
        return final.slice(0, count).map(item => ({
            ...item.video,
            recommendationScore: item.score,
            reason: this.getRecommendationReason(item.video, user)
        }));
    }

    /**
     * Get videos within user's level range
     */
    getVideosInLevelRange(userLevel, range = 1) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const userIndex = levels.indexOf(userLevel);
        
        const minIndex = Math.max(0, userIndex - range);
        const maxIndex = Math.min(levels.length - 1, userIndex + range);
        
        const targetLevels = levels.slice(minIndex, maxIndex + 1);
        
        return this.videoCatalog.videos.filter(v => 
            targetLevels.includes(v.level)
        );
    }

    /**
     * Calculate recommendation score for a video
     */
    calculateRecommendationScore(video, user) {
        let score = 0;

        // 1. Level appropriateness (40 points)
        score += this.scoreLevelMatch(video.level, user.progress.level);

        // 2. Interest match (30 points)
        score += this.scoreInterestMatch(video.theme, user.profile.interests);

        // 3. Engagement potential (20 points)
        score += this.scoreEngagementPotential(video, user);

        // 4. Freshness (10 points)
        score += this.scoreFreshness(video, user);

        return score;
    }

    /**
     * Score how well video level matches user level
     */
    scoreLevelMatch(videoLevel, userLevel) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const videoIndex = levels.indexOf(videoLevel);
        const userIndex = levels.indexOf(userLevel);
        
        const diff = Math.abs(videoIndex - userIndex);
        
        // Perfect match: 40 points
        // 1 level off: 30 points
        // 2 levels off: 15 points
        // 3+ levels off: 5 points
        if (diff === 0) return 40;
        if (diff === 1) return 30;
        if (diff === 2) return 15;
        return 5;
    }

    /**
     * Score interest match
     */
    scoreInterestMatch(videoTheme, userInterests) {
        if (userInterests.includes(videoTheme)) {
            return 30;
        }
        if (userInterests.includes('general')) {
            return 20;
        }
        return 10;
    }

    /**
     * Score engagement potential
     */
    scoreEngagementPotential(video, user) {
        let score = 0;

        // Videos with more views/likes are more engaging
        const totalEngagement = (video.views || 0) + (video.likes || 0) * 2;
        score += Math.min(10, totalEngagement / 10);

        // Shorter videos are easier to complete
        if (video.duration < 30) score += 5;

        // Videos with more unique words are more educational
        if (video.uniqueWords > 10) score += 5;

        return score;
    }

    /**
     * Score freshness (prefer unseen content)
     */
    scoreFreshness(video, user) {
        // Haven't watched: 10 points
        if (!user.engagement.videosCompleted.includes(video.id)) {
            return 10;
        }
        
        // Watched but not saved: 5 points
        if (!user.engagement.videosSaved.includes(video.id)) {
            return 5;
        }
        
        // Saved: 2 points (can review)
        return 2;
    }

    /**
     * Apply diversity to recommendations
     */
    applyDiversity(scoredVideos, diversityFactor, count) {
        const diverseCount = Math.floor(count * diversityFactor);
        const topCount = count - diverseCount;

        // Take top scored videos
        const top = scoredVideos.slice(0, topCount);

        // Add diverse videos (different themes)
        const usedThemes = new Set(top.map(item => item.video.theme));
        const diverse = [];

        for (const item of scoredVideos.slice(topCount)) {
            if (!usedThemes.has(item.video.theme)) {
                diverse.push(item);
                usedThemes.add(item.video.theme);
                
                if (diverse.length >= diverseCount) break;
            }
        }

        return [...top, ...diverse];
    }

    /**
     * Get recommendation reason (for UI display)
     */
    getRecommendationReason(video, user) {
        const reasons = [];

        // Level match
        if (video.level === user.progress.level) {
            reasons.push('Perfect for your level');
        } else {
            const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            const videoIndex = levels.indexOf(video.level);
            const userIndex = levels.indexOf(user.progress.level);
            
            if (videoIndex > userIndex) {
                reasons.push('Challenge yourself');
            } else {
                reasons.push('Review and reinforce');
            }
        }

        // Interest match
        if (user.profile.interests.includes(video.theme)) {
            reasons.push(`You like ${video.theme}`);
        }

        // Popular
        if ((video.views || 0) > 100) {
            reasons.push('Popular video');
        }

        return reasons[0] || 'Recommended for you';
    }

    /**
     * Get next video in sequence (for autoplay)
     */
    getNextVideo(currentVideoId, user) {
        const recommendations = this.getRecommendations(user, 5);
        
        // Filter out current video
        const next = recommendations.filter(v => v.id !== currentVideoId);
        
        return next[0] || null;
    }

    /**
     * Get similar videos
     */
    getSimilarVideos(videoId, count = 5) {
        const video = this.videoCatalog.videos.find(v => v.id === videoId);
        if (!video) return [];

        // Find videos with same level and theme
        const similar = this.videoCatalog.videos
            .filter(v => 
                v.id !== videoId &&
                (v.level === video.level || v.theme === video.theme)
            )
            .slice(0, count);

        return similar;
    }

    /**
     * Get trending videos (most engaged)
     */
    getTrendingVideos(count = 10) {
        const sorted = [...this.videoCatalog.videos]
            .sort((a, b) => {
                const scoreA = (a.views || 0) + (a.likes || 0) * 2 + (a.completions || 0) * 3;
                const scoreB = (b.views || 0) + (b.likes || 0) * 2 + (b.completions || 0) * 3;
                return scoreB - scoreA;
            });

        return sorted.slice(0, count);
    }

    /**
     * Get videos for practice (words user is learning)
     */
    getPracticeVideos(user, count = 5) {
        const learningWords = user.wordBank.learning || [];
        
        if (learningWords.length === 0) {
            return this.getRecommendations(user, count);
        }

        // Find videos that contain user's learning words
        const relevant = this.videoCatalog.videos.filter(video => {
            const videoWords = video.words.map(w => w.toLowerCase());
            return learningWords.some(word => videoWords.includes(word.toLowerCase()));
        });

        return relevant.slice(0, count);
    }

    /**
     * Cold start recommendations (new users)
     */
    getColdStartRecommendations(level = 'A1', count = 10) {
        // For new users, show popular videos at their level
        const levelVideos = this.videoCatalog.videos.filter(v => v.level === level);
        
        // Mix of themes
        const themes = [...new Set(levelVideos.map(v => v.theme))];
        const recommendations = [];

        for (const theme of themes) {
            const themeVideos = levelVideos.filter(v => v.theme === theme);
            if (themeVideos.length > 0) {
                recommendations.push(themeVideos[0]);
            }
            
            if (recommendations.length >= count) break;
        }

        // Fill remaining with random
        while (recommendations.length < count && levelVideos.length > 0) {
            const random = levelVideos[Math.floor(Math.random() * levelVideos.length)];
            if (!recommendations.find(v => v.id === random.id)) {
                recommendations.push(random);
            }
        }

        return recommendations.slice(0, count);
    }
}

module.exports = RecommendationEngine;

// CLI testing
if (require.main === module) {
    const RecommendationEngine = require('./recommendation-engine');
    const UserProgressService = require('../services/user-progress-service');
    
    const engine = new RecommendationEngine();
    const userService = new UserProgressService();
    
    // Get test user
    const user = userService.getUser('test-user-001');
    
    console.log('🧠 Testing Recommendation Engine\n');
    
    // Get recommendations
    const recommendations = engine.getRecommendations(user, 5);
    console.log(`📺 Top 5 Recommendations for ${user.profile.name} (${user.progress.level}):\n`);
    
    recommendations.forEach((video, i) => {
        console.log(`${i + 1}. ${video.id}`);
        console.log(`   Level: ${video.level} | Theme: ${video.theme}`);
        console.log(`   Score: ${video.recommendationScore.toFixed(1)} | Reason: ${video.reason}`);
        console.log(`   Spanish: "${video.spanish.substring(0, 50)}..."`);
        console.log();
    });
    
    // Cold start
    console.log('🆕 Cold Start Recommendations (A1):');
    const coldStart = engine.getColdStartRecommendations('A1', 3);
    coldStart.forEach(v => console.log(`   - ${v.id} (${v.theme})`));
}
