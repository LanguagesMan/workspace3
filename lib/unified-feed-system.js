/**
 * 🌐 UNIFIED FEED SYSTEM
 *
 * Based on Netflix/TikTok 2025 best practices:
 * - Multi-task learning (Hydra model approach)
 * - Personalized content matching
 * - Spaced repetition integration
 * - Watch time optimization
 * - Content diversity (videos, podcasts, articles)
 *
 * Research sources:
 * - Netflix Lololo framework (2D list of lists)
 * - TikTok FYP algorithm (watch time + interactions)
 * - Duolingo spaced repetition (trainable model)
 */

class UnifiedFeedSystem {
    constructor() {
        this.contentTypes = ['video', 'podcast', 'article', 'youtube'];
        this.userProfile = this.loadUserProfile();
        this.contentCache = new Map();
        this.watchHistory = this.loadWatchHistory();
        this.vocabularyBank = this.loadVocabularyBank();
    }

    loadUserProfile() {
        const saved = localStorage.getItem('user_profile');
        if (saved) {
            return JSON.parse(saved);
        }

        return {
            level: 'A2', // Default level
            learnedWords: [],
            interests: ['culture', 'news', 'entertainment'],
            watchTime: {}, // contentId: totalSeconds
            interactions: {}, // contentId: { liked, saved, completed }
            forgettingCurve: {}, // word: { lastSeen, strength, reviewCount }
            preferredContentTypes: {
                video: 0.4,
                podcast: 0.2,
                article: 0.3,
                youtube: 0.1
            }
        };
    }

    saveUserProfile() {
        localStorage.setItem('user_profile', JSON.stringify(this.userProfile));
    }

    loadWatchHistory() {
        const saved = localStorage.getItem('watch_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveWatchHistory() {
        localStorage.setItem('watch_history', JSON.stringify(this.watchHistory));
    }

    loadVocabularyBank() {
        const saved = localStorage.getItem('vocabulary_bank');
        return saved ? JSON.parse(saved) : [];
    }

    saveVocabularyBank() {
        localStorage.setItem('vocabulary_bank', JSON.stringify(this.vocabularyBank));
    }

    /**
     * MAIN FEED GENERATION
     * Netflix-style "Lololo" approach: curated canvases of content
     */
    async generateUnifiedFeed(limit = 50) {
        console.log('🎯 Generating unified feed with personalization...');

        // Load all content sources
        const allContent = await this.loadAllContentSources();

        // Apply multi-stage filtering
        const filteredContent = this.applyIntelligentFiltering(allContent);

        // Score and rank content
        const rankedContent = this.scoreAndRankContent(filteredContent);

        // Apply diversity (Netflix-style content mixing)
        const diverseFeed = this.applyContentDiversity(rankedContent, limit);

        // Inject spaced repetition items
        const feedWithReviews = this.injectSpacedRepetitionContent(diverseFeed);

        console.log(`✅ Generated feed: ${feedWithReviews.length} items`);
        return feedWithReviews;
    }

    async loadAllContentSources() {
        const sources = [];

        // Load TikTok-style videos
        try {
            const videoResponse = await fetch('/api/videos.json');
            const videoData = await videoResponse.json();
            const videos = (videoData.videos || videoData).map(v => ({
                ...v,
                contentType: 'video',
                duration: v.duration || 60,
                sourceType: 'native'
            }));
            sources.push(...videos);
        } catch (e) {
            console.warn('Could not load videos:', e);
        }

        // Load articles
        try {
            const articleResponse = await fetch('/api/articles.json');
            const articleData = await articleResponse.json();
            const articles = articleData.articles.map(a => ({
                ...a,
                contentType: 'article',
                duration: this.estimateReadingTime(a.content),
                sourceType: 'article'
            }));
            sources.push(...articles);
        } catch (e) {
            console.warn('Could not load articles:', e);
        }

        // Load podcasts (mock data - replace with real API)
        const podcasts = this.loadPodcastContent();
        sources.push(...podcasts);

        // Load YouTube videos (mock - replace with YouTube API)
        const youtubeVideos = this.loadYouTubeContent();
        sources.push(...youtubeVideos);

        console.log(`📚 Loaded ${sources.length} items from all sources`);
        return sources;
    }

    loadPodcastContent() {
        // Mock podcast data - replace with real podcast API
        return [
            {
                id: 'podcast-1',
                title: 'Español Podcast: Conversaciones Diarias',
                contentType: 'podcast',
                level: 'A2',
                duration: 900, // 15 minutes
                audioUrl: '/assets/podcasts/daily-conversations.mp3',
                transcription: {
                    text: 'Hola, bienvenidos al podcast de español...',
                    lines: []
                },
                thumbnail: '/assets/podcasts/thumbs/daily-conversations.jpg',
                description: 'Conversaciones en español para nivel intermedio',
                sourceType: 'podcast',
                tags: ['conversation', 'daily life', 'culture']
            },
            {
                id: 'podcast-2',
                title: 'Noticias en Español',
                contentType: 'podcast',
                level: 'B1',
                duration: 600,
                audioUrl: '/assets/podcasts/news.mp3',
                transcription: {
                    text: 'Las noticias de hoy...',
                    lines: []
                },
                thumbnail: '/assets/podcasts/thumbs/news.jpg',
                description: 'Noticias actuales en español',
                sourceType: 'podcast',
                tags: ['news', 'current events', 'politics']
            }
        ];
    }

    loadYouTubeContent() {
        // Mock YouTube data - replace with YouTube Data API v3
        return [
            {
                id: 'youtube-1',
                title: 'Aprende Español con Netflix',
                contentType: 'youtube',
                level: 'B1',
                duration: 600,
                youtubeId: 'dQw4w9WgXcQ', // Replace with real IDs
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                description: 'Aprende español viendo Netflix',
                sourceType: 'youtube',
                tags: ['netflix', 'learning tips', 'entertainment'],
                channelName: 'Spanish Learning Hub'
            }
        ];
    }

    estimateReadingTime(content) {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.ceil((wordCount / wordsPerMinute) * 60); // seconds
    }

    /**
     * INTELLIGENT FILTERING
     * TikTok-style: filter by level, vocabulary, watch history
     */
    applyIntelligentFiltering(content) {
        return content.filter(item => {
            // 1. Level matching
            if (!this.isLevelAppropriate(item)) {
                return false;
            }

            // 2. Vocabulary matching (progressive difficulty)
            if (!this.hasAppropriateVocabulary(item)) {
                return false;
            }

            // 3. Avoid recently watched
            if (this.wasRecentlyWatched(item)) {
                return false;
            }

            // 4. Content quality filters
            if (item.quality && item.quality < 0.5) {
                return false;
            }

            return true;
        });
    }

    isLevelAppropriate(item) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const userLevelIndex = levels.indexOf(this.userProfile.level);
        const itemLevelIndex = levels.indexOf(item.level);

        // Show content from current level ±1
        return Math.abs(userLevelIndex - itemLevelIndex) <= 1;
    }

    hasAppropriateVocabulary(item) {
        // Check if content has vocabulary that matches user's learning level
        // Too many unknown words = too difficult
        // All known words = too easy

        if (!item.vocabulary || item.vocabulary.length === 0) {
            return true; // No vocabulary data, allow it
        }

        const knownWords = new Set(this.userProfile.learnedWords);
        const unknownCount = item.vocabulary.filter(w => !knownWords.has(w)).length;
        const unknownPercentage = unknownCount / item.vocabulary.length;

        // Ideal: 10-30% unknown words (i+1 comprehensible input)
        return unknownPercentage >= 0.05 && unknownPercentage <= 0.40;
    }

    wasRecentlyWatched(item) {
        const recentWindow = 24 * 60 * 60 * 1000; // 24 hours
        const recentHistory = this.watchHistory.filter(h =>
            Date.now() - h.timestamp < recentWindow
        );

        return recentHistory.some(h => h.contentId === item.id);
    }

    /**
     * CONTENT SCORING
     * Multi-factor ranking like TikTok FYP
     */
    scoreAndRankContent(content) {
        const scored = content.map(item => ({
            ...item,
            score: this.calculateContentScore(item)
        }));

        // Sort by score descending
        scored.sort((a, b) => b.score - a.score);

        return scored;
    }

    calculateContentScore(item) {
        let score = 0;

        // 1. Content type preference (Netflix-style)
        const typePreference = this.userProfile.preferredContentTypes[item.contentType] || 0.25;
        score += typePreference * 100;

        // 2. Level match bonus (exact level = higher score)
        if (item.level === this.userProfile.level) {
            score += 50;
        }

        // 3. Interest matching
        const interestMatch = this.calculateInterestMatch(item);
        score += interestMatch * 30;

        // 4. Vocabulary difficulty (i+1 sweet spot)
        const vocabScore = this.calculateVocabularyScore(item);
        score += vocabScore * 20;

        // 5. Recency/freshness bonus
        if (item.publishedDate) {
            const daysOld = (Date.now() - new Date(item.publishedDate)) / (24 * 60 * 60 * 1000);
            if (daysOld < 7) {
                score += 15; // Fresh content bonus
            }
        }

        // 6. Watch time optimization (shorter content for new users)
        const durationScore = this.calculateDurationScore(item);
        score += durationScore * 10;

        // 7. Engagement signals (if available)
        if (item.likes || item.views) {
            const engagementRate = (item.likes || 0) / (item.views || 1);
            score += Math.min(engagementRate * 50, 20);
        }

        return score;
    }

    calculateInterestMatch(item) {
        if (!item.tags || item.tags.length === 0) {
            return 0.5; // Neutral
        }

        const matchingTags = item.tags.filter(tag =>
            this.userProfile.interests.includes(tag)
        );

        return matchingTags.length / Math.max(item.tags.length, this.userProfile.interests.length);
    }

    calculateVocabularyScore(item) {
        if (!item.vocabulary || item.vocabulary.length === 0) {
            return 0.5;
        }

        const knownWords = new Set(this.userProfile.learnedWords);
        const unknownCount = item.vocabulary.filter(w => !knownWords.has(w)).length;
        const unknownPercentage = unknownCount / item.vocabulary.length;

        // Sweet spot: 15-25% unknown (i+1)
        const ideal = 0.20;
        const distance = Math.abs(unknownPercentage - ideal);

        return Math.max(0, 1 - (distance * 5));
    }

    calculateDurationScore(item) {
        // Prefer shorter content (3-10 min) for engagement
        const idealDuration = 300; // 5 minutes
        const distance = Math.abs(item.duration - idealDuration);

        return Math.max(0, 1 - (distance / 600));
    }

    /**
     * CONTENT DIVERSITY
     * Netflix "Lololo" approach: mix content types
     */
    applyContentDiversity(rankedContent, limit) {
        const diverse = [];
        const typeTrackers = {
            video: 0,
            podcast: 0,
            article: 0,
            youtube: 0
        };

        // Target distribution (can be adjusted based on user preferences)
        const targetRatios = {
            video: 0.4,      // 40% videos
            podcast: 0.2,    // 20% podcasts
            article: 0.3,    // 30% articles
            youtube: 0.1     // 10% YouTube
        };

        // Interleave content types
        let contentIndex = 0;
        const contentByType = {
            video: rankedContent.filter(c => c.contentType === 'video'),
            podcast: rankedContent.filter(c => c.contentType === 'podcast'),
            article: rankedContent.filter(c => c.contentType === 'article'),
            youtube: rankedContent.filter(c => c.contentType === 'youtube')
        };

        while (diverse.length < limit && contentIndex < rankedContent.length * 2) {
            // Cycle through types maintaining ratios
            for (const [type, ratio] of Object.entries(targetRatios)) {
                const currentRatio = typeTrackers[type] / Math.max(diverse.length, 1);

                if (currentRatio < ratio || diverse.length < 4) {
                    const pool = contentByType[type];
                    const nextItem = pool[typeTrackers[type]];

                    if (nextItem && !diverse.includes(nextItem)) {
                        diverse.push(nextItem);
                        typeTrackers[type]++;

                        if (diverse.length >= limit) break;
                    }
                }
            }

            contentIndex++;
            if (contentIndex > limit * 3) break; // Safety
        }

        return diverse;
    }

    /**
     * SPACED REPETITION INJECTION
     * Duolingo-style: inject review content based on forgetting curve
     */
    injectSpacedRepetitionContent(feed) {
        const reviewItems = this.getItemsDueForReview();

        if (reviewItems.length === 0) {
            return feed;
        }

        // Inject review items every 5-7 pieces of new content
        const injectedFeed = [];
        let reviewIndex = 0;

        feed.forEach((item, index) => {
            injectedFeed.push(item);

            // Inject review item every 6 items
            if ((index + 1) % 6 === 0 && reviewIndex < reviewItems.length) {
                injectedFeed.push({
                    ...reviewItems[reviewIndex],
                    isReview: true,
                    reviewLabel: '🔄 Review'
                });
                reviewIndex++;
            }
        });

        return injectedFeed;
    }

    getItemsDueForReview() {
        // Check vocabulary that needs review based on spaced repetition
        const now = Date.now();
        const dueWords = [];

        for (const [word, data] of Object.entries(this.userProfile.forgettingCurve)) {
            const daysSinceLastSeen = (now - data.lastSeen) / (24 * 60 * 60 * 1000);

            // Spaced repetition intervals: 1, 3, 7, 14, 30 days
            const intervals = [1, 3, 7, 14, 30];
            const nextInterval = intervals[Math.min(data.reviewCount, intervals.length - 1)];

            if (daysSinceLastSeen >= nextInterval) {
                dueWords.push({ word, ...data });
            }
        }

        // Find content containing these words
        // (In production, you'd query a database)
        return [];
    }

    /**
     * USER INTERACTION TRACKING
     * Track to improve future recommendations
     */
    trackInteraction(contentId, interactionType, data = {}) {
        if (!this.userProfile.interactions[contentId]) {
            this.userProfile.interactions[contentId] = {};
        }

        this.userProfile.interactions[contentId][interactionType] = {
            timestamp: Date.now(),
            ...data
        };

        // Update content type preferences
        const content = this.contentCache.get(contentId);
        if (content && interactionType === 'completed') {
            const currentPref = this.userProfile.preferredContentTypes[content.contentType];
            this.userProfile.preferredContentTypes[content.contentType] = Math.min(1, currentPref + 0.02);

            // Normalize to sum to 1
            this.normalizeContentTypePreferences();
        }

        this.saveUserProfile();
    }

    normalizeContentTypePreferences() {
        const sum = Object.values(this.userProfile.preferredContentTypes).reduce((a, b) => a + b, 0);

        for (const type in this.userProfile.preferredContentTypes) {
            this.userProfile.preferredContentTypes[type] /= sum;
        }
    }

    trackWatchTime(contentId, seconds) {
        if (!this.userProfile.watchTime[contentId]) {
            this.userProfile.watchTime[contentId] = 0;
        }

        this.userProfile.watchTime[contentId] += seconds;

        this.watchHistory.push({
            contentId,
            timestamp: Date.now(),
            duration: seconds
        });

        this.saveUserProfile();
        this.saveWatchHistory();
    }

    addLearnedWord(word) {
        if (!this.userProfile.learnedWords.includes(word)) {
            this.userProfile.learnedWords.push(word);
        }

        // Initialize forgetting curve tracking
        if (!this.userProfile.forgettingCurve[word]) {
            this.userProfile.forgettingCurve[word] = {
                lastSeen: Date.now(),
                strength: 1,
                reviewCount: 0
            };
        }

        this.vocabularyBank.push({
            word,
            timestamp: Date.now(),
            source: 'content'
        });

        this.saveUserProfile();
        this.saveVocabularyBank();
    }

    updateForgettingCurve(word, remembered) {
        if (!this.userProfile.forgettingCurve[word]) {
            return;
        }

        const data = this.userProfile.forgettingCurve[word];

        data.lastSeen = Date.now();
        data.reviewCount++;

        if (remembered) {
            data.strength = Math.min(1, data.strength + 0.1);
        } else {
            data.strength = Math.max(0, data.strength - 0.2);
        }

        this.saveUserProfile();
    }
}

// Make globally accessible
if (typeof window !== 'undefined') {
    window.UnifiedFeedSystem = UnifiedFeedSystem;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedFeedSystem;
}
