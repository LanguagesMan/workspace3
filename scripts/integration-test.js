/**
 * 🧪 INTEGRATION TEST SUITE
 * Tests complete user journey from first visit to mastery
 * 
 * Run: node scripts/integration-test.js
 */

const integration = require('../lib/unified-integration-controller');
const geniusAdaptive = require('../lib/genius-adaptive-system');
const behavioralTracker = require('../lib/behavioral-tracker');

// Test utilities
const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test user ID
const TEST_USER_ID = 'test_user_' + Date.now();

console.log('🧪 STARTING INTEGRATION TEST SUITE\n');
console.log(`Test User ID: ${TEST_USER_ID}\n`);

async function runTests() {
  let testsPassed = 0;
  let testsFailed = 0;
  
  try {
    // ===========================================
    // TEST 1: FIRST VISIT
    // ===========================================
    console.log('📝 TEST 1: First Visit Flow');
    
    const firstVisit = await integration.handleFirstVisit(TEST_USER_ID);
    
    assert(firstVisit.success === true, 'First visit returns success');
    assert(firstVisit.nextStep === 'placement_test', 'First visit directs to placement test');
    assert(firstVisit.journey !== null, 'First visit creates journey');
    
    testsPassed++;
    console.log('');
    
    // ===========================================
    // TEST 2: PLACEMENT TEST COMPLETION
    // ===========================================
    console.log('📝 TEST 2: Placement Test Completion');
    
    const testResults = {
      knownWords: [
        { word: 'hola', rank: 1 },
        { word: 'sí', rank: 2 },
        { word: 'no', rank: 3 },
        { word: 'gracias', rank: 12 },
        { word: 'tiempo', rank: 45 }
      ],
      accuracy: 0.7,
      totalWords: 20,
      duration: 30000
    };
    
    const placementResult = await integration.handlePlacementTestComplete(TEST_USER_ID, testResults);
    
    assert(placementResult.success === true, 'Placement test returns success');
    assert(placementResult.assessment !== null, 'Placement test returns assessment');
    assert(['A1', 'A2', 'B1'].includes(placementResult.assessment.level), 'Assessment level is valid');
    assert(placementResult.firstFeed !== null, 'Placement test returns first feed');
    
    testsPassed++;
    console.log('');
    
    // ===========================================
    // TEST 3: PERSONALIZED FEED GENERATION
    // ===========================================
    console.log('📝 TEST 3: Personalized Feed Generation');
    
    const feed = await integration.getPersonalizedFeed(TEST_USER_ID);
    
    assert(feed !== null, 'Feed is generated');
    assert(feed.items !== undefined, 'Feed has items');
    assert(feed.metadata !== undefined, 'Feed has metadata');
    assert(feed.metadata.userId === TEST_USER_ID, 'Feed metadata has correct user ID');
    
    testsPassed++;
    console.log('');
    
    // ===========================================
    // TEST 4: WORD CLICK TRACKING
    // ===========================================
    console.log('📝 TEST 4: Word Click Tracking');
    
    const wordClickAction = {
      type: 'word_click',
      word: 'casa',
      timestamp: Date.now(),
      context: { videoId: 'test_video_1' }
    };
    
    const wordClickResult = await integration.handleUserAction(TEST_USER_ID, wordClickAction);
    
    assert(wordClickResult.success === true, 'Word click tracked successfully');
    assert(wordClickResult.tracked === true, 'Action was tracked');
    assert(wordClickResult.signals !== null, 'Behavioral signals returned');
    
    testsPassed++;
    console.log('');
    
    // ===========================================
    // TEST 5: VIDEO COMPLETION TRACKING
    // ===========================================
    console.log('📝 TEST 5: Video Completion Tracking');
    
    const videoAction = {
      type: 'video_watch',
      contentId: 'test_video_1',
      percentage: 95,
      duration: 120
    };
    
    const videoResult = await integration.handleUserAction(TEST_USER_ID, videoAction);
    
    assert(videoResult.success === true, 'Video watch tracked successfully');
    assert(videoResult.result !== null, 'Tracking result returned');
    
    testsPassed++;
    console.log('');
    
    // ===========================================
    // TEST 6: "TOO HARD" BUTTON - LEVEL ADJUSTMENT
    // ===========================================
    console.log('📝 TEST 6: "Too Hard" Button - Level Adjustment');
    
    const oldLevel = placementResult.assessment.level;
    
    const tooHardAction = {
      type: 'too_hard',
      contentId: 'test_video_1'
    };
    
    const tooHardResult = await integration.handleUserAction(TEST_USER_ID, tooHardAction);
    
    assert(tooHardResult.success === true, 'Too hard action tracked');
    assert(tooHardResult.adjustment !== null, 'Level adjustment triggered');
    console.log(`   Level: ${oldLevel} → ${tooHardResult.adjustment.newLevel}`);
    
    testsPassed++;
    console.log('');
    
    // ===========================================
    // TEST 7: FEED REFRESH AFTER ADJUSTMENT
    // ===========================================
    console.log('📝 TEST 7: Feed Refresh After Adjustment');
    
    const refreshedFeed = await integration.refreshFeedRealTime(TEST_USER_ID);
    
    assert(refreshedFeed !== null, 'Feed refreshed successfully');
    assert(refreshedFeed.items !== undefined, 'Refreshed feed has items');
    
    testsPassed++;
    console.log('');
    
    // ===========================================
    // TEST 8: WORD SAVE WITH MILESTONE CHECK
    // ===========================================
    console.log('📝 TEST 8: Word Save with Milestone Check');
    
    const wordSaveAction = {
      type: 'word_save',
      word: 'amigo',
      wordRank: 89,
      level: 'A2',
      totalWords: 10
    };
    
    const wordSaveResult = await integration.handleUserAction(TEST_USER_ID, wordSaveAction);
    
    assert(wordSaveResult.success === true, 'Word save tracked');
    
    // Try to trigger milestone by saving 10 words
    for (let i = 0; i < 9; i++) {
      await integration.handleUserAction(TEST_USER_ID, {
        type: 'word_save',
        word: `word_${i}`,
        wordRank: 100 + i,
        level: 'A2',
        totalWords: 10 + i + 1
      });
    }
    
    const milestone = await integration.checkAndCelebrateMilestone(TEST_USER_ID, 20);
    console.log(`   Milestone check: ${milestone ? milestone.message : 'No milestone yet'}`);
    
    testsPassed++;
    console.log('');
    
    // ===========================================
    // TEST 9: QUIZ PERFORMANCE TRACKING
    // ===========================================
    console.log('📝 TEST 9: Quiz Performance Tracking');
    
    const quizAction = {
      type: 'quiz_complete',
      quizId: 'test_quiz_1',
      score: 8,
      totalQuestions: 10
    };
    
    const quizResult = await integration.handleUserAction(TEST_USER_ID, quizAction);
    
    assert(quizResult.success === true, 'Quiz completion tracked');
    assert(quizResult.result !== null, 'Quiz result returned');
    
    testsPassed++;
    console.log('');
    
    // ===========================================
    // TEST 10: COMPLETE USER PROFILE
    // ===========================================
    console.log('📝 TEST 10: Complete User Profile');
    
    const profile = await integration.getUserProfile(TEST_USER_ID);
    
    assert(profile.success === true, 'Profile retrieved successfully');
    assert(profile.userId === TEST_USER_ID, 'Profile has correct user ID');
    assert(profile.journey !== null, 'Profile has journey data');
    assert(profile.signals !== null, 'Profile has behavioral signals');
    assert(profile.sessionStats !== null, 'Profile has session stats');
    
    console.log('\n📊 USER PROFILE SUMMARY:');
    console.log(`   Journey Stage: ${profile.journey.stage}`);
    console.log(`   Current Level: ${profile.journey.currentLevel}`);
    console.log(`   Completed Steps: ${profile.journey.completedSteps.length}`);
    if (profile.sessionStats) {
      console.log(`   Total Word Clicks: ${profile.sessionStats.totalWordClicks}`);
      console.log(`   Total Content Viewed: ${profile.sessionStats.totalContentViewed}`);
      console.log(`   Total Words Saved: ${profile.sessionStats.totalWordsSaved}`);
    }
    
    testsPassed++;
    console.log('');
    
    // ===========================================
    // TEST 11: BEGINNER MODE FLOW
    // ===========================================
    console.log('📝 TEST 11: Beginner Mode Flow');
    
    const BEGINNER_USER = 'test_beginner_' + Date.now();
    
    const beginnerSkip = await integration.handleBeginnerSkip(BEGINNER_USER);
    
    assert(beginnerSkip.success === true, 'Beginner skip successful');
    assert(beginnerSkip.journey.currentLevel === 'A1', 'Beginner starts at A1');
    assert(beginnerSkip.beginnerMode === true, 'Beginner mode enabled');
    assert(beginnerSkip.firstFeed !== null, 'Beginner feed generated');
    
    testsPassed++;
    console.log('');
    
    // ===========================================
    // TEST 12: SESSION TRACKING
    // ===========================================
    console.log('📝 TEST 12: Session Tracking');
    
    const sessionData = {
      startTime: Date.now() - 300000, // 5 minutes ago
      endTime: Date.now(),
      videosWatched: 3,
      wordsClicked: 15,
      wordsSaved: 5,
      quizzesTaken: 1
    };
    
    const sessionResult = await integration.trackSession(TEST_USER_ID, sessionData);
    
    assert(sessionResult.success === true, 'Session tracked successfully');
    assert(sessionResult.sessionNumber > 0, 'Session number assigned');
    
    testsPassed++;
    console.log('');
    
    // ===========================================
    // TEST 13: PROGRESSION CHECK
    // ===========================================
    console.log('📝 TEST 13: Progression Check');
    
    const progression = await integration.checkProgression(TEST_USER_ID);
    
    assert(progression !== null, 'Progression check completed');
    console.log(`   Should Progress: ${progression.shouldProgress ? 'Yes' : 'No'}`);
    if (progression.shouldProgress) {
      console.log(`   Recommendation: ${progression.recommendation}`);
      console.log(`   Message: ${progression.message}`);
    }
    
    testsPassed++;
    console.log('');
    
    // ===========================================
    // SUMMARY
    // ===========================================
    console.log('\n' + '='.repeat(50));
    console.log('🎉 TEST SUITE COMPLETE');
    console.log('='.repeat(50));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📊 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
    console.log('='.repeat(50));
    
    if (testsFailed === 0) {
      console.log('\n🚀 ALL SYSTEMS OPERATIONAL - READY FOR PRODUCTION!\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  SOME TESTS FAILED - REVIEW REQUIRED\n');
      process.exit(1);
    }
    
  } catch (error) {
    testsFailed++;
    console.error('\n❌ TEST SUITE FAILED');
    console.error('Error:', error.message);
    console.error('\nStack:', error.stack);
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed + 1}`);
    console.log('='.repeat(50));
    
    process.exit(1);
  }
}

// Run the tests
runTests();

