/**
 * Article Personalization Engine
 * 
 * Smart feed algorithm inspired by TikTok/Instagram:
 * - Scores articles based on user interests, level, engagement
 * - Adapts content using OpenAI
 * - Caches personalized versions
 * - Tracks engagement for continuous improvement
 * 
 * This is the BRAIN of the personalized feed system
 */

const openaiAdapter = require('./openai-article-adapter');
const { supabase, isConfigured } = require('./supabase-client');

class ArticlePersonalizationEngine {
    constructor() {
        this.scoringWeights = {
            interestMatch: 0.35,      // User's stated interests
            levelMatch: 0.25,         // CEFR level appropriateness
            vocabularyMatch: 0.20,    // Contains user's learning words
            engagementHistory: 0.15,  // Past engagement with similar content
            recency: 0.05            // Fresh content bonus
        };
    }

    /**
     * Generate personalized feed for user (MAIN METHOD)
     * This is what TikTok/Instagram do internally
     */
    async generatePersonalizedFeed(userId, options = {}) {
        try {
            const {
                limit = 20,
                category = null,
                forceRefresh = false
            } = options;

            console.log(`🎯 Generating personalized feed for user: ${userId}`);

            // Step 1: Get user profile
            const userProfile = await this.getUserProfile(userId);
            
            // Step 2: Check for cached personalized articles
            if (!forceRefresh) {
                const cached = await this.getCachedPersonalizedArticles(userId, limit);
                if (cached.length >= limit * 0.7) { // At least 70% cache hit
                    console.log(`✅ Using ${cached.length} cached personalized articles`);
                    return cached.slice(0, limit);
                }
            }

            // Step 3: Fetch candidate articles
            const candidates = await this.fetchCandidateArticles(category, limit * 3);
            
            // Step 4: Score each article
            const scored = await this.scoreArticles(candidates, userProfile);
            
            // Step 5: Select top articles
            const topArticles = scored
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

            // Step 6: Adapt articles to user
            const personalized = await this.adaptArticlesToUser(topArticles, userProfile);

            // Step 7: Cache personalized articles
            await this.cachePersonalizedArticles(userId, personalized);

            console.log(`✅ Generated ${personalized.length} personalized articles`);
            return personalized;

        } catch (error) {
            console.error('Error generating personalized feed:', error);
            // Fallback: return generic articles
            return await this.fetchCandidateArticles(null, limit);
        }
    }

    /**
     * Get user profile (level, interests, vocabulary)
     */
    async getUserProfile(userId) {
        try {
            if (!isConfigured()) {
                return this.getDefaultProfile(userId);
            }

            // Get preferences
            const { data: prefs } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', userId)
                .single();

            // Get learning vocabulary (top 50 most recent)
            const { data: words } = await supabase
                .from('user_words')
                .select('lemma, translation, status')
                .eq('user_id', userId)
                .eq('status', 'learning')
                .order('last_reviewed', { ascending: false })
                .limit(50);

            // Get engagement history
            const { data: engagement } = await supabase
                .from('article_engagement')
                .select('article_id, category, time_spent, saved')
                .eq('user_id', userId)
                .order('engaged_at', { ascending: false })
                .limit(100);

            return {
                userId,
                cefrLevel: prefs?.preferred_difficulty_range?.min || 'B1',
                interests: prefs?.favorite_topics || ['culture', 'technology'],
                dislikedTopics: prefs?.disliked_topics || [],
                learningWords: words?.map(w => w.lemma) || [],
                engagementHistory: engagement || [],
                preferredSources: prefs?.favorite_sources || []
            };

        } catch (error) {
            console.error('Error getting user profile:', error);
            return this.getDefaultProfile(userId);
        }
    }

    /**
     * Default profile for new/anonymous users
     */
    getDefaultProfile(userId) {
        return {
            userId,
            cefrLevel: 'B1',
            interests: ['culture', 'technology', 'entertainment'],
            dislikedTopics: [],
            learningWords: [],
            engagementHistory: [],
            preferredSources: []
        };
    }

    /**
     * Fetch candidate articles from various sources
     */
    async fetchCandidateArticles(category, limit) {
        try {
            if (!isConfigured()) {
                return [];
            }

            // Get recent articles from cache (last 24 hours)
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            
            let query = supabase
                .from('articles')
                .select('*')
                .gte('fetch_time', oneDayAgo)
                .order('published_at', { ascending: false })
                .limit(limit);

            if (category) {
                query = query.eq('category', category);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching articles:', error);
                return [];
            }

            return data || [];

        } catch (error) {
            console.error('Error in fetchCandidateArticles:', error);
            return [];
        }
    }

    /**
     * Score articles based on user profile (TikTok-style algorithm)
     */
    async scoreArticles(articles, userProfile) {
        return articles.map(article => {
            const scores = {
                interestMatch: this.scoreInterestMatch(article, userProfile),
                levelMatch: this.scoreLevelMatch(article, userProfile),
                vocabularyMatch: this.scoreVocabularyMatch(article, userProfile),
                engagementHistory: this.scoreEngagementHistory(article, userProfile),
                recency: this.scoreRecency(article)
            };

            // Calculate weighted total score
            const totalScore = Object.keys(scores).reduce((total, key) => {
                return total + (scores[key] * this.scoringWeights[key]);
            }, 0);

            return {
                ...article,
                personalizedScore: totalScore,
                scoreBreakdown: scores,
                score: totalScore // Alias for sorting
            };
        });
    }

    /**
     * Score: Interest match
     */
    scoreInterestMatch(article, userProfile) {
        const { interests, dislikedTopics } = userProfile;
        
        // Penalty for disliked topics
        if (dislikedTopics.includes(article.category)) {
            return 0.1;
        }

        // Bonus for matching interests
        if (interests.includes(article.category)) {
            return 1.0;
        }

        // Partial match for related topics
        return 0.5;
    }

    /**
     * Score: Level match (CEFR)
     */
    scoreLevelMatch(article, userProfile) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const userLevelIndex = levels.indexOf(userProfile.cefrLevel);
        const articleLevelIndex = levels.indexOf(article.difficulty);

        if (userLevelIndex === -1 || articleLevelIndex === -1) {
            return 0.5; // Unknown level
        }

        const diff = Math.abs(userLevelIndex - articleLevelIndex);

        if (diff === 0) return 1.0;  // Perfect match
        if (diff === 1) return 0.7;  // One level off (good for growth)
        if (diff === 2) return 0.4;  // Two levels off
        return 0.1;                   // Too far off
    }

    /**
     * Score: Vocabulary match (contains user's learning words)
     */
    scoreVocabularyMatch(article, userProfile) {
        const { learningWords } = userProfile;
        
        if (!learningWords || learningWords.length === 0) {
            return 0.5; // Neutral if no learning words
        }

        const contentLower = (article.content || '').toLowerCase();
        let matchCount = 0;

        learningWords.forEach(word => {
            if (contentLower.includes(word.toLowerCase())) {
                matchCount++;
            }
        });

        // Score based on percentage of vocabulary found
        const matchRate = matchCount / Math.min(learningWords.length, 10);
        return Math.min(matchRate, 1.0);
    }

    /**
     * Score: Engagement history
     */
    scoreEngagementHistory(article, userProfile) {
        const { engagementHistory } = userProfile;
        
        if (!engagementHistory || engagementHistory.length === 0) {
            return 0.5; // Neutral for new users
        }

        // Check if user engaged with similar category
        const categoryEngagement = engagementHistory.filter(e => 
            e.category === article.category
        );

        if (categoryEngagement.length === 0) {
            return 0.3; // Low score for untested categories
        }

        // Calculate average engagement quality
        const avgTimeSpent = categoryEngagement.reduce((sum, e) => sum + (e.time_spent || 0), 0) / categoryEngagement.length;
        const saveRate = categoryEngagement.filter(e => e.saved).length / categoryEngagement.length;

        // Good engagement = high score
        const timeScore = Math.min(avgTimeSpent / 60, 1.0); // Normalize to 60 seconds
        const saveScore = saveRate;

        return (timeScore * 0.6) + (saveScore * 0.4);
    }

    /**
     * Score: Recency (fresh content bonus)
     */
    scoreRecency(article) {
        const now = new Date();
        const published = new Date(article.published_at);
        const hoursSincePublished = (now - published) / (1000 * 60 * 60);

        if (hoursSincePublished < 6) return 1.0;   // Very fresh
        if (hoursSincePublished < 24) return 0.8;  // Today
        if (hoursSincePublished < 48) return 0.6;  // Yesterday
        if (hoursSincePublished < 168) return 0.4; // This week
        return 0.2; // Older
    }

    /**
     * Adapt articles to user using OpenAI
     */
    async adaptArticlesToUser(articles, userProfile) {
        console.log(`🔄 Adapting ${articles.length} articles to user...`);
        
        const adapted = await openaiAdapter.adaptBatch(articles, userProfile, 3);
        
        return adapted.map((result, index) => ({
            ...articles[index],
            adapted_title: result.adaptedTitle,
            adapted_content: result.adaptedContent,
            vocabulary_used: result.vocabularyUsed,
            adaptation_cost: result.cost,
            is_personalized: true
        }));
    }

    /**
     * Cache personalized articles in database
     */
    async cachePersonalizedArticles(userId, articles) {
        try {
            if (!isConfigured()) return;

            const records = articles.map(article => ({
                user_id: userId,
                original_article_id: article.id,
                adapted_title: article.adapted_title,
                adapted_content: article.adapted_content,
                difficulty_level: article.difficulty,
                user_vocabulary_count: article.vocabulary_used || 0,
                score: article.personalizedScore || 0,
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }));

            const { error } = await supabase
                .from('personalized_articles')
                .upsert(records);

            if (error) {
                console.error('Error caching personalized articles:', error);
            } else {
                console.log(`✅ Cached ${records.length} personalized articles`);
            }

        } catch (error) {
            console.error('Error in cachePersonalizedArticles:', error);
        }
    }

    /**
     * Get cached personalized articles
     */
    async getCachedPersonalizedArticles(userId, limit) {
        try {
            if (!isConfigured()) return [];

            const now = new Date().toISOString();

            const { data, error } = await supabase
                .from('personalized_articles')
                .select('*')
                .eq('user_id', userId)
                .gt('expires_at', now)
                .order('score', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error getting cached articles:', error);
                return [];
            }

            return data || [];

        } catch (error) {
            console.error('Error in getCachedPersonalizedArticles:', error);
            return [];
        }
    }

    /**
     * Track engagement (for improving recommendations)
     */
    async trackEngagement(userId, articleId, engagement) {
        try {
            if (!isConfigured()) return;

            const { error } = await supabase
                .from('article_engagement')
                .insert({
                    user_id: userId,
                    article_id: articleId,
                    time_spent: engagement.timeSpent || 0,
                    saved: engagement.saved || false,
                    liked: engagement.liked || false,
                    shared: engagement.shared || false,
                    engaged_at: new Date().toISOString()
                });

            if (error) {
                console.error('Error tracking engagement:', error);
            }

        } catch (error) {
            console.error('Error in trackEngagement:', error);
        }
    }
}

// Export singleton
const engine = new ArticlePersonalizationEngine();
module.exports = engine;
module.exports.ArticlePersonalizationEngine = ArticlePersonalizationEngine;


