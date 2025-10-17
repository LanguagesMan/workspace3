#!/usr/bin/env node

// 🚀 INITIALIZATION SCRIPT FOR RETENTION & MONETIZATION FEATURES
// Sets up milestones, subscription plans, and A/B tests

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initializeMilestones() {
    console.log('📊 Initializing milestones...');

    const milestones = [
        // Videos Watched
        { type: 'videos_watched', threshold: 10, title: 'Video Rookie', description: 'Watched 10 videos', icon: '🎬', xpReward: 50, sortOrder: 1 },
        { type: 'videos_watched', threshold: 50, title: 'Cinema Fan', description: 'Watched 50 videos', icon: '🎥', xpReward: 200, sortOrder: 2 },
        { type: 'videos_watched', threshold: 100, title: 'Binge Master', description: 'Watched 100 videos', icon: '🍿', xpReward: 500, sortOrder: 3 },
        { type: 'videos_watched', threshold: 500, title: 'Video Legend', description: 'Watched 500 videos', icon: '⭐', xpReward: 2000, sortOrder: 4 },

        // Words Learned
        { type: 'words_learned', threshold: 10, title: 'Word Explorer', description: 'Learned 10 words', icon: '📝', xpReward: 50, sortOrder: 5 },
        { type: 'words_learned', threshold: 50, title: 'Vocabulary Builder', description: 'Learned 50 words', icon: '📚', xpReward: 200, sortOrder: 6 },
        { type: 'words_learned', threshold: 100, title: 'Word Collector', description: 'Learned 100 words', icon: '🎯', xpReward: 500, sortOrder: 7 },
        { type: 'words_learned', threshold: 500, title: 'Polyglot', description: 'Learned 500 words', icon: '🌍', xpReward: 2000, sortOrder: 8 },

        // Streak Days
        { type: 'streak_days', threshold: 3, title: '3-Day Streak', description: 'Learned 3 days in a row', icon: '🔥', xpReward: 30, sortOrder: 9 },
        { type: 'streak_days', threshold: 7, title: '1-Week Streak', description: 'Learned 7 days in a row', icon: '🔥🔥', xpReward: 100, sortOrder: 10 },
        { type: 'streak_days', threshold: 30, title: '1-Month Streak', description: 'Learned 30 days in a row', icon: '🔥🔥🔥', xpReward: 500, sortOrder: 11 },
        { type: 'streak_days', threshold: 100, title: '100-Day Streak', description: 'Learned 100 days in a row', icon: '💎', xpReward: 2000, sortOrder: 12 },
        { type: 'streak_days', threshold: 365, title: '1-Year Streak', description: 'Learned every day for a year!', icon: '👑', xpReward: 10000, sortOrder: 13 },

        // Games Completed
        { type: 'games_completed', threshold: 10, title: 'Game Beginner', description: 'Completed 10 games', icon: '🎮', xpReward: 50, sortOrder: 14 },
        { type: 'games_completed', threshold: 50, title: 'Game Enthusiast', description: 'Completed 50 games', icon: '🎯', xpReward: 200, sortOrder: 15 },
        { type: 'games_completed', threshold: 100, title: 'Game Master', description: 'Completed 100 games', icon: '🏆', xpReward: 500, sortOrder: 16 },

        // Special Achievements
        { type: 'first_perfect_game', threshold: 1, title: 'Perfect Score!', description: 'Got 100% on a game', icon: '💯', xpReward: 100, sortOrder: 17 },
        { type: 'morning_learner', threshold: 10, title: 'Early Bird', description: 'Learned before 8 AM, 10 times', icon: '🌅', xpReward: 200, sortOrder: 18 },
        { type: 'night_owl', threshold: 10, title: 'Night Owl', description: 'Learned after 10 PM, 10 times', icon: '🌙', xpReward: 200, sortOrder: 19 },
    ];

    for (const milestone of milestones) {
        try {
            await prisma.milestone.upsert({
                where: {
                    type_threshold: {
                        type: milestone.type,
                        threshold: milestone.threshold
                    }
                },
                update: milestone,
                create: milestone
            });
            console.log(`  ✅ ${milestone.title}`);
        } catch (error) {
            console.error(`  ❌ Error creating ${milestone.title}:`, error.message);
        }
    }

    console.log('✅ Milestones initialized\n');
}

async function initializeSubscriptionPlans() {
    console.log('💳 Initializing subscription plans...');

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
            sortOrder: 1,
            isActive: true
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
            sortOrder: 2,
            isActive: true
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
            sortOrder: 3,
            isActive: true
        }
    ];

    for (const plan of plans) {
        try {
            await prisma.subscriptionPlan.upsert({
                where: { name: plan.name },
                update: plan,
                create: plan
            });
            console.log(`  ✅ ${plan.displayName} - $${plan.priceMonthly / 100}/month`);
        } catch (error) {
            console.error(`  ❌ Error creating ${plan.displayName}:`, error.message);
        }
    }

    console.log('✅ Subscription plans initialized\n');
}

async function initializeABTests() {
    console.log('🧪 Initializing A/B tests...');

    const tests = [
        {
            name: 'paywall_timing',
            type: 'paywall_timing',
            variants: JSON.stringify(['after_3_videos', 'after_5_videos', 'after_10_videos']),
            isActive: true
        },
        {
            name: 'paywall_messaging',
            type: 'messaging',
            variants: JSON.stringify(['unlock_unlimited', 'upgrade_premium', 'limited_time']),
            isActive: true
        },
        {
            name: 'paywall_design',
            type: 'design',
            variants: JSON.stringify(['modal', 'fullpage', 'banner']),
            isActive: true
        },
        {
            name: 'pricing_monthly',
            type: 'pricing',
            variants: JSON.stringify(['$7.99', '$9.99', '$12.99']),
            isActive: false // Will activate when ready to test
        },
        {
            name: 'trial_duration',
            type: 'trial',
            variants: JSON.stringify(['3_days', '7_days', '14_days']),
            isActive: false
        }
    ];

    for (const test of tests) {
        try {
            await prisma.aBTest.upsert({
                where: { name: test.name },
                update: test,
                create: test
            });
            console.log(`  ✅ ${test.name} (${test.isActive ? 'active' : 'inactive'})`);
        } catch (error) {
            console.error(`  ❌ Error creating ${test.name}:`, error.message);
        }
    }

    console.log('✅ A/B tests initialized\n');
}

async function main() {
    try {
        console.log('\n🚀 Initializing Retention & Monetization Features\n');
        console.log('='.repeat(50) + '\n');

        await initializeMilestones();
        await initializeSubscriptionPlans();
        await initializeABTests();

        console.log('='.repeat(50));
        console.log('\n✅ All features initialized successfully!');
        console.log('\nNext steps:');
        console.log('1. Run database migration: npx prisma migrate dev');
        console.log('2. Generate Prisma client: npx prisma generate');
        console.log('3. Start the server: npm start');
        console.log('4. Test features at: http://localhost:3000\n');

    } catch (error) {
        console.error('\n❌ Error during initialization:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

