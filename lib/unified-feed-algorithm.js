/**
 * 🎯 UNIFIED FEED ALGORITHM - The Netflix of Language Learning
 * 
 * Mixes ALL content types (videos, articles, podcasts, music, AI stories)
 * Scores and ranks by: level match, interests, vocabulary overlap, novelty
 * Diversifies content types to prevent repetition
 * 
 * Result: Perfectly personalized feed at user's exact level
 */

const { PrismaClient } = require('@prisma/client');
const feedContentService = require('./feed-content-service');
const prisma = new PrismaClient();

class UnifiedFeedAlgorithm {
    constructor() {
        // 🎯 TikTok-inspired scoring weights
        this.WEIGHTS = {
            levelMatch: 0.30,           // 30% - Most important
            engagementPrediction: 0.25, // 25% - Will they engage? (TikTok priority)
            novelty: 0.20,              // 20% - Fresh content (dopamine spike)
            velocity: 0.15,             // 15% - How fast content is consumed
            socialProof: 0.10           // 10% - Popularity signals
        };

        this.LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        
        // Content type rotation pattern (prevents 10 videos in a row)
        // Variable rotation = unpredictability = dopamine
        this.ROTATION_PATTERN = [
            'video', 'article', 'video', 'music', 'video', 
            'podcast', 'article', 'story', 'video', 'ai-conversation'
        ];
        
        // Preload batch size for infinite scroll (TikTok: preload 20 items)
        this.PRELOAD_BATCH_SIZE = 20;
        
        // Freshness injection rate (10% random/new content for surprise)
        this.FRESHNESS_RATE = 0.10;
        
        console.log('🚀 Unified Feed Algorithm initialized with TikTok mechanics');
    }

    /**
     * Generate unified feed for user (TikTok-enhanced)
     * @param {string} userId - User ID
     * @param {number} limit - Number of items to return
     * @param {Object} options - Additional options
     * @returns {Array} Personalized feed items
     */
    async generateUnifiedFeed(userId, limit = 50, options = {}) {
        try {
            console.log(`🎯 Generating TikTok-style unified feed for user ${userId}...`);
            
            const {
                page = 1,
                includeHistory = false, // For debugging
                injectFreshness = true  // Inject random content for surprise
            } = options;

            // 1. Load user profile with engagement history
            const profile = await this.loadUserProfile(userId);
            console.log(`   User: ${profile.level}, ${profile.vocabularySize} words, interests: ${profile.interests.slice(0, 3).map(i => typeof i === 'string' ? i : i.name).join(', ')}`);

            // 2. Fetch all content types (large pool for filtering)
            const allContent = await this.fetchAllContent(profile);
            console.log(`   Fetched: ${allContent.length} total items`);

            // 3. Filter out recently seen content (TikTok: never show twice)
            const unseenContent = this.filterSeenContent(allContent, profile.history);
            console.log(`   Filtered to ${unseenContent.length} unseen items`);

            // 4. Score each item with TikTok algorithm
            const scored = unseenContent.map(item => ({
                ...item,
                score: this.calculateTikTokScore(item, profile)
            }));

            // 5. Sort by score (TikTok: engagement prediction first)
            const sorted = scored.sort((a, b) => b.score - a.score);

            // 6. Inject freshness: 10% random content for surprise dopamine
            let finalPool = sorted;
            if (injectFreshness && sorted.length > 10) {
                finalPool = this.injectFreshContent(sorted, this.FRESHNESS_RATE);
                console.log(`   Injected ${Math.floor(sorted.length * this.FRESHNESS_RATE)} random items for novelty`);
            }

            // 7. Diversify by content type (prevent 10 videos in a row)
            const diversified = this.diversifyByType(finalPool, limit);

            // 8. Add metadata for prefetching
            const withMetadata = this.addPrefetchMetadata(diversified);

            console.log(`   ✅ Generated ${withMetadata.length} items (Page ${page})`);
            return withMetadata;

        } catch (error) {
            console.error('Error generating unified feed:', error);
            throw error;
        }
    }

    /**
     * Bootstrap new user with starter profile
     * Addresses: "First-session bootstrap needed"
     */
    async bootstrapNewUser(userId) {
        console.log(`   🌱 Bootstrapping new user: ${userId}`);

        // Default starter profile
        const starterProfile = {
            userId,
            level: 'A2', // Start at elementary
            knownWords: [],
            vocabularySize: 0,
            interests: [
                { name: 'culture', weight: 0.3 },
                { name: 'daily life', weight: 0.3 },
                { name: 'entertainment', weight: 0.2 },
                { name: 'news', weight: 0.2 }
            ],
            history: []
        };

        // Create user in database
        try {
            await prisma.user.create({
                data: {
                    id: userId,
                    currentLevel: 'A2',
                    totalXP: 0,
                    streak: 0
                }
            });

            // Seed starter interests
            for (const interest of starterProfile.interests) {
                await prisma.userInterest.create({
                    data: {
                        userId,
                        interest: interest.name,
                        weight: interest.weight
                    }
                }).catch(() => {}); // Ignore if already exists
            }

            console.log(`   ✅ New user bootstrapped`);
        } catch (error) {
            console.log(`   ⚠️  User may already exist: ${error.message}`);
        }

        return starterProfile;
    }

    /**
     * Load user profile with vocabulary and interests
     */
    async loadUserProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                words: {
                    where: { saved: true },
                    select: { word: true }
                },
                interests: {
                    select: { interest: true, weight: true }
                }
            }
        });

        if (!user) {
            // First-session bootstrap: Create user with starter profile
            const newUser = await this.bootstrapNewUser(userId);
            return newUser;
        }

        // Get user's content history
        const history = await prisma.userInteraction.findMany({
            where: {
                userId,
                type: { in: ['video_watched', 'article_read', 'podcast_listened', 'music_played'] }
            },
            select: { contentId: true },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return {
            userId: user.id,
            level: user.currentLevel || 'A2',
            knownWords: user.words.map(w => w.word),
            vocabularySize: user.words.length,
            interests: user.interests.map(i => ({ name: i.interest, weight: i.weight })),
            history: history.map(h => h.contentId)
        };
    }

    /**
     * Fetch all content types from database
     */
    async fetchAllContent(profile) {
        const allContent = [];

        try {
            const videos = await feedContentService.getVideos({ includeTranscript: true });
            const mappedVideos = videos.map(video => ({
                id: video.id,
                type: 'video',
                title: video.title,
                level: video.level || video.cefrLevel || 'A1',
                topics: video.tags || [],
                videoUrl: video.videoUrl,
                thumbnail: video.thumbnail,
                duration: video.duration,
                transcription: video.transcription,
                difficulty: video.difficulty || null,
                source: video.source || 'video'
            }));
            allContent.push(...mappedVideos);
            console.log(`   📹 ${mappedVideos.length} videos`);
        } catch (error) {
            console.warn('   ⚠️  Could not load videos for feed:', error.message);
        }

        try {
            const articles = await feedContentService.getArticles({});
            const mappedArticles = articles.map(article => ({
                id: article.id,
                type: 'article',
                title: article.title,
                level: article.level || 'B1',
                topics: article.topics || [],
                content: article.content,
                summary: article.summary,
                source: article.source || 'article',
                readingTimeMinutes: article.readingTimeMinutes
            }));
            allContent.push(...mappedArticles);
            console.log(`   📰 ${mappedArticles.length} articles`);
        } catch (error) {
            console.warn('   ⚠️  Could not load articles for feed:', error.message);
        }

        return allContent;
    }

    /**
     * Calculate score for a content item
     * @param {Object} item - Content item
     * @param {Object} profile - User profile
     * @returns {number} Score 0-100
     */
    calculateScore(item, profile) {
        const levelScore = this.calculateLevelMatch(item.level, profile.level);
        const interestScore = this.calculateInterestMatch(item.topics, profile.interests);
        const vocabScore = this.calculateVocabularyMatch(item, profile.knownWords);
        const noveltyScore = this.calculateNovelty(item.id, profile.history);
        const engagementScore = this.predictEngagement(item, profile);

        const totalScore = 
            levelScore * this.WEIGHTS.levelMatch +
            interestScore * this.WEIGHTS.interestMatch +
            vocabScore * this.WEIGHTS.vocabularyMatch +
            noveltyScore * this.WEIGHTS.novelty +
            engagementScore * this.WEIGHTS.engagement;

        return Math.round(totalScore * 100) / 100;
    }

    /**
     * Calculate level match score (0-100)
     * Perfect match = 100, ±1 level = 80, ±2 = 40, else 0
     */
    calculateLevelMatch(contentLevel, userLevel) {
        const contentIndex = this.LEVEL_ORDER.indexOf(contentLevel);
        const userIndex = this.LEVEL_ORDER.indexOf(userLevel);
        
        if (contentIndex === -1 || userIndex === -1) return 50; // Unknown level

        const diff = Math.abs(contentIndex - userIndex);
        
        if (diff === 0) return 100; // Perfect match
        if (diff === 1) return 80;  // ±1 level (still good)
        if (diff === 2) return 40;  // ±2 levels (challenging/easy)
        return 0; // Too far
    }

    /**
     * Calculate interest match score (0-100)
     */
    calculateInterestMatch(contentTopics, userInterests) {
        if (!contentTopics || contentTopics.length === 0) return 50; // Neutral
        if (!userInterests || userInterests.length === 0) return 50;

        const userInterestNames = userInterests.map(i => 
            typeof i === 'string' ? i : i.name
        ).map(n => n.toLowerCase());

        const topicMatches = contentTopics.filter(topic => 
            userInterestNames.some(interest => 
                topic.toLowerCase().includes(interest) || 
                interest.includes(topic.toLowerCase())
            )
        );

        if (topicMatches.length === 0) return 30; // No match
        
        const matchRatio = topicMatches.length / contentTopics.length;
        return 50 + (matchRatio * 50); // 50-100 range
    }

    /**
     * Calculate vocabulary match score (0-100)
     * Optimal: 70-85% known words (Krashen's i+1)
     */
    calculateVocabularyMatch(item, knownWords) {
        // If we have the actual content, analyze it
        if (item.content || item.transcriptUrl) {
            try {
                const analyzer = require('./content-difficulty-analyzer');
                const text = item.content || '';
                
                if (text.length > 0) {
                    const analysis = analyzer.analyzeTranscription(text, false);
                    const difficulty = analyzer.calculateDifficultyForUser(analysis, knownWords);
                    
                    const comprehension = difficulty.comprehensionRate / 100;
                    
                    // Score based on goldilocks zone (70-85%)
                    if (comprehension >= 0.70 && comprehension <= 0.85) {
                        return 100; // Perfect!
                    } else if (comprehension < 0.70) {
                        return comprehension * 100; // Too hard
                    } else {
                        return Math.max(0, 100 - (comprehension - 0.85) * 200); // Too easy
                    }
                }
            } catch (error) {
                // Fallback to level-based estimation
            }
        }

        // Fallback: estimate based on level
        return 70; // Assume decent match
    }

    /**
     * Calculate novelty score (0-100)
     * Enhanced: Recency decay + spaced review surfacing
     * Addresses: "Novelty scoring needs recency decay"
     */
    calculateNovelty(contentId, history) {
        if (!history || history.length === 0) return 100; // All content is new

        // Check if seen before
        const seenIndex = history.indexOf(contentId);

        if (seenIndex === -1) {
            return 100; // Never seen - full novelty
        }

        // Calculate recency decay
        // More recent = lower score (don't show again immediately)
        // Older = higher score (allow spaced review)
        const recencyPosition = seenIndex / history.length;

        if (recencyPosition < 0.1) {
            // Seen very recently (last 10% of history)
            return 0; // Don't show again
        } else if (recencyPosition < 0.3) {
            // Seen recently (last 30%)
            return 30; // Low chance
        } else if (recencyPosition < 0.6) {
            // Seen a while ago (30-60%)
            return 60; // Moderate chance (semi-familiar resurface)
        } else {
            // Seen long ago (>60%)
            return 85; // Good for spaced review
        }
    }

    /**
     * Predict engagement score (0-100)
     * Based on content type, length, format
     */
    predictEngagement(item, profile) {
        let score = 50; // Base score

        // Shorter content = higher engagement
        if (item.duration) {
            if (item.duration < 60) score += 20;        // < 1 min
            else if (item.duration < 180) score += 10;  // < 3 min
            else if (item.duration > 600) score -= 20;  // > 10 min
        }

        // Content type preferences
        if (item.type === 'video') score += 10; // Videos are engaging
        if (item.type === 'story') score += 15; // AI stories are personalized
        
        // Has audio = more engaging
        if (item.audioUrl || item.hasAudio) score += 10;

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Diversify content by type to prevent repetition
     * Ensures: video → article → video → music (not 10 videos in a row)
     */
    diversifyByType(sortedContent, limit) {
        const result = [];
        const typeCounters = {};
        let patternIndex = 0;

        // Track how many of each type we've added
        sortedContent.forEach(item => {
            typeCounters[item.type] = (typeCounters[item.type] || 0) + 1;
        });

        // Fill feed following rotation pattern
        while (result.length < limit && sortedContent.length > 0) {
            const targetType = this.ROTATION_PATTERN[patternIndex % this.ROTATION_PATTERN.length];
            
            // Find next item of target type
            const itemIndex = sortedContent.findIndex(item => item.type === targetType);
            
            if (itemIndex !== -1) {
                // Found item of target type
                result.push(sortedContent[itemIndex]);
                sortedContent.splice(itemIndex, 1);
            } else {
                // No items of target type, take best available
                if (sortedContent.length > 0) {
                    result.push(sortedContent[0]);
                    sortedContent.splice(0, 1);
                }
            }
            
            patternIndex++;
        }

        return result;
    }

    /**
     * Calculate TikTok-style score
     * Priority: Engagement prediction > Level match > Novelty > Velocity
     */
    calculateTikTokScore(item, profile) {
        const levelScore = this.calculateLevelMatch(item.level, profile.level);
        const engagementScore = this.predictEngagement(item, profile);
        const noveltyScore = this.calculateNovelty(item.id, profile.history);
        const velocityScore = this.calculateVelocity(item);
        const socialProofScore = this.calculateSocialProof(item);

        const totalScore = 
            levelScore * this.WEIGHTS.levelMatch +
            engagementScore * this.WEIGHTS.engagementPrediction +
            noveltyScore * this.WEIGHTS.novelty +
            velocityScore * this.WEIGHTS.velocity +
            socialProofScore * this.WEIGHTS.socialProof;

        return Math.round(totalScore * 100) / 100;
    }

    /**
     * Calculate velocity score (how fast content is consumed)
     * Faster = more addictive
     */
    calculateVelocity(item) {
        let score = 50;

        // Short content = fast consumption = high velocity
        if (item.duration) {
            if (item.duration < 30) score = 100;       // <30s = instant
            else if (item.duration < 60) score = 90;   // <1min = very fast
            else if (item.duration < 120) score = 70;  // <2min = fast
            else if (item.duration < 300) score = 50;  // <5min = medium
            else score = 30;                           // >5min = slow
        } else if (item.readingTimeMinutes) {
            if (item.readingTimeMinutes < 2) score = 90;
            else if (item.readingTimeMinutes < 5) score = 60;
            else score = 30;
        }

        return score;
    }

    /**
     * Calculate social proof score
     * Popularity signals boost content
     */
    calculateSocialProof(item) {
        let score = 50;

        // Views/engagement (if available)
        if (item.viewCount && item.viewCount > 1000) score += 20;
        if (item.saves && item.saves > 50) score += 15;
        if (item.completionRate && item.completionRate > 0.7) score += 15;

        return Math.min(100, score);
    }

    /**
     * Filter out seen content (TikTok: never show same video twice)
     */
    filterSeenContent(allContent, history) {
        if (!history || history.length === 0) return allContent;

        const seenIds = new Set(history);
        return allContent.filter(item => !seenIds.has(item.id));
    }

    /**
     * Inject fresh/random content for surprise dopamine
     * TikTok: 10% of feed is completely random for discovery
     */
    injectFreshContent(sortedContent, freshnessRate = 0.10) {
        const injectionCount = Math.floor(sortedContent.length * freshnessRate);
        if (injectionCount === 0) return sortedContent;

        const result = [...sortedContent];
        
        // Take random items from the bottom 50% and promote them
        const bottomHalf = result.slice(Math.floor(result.length / 2));
        
        for (let i = 0; i < injectionCount; i++) {
            const randomIndex = Math.floor(Math.random() * bottomHalf.length);
            const randomItem = bottomHalf[randomIndex];
            
            // Insert at random position in top 30%
            const insertPosition = Math.floor(Math.random() * (result.length * 0.3));
            result.splice(insertPosition, 0, randomItem);
        }

        return result;
    }

    /**
     * Add prefetch metadata for infinite scroll
     * Tells client which items to preload
     */
    addPrefetchMetadata(items) {
        return items.map((item, index) => ({
            ...item,
            prefetch: {
                priority: index < 3 ? 'high' : index < 10 ? 'medium' : 'low',
                shouldPreload: index < 5, // Preload first 5 items
                position: index
            }
        }));
    }

    /**
     * Get feed statistics
     */
    async getFeedStats(userId) {
        const profile = await this.loadUserProfile(userId);
        const content = await this.fetchAllContent(profile);

        const stats = {
            totalContent: content.length,
            byType: {},
            byLevel: {},
            userLevel: profile.level,
            vocabularySize: profile.vocabularySize
        };

        content.forEach(item => {
            stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
            stats.byLevel[item.level] = (stats.byLevel[item.level] || 0) + 1;
        });

        return stats;
    }
}

// Export singleton
const unifiedFeedAlgorithm = new UnifiedFeedAlgorithm();
module.exports = unifiedFeedAlgorithm;
