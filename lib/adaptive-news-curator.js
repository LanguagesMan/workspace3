/**
 * 📰 ADAPTIVE NEWS CURATOR - ChatGPT Pulse & Perplexity Style
 *
 * Features:
 * - Personalized content based on language level & interests
 * - TikTok FYP algorithm (user interactions, content info, device settings)
 * - ChatGPT Pulse visual cards & morning briefings
 * - Perplexity multi-source aggregation
 * - Duolingo adaptive difficulty
 */

const { SpanishFrequencyDatabase } = require('./spanish-frequency-database');

class AdaptiveNewsCurator {
    constructor() {
        this.userProfiles = new Map();
        this.contentCache = new Map();
        this.engagementData = new Map();
        this.frequencyClassifier = new SpanishFrequencyDatabase();
    }

    /**
     * Get or create user profile
     */
    getUserProfile(userId) {
        if (!this.userProfiles.has(userId)) {
            this.userProfiles.set(userId, {
                userId,
                languageLevel: 'A1',
                targetBand: '1K',
                knownWords: new Set(),
                interests: [],
                readingSpeed: 'normal',
                contentHistory: [],
                preferences: {
                    morningBriefing: true,
                    visualCards: true,
                    thumbsFeedback: true
                },
                engagement: {
                    watchTime: {},
                    completedContent: [],
                    thumbsUp: [],
                    thumbsDown: [],
                    savedItems: []
                },
                createdAt: Date.now(),
                lastActive: Date.now()
            });
        }

        return this.userProfiles.get(userId);
    }

    /**
     * Update user profile based on learned words
     */
    updateUserLevel(userId, knownWords) {
        const profile = this.getUserProfile(userId);
        profile.knownWords = new Set(knownWords);

        // Determine target band based on mastery
        const result = this.frequencyClassifier.suggestTargetBand(profile.knownWords);
        profile.targetBand = result.targetBand;

        // Map to CEFR level
        const bandToLevel = {
            '1K': 'A1',
            '2K': 'A2',
            '5K': 'B1',
            '10K+': 'B2'
        };
        profile.languageLevel = bandToLevel[result.targetBand] || 'A1';

        profile.lastActive = Date.now();
        return profile;
    }

    /**
     * Curate personalized feed (TikTok FYP + ChatGPT Pulse style)
     */
    async curatePersonalizedFeed(userId, options = {}) {
        const profile = this.getUserProfile(userId);
        const {
            count = 20,
            feedType = 'discover', // 'discover', 'videos', 'articles', 'all'
            includeVisualCards = true
        } = options;

        // 1. Aggregate content from multiple sources
        const contentPool = await this.aggregateContent(profile, feedType);

        // 2. Rank using TikTok FYP algorithm
        const ranked = this.rankContent(contentPool, profile);

        // 3. Filter by 90/10 comprehensible input
        const filtered = this.filterByComprehension(ranked, profile);

        // 4. Apply diversity & freshness
        const diversified = this.applyDiversity(filtered);

        // 5. Format as visual cards if requested
        const feed = diversified.slice(0, count);

        if (includeVisualCards) {
            return feed.map(item => this.formatAsVisualCard(item, profile));
        }

        return feed;
    }

    /**
     * Aggregate content from multiple sources (Perplexity style)
     */
    async aggregateContent(profile, feedType) {
        // In production: fetch from multiple APIs
        // For now: mock content matching user level

        const mockSources = {
            news: this.getMockNews(profile),
            videos: this.getMockVideos(profile),
            articles: this.getMockArticles(profile),
            social: this.getMockSocial(profile)
        };

        let content = [];

        if (feedType === 'discover' || feedType === 'all') {
            content = [...mockSources.news, ...mockSources.articles];
        }
        if (feedType === 'videos' || feedType === 'all') {
            content = [...content, ...mockSources.videos];
        }
        if (feedType === 'articles') {
            content = [...content, ...mockSources.articles];
        }

        return content;
    }

    /**
     * Rank content using TikTok FYP algorithm
     * Factors:
     * 1. User interactions (watch time, likes, completions)
     * 2. Content information (difficulty match, interests)
     * 3. Freshness & trending
     */
    rankContent(contentPool, profile) {
        return contentPool.map(item => {
            let score = 0;

            // Factor 1: User Interactions (40 points)
            score += this.calculateInteractionScore(item, profile);

            // Factor 2: Content Match (40 points)
            score += this.calculateContentMatchScore(item, profile);

            // Factor 3: Freshness & Trending (20 points)
            score += this.calculateFreshnessScore(item);

            return { ...item, rankScore: score };
        }).sort((a, b) => b.rankScore - a.rankScore);
    }

    calculateInteractionScore(item, profile) {
        let score = 0;

        // Similar content engagement
        const similarCompleted = profile.engagement.completedContent.filter(id =>
            this.areSimilar(id, item.id)
        );
        score += Math.min(similarCompleted.length * 5, 15);

        // Thumbs feedback
        if (profile.engagement.thumbsUp.some(id => this.areSimilar(id, item.id))) {
            score += 15;
        }
        if (profile.engagement.thumbsDown.some(id => this.areSimilar(id, item.id))) {
            score -= 20;
        }

        // Watch time
        const avgWatchTime = this.getAverageWatchTime(profile.userId, item.category);
        if (avgWatchTime > 0.7) score += 10; // 70%+ completion rate

        return Math.max(0, score);
    }

    calculateContentMatchScore(item, profile) {
        let score = 0;

        // Difficulty match (20 points)
        if (item.targetBand === profile.targetBand) {
            score += 20;
        } else if (Math.abs(this.getBandIndex(item.targetBand) - this.getBandIndex(profile.targetBand)) === 1) {
            score += 10; // Adjacent band
        }

        // Interest match (15 points)
        const interestMatch = item.tags?.filter(tag =>
            profile.interests.includes(tag)
        ).length || 0;
        score += Math.min(interestMatch * 5, 15);

        // Content type preference (5 points)
        if (item.type === profile.preferredType) {
            score += 5;
        }

        return score;
    }

    calculateFreshnessScore(item) {
        const hoursOld = (Date.now() - item.publishedAt) / (1000 * 60 * 60);

        // Fresh content (< 24h) gets bonus
        if (hoursOld < 24) return 20;
        if (hoursOld < 48) return 15;
        if (hoursOld < 72) return 10;

        // Trending boost
        if (item.trending) return 15;

        return Math.max(0, 10 - Math.floor(hoursOld / 24));
    }

    /**
     * Filter by 90/10 comprehensible input rule
     */
    filterByComprehension(content, profile) {
        return content.filter(item => {
            if (!item.content) return true; // Keep media without text

            const assessment = this.frequencyClassifier.assessDifficulty(
                item.content,
                profile.knownWords
            );

            // 90/10 rule: user should know 90%+ of words
            return parseFloat(assessment.comprehensionRate) >= 85; // Allow 85-100%
        });
    }

    /**
     * Apply diversity to avoid filter bubbles (TikTok 2025 update)
     */
    applyDiversity(content) {
        const diversified = [];
        const categories = new Set();

        // Ensure variety of content types
        content.forEach(item => {
            const category = item.category || 'general';

            // Limit same category in a row
            if (diversified.length > 0 && diversified[diversified.length - 1].category === category) {
                if (categories.has(category) && diversified.filter(i => i.category === category).length >= 3) {
                    return; // Skip to avoid too much same category
                }
            }

            diversified.push(item);
            categories.add(category);
        });

        return diversified;
    }

    /**
     * Format as visual card (ChatGPT Pulse style)
     */
    formatAsVisualCard(item, profile) {
        return {
            ...item,
            visual: {
                type: 'card',
                thumbnail: item.thumbnail || this.generateThumbnail(item),
                badge: this.getDifficultyBadge(item.targetBand),
                quickScan: this.generateQuickScan(item),
                actions: {
                    thumbsUp: true,
                    thumbsDown: true,
                    save: true,
                    share: true
                },
                stats: {
                    readTime: this.estimateReadTime(item),
                    newWords: this.countNewWords(item, profile),
                    difficulty: item.targetBand
                }
            }
        };
    }

    generateQuickScan(item) {
        // Extract key points for quick scanning
        const content = item.content || item.description || '';
        const sentences = content.split(/[.!?]+/).filter(s => s.trim());

        return {
            headline: item.title,
            summary: sentences.slice(0, 2).join('. ').trim() + '.',
            keyPoints: sentences.slice(0, 3).map(s => '• ' + s.trim())
        };
    }

    estimateReadTime(item) {
        const words = (item.content || '').split(/\s+/).length;
        const wordsPerMinute = 200; // Average Spanish reading speed
        return Math.ceil(words / wordsPerMinute) || 1;
    }

    countNewWords(item, profile) {
        if (!item.content) return 0;

        const words = item.content.toLowerCase().match(/\b\w+\b/g) || [];
        const uniqueWords = new Set(words);

        let newCount = 0;
        uniqueWords.forEach(word => {
            if (!profile.knownWords.has(word)) {
                newCount++;
            }
        });

        return newCount;
    }

    /**
     * Generate morning briefing (ChatGPT Pulse feature)
     */
    async generateMorningBriefing(userId) {
        const profile = this.getUserProfile(userId);

        if (!profile.preferences.morningBriefing) {
            return null;
        }

        // Curate top 5 items for morning
        const feed = await this.curatePersonalizedFeed(userId, { count: 5 });

        return {
            type: 'morning-briefing',
            generatedAt: Date.now(),
            greeting: this.getGreeting(),
            topStories: feed,
            stats: {
                streakDays: this.getStreakDays(userId),
                wordsLearned: profile.knownWords.size,
                level: profile.languageLevel
            },
            message: this.generatePersonalMessage(profile)
        };
    }

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return '¡Buenos días!';
        if (hour < 18) return '¡Buenas tardes!';
        return '¡Buenas noches!';
    }

    generatePersonalMessage(profile) {
        const wordsToNextLevel = this.getWordsToNextLevel(profile);

        if (wordsToNextLevel <= 10) {
            return `¡Casi llegas al nivel ${this.getNextLevel(profile.languageLevel)}! Solo ${wordsToNextLevel} palabras más.`;
        }

        return `Sigue aprendiendo. Tienes ${profile.knownWords.size} palabras en tu vocabulario.`;
    }

    /**
     * Record engagement (thumbs up/down)
     */
    recordFeedback(userId, contentId, feedback) {
        const profile = this.getUserProfile(userId);

        if (feedback === 'up') {
            profile.engagement.thumbsUp.push(contentId);
            // Remove from thumbs down if exists
            profile.engagement.thumbsDown = profile.engagement.thumbsDown.filter(id => id !== contentId);
        } else if (feedback === 'down') {
            profile.engagement.thumbsDown.push(contentId);
            // Remove from thumbs up if exists
            profile.engagement.thumbsUp = profile.engagement.thumbsUp.filter(id => id !== contentId);
        }

        profile.lastActive = Date.now();
    }

    /**
     * Helper functions
     */

    areSimilar(id1, id2) {
        // Simple similarity check - in production use better algorithm
        return id1.split('_')[0] === id2.split('_')[0];
    }

    getAverageWatchTime(userId, category) {
        // Mock - in production calculate from actual engagement data
        return 0.75;
    }

    getBandIndex(band) {
        const bands = ['1K', '2K', '5K', '10K+'];
        return bands.indexOf(band);
    }

    getDifficultyBadge(band) {
        const badges = {
            '1K': { label: 'Beginner', color: '#30D158' },
            '2K': { label: 'Elementary', color: '#FFD60A' },
            '5K': { label: 'Intermediate', color: '#FF9F0A' },
            '10K+': { label: 'Advanced', color: '#FF453A' }
        };
        return badges[band] || badges['1K'];
    }

    generateThumbnail(item) {
        // Generate placeholder thumbnail
        return `/api/placeholder/${item.id}`;
    }

    getStreakDays(userId) {
        // Mock - in production get from gamification system
        return 7;
    }

    getWordsToNextLevel(profile) {
        const targets = { 'A1': 1000, 'A2': 2000, 'B1': 5000, 'B2': 10000 };
        const target = targets[profile.languageLevel] || 1000;
        return Math.max(0, target - profile.knownWords.size);
    }

    getNextLevel(currentLevel) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const index = levels.indexOf(currentLevel);
        return levels[index + 1] || 'C2';
    }

    /**
     * Mock content generators
     */

    getMockNews(profile) {
        return [
            {
                id: 'news_1',
                type: 'news',
                category: 'sports',
                title: 'España gana el campeonato de fútbol',
                content: 'El equipo español ganó el campeonato europeo de fútbol. Los jugadores celebraron con los aficionados.',
                thumbnail: '/images/news/football.jpg',
                targetBand: profile.targetBand,
                tags: ['sports', 'football', 'spain'],
                publishedAt: Date.now() - 3600000,
                trending: true
            }
        ];
    }

    getMockVideos(profile) {
        return [
            {
                id: 'video_1',
                type: 'video',
                category: 'food',
                title: 'Cómo hacer paella española',
                description: 'Aprende a cocinar paella tradicional española.',
                videoUrl: '/videos/paella.mp4',
                thumbnail: '/images/videos/paella.jpg',
                targetBand: profile.targetBand,
                tags: ['food', 'cooking', 'culture'],
                publishedAt: Date.now() - 7200000
            }
        ];
    }

    getMockArticles(profile) {
        return [
            {
                id: 'article_1',
                type: 'article',
                category: 'culture',
                title: 'La historia de la Sagrada Familia',
                content: 'La Sagrada Familia es una basílica en Barcelona. Es un edificio muy famoso.',
                thumbnail: '/images/articles/sagrada-familia.jpg',
                targetBand: profile.targetBand,
                tags: ['culture', 'architecture', 'barcelona'],
                publishedAt: Date.now() - 10800000
            }
        ];
    }

    getMockSocial(profile) {
        return [];
    }
}

// Export singleton
const adaptiveNewsCurator = new AdaptiveNewsCurator();
module.exports = adaptiveNewsCurator;
