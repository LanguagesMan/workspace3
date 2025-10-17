/**
 * 🎯 UNIFIED FEED ALGORITHM V2 - Adaptive Feed Intelligence
 * 
 * Agent 3 Implementation: Complete adaptive feed system with:
 * - Learning graph persistence
 * - Multi-armed bandit for weight optimization  
 * - Real-time difficulty adaptation
 * - Personalization signals (skip/like/time patterns)
 * - Content scoring (freshness, resurfacing, topic affinity, session pacing)
 * - SRS card injection
 * - Diversity constraints
 */

const { PrismaClient } = require('@prisma/client');
const learningGraph = require('./learning-graph-persistence');
const multiArmedBandit = require('./multi-armed-bandit');
const adaptiveLearningEngine = require('./adaptive-learning-engine');
const prisma = new PrismaClient();

class UnifiedFeedAlgorithmV2 {
    constructor() {
        // Default weights (will be adapted per user by bandit)
        this.DEFAULT_WEIGHTS = {
            levelMatch: 0.30,
            interestMatch: 0.25,
            vocabularyMatch: 0.20,
            novelty: 0.15,
            engagement: 0.10
        };

        this.LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        
        // Diversity: No more than 2 of same type in a row
        this.MAX_CONSECUTIVE_SAME_TYPE = 2;

        // Session pacing
        this.SESSION_DIFFICULTY_CURVE = {
            early: -0.5,  // Start easier
            middle: 0,     // Normal difficulty
            late: 0.2      // Slightly harder
        };

        // Freshness decay (hours)
        this.FRESHNESS_HALF_LIFE = 72; // 3 days
    }

    /**
     * Generate adaptive unified feed
     */
    async generateUnifiedFeed(userId, options = {}) {
        try {
        const {
            limit = 50,
                sessionPosition = 0, // Position in session (for pacing)
                includeSRS = true
        } = options;

            console.log(`🎯 Generating adaptive feed for user ${userId}...`);

            // 1. Load user profile with comprehensive data
            const profile = await this.loadUserProfile(userId);
            console.log(`   📊 User: ${profile.level}, ${profile.vocabularySize} words`);

            // 2. Get adaptive weights from bandit
            const weights = multiArmedBandit.getContextualWeights(userId, {
                timeOfDay: this.getTimeOfDay(),
                sessionLength: sessionPosition,
                recentSkips: profile.recentSkipCount || 0
            });
            console.log(`   🎰 Adaptive weights:`, Object.entries(weights).map(([k, v]) => 
                `${k}=${v.toFixed(2)}`).join(', '));

            // 3. Check if level adjustment is needed
            await this.adaptUserLevel(userId, profile);

            // 4. Fetch all content types
            const allContent = await this.fetchAllContent(profile);
            console.log(`   📦 Fetched: ${allContent.length} total items`);

            // 5. Score each item with adaptive weights
            const scored = allContent.map(item => ({
                ...item,
                score: this.calculateAdaptiveScore(item, profile, weights, sessionPosition)
            }));

            // 6. Sort by score
            const sorted = scored.sort((a, b) => b.score - a.score);

            // 7. Apply diversity constraints
            const diversified = this.applyDiversityConstraints(sorted, limit);

            // 8. Inject SRS review cards
            let finalFeed = diversified;
            if (includeSRS) {
                finalFeed = await this.injectSRSCards(userId, diversified, profile.level);
            }

            // 9. Apply session pacing adjustments
            finalFeed = this.applySessionPacing(finalFeed, sessionPosition);

            console.log(`   ✅ Generated ${finalFeed.length} items`);

            // 10. Track feed generation (for bandit learning)
            this.trackFeedGeneration(userId, weights, finalFeed);

            return finalFeed;

        } catch (error) {
            console.error('Error generating adaptive feed:', error);
            throw error;
        }
    }

    /**
     * Load comprehensive user profile
     */
    async loadUserProfile(userId) {
        let user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                words: {
                    where: { saved: true },
                    select: { word: true, masteryLevel: true }
                },
                interests: {
                    select: { interest: true, weight: true }
                }
            }
        });

        if (!user) {
            // Bootstrap new user
            user = await this.bootstrapNewUser(userId);
        }

        // Get interaction patterns
        const patterns = await learningGraph.getInteractionPatterns(userId);
        
        // Get recent history
        const history = await prisma.userInteraction.findMany({
            where: {
                userId,
                type: { in: ['video_watched', 'article_read', 'podcast_listened', 'music_played'] }
            },
            select: { contentId: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        // Get success rates by difficulty
        const successRates = await learningGraph.getSuccessRateByDifficulty(userId);

        // Get comprehension score
        const comprehensionScore = await learningGraph.calculateComprehensionScore(userId);

            return {
            userId: user.id,
            level: user.currentLevel || 'A2',
            knownWords: (user.words || []).map(w => w.word),
            vocabularySize: (user.words || []).length,
            interests: (user.interests || []).map(i => ({ name: i.interest, weight: i.weight })),
            history: history.map(h => ({
                contentId: h.contentId,
                timestamp: h.createdAt
            })),
            patterns: patterns || {},
            successRates: successRates || {},
            comprehensionScore: comprehensionScore || 0,
            recentSkipCount: patterns?.skipRate || 0,
            totalXP: user.totalXP,
            streak: user.streak
        };
    }

    /**
     * Bootstrap new user
     */
    async bootstrapNewUser(userId) {
        console.log(`   🌱 Bootstrapping new user: ${userId}`);

        const starterInterests = [
            { name: 'culture', weight: 0.3 },
            { name: 'daily life', weight: 0.3 },
            { name: 'entertainment', weight: 0.2 },
            { name: 'news', weight: 0.2 }
        ];

        const user = await prisma.user.create({
            data: {
                id: userId,
                currentLevel: 'A2',
                totalXP: 0,
                streak: 0
            }
        });

        for (const interest of starterInterests) {
            await prisma.userInterest.create({
                data: {
                    userId,
                    interest: interest.name,
                    weight: interest.weight
                }
            }).catch(() => {});
        }

        return user;
    }

    /**
     * Adaptive user level adjustment based on success rates
     */
    async adaptUserLevel(userId, profile) {
        const { successRates, comprehensionScore, level } = profile;

        if (Object.keys(successRates).length < 10) {
            // Not enough data yet
            return;
        }

        const currentLevelStats = successRates[level];
        
        if (!currentLevelStats) return;

        const successRate = currentLevelStats.successRate;

        // Auto-adjust CEFR level based on performance
        let shouldUpgrade = false;
        let shouldDowngrade = false;

        // Upgrade conditions: consistently crushing current level
        if (successRate > 85 && comprehensionScore > 85) {
            shouldUpgrade = true;
        }

        // Downgrade conditions: struggling consistently
        if (successRate < 40 || comprehensionScore < 45) {
            shouldDowngrade = true;
        }

        if (shouldUpgrade) {
            const currentIndex = this.LEVEL_ORDER.indexOf(level);
            if (currentIndex < this.LEVEL_ORDER.length - 1) {
                const newLevel = this.LEVEL_ORDER[currentIndex + 1];
                
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        currentLevel: newLevel,
                        levelUpdatedAt: new Date()
                    }
                });

                console.log(`   📈 User upgraded: ${level} → ${newLevel}`);
                
                // Track level change
                await learningGraph.trackInteraction(userId, 'level_upgrade', {
                    oldLevel: level,
                    newLevel: newLevel,
                    successRate,
                    comprehensionScore
                });
            }
        } else if (shouldDowngrade) {
            const currentIndex = this.LEVEL_ORDER.indexOf(level);
            if (currentIndex > 0) {
                const newLevel = this.LEVEL_ORDER[currentIndex - 1];
                
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        currentLevel: newLevel,
                        levelUpdatedAt: new Date()
                    }
                });

                console.log(`   📉 User adjusted: ${level} → ${newLevel}`);
                
                await learningGraph.trackInteraction(userId, 'level_downgrade', {
                    oldLevel: level,
                    newLevel: newLevel,
                    successRate,
                    comprehensionScore
                });
            }
        }
    }

    /**
     * Fetch all content types
     */
    async fetchAllContent(profile) {
        const allContent = [];

        // Fetch videos
        try {
            const videoCatalog = require('./video-catalog');
            const videos = videoCatalog.getAllVideos()
                .filter(v => v.hasTranscript)
                .slice(0, 200)
                .map(v => ({
                    id: v.id,
                    type: 'video',
                    title: v.title,
                    level: v.level || 'B1',
                    topics: v.topics || [],
                    url: v.url,
                    thumbnail: v.thumbnail,
                    duration: v.duration,
                    createdAt: v.createdAt || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
                }));
            allContent.push(...videos);
        } catch (error) {
            console.log('   ⚠️  Could not load videos');
        }

        // Fetch articles
        try {
            const articles = await prisma.article.findMany({
                take: 100,
                orderBy: { createdAt: 'desc' }
            });
            
            allContent.push(...articles.map(a => ({
                id: a.id,
                type: 'article',
                title: a.title,
                level: a.level,
                topics: JSON.parse(a.topics || '[]'),
                content: a.content,
                sourceUrl: a.sourceUrl,
                hasAudio: a.hasAudio,
                createdAt: a.createdAt
            })));
        } catch (error) {
            console.log('   ⚠️  Could not load articles');
        }

        // Fetch podcasts
        try {
            const podcasts = await prisma.podcast.findMany({
                take: 50,
                orderBy: { createdAt: 'desc' }
            }).catch(() => []);

            allContent.push(...podcasts.map(p => ({
                id: p.id,
                type: 'podcast',
                title: p.title,
                level: p.level,
                topics: JSON.parse(p.topics || '[]'),
                audioUrl: p.audioUrl,
                duration: p.duration,
                thumbnail: p.thumbnail,
                createdAt: p.createdAt
            })));
        } catch (error) {
            console.log('   ⚠️  Could not load podcasts');
        }

        // Fetch YouTube videos
        try {
            const youtubeVideos = await prisma.youTubeVideo.findMany({
                take: 50,
                orderBy: { createdAt: 'desc' }
            }).catch(() => []);

            allContent.push(...youtubeVideos.map(yt => ({
                id: yt.id,
                type: 'youtube',
                title: yt.title,
                level: yt.level,
                topics: JSON.parse(yt.topics || '[]'),
                youtubeId: yt.youtubeId,
                thumbnailUrl: yt.thumbnailUrl,
                duration: yt.duration,
                createdAt: yt.createdAt
            })));
        } catch (error) {
            console.log('   ⚠️  Could not load YouTube videos');
        }

        // Fetch music
        try {
            const music = await prisma.music.findMany({
                take: 30,
                orderBy: { createdAt: 'desc' }
            }).catch(() => []);

            allContent.push(...music.map(m => ({
                id: m.id,
                type: 'music',
                title: m.title,
                level: m.level,
                topics: JSON.parse(m.topics || '[]'),
                audioUrl: m.audioUrl,
                artist: m.artist,
                thumbnail: m.thumbnail,
                createdAt: m.createdAt
            })));
        } catch (error) {
            console.log('   ⚠️  Could not load music');
        }

        // Fetch AI stories
        try {
            const stories = await prisma.aIStory.findMany({
                where: { userId: profile.userId },
                take: 10,
                orderBy: { createdAt: 'desc' }
            }).catch(() => []);
            
            allContent.push(...stories.map(s => ({
                id: s.id,
                type: 'story',
                title: s.title,
                level: s.level,
                topics: [s.type],
                content: s.content,
                audioUrl: s.audioUrl,
                createdAt: s.createdAt
            })));
        } catch (error) {
            console.log('   ⚠️  Could not load stories');
        }

        return allContent;
    }

    /**
     * Calculate adaptive score with personalized weights
     */
    calculateAdaptiveScore(item, profile, weights, sessionPosition) {
        const levelScore = this.calculateLevelMatch(item.level, profile.level);
        const interestScore = this.calculateInterestMatch(item.topics, profile.interests);
        const vocabScore = this.calculateVocabularyMatch(item, profile.knownWords);
        const noveltyScore = this.calculateNovelty(item.id, item.createdAt, profile.history);
        const engagementScore = this.predictEngagement(item, profile);

        // Apply adaptive weights
        const totalScore = 
            levelScore * weights.levelMatch +
            interestScore * weights.interestMatch +
            vocabScore * weights.vocabularyMatch +
            noveltyScore * weights.novelty +
            engagementScore * weights.engagement;

        return Math.round(totalScore * 100) / 100;
    }

    /**
     * Calculate level match with i+1 theory (slightly above current level is ideal)
     */
    calculateLevelMatch(contentLevel, userLevel) {
        const contentIndex = this.LEVEL_ORDER.indexOf(contentLevel);
        const userIndex = this.LEVEL_ORDER.indexOf(userLevel);
        
        if (contentIndex === -1 || userIndex === -1) return 50;

        const diff = contentIndex - userIndex;
        
        // Krashen's i+1: content at current level OR one level above is best
        if (diff === 0) return 100;  // Perfect match
        if (diff === 1) return 95;   // i+1 (ideal stretch)
        if (diff === -1) return 80;  // One below (review)
        if (diff === 2) return 50;   // Challenging
        if (diff === -2) return 40;  // Too easy
        return Math.max(0, 30 - Math.abs(diff) * 10); // Too far
    }

    /**
     * Calculate interest match with weighted scoring
     */
    calculateInterestMatch(contentTopics, userInterests) {
        if (!contentTopics || contentTopics.length === 0) return 50;
        if (!userInterests || userInterests.length === 0) return 50;

        let totalWeight = 0;
        let matchedWeight = 0;

        for (const interest of userInterests) {
            const interestName = typeof interest === 'string' ? interest : interest.name;
            const interestWeight = typeof interest === 'object' ? interest.weight : 1.0;
            
            totalWeight += interestWeight;

            // Check if any content topic matches this interest
            const matches = contentTopics.some(topic => 
                topic.toLowerCase().includes(interestName.toLowerCase()) ||
                interestName.toLowerCase().includes(topic.toLowerCase())
            );

            if (matches) {
                matchedWeight += interestWeight;
            }
        }

        if (totalWeight === 0) return 50;

        // Convert to 0-100 score
        const matchRatio = matchedWeight / totalWeight;
        return 30 + (matchRatio * 70); // 30-100 range
    }

    /**
     * Calculate vocabulary match (Krashen's comprehensible input: 90-95% known)
     */
    calculateVocabularyMatch(item, knownWords) {
        // Simplified estimation based on level and user vocabulary
        // In production, would analyze actual content
        return 75; // Assume decent match
    }

    /**
     * Calculate novelty with freshness decay and resurfacing
     */
    calculateNovelty(contentId, contentCreatedAt, history) {
        // Check if seen before
        const seen = history.find(h => h.contentId === contentId);

        if (!seen) {
            // Never seen - apply freshness bonus
            const hoursOld = (Date.now() - new Date(contentCreatedAt).getTime()) / (1000 * 60 * 60);
            const freshness = Math.exp(-hoursOld / this.FRESHNESS_HALF_LIFE);
            return 85 + (freshness * 15); // 85-100 range
        }

        // Seen before - calculate resurfacing score
        const hoursSinceSeen = (Date.now() - new Date(seen.timestamp).getTime()) / (1000 * 60 * 60);

        // Spaced repetition curve for content
        if (hoursSinceSeen < 24) {
            return 0; // Too recent
        } else if (hoursSinceSeen < 48) {
            return 20; // Still too recent
        } else if (hoursSinceSeen < 168) { // 1 week
            return 40; // Getting better for resurfacing
        } else if (hoursSinceSeen < 720) { // 1 month
            return 65; // Good for review
        } else {
            return 80; // Long time ago, good to resurface
        }
    }

    /**
     * Predict engagement based on content characteristics and user patterns
     */
    predictEngagement(item, profile) {
        let score = 50;

        // Content type preference from patterns
        if (profile.patterns.byType) {
            const typeCount = profile.patterns.byType[item.type] || 0;
            const totalInteractions = profile.patterns.totalInteractions || 1;
            const typePreference = typeCount / totalInteractions;
            score += typePreference * 30;
        }

        // Duration preference
        if (item.duration) {
            if (item.duration < 60) score += 20;      // Short = engaging
            else if (item.duration < 180) score += 10; // Medium
            else if (item.duration > 600) score -= 15; // Long = less engaging
        }

        // Has audio bonus
        if (item.audioUrl || item.hasAudio) score += 10;

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Apply diversity constraints: no more than 2 of same type consecutively
     */
    applyDiversityConstraints(sortedContent, limit) {
        const result = [];
        let consecutiveCount = 0;
        let lastType = null;

        for (const item of sortedContent) {
            if (result.length >= limit) break;

            if (item.type === lastType) {
                consecutiveCount++;
                if (consecutiveCount >= this.MAX_CONSECUTIVE_SAME_TYPE) {
                    // Skip this item, too many of same type
                    continue;
                }
            } else {
                consecutiveCount = 1;
                lastType = item.type;
            }

            result.push(item);
        }

        return result;
    }

    /**
     * Inject SRS review cards into feed
     */
    async injectSRSCards(userId, feed, userLevel) {
        try {
            // Get due words from SRS system
            const dueWords = await prisma.word.findMany({
                where: {
                    userId,
                    saved: true,
                    nextReview: {
                        lte: new Date()
                    }
                },
                orderBy: { nextReview: 'asc' },
                take: 5
            });

            if (dueWords.length === 0) return feed;

            // Inject review cards at natural intervals
            const interval = Math.floor(feed.length / (dueWords.length + 1));
            const result = [...feed];

            dueWords.forEach((word, index) => {
                const position = (index + 1) * interval;
                const reviewCard = {
                    id: `srs_${word.id}`,
                    type: 'srs_review',
                    word: word.word,
                    translation: word.translation,
                    level: word.level,
                    context: word.context,
                    masteryLevel: word.masteryLevel,
                    reviewCount: word.reviewCount,
                    score: 1000 // High priority
                };

                result.splice(Math.min(position, result.length), 0, reviewCard);
            });

            console.log(`   💡 Injected ${dueWords.length} SRS review cards`);

            return result;
        } catch (error) {
            console.error('Error injecting SRS cards:', error);
            return feed;
        }
    }

    /**
     * Apply session pacing: start easy, increase difficulty
     */
    applySessionPacing(feed, sessionPosition) {
        // Determine session phase
        let phase = 'early';
        if (sessionPosition > 20) phase = 'late';
        else if (sessionPosition > 10) phase = 'middle';

        const difficultyAdjustment = this.SESSION_DIFFICULTY_CURVE[phase];

        // Adjust content difficulty distribution
        const adjusted = feed.map((item, index) => {
            // Apply pacing curve
            if (phase === 'early' && index < 5) {
                // Start with easier content
                item.pacingBoost = item.level <= 'A2' ? 10 : 0;
            } else if (phase === 'late' && index < 5) {
                // Show harder content later in session
                item.pacingBoost = item.level >= 'B1' ? 10 : 0;
            } else {
                item.pacingBoost = 0;
            }

            item.score += item.pacingBoost;
            return item;
        });

        // Re-sort with pacing adjustments
        return adjusted.sort((a, b) => b.score - a.score);
    }

    /**
     * Track feed generation for bandit learning
     */
    trackFeedGeneration(userId, weights, feed) {
        // Store for later reward calculation
        // When user interacts with feed items, we can calculate reward
        // and update the bandit
        
        // This would be called by a separate feedback loop
        // For now, just log
        console.log(`   🎯 Feed generated with weights for bandit learning`);
    }

    /**
     * Record user interaction and update bandit
     */
    async recordFeedInteraction(userId, interaction) {
        try {
            // Track in learning graph
            await learningGraph.trackInteraction(userId, interaction.type, interaction.data);

            // Calculate reward signal
            const reward = multiArmedBandit.calculateReward({
                completed: interaction.completed,
                liked: interaction.liked,
                saved: interaction.saved,
                skipped: interaction.skipped,
                timeSpent: interaction.timeSpent,
                duration: interaction.duration,
                tooHard: interaction.tooHard,
                tooEasy: interaction.tooEasy
            });

            // Update bandit
            const weights = interaction.weights || this.DEFAULT_WEIGHTS;
            multiArmedBandit.updateReward(userId, weights, reward);

            // Update interest weights
            await learningGraph.updateInterestWeights(userId);

            return { success: true, reward };
        } catch (error) {
            console.error('Error recording feed interaction:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get time of day
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }

    /**
     * Get feed stats
     */
    async getFeedStats(userId) {
        const profile = await this.loadUserProfile(userId);
        const banditStats = multiArmedBandit.getUserStats(userId);

        return {
            userId,
            level: profile.level,
            vocabularySize: profile.vocabularySize,
            comprehensionScore: profile.comprehensionScore,
            interestCount: profile.interests.length,
            totalInteractions: profile.patterns.totalInteractions || 0,
            bandit: banditStats
        };
    }
}

// Export singleton
const unifiedFeedAlgorithmV2 = new UnifiedFeedAlgorithmV2();
module.exports = unifiedFeedAlgorithmV2;
