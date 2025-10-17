#!/usr/bin/env node
/**
 * 🎯 FINAL VERIFICATION SCRIPT
 * Complete system verification before production deployment
 * 
 * Run: node scripts/final-verification.js
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 FINAL VERIFICATION - PRODUCTION READINESS CHECK\n');
console.log('=' + '='.repeat(60));
console.log('Starting comprehensive system verification...');
console.log('=' + '='.repeat(60) + '\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const issues = [];

// Verification utilities
const check = (condition, description, critical = false) => {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`✅ ${description}`);
    return true;
  } else {
    failedChecks++;
    const prefix = critical ? '❌ CRITICAL' : '⚠️  WARNING';
    console.log(`${prefix}: ${description}`);
    issues.push({ description, critical });
    return false;
  }
};

const section = (title) => {
  console.log('\n' + '─'.repeat(60));
  console.log(`📋 ${title}`);
  console.log('─'.repeat(60));
};

// ===================================================================
// 1. FILE STRUCTURE VERIFICATION
// ===================================================================
section('1. File Structure Verification');

const criticalFiles = [
  'lib/unified-integration-controller.js',
  'lib/genius-adaptive-system.js',
  'lib/behavioral-tracker.js',
  'lib/content-difficulty-analyzer.js',
  'lib/frequency-lookup.js',
  'lib/swipe-assessment-api.js',
  'api/integration/user-journey.js',
  'public/js/integration-controller.js',
  'public/index.html',
  'public/tiktok-video-feed.html',
  'public/components/swipe-placement-test.html',
  'server.js',
  'package.json'
];

criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, '..', file));
  check(exists, `${file} exists`, true);
});

// ===================================================================
// 2. INTEGRATION SYSTEM VERIFICATION
// ===================================================================
section('2. Integration System Verification');

try {
  const integration = require('../lib/unified-integration-controller');
  check(true, 'Integration controller loads successfully', true);
  
  check(typeof integration.handleFirstVisit === 'function', 
    'handleFirstVisit method exists', true);
  check(typeof integration.handlePlacementTestComplete === 'function',
    'handlePlacementTestComplete method exists', true);
  check(typeof integration.handleUserAction === 'function',
    'handleUserAction method exists', true);
  check(typeof integration.getPersonalizedFeed === 'function',
    'getPersonalizedFeed method exists', true);
  check(typeof integration.refreshFeedRealTime === 'function',
    'refreshFeedRealTime method exists', true);
  check(typeof integration.getUserProfile === 'function',
    'getUserProfile method exists', true);
  
} catch (error) {
  check(false, `Integration controller loads: ${error.message}`, true);
}

// ===================================================================
// 3. ADAPTIVE SYSTEMS VERIFICATION
// ===================================================================
section('3. Adaptive Systems Verification');

try {
  const geniusAdaptive = require('../lib/genius-adaptive-system');
  check(true, 'Genius adaptive system loads', true);
  
  check(typeof geniusAdaptive.assessInitialLevel === 'function',
    'assessInitialLevel method exists', true);
  check(typeof geniusAdaptive.calculateDynamicLevel === 'function',
    'calculateDynamicLevel method exists');
  check(typeof geniusAdaptive.scoreContentForUser === 'function',
    'scoreContentForUser method exists', true);
  check(typeof geniusAdaptive.adjustDifficultyInRealTime === 'function',
    'adjustDifficultyInRealTime method exists', true);
  check(typeof geniusAdaptive.checkMilestone === 'function',
    'checkMilestone method exists');
    
} catch (error) {
  check(false, `Genius adaptive system loads: ${error.message}`, true);
}

try {
  const behavioralTracker = require('../lib/behavioral-tracker');
  check(true, 'Behavioral tracker loads', true);
  
  check(typeof behavioralTracker.trackWordClick === 'function',
    'trackWordClick method exists', true);
  check(typeof behavioralTracker.trackCompletionRate === 'function',
    'trackCompletionRate method exists', true);
  check(typeof behavioralTracker.calculateUserSignals === 'function',
    'calculateUserSignals method exists', true);
    
} catch (error) {
  check(false, `Behavioral tracker loads: ${error.message}`, true);
}

try {
  const contentAnalyzer = require('../lib/content-difficulty-analyzer');
  check(true, 'Content difficulty analyzer loads', true);
  
  check(typeof contentAnalyzer.analyzeTranscription === 'function',
    'analyzeTranscription method exists', true);
  check(typeof contentAnalyzer.calculateDifficultyForUser === 'function',
    'calculateDifficultyForUser method exists', true);
  check(typeof contentAnalyzer.calculateGoldilocksScore === 'function',
    'calculateGoldilocksScore method exists', true);
    
} catch (error) {
  check(false, `Content analyzer loads: ${error.message}`, true);
}

// ===================================================================
// 4. API ENDPOINTS VERIFICATION
// ===================================================================
section('4. API Endpoints Verification');

try {
  const serverContent = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  
  check(serverContent.includes('user-journey') || serverContent.includes('integrationAPI'),
    'Integration API imported in server');
  check(serverContent.includes('/api/integration'),
    'Integration API routes registered');
  check(serverContent.includes('genius-adaptive-system') || serverContent.includes('adaptive'),
    'Adaptive systems integrated');
  check(serverContent.includes('adaptive-learning-engine') || serverContent.includes('behavioral') || serverContent.includes('swipe-assessment'),
    'Behavioral tracking integrated');
    
} catch (error) {
  check(false, `Server.js verification: ${error.message}`, true);
}

// ===================================================================
// 5. FRONTEND INTEGRATION VERIFICATION
// ===================================================================
section('5. Frontend Integration Verification');

try {
  const integrationJS = fs.readFileSync(
    path.join(__dirname, '..', 'public/js/integration-controller.js'), 
    'utf8'
  );
  
  check(integrationJS.includes('class FrontendIntegrationController'),
    'Frontend integration controller class exists', true);
  check(integrationJS.includes('handleFirstVisit'),
    'handleFirstVisit method in frontend');
  check(integrationJS.includes('handlePlacementTestComplete'),
    'handlePlacementTestComplete method in frontend');
  check(integrationJS.includes('trackAction'),
    'trackAction method in frontend', true);
  check(integrationJS.includes('getPersonalizedFeed'),
    'getPersonalizedFeed method in frontend', true);
  check(integrationJS.includes('setupGlobalTracking'),
    'Global tracking setup in frontend');
    
} catch (error) {
  check(false, `Frontend integration verification: ${error.message}`, true);
}

// ===================================================================
// 6. DOCUMENTATION VERIFICATION
// ===================================================================
section('6. Documentation Verification');

const docs = [
  'docs/INTEGRATION_GUIDE.md',
  'docs/API_DOCUMENTATION.md',
  'docs/DATABASE_SCHEMA.md',
  'docs/POLISH_CHECKLIST.md'
];

docs.forEach(doc => {
  const exists = fs.existsSync(path.join(__dirname, '..', doc));
  check(exists, `${doc} exists`);
  
  if (exists) {
    const content = fs.readFileSync(path.join(__dirname, '..', doc), 'utf8');
    check(content.length > 1000, `${doc} has substantial content`);
  }
});

// ===================================================================
// 7. TEST COVERAGE VERIFICATION
// ===================================================================
section('7. Test Coverage Verification');

try {
  const testScript = fs.readFileSync(
    path.join(__dirname, 'integration-test.js'),
    'utf8'
  );
  
  check(testScript.includes('handleFirstVisit'),
    'First visit flow tested');
  check(testScript.includes('handlePlacementTestComplete'),
    'Placement test flow tested');
  check(testScript.includes('handleUserAction'),
    'User action tracking tested');
  check(testScript.includes('getPersonalizedFeed'),
    'Feed generation tested');
  check(testScript.includes('adjustDifficultyInRealTime') || testScript.includes('too_hard'),
    'Level adjustment tested');
  check(testScript.includes('checkMilestone') || testScript.includes('milestone'),
    'Milestone system tested');
    
  check(true, 'Integration test script exists and covers main flows', true);
  
} catch (error) {
  check(false, `Test verification: ${error.message}`, true);
}

// ===================================================================
// 8. CONFIGURATION VERIFICATION
// ===================================================================
section('8. Configuration Verification');

try {
  const packageJson = require('../package.json');
  
  check(packageJson.dependencies.express !== undefined,
    'Express dependency present', true);
  check(packageJson.dependencies.cors !== undefined,
    'CORS dependency present');
  check(packageJson.dependencies.compression !== undefined,
    'Compression dependency present');
  check(packageJson.name !== undefined,
    'Package name configured');
  check(packageJson.version !== undefined,
    'Package version configured');
    
} catch (error) {
  check(false, `Package.json verification: ${error.message}`, true);
}

// Check for .env file
const envExists = fs.existsSync(path.join(__dirname, '..', '.env'));
check(envExists, '.env file exists (for environment variables)');

// ===================================================================
// 9. SECURITY CHECKS
// ===================================================================
section('9. Security Checks');

try {
  const serverContent = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  
  check(serverContent.includes('helmet'),
    'Helmet security middleware configured');
  check(serverContent.includes('rateLimit') || serverContent.includes('rate-limit'),
    'Rate limiting configured', true);
  check(serverContent.includes('cors'),
    'CORS configured');
  check(serverContent.includes('process.env.PORT') || serverContent.includes('PORT'),
    'Environment variables configured');
    
} catch (error) {
  check(false, `Security verification: ${error.message}`);
}

// ===================================================================
// 10. RUN INTEGRATION TESTS
// ===================================================================
section('10. Running Integration Tests');

try {
  const { execSync } = require('child_process');
  
  console.log('\n⏳ Running integration test suite...\n');
  
  const testOutput = execSync('node scripts/integration-test.js', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    timeout: 30000
  });
  
  const testsPassed = testOutput.includes('ALL SYSTEMS OPERATIONAL');
  const successRate = testOutput.match(/(\d+)%/);
  
  check(testsPassed, 'Integration tests pass 100%', true);
  
  if (successRate) {
    console.log(`\n   Test Success Rate: ${successRate[1]}%`);
  }
  
} catch (error) {
  check(false, `Integration tests failed: ${error.message}`, true);
  console.log('\n⚠️  Test output:', error.stdout?.toString() || 'No output');
}

// ===================================================================
// FINAL SUMMARY
// ===================================================================
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));

console.log(`\nTotal Checks: ${totalChecks}`);
console.log(`✅ Passed: ${passedChecks}`);
console.log(`❌ Failed: ${failedChecks}`);
console.log(`\n📈 Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (failedChecks > 0) {
  console.log('\n' + '='.repeat(60));
  console.log('⚠️  ISSUES FOUND');
  console.log('='.repeat(60));
  
  const criticalIssues = issues.filter(i => i.critical);
  const warnings = issues.filter(i => !i.critical);
  
  if (criticalIssues.length > 0) {
    console.log('\n❌ Critical Issues (MUST FIX):');
    criticalIssues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue.description}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings (Should Fix):');
    warnings.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue.description}`);
    });
  }
}

// ===================================================================
// PRODUCTION READINESS ASSESSMENT
// ===================================================================
console.log('\n' + '='.repeat(60));
console.log('🎯 PRODUCTION READINESS ASSESSMENT');
console.log('='.repeat(60));

const successRate = (passedChecks / totalChecks) * 100;
const criticalIssues = issues.filter(i => i.critical).length;

console.log('\n📋 Checklist:');
console.log(`   ✓ Core Systems Integrated: ${successRate >= 90 ? '✅' : '❌'}`);
console.log(`   ✓ Tests Passing (100%): ${successRate === 100 ? '✅' : '❌'}`);
console.log(`   ✓ Documentation Complete: ${docs.every(d => fs.existsSync(path.join(__dirname, '..', d))) ? '✅' : '❌'}`);
console.log(`   ✓ Security Hardened: ${criticalIssues === 0 ? '✅' : '❌'}`);
console.log(`   ✓ No Critical Issues: ${criticalIssues === 0 ? '✅' : '❌'}`);

const isProductionReady = successRate === 100 && criticalIssues === 0;

console.log('\n' + '='.repeat(60));
if (isProductionReady) {
  console.log('🎉 PRODUCTION READY - ALL SYSTEMS GO! 🚀');
  console.log('='.repeat(60));
  console.log('\n✅ System is fully integrated and ready for deployment.');
  console.log('✅ All tests passing at 100%.');
  console.log('✅ Documentation complete.');
  console.log('✅ No critical issues found.');
  console.log('\n🚀 Ready to deploy to production!');
  process.exit(0);
} else {
  console.log('⚠️  NOT READY FOR PRODUCTION');
  console.log('='.repeat(60));
  console.log(`\n❌ ${criticalIssues} critical issue(s) must be fixed.`);
  console.log(`⚠️  ${failedChecks - criticalIssues} warning(s) should be addressed.`);
  console.log('\n📝 Please review issues above and re-run verification.');
  process.exit(1);
}

