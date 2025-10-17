/**
 * 🎯 INFINITE FEED ALGORITHM
 * 
 * Creates endless, personalized content feed that mixes:
 * - Videos
 * - Quizzes
 * - Games
 * - Articles
 * - AI Stories
 * - Challenges
 * 
 * Smart Pacing:
 * - If user watches 3 videos → insert game
 * - If user skips 2 quizzes → don't show another for 5 videos
 * - If user doing well → increase game frequency
 * - If struggling → show easier content + encouragement
 * 
 * Goal: User never stops scrolling, always learning
 */

const SmartVideoRankingAlgorithm = require('./smart-video-ranking-algorithm');
const VideoQuizGenerator = require('./video-quiz-generator');

class InfiniteFeedAlgorithm {
    constructor() {
        this.videoRanker = new SmartVideoRankingAlgorithm();
        this.quizGenerator = new VideoQuizGenerator();
        
        this.CONTENT_TYPES = {
            VIDEO: 'video',
            QUIZ: 'quiz',
            GAME: 'game',
            ARTICLE: 'article',
            AI_STORY: 'ai_story',
            CHALLENGE: 'challenge',
            ENCOURAGEMENT: 'encouragement'
        };
        
        // Default content pattern (repeating)
        this.DEFAULT_PATTERN = [
            'video', 'video', 'quiz', 'video', 'game', 
            'video', 'video', 'quiz', 'video', 'article',
            'video', 'video', 'game', 'video', 'challenge'
        ];
        
        // User behavior tracking
        this.userBehavior = new Map();
    }
    
    /**
     * Generate personalized feed for user
     */
    async generateFeed(userId, userProfile, options = {}) {
        const {
            batchSize = 20,           // How many items to generate
            startIndex = 0,           // For pagination
            includeTypes = null,      // Filter specific content types
            forceRefresh = false      // Regenerate even if cached
        } = options;
        
        console.log(`📱 Generating feed for user ${userId} (batch: ${batchSize})`);
        
        // Get user behavior patterns
        const behavior = this.getUserBehavior(userId);
        
        // Adjust pattern based on behavior
        const adaptedPattern = this.adaptPatternToBehavior(behavior, userProfile);
        
        // Generate content items
        const feedItems = [];
        
        for (let i = 0; i < batchSize; i++) {
            const patternIndex = (startIndex + i) % adaptedPattern.length;
            const contentType = adaptedPattern[patternIndex];
            
            const item = await this.generateContentItem(
                contentType,
                userId,
                userProfile,
                behavior,
                feedItems.length
            );
            
            if (item) {
                feedItems.push({
                    ...item,
                    feedIndex: startIndex + i,
                    generatedAt: new Date()
                });
            }
        }
        
        return {
            items: feedItems,
            hasMore: true, // Always true for infinite feed!
            nextBatchStart: startIndex + batchSize,
            pattern: adaptedPattern,
            userBehaviorScore: this.calculateBehaviorScore(behavior)
        };
    }
    
    /**
     * Adapt content pattern based on user behavior
     */
    adaptPatternToBehavior(behavior, userProfile) {
        let pattern = [...this.DEFAULT_PATTERN];
        
        // If user loves quizzes → more quizzes
        if (behavior.quizCompletionRate > 0.8) {
            pattern = this.increaseFrequency(pattern, 'quiz', 1.5);
        }
        
        // If user skips quizzes → fewer quizzes
        if (behavior.quizSkipRate > 0.6) {
            pattern = this.decreaseFrequency(pattern, 'quiz', 0.5);
        }
        
        // If user plays games well → more games
        if (behavior.gameSuccessRate > 0.7) {
            pattern = this.increaseFrequency(pattern, 'game', 1.3);
        }
        
        // If user skips videos often → check difficulty
        if (behavior.videoSkipRate > 0.5) {
            // Content might be too hard, insert encouragement
            pattern = this.insertPeriodically(pattern, 'encouragement', 10);
        }
        
        // If user struggling → more support
        if (behavior.overallSuccessRate < 0.5) {
            // Easier content, more encouragement
            pattern = this.insertPeriodically(pattern, 'encouragement', 7);
        }
        
        // If user crushing it → more challenges
        if (behavior.overallSuccessRate > 0.8) {
            pattern = this.increaseFrequency(pattern, 'challenge', 1.2);
        }
        
        return pattern;
    }
    
    /**
     * Generate content item based on type
     */
    async generateContentItem(contentType, userId, userProfile, behavior, currentIndex) {
        switch (contentType) {
            case 'video':
                return await this.generateVideoItem(userId, userProfile, currentIndex);
            
            case 'quiz':
                return this.generateQuizItem(userId, userProfile, currentIndex);
            
            case 'game':
                return this.generateGameItem(userId, userProfile, currentIndex);
            
            case 'article':
                return this.generateArticleItem(userId, userProfile);
            
            case 'ai_story':
                return this.generateAIStoryItem(userId, userProfile);
            
            case 'challenge':
                return this.generateChallengeItem(userId, userProfile);
            
            case 'encouragement':
                return this.generateEncouragementItem(userId, behavior);
            
            default:
                return await this.generateVideoItem(userId, userProfile, currentIndex);
        }
    }
    
    /**
     * Generate video item
     */
    async generateVideoItem(userId, userProfile, currentIndex) {
        // Get available videos (mock for now)
        const allVideos = await this.getAvailableVideos();
        
        // Rank videos for this user
        const rankedVideos = await this.videoRanker.rankVideosForUser(allVideos, userProfile);
        
        // Select video at current index
        const video = rankedVideos[currentIndex % rankedVideos.length];
        
        return {
            type: this.CONTENT_TYPES.VIDEO,
            content: video,
            action: 'watch',
            canSkip: true,
            xpReward: 5
        };
    }
    
    /**
     * Generate quiz item (post-video or standalone)
     */
    generateQuizItem(userId, userProfile, currentIndex) {
        // Generate random quiz or based on recent videos
        return {
            type: this.CONTENT_TYPES.QUIZ,
            content: {
                id: `quiz_${Date.now()}`,
                title: 'Quick Quiz! ⚡',
                questions: 3,
                timeLimit: 15,
                difficulty: userProfile.currentLevel
            },
            action: 'complete',
            canSkip: true,
            xpReward: 15
        };
    }
    
    /**
     * Generate game item
     */
    generateGameItem(userId, userProfile, currentIndex) {
        const gameTypes = [
            'speed_match',
            'memory_cards',
            'word_search',
            'fill_blank',
            'swipe_game'
        ];
        
        const gameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
        
        return {
            type: this.CONTENT_TYPES.GAME,
            content: {
                id: `game_${Date.now()}`,
                gameType: gameType,
                title: this.getGameTitle(gameType),
                duration: 60, // 1 minute
                difficulty: userProfile.currentLevel
            },
            action: 'play',
            canSkip: true,
            xpReward: 20
        };
    }
    
    /**
     * Generate article item
     */
    generateArticleItem(userId, userProfile) {
        return {
            type: this.CONTENT_TYPES.ARTICLE,
            content: {
                id: `article_${Date.now()}`,
                title: 'Interesting Article 📰',
                topic: this.selectTopicForUser(userProfile),
                estimatedReadTime: 5,
                difficulty: userProfile.currentLevel
            },
            action: 'read',
            canSkip: true,
            xpReward: 10
        };
    }
    
    /**
     * Generate AI story item
     */
    generateAIStoryItem(userId, userProfile) {
        return {
            type: this.CONTENT_TYPES.AI_STORY,
            content: {
                id: `story_${Date.now()}`,
                title: 'Personalized Story ✨',
                description: 'A story created just for you using words you know',
                wordsUsed: userProfile.knownWords?.length || 100,
                newWords: 5,
                difficulty: userProfile.currentLevel
            },
            action: 'read',
            canSkip: true,
            xpReward: 25
        };
    }
    
    /**
     * Generate challenge item
     */
    generateChallengeItem(userId, userProfile) {
        const challenges = [
            {
                title: '5-Video Sprint 🏃',
                description: 'Watch 5 videos without skipping',
                goal: 'watch_5_videos',
                reward: 50
            },
            {
                title: 'Quiz Master 🎯',
                description: 'Get 100% on next 3 quizzes',
                goal: 'perfect_quizzes_3',
                reward: 75
            },
            {
                title: 'New Words Hunter 🔍',
                description: 'Learn 10 new words today',
                goal: 'learn_10_words',
                reward: 60
            }
        ];
        
        const challenge = challenges[Math.floor(Math.random() * challenges.length)];
        
        return {
            type: this.CONTENT_TYPES.CHALLENGE,
            content: {
                id: `challenge_${Date.now()}`,
                ...challenge
            },
            action: 'accept',
            canSkip: true,
            xpReward: challenge.reward
        };
    }
    
    /**
     * Generate encouragement item (motivational break)
     */
    generateEncouragementItem(userId, behavior) {
        const messages = [
            {
                title: 'You\'re doing great! 🌟',
                message: 'You\'ve watched 10 videos today. Keep it up!',
                type: 'progress'
            },
            {
                title: 'Take a quick break? ☕',
                message: 'You\'ve been learning for 20 minutes. Rest helps memory!',
                type: 'break'
            },
            {
                title: 'Wow! 💪',
                message: 'You\'re learning faster than 80% of users!',
                type: 'social_proof'
            },
            {
                title: 'Almost there! 🎯',
                message: `Just 2 more words to complete today's goal!`,
                type: 'goal_progress'
            }
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        return {
            type: this.CONTENT_TYPES.ENCOURAGEMENT,
            content: {
                id: `encouragement_${Date.now()}`,
                ...message,
                dismissible: true
            },
            action: 'acknowledge',
            canSkip: true,
            xpReward: 0
        };
    }
    
    /**
     * Track user interaction with feed item
     */
    async trackInteraction(userId, feedItem, interaction) {
        const behavior = this.getUserBehavior(userId);
        
        const { action, success, timeSpent, skipped } = interaction;
        
        // Update behavior stats
        behavior.totalInteractions++;
        
        if (feedItem.type === 'video') {
            behavior.videoInteractions++;
            if (skipped) behavior.videoSkips++;
            if (timeSpent && timeSpent > 15) behavior.videoCompletes++;
        } else if (feedItem.type === 'quiz') {
            behavior.quizInteractions++;
            if (skipped) behavior.quizSkips++;
            if (success) behavior.quizSuccesses++;
        } else if (feedItem.type === 'game') {
            behavior.gameInteractions++;
            if (success) behavior.gameSuccesses++;
        }
        
        // Recalculate rates
        this.updateBehaviorRates(behavior);
        
        // Store updated behavior
        this.userBehavior.set(userId, behavior);
        
        // Check if pattern should be adjusted
        const shouldAdjust = behavior.totalInteractions % 20 === 0;
        
        return {
            tracked: true,
            shouldAdjust,
            behavior
        };
    }
    
    /**
     * Get user behavior data
     */
    getUserBehavior(userId) {
        if (!this.userBehavior.has(userId)) {
            this.userBehavior.set(userId, {
                totalInteractions: 0,
                videoInteractions: 0,
                videoSkips: 0,
                videoCompletes: 0,
                quizInteractions: 0,
                quizSkips: 0,
                quizSuccesses: 0,
                gameInteractions: 0,
                gameSuccesses: 0,
                // Calculated rates
                videoSkipRate: 0,
                quizSkipRate: 0,
                quizCompletionRate: 0,
                gameSuccessRate: 0,
                overallSuccessRate: 0
            });
        }
        
        return this.userBehavior.get(userId);
    }
    
    /**
     * Update behavior rates
     */
    updateBehaviorRates(behavior) {
        behavior.videoSkipRate = behavior.videoInteractions > 0 
            ? behavior.videoSkips / behavior.videoInteractions 
            : 0;
        
        behavior.quizSkipRate = behavior.quizInteractions > 0 
            ? behavior.quizSkips / behavior.quizInteractions 
            : 0;
        
        behavior.quizCompletionRate = behavior.quizInteractions > 0 
            ? behavior.quizSuccesses / behavior.quizInteractions 
            : 0;
        
        behavior.gameSuccessRate = behavior.gameInteractions > 0 
            ? behavior.gameSuccesses / behavior.gameInteractions 
            : 0;
        
        const totalSuccesses = behavior.videoCompletes + behavior.quizSuccesses + behavior.gameSuccesses;
        const totalAttempts = behavior.videoInteractions + behavior.quizInteractions + behavior.gameInteractions;
        
        behavior.overallSuccessRate = totalAttempts > 0 
            ? totalSuccesses / totalAttempts 
            : 0.5;
    }
    
    /**
     * Calculate overall behavior score (0-100)
     */
    calculateBehaviorScore(behavior) {
        const engagement = Math.min(behavior.totalInteractions / 100, 1) * 30;
        const success = behavior.overallSuccessRate * 40;
        const persistence = (1 - (behavior.videoSkipRate + behavior.quizSkipRate) / 2) * 30;
        
        return Math.round(engagement + success + persistence);
    }
    
    // ===== Pattern Manipulation Helpers =====
    
    increaseFrequency(pattern, type, multiplier) {
        const count = pattern.filter(t => t === type).length;
        const newCount = Math.ceil(count * multiplier);
        const toAdd = newCount - count;
        
        for (let i = 0; i < toAdd; i++) {
            const insertIndex = Math.floor(Math.random() * pattern.length);
            pattern.splice(insertIndex, 0, type);
        }
        
        return pattern;
    }
    
    decreaseFrequency(pattern, type, multiplier) {
        const count = pattern.filter(t => t === type).length;
        const newCount = Math.max(1, Math.floor(count * multiplier));
        const toRemove = count - newCount;
        
        for (let i = 0; i < toRemove; i++) {
            const index = pattern.indexOf(type);
            if (index !== -1) {
                pattern.splice(index, 1);
            }
        }
        
        return pattern;
    }
    
    insertPeriodically(pattern, type, frequency) {
        const newPattern = [];
        pattern.forEach((item, idx) => {
            newPattern.push(item);
            if ((idx + 1) % frequency === 0) {
                newPattern.push(type);
            }
        });
        return newPattern;
    }
    
    // ===== Mock Data Functions =====
    
    async getAvailableVideos() {
        // Mock: return fake videos
        // In production, query database
        return Array.from({ length: 100 }, (_, i) => ({
            id: `video_${i}`,
            title: `Spanish Video ${i}`,
            path: `/videos/video_${i}.mp4`,
            difficulty: ['A1', 'A2', 'B1', 'B2'][Math.floor(Math.random() * 4)],
            duration: 30 + Math.floor(Math.random() * 60),
            topics: ['food', 'travel', 'culture'][Math.floor(Math.random() * 3)]
        }));
    }
    
    getGameTitle(gameType) {
        const titles = {
            speed_match: 'Speed Match ⚡',
            memory_cards: 'Memory Cards 🃏',
            word_search: 'Word Hunt 🔍',
            fill_blank: 'Fill the Blanks ✍️',
            swipe_game: 'Swipe & Learn 👆'
        };
        return titles[gameType] || 'Fun Game! 🎮';
    }
    
    selectTopicForUser(userProfile) {
        const topics = ['Food & Dining', 'Travel', 'Daily Life', 'Work', 'Culture', 'Sports'];
        return topics[Math.floor(Math.random() * topics.length)];
    }
}

module.exports = InfiniteFeedAlgorithm;

