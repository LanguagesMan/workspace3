/**
 * 🎮 AGENT 6 - AI TUTOR & ENGAGEMENT FEATURES API
 * 
 * Complete API endpoints for:
 * - Quest system (daily/weekly quests)
 * - Challenge system (friend challenges, leaderboards)
 * - Pronunciation scoring
 * - Scenario practice
 * - Social sharing
 * - Study together sessions
 * - Streak insurance
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import feature systems
const questSystem = require('../lib/quest-system');
const challengeSystem = require('../lib/challenge-system');
const pronunciationScorer = require('../lib/pronunciation-scorer');
const scenarioPracticeSystem = require('../lib/scenario-practice-system');
const socialSharingSystem = require('../lib/social-sharing-system');
const studyTogetherSystem = require('../lib/study-together-system');
const streakInsuranceSystem = require('../lib/streak-insurance-system');

// Configure multer for audio uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ========================================
// QUEST SYSTEM API
// ========================================

// Get user's quests
router.get('/quests/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const quests = questSystem.getUserQuests(userId);
        
        res.json({
            success: true,
            data: quests
        });
    } catch (error) {
        console.error('Error fetching quests:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Track quest action
router.post('/quests/track', (req, res) => {
    try {
        const { userId, action, metadata } = req.body;
        const result = questSystem.trackAction(userId, action, metadata);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error tracking quest action:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get quest stats
router.get('/quests/:userId/stats', (req, res) => {
    try {
        const { userId } = req.params;
        const stats = questSystem.getQuestStats(userId);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching quest stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get quest history
router.get('/quests/:userId/history', (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const history = questSystem.getQuestHistory(userId, limit);
        
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error fetching quest history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// CHALLENGE SYSTEM API
// ========================================

// Create friend challenge
router.post('/challenges/create', (req, res) => {
    try {
        const { challengerId, challengedId, challengeType, duration } = req.body;
        const challenge = challengeSystem.createFriendChallenge(
            challengerId,
            challengedId,
            challengeType,
            duration
        );
        
        res.json({
            success: true,
            data: challenge
        });
    } catch (error) {
        console.error('Error creating challenge:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Accept challenge
router.post('/challenges/:challengeId/accept', (req, res) => {
    try {
        const { challengeId } = req.params;
        const { userId } = req.body;
        const result = challengeSystem.acceptChallenge(userId, challengeId);
        
        res.json(result);
    } catch (error) {
        console.error('Error accepting challenge:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Decline challenge
router.post('/challenges/:challengeId/decline', (req, res) => {
    try {
        const { challengeId } = req.params;
        const { userId } = req.body;
        const result = challengeSystem.declineChallenge(userId, challengeId);
        
        res.json(result);
    } catch (error) {
        console.error('Error declining challenge:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get challenge details
router.get('/challenges/:challengeId', (req, res) => {
    try {
        const { challengeId } = req.params;
        const { userId } = req.query;
        const challenge = challengeSystem.getChallengeDetails(userId, challengeId);
        
        res.json({
            success: true,
            data: challenge
        });
    } catch (error) {
        console.error('Error fetching challenge:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user's challenges
router.get('/challenges/user/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.query; // all, active, pending, completed
        const challenges = challengeSystem.getUserChallenges(userId, status || 'all');
        
        res.json({
            success: true,
            data: challenges
        });
    } catch (error) {
        console.error('Error fetching user challenges:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get leaderboard
router.get('/leaderboard/:type', (req, res) => {
    try {
        const { type } = req.params; // weekly, monthly, all-time
        const limit = parseInt(req.query.limit) || 50;
        const leaderboard = challengeSystem.getLeaderboard(type, limit);
        
        res.json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user's leaderboard position
router.get('/leaderboard/:type/user/:userId', (req, res) => {
    try {
        const { type, userId } = req.params;
        const position = challengeSystem.getUserLeaderboardPosition(userId, type);
        
        res.json({
            success: true,
            data: position
        });
    } catch (error) {
        console.error('Error fetching leaderboard position:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user league
router.get('/league/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const { xp } = req.query;
        const league = challengeSystem.getUserLeague(parseInt(xp) || 0);
        
        res.json({
            success: true,
            data: league
        });
    } catch (error) {
        console.error('Error fetching league:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// PRONUNCIATION SCORING API
// ========================================

// Score pronunciation
router.post('/pronunciation/score', upload.single('audio'), async (req, res) => {
    try {
        const { userId, targetText } = req.body;
        const audioBuffer = req.file.buffer;
        
        const result = await pronunciationScorer.scorePronunciation(
            audioBuffer,
            targetText,
            userId
        );
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error scoring pronunciation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user's pronunciation progress
router.get('/pronunciation/:userId/progress', (req, res) => {
    try {
        const { userId } = req.params;
        const progress = pronunciationScorer.getUserProgress(userId);
        
        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('Error fetching pronunciation progress:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// SCENARIO PRACTICE API
// ========================================

// Get all scenarios
router.get('/scenarios', (req, res) => {
    try {
        const scenarios = scenarioPracticeSystem.getAllScenarios();
        
        res.json({
            success: true,
            data: scenarios
        });
    } catch (error) {
        console.error('Error fetching scenarios:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get suggested scenarios for user level
router.get('/scenarios/suggested/:userLevel', (req, res) => {
    try {
        const { userLevel } = req.params;
        const scenarios = scenarioPracticeSystem.getSuggestedScenarios(userLevel);
        
        res.json({
            success: true,
            data: scenarios
        });
    } catch (error) {
        console.error('Error fetching suggested scenarios:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start scenario practice
router.post('/scenarios/start', async (req, res) => {
    try {
        const { userId, scenarioId, userLevel } = req.body;
        const result = await scenarioPracticeSystem.startScenario(userId, scenarioId, userLevel);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error starting scenario:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Process scenario response
router.post('/scenarios/response', async (req, res) => {
    try {
        const { userId, sessionId, userMessage } = req.body;
        const result = await scenarioPracticeSystem.processScenarioResponse(
            userId,
            sessionId,
            userMessage
        );
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error processing scenario response:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get scenario history
router.get('/scenarios/:userId/history', (req, res) => {
    try {
        const { userId } = req.params;
        const history = scenarioPracticeSystem.getUserScenarioHistory(userId);
        
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error fetching scenario history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// SOCIAL SHARING API
// ========================================

// Generate share content
router.post('/share/generate', (req, res) => {
    try {
        const { userId, shareType, data } = req.body;
        const shareCard = socialSharingSystem.generateShareContent(userId, shareType, data);
        
        res.json({
            success: true,
            data: shareCard
        });
    } catch (error) {
        console.error('Error generating share content:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get social share links
router.get('/share/:shareId/links', (req, res) => {
    try {
        const { shareId } = req.params;
        const { platform } = req.query;
        
        // Get share card
        const shareCard = socialSharingSystem.sharedContent.get(shareId);
        if (!shareCard) {
            return res.status(404).json({ success: false, error: 'Share not found' });
        }
        
        const links = socialSharingSystem.getSocialShareLinks(shareCard, platform);
        
        res.json({
            success: true,
            data: links
        });
    } catch (error) {
        console.error('Error getting share links:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Track share event
router.post('/share/:shareId/track', (req, res) => {
    try {
        const { shareId } = req.params;
        const { platform } = req.body;
        const result = socialSharingSystem.trackShare(shareId, platform);
        
        res.json(result);
    } catch (error) {
        console.error('Error tracking share:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user's shares
router.get('/share/user/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        const shares = socialSharingSystem.getUserShares(userId, limit);
        
        res.json({
            success: true,
            data: shares
        });
    } catch (error) {
        console.error('Error fetching user shares:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user's share stats
router.get('/share/user/:userId/stats', (req, res) => {
    try {
        const { userId } = req.params;
        const stats = socialSharingSystem.getUserShareStats(userId);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching share stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get trending shares
router.get('/share/trending', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const shares = socialSharingSystem.getTrendingShares(limit);
        
        res.json({
            success: true,
            data: shares
        });
    } catch (error) {
        console.error('Error fetching trending shares:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// STUDY TOGETHER API
// ========================================

// Create study room
router.post('/study-rooms/create', (req, res) => {
    try {
        const { hostUserId, roomConfig } = req.body;
        const result = studyTogetherSystem.createStudyRoom(hostUserId, roomConfig);
        
        res.json(result);
    } catch (error) {
        console.error('Error creating study room:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Join study room
router.post('/study-rooms/:roomId/join', (req, res) => {
    try {
        const { roomId } = req.params;
        const { userId, password } = req.body;
        const result = studyTogetherSystem.joinStudyRoom(userId, roomId, password);
        
        res.json(result);
    } catch (error) {
        console.error('Error joining study room:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Leave study room
router.post('/study-rooms/:roomId/leave', (req, res) => {
    try {
        const { roomId } = req.params;
        const { userId } = req.body;
        const result = studyTogetherSystem.leaveStudyRoom(userId, roomId);
        
        res.json(result);
    } catch (error) {
        console.error('Error leaving study room:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get study room info
router.get('/study-rooms/:roomId', (req, res) => {
    try {
        const { roomId } = req.params;
        const room = studyTogetherSystem.getRoomInfo(roomId);
        
        if (!room) {
            return res.status(404).json({ success: false, error: 'Room not found' });
        }
        
        res.json({
            success: true,
            data: room
        });
    } catch (error) {
        console.error('Error fetching study room:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get public rooms
router.get('/study-rooms/public/list', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const rooms = studyTogetherSystem.getPublicRooms(limit);
        
        res.json({
            success: true,
            data: rooms
        });
    } catch (error) {
        console.error('Error fetching public rooms:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Track room activity
router.post('/study-rooms/:roomId/activity', (req, res) => {
    try {
        const { roomId } = req.params;
        const { userId, activityType, data } = req.body;
        const result = studyTogetherSystem.trackActivity(userId, roomId, activityType, data);
        
        res.json(result);
    } catch (error) {
        console.error('Error tracking room activity:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Send chat message
router.post('/study-rooms/:roomId/chat', (req, res) => {
    try {
        const { roomId } = req.params;
        const { userId, message } = req.body;
        const result = studyTogetherSystem.sendChatMessage(userId, roomId, message);
        
        res.json(result);
    } catch (error) {
        console.error('Error sending chat message:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get chat history
router.get('/study-rooms/:roomId/chat', (req, res) => {
    try {
        const { roomId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const result = studyTogetherSystem.getChatHistory(roomId, limit);
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// STREAK INSURANCE API
// ========================================

// Get streak stats
router.get('/streak/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const stats = streakInsuranceSystem.getStreakStats(userId);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching streak stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update streak (call on user activity)
router.post('/streak/:userId/update', (req, res) => {
    try {
        const { userId } = req.params;
        const result = streakInsuranceSystem.updateStreak(userId);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error updating streak:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Buy streak freeze
router.post('/streak/:userId/buy-freeze', (req, res) => {
    try {
        const { userId } = req.params;
        const { userGems } = req.body;
        const result = streakInsuranceSystem.buyStreakFreeze(userId, userGems);
        
        res.json(result);
    } catch (error) {
        console.error('Error buying streak freeze:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Buy streak insurance
router.post('/streak/:userId/buy-insurance', (req, res) => {
    try {
        const { userId } = req.params;
        const { userGems } = req.body;
        const result = streakInsuranceSystem.buyStreakInsurance(userId, userGems);
        
        res.json(result);
    } catch (error) {
        console.error('Error buying streak insurance:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Repair streak
router.post('/streak/:userId/repair', (req, res) => {
    try {
        const { userId } = req.params;
        const { userGems } = req.body;
        const result = streakInsuranceSystem.repairStreak(userId, userGems);
        
        res.json(result);
    } catch (error) {
        console.error('Error repairing streak:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get streak leaderboard
router.get('/streak/leaderboard/top', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const leaderboard = streakInsuranceSystem.getStreakLeaderboard(limit);
        
        res.json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        console.error('Error fetching streak leaderboard:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get pricing info
router.get('/streak/pricing', (req, res) => {
    try {
        const pricing = streakInsuranceSystem.getPricing();
        
        res.json({
            success: true,
            data: pricing
        });
    } catch (error) {
        console.error('Error fetching pricing:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;


