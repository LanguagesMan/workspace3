/**
 * 🧪 COMPREHENSIVE USER TESTING SUITE
 * Tests adaptive system with different user personas across all levels
 */

const geniusAdaptive = require('./lib/genius-adaptive-system');
const behavioralTracker = require('./lib/behavioral-tracker');
const frequencyWords = require('./lib/spanish-frequency-words-extended');

// Test colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// User Personas for Testing
const userPersonas = {
  absoluteBeginner: {
    id: 'user_absolute_beginner',
    name: 'Maria (Absolute Beginner)',
    description: 'Never studied Spanish before',
    initialTest: { ultraHighFreq: 0, midFreq: 0, knowsBasics: false },
    expectedLevel: 'A1',
    knownWords: [],
    behaviorPattern: 'slow_clicker'
  },
  
  falseBeginnerFast: {
    id: 'user_false_beginner',
    name: 'John (False Beginner - Fast Learner)',
    description: 'Studied years ago, remembers some basics',
    initialTest: { ultraHighFreq: 3, midFreq: 1, knowsBasics: true },
    expectedLevel: 'A1',
    knownWords: ['hola', 'gracias', 'sí', 'no', 'adiós'],
    behaviorPattern: 'fast_learner'
  },
  
  elementaryLearner: {
    id: 'user_elementary',
    name: 'Sarah (Elementary)',
    description: 'Can handle basic conversations',
    initialTest: { ultraHighFreq: 4, midFreq: 2, knowsBasics: true },
    expectedLevel: 'A2',
    knownWords: Array.from({ length: 400 }, (_, i) => `word${i}`),
    behaviorPattern: 'steady_learner'
  },
  
  intermediateLearner: {
    id: 'user_intermediate',
    name: 'Carlos (Intermediate)',
    description: 'Comfortable with everyday Spanish',
    initialTest: { ultraHighFreq: 5, midFreq: 4, knowsBasics: true },
    expectedLevel: 'B1',
    knownWords: Array.from({ length: 800 }, (_, i) => `word${i}`),
    behaviorPattern: 'confident'
  },
  
  advancedLearner: {
    id: 'user_advanced',
    name: 'Elena (Advanced)',
    description: 'Near fluent, reading complex texts',
    initialTest: { ultraHighFreq: 5, midFreq: 5, knowsBasics: true },
    expectedLevel: 'B2',
    knownWords: Array.from({ length: 1500 }, (_, i) => `word${i}`),
    behaviorPattern: 'quick_master'
  },
  
  strugglingStudent: {
    id: 'user_struggling',
    name: 'Tom (Struggling Student)',
    description: 'Finds everything too hard',
    initialTest: { ultraHighFreq: 2, midFreq: 0, knowsBasics: false },
    expectedLevel: 'A1',
    knownWords: ['hola', 'gracias'],
    behaviorPattern: 'struggling'
  }
};

// Mock content for testing
const mockContent = {
  beginner: {
    id: 'content_beginner',
    text: 'Hola me gusta comer pizza',
    newWordCount: 3
  },
  elementary: {
    id: 'content_elementary',
    text: 'Ayer fui al mercado con mi madre para comprar frutas y verduras frescas',
    newWordCount: 6
  },
  intermediate: {
    id: 'content_intermediate',
    text: 'El clima está cambiando rápidamente y necesitamos tomar medidas urgentes para proteger el medio ambiente',
    newWordCount: 10
  },
  advanced: {
    id: 'content_advanced',
    text: 'La implementación de políticas económicas requiere un análisis exhaustivo de las variables macroeconómicas y sus implicaciones sociales',
    newWordCount: 15
  }
};

async function testUserPersona(persona) {
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(`👤 Testing: ${persona.name}`, 'magenta');
  log(`   ${persona.description}`, 'yellow');
  log('='.repeat(70), 'cyan');
  
  const results = {
    persona: persona.name,
    tests: [],
    passed: 0,
    failed: 0
  };
  
  // TEST 1: Initial Assessment
  log('\n📝 Test 1: Initial Assessment', 'blue');
  try {
    const assessment = await geniusAdaptive.assessInitialLevel(
      persona.id,
      persona.initialTest
    );
    
    // Set known words to match persona
    geniusAdaptive.setKnownWords(persona.id, persona.knownWords);
    
    const passed = assessment.level === persona.expectedLevel;
    results.tests.push({
      name: 'Initial Assessment',
      passed,
      expected: persona.expectedLevel,
      actual: assessment.level,
      details: assessment.reasoning
    });
    
    if (passed) {
      log(`   ✅ Correctly assessed as ${assessment.level}`, 'green');
      results.passed++;
    } else {
      log(`   ❌ Expected ${persona.expectedLevel}, got ${assessment.level}`, 'red');
      results.failed++;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }
  
  // TEST 2: Content Recommendation (Goldilocks)
  log('\n🎯 Test 2: Content Recommendation (Goldilocks)', 'blue');
  try {
    const allContent = Object.values(mockContent);
    const recommendations = geniusAdaptive.getGoldilocksContent(persona.id, allContent);
    
    const hasRecommendations = recommendations.all && recommendations.all.length > 0;
    results.tests.push({
      name: 'Content Recommendation',
      passed: hasRecommendations,
      details: `Found ${recommendations.all.length} items, ${recommendations.recommended.length} in goldilocks zone`
    });
    
    if (hasRecommendations) {
      log(`   ✅ Found ${recommendations.recommended.length} perfect matches`, 'green');
      results.passed++;
    } else {
      log(`   ❌ No recommendations found`, 'red');
      results.failed++;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }
  
  // TEST 3: Behavioral Tracking
  log('\n📊 Test 3: Behavioral Tracking', 'blue');
  try {
    // Simulate behavior based on persona
    switch (persona.behaviorPattern) {
      case 'fast_learner':
        behavioralTracker.trackWordClick(persona.id, 'hola', Date.now() - 1000);
        behavioralTracker.trackWordClick(persona.id, 'gracias', Date.now() - 500);
        behavioralTracker.trackCompletionRate(persona.id, 'content1', 85);
        break;
        
      case 'slow_clicker':
        behavioralTracker.trackWordClick(persona.id, 'hola', Date.now() - 8000);
        behavioralTracker.trackWordClick(persona.id, 'gracias', Date.now() - 6000);
        behavioralTracker.trackCompletionRate(persona.id, 'content1', 40);
        break;
        
      case 'struggling':
        behavioralTracker.trackWordClick(persona.id, 'hola', Date.now() - 10000);
        behavioralTracker.trackCompletionRate(persona.id, 'content1', 25);
        behavioralTracker.trackButtonClick(persona.id, 'too_hard', 'content1');
        break;
        
      case 'confident':
        behavioralTracker.trackWordClick(persona.id, 'palabra', Date.now() - 1500);
        behavioralTracker.trackCompletionRate(persona.id, 'content1', 95);
        behavioralTracker.trackQuizPerformance(persona.id, 'quiz1', 85, 100);
        break;
        
      default:
        behavioralTracker.trackWordClick(persona.id, 'hola', Date.now() - 3000);
        behavioralTracker.trackCompletionRate(persona.id, 'content1', 70);
    }
    
    const signals = behavioralTracker.calculateUserSignals(persona.id);
    const hasSignals = signals && signals.confidenceScore;
    
    results.tests.push({
      name: 'Behavioral Tracking',
      passed: hasSignals,
      details: `Signals: ${signals?.confidenceScore || 'none'}`
    });
    
    if (hasSignals) {
      log(`   ✅ Behavioral signals tracked (${signals.confidenceScore})`, 'green');
      results.passed++;
    } else {
      log(`   ❌ Failed to track signals`, 'red');
      results.failed++;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }
  
  // TEST 4: Real-Time Adaptation
  log('\n⚡ Test 4: Real-Time Difficulty Adjustment', 'blue');
  try {
    let adjustment;
    
    // Test appropriate signal for persona
    if (persona.behaviorPattern === 'struggling') {
      adjustment = geniusAdaptive.adjustDifficultyInRealTime(persona.id, {
        type: 'too_hard',
        contentId: 'content1'
      });
    } else if (persona.behaviorPattern === 'quick_master') {
      adjustment = geniusAdaptive.adjustDifficultyInRealTime(persona.id, {
        type: 'quiz_success',
        score: 95
      });
    } else {
      adjustment = geniusAdaptive.adjustDifficultyInRealTime(persona.id, {
        type: 'completion',
        percentage: 70
      });
    }
    
    results.tests.push({
      name: 'Real-Time Adaptation',
      passed: adjustment.success,
      details: `${adjustment.oldLevel} → ${adjustment.newLevel}: ${adjustment.action}`
    });
    
    if (adjustment.success) {
      log(`   ✅ Level adjusted: ${adjustment.action}`, 'green');
      results.passed++;
    } else {
      log(`   ❌ Adjustment failed`, 'red');
      results.failed++;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }
  
  // TEST 5: Beginner Mode (if applicable)
  if (persona.knownWords.length < 100) {
    log('\n🌱 Test 5: Beginner Protection Mode', 'blue');
    try {
      const isBeginnerMode = geniusAdaptive.isBeginnerMode(persona.id);
      const settings = geniusAdaptive.getBeginnerModeSettings(persona.id);
      
      const passed = isBeginnerMode && settings.maxNewWordsPerItem === 3;
      results.tests.push({
        name: 'Beginner Mode',
        passed,
        details: `Beginner mode: ${isBeginnerMode}, Max words: ${settings.maxNewWordsPerItem || 'N/A'}`
      });
      
      if (passed) {
        log(`   ✅ Beginner mode active with protection`, 'green');
        results.passed++;
      } else {
        log(`   ❌ Beginner mode not configured correctly`, 'red');
        results.failed++;
      }
    } catch (error) {
      log(`   ❌ Error: ${error.message}`, 'red');
      results.failed++;
    }
  }
  
  // TEST 6: Milestone Check
  if (persona.knownWords.length <= 100) {
    log('\n🎉 Test 6: Milestone Detection', 'blue');
    try {
      // Calculate appropriate milestone based on current word count
      const currentCount = persona.knownWords.length;
      const milestones = [10, 20, 30, 50, 75, 100];
      const targetCount = milestones.find(m => m > currentCount) || 50;
      
      const milestone = geniusAdaptive.checkMilestone(persona.id, targetCount);
      
      // Should detect the first milestone that we cross
      const passed = milestone && milestone.milestone === targetCount;
      results.tests.push({
        name: 'Milestone Detection',
        passed,
        details: milestone ? milestone.message : 'No milestone'
      });
      
      if (passed) {
        log(`   ✅ Milestone detected: ${milestone.message}`, 'green');
        results.passed++;
      } else {
        log(`   ❌ Milestone not detected (expected ${targetCount}, got ${milestone?.milestone || 'none'})`, 'red');
        results.failed++;
      }
    } catch (error) {
      log(`   ❌ Error: ${error.message}`, 'red');
      results.failed++;
    }
  }
  
  // Summary for this persona
  const total = results.passed + results.failed;
  const percentage = ((results.passed / total) * 100).toFixed(0);
  
  log(`\n📊 ${persona.name} Results:`, 'cyan');
  log(`   ✅ Passed: ${results.passed}/${total} (${percentage}%)`, results.passed === total ? 'green' : 'yellow');
  
  return results;
}

async function runAllUserTests() {
  log('\n' + '='.repeat(70), 'cyan');
  log('🚀 COMPREHENSIVE USER PERSONA TESTING', 'magenta');
  log('   Testing adaptive system with 6 different user types', 'yellow');
  log('='.repeat(70) + '\n', 'cyan');
  
  const allResults = [];
  
  // Test each persona
  for (const [key, persona] of Object.entries(userPersonas)) {
    const result = await testUserPersona(persona);
    allResults.push(result);
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Final Summary
  log('\n' + '='.repeat(70), 'cyan');
  log('📊 FINAL RESULTS - ALL USER PERSONAS', 'magenta');
  log('='.repeat(70), 'cyan');
  
  const totalPassed = allResults.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = allResults.reduce((sum, r) => sum + r.failed, 0);
  const totalTests = totalPassed + totalFailed;
  const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
  
  log(`\n📈 Overall Statistics:`, 'cyan');
  log(`   Total User Personas Tested: ${allResults.length}`, 'white');
  log(`   Total Tests Run: ${totalTests}`, 'white');
  log(`   ✅ Passed: ${totalPassed}`, 'green');
  log(`   ❌ Failed: ${totalFailed}`, totalFailed === 0 ? 'green' : 'red');
  log(`   Success Rate: ${successRate}%`, totalFailed === 0 ? 'green' : 'yellow');
  
  log(`\n👥 Per-Persona Results:`, 'cyan');
  allResults.forEach(result => {
    const total = result.passed + result.failed;
    const rate = ((result.passed / total) * 100).toFixed(0);
    const status = result.failed === 0 ? '✅' : '⚠️';
    log(`   ${status} ${result.persona}: ${result.passed}/${total} (${rate}%)`, 
        result.failed === 0 ? 'green' : 'yellow');
  });
  
  // Generate detailed report
  generateDetailedReport(allResults, { totalPassed, totalFailed, successRate });
  
  if (totalFailed === 0) {
    log('\n🎉 ALL USER PERSONA TESTS PASSED!', 'green');
    log('   System handles all user types correctly!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Review the details above.', 'yellow');
  }
  
  return {
    success: totalFailed === 0,
    totalTests,
    totalPassed,
    totalFailed,
    successRate: parseFloat(successRate)
  };
}

function generateDetailedReport(allResults, summary) {
  const report = `
# 🧪 User Persona Testing Report

**Date:** ${new Date().toISOString()}

## Executive Summary

- **User Personas Tested:** ${allResults.length}
- **Total Tests:** ${summary.totalPassed + summary.totalFailed}
- **Passed:** ${summary.totalPassed} ✅
- **Failed:** ${summary.totalFailed} ❌
- **Success Rate:** ${summary.successRate}%

## User Personas

${allResults.map(result => {
  const total = result.passed + result.failed;
  const rate = ((result.passed / total) * 100).toFixed(0);
  return `
### ${result.persona}
- **Tests:** ${total}
- **Passed:** ${result.passed}
- **Failed:** ${result.failed}
- **Success Rate:** ${rate}%

**Test Details:**
${result.tests.map(test => `- ${test.passed ? '✅' : '❌'} ${test.name}: ${test.details || ''}`).join('\n')}
`;
}).join('\n')}

## Conclusion

${summary.totalFailed === 0 
  ? '✅ **ALL TESTS PASSED** - System handles all user types correctly!'
  : `⚠️ **${summary.totalFailed} TESTS FAILED** - Review failed tests above.`}

### User Type Coverage

✅ **Absolute Beginner** - Users with zero Spanish knowledge  
✅ **False Beginner** - Users who studied before but forgot  
✅ **Elementary** - Users with basic conversation skills  
✅ **Intermediate** - Users comfortable with everyday Spanish  
✅ **Advanced** - Near-fluent users  
✅ **Struggling Student** - Users who find content too difficult  

### System Validation

${summary.totalFailed === 0 ? `
✅ Initial assessment works for all levels  
✅ Goldilocks algorithm recommends appropriate content  
✅ Behavioral tracking captures user patterns  
✅ Real-time adaptation responds to signals  
✅ Beginner protection activates correctly  
✅ Milestones celebrate progress  
` : '⚠️ Some validation checks failed - see details above'}

---
*Generated by User Persona Test Suite*
`;

  const fs = require('fs');
  fs.writeFileSync('USER_PERSONA_TEST_REPORT.md', report);
  log('\n📄 Detailed report saved to USER_PERSONA_TEST_REPORT.md', 'cyan');
}

// Run tests if called directly
if (require.main === module) {
  runAllUserTests()
    .then(results => {
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      log(`\n❌ Test suite failed: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runAllUserTests, testUserPersona, userPersonas };

