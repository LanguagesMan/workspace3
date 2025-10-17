/**
 * 🧠 PERSONALIZED SRS FEED SYSTEM (2025)
 * Combines TikTok/Instagram addictive feed mechanics with spaced repetition
 *
 * Features (Based on 2025 competitive research):
 * - AI-driven personalization (like TikTok's 58.4min/day engagement)
 * - Spaced repetition integration (reinforces learned words)
 * - Performance optimization (lazy loading, virtual scroll)
 * - Satisfies ALL daily browsing needs (news, social, videos, memes)
 * - Level-adaptive content (A0-C2)
 */

const srsSystem = require('./srs-system');
const { SmartFeedSystem } = require('./smart-feed-system');
const RealContentAggregator = require('./real-content-aggregator');

class PersonalizedSRSFeed {
    constructor() {
        this.smartFeed = new SmartFeedSystem();
        this.aggregator = new RealContentAggregator();

        // User profiles cache (in production: use database)
        this.userProfiles = new Map();

        console.log('🧠 Personalized SRS Feed System initialized');
    }

    /**
     * Get personalized feed for user with SRS integration
     * Competitive insight: TikTok's algorithm analyzes behavior for personalization
     *
     * @param {string} userId - User ID
     * @param {Object} options - Feed options
     * @returns {Object} - Personalized feed with SRS-optimized content
     */
    async getPersonalizedFeed(userId, options = {}) {
        const {
            page = 1,
            limit = 20, // Instagram 2025: Load 20 items per batch
            level = 'A2',
            interests = ['news', 'culture', 'technology'],
            includeReviews = true // Include SRS review cards in feed
        } = options;

        console.log(`🎯 Generating personalized feed for ${userId} (Level: ${level})`);

        // Step 1: Get user's learning profile
        const userProfile = await this.getUserProfile(userId);
        const knownWords = await this.getKnownWords(userId);

        // Step 2: Get SRS cards due for review
        let dueCards = [];
        if (includeReviews) {
            try {
                const dueResult = await srsSystem.getDueCards(userId, 5);
                dueCards = dueResult?.cards || [];
            } catch (error) {
                console.warn('⚠️ Failed to load due SRS cards:', error.message);
            }
        }

        // Step 3: Aggregate fresh content from all sources
        // TikTok pattern: Fetch lots of content for endless scroll
        let freshContent = [];

        try {
            freshContent = await this.aggregator.aggregateContent(userId, {
                interests,
                level,
                limit: 100, // Fetch more than needed for smart filtering
                contentTypes: ['news', 'social', 'video', 'article', 'meme', 'culture', 'post']
            });
        } catch (error) {
            console.warn('⚠️ Content aggregator failed, using demo content:', error.message);
            // Fallback to demo content
            freshContent = this.getDemoContent(level);
        }

        // Step 4: Apply smart filtering (90/10 comprehensible input)
        let optimalContent = freshContent; // Use all content for now (smart filtering can be too aggressive)

        // Optional: Apply smart filtering if we have enough content
        if (freshContent.length > 20) {
            try {
                optimalContent = this.smartFeed.getPersonalizedFeed(
                    { level, knownWords, interests },
                    freshContent
                );
            } catch (error) {
                console.warn('⚠️ Smart filtering failed, using all content:', error.message);
                optimalContent = freshContent;
            }
        }

        // Step 5: Integrate SRS review cards into feed
        // Instagram pattern: Mix sponsored content naturally
        const feedWithSRS = this.integrateSRSCards(optimalContent, dueCards);

        // Step 6: Apply engagement-based ranking
        // TikTok 2025: Prioritize content likely to trigger engagement
        const rankedFeed = this.rankByEngagementPotential(feedWithSRS, userProfile);

        // Step 7: Optimize for lazy loading (performance)
        const paginatedFeed = this.paginateContent(rankedFeed, page, limit);

        // Step 8: Track what user sees (for future personalization)
        await this.trackShownContent(userId, paginatedFeed);

        return {
            success: true,
            feed: paginatedFeed,
            pagination: {
                page,
                limit,
                total: rankedFeed.length,
                hasMore: (page * limit) < rankedFeed.length
            },
            metadata: {
                userId,
                level,
                interests,
                dueReviews: dueCards.length,
                knownWordsCount: knownWords.length,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Get user profile (learning history, preferences, engagement)
     */
    async getUserProfile(userId) {
        if (this.userProfiles.has(userId)) {
            return this.userProfiles.get(userId);
        }

        // Initialize new user profile
        const profile = {
            userId,
            level: 'A2',
            interests: ['news', 'culture'],
            knownWords: [],
            engagementHistory: [],
            lastActive: new Date(),
            streak: 0,
            totalWords: 0,
            totalArticles: 0
        };

        this.userProfiles.set(userId, profile);
        return profile;
    }

    /**
     * Get user's known words from SRS system
     */
    async getKnownWords(userId) {
        try {
            const { cards = [] } = await srsSystem.getAllCards(userId);

            // Words reviewed correctly 2+ times are "known"
            return cards
                .filter(card => card.correctReviews >= 2)
                .map(card => card.word.toLowerCase());
        } catch (error) {
            console.warn('⚠️ Failed to fetch known words:', error.message);
            return [];
        }
    }

    /**
     * Integrate SRS review cards into content feed
     * TikTok/Instagram pattern: Mix ads naturally (we mix reviews naturally)
     */
    integrateSRSCards(content, dueCards) {
        if (dueCards.length === 0) return content;

        const feed = [...content];
        const interval = Math.floor(feed.length / dueCards.length) || 1;

        // Insert review cards at natural intervals (every N items)
        dueCards.forEach((card, index) => {
            const position = (index + 1) * interval;
            const reviewItem = {
                id: `srs_review_${card.id}`,
                type: 'srs_review',
                word: card.word,
                translation: card.translation,
                context: card.context,
                nextReviewAt: card.nextReviewAt,
                interval: card.interval,
                priority: 'high' // SRS reviews are high priority
            };

            feed.splice(Math.min(position, feed.length), 0, reviewItem);
        });

        return feed;
    }

    /**
     * Rank content by engagement potential
     * TikTok 2025: AI predicts what keeps you scrolling
     */
    rankByEngagementPotential(content, userProfile) {
        return content.map(item => {
            let score = 0;

            // Interest match (+30)
            if (userProfile.interests.some(interest =>
                item.category?.includes(interest) || item.tags?.includes(interest)
            )) {
                score += 30;
            }

            // Optimal difficulty (+40)
            if (item.comprehensibilityScore?.isOptimal) {
                score += 40;
            }

            // Content type preference (based on history)
            const preferredTypes = this.getUserPreferredTypes(userProfile);
            if (preferredTypes.includes(item.type)) {
                score += 20;
            }

            // Freshness bonus (+10 for recent)
            const ageHours = (Date.now() - new Date(item.publishedAt || Date.now())) / 3600000;
            if (ageHours < 24) score += 10;

            // SRS reviews get priority
            if (item.type === 'srs_review') {
                score += 100; // Always show reviews
            }

            return { ...item, engagementScore: score };
        })
        .sort((a, b) => b.engagementScore - a.engagementScore);
    }

    /**
     * Get user's preferred content types based on engagement history
     */
    getUserPreferredTypes(userProfile) {
        // Analyze engagement history to find patterns
        const typeFrequency = {};

        userProfile.engagementHistory?.forEach(item => {
            typeFrequency[item.type] = (typeFrequency[item.type] || 0) + 1;
        });

        // Return top 3 types
        return Object.entries(typeFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([type]) => type);
    }

    /**
     * Paginate content for lazy loading
     * Instagram 2025: Load in batches for performance
     */
    paginateContent(content, page, limit) {
        const start = (page - 1) * limit;
        const end = start + limit;
        return content.slice(start, end);
    }

    /**
     * Track what content was shown to user
     * TikTok pattern: Track everything for better personalization
     */
    async trackShownContent(userId, content) {
        const profile = this.userProfiles.get(userId);
        if (!profile || !Array.isArray(content) || content.length === 0) {
            return;
        }

        content.forEach(item => {
            profile.engagementHistory.push({
                type: item.type,
                id: item.id,
                shownAt: new Date(),
                engaged: false // Will be updated when user interacts
            });
        });

        // Keep only last 100 items
        if (profile.engagementHistory.length > 100) {
            profile.engagementHistory = profile.engagementHistory.slice(-100);
        }

        this.userProfiles.set(userId, profile);

        const interactions = content
            .filter(item => item && item.id)
            .map(item => srsSystem.trackInteraction(
                userId,
                'feed_shown',
                item.id,
                item.level || item.difficulty || item.frequencyBand || null,
                null,
                item.duration || null
            ));

        if (interactions.length > 0) {
            try {
                await Promise.all(interactions);
            } catch (error) {
                console.warn('⚠️ Failed to persist feed impressions:', error.message);
            }
        }
    }

    /**
     * Record user engagement (like, save, complete, etc.)
     * Instagram 2025: Engagement signals drive algorithm
     */
    async recordEngagement(userId, itemId, engagementType) {
        const profile = this.userProfiles.get(userId);
        if (!profile) return;

        // Find the item in history
        const historyItem = profile.engagementHistory.find(h => h.id === itemId);
        if (historyItem) {
            historyItem.engaged = true;
            historyItem.engagementType = engagementType;
            historyItem.engagedAt = new Date();
        }

        this.userProfiles.set(userId, profile);

        console.log(`✅ Recorded ${engagementType} for ${itemId} by ${userId}`);

        try {
            await srsSystem.trackInteraction(
                userId,
                `feed_${engagementType}`,
                itemId,
                null,
                null,
                null
            );
        } catch (error) {
            console.warn('⚠️ Failed to persist engagement:', error.message);
        }
    }

    /**
     * Get personalized stats for user
     */
    async getStats(userId) {
        const profile = await this.getUserProfile(userId);
        const srsStats = await srsSystem.getStats(userId);

        const {
            totalCards = 0,
            dueToday = 0,
            accuracy = 0,
            learning = 0,
            mature = 0
        } = srsStats?.stats || {};

        return {
            success: true,
            stats: {
                level: profile.level,
                streak: profile.streak,
                totalWords: totalCards,
                dueToday,
                articlesRead: profile.totalArticles,
                accuracy,
                learningCards: learning,
                matureCards: mature
            }
        };
    }

    /**
     * Get demo content for testing (fallback when API rate limits hit)
     */
    getDemoContent(level) {
        const demoContent = [
            {
                id: 'demo_1',
                type: 'article',
                title: 'El café perfecto',
                spanish: 'Me gusta tomar café por la mañana. Es mi momento favorito del día. El café me ayuda a despertar y empezar bien el día.',
                english: 'I like to drink coffee in the morning. It\'s my favorite moment of the day. Coffee helps me wake up and start the day well.',
                source: 'Daily Spanish',
                difficulty_level: level,
                thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
                publishedAt: new Date().toISOString()
            },
            {
                id: 'demo_2',
                type: 'news',
                title: 'Nueva tecnología de aprendizaje',
                spanish: 'Una empresa española ha creado una app innovadora para aprender idiomas. La app usa videos cortos y es muy popular.',
                english: 'A Spanish company has created an innovative app to learn languages. The app uses short videos and is very popular.',
                source: 'Tech News ES',
                difficulty_level: level,
                thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
                publishedAt: new Date().toISOString()
            },
            {
                id: 'demo_3',
                type: 'culture',
                title: 'Barcelona celebra',
                spanish: 'Barcelona está de fiesta esta semana. Hay música, comida y mucha alegría en las calles. La ciudad se llena de turistas.',
                english: 'Barcelona is celebrating this week. There is music, food and lots of joy in the streets. The city fills with tourists.',
                source: 'Culture Today',
                difficulty_level: level,
                thumbnail: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400',
                publishedAt: new Date().toISOString()
            },
            {
                id: 'demo_4',
                type: 'social',
                title: 'Mi familia',
                spanish: 'Tengo una familia grande. Mi madre se llama Ana. Mi padre se llama Juan. Tengo dos hermanos. Vivimos en Madrid.',
                english: 'I have a big family. My mother is called Ana. My father is called Juan. I have two brothers. We live in Madrid.',
                source: 'Spanish Blog',
                difficulty_level: level,
                thumbnail: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400',
                publishedAt: new Date().toISOString()
            },
            {
                id: 'demo_5',
                type: 'article',
                title: 'El mercado',
                spanish: 'Me gusta ir al mercado. Hay frutas y verduras frescas. Compro manzanas, naranjas y tomates. Los precios son buenos.',
                english: 'I like going to the market. There are fresh fruits and vegetables. I buy apples, oranges and tomatoes. The prices are good.',
                source: 'Daily Life',
                difficulty_level: level,
                thumbnail: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400',
                publishedAt: new Date().toISOString()
            }
        ];

        return demoContent;
    }
}

// Export singleton instance
const personalizedSRSFeed = new PersonalizedSRSFeed();
module.exports = personalizedSRSFeed;
