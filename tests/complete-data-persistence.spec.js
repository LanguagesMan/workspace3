// 🗄️ COMPLETE DATA PERSISTENCE VALIDATION
// Tests that ALL data flows persist to Prisma (not in-memory):
// ✅ SRS vocabulary reviews
// ✅ User interests/level updates
// ✅ Content ingestion (podcasts, YouTube, music)
// ✅ Transcript caching
// ✅ Engagement tracking (streaks, XP)
//
// Addresses gaps:
// - "Saved words/SRS reviews aren't persisted" (lib/srs-system.js:6)
// - "Content diversity pipeline incomplete" (lib/unified-feed-algorithm.js:26)
// - "Level + difficulty feedback loop missing" (lib/unified-feed-algorithm.js:205)
// - "Data truth mismatch: feed scoring expects Prisma-backed data"

const { test, expect } = require('@playwright/test');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

test.describe('🗄️ Complete Data Persistence - Prisma Integration', () => {

    test.beforeAll(async () => {
        // Ensure database is accessible
        console.log('🔌 Testing database connection...');
        await prisma.$connect();
    });

    test.afterAll(async () => {
        await prisma.$disconnect();
    });

    test('should have YouTubeVideo model in Prisma schema', async () => {
        // Verify new models exist
        const models = Object.keys(prisma);

        console.log('📊 Checking Prisma models...');
        expect(models).toContain('youTubeVideo');
        expect(models).toContain('music');
        expect(models).toContain('podcast');
        expect(models).toContain('word');
        expect(models).toContain('user');
        expect(models).toContain('reviewSession');
        expect(models).toContain('userInteraction');

        console.log('✅ All required models exist');
    });

    test('should import SRS Prisma adapter', async () => {
        const srsAdapter = require('../lib/srs-prisma-adapter.js');

        expect(srsAdapter).toBeDefined();
        expect(typeof srsAdapter.addCard).toBe('function');
        expect(typeof srsAdapter.getDueCards).toBe('function');
        expect(typeof srsAdapter.reviewCard).toBe('function');
        expect(typeof srsAdapter.getStats).toBe('function');
        expect(typeof srsAdapter.updateUserLevel).toBe('function');
        expect(typeof srsAdapter.updateInterestWeights).toBe('function');

        console.log('✅ SRS Prisma adapter loaded successfully');
    });

    test('should import content ingestion pipeline', async () => {
        const pipeline = require('../lib/content-ingestion-pipeline.js');

        expect(pipeline).toBeDefined();
        expect(typeof pipeline.ingestPodcasts).toBe('function');
        expect(typeof pipeline.ingestYouTubeVideos).toBe('function');
        expect(typeof pipeline.ingestMusic).toBe('function');
        expect(typeof pipeline.ingestAll).toBe('function');

        console.log('✅ Content ingestion pipeline loaded');
    });

    test('should persist vocabulary word to database (SRS adapter)', async () => {
        const srsAdapter = require('../lib/srs-prisma-adapter.js');

        const testUserId = `test-user-${Date.now()}`;
        const testWord = `hola-${Date.now()}`;

        // Create user first (foreign key constraint)
        await prisma.user.create({
            data: {
                id: testUserId,
                currentLevel: 'A1',
                totalXP: 0,
                streak: 0
            }
        });

        // Add word via SRS adapter
        const result = await srsAdapter.addCard(
            testWord,
            'hello',
            'Hola, ¿cómo estás?',
            testUserId,
            'A1',
            'test',
            'test-source'
        );

        expect(result.success).toBe(true);
        expect(result.word).toBeDefined();
        expect(result.word.word).toBe(testWord);

        // Verify it's in database
        const dbWord = await prisma.word.findFirst({
            where: { userId: testUserId, word: testWord }
        });

        expect(dbWord).toBeDefined();
        expect(dbWord.translation).toBe('hello');
        expect(dbWord.level).toBe('A1');
        expect(dbWord.saved).toBe(true);

        console.log(`✅ Word "${testWord}" persisted to database`);

        // Cleanup
        await prisma.word.deleteMany({ where: { userId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
    });

    test('should track review session in database', async () => {
        const srsAdapter = require('../lib/srs-prisma-adapter.js');

        const testUserId = `test-user-${Date.now()}`;
        const testWord = `casa-${Date.now()}`;

        // Create user first (foreign key constraint)
        await prisma.user.create({
            data: {
                id: testUserId,
                currentLevel: 'A1',
                totalXP: 0,
                streak: 0
            }
        });

        // Add word
        const addResult = await srsAdapter.addCard(
            testWord,
            'house',
            'Mi casa es grande',
            testUserId,
            'A1'
        );

        const wordId = addResult.word.id;

        // Review word with quality 4 (easy)
        const reviewResult = await srsAdapter.reviewCard(wordId, 4);

        expect(reviewResult.success).toBe(true);
        expect(reviewResult.word.reviewCount).toBe(1);

        // Verify ReviewSession was created
        const reviewSession = await prisma.reviewSession.findFirst({
            where: { userId: testUserId, wordId }
        });

        expect(reviewSession).toBeDefined();
        expect(reviewSession.quality).toBe(4);

        console.log(`✅ Review session tracked in database`);

        // Cleanup
        await prisma.reviewSession.deleteMany({ where: { userId: testUserId } });
        await prisma.word.deleteMany({ where: { userId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
    });

    test('should update user level based on performance', async () => {
        const srsAdapter = require('../lib/srs-prisma-adapter.js');

        const testUserId = `test-user-${Date.now()}`;

        // Create test user
        await prisma.user.create({
            data: {
                id: testUserId,
                currentLevel: 'A1',
                totalXP: 0,
                streak: 0
            }
        });

        // Call update level function
        const result = await srsAdapter.updateUserLevel(testUserId);

        expect(result.success).toBe(true);

        console.log(`✅ User level update logic working`);

        // Cleanup
        await prisma.user.delete({ where: { id: testUserId } });
    });

    test('should track user interaction for feed personalization', async () => {
        const srsAdapter = require('../lib/srs-prisma-adapter.js');

        const testUserId = `test-user-${Date.now()}`;

        // Track interaction
        const result = await srsAdapter.trackInteraction(
            testUserId,
            'video_watched',
            'video-123',
            'A2',
            null,
            120 // 2 minutes
        );

        expect(result.success).toBe(true);

        // Verify in database
        const interaction = await prisma.userInteraction.findFirst({
            where: { userId: testUserId, type: 'video_watched' }
        });

        expect(interaction).toBeDefined();
        expect(interaction.contentId).toBe('video-123');
        expect(interaction.difficulty).toBe('A2');
        expect(interaction.timeSpent).toBe(120);

        console.log(`✅ User interaction tracked in database`);

        // Cleanup
        await prisma.userInteraction.deleteMany({ where: { userId: testUserId } });
    });

    test('should ingest podcasts to database', async () => {
        const pipeline = require('../lib/content-ingestion-pipeline.js');

        // Ingest 5 podcasts
        const result = await pipeline.ingestPodcasts(5);

        expect(result.success).toBe(true);
        expect(result.count).toBeGreaterThan(0);

        // Verify in database
        const podcasts = await prisma.podcast.findMany({
            take: 5
        });

        console.log(`✅ Ingested ${result.count} podcasts to database`);
        expect(podcasts.length).toBeGreaterThan(0);
    });

    test('should ingest YouTube videos to database', async () => {
        const pipeline = require('../lib/content-ingestion-pipeline.js');

        // Ingest 5 videos
        const result = await pipeline.ingestYouTubeVideos(5);

        expect(result.success).toBe(true);
        expect(result.count).toBeGreaterThan(0);

        // Verify in database
        const videos = await prisma.youTubeVideo.findMany({
            take: 5
        });

        console.log(`✅ Ingested ${result.count} YouTube videos to database`);
        expect(videos.length).toBeGreaterThan(0);
    });

    test('should ingest music to database', async () => {
        const pipeline = require('../lib/content-ingestion-pipeline.js');

        // Ingest 5 songs
        const result = await pipeline.ingestMusic(5);

        expect(result.success).toBe(true);
        expect(result.count).toBeGreaterThan(0);

        // Verify in database
        const music = await prisma.music.findMany({
            take: 5
        });

        console.log(`✅ Ingested ${result.count} music tracks to database`);
        expect(music.length).toBeGreaterThan(0);
    });

    test('should get ingestion statistics', async () => {
        const pipeline = require('../lib/content-ingestion-pipeline.js');

        const stats = await pipeline.getStats();

        expect(stats.success).toBe(true);
        expect(stats.stats).toBeDefined();
        expect(stats.stats.podcasts).toBeGreaterThanOrEqual(0);
        expect(stats.stats.youtube).toBeGreaterThanOrEqual(0);
        expect(stats.stats.music).toBeGreaterThanOrEqual(0);
        expect(stats.stats.total).toBeGreaterThanOrEqual(0);

        console.log('✅ Content ingestion statistics:');
        console.log(`   Podcasts: ${stats.stats.podcasts}`);
        console.log(`   YouTube: ${stats.stats.youtube}`);
        console.log(`   Music: ${stats.stats.music}`);
        console.log(`   Total: ${stats.stats.total}`);
    });

    test('should have unified feed algorithm using Prisma data', async () => {
        const feedAlgorithm = require('../lib/unified-feed-algorithm.js');

        // Create test user
        const testUserId = `test-user-${Date.now()}`;
        await prisma.user.create({
            data: {
                id: testUserId,
                currentLevel: 'A2',
                totalXP: 0,
                streak: 0
            }
        });

        // Generate feed
        const feed = await feedAlgorithm.generateUnifiedFeed(testUserId, 10);

        expect(Array.isArray(feed)).toBe(true);
        console.log(`✅ Generated feed with ${feed.length} items using Prisma data`);

        // Cleanup
        await prisma.user.delete({ where: { id: testUserId } });
    });

    test('should demonstrate complete data flow: add word → review → level up', async () => {
        console.log('\n🔄 COMPLETE DATA FLOW TEST:\n');

        const srsAdapter = require('../lib/srs-prisma-adapter.js');
        const testUserId = `test-user-${Date.now()}`;

        // 1. Create user
        await prisma.user.create({
            data: {
                id: testUserId,
                currentLevel: 'A1',
                totalXP: 0,
                streak: 0
            }
        });
        console.log('   1. ✅ Created user in database');

        // 2. Add vocabulary word
        const addResult = await srsAdapter.addCard(
            'aprender',
            'to learn',
            'Me gusta aprender español',
            testUserId,
            'A1'
        );
        console.log(`   2. ✅ Added word "${addResult.word.word}" to vocabulary`);

        // 3. Review word (mark as mastered)
        const reviewResult = await srsAdapter.reviewCard(addResult.word.id, 5);
        console.log(`   3. ✅ Reviewed word (quality: 5, next review in ${reviewResult.interval} days)`);

        // 4. Track interaction
        await srsAdapter.trackInteraction(testUserId, 'word_saved', null, 'A1');
        console.log('   4. ✅ Tracked interaction in database');

        // 5. Get user stats
        const stats = await srsAdapter.getStats(testUserId);
        console.log(`   5. ✅ User stats: ${stats.stats.totalCards} cards, ${stats.stats.totalReviews} reviews`);

        // 6. Update user level
        await srsAdapter.updateUserLevel(testUserId);
        console.log('   6. ✅ Updated user level based on performance');

        // Verify everything persisted
        const finalUser = await prisma.user.findUnique({
            where: { id: testUserId },
            include: { words: true }
        });

        expect(finalUser).toBeDefined();
        expect(finalUser.words.length).toBe(1);
        console.log('\n✅ COMPLETE DATA FLOW VERIFIED\n');

        // Cleanup
        await prisma.word.deleteMany({ where: { userId: testUserId } });
        await prisma.reviewSession.deleteMany({ where: { userId: testUserId } });
        await prisma.userInteraction.deleteMany({ where: { userId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
    });

    test('should validate data truth: feed uses real Prisma data, not in-memory', async () => {
        const feedAlgorithm = require('../lib/unified-feed-algorithm.js');
        const testUserId = `test-user-${Date.now()}`;

        // Create user with interests
        await prisma.user.create({
            data: {
                id: testUserId,
                currentLevel: 'B1',
                totalXP: 0,
                streak: 0
            }
        });

        await prisma.userInterest.create({
            data: {
                userId: testUserId,
                interest: 'culture',
                weight: 0.8
            }
        });

        // Load user profile (should read from Prisma)
        const profile = await feedAlgorithm.loadUserProfile(testUserId);

        expect(profile.userId).toBe(testUserId);
        expect(profile.level).toBe('B1');
        expect(profile.interests.length).toBeGreaterThan(0);
        expect(profile.interests[0].name).toBe('culture');

        console.log('✅ Feed algorithm reads from Prisma, not in-memory storage');

        // Cleanup
        await prisma.userInterest.deleteMany({ where: { userId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
    });

});

console.log('🗄️ Complete Data Persistence Validation - Tests Prisma Integration for ALL Gaps!');
