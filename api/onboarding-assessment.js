/**
 * 🎯 ONBOARDING ASSESSMENT API
 * 
 * API endpoints for the quick level assessment system
 */

const express = require('express');
const router = express.Router();
const OnboardingAssessment = require('../lib/onboarding-assessment');
const fs = require('fs');
const path = require('path');

const assessments = new Map(); // In-memory storage for assessment sessions

/**
 * Start new assessment
 * POST /api/onboarding-assessment/start
 */
router.post('/start', async (req, res) => {
    try {
        const { userId, userInfo = {} } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const assessment = new OnboardingAssessment();
        const session = assessment.startAssessment(userInfo);
        
        // Store session
        assessments.set(userId, { assessment, session });

        res.json({
            success: true,
            sessionId: session.sessionId,
            progress: assessment.getProgress(session),
            nextVideo: session.nextVideo,
            instructions: 'Watch the video and answer the questions. We\'ll adjust difficulty based on your performance.'
        });

    } catch (error) {
        console.error('❌ Error starting assessment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Submit assessment response
 * POST /api/onboarding-assessment/respond
 */
router.post('/respond', async (req, res) => {
    try {
        const {
            userId,
            videoId,
            level,
            completionRate,
            watchTime,
            videoDuration,
            wordClicks = 0,
            totalWords = 100,
            skipped = false,
            rewatched = false
        } = req.body;

        if (!userId || !videoId) {
            return res.status(400).json({
                success: false,
                error: 'userId and videoId are required'
            });
        }

        // Get session
        const sessionData = assessments.get(userId);
        if (!sessionData) {
            return res.status(404).json({
                success: false,
                error: 'Assessment session not found. Please start a new assessment.'
            });
        }

        const { assessment, session } = sessionData;

        // Process response
        const updatedSession = assessment.processResponse(session, {
            videoId,
            level,
            completionRate,
            watchTime,
            videoDuration,
            wordClicks,
            totalWords,
            skipped,
            rewatched
        });

        // Update stored session
        assessments.set(userId, { assessment, session: updatedSession });

        // Check if assessment is complete
        if (updatedSession.completed) {
            // Save final results
            await saveFinalResults(userId, updatedSession);

            res.json({
                success: true,
                completed: true,
                results: {
                    estimatedLevel: updatedSession.estimatedLevel,
                    confidence: updatedSession.confidence,
                    recommendation: updatedSession.recommendation,
                    nextSteps: updatedSession.nextSteps,
                    levelScores: updatedSession.levelScores
                }
            });
        } else {
            // Continue assessment
            res.json({
                success: true,
                completed: false,
                progress: assessment.getProgress(updatedSession),
                nextVideo: updatedSession.nextVideo
            });
        }

    } catch (error) {
        console.error('❌ Error processing response:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get assessment progress
 * GET /api/onboarding-assessment/progress/:userId
 */
router.get('/progress/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const sessionData = assessments.get(userId);
        if (!sessionData) {
            return res.status(404).json({
                success: false,
                error: 'No active assessment found'
            });
        }

        const { assessment, session } = sessionData;

        res.json({
            success: true,
            progress: assessment.getProgress(session),
            results: session.results
        });

    } catch (error) {
        console.error('❌ Error fetching progress:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Skip assessment
 * POST /api/onboarding-assessment/skip
 */
router.post('/skip', async (req, res) => {
    try {
        const { userId, preferredLevel = 'A2' } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const assessment = new OnboardingAssessment();
        const result = assessment.skipAssessment(preferredLevel);

        // Save results
        await saveFinalResults(userId, result);

        res.json({
            success: true,
            skipped: true,
            results: result
        });

    } catch (error) {
        console.error('❌ Error skipping assessment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get assessment results
 * GET /api/onboarding-assessment/results/:userId
 */
router.get('/results/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const resultsPath = path.join(__dirname, '../data/assessment-results', `${userId}.json`);
        
        if (!fs.existsSync(resultsPath)) {
            return res.status(404).json({
                success: false,
                error: 'No assessment results found'
            });
        }

        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

        res.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('❌ Error fetching results:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper functions

async function saveFinalResults(userId, results) {
    try {
        const resultsDir = path.join(__dirname, '../data/assessment-results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        const resultsPath = path.join(resultsDir, `${userId}.json`);
        fs.writeFileSync(resultsPath, JSON.stringify({
            userId,
            ...results,
            completedAt: new Date().toISOString()
        }, null, 2));

        // Clean up session
        assessments.delete(userId);

    } catch (error) {
        console.error('Failed to save assessment results:', error);
    }
}

module.exports = router;

