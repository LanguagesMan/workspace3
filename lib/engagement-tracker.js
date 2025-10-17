// 📊 ENGAGEMENT TRACKER - TikTok/Instagram-style analytics
// Tracks: Watch time, saves, likes, shares, completions

class EngagementTracker {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        // In production, this would load from database
        return {
            videos: {}, // videoId -> { watchTime, views, saves, likes, shares, completions }
            users: {}, // userId -> engagement history
            globalStats: {
                totalWatchTime: 0,
                totalViews: 0,
                totalSaves: 0,
                totalLikes: 0
            }
        };
    }

    // Track video watch time (TikTok's #1 signal)
    trackWatchTime(videoId, userId, watchTime) {
        if (!this.data.videos[videoId]) {
            this.data.videos[videoId] = {
                watchTime: 0,
                views: 0,
                saves: 0,
                likes: 0,
                shares: 0,
                completions: 0,
                engagementScore: 0
            };
        }

        this.data.videos[videoId].watchTime += watchTime;
        this.data.videos[videoId].views += 1;
        this.data.globalStats.totalWatchTime += watchTime;
        this.data.globalStats.totalViews += 1;

        console.log(`⏱️ ${videoId}: +${watchTime.toFixed(1)}s watch time (total: ${this.data.videos[videoId].watchTime.toFixed(1)}s)`);

        this.updateEngagementScore(videoId);
    }

    // Track save (Instagram's #1 signal)
    trackSave(videoId, userId) {
        if (!this.data.videos[videoId]) {
            this.data.videos[videoId] = { saves: 0, engagementScore: 0 };
        }

        this.data.videos[videoId].saves += 1;
        this.data.globalStats.totalSaves += 1;

        console.log(`💾 ${videoId}: saved! (total saves: ${this.data.videos[videoId].saves})`);

        this.updateEngagementScore(videoId);
    }

    // Track like
    trackLike(videoId, userId) {
        if (!this.data.videos[videoId]) {
            this.data.videos[videoId] = { likes: 0, engagementScore: 0 };
        }

        this.data.videos[videoId].likes += 1;
        this.data.globalStats.totalLikes += 1;

        this.updateEngagementScore(videoId);
    }

    // Track completion
    trackCompletion(videoId, userId) {
        if (!this.data.videos[videoId]) {
            this.data.videos[videoId] = { completions: 0, engagementScore: 0 };
        }

        this.data.videos[videoId].completions += 1;

        console.log(`✅ ${videoId}: completed! (total completions: ${this.data.videos[videoId].completions})`);

        this.updateEngagementScore(videoId);
    }

    // Track share (TikTok #3 signal - viral indicator)
    trackShare(videoId, userId) {
        if (!this.data.videos[videoId]) {
            this.data.videos[videoId] = { shares: 0, engagementScore: 0 };
        }

        this.data.videos[videoId].shares += 1;
        this.data.globalStats.totalShares = (this.data.globalStats.totalShares || 0) + 1;

        console.log(`📤 ${videoId}: shared! (total shares: ${this.data.videos[videoId].shares})`);

        this.updateEngagementScore(videoId);
    }

    // Track comment (Instagram/TikTok signal - deeper engagement)
    trackComment(videoId, userId) {
        if (!this.data.videos[videoId]) {
            this.data.videos[videoId] = { comments: 0, engagementScore: 0 };
        }

        this.data.videos[videoId].comments += 1;
        this.data.globalStats.totalComments = (this.data.globalStats.totalComments || 0) + 1;

        console.log(`💬 ${videoId}: commented! (total comments: ${this.data.videos[videoId].comments})`);

        this.updateEngagementScore(videoId);
    }

    // Calculate engagement score (TikTok/Instagram algorithm-style)
    updateEngagementScore(videoId) {
        const video = this.data.videos[videoId];
        if (!video) return;

        // Weighted engagement score (matches TikTok/Instagram research)
        const score =
            (video.watchTime || 0) * 2 +        // Watch time = highest weight
            (video.saves || 0) * 10 +            // Saves = 10x weight (Instagram insight)
            (video.completions || 0) * 5 +       // Completions = 5x weight
            (video.comments || 0) * 3 +          // Comments = 3x weight (deeper engagement)
            (video.likes || 0) * 1 +             // Likes = base weight
            (video.shares || 0) * 8;             // Shares = 8x weight

        video.engagementScore = score;

        console.log(`📊 ${videoId} engagement score: ${score.toFixed(1)}`);
    }

    // Get top performing videos
    getTopVideos(limit = 10) {
        const videos = Object.entries(this.data.videos)
            .map(([videoId, data]) => ({ videoId, ...data }))
            .sort((a, b) => b.engagementScore - a.engagementScore)
            .slice(0, limit);

        return {
            success: true,
            videos: videos,
            message: `Top ${videos.length} videos by engagement`
        };
    }

    // Get global stats
    getGlobalStats() {
        return {
            success: true,
            stats: this.data.globalStats,
            message: 'Global engagement statistics'
        };
    }

    // Get video stats
    getVideoStats(videoId) {
        return {
            success: true,
            videoId: videoId,
            stats: this.data.videos[videoId] || { message: 'No data for this video' },
            message: `Stats for ${videoId}`
        };
    }
}

module.exports = new EngagementTracker();
