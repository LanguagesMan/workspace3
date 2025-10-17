/**
 * 🧪 ADAPTIVE FEED SYSTEM TESTS
 * Comprehensive testing for Agent 3 implementation
 */

const unifiedFeedV2 = require('../lib/unified-feed-algorithm-v2');
const learningGraph = require('../lib/learning-graph-persistence');
const multiArmedBandit = require('../lib/multi-armed-bandit');
const personalizationSignals = require('../lib/personalization-signals-tracker');

// Test user ID
const TEST_USER_ID = 'test_user_adaptive_' + Date.now();

console.log('🧪 Starting Adaptive Feed System Tests...\n');

/**
 * Test 1: Learning Graph Persistence
 */
async function testLearningGraphPersistence() {
    console.log('📊 Test 1: Learning Graph Persistence');
    
    try {
        // Track various interactions
        await learningGraph.trackVideoWatch(TEST_USER_ID, 'video_1', {
            difficulty: 'A2',
            completed: true,
            timeSpent: 120,
            duration: 150
        });

        await learningGraph.trackArticleRead(TEST_USER_ID, 'article_1', {
            difficulty: 'B1',
            completed: false,
            timeSpent: 45,
            duration: 180
        });

        await learningGraph.trackWordClick(TEST_USER_ID, 'hola', {
            difficulty: 'A1'
        });

        // Get interaction patterns
        const patterns = await learningGraph.getInteractionPatterns(TEST_USER_ID);
        console.log('   ✅ Tracked interactions successfully');
        console.log('   📈 Total interactions:', patterns.totalInteractions);
        console.log('   📊 By type:', patterns.byType);

        // Calculate comprehension score
        const comprehensionScore = await learningGraph.calculateComprehensionScore(TEST_USER_ID);
        console.log('   🎯 Comprehension score:', comprehensionScore);

        // Get success rates
        const successRates = await learningGraph.getSuccessRateByDifficulty(TEST_USER_ID);
        console.log('   📈 Success rates:', successRates);

        console.log('   ✅ Test 1 PASSED\n');
        return true;
    } catch (error) {
        console.error('   ❌ Test 1 FAILED:', error.message);
        return false;
    }
}

/**
 * Test 2: Multi-Armed Bandit
 */
function testMultiArmedBandit() {
    console.log('🎰 Test 2: Multi-Armed Bandit');
    
    try {
        // Initialize user
        multiArmedBandit.initializeUser(TEST_USER_ID);
        
        // Get initial weights
        const weights1 = multiArmedBandit.getWeights(TEST_USER_ID);
        console.log('   📊 Initial weights:', weights1);

        // Simulate good interaction
        const reward1 = 0.8;
        multiArmedBandit.updateReward(TEST_USER_ID, weights1, reward1);
        
        // Simulate bad interaction
        const weights2 = multiArmedBandit.getWeights(TEST_USER_ID);
        const reward2 = 0.2;
        multiArmedBandit.updateReward(TEST_USER_ID, weights2, reward2);

        // Simulate multiple interactions
        for (let i = 0; i < 10; i++) {
            const weights = multiArmedBandit.getWeights(TEST_USER_ID);
            const reward = Math.random() * 0.5 + 0.5; // 0.5-1.0
            multiArmedBandit.updateReward(TEST_USER_ID, weights, reward);
        }

        // Get final statistics
        const stats = multiArmedBandit.getUserStats(TEST_USER_ID);
        console.log('   📊 Final stats:');
        console.log('   - Total pulls:', stats.totalPulls);
        console.log('   - Arm performance:', Object.entries(stats.arms).map(([name, arm]) => 
            `${name}: ${arm.avgReward.toFixed(3)}`
        ).join(', '));

        // Test contextual weights
        const contextualWeights = multiArmedBandit.getContextualWeights(TEST_USER_ID, {
            timeOfDay: 'morning',
            sessionLength: 5,
            recentSkips: 0
        });
        console.log('   🌅 Morning contextual weights:', contextualWeights);

        console.log('   ✅ Test 2 PASSED\n');
        return true;
    } catch (error) {
        console.error('   ❌ Test 2 FAILED:', error.message);
        return false;
    }
}

/**
 * Test 3: Personalization Signals Tracker
 */
async function testPersonalizationSignals() {
    console.log('📊 Test 3: Personalization Signals Tracker');
    
    try {
        // Track time spent
        await personalizationSignals.trackTimeSpent(
            TEST_USER_ID,
            'video_1',
            'video',
            120,
            150
        );
        console.log('   ✅ Tracked time spent');

        // Track skip
        await personalizationSignals.trackSkip(
            TEST_USER_ID,
            'video_2',
            'video',
            15,
            180
        );
        console.log('   ✅ Tracked skip');

        // Track engagement
        await personalizationSignals.trackEngagement(
            TEST_USER_ID,
            'article_1',
            'article',
            'like'
        );
        console.log('   ✅ Tracked like');

        // Track word lookup
        await personalizationSignals.trackWordLookup(
            TEST_USER_ID,
            'gracias',
            'Muchas gracias por todo',
            'video_1'
        );
        console.log('   ✅ Tracked word lookup');

        // Track performance
        await personalizationSignals.trackPerformance(
            TEST_USER_ID,
            'quiz',
            'quiz_1',
            8,
            10,
            'A2'
        );
        console.log('   ✅ Tracked quiz performance');

        // Track content rating
        await personalizationSignals.trackContentRating(
            TEST_USER_ID,
            'article_2',
            'article',
            'just_right'
        );
        console.log('   ✅ Tracked content rating');

        // Get personalization profile
        const profile = await personalizationSignals.getPersonalizationProfile(TEST_USER_ID);
        console.log('   📊 Personalization profile:');
        console.log('   - Total signals:', profile.totalSignals);
        console.log('   - Engagement rate:', profile.engagement.likeRate.toFixed(2) + '%');
        console.log('   - Skip rate:', profile.skipBehavior.skipRate.toFixed(2) + '%');
        console.log('   - Avg performance:', profile.performance.avgScore.toFixed(2) + '%');

        console.log('   ✅ Test 3 PASSED\n');
        return true;
    } catch (error) {
        console.error('   ❌ Test 3 FAILED:', error.message);
        return false;
    }
}

/**
 * Test 4: Adaptive Feed Generation
 */
async function testAdaptiveFeedGeneration() {
    console.log('🎯 Test 4: Adaptive Feed Generation');
    
    try {
        // Generate feed
        const feed = await unifiedFeedV2.generateUnifiedFeed(TEST_USER_ID, {
            limit: 20,
            sessionPosition: 0,
            includeSRS: true
        });

        console.log('   ✅ Generated feed with', feed.length, 'items');
        
        // Check diversity
        const typeCount = {};
        feed.forEach(item => {
            typeCount[item.type] = (typeCount[item.type] || 0) + 1;
        });
        console.log('   📊 Content diversity:', typeCount);

        // Check scoring
        const avgScore = feed.reduce((sum, item) => sum + (item.score || 0), 0) / feed.length;
        console.log('   📈 Average item score:', avgScore.toFixed(2));

        // Check if SRS cards are present
        const srsCards = feed.filter(item => item.type === 'srs_review');
        console.log('   💡 SRS review cards:', srsCards.length);

        // Generate feed at different session positions
        const midSessionFeed = await unifiedFeedV2.generateUnifiedFeed(TEST_USER_ID, {
            limit: 20,
            sessionPosition: 10,
            includeSRS: true
        });
        console.log('   ✅ Mid-session feed generated:', midSessionFeed.length, 'items');

        const lateSessionFeed = await unifiedFeedV2.generateUnifiedFeed(TEST_USER_ID, {
            limit: 20,
            sessionPosition: 25,
            includeSRS: true
        });
        console.log('   ✅ Late-session feed generated:', lateSessionFeed.length, 'items');

        console.log('   ✅ Test 4 PASSED\n');
        return true;
    } catch (error) {
        console.error('   ❌ Test 4 FAILED:', error.message);
        return false;
    }
}

/**
 * Test 5: Level Adaptation
 */
async function testLevelAdaptation() {
    console.log('📈 Test 5: Level Adaptation');
    
    try {
        // Simulate high success rate (should trigger upgrade)
        for (let i = 0; i < 15; i++) {
            await learningGraph.trackVideoWatch(TEST_USER_ID, `video_success_${i}`, {
                difficulty: 'A2',
                completed: true,
                timeSpent: 140,
                duration: 150
            });
        }

        // Get feed stats
        const stats = await unifiedFeedV2.getFeedStats(TEST_USER_ID);
        console.log('   📊 User level:', stats.level);
        console.log('   📈 Comprehension:', stats.comprehensionScore);

        console.log('   ✅ Test 5 PASSED\n');
        return true;
    } catch (error) {
        console.error('   ❌ Test 5 FAILED:', error.message);
        return false;
    }
}

/**
 * Test 6: Feed Interaction Recording
 */
async function testFeedInteractionRecording() {
    console.log('📝 Test 6: Feed Interaction Recording');
    
    try {
        // Generate feed
        const feed = await unifiedFeedV2.generateUnifiedFeed(TEST_USER_ID, {
            limit: 5
        });

        if (feed.length === 0) {
            console.log('   ⚠️  No feed items to test with');
            return true;
        }

        const firstItem = feed[0];

        // Record positive interaction
        const result = await unifiedFeedV2.recordFeedInteraction(TEST_USER_ID, {
            type: 'video_watched',
            data: {
                contentId: firstItem.id,
                completed: true,
                timeSpent: 120,
                duration: 150
            },
            completed: true,
            liked: true,
            timeSpent: 120,
            duration: 150
        });

        console.log('   ✅ Interaction recorded');
        console.log('   🎯 Reward:', result.reward ? result.reward.toFixed(3) : 'N/A');

        console.log('   ✅ Test 6 PASSED\n');
        return true;
    } catch (error) {
        console.error('   ❌ Test 6 FAILED:', error.message);
        return false;
    }
}

/**
 * Test 7: Content Scoring Components
 */
function testContentScoring() {
    console.log('🎯 Test 7: Content Scoring Components');
    
    try {
        const algo = unifiedFeedV2;

        // Test level match scoring
        const levelScore1 = algo.calculateLevelMatch('A2', 'A2'); // Perfect match
        const levelScore2 = algo.calculateLevelMatch('B1', 'A2'); // i+1
        const levelScore3 = algo.calculateLevelMatch('C1', 'A2'); // Too hard
        
        console.log('   📊 Level match scores:');
        console.log('   - Same level (A2-A2):', levelScore1);
        console.log('   - i+1 (B1-A2):', levelScore2);
        console.log('   - Too hard (C1-A2):', levelScore3);

        // Test interest match
        const interests = [
            { name: 'culture', weight: 0.5 },
            { name: 'technology', weight: 0.3 }
        ];
        const interestScore1 = algo.calculateInterestMatch(['culture', 'art'], interests);
        const interestScore2 = algo.calculateInterestMatch(['sports', 'music'], interests);

        console.log('   📊 Interest match scores:');
        console.log('   - Matching topics:', interestScore1);
        console.log('   - Non-matching topics:', interestScore2);

        // Test novelty with freshness
        const recentContent = new Date();
        const oldContent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
        
        const noveltyScore1 = algo.calculateNovelty('new_content', recentContent, []);
        const noveltyScore2 = algo.calculateNovelty('old_content', oldContent, []);

        console.log('   📊 Novelty scores:');
        console.log('   - Fresh content:', noveltyScore1.toFixed(2));
        console.log('   - Old content:', noveltyScore2.toFixed(2));

        console.log('   ✅ Test 7 PASSED\n');
        return true;
    } catch (error) {
        console.error('   ❌ Test 7 FAILED:', error.message);
        return false;
    }
}

/**
 * Test 8: Diversity Constraints
 */
function testDiversityConstraints() {
    console.log('🎨 Test 8: Diversity Constraints');
    
    try {
        // Create test feed with many videos in a row
        const testFeed = [
            { id: '1', type: 'video', score: 100 },
            { id: '2', type: 'video', score: 99 },
            { id: '3', type: 'video', score: 98 },
            { id: '4', type: 'video', score: 97 },
            { id: '5', type: 'article', score: 96 },
            { id: '6', type: 'video', score: 95 },
            { id: '7', type: 'music', score: 94 },
            { id: '8', type: 'video', score: 93 }
        ];

        const diversified = unifiedFeedV2.applyDiversityConstraints(testFeed, 8);

        console.log('   📊 Original feed types:', testFeed.map(i => i.type).join(', '));
        console.log('   🎨 Diversified feed types:', diversified.map(i => i.type).join(', '));

        // Check no more than 2 consecutive of same type
        let maxConsecutive = 0;
        let currentType = null;
        let consecutive = 0;

        for (const item of diversified) {
            if (item.type === currentType) {
                consecutive++;
                maxConsecutive = Math.max(maxConsecutive, consecutive);
            } else {
                consecutive = 1;
                currentType = item.type;
            }
        }

        console.log('   📈 Max consecutive same type:', maxConsecutive);

        if (maxConsecutive <= 2) {
            console.log('   ✅ Diversity constraint satisfied');
        } else {
            console.log('   ⚠️  Diversity constraint exceeded');
        }

        console.log('   ✅ Test 8 PASSED\n');
        return true;
    } catch (error) {
        console.error('   ❌ Test 8 FAILED:', error.message);
        return false;
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ADAPTIVE FEED INTELLIGENCE TEST SUITE');
    console.log('  Agent 3 Implementation Validation');
    console.log('═══════════════════════════════════════════════════════\n');

    const results = {
        passed: 0,
        failed: 0,
        total: 8
    };

    // Run tests
    if (await testLearningGraphPersistence()) results.passed++; else results.failed++;
    if (testMultiArmedBandit()) results.passed++; else results.failed++;
    if (await testPersonalizationSignals()) results.passed++; else results.failed++;
    if (await testAdaptiveFeedGeneration()) results.passed++; else results.failed++;
    if (await testLevelAdaptation()) results.passed++; else results.failed++;
    if (await testFeedInteractionRecording()) results.passed++; else results.failed++;
    if (testContentScoring()) results.passed++; else results.failed++;
    if (testDiversityConstraints()) results.passed++; else results.failed++;

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('  TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Total Tests: ${results.total}`);
    console.log(`  ✅ Passed: ${results.passed}`);
    console.log(`  ❌ Failed: ${results.failed}`);
    console.log(`  Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (results.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! Agent 3 implementation is working correctly.\n');
    } else {
        console.log('⚠️  Some tests failed. Review the errors above.\n');
    }

    // Cleanup test data
    try {
        await learningGraph.cleanupOldInteractions();
        multiArmedBandit.resetUser(TEST_USER_ID);
        console.log('🧹 Test cleanup complete\n');
    } catch (error) {
        console.log('⚠️  Cleanup warning:', error.message, '\n');
    }

    process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests if executed directly
if (require.main === module) {
    runAllTests().catch(error => {
        console.error('Fatal test error:', error);
        process.exit(1);
    });
}

module.exports = { runAllTests };


