// 🔥 RETENTION API - Streaks, Milestones, Notifications, Social Sharing
// API endpoints for retention features

const express = require('express');
const router = express.Router();
const RetentionService = require('../lib/services/retention-service');

const retentionService = new RetentionService();

/**
 * Update user streak (called when user completes any activity)
 * POST /api/retention/streak/update
 */
router.post('/streak/update', async (req, res) => {
    try {
        const { userId, activityType } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const result = await retentionService.updateStreak(userId, activityType);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Error updating streak:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Check if streak warning needed
 * GET /api/retention/streak/check-warning/:userId
 */
router.get('/streak/check-warning/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await retentionService.checkStreakWarning(userId);

        res.json(result);

    } catch (error) {
        console.error('Error checking streak warning:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get user progress summary
 * GET /api/retention/progress/:userId
 */
router.get('/progress/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const progress = await retentionService.getUserProgress(userId);

        res.json({
            success: true,
            progress
        });

    } catch (error) {
        console.error('Error getting progress:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Track progress for milestone
 * POST /api/retention/progress/track
 */
router.post('/progress/track', async (req, res) => {
    try {
        const { userId, type, increment } = req.body;

        if (!userId || !type) {
            return res.status(400).json({ error: 'userId and type are required' });
        }

        await retentionService.trackProgress(userId, type, increment || 1);

        res.json({ success: true });

    } catch (error) {
        console.error('Error tracking progress:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Generate share card for social media
 * POST /api/retention/share/generate
 */
router.post('/share/generate', async (req, res) => {
    try {
        const { userId, type, data } = req.body;

        if (!userId || !type) {
            return res.status(400).json({ error: 'userId and type are required' });
        }

        const shareCard = await retentionService.generateShareCard(userId, type, data);

        res.json({
            success: true,
            shareCard
        });

    } catch (error) {
        console.error('Error generating share card:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Track share card interaction
 * POST /api/retention/share/track
 */
router.post('/share/track', async (req, res) => {
    try {
        const { shareCardId, platform } = req.body;

        if (!shareCardId || !platform) {
            return res.status(400).json({ error: 'shareCardId and platform are required' });
        }

        await retentionService.trackShare(shareCardId, platform);

        res.json({ success: true });

    } catch (error) {
        console.error('Error tracking share:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Send notification
 * POST /api/retention/notifications/send
 */
router.post('/notifications/send', async (req, res) => {
    try {
        const { userId, notification } = req.body;

        if (!userId || !notification) {
            return res.status(400).json({ error: 'userId and notification are required' });
        }

        await retentionService.sendNotification(userId, notification);

        res.json({ success: true });

    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get notification preferences
 * GET /api/retention/notifications/preferences/:userId
 */
router.get('/notifications/preferences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        let prefs = await prisma.notificationPreference.findUnique({
            where: { userId }
        });

        if (!prefs) {
            prefs = await prisma.notificationPreference.create({
                data: { userId }
            });
        }

        res.json({
            success: true,
            preferences: prefs
        });

    } catch (error) {
        console.error('Error getting notification preferences:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Update notification preferences
 * PUT /api/retention/notifications/preferences/:userId
 */
router.put('/notifications/preferences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const prefs = await prisma.notificationPreference.upsert({
            where: { userId },
            update: updates,
            create: {
                userId,
                ...updates
            }
        });

        res.json({
            success: true,
            preferences: prefs
        });

    } catch (error) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get all achievements and milestones
 * GET /api/retention/milestones
 */
router.get('/milestones', async (req, res) => {
    try {
        const milestones = retentionService.defineMilestones();

        res.json({
            success: true,
            milestones
        });

    } catch (error) {
        console.error('Error getting milestones:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

