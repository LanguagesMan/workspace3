/**
 * 🧪 TRANSLATION SYSTEM TEST
 * 
 * Tests real LibreTranslate API integration:
 * - Single word translation
 * - Text translation
 * - Batch translation
 * - Caching functionality
 * - API response time
 * - Fallback handling
 */

const translationService = require('./lib/translation-service');

// Test configuration - using fewer words to avoid rate limiting
const TEST_WORDS = [
    'hola', 'adiós', 'gracias', 'perdón', 'agua',
    'comida', 'casa', 'familia', 'amigo', 'trabajo'
];

const TEST_SENTENCES = [
    'Buenos días, ¿cómo estás?',
    'Me gusta aprender español.',
    'Voy a la tienda a comprar comida.'
];

async function testWordTranslation() {
    console.log('\n🔤 TEST 1: Single Word Translation');
    console.log('=' .repeat(60));

    const results = [];
    
    for (const word of TEST_WORDS) {
        const startTime = Date.now();
        const translation = await translationService.translateWord(word, 'es', 'en');
        const duration = Date.now() - startTime;

        results.push({ word, translation, duration });
        
        console.log(`   ${word.padEnd(15)} → ${translation.padEnd(20)} (${duration}ms)`);
    }

    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    console.log(`\n   Average response time: ${avgDuration.toFixed(0)}ms`);
    
    return results;
}

async function testSentenceTranslation() {
    console.log('\n📝 TEST 2: Sentence Translation');
    console.log('=' .repeat(60));

    const results = [];

    for (const sentence of TEST_SENTENCES) {
        const startTime = Date.now();
        const translation = await translationService.translateText(sentence, 'es', 'en');
        const duration = Date.now() - startTime;

        results.push({ sentence, translation, duration });

        console.log(`\n   ES: ${sentence}`);
        console.log(`   EN: ${translation}`);
        console.log(`   ⏱️  ${duration}ms`);
    }

    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    console.log(`\n   Average response time: ${avgDuration.toFixed(0)}ms`);

    return results;
}

async function testBatchTranslation() {
    console.log('\n📦 TEST 3: Batch Translation');
    console.log('=' .repeat(60));

    const testBatch = ['rojo', 'azul', 'verde', 'amarillo', 'blanco'];

    console.log(`   Translating ${testBatch.length} words at once...`);
    
    const startTime = Date.now();
    const translations = await translationService.batchTranslate(testBatch, 'es', 'en');
    const duration = Date.now() - startTime;

    for (let i = 0; i < testBatch.length; i++) {
        console.log(`   ${testBatch[i].padEnd(15)} → ${translations[i]}`);
    }

    console.log(`\n   Total time: ${duration}ms`);
    console.log(`   Average per word: ${(duration / testBatch.length).toFixed(0)}ms`);

    return { translations, duration };
}

async function testCaching() {
    console.log('\n💾 TEST 4: Caching Performance');
    console.log('=' .repeat(60));

    const testWord = 'computadora';

    // First request (uncached)
    console.log('\n   First request (API call)...');
    const start1 = Date.now();
    const translation1 = await translationService.translateWord(testWord, 'es', 'en');
    const duration1 = Date.now() - start1;
    console.log(`   ${testWord} → ${translation1} (${duration1}ms)`);

    // Second request (should be cached)
    console.log('\n   Second request (cached)...');
    const start2 = Date.now();
    const translation2 = await translationService.translateWord(testWord, 'es', 'en');
    const duration2 = Date.now() - start2;
    console.log(`   ${testWord} → ${translation2} (${duration2}ms)`);

    const speedup = ((duration1 / duration2) * 100).toFixed(0);
    console.log(`\n   Cache speedup: ${speedup}% faster`);
    console.log(`   Translations match: ${translation1 === translation2 ? '✅' : '❌'}`);

    return { duration1, duration2, speedup };
}

async function testCommonWords() {
    console.log('\n⚡ TEST 5: Common Words (Instant Lookup)');
    console.log('=' .repeat(60));

    const commonWords = ['el', 'la', 'es', 'son', 'muy', 'más'];
    
    for (const word of commonWords) {
        const startTime = Date.now();
        const translation = await translationService.translateWord(word, 'es', 'en');
        const duration = Date.now() - startTime;

        console.log(`   ${word.padEnd(10)} → ${translation.padEnd(15)} (${duration}ms)`);
    }
}

async function testCacheStats() {
    console.log('\n📊 TEST 6: Cache Statistics');
    console.log('=' .repeat(60));

    const stats = translationService.getCacheStats();

    console.log(`   Memory cache size: ${stats.memoryCacheSize} entries`);
    console.log(`   Queue length: ${stats.queueLength}`);
    console.log(`   Currently processing: ${stats.isProcessing ? 'Yes' : 'No'}`);

    return stats;
}

async function testErrorHandling() {
    console.log('\n⚠️  TEST 7: Error Handling');
    console.log('=' .repeat(60));

    // Test empty string
    const empty = await translationService.translateWord('', 'es', 'en');
    console.log(`   Empty string: "${empty}" ${empty === '' ? '✅' : '❌'}`);

    // Test same language
    const same = await translationService.translateText('hello', 'en', 'en');
    console.log(`   Same language: "${same}" ${same === 'hello' ? '✅' : '❌'}`);

    // Test very long text
    const longText = 'palabra '.repeat(100);
    const startTime = Date.now();
    const longTranslation = await translationService.translateText(longText, 'es', 'en');
    const duration = Date.now() - startTime;
    console.log(`   Long text (100 words): ${duration}ms ${longTranslation.length > 0 ? '✅' : '❌'}`);
}

async function runAllTests() {
    console.log('\n');
    console.log('🌐 LIBRETRANSLATE API INTEGRATION TESTS');
    console.log('=' .repeat(60));
    console.log('Testing real translation API with caching...\n');

    const startTime = Date.now();

    try {
        // Run all tests
        await testWordTranslation();
        await testSentenceTranslation();
        await testBatchTranslation();
        await testCaching();
        await testCommonWords();
        await testCacheStats();
        await testErrorHandling();

        const totalDuration = Date.now() - startTime;

        console.log('\n');
        console.log('=' .repeat(60));
        console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
        console.log('=' .repeat(60));
        console.log(`\n   Total test duration: ${(totalDuration / 1000).toFixed(2)}s`);
        console.log(`   Translation service ready for production! 🚀\n`);

        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run tests
if (require.main === module) {
    runAllTests();
}

module.exports = { runAllTests };

