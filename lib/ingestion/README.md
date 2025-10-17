# 🎬 Content Ingestion Pipeline

Automated pipeline for ingesting Spanish learning content from multiple sources.

## 📋 Overview

The content ingestion system consists of 4 main components:

1. **Video Ingestion** (`video-ingestion.js`) - YouTube learning videos
2. **Article Ingestion** (`article-ingestion.js`) - RSS news feeds + Firecrawl
3. **Podcast Ingestion** (`podcast-ingestion.js`) - Audio podcasts + Whisper transcription
4. **Enrichment Layer** (`enrichment-pipeline.js`) - Vocabulary, CEFR tagging, questions

## 🚀 Quick Start

### Prerequisites

```bash
# Required environment variables
YOUTUBE_API_KEY=your_youtube_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
OPENAI_API_KEY=your_openai_api_key
INTERNAL_API_KEY=your_internal_api_key
```

### Manual Ingestion (CLI)

```bash
# Ingest videos (10 per channel)
node lib/ingestion/video-ingestion.js 10

# Ingest articles (5 per feed)
node lib/ingestion/article-ingestion.js 5

# Ingest podcasts (3 episodes per feed)
node lib/ingestion/podcast-ingestion.js 3

# Enrich content
node lib/ingestion/enrichment-pipeline.js 10 10 10
```

### API Ingestion

```bash
# Run full pipeline via API
curl -X POST http://localhost:3000/api/ingestion/run-all \
  -H "Authorization: Bearer $INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "videosPerChannel": 5,
    "articlesPerFeed": 5,
    "episodesPerFeed": 2,
    "enrichContent": true
  }'
```

### Automated (Nightly Cron)

Deploy the Supabase Edge Function:

```bash
# Deploy edge function
supabase functions deploy nightly-ingest

# Set environment variables
supabase secrets set CRON_SECRET=your_secret
supabase secrets set API_BASE_URL=https://your-api.com
supabase secrets set INTERNAL_API_KEY=your_key

# Create cron trigger (in Supabase Dashboard)
# Schedule: 0 2 * * * (2 AM daily)
# URL: https://[project].supabase.co/functions/v1/nightly-ingest
# Headers: Authorization: Bearer [cron_secret]
```

## 📊 Statistics

Get ingestion statistics:

```bash
curl http://localhost:3000/api/ingestion/stats
```

Response:
```json
{
  "success": true,
  "stats": {
    "videos": {
      "total": 150,
      "withTranscripts": 120,
      "byLevel": { "A1": 20, "A2": 45, "B1": 50, "B2": 35 }
    },
    "articles": {
      "total": 200,
      "withAudio": 50,
      "lastWeek": 45,
      "byLevel": { "B1": 60, "B2": 80, "C1": 60 }
    },
    "podcasts": {
      "totalPodcasts": 50,
      "transcribed": 48,
      "totalClips": 450,
      "avgClipsPerPodcast": 9.0
    }
  }
}
```

## 🎯 Content Sources

### YouTube Channels (Videos)
- Español con Juan (B1)
- Spanish Dict (A2)
- Butterfly Spanish (A2)
- Why Not Spanish (B1)
- Easy Spanish (A1)
- Dreaming Spanish (B1)
- SpanishPod101 (A2)

### RSS Feeds (Articles)
- BBC Mundo (B2)
- El País (C1)
- DW Español (B2)
- CNN en Español (B2)
- National Geographic en Español (C1)

### Podcast Feeds
- Notes in Spanish (B1)
- Coffee Break Spanish (A2)
- News in Slow Spanish (B2)
- Duolingo Spanish Podcast (B1)
- SpanishPod101 (A2)

## 🔧 Configuration

Edit `config/ingestion-config.js` to customize:

- Content sources (YouTube channels, RSS feeds, podcasts)
- Ingestion limits (videos per channel, articles per feed)
- Enrichment settings (vocabulary limit, question count)
- Schedule settings (cron expression, timezone)
- Rate limits (API delays)
- Storage settings (cache directory, cleanup)

## 📝 Enrichment Features

The enrichment pipeline adds:

1. **Vocabulary Lists** - Key words with CEFR levels and frequency
2. **Key Phrases** - Common expressions worth learning
3. **Comprehension Questions** - 5 multiple-choice questions per item
4. **Grammar Structures** - Identified verb tenses and patterns
5. **CEFR Metrics** - Detailed difficulty analysis
6. **Topics & Tags** - Categorization for filtering

## 🗄️ Database Tables

Content is stored in:

- `YouTubeVideo` - Educational videos from YouTube
- `Article` - News articles with simplified/advanced variants
- `Podcast` - Full podcast episodes
- `PodcastClip` - 30-90 second segments of episodes
- `ingestion_logs` - Pipeline execution history

## 🐛 Troubleshooting

### No videos being ingested
- Check `YOUTUBE_API_KEY` is set correctly
- Verify YouTube Data API v3 is enabled
- Check quota limits: https://console.cloud.google.com/apis/dashboard

### Article scraping fails
- Verify `FIRECRAWL_API_KEY` is valid
- Check Firecrawl quota: https://www.firecrawl.dev/dashboard
- Some sites may be behind paywalls (expected)

### Podcast transcription fails
- Ensure `OPENAI_API_KEY` has Whisper access
- Check audio file size (max 200 MB)
- Verify audio format is supported (mp3, m4a, wav)

### Enrichment not working
- Check `OPENAI_API_KEY` for GPT-4 access
- Ensure Spanish frequency data exists: `data/spanish-frequency-10k.json`

## 📈 Performance

Typical ingestion times:
- Videos: ~5s per video (with transcript)
- Articles: ~10s per article (with Firecrawl + AI)
- Podcasts: ~2-3 minutes per episode (download + transcribe + segment)
- Enrichment: ~5s per item (with GPT-4)

Full nightly run (~50 items): **15-20 minutes**

## 🔒 Security

- Use `INTERNAL_API_KEY` to protect ingestion endpoints
- Set `CRON_SECRET` for Supabase Edge Function authentication
- Store all API keys in `.env` file (never commit)
- Rate limiting prevents API quota exhaustion

## 📚 Further Reading

- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Firecrawl Documentation](https://docs.firecrawl.dev/)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## 🎉 Success Metrics

After running the pipeline, you should have:
- 100+ Spanish videos with transcripts
- 50+ articles with difficulty variants
- 20+ podcast episodes clipped into 200+ segments
- All content enriched with vocabulary and questions
- Nightly automated ingestion operational


