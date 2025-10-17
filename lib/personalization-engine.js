// 🎯 PERSONALIZATION ENGINE - AI-Powered Content Recommendations
// Scores and ranks content based on user profile and preferences

class PersonalizationEngine {
    constructor(userProfiler) {
        this.userProfiler = userProfiler;
        this.weights = {
            difficultyMatch: 0.30,
            interestMatch: 0.30,
            vocabularyFit: 0.20,
            freshness: 0.10,
            engagement: 0.10
        };
    }

    /**
     * Personalize content feed for user
     * @param {string} userId - User ID
     * @param {Array} articles - Articles to rank
     * @returns {Array} Ranked articles with scores
     */
    personalizeContent(userId, articles) {
        // Load user profile
        const profile = this.userProfiler.loadProfile(userId);

        // Score each article
        const scoredArticles = articles.map(article => {
            const scores = this.scoreArticle(article, profile);
            return {
                ...article,
                personalizedScore: scores.total,
                scoreBreakdown: scores
            };
        });

        // Sort by personalized score
        scoredArticles.sort((a, b) => b.personalizedScore - a.personalizedScore);

        return scoredArticles;
    }

    /**
     * Score individual article for user
     * @param {Object} article - Article to score
     * @param {Object} profile - User profile
     * @returns {Object} Scores breakdown
     */
    scoreArticle(article, profile) {
        const scores = {
            difficultyMatch: this.scoreDifficultyMatch(article, profile),
            interestMatch: this.scoreInterestMatch(article, profile),
            vocabularyFit: this.scoreVocabularyFit(article, profile),
            freshness: this.scoreFreshness(article),
            engagement: this.scoreEngagement(article, profile),
            total: 0
        };

        // Calculate weighted total
        scores.total = 
            scores.difficultyMatch * this.weights.difficultyMatch +
            scores.interestMatch * this.weights.interestMatch +
            scores.vocabularyFit * this.weights.vocabularyFit +
            scores.freshness * this.weights.freshness +
            scores.engagement * this.weights.engagement;

        return scores;
    }

    /**
     * Score difficulty match (0-1)
     * How well does article difficulty match user level?
     */
    scoreDifficultyMatch(article, profile) {
        const articleDifficulty = article.difficulty || 50;
        const userOptimal = profile.optimalDifficulty || 50;

        // Perfect match = 1.0, decreases with distance
        const distance = Math.abs(articleDifficulty - userOptimal);
        const maxDistance = 50; // Max acceptable distance
        
        return Math.max(0, 1 - (distance / maxDistance));
    }

    /**
     * Score interest match (0-1)
     * How relevant are article topics to user interests?
     */
    scoreInterestMatch(article, profile) {
        if (!article.topics || article.topics.length === 0) {
            return 0.5; // Neutral if no topics
        }

        // Calculate average interest in article topics
        let totalInterest = 0;
        let topicCount = 0;

        article.topics.forEach(topic => {
            if (profile.interests[topic] !== undefined) {
                totalInterest += profile.interests[topic];
                topicCount++;
            }
        });

        if (topicCount === 0) return 0.5;
        return totalInterest / topicCount;
    }

    /**
     * Score vocabulary fit (0-1)
     * Does article use words at user's level?
     */
    scoreVocabularyFit(article, profile) {
        // Extract words from article
        const articleWords = this.extractWords(article.content || article.description);
        
        // Count known vs unknown words
        const knownWords = articleWords.filter(word => 
            profile.knownWords.includes(word)
        ).length;

        const unknownWords = articleWords.length - knownWords;

        // Ideal: 80% known, 20% new (stretch but not overwhelming)
        const knownRatio = knownWords / (articleWords.length || 1);
        const idealRatio = 0.80;
        const distance = Math.abs(knownRatio - idealRatio);

        return Math.max(0, 1 - (distance / 0.5)); // 0.5 = max acceptable distance
    }

    /**
     * Score freshness (0-1)
     * Newer content scored higher
     */
    scoreFreshness(article) {
        const now = Date.now();
        const age = now - article.publishedAt;
        
        // Full score if < 24 hours old
        if (age < 24 * 60 * 60 * 1000) return 1.0;
        
        // Decreases over 7 days
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        return Math.max(0, 1 - (age / sevenDays));
    }

    /**
     * Score predicted engagement (0-1)
     * Will user engage with this article?
     */
    scoreEngagement(article, profile) {
        // Predict engagement based on:
        // 1. User's preferred content length
        const avgReadingTime = this.calculateAvgReadingTime(profile);
        const timeDiff = Math.abs(article.readingTime - avgReadingTime);
        const timeScore = Math.max(0, 1 - (timeDiff / 10)); // 10 min = max diff

        // 2. User's learning style preference
        const styleScore = article.hasAudio ? 
            profile.learningStyle.auditory : 
            profile.learningStyle.visual;

        // 3. Time of day match
        const currentHour = new Date().getHours();
        const timeOfDayScore = (currentHour === profile.engagement.bestTimeOfDay) ? 1.0 : 0.7;

        // Combine scores
        return (timeScore + styleScore + timeOfDayScore) / 3;
    }

    /**
     * Get recommended articles (main API)
     * @param {string} userId - User ID
     * @param {Array} articles - Available articles
     * @param {number} limit - Number to return
     * @returns {Array} Top N recommended articles
     */
    getRecommendations(userId, articles, limit = 20) {
        // Personalize and rank
        const ranked = this.personalizeContent(userId, articles);

        // Apply diversity (avoid all articles from same source/topic)
        const diverse = this.diversifyResults(ranked);

        // Return top N
        return diverse.slice(0, limit);
    }

    /**
     * Diversify results to avoid monotony
     */
    diversifyResults(articles) {
        const diversified = [];
        const seenSources = new Set();
        const seenTopics = new Set();

        // First pass: add top articles with diversity constraint
        for (const article of articles) {
            // Check if we've seen this source recently
            const sourceCount = Array.from(seenSources).filter(s => s === article.source).length;
            
            // Limit articles per source
            if (sourceCount < 3) {
                diversified.push(article);
                seenSources.add(article.source);
                
                if (diversified.length >= articles.length) break;
            }
        }

        // Second pass: fill remaining slots with any articles
        for (const article of articles) {
            if (!diversified.includes(article)) {
                diversified.push(article);
            }
        }

        return diversified;
    }

    /**
     * Helper: Calculate average reading time from user history
     */
    calculateAvgReadingTime(profile) {
        if (profile.articlesRead.length === 0) return 5; // Default 5 min

        const total = profile.articlesRead.reduce((sum, article) => 
            sum + (article.timeSpent || 300), 0 // 300s = 5min default
        );
        
        return Math.round(total / profile.articlesRead.length / 60); // Convert to minutes
    }

    /**
     * Helper: Extract unique words from text
     */
    extractWords(text) {
        if (!text) return [];
        
        return text
            .toLowerCase()
            .replace(/[^\wáéíóúñü\s]/g, '') // Keep Spanish characters
            .split(/\s+/)
            .filter(word => word.length > 3) // Filter short words
            .filter((word, index, self) => self.indexOf(word) === index); // Unique only
    }

    /**
     * Update recommendation weights (for A/B testing)
     */
    setWeights(weights) {
        this.weights = { ...this.weights, ...weights };
    }

    /**
     * Get explanation for why article was recommended
     */
    explainRecommendation(article) {
        const breakdown = article.scoreBreakdown || {};
        const reasons = [];

        if (breakdown.difficultyMatch > 0.7) {
            reasons.push('Perfect difficulty level for you');
        }
        
        if (breakdown.interestMatch > 0.7) {
            reasons.push('Matches your interests');
        }

        if (breakdown.freshness > 0.8) {
            reasons.push('Fresh, breaking news');
        }

        if (breakdown.vocabularyFit > 0.7) {
            reasons.push('Good vocabulary practice');
        }

        if (article.hasAudio) {
            reasons.push('Includes audio version');
        }

        return reasons.length > 0 ? reasons : ['Recommended for Spanish learners'];
    }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersonalizationEngine;
}
