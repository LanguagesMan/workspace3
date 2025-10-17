// 🎯 Feed Ranker - TikTok-style personalized ranking with pedagogy
// Ranks content by vocabulary coverage, engagement, and learning goals

const vocabAnalyzer = require('./vocab-analyzer');

class FeedRanker {
    /**
     * Score a single item for a user
     * @param {object} item - Content item (article or video)
     * @param {object} user - User profile with cefrLevel, knownWords, interestTags
     * @param {object} signals - Recent engagement signals
     * @returns {number} Score (0-1, higher is better)
     */
    scoreItem(item, user, signals = {}) {
        const {
            cefrLevel = 'A2',
            knownWords = [],
            interestTags = [],
            recentMistakes = []
        } = user;

        // 1. Coverage: what % of words the user knows
        let coverage = 0.75; // Default
        if (item.coverage !== undefined) {
            coverage = item.coverage / 100; // Convert percentage to decimal
        } else if (item.title || item.description || item.content) {
            const text = `${item.title || ''} ${item.description || ''} ${item.content || ''}`;
            const result = vocabAnalyzer.calculateCoverage(text, knownWords);
            coverage = result.coverage;
        }

        // 2. Novelty: ideal range is 5-15% unknown words (varies by level)
        const targetNovelty = this.getTargetNovelty(cefrLevel);
        const novelty = Math.max(0, Math.min(1 - coverage, 0.30)); // Cap at 30% unknown
        const noveltyFit = 1 - Math.abs(novelty - targetNovelty);

        // 3. CEFR level match
        const levelDelta = this.getLevelDelta(item.targetLevel || 'B1', cefrLevel);
        const levelScore = Math.max(0, 1 - Math.abs(levelDelta) * 0.25);

        // 4. Interest alignment (topic tags)
        const interest = this.calculateInterestScore(item, interestTags);

        // 5. Recency (prefer fresh content)
        const recency = this.calculateRecencyScore(item.publishedAt || item.createdAt);

        // 6. SRS focus (boost items with words user recently struggled with)
        const srsFocus = this.calculateSRSFocus(item, recentMistakes);

        // 7. Engagement prediction (completion, replay, save signals)
        const engagement = signals.engagementPrediction || 0.5;

        // Weighted combination (calibrated for learning efficacy)
        const score =
            0.30 * coverage +        // High coverage = comprehensible
            0.20 * noveltyFit +      // Right amount of challenge
            0.15 * levelScore +      // CEFR match
            0.15 * interest +        // User interests
            0.10 * recency +         // Fresh content
            0.05 * srsFocus +        // Practice weak words
            0.05 * engagement;       // Predicted engagement

        return Math.max(0, Math.min(1, score)); // Clamp 0-1
    }

    /**
     * Rank a feed of items for a user
     * @returns {array} Sorted items (highest score first)
     */
    rankFeed(items, user, signals = {}) {
        if (!items || items.length === 0) return [];

        // Score all items
        const scored = items.map(item => ({
            ...item,
            _score: this.scoreItem(item, user, signals)
        }));

        // Sort by score descending
        scored.sort((a, b) => b._score - a._score);

        // Add diversity: prevent too many similar items in a row
        return this.diversifyFeed(scored, user);
    }

    /**
     * Diversify feed to avoid repetitive content
     */
    diversifyFeed(rankedItems, user) {
        const diversified = [];
        const seen = new Set();

        for (const item of rankedItems) {
            // Track seen topics/sources to add variety
            const key = `${item.source || 'unknown'}-${item.category || 'general'}`;

            // Allow max 2 items from same source in top 10
            if (diversified.length < 10 && seen.has(key)) {
                const sameSourceCount = diversified.filter(i =>
                    `${i.source}-${i.category}` === key
                ).length;
                if (sameSourceCount >= 2) continue;
            }

            diversified.push(item);
            seen.add(key);
        }

        // Add remaining items
        for (const item of rankedItems) {
            if (!diversified.includes(item)) {
                diversified.push(item);
            }
        }

        return diversified;
    }

    /**
     * Get target novelty range by CEFR level
     */
    getTargetNovelty(cefrLevel) {
        const targets = {
            'A1': 0.08,  // 8% unknown words (very safe)
            'A2': 0.12,  // 12% unknown
            'B1': 0.15,  // 15% unknown (balanced)
            'B2': 0.18,  // 18% unknown
            'C1': 0.20,  // 20% unknown (challenging)
            'C2': 0.22   // 22% unknown
        };
        return targets[cefrLevel] || 0.15;
    }

    /**
     * Calculate CEFR level delta (-2 to +2)
     */
    getLevelDelta(contentLevel, userLevel) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const contentIndex = levels.indexOf(contentLevel);
        const userIndex = levels.indexOf(userLevel);

        if (contentIndex === -1 || userIndex === -1) return 0;
        return contentIndex - userIndex;
    }

    /**
     * Calculate interest score (Jaccard similarity of tags)
     */
    calculateInterestScore(item, userInterests) {
        if (!item.tags || !userInterests || userInterests.length === 0) {
            return 0.5; // Neutral if no data
        }

        const itemTags = new Set(item.tags.map(t => t.toLowerCase()));
        const userTags = new Set(userInterests.map(t => t.toLowerCase()));

        const intersection = new Set([...itemTags].filter(t => userTags.has(t)));
        const union = new Set([...itemTags, ...userTags]);

        return union.size > 0 ? intersection.size / union.size : 0.5;
    }

    /**
     * Calculate recency score (exponential decay)
     */
    calculateRecencyScore(publishedAt) {
        if (!publishedAt) return 0.5;

        const now = Date.now();
        const published = new Date(publishedAt).getTime();
        const ageHours = (now - published) / (1000 * 60 * 60);

        // Half-life of 24 hours
        return Math.exp(-ageHours / 24);
    }

    /**
     * Calculate SRS focus (boost content with recent mistake words)
     */
    calculateSRSFocus(item, recentMistakes) {
        if (!recentMistakes || recentMistakes.length === 0) return 0;
        if (!item.unknownWords) return 0;

        const itemWords = new Set(item.unknownWords.map(w => w.toLowerCase()));
        const mistakeWords = new Set(recentMistakes.map(w => w.toLowerCase()));

        const overlap = [...itemWords].filter(w => mistakeWords.has(w));
        return overlap.length / Math.max(recentMistakes.length, 1);
    }

    /**
     * Adaptive difficulty adjustment (increase/decrease based on signals)
     */
    adjustDifficultyWindow(user, signals) {
        const { fastSkips = 0, saves = 0, replays = 0 } = signals;

        // If 3+ fast skips, reduce novelty target
        if (fastSkips >= 3) {
            return -0.03; // Reduce target novelty by 3%
        }

        // If 2+ saves or replays, increase challenge slightly
        if (saves >= 2 || replays >= 2) {
            return +0.02; // Increase target novelty by 2%
        }

        return 0; // No change
    }
}

module.exports = new FeedRanker();
