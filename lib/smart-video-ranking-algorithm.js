/**
 * 🎯 SMART VIDEO RANKING ALGORITHM
 * 
 * Personalized video scoring system that ranks videos based on:
 * - Level Match (40%): How close to user's CEFR level
 * - Vocabulary Match (30%): 90-95% known words = optimal
 * - Interest Match (15%): User's topic preferences
 * - Novelty (10%): Unseen > recent > old
 * - Engagement (5%): Predicted watch time
 * 
 * Implements i+1 distribution:
 * - 70% at user level (i)
 * - 20% slightly easier (i-1)
 * - 10% slightly harder (i+1)
 */

const contentDifficultyAnalyzer = require('./content-difficulty-analyzer');
const frequencyLookup = require('./frequency-lookup');

class SmartVideoRankingAlgorithm {
    constructor() {
        // CEFR levels
        this.LEVELS = [];
        const baseLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        baseLevels.forEach(base => {
            for (let i = 0; i <= 9; i++) {
                this.LEVELS.push(`${base}.${i}`);
            }
        });
        
        // Scoring weights
        this.WEIGHTS = {
            LEVEL_MATCH: 0.40,
            VOCABULARY_MATCH: 0.30,
            INTEREST_MATCH: 0.15,
            NOVELTY: 0.10,
            ENGAGEMENT: 0.05
        };
        
        // i+1 distribution targets
        this.DISTRIBUTION = {
            AT_LEVEL: 0.70,    // 70% at user level
            EASIER: 0.20,      // 20% easier
            HARDER: 0.10       // 10% harder
        };
        
        // Comprehension sweet spots
        this.OPTIMAL_COMPREHENSION_MIN = 0.90;  // 90% known words
        this.OPTIMAL_COMPREHENSION_MAX = 0.95;  // 95% known words
    }
    
    /**
     * Rank all videos for a specific user
     */
    async rankVideosForUser(videos, userProfile) {
        const {
            currentLevel,           // e.g., 'B1.5'
            knownWords,             // Set of Spanish words user knows
            interests,              // ['food', 'travel', 'culture']
            watchHistory,           // Array of watched video IDs
            skipHistory,            // Array of skipped video IDs
            recentVideos            // Last 20 watched (for novelty)
        } = userProfile;
        
        console.log(`📊 Ranking ${videos.length} videos for user at level ${currentLevel}`);
        
        // Score each video
        const scoredVideos = await Promise.all(
            videos.map(async video => {
                const score = await this.scoreVideo(video, userProfile);
                return {
                    ...video,
                    personalizedScore: score.total,
                    scoreBreakdown: score.breakdown,
                    reason: score.reason
                };
            })
        );
        
        // Sort by score (highest first)
        const ranked = scoredVideos.sort((a, b) => b.personalizedScore - a.personalizedScore);
        
        // Apply i+1 distribution
        const distributed = this.applyDistribution(ranked, userProfile);
        
        return distributed;
    }
    
    /**
     * Calculate personalized score for a single video
     */
    async scoreVideo(video, userProfile) {
        const scores = {
            levelMatch: 0,
            vocabularyMatch: 0,
            interestMatch: 0,
            novelty: 0,
            engagement: 0
        };
        
        // 1. Level Match Score (40%)
        scores.levelMatch = this.calculateLevelMatchScore(
            video.difficulty || video.level,
            userProfile.currentLevel
        );
        
        // 2. Vocabulary Match Score (30%)
        scores.vocabularyMatch = await this.calculateVocabularyMatchScore(
            video,
            userProfile.knownWords
        );
        
        // 3. Interest Match Score (15%)
        scores.interestMatch = this.calculateInterestMatchScore(
            video,
            userProfile.interests
        );
        
        // 4. Novelty Score (10%)
        scores.novelty = this.calculateNoveltyScore(
            video,
            userProfile.watchHistory,
            userProfile.recentVideos
        );
        
        // 5. Engagement Score (5%)
        scores.engagement = this.calculateEngagementScore(
            video,
            userProfile.skipHistory
        );
        
        // Calculate weighted total
        const total = 
            (scores.levelMatch * this.WEIGHTS.LEVEL_MATCH) +
            (scores.vocabularyMatch * this.WEIGHTS.VOCABULARY_MATCH) +
            (scores.interestMatch * this.WEIGHTS.INTEREST_MATCH) +
            (scores.novelty * this.WEIGHTS.NOVELTY) +
            (scores.engagement * this.WEIGHTS.ENGAGEMENT);
        
        return {
            total: Math.round(total * 100) / 100, // Round to 2 decimals
            breakdown: scores,
            reason: this.explainScore(scores, video, userProfile)
        };
    }
    
    /**
     * Score: How close is video level to user level?
     * Perfect match = 100, ±1 level = 80, ±2 = 60, etc.
     */
    calculateLevelMatchScore(videoLevel, userLevel) {
        if (!videoLevel) return 50; // Unknown difficulty, neutral score
        
        const videoIndex = this.LEVELS.indexOf(videoLevel);
        const userIndex = this.LEVELS.indexOf(userLevel);
        
        if (videoIndex === -1 || userIndex === -1) return 50;
        
        const diff = Math.abs(videoIndex - userIndex);
        
        // Perfect match
        if (diff === 0) return 100;
        
        // Within 0.5 levels (±5 micro-levels)
        if (diff <= 5) return 90;
        
        // Within 1 level (±10 micro-levels)
        if (diff <= 10) return 80;
        
        // Within 1.5 levels
        if (diff <= 15) return 65;
        
        // Within 2 levels
        if (diff <= 20) return 50;
        
        // More than 2 levels away
        return Math.max(20, 50 - (diff - 20) * 2);
    }
    
    /**
     * Score: What % of video words does user know?
     * Target: 90-95% for optimal learning (i+1)
     */
    async calculateVocabularyMatchScore(video, knownWords) {
        if (!video.transcript && !video.transcriptPath) {
            return 50; // No transcript, neutral score
        }
        
        // Get video words
        let videoWords = [];
        if (video.analyzedWords) {
            videoWords = video.analyzedWords;
        } else if (video.transcript) {
            const analysis = await contentDifficultyAnalyzer.analyzeText(video.transcript);
            videoWords = analysis.uniqueWords || [];
        }
        
        if (videoWords.length === 0) return 50;
        
        // Calculate comprehension %
        const knownWordsSet = new Set(knownWords || []);
        const knownCount = videoWords.filter(word => knownWordsSet.has(word.toLowerCase())).length;
        const comprehension = knownCount / videoWords.length;
        
        // Score based on comprehension
        if (comprehension >= this.OPTIMAL_COMPREHENSION_MIN && 
            comprehension <= this.OPTIMAL_COMPREHENSION_MAX) {
            // Perfect zone! (90-95%)
            return 100;
        } else if (comprehension >= 0.85 && comprehension < 0.90) {
            // Slightly challenging (good)
            return 90;
        } else if (comprehension > 0.95 && comprehension <= 0.98) {
            // Slightly too easy (but ok)
            return 85;
        } else if (comprehension > 0.98) {
            // Too easy (boring)
            return 60;
        } else if (comprehension >= 0.75 && comprehension < 0.85) {
            // Challenging but manageable
            return 70;
        } else if (comprehension >= 0.60 && comprehension < 0.75) {
            // Too hard
            return 40;
        } else {
            // Way too hard
            return 20;
        }
    }
    
    /**
     * Score: Does video match user's interests?
     */
    calculateInterestMatchScore(video, userInterests) {
        if (!userInterests || userInterests.length === 0) return 50; // No preference data
        if (!video.topics && !video.category) return 50; // No topic data
        
        const videoTopics = video.topics || [video.category] || [];
        
        // Check for matches
        const matches = videoTopics.filter(topic => 
            userInterests.some(interest => 
                topic.toLowerCase().includes(interest.toLowerCase()) ||
                interest.toLowerCase().includes(topic.toLowerCase())
            )
        );
        
        if (matches.length === 0) return 30; // No match
        if (matches.length === 1) return 70; // One match
        if (matches.length >= 2) return 100; // Multiple matches!
        
        return 50;
    }
    
    /**
     * Score: How novel is this video?
     * Never seen = 100, seen recently = 0, seen long ago = 50
     */
    calculateNoveltyScore(video, watchHistory, recentVideos) {
        const videoId = video.id || video.path;
        
        // Never watched
        if (!watchHistory || !watchHistory.includes(videoId)) {
            return 100;
        }
        
        // Watched recently (last 20 videos)
        if (recentVideos && recentVideos.includes(videoId)) {
            return 10; // Don't show again soon
        }
        
        // Watched before but not recently
        return 50; // Can show again
    }
    
    /**
     * Score: Is this video engaging?
     * Predict if user will watch or skip based on history
     */
    calculateEngagementScore(video, skipHistory) {
        // If user has skipped similar videos, lower score
        if (skipHistory && skipHistory.includes(video.id)) {
            return 20; // User didn't like this before
        }
        
        // Check video characteristics
        let score = 50; // Base score
        
        // Duration score (30-60 seconds is ideal)
        if (video.duration) {
            if (video.duration >= 30 && video.duration <= 60) {
                score += 30; // Perfect length
            } else if (video.duration > 60 && video.duration <= 90) {
                score += 15; // Slightly long
            } else if (video.duration > 90) {
                score -= 10; // Too long
            } else if (video.duration < 20) {
                score -= 10; // Too short
            }
        }
        
        // Quality indicators
        if (video.hasSubtitles) score += 10;
        if (video.verified) score += 10;
        
        return Math.min(Math.max(score, 0), 100);
    }
    
    /**
     * Apply i+1 distribution to ensure variety
     * 70% at level, 20% easier, 10% harder
     */
    applyDistribution(rankedVideos, userProfile) {
        const userLevelIndex = this.LEVELS.indexOf(userProfile.currentLevel);
        
        // Categorize videos by difficulty relative to user
        const categories = {
            atLevel: [],
            easier: [],
            harder: []
        };
        
        rankedVideos.forEach(video => {
            const videoLevelIndex = this.LEVELS.indexOf(video.difficulty || video.level);
            if (videoLevelIndex === -1) {
                categories.atLevel.push(video);
                return;
            }
            
            const diff = videoLevelIndex - userLevelIndex;
            
            if (diff >= -5 && diff <= 5) {
                // Within 0.5 levels = at level
                categories.atLevel.push(video);
            } else if (diff < -5) {
                // More than 0.5 levels easier
                categories.easier.push(video);
            } else {
                // More than 0.5 levels harder
                categories.harder.push(video);
            }
        });
        
        // Build distributed feed
        const distributed = [];
        const atLevelCount = Math.ceil(rankedVideos.length * this.DISTRIBUTION.AT_LEVEL);
        const easierCount = Math.ceil(rankedVideos.length * this.DISTRIBUTION.EASIER);
        const harderCount = Math.ceil(rankedVideos.length * this.DISTRIBUTION.HARDER);
        
        // Add videos in distribution
        distributed.push(...categories.atLevel.slice(0, atLevelCount));
        distributed.push(...categories.easier.slice(0, easierCount));
        distributed.push(...categories.harder.slice(0, harderCount));
        
        // Shuffle to mix difficulty levels throughout feed
        return this.shuffleWithPattern(distributed);
    }
    
    /**
     * Shuffle with pattern to avoid consecutive similar difficulties
     * Pattern: Easy → Medium → Hard → Medium → Easy ...
     */
    shuffleWithPattern(videos) {
        // Group by difficulty
        const userLevel = 'B1.0'; // Would get from userProfile
        const userIndex = this.LEVELS.indexOf(userLevel);
        
        const easy = [], medium = [], hard = [];
        
        videos.forEach(video => {
            const videoIndex = this.LEVELS.indexOf(video.difficulty || video.level);
            if (videoIndex === -1) {
                medium.push(video);
            } else {
                const diff = videoIndex - userIndex;
                if (diff < -5) easy.push(video);
                else if (diff > 5) hard.push(video);
                else medium.push(video);
            }
        });
        
        // Interleave
        const shuffled = [];
        const maxLength = Math.max(easy.length, medium.length, hard.length);
        
        for (let i = 0; i < maxLength; i++) {
            // Pattern: M → E → M → H → M → E → M → H ...
            const pattern = i % 4;
            if (pattern === 0 || pattern === 2) {
                if (medium.length > 0) shuffled.push(medium.shift());
            } else if (pattern === 1) {
                if (easy.length > 0) shuffled.push(easy.shift());
                else if (medium.length > 0) shuffled.push(medium.shift());
            } else {
                if (hard.length > 0) shuffled.push(hard.shift());
                else if (medium.length > 0) shuffled.push(medium.shift());
            }
        }
        
        // Add any remaining
        shuffled.push(...easy, ...medium, ...hard);
        
        return shuffled;
    }
    
    /**
     * Explain why video got this score
     */
    explainScore(scores, video, userProfile) {
        const reasons = [];
        
        if (scores.levelMatch >= 90) {
            reasons.push('Perfect level match');
        } else if (scores.levelMatch >= 70) {
            reasons.push('Good level match');
        }
        
        if (scores.vocabularyMatch >= 90) {
            reasons.push('Optimal word difficulty');
        } else if (scores.vocabularyMatch < 60) {
            reasons.push('May be challenging');
        }
        
        if (scores.interestMatch >= 70) {
            reasons.push('Matches your interests');
        }
        
        if (scores.novelty >= 90) {
            reasons.push('New content');
        } else if (scores.novelty < 30) {
            reasons.push('You\'ve seen this recently');
        }
        
        return reasons.join(' • ');
    }
    
    /**
     * Quick filter: Remove videos that are definitely wrong for user
     */
    filterUnsuitable(videos, userProfile) {
        const userLevelIndex = this.LEVELS.indexOf(userProfile.currentLevel);
        
        return videos.filter(video => {
            // Remove already watched recently
            if (userProfile.recentVideos && userProfile.recentVideos.includes(video.id)) {
                return false;
            }
            
            // Remove videos more than 2 levels away
            const videoLevelIndex = this.LEVELS.indexOf(video.difficulty || video.level);
            if (videoLevelIndex !== -1) {
                const diff = Math.abs(videoLevelIndex - userLevelIndex);
                if (diff > 20) { // More than 2 full levels
                    return false;
                }
            }
            
            return true;
        });
    }
}

module.exports = SmartVideoRankingAlgorithm;

