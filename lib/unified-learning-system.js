/**
 * 🎯 UNIFIED LEARNING SYSTEM
 * 
 * Orchestrates all learning algorithms:
 * - TikTok Feed Algorithm (viral engagement)
 * - Half-Life Regression (spaced repetition)
 * - Adaptive Difficulty (i+1 rule)
 * - Gamification Engine (variable rewards)
 * 
 * This is the main controller that integrates all systems
 */

const TikTokFeedAlgorithm = require('./tiktok-feed-algorithm');
const HalfLifeRegression = require('./half-life-regression');
const AdaptiveDifficultyEngine = require('./adaptive-difficulty-engine');
const GamificationEngine = require('./gamification-engine');

class UnifiedLearningSystem {
    constructor() {
        this.feedAlgorithm = new TikTokFeedAlgorithm();
        this.spacedRepetition = new HalfLifeRegression();
        this.difficultyEngine = new AdaptiveDifficultyEngine();
        this.gamification = new GamificationEngine();
        
        // Session tracking
        this.activeSessions = new Map();
    }

    /**
     * Generate personalized feed for user
     * Combines TikTok algorithm + adaptive difficulty + spaced repetition
     */
    async generatePersonalizedFeed(userId, options = {}) {
        const {
            feedType = 'videos',  // 'videos' | 'articles' | 'mixed'
            count = 20,
            availableContent = [],
            userHistory = []
        } = options;

        // Get user profile from feed algorithm
        const userProfile = this.feedAlgorithm.buildUserProfile(userId, userHistory);
        
        // Get user's current difficulty level
        const userLevel = this.difficultyEngine.getUserLevel(userId);
        
        // Get words due for review (spaced repetition)
        const dueWords = this.spacedRepetition.getWeakestWords(userId, 5);
        
        // Determine personalization stage
        const stage = userProfile.personalizationStage;
        
        let feed = [];
        
        if (stage === 'cold_start') {
            // Cold start: Use popular content with optional preferences
            feed = this.feedAlgorithm.getColdStartRecommendations(
                { 
                    selectedInterests: userProfile.interests,
                    language: 'es' 
                },
                availableContent
            );
        } else {
            // Personalized: Use multi-armed bandit (40% exploit / 60% explore)
            feed = this.feedAlgorithm.getPersonalizedFeed(userProfile, availableContent, count);
        }
        
        // Apply adaptive difficulty distribution (70/20/10)
        feed = this.difficultyEngine.distributeContent(
            userLevel.currentLevel,
            feed,
            count
        );
        
        // Analyze comprehensibility for each item
        feed = feed.map(item => {
            const analysis = this.difficultyEngine.analyzeComprehensibility(item, userId);
            return {
                ...item,
                comprehensibility: analysis,
                dueWords: this.findDueWordsInContent(item, dueWords)
            };
        });
        
        // Score and rank by engagement potential
        feed = feed.map(item => {
            const engagementScore = this.feedAlgorithm.calculateEngagementScore(item.metrics || {});
            const viralStage = this.feedAlgorithm.getViralStage(item);
            
            return {
                ...item,
                engagementScore,
                viralStage,
                priority: this.calculatePriority(item, userProfile, dueWords)
            };
        });
        
        // Sort by priority
        feed.sort((a, b) => b.priority - a.priority);
        
        return {
            feed: feed.slice(0, count),
            userProfile: {
                personalizationStage: stage,
                currentLevel: userLevel.currentLevel,
                videosWatched: userProfile.videosSeen.size,
                totalWatchTime: userProfile.totalWatchTime
            },
            dueWords: dueWords.map(w => ({
                wordId: w.wordId,
                urgency: w.urgency,
                strengthBars: w.strengthBars,
                daysUntilReview: w.daysUntilReview
            }))
        };
    }

    /**
     * Calculate priority score for content ranking
     */
    calculatePriority(item, userProfile, dueWords) {
        let priority = 0;
        
        // Engagement score (TikTok algorithm)
        priority += item.engagementScore * 10;
        
        // Viral potential
        if (item.viralStage === 'spreading') priority += 20;
        if (item.viralStage === 'ranking') priority += 10;
        
        // Comprehensibility (i+1 optimal)
        if (item.comprehensibility?.isOptimal) priority += 30;
        
        // Contains due words (spaced repetition priority)
        if (item.dueWords && item.dueWords.length > 0) {
            priority += item.dueWords.length * 15;
        }
        
        // Personalization match
        if (item.source === 'exploit') priority += 10;
        
        return priority;
    }

    /**
     * Find due words in content
     */
    findDueWordsInContent(item, dueWords) {
        if (!item.text && !item.spanish) return [];
        
        const contentText = (item.text || item.spanish || '').toLowerCase();
        const words = this.difficultyEngine.extractWords(contentText);
        
        return dueWords.filter(dueWord => 
            words.includes(dueWord.wordId.toLowerCase())
        );
    }

    /**
     * Track user interaction with content
     * Updates all systems: Feed algorithm, HLR, Difficulty, Gamification
     */
    async trackInteraction(userId, interaction) {
        const {
            contentId,
            contentType,
            action,           // 'view' | 'complete' | 'like' | 'share' | 'comment' | 'rewatch' | 'save'
            watchTime,
            completed,
            words = [],       // Words interacted with
            correct = null,   // For quiz/practice
            responseTime = 0
        } = interaction;

        const results = {};

        // 1. Update Feed Algorithm (engagement tracking)
        if (action === 'view' || action === 'complete') {
            const watchData = {
                totalWatchTime: watchTime || 0,
                videoDuration: interaction.videoDuration || 30,
                rewatched: action === 'rewatch',
                watchedToEnd: completed,
                dwellTime: watchTime || 0
            };
            
            results.watchQuality = this.feedAlgorithm.calculateWatchTimeQuality(watchData);
            results.passedHook = this.feedAlgorithm.passedHookTest(watchData);
        }

        // 2. Update Spaced Repetition (for word interactions)
        if (words.length > 0) {
            results.wordUpdates = [];
            
            for (const word of words) {
                const practiceResult = {
                    correct: word.correct !== undefined ? word.correct : true,
                    responseTime: word.responseTime || responseTime,
                    confidence: word.confidence || 0.8
                };
                
                const wordFeatures = {
                    wordLength: word.word.length,
                    wordFrequency: word.frequency || 1000,
                    isCognate: word.isCognate || false,
                    isIrregular: word.isIrregular || false
                };
                
                const update = this.spacedRepetition.recordPractice(
                    userId,
                    word.word,
                    practiceResult,
                    wordFeatures
                );
                
                results.wordUpdates.push(update);
            }
        }

        // 3. Update Difficulty Engine (track performance)
        if (correct !== null) {
            const userLevel = this.difficultyEngine.getUserLevel(userId);
            
            // Add to known words if correct
            if (correct && words.length > 0) {
                this.difficultyEngine.addKnownWords(
                    userId,
                    words.map(w => w.word)
                );
            }
        }

        // 4. Award XP (Gamification)
        let xpContext = {
            difficulty: interaction.difficulty,
            urgency: interaction.urgency
        };

        if (action === 'complete' && completed) {
            results.xp = this.gamification.awardXP(userId, 'watchToCompletion', xpContext);
        } else if (action === 'rewatch') {
            results.xp = this.gamification.awardXP(userId, 'rewatchVideo', xpContext);
        } else if (action === 'share') {
            results.xp = this.gamification.awardXP(userId, 'shareContent', xpContext);
        } else if (action === 'like') {
            results.xp = this.gamification.awardXP(userId, 'like', xpContext);
        } else if (action === 'comment') {
            results.xp = this.gamification.awardXP(userId, 'comment', xpContext);
        } else if (action === 'save') {
            results.xp = this.gamification.awardXP(userId, 'saveWord', xpContext);
        }

        // Award XP for mastering weak words
        if (words.length > 0 && results.wordUpdates) {
            for (const update of results.wordUpdates) {
                if (update.schedule.urgency === 'due_soon' || update.schedule.urgency === 'overdue') {
                    const wordXP = this.gamification.awardXP(userId, 'masterWeakWord', {
                        urgency: update.schedule.urgency
                    });
                    results.xp = results.xp || {};
                    results.xp.xpAwarded = (results.xp.xpAwarded || 0) + wordXP.xpAwarded;
                    results.xp.totalXP = wordXP.totalXP;
                }
            }
        }

        // 5. Update streak
        results.streak = this.gamification.updateStreak(userId);

        return results;
    }

    /**
     * Start learning session
     */
    startSession(userId, sessionType = 'video') {
        const session = {
            userId,
            sessionType,
            startTime: Date.now(),
            interactions: [],
            xpEarned: 0,
            wordsReviewed: 0,
            contentViewed: 0
        };
        
        this.activeSessions.set(userId, session);
        
        // Update daily login XP
        const xpReward = this.gamification.awardXP(userId, 'dailyLogin');
        session.xpEarned += xpReward.xpAwarded;
        
        return session;
    }

    /**
     * End learning session
     */
    endSession(userId) {
        const session = this.activeSessions.get(userId);
        if (!session) return null;
        
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;
        
        this.activeSessions.delete(userId);
        
        return session;
    }

    /**
     * Get comprehensive user dashboard
     */
    async getUserDashboard(userId) {
        // Gamification stats
        const gamificationState = this.gamification.getUserState(userId);
        
        // Learning level
        const userLevel = this.difficultyEngine.getUserLevel(userId);
        const levelProgression = this.difficultyEngine.getLevelProgression(userId);
        
        // Spaced repetition status
        const weakWords = this.spacedRepetition.getWeakestWords(userId, 10);
        const modelAccuracy = this.spacedRepetition.getModelAccuracy();
        
        // Streak status
        const streakRisk = this.gamification.checkStreakAtRisk(userId);
        
        // Performance analysis
        const recentPerformance = []; // Would come from database
        const userState = this.difficultyEngine.detectUserState(userId, recentPerformance);
        
        return {
            user: {
                level: userLevel.currentLevel,
                xp: gamificationState.xp,
                userLevel: gamificationState.level,
                streakDays: gamificationState.streakDays,
                longestStreak: gamificationState.longestStreak
            },
            stats: {
                videosWatched: gamificationState.videosWatched,
                wordsLearned: gamificationState.wordsLearned,
                lessonsCompleted: gamificationState.lessonsCompleted,
                totalXP: gamificationState.statistics.totalXP,
                xpToday: gamificationState.statistics.xpToday
            },
            learning: {
                currentLevel: userLevel.currentLevel,
                knownWords: userLevel.knownWords.size,
                levelProgression,
                weakWords: weakWords.map(w => ({
                    word: w.wordId,
                    urgency: w.urgency,
                    strengthBars: w.strengthBars,
                    daysUntilReview: w.daysUntilReview,
                    currentRecall: w.currentRecall
                })),
                userState: userState.state,
                recommendation: userState.recommendation
            },
            streak: {
                current: gamificationState.streakDays,
                longest: gamificationState.longestStreak,
                atRisk: streakRisk.atRisk,
                hoursRemaining: streakRisk.hoursRemaining,
                lossAversion: streakRisk.lossAversion
            },
            achievements: gamificationState.achievements,
            systemHealth: {
                modelAccuracy: modelAccuracy?.accuracy || 0,
                personalizationStage: 'stable' // Would come from feed algorithm
            }
        };
    }

    /**
     * Generate optimal practice session
     * Combines weakest words with optimal difficulty content
     */
    async generatePracticeSession(userId, duration = 10) {
        // Get weakest words
        const weakWords = this.spacedRepetition.getWeakestWords(userId, duration);
        
        // Get user level for context
        const userLevel = this.difficultyEngine.getUserLevel(userId);
        
        // Create practice items
        const practiceItems = weakWords.map(word => ({
            type: 'vocabulary',
            wordId: word.wordId,
            currentRecall: word.currentRecall,
            strengthBars: word.strengthBars,
            urgency: word.urgency,
            level: userLevel.currentLevel,
            xpPotential: this.spacedRepetition.calculateXPReward(
                word,
                { urgency: word.urgency },
                true
            )
        }));
        
        return {
            sessionId: `practice_${userId}_${Date.now()}`,
            duration,
            items: practiceItems,
            totalXPPotential: practiceItems.reduce((sum, item) => sum + item.xpPotential, 0)
        };
    }

    /**
     * Check if user should level up or down
     */
    async assessLevelChange(userId, recentPerformance) {
        const assessment = this.difficultyEngine.assessLevelAdjustment(userId, recentPerformance);
        
        if (assessment.shouldAdjust) {
            // Update level
            this.difficultyEngine.updateUserLevel(userId, assessment.newLevel);
            
            // Award achievement XP
            const xpReward = this.gamification.awardXP(userId, 'completeQuiz', {
                difficulty: assessment.direction === 'up' ? 8 : 2
            });
            
            return {
                ...assessment,
                xpAwarded: xpReward.xpAwarded,
                showCelebration: assessment.direction === 'up'
            };
        }
        
        return assessment;
    }

    /**
     * Export all user data
     */
    exportUserData(userId) {
        return {
            feedProfile: this.feedAlgorithm.buildUserProfile(userId, []),
            spacedRepetition: this.spacedRepetition.exportUserData(userId),
            difficulty: this.difficultyEngine.exportUserData(userId),
            gamification: this.gamification.exportUserData(userId)
        };
    }

    /**
     * Import all user data
     */
    importUserData(userId, data) {
        if (data.spacedRepetition) {
            this.spacedRepetition.importUserData(data.spacedRepetition);
        }
        if (data.difficulty) {
            this.difficultyEngine.importUserData(userId, data.difficulty);
        }
        if (data.gamification) {
            this.gamification.importUserData(userId, data.gamification);
        }
    }
}

// Export
module.exports = UnifiedLearningSystem;
