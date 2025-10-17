# 🚀 Backend Integration Setup Guide

Complete guide for setting up the backend with Supabase integration on the `agent-1-backend` branch.

## ✅ Completed Tasks

- [x] Created `.env.example` with all required environment variables
- [x] Updated `lib/supabase-client.js` to load environment variables with dotenv
- [x] Created `supabase/migrations/create_articles_table.sql` for articles caching
- [x] Created `scripts/apply-supabase-migrations.js` for migration validation
- [x] Updated `lib/articles-feed-api.js` to store articles in Supabase
- [x] Created `scripts/test-backend-integration.js` for testing

## 📋 Setup Instructions

### 1. Create `.env` File

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` and fill in your actual credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_from_supabase
LIBRETRANSLATE_API_URL=https://libretranslate.com
NODE_ENV=development
PORT=3000
```

**Get your Supabase credentials:**
1. Go to https://app.supabase.com
2. Select your project (or create a new one)
3. Go to Settings > API
4. Copy `Project URL` → `SUPABASE_URL`
5. Copy `anon public` key → `SUPABASE_ANON_KEY`

### 2. Run Supabase Migrations

#### Option A: Using Supabase Dashboard (Easiest)

1. Go to https://app.supabase.com/project/YOUR_PROJECT/sql
2. Open `supabase/migrations/add_user_preferences.sql`
3. Copy the entire SQL and paste in SQL Editor
4. Click "Run"
5. Repeat for `supabase/migrations/create_articles_table.sql`

#### Option B: Using Supabase CLI (Recommended for production)

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
npx supabase db push
```

#### Option C: Validate with our script

```bash
node scripts/apply-supabase-migrations.js
```

This will check if tables exist and guide you through manual migration if needed.

### 3. Verify Database Schema

After running migrations, you should have these tables:
- `user_preferences` - User personalization settings
- `user_content_interactions` - Behavioral tracking
- `user_collections` - User playlists and favorites
- `articles` - Cached articles with metadata

### 4. Test the Integration

Run the comprehensive test suite:

```bash
node scripts/test-backend-integration.js
```

This will test:
- ✅ Environment variables are loaded
- ✅ Supabase connection works
- ✅ Database tables exist
- ✅ API endpoints respond correctly
- ✅ Database CRUD operations work

### 5. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## 🔌 API Endpoints

### GET `/api/articles/feed`

Get personalized articles feed.

**Query Parameters:**
- `userId` - User ID (default: 'guest')
- `category` - Category filter: 'all', 'news', 'sports', 'technology', etc.
- `limit` - Number of articles (default: 20)
- `difficulty` - CEFR level: 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
- `withAnalysis` - Include difficulty analysis (default: true)
- `includeTranslations` - Include English translations (default: true)

**Example:**
```bash
curl "http://localhost:3000/api/articles/feed?userId=user123&category=technology&limit=10"
```

**Response:**
```json
{
  "success": true,
  "articles": [
    {
      "id": "el-pais-123",
      "title": "Artículo de ejemplo",
      "titleEnglish": "Example Article",
      "content": "...",
      "excerpt": "...",
      "source": "El País",
      "category": "technology",
      "difficulty": "B2",
      "image": "https://...",
      "publishedAt": "2025-10-15T10:00:00Z",
      "readTime": "5 min"
    }
  ],
  "count": 10,
  "userId": "user123",
  "category": "technology"
}
```

### POST `/api/articles/analyze`

Analyze article difficulty and comprehension.

**Request Body:**
```json
{
  "articleText": "Hola, ¿cómo estás? Esta es una prueba.",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "cefrLevel": "A2",
    "readingTime": "2 min",
    "wordCount": 150,
    "difficulty": {
      "vocabulary": 0.3,
      "grammar": 0.4,
      "overall": 0.35
    }
  },
  "comprehension": {
    "expectedComprehension": 0.85,
    "recommendedForUser": true
  }
}
```

### POST `/api/articles/clear-cache`

Clear article cache (both memory and database).

**Response:**
```json
{
  "success": true,
  "message": "Articles cache cleared"
}
```

## 🔄 How It Works

### Article Caching Flow

1. **First Request**: Fetch articles from RSS sources
   - Fetches from multiple Spanish news sources (El País, BBC Mundo, etc.)
   - Analyzes difficulty for each article
   - Stores in Supabase `articles` table
   - Returns personalized feed

2. **Subsequent Requests**: Use cached articles
   - Checks Supabase for articles from last 24 hours
   - Filters by category and difficulty
   - Returns immediately without fetching

3. **Cache Expiration**:
   - Articles older than 24 hours are fetched fresh
   - Articles older than 7 days are automatically deleted
   - Manual cache clear via `/api/articles/clear-cache`

### Database Schema

**`articles` table:**
```sql
- id (TEXT, PRIMARY KEY)
- title, title_english
- content, content_english
- excerpt, excerpt_english
- source, source_url, article_url
- category, difficulty
- image_url
- analysis (JSONB) - Full difficulty analysis
- author, published_at, fetch_time
- read_time, keywords, verified
- view_count, like_count, save_count
```

## 🧪 Testing Checklist

Run through this checklist to verify everything works:

- [ ] `.env` file exists with real Supabase credentials
- [ ] All migrations run successfully
- [ ] `node scripts/test-backend-integration.js` passes all tests
- [ ] Server starts without errors: `npm start`
- [ ] Can fetch articles: `curl http://localhost:3000/api/articles/feed`
- [ ] Articles are cached in Supabase (check dashboard)
- [ ] Can analyze article: `curl -X POST http://localhost:3000/api/articles/analyze -H "Content-Type: application/json" -d '{"articleText":"Hola mundo"}'`

## 🎯 Success Criteria

Your backend is ready when:

1. ✅ All environment variables are set (not placeholders)
2. ✅ Supabase connection works
3. ✅ All database tables exist
4. ✅ `GET /api/articles/feed` returns articles
5. ✅ `POST /api/articles/analyze` analyzes text
6. ✅ Articles are stored in database
7. ✅ Cached articles are retrieved on subsequent requests

## 🚨 Troubleshooting

### Issue: "Supabase credentials not found"

**Solution:** Make sure `.env` file exists and has real credentials (not placeholders).

```bash
cp .env.example .env
# Edit .env with real credentials
```

### Issue: "Table does not exist"

**Solution:** Run migrations in Supabase dashboard.

1. Go to SQL Editor
2. Copy SQL from `supabase/migrations/*.sql`
3. Run each migration

### Issue: "Server not running" during tests

**Solution:** Start the server first.

```bash
npm start
# In another terminal:
node scripts/test-backend-integration.js
```

### Issue: "No articles returned"

**Solution:** This is normal on first run. The API will:
1. Fetch from RSS sources (takes ~10-30 seconds)
2. Store in database
3. Return results

Try again after 30 seconds. Subsequent requests will be instant.

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [RSS Parser](https://www.npmjs.com/package/rss-parser)
- [LibreTranslate](https://libretranslate.com/)

## 🎉 Next Steps

Once backend is working:

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: integrate Supabase backend with article caching"
   git push origin agent-1-backend
   ```

2. **Create Pull Request** to merge into main

3. **Deploy to production** with environment variables set

4. **Monitor** article cache and database performance

---

**Branch:** `agent-1-backend`  
**Estimated Setup Time:** 15-30 minutes  
**Prerequisites:** Supabase account, Node.js 18+

