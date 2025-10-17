// 💳 SUBSCRIPTION SERVICE - Payments, Trials, Paywalls, A/B Testing
// Comprehensive monetization system for conversion optimization

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SubscriptionService {
    constructor() {
        this.FREE_TIER_LIMITS = {
            videosPerDay: 5,
            gamesPerDay: 5,
            aiMessagesPerDay: 5
        };

        this.TRIAL_DURATION_DAYS = 7;
    }

    /**
     * Initialize subscription plans in database
     */
    async initializePlans() {
        try {
            const plans = [
                {
                    name: 'free',
                    displayName: 'Free',
                    description: 'Perfect for getting started with Spanish learning',
                    priceMonthly: 0,
                    priceYearly: 0,
                    videosPerDay: 5,
                    gamesPerDay: 5,
                    aiMessagesPerDay: 5,
                    offlineDownloads: false,
                    advancedAnalytics: false,
                    noAds: false,
                    prioritySupport: false,
                    sortOrder: 1
                },
                {
                    name: 'premium',
                    displayName: 'Premium',
                    description: 'Unlimited learning with advanced features',
                    priceMonthly: 999, // $9.99
                    priceYearly: 9900, // $99/year (17% discount)
                    videosPerDay: null, // unlimited
                    gamesPerDay: null,
                    aiMessagesPerDay: null,
                    offlineDownloads: true,
                    advancedAnalytics: true,
                    noAds: true,
                    prioritySupport: true,
                    sortOrder: 2
                },
                {
                    name: 'family',
                    displayName: 'Family',
                    description: 'Premium features for up to 5 family members',
                    priceMonthly: 1499, // $14.99
                    priceYearly: 14900, // $149/year
                    videosPerDay: null,
                    gamesPerDay: null,
                    aiMessagesPerDay: null,
                    offlineDownloads: true,
                    advancedAnalytics: true,
                    noAds: true,
                    prioritySupport: true,
                    sortOrder: 3
                }
            ];

            for (const plan of plans) {
                await prisma.subscriptionPlan.upsert({
                    where: { name: plan.name },
                    update: plan,
                    create: plan
                });
            }

            console.log('✅ Subscription plans initialized');
            return plans;

        } catch (error) {
            console.error('Error initializing plans:', error);
            throw error;
        }
    }

    /**
     * Get all subscription plans
     */
    async getPlans() {
        return await prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
    }

    /**
     * Get user's current subscription
     */
    async getUserSubscription(userId) {
        try {
            let subscription = await prisma.userSubscription.findFirst({
                where: {
                    userId,
                    status: { in: ['trial', 'active'] }
                },
                include: {
                    plan: true
                },
                orderBy: { createdAt: 'desc' }
            });

            // If no subscription, create free tier
            if (!subscription) {
                const freePlan = await prisma.subscriptionPlan.findUnique({
                    where: { name: 'free' }
                });

                if (freePlan) {
                    subscription = await prisma.userSubscription.create({
                        data: {
                            userId,
                            planId: freePlan.id,
                            status: 'active',
                            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
                        },
                        include: {
                            plan: true
                        }
                    });
                }
            }

            // Reset daily usage if needed
            subscription = await this.resetDailyUsageIfNeeded(subscription);

            return subscription;

        } catch (error) {
            console.error('Error getting user subscription:', error);
            throw error;
        }
    }

    /**
     * Start free trial
     */
    async startTrial(userId, planName = 'premium') {
        try {
            // Check if trial already used
            const existingTrial = await prisma.userSubscription.findFirst({
                where: {
                    userId,
                    isTrialUsed: true
                }
            });

            if (existingTrial) {
                return {
                    success: false,
                    error: 'Trial already used'
                };
            }

            const plan = await prisma.subscriptionPlan.findUnique({
                where: { name: planName }
            });

            if (!plan) {
                throw new Error('Plan not found');
            }

            const trialStart = new Date();
            const trialEnd = new Date(trialStart.getTime() + this.TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

            const subscription = await prisma.userSubscription.create({
                data: {
                    userId,
                    planId: plan.id,
                    status: 'trial',
                    isTrialUsed: true,
                    trialStartDate: trialStart,
                    trialEndDate: trialEnd,
                    trialDaysLeft: this.TRIAL_DURATION_DAYS,
                    currentPeriodEnd: trialEnd
                },
                include: {
                    plan: true
                }
            });

            // Send welcome email
            await this.sendTrialWelcomeEmail(userId, subscription);

            return {
                success: true,
                subscription
            };

        } catch (error) {
            console.error('Error starting trial:', error);
            throw error;
        }
    }

    /**
     * Check usage limits and enforce paywall
     */
    async checkUsageLimit(userId, limitType) {
        try {
            const subscription = await this.getUserSubscription(userId);

            if (!subscription) {
                return { allowed: false, reason: 'No subscription found' };
            }

            const plan = subscription.plan;

            // Premium plans have unlimited access
            if (plan.name !== 'free') {
                return { allowed: true, unlimited: true };
            }

            // Check specific limit
            let limit, currentUsage;

            switch (limitType) {
                case 'video':
                    limit = plan.videosPerDay || this.FREE_TIER_LIMITS.videosPerDay;
                    currentUsage = subscription.videosWatchedToday;
                    break;
                case 'game':
                    limit = plan.gamesPerDay || this.FREE_TIER_LIMITS.gamesPerDay;
                    currentUsage = subscription.gamesPlayedToday;
                    break;
                case 'ai_message':
                    limit = plan.aiMessagesPerDay || this.FREE_TIER_LIMITS.aiMessagesPerDay;
                    currentUsage = subscription.aiMessagesUsedToday;
                    break;
                default:
                    return { allowed: true };
            }

            const allowed = currentUsage < limit;
            const remaining = Math.max(0, limit - currentUsage);

            return {
                allowed,
                limit,
                currentUsage,
                remaining,
                showPaywall: !allowed,
                trialAvailable: !subscription.isTrialUsed
            };

        } catch (error) {
            console.error('Error checking usage limit:', error);
            return { allowed: false, error: error.message };
        }
    }

    /**
     * Track usage and increment counter
     */
    async trackUsage(userId, usageType) {
        try {
            const subscription = await this.getUserSubscription(userId);

            if (!subscription) {
                return;
            }

            // Reset daily usage if needed
            await this.resetDailyUsageIfNeeded(subscription);

            // Increment appropriate counter
            const updateData = {};

            switch (usageType) {
                case 'video':
                    updateData.videosWatchedToday = subscription.videosWatchedToday + 1;
                    break;
                case 'game':
                    updateData.gamesPlayedToday = subscription.gamesPlayedToday + 1;
                    break;
                case 'ai_message':
                    updateData.aiMessagesUsedToday = subscription.aiMessagesUsedToday + 1;
                    break;
            }

            await prisma.userSubscription.update({
                where: { id: subscription.id },
                data: updateData
            });

            // Check if user hit limit (trigger upgrade prompt)
            const updated = await this.getUserSubscription(userId);
            const plan = updated.plan;

            if (plan.name === 'free') {
                const limits = {
                    video: plan.videosPerDay || this.FREE_TIER_LIMITS.videosPerDay,
                    game: plan.gamesPerDay || this.FREE_TIER_LIMITS.gamesPerDay,
                    ai_message: plan.aiMessagesPerDay || this.FREE_TIER_LIMITS.aiMessagesPerDay
                };

                const usage = {
                    video: updated.videosWatchedToday,
                    game: updated.gamesPlayedToday,
                    ai_message: updated.aiMessagesUsedToday
                };

                // Show upgrade prompt when user hits 80% of limit
                if (usage[usageType] === Math.floor(limits[usageType] * 0.8)) {
                    return { showUpgradeHint: true, remaining: limits[usageType] - usage[usageType] };
                }

                // Show paywall when limit reached
                if (usage[usageType] >= limits[usageType]) {
                    return { showPaywall: true };
                }
            }

            return { success: true };

        } catch (error) {
            console.error('Error tracking usage:', error);
        }
    }

    /**
     * Reset daily usage counters if new day
     */
    async resetDailyUsageIfNeeded(subscription) {
        try {
            const now = new Date();
            const lastReset = new Date(subscription.lastUsageReset);

            // Check if it's a new day
            if (this.isSameDay(now, lastReset)) {
                return subscription;
            }

            // Reset counters
            const updated = await prisma.userSubscription.update({
                where: { id: subscription.id },
                data: {
                    videosWatchedToday: 0,
                    gamesPlayedToday: 0,
                    aiMessagesUsedToday: 0,
                    lastUsageReset: now
                },
                include: {
                    plan: true
                }
            });

            return updated;

        } catch (error) {
            console.error('Error resetting daily usage:', error);
            return subscription;
        }
    }

    /**
     * Get A/B test variant for user
     */
    async getABTestVariant(userId, testName) {
        try {
            // Check if user already assigned
            let assignment = await prisma.userABTest.findFirst({
                where: {
                    userId,
                    test: { name: testName }
                },
                include: { test: true }
            });

            if (assignment) {
                return assignment.variant;
            }

            // Get active test
            const test = await prisma.aBTest.findFirst({
                where: {
                    name: testName,
                    isActive: true
                }
            });

            if (!test) {
                return 'control'; // Default
            }

            // Assign random variant
            const variants = JSON.parse(test.variants);
            const variant = variants[Math.floor(Math.random() * variants.length)];

            // Save assignment
            await prisma.userABTest.create({
                data: {
                    userId,
                    testId: test.id,
                    variant
                }
            });

            return variant;

        } catch (error) {
            console.error('Error getting A/B test variant:', error);
            return 'control';
        }
    }

    /**
     * Track A/B test conversion
     */
    async trackABTestConversion(userId, testName, conversionValue = 0) {
        try {
            const assignment = await prisma.userABTest.findFirst({
                where: {
                    userId,
                    test: { name: testName }
                }
            });

            if (!assignment) {
                return;
            }

            await prisma.userABTest.update({
                where: { id: assignment.id },
                data: {
                    converted: true,
                    convertedAt: new Date(),
                    conversionValue
                }
            });

        } catch (error) {
            console.error('Error tracking A/B test conversion:', error);
        }
    }

    /**
     * Get paywall configuration based on A/B tests
     */
    async getPaywallConfig(userId) {
        try {
            // Get A/B test variants
            const timing = await this.getABTestVariant(userId, 'paywall_timing');
            const messaging = await this.getABTestVariant(userId, 'paywall_messaging');
            const design = await this.getABTestVariant(userId, 'paywall_design');

            // Paywall timing variants
            const timingConfigs = {
                after_3_videos: { showAfter: 3, type: 'video' },
                after_5_videos: { showAfter: 5, type: 'video' },
                after_10_videos: { showAfter: 10, type: 'video' }
            };

            // Messaging variants
            const messagingConfigs = {
                unlock_unlimited: {
                    headline: 'Unlock Unlimited Learning',
                    subheadline: 'Continue your Spanish journey with unlimited access'
                },
                upgrade_premium: {
                    headline: 'Upgrade to Premium',
                    subheadline: 'Get unlimited videos, games, and AI conversations'
                },
                limited_time: {
                    headline: '🔥 Limited Time: 7-Day Free Trial',
                    subheadline: 'Try Premium features for free, no credit card required'
                }
            };

            // Design variants
            const designConfigs = {
                modal: { type: 'modal', style: 'centered' },
                fullpage: { type: 'fullpage', style: 'gradient' },
                banner: { type: 'banner', style: 'bottom' }
            };

            return {
                timing: timingConfigs[timing] || timingConfigs.after_5_videos,
                messaging: messagingConfigs[messaging] || messagingConfigs.unlock_unlimited,
                design: designConfigs[design] || designConfigs.modal
            };

        } catch (error) {
            console.error('Error getting paywall config:', error);
            return this.getDefaultPaywallConfig();
        }
    }

    /**
     * Default paywall configuration
     */
    getDefaultPaywallConfig() {
        return {
            timing: { showAfter: 5, type: 'video' },
            messaging: {
                headline: 'Unlock Unlimited Learning',
                subheadline: 'Continue your Spanish journey with unlimited access'
            },
            design: { type: 'modal', style: 'centered' }
        };
    }

    /**
     * Calculate trial days remaining
     */
    async updateTrialDaysRemaining(userId) {
        try {
            const subscription = await prisma.userSubscription.findFirst({
                where: {
                    userId,
                    status: 'trial'
                }
            });

            if (!subscription || !subscription.trialEndDate) {
                return;
            }

            const now = new Date();
            const endDate = new Date(subscription.trialEndDate);
            const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

            await prisma.userSubscription.update({
                where: { id: subscription.id },
                data: { trialDaysLeft: Math.max(0, daysLeft) }
            });

            // Send reminder emails
            if (daysLeft === 2) {
                await this.sendTrialReminderEmail(userId, subscription, 2);
            } else if (daysLeft === 0) {
                await this.sendTrialEndingEmail(userId, subscription);
            }

            return daysLeft;

        } catch (error) {
            console.error('Error updating trial days:', error);
        }
    }

    /**
     * Create Stripe checkout session (placeholder - integrate with actual Stripe)
     */
    async createCheckoutSession(userId, planName, billingCycle = 'monthly') {
        try {
            const plan = await prisma.subscriptionPlan.findUnique({
                where: { name: planName }
            });

            if (!plan) {
                throw new Error('Plan not found');
            }

            const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

            // TODO: Integrate with actual Stripe API
            // const session = await stripe.checkout.sessions.create({...});

            // For now, return mock session
            return {
                id: 'mock_session_' + Date.now(),
                url: '/checkout/mock',
                amount,
                planName,
                billingCycle
            };

        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    }

    /**
     * Handle successful payment (webhook handler)
     */
    async handlePaymentSuccess(userId, planName, stripeSessionId, amount) {
        try {
            const plan = await prisma.subscriptionPlan.findUnique({
                where: { name: planName }
            });

            // Cancel existing trial
            await prisma.userSubscription.updateMany({
                where: {
                    userId,
                    status: 'trial'
                },
                data: {
                    status: 'cancelled',
                    canceledAt: new Date()
                }
            });

            // Create new active subscription
            const subscription = await prisma.userSubscription.create({
                data: {
                    userId,
                    planId: plan.id,
                    status: 'active',
                    stripeSubscriptionId: stripeSessionId,
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                },
                include: {
                    plan: true
                }
            });

            // Record payment
            await prisma.payment.create({
                data: {
                    userId,
                    amount,
                    status: 'succeeded',
                    stripePaymentId: stripeSessionId,
                    subscriptionId: subscription.id,
                    planName: plan.name
                }
            });

            // Track A/B test conversion
            await this.trackABTestConversion(userId, 'paywall_timing', amount);
            await this.trackABTestConversion(userId, 'paywall_messaging', amount);

            console.log(`✅ Payment successful for user ${userId}, plan: ${planName}`);

            return { success: true, subscription };

        } catch (error) {
            console.error('Error handling payment success:', error);
            throw error;
        }
    }

    // Email placeholders (to be integrated with email service)
    async sendTrialWelcomeEmail(userId, subscription) {
        console.log(`📧 Trial welcome email sent to user ${userId}`);
        // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    }

    async sendTrialReminderEmail(userId, subscription, daysLeft) {
        console.log(`📧 Trial reminder email sent to user ${userId}: ${daysLeft} days left`);
    }

    async sendTrialEndingEmail(userId, subscription) {
        console.log(`📧 Trial ending email sent to user ${userId}`);
    }

    // Helper functions
    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }
}

module.exports = SubscriptionService;

