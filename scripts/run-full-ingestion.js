/**
 * 🚀 RUN FULL CONTENT INGESTION
 * 
 * Runs the complete ingestion pipeline with production settings
 */

require('dotenv').config();

const videoIngestion = require('../lib/ingestion/video-ingestion');
const articleIngestion = require('../lib/ingestion/article-ingestion');
const podcastIngestion = require('../lib/ingestion/podcast-ingestion');
const enrichmentPipeline = require('../lib/ingestion/enrichment-pipeline');

// Configuration (can be overridden with command line args)
const config = {
    videosPerChannel: parseInt(process.argv[2]) || 10,
    articlesPerFeed: parseInt(process.argv[3]) || 10,
    episodesPerFeed: parseInt(process.argv[4]) || 3,
    enrichContent: process.argv[5] !== 'false'
};

async function runFullIngestion() {
    console.log('🚀 STARTING FULL CONTENT INGESTION PIPELINE\n');
    console.log('Configuration:');
    console.log(`  - Videos per channel: ${config.videosPerChannel}`);
    console.log(`  - Articles per feed: ${config.articlesPerFeed}`);
    console.log(`  - Podcast episodes per feed: ${config.episodesPerFeed}`);
    console.log(`  - Enrich content: ${config.enrichContent}\n`);

    const startTime = Date.now();
    const results = {};

    // 1. Video Ingestion
    try {
        console.log('=' .repeat(70));
        console.log('PHASE 1: VIDEO INGESTION');
        console.log('=' .repeat(70));
        results.videos = await videoIngestion.ingestAll(config.videosPerChannel);
        console.log(`\n✅ Videos: ${results.videos.totalIngested} ingested, ${results.videos.totalSkipped} skipped`);
    } catch (error) {
        console.error(`\n❌ Video ingestion failed:`, error);
        results.videos = { success: false, error: error.message };
    }

    await sleep(3000);

    // 2. Article Ingestion
    try {
        console.log('\n' + '=' .repeat(70));
        console.log('PHASE 2: ARTICLE INGESTION');
        console.log('=' .repeat(70));
        results.articles = await articleIngestion.ingestAll(config.articlesPerFeed);
        console.log(`\n✅ Articles: ${results.articles.totalIngested} ingested, ${results.articles.totalSkipped} skipped`);
    } catch (error) {
        console.error(`\n❌ Article ingestion failed:`, error);
        results.articles = { success: false, error: error.message };
    }

    await sleep(3000);

    // 3. Podcast Ingestion
    try {
        console.log('\n' + '=' .repeat(70));
        console.log('PHASE 3: PODCAST INGESTION');
        console.log('=' .repeat(70));
        results.podcasts = await podcastIngestion.ingestAll(config.episodesPerFeed);
        console.log(`\n✅ Podcasts: ${results.podcasts.totalIngested} episodes, ${results.podcasts.totalClips} clips`);
    } catch (error) {
        console.error(`\n❌ Podcast ingestion failed:`, error);
        results.podcasts = { success: false, error: error.message };
    }

    await sleep(3000);

    // 4. Content Enrichment
    if (config.enrichContent) {
        try {
            console.log('\n' + '=' .repeat(70));
            console.log('PHASE 4: CONTENT ENRICHMENT');
            console.log('=' .repeat(70));
            
            const enrichLimits = {
                articles: results.articles?.totalIngested || 10,
                videos: results.videos?.totalIngested || 10,
                clips: results.podcasts?.totalClips || 10
            };
            
            results.enrichment = await enrichmentPipeline.enrichAll(enrichLimits);
            console.log(`\n✅ Enrichment: ${results.enrichment.totalProcessed} items enriched`);
        } catch (error) {
            console.error(`\n❌ Enrichment failed:`, error);
            results.enrichment = { success: false, error: error.message };
        }
    }

    // Calculate duration
    const duration = Date.now() - startTime;
    const durationMinutes = (duration / 1000 / 60).toFixed(1);

    // Print final summary
    console.log('\n' + '=' .repeat(70));
    console.log('🎉 INGESTION PIPELINE COMPLETE');
    console.log('=' .repeat(70));
    console.log(`\nDuration: ${durationMinutes} minutes\n`);
    
    console.log('📊 RESULTS SUMMARY:');
    console.log('-' .repeat(70));
    
    if (results.videos) {
        console.log(`📺 Videos: ${results.videos.totalIngested || 0} ingested`);
    }
    if (results.articles) {
        console.log(`📰 Articles: ${results.articles.totalIngested || 0} ingested`);
    }
    if (results.podcasts) {
        console.log(`🎙️ Podcasts: ${results.podcasts.totalIngested || 0} episodes (${results.podcasts.totalClips || 0} clips)`);
    }
    if (results.enrichment) {
        console.log(`🎯 Enriched: ${results.enrichment.totalProcessed || 0} items`);
    }
    
    const totalIngested = (results.videos?.totalIngested || 0) + 
                          (results.articles?.totalIngested || 0) + 
                          (results.podcasts?.totalIngested || 0);
    
    console.log('-' .repeat(70));
    console.log(`\n📈 Total Content Items: ${totalIngested}`);
    console.log(`⏱️  Average Time per Item: ${(duration / totalIngested / 1000).toFixed(1)}s\n`);

    // Print next steps
    console.log('=' .repeat(70));
    console.log('NEXT STEPS:');
    console.log('=' .repeat(70));
    console.log('1. View stats: curl http://localhost:3000/api/ingestion/stats');
    console.log('2. Set up nightly cron: See lib/ingestion/README.md');
    console.log('3. Configure content sources: Edit config/ingestion-config.js');
    console.log('4. Deploy Edge Function: supabase functions deploy nightly-ingest\n');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run ingestion
runFullIngestion()
    .then(() => {
        console.log('✅ Ingestion completed successfully\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
    });


