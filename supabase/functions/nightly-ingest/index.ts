/**
 * 🌙 NIGHTLY CONTENT INGESTION
 * 
 * Supabase Edge Function that runs nightly to:
 * 1. Ingest new videos from YouTube
 * 2. Scrape new articles from RSS feeds
 * 3. Download and transcribe new podcasts
 * 4. Enrich all new content with vocabulary and questions
 * 5. Send summary report
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface IngestionConfig {
  videosPerChannel?: number;
  articlesPerFeed?: number;
  episodesPerFeed?: number;
  enrichContent?: boolean;
}

interface IngestionResult {
  videos: {
    total: number;
    ingested: number;
    skipped: number;
    failed: number;
  };
  articles: {
    total: number;
    ingested: number;
    skipped: number;
    failed: number;
  };
  podcasts: {
    total: number;
    ingested: number;
    clips: number;
    failed: number;
  };
  enrichment?: {
    processed: number;
    failed: number;
  };
  duration: number;
  timestamp: string;
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify authorization (cron secret or API key)
    const authHeader = req.headers.get('Authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const config: IngestionConfig = await req.json().catch(() => ({}));
    
    const startTime = Date.now();
    console.log('🌙 Starting nightly content ingestion...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const result: IngestionResult = {
      videos: { total: 0, ingested: 0, skipped: 0, failed: 0 },
      articles: { total: 0, ingested: 0, skipped: 0, failed: 0 },
      podcasts: { total: 0, ingested: 0, clips: 0, failed: 0 },
      duration: 0,
      timestamp: new Date().toISOString()
    };

    // 1. Ingest YouTube Videos
    console.log('📺 Starting video ingestion...');
    try {
      const videoResult = await ingestVideos(config.videosPerChannel || 5);
      result.videos = videoResult;
      console.log(`   ✅ Videos: ${videoResult.ingested} ingested`);
    } catch (error) {
      console.error('   ❌ Video ingestion failed:', error);
      result.videos.failed = 1;
    }

    // 2. Ingest Articles
    console.log('📰 Starting article ingestion...');
    try {
      const articleResult = await ingestArticles(config.articlesPerFeed || 5);
      result.articles = articleResult;
      console.log(`   ✅ Articles: ${articleResult.ingested} ingested`);
    } catch (error) {
      console.error('   ❌ Article ingestion failed:', error);
      result.articles.failed = 1;
    }

    // 3. Ingest Podcasts
    console.log('🎙️ Starting podcast ingestion...');
    try {
      const podcastResult = await ingestPodcasts(config.episodesPerFeed || 2);
      result.podcasts = podcastResult;
      console.log(`   ✅ Podcasts: ${podcastResult.ingested} episodes, ${podcastResult.clips} clips`);
    } catch (error) {
      console.error('   ❌ Podcast ingestion failed:', error);
      result.podcasts.failed = 1;
    }

    // 4. Enrich Content (if enabled)
    if (config.enrichContent !== false) {
      console.log('🎯 Starting content enrichment...');
      try {
        const enrichmentResult = await enrichContent(result);
        result.enrichment = enrichmentResult;
        console.log(`   ✅ Enriched: ${enrichmentResult.processed} items`);
      } catch (error) {
        console.error('   ❌ Enrichment failed:', error);
        result.enrichment = { processed: 0, failed: 1 };
      }
    }

    // Calculate duration
    result.duration = Date.now() - startTime;

    // 5. Store ingestion log
    await storeIngestionLog(supabase, result);

    // 6. Send summary (if configured)
    if (Deno.env.get('SEND_SUMMARY_EMAIL') === 'true') {
      await sendSummaryEmail(result);
    }

    console.log(`\n✅ Nightly ingestion complete in ${(result.duration / 1000).toFixed(1)}s`);
    console.log(`   📺 Videos: ${result.videos.ingested}`);
    console.log(`   📰 Articles: ${result.articles.ingested}`);
    console.log(`   🎙️ Podcasts: ${result.podcasts.ingested} (${result.podcasts.clips} clips)`);
    if (result.enrichment) {
      console.log(`   🎯 Enriched: ${result.enrichment.processed}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        result,
        message: 'Nightly ingestion completed successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Ingest YouTube videos by calling the ingestion API
 */
async function ingestVideos(videosPerChannel: number) {
  const apiUrl = Deno.env.get('API_BASE_URL') || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${apiUrl}/api/ingestion/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('INTERNAL_API_KEY')}`
      },
      body: JSON.stringify({ videosPerChannel })
    });

    if (!response.ok) {
      throw new Error(`Video ingestion failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      total: data.totalIngested + data.totalSkipped,
      ingested: data.totalIngested,
      skipped: data.totalSkipped,
      failed: 0
    };

  } catch (error) {
    console.error('Error calling video ingestion API:', error);
    return { total: 0, ingested: 0, skipped: 0, failed: 1 };
  }
}

/**
 * Ingest articles by calling the ingestion API
 */
async function ingestArticles(articlesPerFeed: number) {
  const apiUrl = Deno.env.get('API_BASE_URL') || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${apiUrl}/api/ingestion/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('INTERNAL_API_KEY')}`
      },
      body: JSON.stringify({ articlesPerFeed })
    });

    if (!response.ok) {
      throw new Error(`Article ingestion failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      total: data.totalIngested + data.totalSkipped + data.totalFailed,
      ingested: data.totalIngested,
      skipped: data.totalSkipped,
      failed: data.totalFailed
    };

  } catch (error) {
    console.error('Error calling article ingestion API:', error);
    return { total: 0, ingested: 0, skipped: 0, failed: 1 };
  }
}

/**
 * Ingest podcasts by calling the ingestion API
 */
async function ingestPodcasts(episodesPerFeed: number) {
  const apiUrl = Deno.env.get('API_BASE_URL') || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${apiUrl}/api/ingestion/podcasts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('INTERNAL_API_KEY')}`
      },
      body: JSON.stringify({ episodesPerFeed })
    });

    if (!response.ok) {
      throw new Error(`Podcast ingestion failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      total: data.totalIngested + data.totalSkipped + data.totalFailed,
      ingested: data.totalIngested,
      clips: data.totalClips || 0,
      failed: data.totalFailed
    };

  } catch (error) {
    console.error('Error calling podcast ingestion API:', error);
    return { total: 0, ingested: 0, clips: 0, failed: 1 };
  }
}

/**
 * Enrich newly ingested content
 */
async function enrichContent(result: IngestionResult) {
  const apiUrl = Deno.env.get('API_BASE_URL') || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${apiUrl}/api/ingestion/enrich`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('INTERNAL_API_KEY')}`
      },
      body: JSON.stringify({
        articles: result.articles.ingested,
        videos: result.videos.ingested,
        clips: result.podcasts.clips
      })
    });

    if (!response.ok) {
      throw new Error(`Enrichment failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      processed: data.totalProcessed || 0,
      failed: data.totalFailed || 0
    };

  } catch (error) {
    console.error('Error calling enrichment API:', error);
    return { processed: 0, failed: 1 };
  }
}

/**
 * Store ingestion log in database
 */
async function storeIngestionLog(supabase: any, result: IngestionResult) {
  try {
    await supabase
      .from('ingestion_logs')
      .insert({
        timestamp: result.timestamp,
        videos_ingested: result.videos.ingested,
        articles_ingested: result.articles.ingested,
        podcasts_ingested: result.podcasts.ingested,
        clips_created: result.podcasts.clips,
        items_enriched: result.enrichment?.processed || 0,
        duration_ms: result.duration,
        success: true,
        details: result
      });
  } catch (error) {
    console.error('Failed to store ingestion log:', error);
  }
}

/**
 * Send summary email (placeholder)
 */
async function sendSummaryEmail(result: IngestionResult) {
  // Would integrate with email service (SendGrid, Resend, etc.)
  console.log('📧 Summary email would be sent here');
  console.log(JSON.stringify(result, null, 2));
}


