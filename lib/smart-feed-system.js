/**
 * 🔥 SMART FEED SYSTEM
 * Frequency-based content targeting using 90/10 comprehensible input theory
 * Delivers content perfectly matched to user's vocabulary level
 */

const { SpanishFrequencyDatabase } = require('./spanish-frequency-database');

class SmartFeedSystem {
    constructor() {
        this.frequencyDB = new SpanishFrequencyDatabase();
        this.contentCache = new Map(); // Cache categorized content

        console.log('🔥 Smart Feed System initialized with frequency targeting');
    }

    /**
     * Get personalized feed for user based on their level
     * @param {Object} userProfile - User's learning profile
     * @param {Array} availableContent - Pool of content to filter from
     * @returns {Array} - Ordered feed items optimized for user
     */
    getPersonalizedFeed(userProfile, availableContent) {
        const { level, knownWords = [], interests = [] } = userProfile;

        // Step 1: Determine user's target frequency band
        const targetBand = this.frequencyDB.getTargetBand(level, knownWords);

        // Step 2: Categorize all content by frequency band
        const categorizedContent = this.categorizeContent(availableContent, knownWords);

        // Step 3: Filter content that matches user's target band (90/10 theory)
        const optimalContent = this.filterOptimalContent(
            categorizedContent,
            targetBand,
            knownWords
        );

        // Step 4: Apply interest-based ranking
        const rankedContent = this.rankByInterests(optimalContent, interests);

        // Step 5: Mix in variety (80% optimal, 20% slightly challenging)
        const finalFeed = this.mixContentDifficulty(rankedContent, categorizedContent, targetBand);

        return finalFeed.slice(0, 50); // Return top 50 items
    }

    /**
     * Categorize content by frequency band
     */
    categorizeContent(content, userKnownWords) {
        return content.map(item => {
            const text = item.spanish || item.content || '';
            const band = this.frequencyDB.analyzeContentBand(text);
            const score9010 = this.frequencyDB.calculate9010Score(text, userKnownWords);

            return {
                ...item,
                frequencyBand: band,
                comprehensibilityScore: score9010,
                difficulty: this.calculateDifficulty(band, score9010)
            };
        });
    }

    /**
     * Filter content that's optimal for user (90/10 theory)
     */
    filterOptimalContent(categorizedContent, targetBand, userKnownWords) {
        return categorizedContent.filter(item => {
            // Prioritize content in target band with optimal comprehensibility
            const isTargetBand = item.frequencyBand === targetBand;
            const isOptimal = item.comprehensibilityScore.isOptimal;
            const isPerfect = item.comprehensibilityScore.isPerfect;

            // Accept perfect matches or close matches
            return isPerfect || (isOptimal && isTargetBand);
        });
    }

    /**
     * Rank content by user interests
     */
    rankByInterests(content, userInterests) {
        if (!userInterests || userInterests.length === 0) {
            return content; // No interest filtering
        }

        return content.map(item => {
            // Calculate interest match score
            const tags = item.tags || [];
            const category = item.category || '';

            let interestScore = 0;
            userInterests.forEach(interest => {
                if (tags.includes(interest) || category.includes(interest)) {
                    interestScore += 10;
                }
            });

            return {
                ...item,
                interestScore
            };
        }).sort((a, b) => b.interestScore - a.interestScore);
    }

    /**
     * Mix content difficulty (80% optimal, 20% challenging)
     */
    mixContentDifficulty(optimalContent, allContent, targetBand) {
        const optimalCount = Math.floor(optimalContent.length * 0.8);
        const challengingCount = Math.floor(optimalContent.length * 0.2);

        // Get next level up content for challenge
        const nextBand = this.getNextBand(targetBand);
        const challengingContent = allContent
            .filter(item => item.frequencyBand === nextBand)
            .slice(0, challengingCount);

        // Mix them together
        const mixed = [
            ...optimalContent.slice(0, optimalCount),
            ...challengingContent
        ];

        // Shuffle slightly to avoid predictable patterns
        return this.shuffle(mixed);
    }

    /**
     * Calculate difficulty score
     */
    calculateDifficulty(band, score9010) {
        const bandDifficulty = {
            '1K': 1,
            '2K': 2,
            '5K': 3,
            '10K': 4,
            '10K+': 5
        };

        const baseDifficulty = bandDifficulty[band] || 3;
        const comprehensibilityFactor = (100 - score9010.knownPercentage) / 20;

        return baseDifficulty + comprehensibilityFactor;
    }

    /**
     * Get next frequency band for variety
     */
    getNextBand(currentBand) {
        const progression = ['1K', '2K', '5K', '10K', '10K+'];
        const currentIndex = progression.indexOf(currentBand);
        return progression[currentIndex + 1] || '10K+';
    }

    /**
     * Shuffle array (Fisher-Yates)
     */
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Generate missing content for frequency band
     * (Hooks into AI content generation)
     */
    async generateMissingContent(targetBand, topic, userProfile) {
        const bandInfo = this.frequencyDB.getBandInfo(targetBand);

        // Content generation prompt template
        const prompt = `
Generate Spanish article about "${topic}" for ${bandInfo.level} learners.

Requirements:
- Use ONLY words from frequency band: ${targetBand} (${bandInfo.description})
- Target audience: ${bandInfo.targetAudience}
- Ensure 90% of words are from this frequency band
- Include 10% new words from the NEXT band for learning
- Length: ${this.getTargetLength(targetBand)} words
- Make it INTERESTING and VIRAL-worthy (not boring language learning content)
- Include cultural context and real-world relevance
`;

        return {
            generated: true,
            band: targetBand,
            topic,
            prompt,
            level: bandInfo.level,
            metadata: {
                generatedAt: new Date().toISOString(),
                targetAudience: bandInfo.targetAudience,
                frequencyRange: bandInfo.range
            }
        };
    }

    /**
     * Get target content length by band
     */
    getTargetLength(band) {
        const lengths = {
            '1K': 100,   // Short, simple
            '2K': 200,   // Medium
            '5K': 350,   // Longer
            '10K': 500,  // Full article
            '10K+': 700  // Advanced essay
        };
        return lengths[band] || 200;
    }

    /**
     * Analyze feed effectiveness
     */
    analyzeFeedPerformance(feedItems, userEngagement) {
        const engagement = feedItems.map((item, index) => {
            const userAction = userEngagement[item.id] || {};

            return {
                item: item.title || item.id,
                band: item.frequencyBand,
                comprehensibility: item.comprehensibilityScore?.knownPercentage,
                engaged: userAction.liked || userAction.saved || userAction.completed,
                watchTime: userAction.watchTime || 0,
                difficulty: item.difficulty
            };
        });

        // Calculate metrics
        const totalItems = engagement.length;
        const engagedItems = engagement.filter(e => e.engaged).length;
        const engagementRate = (engagedItems / totalItems) * 100;

        const avgWatchTime = engagement.reduce((sum, e) => sum + e.watchTime, 0) / totalItems;
        const avgDifficulty = engagement.reduce((sum, e) => sum + e.difficulty, 0) / totalItems;

        return {
            totalItems,
            engagedItems,
            engagementRate: Math.round(engagementRate),
            avgWatchTime: Math.round(avgWatchTime),
            avgDifficulty: avgDifficulty.toFixed(2),
            recommendation: this.getRecommendation(engagementRate, avgDifficulty)
        };
    }

    /**
     * Get recommendation based on feed performance
     */
    getRecommendation(engagementRate, avgDifficulty) {
        if (engagementRate < 30) {
            return '⚠️ Low engagement - content may be too difficult or not interesting';
        }
        if (avgDifficulty < 2 && engagementRate > 70) {
            return '📈 User ready for more challenging content';
        }
        if (engagementRate > 60 && avgDifficulty >= 2 && avgDifficulty <= 3.5) {
            return '✅ Perfect balance - maintain current difficulty';
        }
        return '👍 Feed performing well';
    }

    /**
     * Unlock new content based on user progress
     */
    checkUnlocks(userProfile, newWordsLearned) {
        const currentBand = this.frequencyDB.getTargetBand(userProfile.level, userProfile.knownWords);
        const newKnownWords = [...userProfile.knownWords, ...newWordsLearned];
        const newBand = this.frequencyDB.getTargetBand(userProfile.level, newKnownWords);

        if (newBand !== currentBand) {
            const bandInfo = this.frequencyDB.getBandInfo(newBand);
            return {
                unlocked: true,
                newBand,
                message: `🎉 Content unlocked! You can now access ${bandInfo.description}`,
                level: bandInfo.level,
                newContentAvailable: true
            };
        }

        return {
            unlocked: false,
            currentBand,
            progress: this.calculateBandProgress(userProfile.knownWords, currentBand)
        };
    }

    /**
     * Calculate progress within frequency band
     */
    calculateBandProgress(knownWords, band) {
        const bandInfo = this.frequencyDB.getBandInfo(band);
        const bandSize = bandInfo.range[1] - bandInfo.range[0];
        const wordsInBand = knownWords.filter(word => {
            const freq = this.frequencyDB.getWordFrequency(word).frequency;
            return freq >= bandInfo.range[0] && freq <= bandInfo.range[1];
        }).length;

        return {
            wordsLearned: wordsInBand,
            bandSize,
            percentage: Math.round((wordsInBand / bandSize) * 100)
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SmartFeedSystem };
}
