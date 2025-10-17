/**
 * Final Firecrawl Integration Test
 */

require('dotenv').config();
const firecrawlScraper = require('./lib/firecrawl-scraper');

const TEST_URLS = [
    'https://www.bbc.com/mundo',
    'https://elpais.com',
    'https://www.20minutos.es/'
];

async function runTests() {
    console.log('🔥 FIRECRAWL INTEGRATION TEST\n');
    console.log('================================\n');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < TEST_URLS.length; i++) {
        const url = TEST_URLS[i];
        console.log(`\n📝 Test ${i + 1}: ${url}`);
        
        try {
            const result = await firecrawlScraper.scrapeArticle(url);
            
            if (result && result.fullText && result.fullText.length > 100) {
                console.log(`✅ SUCCESS - Scraped ${result.fullText.length} chars`);
                console.log(`   📊 Images found: ${result.images.length}`);
                console.log(`   📅 Metadata: ${result.metadata.title || 'No title'}`);
                successCount++;
            } else {
                console.log('❌ FAILED - Insufficient content');
                failCount++;
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
            failCount++;
        }
    }

    console.log('\n\n📊 FINAL RESULTS');
    console.log('================');
    console.log(`✅ Successful: ${successCount}/${TEST_URLS.length}`);
    console.log(`❌ Failed: ${failCount}/${TEST_URLS.length}`);
    console.log(`📈 Success rate: ${Math.round((successCount / TEST_URLS.length) * 100)}%`);

    const queueStats = firecrawlScraper.getQueueStats();
    console.log(`\n🚀 Queue Status: ${queueStats.queued} queued, processing: ${queueStats.processing}`);

    console.log('\n✅ All tests completed!');
    process.exit(successCount > 0 ? 0 : 1);
}

runTests();

