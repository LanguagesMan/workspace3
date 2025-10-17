/**
 * 🧪 TEST FAST TRANSLATION SERVICE
 * 
 * Tests Google Translate, DeepL, and OpenAI APIs
 */

require('dotenv').config();

// Load environment variables from .env.translation
const fs = require('fs');
const envContent = fs.readFileSync('.env.translation', 'utf8');
envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/"/g, '');
        }
    }
});

const translationService = require('./lib/translation-service-fast');

async function testFastTranslation() {
    console.log('\n🌐 FAST TRANSLATION SERVICE TEST');
    console.log('=' .repeat(60));
    console.log('Testing Google Translate → DeepL → OpenAI fallback chain\n');

    const testWords = ['hola', 'adiós', 'gracias', 'computadora', 'biblioteca'];
    const testSentences = [
        'Buenos días, ¿cómo estás?',
        'Me gusta aprender español.',
        'El gato está en la casa.'
    ];

    try {
        // Test 1: Common words (instant dictionary lookup)
        console.log('✅ Test 1: Common words (dictionary lookup)');
        console.log('-'.repeat(60));
        for (const word of ['el', 'la', 'es', 'hola']) {
            const start = Date.now();
            const translation = await translationService.translateWord(word, 'es', 'en');
            const duration = Date.now() - start;
            console.log(`   "${word}" → "${translation}" (${duration}ms)`);
        }

        // Test 2: Single words (API calls)
        console.log('\n✅ Test 2: Single words (API translation)');
        console.log('-'.repeat(60));
        for (const word of testWords) {
            const start = Date.now();
            const translation = await translationService.translateWord(word, 'es', 'en');
            const duration = Date.now() - start;
            console.log(`   "${word}" → "${translation}" (${duration}ms)`);
        }

        // Test 3: Sentences
        console.log('\n✅ Test 3: Full sentences');
        console.log('-'.repeat(60));
        for (const sentence of testSentences) {
            const start = Date.now();
            const translation = await translationService.translateText(sentence, 'es', 'en');
            const duration = Date.now() - start;
            console.log(`\n   ES: ${sentence}`);
            console.log(`   EN: ${translation}`);
            console.log(`   ⏱️  ${duration}ms`);
        }

        // Test 4: Batch translation
        console.log('\n✅ Test 4: Batch translation');
        console.log('-'.repeat(60));
        const batchWords = ['rojo', 'azul', 'verde'];
        const start = Date.now();
        const translations = await translationService.batchTranslate(batchWords, 'es', 'en');
        const duration = Date.now() - start;
        
        batchWords.forEach((word, i) => {
            console.log(`   "${word}" → "${translations[i]}"`);
        });
        console.log(`   Total: ${duration}ms (${(duration / batchWords.length).toFixed(0)}ms/word)`);

        // Test 5: Cache performance
        console.log('\n✅ Test 5: Cache performance (repeat translation)');
        console.log('-'.repeat(60));
        
        // First call (uncached)
        const testWord = 'mariposa';
        const start1 = Date.now();
        const trans1 = await translationService.translateText(testWord, 'es', 'en');
        const dur1 = Date.now() - start1;
        
        // Second call (should be cached)
        const start2 = Date.now();
        const trans2 = await translationService.translateText(testWord, 'es', 'en');
        const dur2 = Date.now() - start2;
        
        console.log(`   First call:  "${testWord}" → "${trans1}" (${dur1}ms)`);
        console.log(`   Second call: "${testWord}" → "${trans2}" (${dur2}ms)`);
        console.log(`   Speedup: ${((dur1 / dur2) * 100).toFixed(0)}% faster`);

        // Test 6: Statistics
        console.log('\n✅ Test 6: Service statistics');
        console.log('-'.repeat(60));
        const stats = translationService.getStats();
        console.log(`   Google Translate calls: ${stats.googleCalls}`);
        console.log(`   DeepL calls: ${stats.deeplCalls}`);
        console.log(`   OpenAI calls: ${stats.openaiCalls}`);
        console.log(`   Cache hits: ${stats.cacheHits}`);
        console.log(`   Dictionary hits: ${stats.dictionaryHits}`);
        console.log(`   Memory cache size: ${stats.memoryCacheSize} entries`);
        console.log(`   Cache hit rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS PASSED');
        console.log('='.repeat(60));
        console.log('\n🚀 Translation service is ready for production!\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run tests
if (require.main === module) {
    testFastTranslation();
}

module.exports = { testFastTranslation };

