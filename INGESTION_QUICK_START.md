# 🚀 Content Ingestion - Quick Start Guide

Get the automated content pipeline running in 5 minutes.

## Step 1: Get API Keys (5 minutes)

### YouTube Data API
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create project → Enable APIs → YouTube Data API v3
3. Create credentials → API Key
4. Copy the key

### OpenAI API
1. Go to: https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the key

### Firecrawl API
1. Go to: https://www.firecrawl.dev/
2. Sign up for free tier
3. Get API key from dashboard
4. Copy the key

## Step 2: Setup Environment (1 minute)

```bash
# Copy template
cp .env.ingestion.template .env

# Edit .env and add your keys:
YOUTUBE_API_KEY=your_youtube_key_here
OPENAI_API_KEY=your_openai_key_here
FIRECRAWL_API_KEY=your_firecrawl_key_here

# Generate secure internal key:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Add to .env:
INTERNAL_API_KEY=the_generated_key_above
```

## Step 3: Test Installation (2 minutes)

```bash
# Install dependencies (if not already done)
npm install

# Run test with minimal content (2-3 items per source)
npm run ingest:test
```

Expected output:
```
✅ PASS - Video Ingestion
✅ PASS - Article Ingestion  
✅ PASS - Podcast Ingestion
✅ PASS - Content Enrichment

🎉 ALL TESTS PASSED!
```

## Step 4: Run First Ingestion (15 minutes)

```bash
# Run full pipeline with default settings
# (10 videos/channel, 10 articles/feed, 3 podcasts/feed)
npm run ingest:all
```

This will:
- Ingest ~70 YouTube videos
- Scrape ~60 news articles
- Download & transcribe ~18 podcast episodes
- Create ~200 podcast clips
- Enrich all content with vocabulary & questions

## Step 5: Verify Results

```bash
# Check statistics
curl http://localhost:3000/api/ingestion/stats
```

You should see:
```json
{
  "videos": { "total": 70+ },
  "articles": { "total": 60+ },
  "podcasts": { "totalClips": 200+ }
}
```

---

## 🎯 Common Commands

```bash
# Test with minimal content
npm run ingest:test

# Run individual pipelines
npm run ingest:videos 5       # 5 videos per channel
npm run ingest:articles 3     # 3 articles per feed  
npm run ingest:podcasts 1     # 1 episode per feed

# Enrich existing content
npm run ingest:enrich 10 10 10  # articles, videos, clips

# Run complete pipeline
npm run ingest:all

# Custom amounts
npm run ingest:all 5 5 2  # videos/channel, articles/feed, episodes/feed
```

---

## 🌙 Set Up Nightly Automation (Optional)

### Option A: Supabase Edge Function (Recommended)

```bash
# 1. Deploy function
supabase functions deploy nightly-ingest

# 2. Set secrets
supabase secrets set CRON_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
supabase secrets set API_BASE_URL=https://your-api.com
supabase secrets set INTERNAL_API_KEY=your_key

# 3. Create cron trigger in Supabase Dashboard:
#    - Schedule: 0 2 * * * (2 AM daily)
#    - URL: https://[project].supabase.co/functions/v1/nightly-ingest
#    - Headers: Authorization: Bearer [CRON_SECRET]
```

### Option B: Server Cron Job

```bash
# Add to crontab:
crontab -e

# Run at 2 AM daily:
0 2 * * * cd /path/to/workspace3 && npm run ingest:all >> /var/log/ingestion.log 2>&1
```

---

## 📊 Dashboard

View ingestion stats in your app:
```
http://localhost:3000/api/ingestion/stats
```

---

## 🆘 Troubleshooting

### Test fails with "YOUTUBE_API_KEY missing"
→ Make sure .env file exists and has the key

### "Quota exceeded" error
→ YouTube free tier: 10,000 units/day (1 video = ~5 units)
→ Reduce videos per channel or wait 24 hours

### Article scraping fails
→ Some sites have paywalls (expected)
→ Firecrawl free tier: 500 pages/month

### Podcast transcription slow
→ Whisper processes ~1 minute of audio per 5 seconds
→ 20-minute episode = ~2 minutes to transcribe

---

## 🎉 Success!

If you see all green checkmarks, you're ready to:

1. ✅ Run full ingestion: `npm run ingest:all`
2. ✅ Set up nightly automation
3. ✅ Start building your learning app!

Your database now contains:
- 📺 100+ Spanish learning videos
- 📰 50+ news articles with translations  
- 🎙️ 200+ podcast clips
- 🎯 All enriched with vocabulary & questions

---

## 📚 Learn More

- Full documentation: `lib/ingestion/README.md`
- API reference: `AGENT_2_INGESTION_COMPLETE.md`
- Configuration: `config/ingestion-config.js`

---

**Need help?** Check the README files or review the code - it's well-commented!


