/**
 * 🎯 DIFFICULTY FEED INTEGRATION
 * Integrates difficulty badges with video feed
 * Fetches difficulty data and displays badges automatically
 */

class DifficultyFeedIntegration {
    constructor() {
        this.badgeCreator = new DifficultyBadge();
        this.cache = new Map();
        this.userId = this.getCurrentUserId();
    }

    /**
     * Get current user ID
     * @returns {string|null} User ID
     */
    getCurrentUserId() {
        // Try to get from localStorage or session
        return localStorage.getItem('userId') || 
               sessionStorage.getItem('userId') ||
               'demo-user'; // Fallback for demo
    }

    /**
     * Initialize difficulty badges on feed
     */
    async init() {
        console.log('🎯 Initializing difficulty badges...');

        // Find all video elements
        const videoElements = document.querySelectorAll('[data-video-id]');
        
        console.log(`Found ${videoElements.length} videos to analyze`);

        // Add badges to each video
        for (const videoEl of videoElements) {
            const videoId = videoEl.dataset.videoId;
            if (videoId) {
                await this.addBadgeToVideo(videoEl, videoId);
            }
        }

        // Set up observer for dynamically loaded videos
        this.observeNewVideos();
    }

    /**
     * Add difficulty badge to video element
     * @param {HTMLElement} videoEl - Video element
     * @param {string} videoId - Video ID
     */
    async addBadgeToVideo(videoEl, videoId) {
        try {
            // Check cache first
            if (this.cache.has(videoId)) {
                const data = this.cache.get(videoId);
                this.badgeCreator.injectIntoVideo(videoEl, data);
                return;
            }

            // Fetch difficulty data
            const difficulty = await this.fetchDifficulty(videoId);
            
            if (difficulty) {
                this.cache.set(videoId, difficulty);
                this.badgeCreator.injectIntoVideo(videoEl, difficulty);
            }

        } catch (error) {
            console.error(`Error adding badge to ${videoId}:`, error);
        }
    }

    /**
     * Fetch difficulty data for content
     * @param {string} contentId - Content ID
     * @returns {Promise<Object>} Difficulty data
     */
    async fetchDifficulty(contentId) {
        try {
            // Try user-specific difficulty first
            const response = await fetch(`/api/content/difficulty/${this.userId}/${contentId}`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.difficulty) {
                    return {
                        level: data.contentInfo?.level || 'B1',
                        comprehension: Math.round(data.difficulty.comprehensionRate),
                        newWords: data.difficulty.unknownWordCount,
                        status: data.difficulty.difficulty,
                        goldilocksScore: data.difficulty.goldilocksScore
                    };
                }
            }

            // Fallback to general content analysis
            const generalResponse = await fetch(`/api/content/analyzed/${contentId}`);
            
            if (generalResponse.ok) {
                const data = await generalResponse.json();
                
                if (data.success && data.content) {
                    return {
                        level: data.content.level,
                        comprehension: data.content.comprehensionRate || 80,
                        newWords: Math.round(data.content.metrics.uniqueWords * 0.15),
                        status: 'Unknown',
                        goldilocksScore: 50
                    };
                }
            }

            return null;

        } catch (error) {
            console.error('Error fetching difficulty:', error);
            return null;
        }
    }

    /**
     * Observe DOM for new videos
     */
    observeNewVideos() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check if node itself is a video element
                        if (node.dataset?.videoId) {
                            this.addBadgeToVideo(node, node.dataset.videoId);
                        }
                        
                        // Check children
                        const videos = node.querySelectorAll?.('[data-video-id]');
                        videos?.forEach(videoEl => {
                            this.addBadgeToVideo(videoEl, videoEl.dataset.videoId);
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Update badge for specific video
     * @param {string} videoId - Video ID
     */
    async updateBadge(videoId) {
        // Clear cache
        this.cache.delete(videoId);

        // Find and update video element
        const videoEl = document.querySelector(`[data-video-id="${videoId}"]`);
        if (videoEl) {
            await this.addBadgeToVideo(videoEl, videoId);
        }
    }

    /**
     * Batch load difficulties for multiple videos
     * @param {Array<string>} videoIds - Array of video IDs
     * @returns {Promise<Object>} Map of videoId -> difficulty data
     */
    async batchLoadDifficulties(videoIds) {
        try {
            const response = await fetch('/api/content/batch-analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ contentIds: videoIds })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Cache results
                const difficultyMap = {};
                data.results?.forEach(item => {
                    const difficulty = {
                        level: item.level,
                        comprehension: 80, // Estimate
                        newWords: Math.round(item.uniqueWords * 0.15),
                        status: 'Unknown',
                        goldilocksScore: 50
                    };
                    
                    this.cache.set(item.id, difficulty);
                    difficultyMap[item.id] = difficulty;
                });

                return difficultyMap;
            }

        } catch (error) {
            console.error('Error batch loading difficulties:', error);
        }

        return {};
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.difficultyFeed = new DifficultyFeedIntegration();
        window.difficultyFeed.init();
    });
} else {
    window.difficultyFeed = new DifficultyFeedIntegration();
    window.difficultyFeed.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DifficultyFeedIntegration;
}

