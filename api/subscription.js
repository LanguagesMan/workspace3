// 💳 SUBSCRIPTION API - Payments, Trials, Paywalls
// API endpoints for monetization and conversion optimization

const express = require('express');
const router = express.Router();
const SubscriptionService = require('../lib/services/subscription-service');

const subscriptionService = new SubscriptionService();

/**
 * Get all subscription plans
 * GET /api/subscription/plans
 */
router.get('/plans', async (req, res) => {
    try {
        const plans = await subscriptionService.getPlans();

        res.json({
            success: true,
            plans
        });

    } catch (error) {
        console.error('Error getting plans:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get user's current subscription
 * GET /api/subscription/:userId
 */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const subscription = await subscriptionService.getUserSubscription(userId);

        res.json({
            success: true,
            subscription
        });

    } catch (error) {
        console.error('Error getting subscription:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Start free trial
 * POST /api/subscription/trial/start
 */
router.post('/trial/start', async (req, res) => {
    try {
        const { userId, planName } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const result = await subscriptionService.startTrial(userId, planName || 'premium');

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);

    } catch (error) {
        console.error('Error starting trial:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Check usage limit
 * POST /api/subscription/check-limit
 */
router.post('/check-limit', async (req, res) => {
    try {
        const { userId, limitType } = req.body;

        if (!userId || !limitType) {
            return res.status(400).json({ error: 'userId and limitType are required' });
        }

        const result = await subscriptionService.checkUsageLimit(userId, limitType);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Error checking limit:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Track usage
 * POST /api/subscription/track-usage
 */
router.post('/track-usage', async (req, res) => {
    try {
        const { userId, usageType } = req.body;

        if (!userId || !usageType) {
            return res.status(400).json({ error: 'userId and usageType are required' });
        }

        const result = await subscriptionService.trackUsage(userId, usageType);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Error tracking usage:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get paywall configuration (A/B tested)
 * GET /api/subscription/paywall/:userId
 */
router.get('/paywall/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const config = await subscriptionService.getPaywallConfig(userId);

        res.json({
            success: true,
            config
        });

    } catch (error) {
        console.error('Error getting paywall config:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create checkout session
 * POST /api/subscription/checkout/create
 */
router.post('/checkout/create', async (req, res) => {
    try {
        const { userId, planName, billingCycle } = req.body;

        if (!userId || !planName) {
            return res.status(400).json({ error: 'userId and planName are required' });
        }

        const session = await subscriptionService.createCheckoutSession(
            userId,
            planName,
            billingCycle || 'monthly'
        );

        res.json({
            success: true,
            session
        });

    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Handle payment success (webhook)
 * POST /api/subscription/webhook/payment-success
 */
router.post('/webhook/payment-success', async (req, res) => {
    try {
        const { userId, planName, stripeSessionId, amount } = req.body;

        if (!userId || !planName || !stripeSessionId || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await subscriptionService.handlePaymentSuccess(
            userId,
            planName,
            stripeSessionId,
            amount
        );

        res.json(result);

    } catch (error) {
        console.error('Error handling payment success:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Update trial days remaining (cron job endpoint)
 * POST /api/subscription/trial/update-days
 */
router.post('/trial/update-days', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const daysLeft = await subscriptionService.updateTrialDaysRemaining(userId);

        res.json({
            success: true,
            daysLeft
        });

    } catch (error) {
        console.error('Error updating trial days:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get A/B test variant
 * GET /api/subscription/ab-test/:userId/:testName
 */
router.get('/ab-test/:userId/:testName', async (req, res) => {
    try {
        const { userId, testName } = req.params;
        const variant = await subscriptionService.getABTestVariant(userId, testName);

        res.json({
            success: true,
            variant
        });

    } catch (error) {
        console.error('Error getting A/B test variant:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Track A/B test conversion
 * POST /api/subscription/ab-test/convert
 */
router.post('/ab-test/convert', async (req, res) => {
    try {
        const { userId, testName, conversionValue } = req.body;

        if (!userId || !testName) {
            return res.status(400).json({ error: 'userId and testName are required' });
        }

        await subscriptionService.trackABTestConversion(userId, testName, conversionValue);

        res.json({ success: true });

    } catch (error) {
        console.error('Error tracking conversion:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Initialize subscription plans (admin endpoint)
 * POST /api/subscription/admin/init-plans
 */
router.post('/admin/init-plans', async (req, res) => {
    try {
        const plans = await subscriptionService.initializePlans();

        res.json({
            success: true,
            message: 'Subscription plans initialized',
            plans
        });

    } catch (error) {
        console.error('Error initializing plans:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

