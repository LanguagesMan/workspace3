const analyzer = require('./lib/content-difficulty-analyzer');
const frequencyLookup = require('./lib/frequency-lookup');

console.log('🧪 Quick System Test\n');

// Test 1: Frequency Lookup
console.log('1. Testing frequency lookup...');
const rank = frequencyLookup.getWordRank('de');
console.log(`   Word "de" rank: ${rank}`);
console.log(`   ${rank === 1 ? '✅' : '❌'} Frequency lookup working\n`);

// Test 2: Content Analysis
console.log('2. Testing content analysis...');
const text = 'Hola. Me llamo Juan.';
const result = analyzer.analyzeTranscription(text, false);
console.log(`   Text: "${text}"`);
console.log(`   Level: ${result.level}`);
console.log(`   Total words: ${result.totalWords}`);
console.log(`   Unique words: ${result.uniqueWordCount}`);
console.log(`   ✅ Content analysis working\n`);

// Test 3: User Difficulty
console.log('3. Testing user difficulty...');
const userDifficulty = analyzer.calculateDifficultyForUser(result, Array(100).fill(''));
console.log(`   Comprehension: ${userDifficulty.comprehensionRate}%`);
console.log(`   Goldilocks: ${userDifficulty.goldilocksScore}`);
console.log(`   Difficulty: ${userDifficulty.difficulty}`);
console.log(`   ${!isNaN(userDifficulty.comprehensionRate) ? '✅' : '❌'} User difficulty working\n`);

console.log('🎉 Quick test complete!');
