# Environment Variables Setup

## Step 1: Create .env File

Copy and paste this into a new file called `.env` in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here

# Translation Service
LIBRETRANSLATE_API_URL=https://libretranslate.com

# Video Transcription
OPENAI_API_KEY=your_openai_key_here

# Article Scraping
FIRECRAWL_API_KEY=fc-5c92f42486554494b59214b4fc48a38b

# Server Configuration
NODE_ENV=development
PORT=3001
```

## Step 2: Fill in Your Keys

### Supabase Keys
1. Go to: https://app.supabase.com/project/_/settings/api
2. Copy "Project URL" → paste as `SUPABASE_URL`
3. Copy "anon public" key → paste as `SUPABASE_ANON_KEY`

### OpenAI Key (for Whisper transcription)
1. Go to: https://platform.openai.com/api-keys
2. Create new key
3. Copy key → paste as `OPENAI_API_KEY`

### Other Keys
- LibreTranslate: Already configured (free public API)
- Firecrawl: Already included in template

## Step 3: Restart Server

After creating .env file:
```bash
npm start
```

The app will automatically load environment variables.

