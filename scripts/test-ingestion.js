/**
 * 🧪 TEST INGESTION PIPELINE
 * 
 * Tests all ingestion components with small batches
 */

require('dotenv').config();

async function testIngestionPipeline() {
    console.log('🧪 TESTING CONTENT INGESTION PIPELINE\n');
    console.log('This will test with minimal content (1-2 items per source)\n');

    const results = {
        videos: null,
        articles: null,
        podcasts: null,
        enrichment: null
    };

    // Check required environment variables
    console.log('📋 Checking environment variables...\n');
    
    const requiredVars = {
        'YOUTUBE_API_KEY': process.env.YOUTUBE_API_KEY,
        'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
        'FIRECRAWL_API_KEY': process.env.FIRECRAWL_API_KEY
    };

    let missingVars = false;
    for (const [name, value] of Object.entries(requiredVars)) {
        if (!value) {
            console.log(`   ❌ ${name} - MISSING`);
            missingVars = true;
        } else {
            console.log(`   ✅ ${name} - ${value.substring(0, 10)}...`);
        }
    }

    if (missingVars) {
        console.log('\n❌ Missing required environment variables!');
        console.log('   Copy .env.ingestion.template to .env and add your API keys\n');
        process.exit(1);
    }

    console.log('\n✅ All required environment variables found!\n');

    // Test video ingestion
    console.log('=' .repeat(60));
    console.log('TEST 1: VIDEO INGESTION');
    console.log('=' .repeat(60));
    try {
        const videoIngestion = require('../lib/ingestion/video-ingestion');
        results.videos = await videoIngestion.ingestAll(2); // 2 videos per channel
        
        if (results.videos.success) {
            console.log('\n✅ Video ingestion test PASSED');
            console.log(`   Ingested: ${results.videos.totalIngested} videos`);
        }
    } catch (error) {
        console.error('\n❌ Video ingestion test FAILED:', error.message);
        results.videos = { success: false, error: error.message };
    }

    // Wait 2 seconds between tests
    await sleep(2000);

    // Test article ingestion
    console.log('\n' + '=' .repeat(60));
    console.log('TEST 2: ARTICLE INGESTION');
    console.log('=' .repeat(60));
    try {
        const articleIngestion = require('../lib/ingestion/article-ingestion');
        results.articles = await articleIngestion.ingestAll(2); // 2 articles per feed
        
        if (results.articles.success) {
            console.log('\n✅ Article ingestion test PASSED');
            console.log(`   Ingested: ${results.articles.totalIngested} articles`);
        }
    } catch (error) {
        console.error('\n❌ Article ingestion test FAILED:', error.message);
        results.articles = { success: false, error: error.message };
    }

    // Wait 2 seconds
    await sleep(2000);

    // Test podcast ingestion
    console.log('\n' + '=' .repeat(60));
    console.log('TEST 3: PODCAST INGESTION');
    console.log('=' .repeat(60));
    try {
        const podcastIngestion = require('../lib/ingestion/podcast-ingestion');
        results.podcasts = await podcastIngestion.ingestAll(1); // 1 episode per feed
        
        if (results.podcasts.success) {
            console.log('\n✅ Podcast ingestion test PASSED');
            console.log(`   Ingested: ${results.podcasts.totalIngested} episodes`);
            console.log(`   Created: ${results.podcasts.totalClips} clips`);
        }
    } catch (error) {
        console.error('\n❌ Podcast ingestion test FAILED:', error.message);
        results.podcasts = { success: false, error: error.message };
    }

    // Wait 2 seconds
    await sleep(2000);

    // Test enrichment
    console.log('\n' + '=' .repeat(60));
    console.log('TEST 4: CONTENT ENRICHMENT');
    console.log('=' .repeat(60));
    try {
        const enrichmentPipeline = require('../lib/ingestion/enrichment-pipeline');
        results.enrichment = await enrichmentPipeline.enrichAll({
            articles: 2,
            videos: 2,
            clips: 2
        });
        
        if (results.enrichment.success) {
            console.log('\n✅ Enrichment test PASSED');
            console.log(`   Enriched: ${results.enrichment.totalProcessed} items`);
        }
    } catch (error) {
        console.error('\n❌ Enrichment test FAILED:', error.message);
        results.enrichment = { success: false, error: error.message };
    }

    // Print summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));

    const tests = [
        { name: 'Video Ingestion', result: results.videos },
        { name: 'Article Ingestion', result: results.articles },
        { name: 'Podcast Ingestion', result: results.podcasts },
        { name: 'Content Enrichment', result: results.enrichment }
    ];

    let passed = 0;
    let failed = 0;

    tests.forEach(test => {
        const status = test.result?.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${test.name}`);
        
        if (test.result?.success) {
            passed++;
        } else {
            failed++;
            if (test.result?.error) {
                console.log(`          Error: ${test.result.error}`);
            }
        }
    });

    console.log('\n' + '-' .repeat(60));
    console.log(`Total: ${passed} passed, ${failed} failed`);
    console.log('-' .repeat(60));

    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Content ingestion pipeline is working correctly.\n');
        console.log('Next steps:');
        console.log('  1. Run full ingestion: npm run ingest-all');
        console.log('  2. Set up nightly cron: See lib/ingestion/README.md');
        console.log('  3. Deploy Edge Function: supabase functions deploy nightly-ingest\n');
        process.exit(0);
    } else {
        console.log('\n⚠️  SOME TESTS FAILED. Review the errors above.\n');
        console.log('Common issues:');
        console.log('  - Invalid API keys');
        console.log('  - API rate limits exceeded');
        console.log('  - Network connectivity issues');
        console.log('  - Missing dependencies\n');
        process.exit(1);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
testIngestionPipeline().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});


