/**
 * SMART FEED ALGORITHM - User Level Based Recommendation
 *
 * Research-based feed generation inspired by:
 * - Duolingo's Birdbrain adaptive system
 * - Busuu's spaced repetition algorithm
 * - Babbel's placement testing
 *
 * Mix: 70% at user level, 20% easier, 10% challenge
 */

const videoDifficultyScorer = require('./videoDifficultyScorer');

class SmartFeedAlgorithm {
    constructor() {
        this.defaultLevel = 'A2'; // Beginner-friendly default
    }

    /**
     * Generate personalized feed based on user level
     * @param {Array} allVideos - All available videos
     * @param {String} userLevel - User's CEFR level (A1-C2)
     * @param {Object} options - Optional parameters
     * @returns {Array} Personalized feed
     */
    async generateSmartFeed(allVideos, userLevel = null, options = {}) {
        const {
            count = 20,
            includeReview = true,
            savedWords = []
        } = options;

        // Use default level if none provided
        const targetLevel = userLevel || this.defaultLevel;

        console.log(`🎯 Generating smart feed for level: ${targetLevel}`);

        // Score all videos for difficulty
        const scoredVideos = videoDifficultyScorer.scoreMultipleVideos(allVideos);

        // Filter videos by CEFR level ranges
        const atLevel = scoredVideos.filter(v => v.difficulty.cefrLevel === targetLevel);
        const easierLevel = this.getOneLevelLower(targetLevel);
        const easierVideos = scoredVideos.filter(v => v.difficulty.cefrLevel === easierLevel);
        const harderLevel = this.getOneLevelHigher(targetLevel);
        const harderVideos = scoredVideos.filter(v => v.difficulty.cefrLevel === harderLevel);

        console.log(`📊 Video distribution:`);
        console.log(`  At level (${targetLevel}): ${atLevel.length} videos`);
        console.log(`  Easier (${easierLevel}): ${easierVideos.length} videos`);
        console.log(`  Harder (${harderLevel}): ${harderVideos.length} videos`);

        // Calculate mix ratios (Duolingo's optimal challenge curve)
        const atLevelCount = Math.ceil(count * 0.70); // 70% at user level
        const easierCount = Math.ceil(count * 0.20);  // 20% easier (confidence building)
        const harderCount = Math.ceil(count * 0.10);  // 10% challenging (growth)

        // Build feed with optimal mix
        const feed = [
            ...this.shuffle(atLevel).slice(0, atLevelCount),
            ...this.shuffle(easierVideos).slice(0, easierCount),
            ...this.shuffle(harderVideos).slice(0, harderCount)
        ];

        // Interleave: 2 at-level, 1 easier, 1 harder pattern
        const interleavedFeed = this.interleaveVideos(feed, {
            atLevel: feed.filter(v => v.difficulty.cefrLevel === targetLevel),
            easier: feed.filter(v => v.difficulty.cefrLevel === easierLevel),
            harder: feed.filter(v => v.difficulty.cefrLevel === harderLevel)
        });

        console.log(`✅ Smart feed generated: ${interleavedFeed.length} videos`);
        return interleavedFeed.slice(0, count);
    }

    /**
     * Interleave videos in optimal pattern for learning
     * Pattern: 2 at-level → 1 easier → 1 at-level → 1 harder
     */
    interleaveVideos(allVideos, categorized) {
        const result = [];
        let atIndex = 0, easierIndex = 0, harderIndex = 0;

        const { atLevel = [], easier = [], harder = [] } = categorized;

        while (atIndex < atLevel.length || easierIndex < easier.length || harderIndex < harder.length) {
            // Add 2 at-level videos
            if (atIndex < atLevel.length) {
                result.push(atLevel[atIndex++]);
            }
            if (atIndex < atLevel.length) {
                result.push(atLevel[atIndex++]);
            }

            // Add 1 easier video (confidence boost)
            if (easierIndex < easier.length) {
                result.push(easier[easierIndex++]);
            }

            // Add 1 at-level video
            if (atIndex < atLevel.length) {
                result.push(atLevel[atIndex++]);
            }

            // Add 1 harder video (challenge)
            if (harderIndex < harder.length) {
                result.push(harder[harderIndex++]);
            }
        }

        return result;
    }

    /**
     * Adjust user level based on word click patterns
     * @param {Array} recentClicks - Recent word interactions
     * @param {String} currentLevel - Current user level
     * @returns {Object} Level adjustment recommendation
     */
    analyzeWordClicks(recentClicks, currentLevel) {
        if (!recentClicks || recentClicks.length < 10) {
            return {
                shouldAdjust: false,
                newLevel: currentLevel,
                reason: 'Insufficient data (need 10+ word clicks)'
            };
        }

        // Calculate metrics
        const avgDifficulty = recentClicks.reduce((sum, click) => {
            const wordDiff = videoDifficultyScorer.getWordDifficulty(click.word);
            return sum + this.cefrToNumeric(wordDiff.cefrLevel);
        }, 0) / recentClicks.length;

        const clickRate = recentClicks.length / 50; // clicks per video (assuming 50 videos watched)
        const userLevelNumeric = this.cefrToNumeric(currentLevel);

        // Decision logic based on Duolingo research:
        // 1. Clicking many hard words (struggling) → lower level
        // 2. Clicking few words (too easy) → raise level
        // 3. Fast click rate on hard words (struggling) → lower level

        if (avgDifficulty > userLevelNumeric + 1.5 && clickRate > 0.3) {
            // Clicking many words above their level = struggling
            return {
                shouldAdjust: true,
                newLevel: this.getOneLevelLower(currentLevel),
                reason: 'High click rate on difficult words - lowering difficulty',
                metrics: { avgDifficulty, clickRate, userLevelNumeric }
            };
        } else if (clickRate < 0.1 && avgDifficulty < userLevelNumeric) {
            // Very few clicks on easy words = too easy
            return {
                shouldAdjust: true,
                newLevel: this.getOneLevelHigher(currentLevel),
                reason: 'Low click rate - content too easy, increasing difficulty',
                metrics: { avgDifficulty, clickRate, userLevelNumeric }
            };
        }

        return {
            shouldAdjust: false,
            newLevel: currentLevel,
            reason: 'User performing well at current level',
            metrics: { avgDifficulty, clickRate, userLevelNumeric }
        };
    }

    /**
     * Convert CEFR level to numeric (for calculations)
     */
    cefrToNumeric(level) {
        const mapping = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
        return mapping[level] || 3;
    }

    /**
     * Convert numeric to CEFR level
     */
    numericToCEFR(num) {
        const mapping = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2' };
        return mapping[Math.round(num)] || 'B1';
    }

    /**
     * Get one CEFR level lower
     */
    getOneLevelLower(level) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const index = levels.indexOf(level);
        return index > 0 ? levels[index - 1] : level;
    }

    /**
     * Get one CEFR level higher
     */
    getOneLevelHigher(level) {
        const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const index = levels.indexOf(level);
        return index < levels.length - 1 ? levels[index + 1] : level;
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
     * Calculate optimal speed suggestion based on struggle
     * @param {Number} wordClickCount - Number of word clicks in current video
     * @param {Number} videoProgress - How far into video (0-1)
     * @returns {Object} Speed recommendation
     */
    calculateSpeedSuggestion(wordClickCount, videoProgress) {
        // Duolingo research: 5+ clicks in one video = struggling
        if (wordClickCount >= 5) {
            return {
                shouldSuggest: true,
                recommendedSpeed: 0.75,
                reason: 'Many word lookups detected - slowing down might help',
                confidence: 'high'
            };
        }

        // Early struggle (3+ clicks in first 30%)
        if (wordClickCount >= 3 && videoProgress < 0.3) {
            return {
                shouldSuggest: true,
                recommendedSpeed: 0.75,
                reason: 'Early struggle detected - try slowing down',
                confidence: 'medium'
            };
        }

        return {
            shouldSuggest: false,
            recommendedSpeed: 1.0,
            reason: 'User performing well',
            confidence: 'low'
        };
    }
}

module.exports = new SmartFeedAlgorithm();
