/**
 * 🧪 Test Translation Service
 * 
 * Tests real translations with LibreTranslate
 */

require('dotenv').config();
const translationService = require('../lib/translation-service');

async function testTranslations() {
    console.log('🧪 Testing Translation Service...\n');

    // Test Spanish words
    const testWords = [
        'hola',
        'gato',
        'casa',
        'hermoso',
        'rápido',
        'biblioteca',
        'computadora',
        'aprender',
        'feliz',
        'importante',
        'aunque',
        'traducir',
        'artículo',
        'dif ícil',
        'estudiante',
        'universidad',
        'experiencia',
        'conocimiento',
        'inteligente',
        'oportunidad'
    ];

    console.log(`Translating ${testWords.length} Spanish words...\n`);

    let successCount = 0;
    let failCount = 0;

    for (const word of testWords) {
        try {
            const translation = await translationService.translate(word, 'es', 'en');
            console.log(`✅ "${word}" → "${translation}"`);
            successCount++;
        } catch (error) {
            console.error(`❌ Failed to translate "${word}":`, error.message);
            failCount++;
        }
    }

    // Get cache stats
    const stats = await translationService.getCacheStats();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TRANSLATION TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}/${testWords.length}`);
    console.log(`❌ Failed: ${failCount}/${testWords.length}`);
    console.log(`💾 Cached in Supabase: ${stats.supabase_cached}`);
    console.log(`🧠 Cached in Memory: ${stats.memory_cached}`);
    console.log('='.repeat(60));

    if (successCount === testWords.length) {
        console.log('\n🎉 All translations successful!');
        return true;
    } else {
        console.log('\n⚠️  Some translations failed. Check API configuration.');
        return false;
    }
}

// Run test
testTranslations().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
});

