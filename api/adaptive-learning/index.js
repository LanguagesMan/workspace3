/**
 * 🎯 ADAPTIVE LEARNING API ENDPOINTS
 * 
 * Connects all adaptive learning systems:
 * - Placement test
 * - Level tracking
 * - Video ranking & personalized feed
 * - Guided learning mode
 * - Quizzes & games
 * - Gamification
 */

const express = require('express');
const router = express.Router();

// Import core systems
const AdaptivePlacementTest = require('../../lib/adaptive-placement-test');
const EnhancedLevelTracker = require('../../lib/enhanced-level-tracker');
const SmartVideoRankingAlgorithm = require('../../lib/smart-video-ranking-algorithm');
const GuidedLearningEngine = require('../../lib/guided-learning-engine');
const VideoQuizGenerator = require('../../lib/video-quiz-generator');
const InfiniteFeedAlgorithm = require('../../lib/infinite-feed-algorithm');
const GamificationSystem = require('../../lib/gamification-system');

// Initialize systems
const placementTest = new AdaptivePlacementTest();
const levelTracker = new EnhancedLevelTracker();
const videoRanker = new SmartVideoRankingAlgorithm();
const guidedLearning = new GuidedLearningEngine();
const quizGenerator = new VideoQuizGenerator();
const feedAlgorithm = new InfiniteFeedAlgorithm();
const gamification = new GamificationSystem();

// ===== PLACEMENT TEST APIs =====

/**
 * POST /api/adaptive-learning/placement-test/start
 * Start a new placement test
 */
router.post('/placement-test/start', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        
        const testState = await placementTest.startTest(userId);
        
        res.json({
            success: true,
            testState,
            message: 'Placement test started! Let\'s find your level.'
        });
    } catch (error) {
        console.error('Error starting placement test:', error);
        res.status(500).json({ error: 'Failed to start placement test' });
    }
});

/**
 * GET /api/adaptive-learning/placement-test/question
 * Get next question in placement test
 */
router.get('/placement-test/question', async (req, res) => {
    try {
        const { testId, userId } = req.query;
        
        // Retrieve test state (from session or database)
        const testState = req.session?.placementTest || {};
        
        const question = await placementTest.getNextQuestion(testState);
        
        res.json({
            success: true,
            question
        });
    } catch (error) {
        console.error('Error getting question:', error);
        res.status(500).json({ error: 'Failed to get question' });
    }
});

/**
 * POST /api/adaptive-learning/placement-test/submit
 * Submit answer to placement test question
 */
router.post('/placement-test/submit', async (req, res) => {
    try {
        const { testId, questionId, answer, timeSpent } = req.body;
        
        // Retrieve test state
        const testState = req.session?.placementTest || {};
        
        const result = await placementTest.submitAnswer(testState, questionId, answer, timeSpent);
        
        // Save updated state
        req.session.placementTest = testState;
        
        // Award XP for completing question
        if (result.correct) {
            await gamification.awardXP(testState.userId, 5, 'placement_test_question');
        }
        
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ error: 'Failed to submit answer' });
    }
});

// ===== PERSONALIZED FEED APIs =====

/**
 * GET /api/adaptive-learning/feed/personalized
 * Get personalized video feed for user
 */
router.get('/feed/personalized', async (req, res) => {
    try {
        const { userId, batchSize = 20, startIndex = 0 } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        
        // Get user profile
        const userProfile = await levelTracker.getUserProfile(userId);
        
        // Generate personalized feed
        const feed = await feedAlgorithm.generateFeed(userId, userProfile, {
            batchSize: parseInt(batchSize),
            startIndex: parseInt(startIndex)
        });
        
        res.json({
            success: true,
            ...feed
        });
    } catch (error) {
        console.error('Error generating feed:', error);
        res.status(500).json({ error: 'Failed to generate feed' });
    }
});

/**
 * POST /api/adaptive-learning/feed/track-interaction
 * Track user interaction with feed item
 */
router.post('/feed/track-interaction', async (req, res) => {
    try {
        const { userId, feedItem, interaction } = req.body;
        
        // Track in feed algorithm
        const feedResult = await feedAlgorithm.trackInteraction(userId, feedItem, interaction);
        
        // Track in level tracker
        const levelResult = await levelTracker.trackInteraction(userId, {
            type: feedItem.type,
            contentId: feedItem.content?.id,
            contentLevel: feedItem.content?.difficulty,
            success: interaction.success,
            timeSpent: interaction.timeSpent,
            metadata: interaction
        });
        
        // Award XP
        let xpAwarded = 0;
        if (interaction.success) {
            const xpResult = gamification.awardXP(userId, feedItem.xpReward || 5, feedItem.type);
            xpAwarded = xpResult.finalXP;
        }
        
        res.json({
            success: true,
            tracked: true,
            xpAwarded,
            levelReassessed: levelResult.levelReassessed,
            shouldAdjustFeed: feedResult.shouldAdjust
        });
    } catch (error) {
        console.error('Error tracking interaction:', error);
        res.status(500).json({ error: 'Failed to track interaction' });
    }
});

// ===== GUIDED LEARNING APIs =====

/**
 * GET /api/adaptive-learning/guided-learning/topics
 * Get available guided learning topics
 */
router.get('/guided-learning/topics', async (req, res) => {
    try {
        const { userId } = req.query;
        
        // Get user profile to match appropriate topics
        const userProfile = await levelTracker.getUserProfile(userId);
        
        const topics = guidedLearning.getAvailableTopics(userProfile.currentLevel);
        
        res.json({
            success: true,
            topics
        });
    } catch (error) {
        console.error('Error getting topics:', error);
        res.status(500).json({ error: 'Failed to get topics' });
    }
});

/**
 * POST /api/adaptive-learning/guided-learning/start
 * Start a guided learning journey
 */
router.post('/guided-learning/start', async (req, res) => {
    try {
        const { userId, topicId, journeyType = 'standard' } = req.body;
        
        if (!userId || !topicId) {
            return res.status(400).json({ error: 'userId and topicId are required' });
        }
        
        const journey = await guidedLearning.startJourney(userId, topicId, journeyType);
        
        // Store in session or database
        req.session.guidedJourney = journey;
        
        res.json({
            success: true,
            journey,
            message: `Started ${journey.topic.title} journey!`
        });
    } catch (error) {
        console.error('Error starting journey:', error);
        res.status(500).json({ error: 'Failed to start journey' });
    }
});

/**
 * GET /api/adaptive-learning/guided-learning/next-step
 * Get next step in guided journey
 */
router.get('/guided-learning/next-step', async (req, res) => {
    try {
        const { journeyId } = req.query;
        
        // Retrieve journey from session or database
        const journey = req.session?.guidedJourney || {};
        
        const result = await guidedLearning.getNextStep(journey);
        
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Error getting next step:', error);
        res.status(500).json({ error: 'Failed to get next step' });
    }
});

/**
 * POST /api/adaptive-learning/guided-learning/submit-step
 * Submit answer for current journey step
 */
router.post('/guided-learning/submit-step', async (req, res) => {
    try {
        const { journeyId, answer } = req.body;
        
        // Retrieve journey
        const journey = req.session?.guidedJourney || {};
        
        const result = await guidedLearning.submitStepAnswer(journey, answer);
        
        // Update journey in session
        req.session.guidedJourney = journey;
        
        // Award XP
        if (result.correct) {
            gamification.awardXP(journey.userId, result.points || 10, 'guided_learning_step');
        }
        
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Error submitting step:', error);
        res.status(500).json({ error: 'Failed to submit step' });
    }
});

// ===== QUIZ GENERATION APIs =====

/**
 * POST /api/adaptive-learning/quiz/generate
 * Generate quiz from video
 */
router.post('/quiz/generate', async (req, res) => {
    try {
        const { videoId, userId } = req.body;
        
        // Get video data
        const video = { id: videoId }; // Would fetch from database
        
        // Get user level
        const userProfile = await levelTracker.getUserProfile(userId);
        
        // Generate quiz
        const quiz = await quizGenerator.generateQuiz(video, userProfile.currentLevel);
        
        res.json({
            success: true,
            quiz
        });
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

// ===== GAMIFICATION APIs =====

/**
 * GET /api/adaptive-learning/gamification/profile
 * Get user's gamification profile
 */
router.get('/gamification/profile', async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        
        const profile = await gamification.getUserProgress(userId);
        
        res.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('Error getting gamification profile:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

/**
 * POST /api/adaptive-learning/gamification/award-xp
 * Award XP to user
 */
router.post('/gamification/award-xp', async (req, res) => {
    try {
        const { userId, baseXP, action } = req.body;
        
        const result = gamification.awardXP(userId, baseXP, action);
        
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Error awarding XP:', error);
        res.status(500).json({ error: 'Failed to award XP' });
    }
});

/**
 * GET /api/adaptive-learning/gamification/leaderboard
 * Get leaderboard
 */
router.get('/gamification/leaderboard', async (req, res) => {
    try {
        const { timeframe = 'weekly', limit = 50 } = req.query;
        
        const leaderboard = await gamification.getLeaderboard(timeframe, parseInt(limit));
        
        res.json({
            success: true,
            ...leaderboard
        });
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
});

/**
 * POST /api/adaptive-learning/gamification/update-streak
 * Update user streak
 */
router.post('/gamification/update-streak', async (req, res) => {
    try {
        const { userId } = req.body;
        
        const streakData = await gamification.updateStreak(userId);
        
        // Check for streak achievements
        const userStats = gamification.getUserStats(userId);
        const achievementResult = await gamification.checkAchievements(userId, userStats);
        
        res.json({
            success: true,
            streak: streakData,
            newAchievements: achievementResult.newAchievements
        });
    } catch (error) {
        console.error('Error updating streak:', error);
        res.status(500).json({ error: 'Failed to update streak' });
    }
});

/**
 * POST /api/adaptive-learning/gamification/daily-goals/update
 * Update daily goals progress
 */
router.post('/gamification/daily-goals/update', async (req, res) => {
    try {
        const { userId, action } = req.body;
        
        const result = await gamification.updateDailyGoals(userId, action);
        
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Error updating daily goals:', error);
        res.status(500).json({ error: 'Failed to update daily goals' });
    }
});

// ===== LEVEL TRACKING APIs =====

/**
 * GET /api/adaptive-learning/level/current
 * Get user's current level and profile
 */
router.get('/level/current', async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }
        
        const profile = await levelTracker.getUserProfile(userId);
        
        res.json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('Error getting level:', error);
        res.status(500).json({ error: 'Failed to get level' });
    }
});

/**
 * POST /api/adaptive-learning/level/reassess
 * Manually trigger level reassessment
 */
router.post('/level/reassess', async (req, res) => {
    try {
        const { userId } = req.body;
        
        const result = await levelTracker.reassessUserLevel(userId);
        
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Error reassessing level:', error);
        res.status(500).json({ error: 'Failed to reassess level' });
    }
});

// ===== HEALTH CHECK =====

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Adaptive Learning API is running',
        systems: {
            placementTest: 'operational',
            levelTracker: 'operational',
            videoRanker: 'operational',
            guidedLearning: 'operational',
            quizGenerator: 'operational',
            feedAlgorithm: 'operational',
            gamification: 'operational'
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;

