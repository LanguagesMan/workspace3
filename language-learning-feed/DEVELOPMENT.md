# Development Guide

## Setup Instructions

### 1. Prerequisites

Ensure you have the following installed:

- **Node.js** 18+ and npm
- **PostgreSQL** 16+ 
- **Redis** 7+
- **Python** 3.11+
- **Docker & Docker Compose** (optional, recommended)

### 2. Environment Setup

#### Option A: Docker (Recommended for Quick Start)

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Check services are running
docker-compose ps
```

#### Option B: Local Installation

Install PostgreSQL and Redis using your preferred method:

**macOS (Homebrew):**
```bash
brew install postgresql@16 redis
brew services start postgresql@16
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql-16 redis-server
sudo systemctl start postgresql redis-server
```

### 3. Project Setup

```bash
# Install Node.js dependencies
npm install

# Set up environment variables
cp env.example .env.local

# Edit .env.local with your configuration
# At minimum, set DATABASE_URL:
# DATABASE_URL="postgresql://langfeed:langfeed_dev@localhost:5432/language_learning_feed"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# Seed with sample data
npm run db:seed

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 5. Python Microservices Setup

```bash
# Content Analyzer
cd services/content-analyzer
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m spacy download es_core_news_sm
cd ../..

# Recommender
cd services/recommender
pip install -r requirements.txt
cd ../..
```

### 6. Running the Application

#### Start All Services

**Terminal 1 - Next.js:**
```bash
npm run dev
```

**Terminal 2 - Content Analyzer:**
```bash
cd services/content-analyzer
python analyzer.py
```

**Terminal 3 - Recommender:**
```bash
cd services/recommender
python feed_algorithm.py
```

**Or use concurrently (experimental):**
```bash
npm run services:dev &
npm run dev
```

#### Access the Application

- **Frontend**: http://localhost:3000
- **Content Analyzer API**: http://localhost:8001/docs
- **Recommender API**: http://localhost:8002/docs
- **Prisma Studio**: http://localhost:5555 (when running `npm run db:studio`)

## Development Workflow

### Making Database Changes

1. Edit `prisma/schema.prisma`
2. Create migration: `npm run db:migrate`
3. Update seed data if needed: Edit `prisma/seed.ts`
4. Re-seed: `npm run db:seed`

### Testing API Endpoints

Use curl, Postman, or the built-in FastAPI docs:

**Feed API:**
```bash
curl "http://localhost:3000/api/feed?userId=demo-user-id&limit=5"
```

**Content Analyzer:**
```bash
curl -X POST "http://localhost:8001/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hola, ¿cómo estás? Me gusta aprender español.",
    "language": "es",
    "content_type": "article"
  }'
```

**Recommender:**
```bash
curl -X POST "http://localhost:8002/recommend" \
  -H "Content-Type: application/json" \
  -d @sample_recommendation_request.json
```

### Hot Reload

- **Next.js**: Auto-reloads on file changes
- **Python services**: Restart manually after changes (or use `uvicorn --reload`)

### Debugging

**Next.js:**
```bash
# Enable debug logging
DEBUG=* npm run dev
```

**Prisma:**
```bash
# Log all queries
# Add to .env.local:
# DATABASE_URL="postgresql://...?log=query"
```

**Python:**
```python
# Add logging in Python services
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Architecture Overview

### Frontend Flow

```
User → Feed Page → API Routes → Prisma → PostgreSQL
                ↓
            Zustand Store (client state)
                ↓
            FeedCard Components
```

### Backend Flow

```
API Route → Prisma Query → Business Logic → Response
    ↓
Redis Cache (for feed queue)
    ↓
Python Microservices (for heavy computation)
```

### Key Components

1. **Feed Generation** (`/api/feed/route.ts`)
   - Fetches user profile
   - Gets candidate content
   - Scores using recommendation algorithm
   - Caches result in Redis

2. **Interaction Tracking** (`/api/interaction/route.ts`)
   - Records user behavior
   - Updates content metrics
   - Adjusts user scores
   - Invalidates cache

3. **SRS System** (`/api/srs/route.ts`)
   - Schedules reviews using SM-2
   - Creates cards from content
   - Tracks performance

4. **Content Analyzer** (Python)
   - spaCy NLP processing
   - CEFR level classification
   - Word frequency analysis

5. **Recommender** (Python)
   - Multi-factor scoring
   - Difficulty matching
   - Personalization

## Common Tasks

### Adding a New Content Type

1. Add enum to `prisma/schema.prisma`:
   ```prisma
   enum ContentType {
     VIDEO
     ARTICLE
     PODCAST
     MUSIC
     IMAGE_AUDIO
     SOCIAL_POST
     YOUR_NEW_TYPE // Add here
   }
   ```

2. Run migration: `npm run db:migrate`

3. Create component in `components/`:
   ```tsx
   // YourNewTypePlayer.tsx
   export default function YourNewTypePlayer({ src }) {
     // Implementation
   }
   ```

4. Update `FeedCard.tsx` to render new type:
   ```tsx
   {item.type === 'YOUR_NEW_TYPE' && (
     <YourNewTypePlayer src={item.contentUrl} />
   )}
   ```

### Adding a New Language

1. Install spaCy model:
   ```bash
   cd services/content-analyzer
   python -m spacy download [language]_core_news_sm
   ```

2. Load model in `analyzer.py`:
   ```python
   nlp_models['fr'] = spacy.load('fr_core_news_sm')
   ```

3. Add CEFR word lists for language
4. Update UI to show language option

### Adjusting Recommendation Algorithm

Edit `services/recommender/feed_algorithm.py`:

```python
# Modify weights in generate_recommendations()
total_score = (
    difficulty_score * 0.40  # Adjust these
    + interest_score * 0.30
    + variety_score * 0.15
    + srs_score * 0.15
    + adaptive_bonus
)
```

### Modifying SRS Intervals

Edit `lib/srs-algorithm.ts`:

```typescript
// Change review intervals
if (repetitions === 1) {
  interval = 1  // First review after 1 day
} else if (repetitions === 2) {
  interval = 3  // Second review after 3 days
} else {
  interval = Math.ceil(interval * easeFactor)
}
```

## Performance Optimization

### Frontend

- Use `next/image` for thumbnails
- Implement virtual scrolling for long feeds
- Preload next 3 items in feed
- Lazy load components with `React.lazy()`

### Backend

- Cache feed queue in Redis (1 hour TTL)
- Index frequently queried fields in Prisma
- Use database connection pooling
- Batch API requests where possible

### Database

```sql
-- Add indexes for common queries
CREATE INDEX idx_content_language_level ON "Content" ("language", "cefrLevel");
CREATE INDEX idx_word_knowledge_user_confidence ON "WordKnowledge" ("userId", "confidenceScore");
CREATE INDEX idx_srs_next_review ON "SRSCard" ("userId", "nextReviewAt", "status");
```

## Testing

### Unit Tests (Coming Soon)

```bash
npm test
```

### Integration Tests (Coming Soon)

```bash
npm run test:e2e
```

### Manual Testing Checklist

- [ ] Swipe gestures work smoothly
- [ ] Content difficulty matches user level
- [ ] Word tooltips display correctly
- [ ] Progress updates in real-time
- [ ] Streak tracking works correctly
- [ ] SRS reviews appear naturally
- [ ] Video playback is smooth
- [ ] Mobile responsive design

## Troubleshooting

### "Cannot connect to database"

```bash
# Check PostgreSQL is running
docker-compose ps
# or
pg_isready -h localhost -p 5432

# Check DATABASE_URL in .env.local
cat .env.local | grep DATABASE_URL
```

### "Redis connection failed"

```bash
# Check Redis is running
docker-compose ps
# or
redis-cli ping  # Should respond with PONG

# Check REDIS_URL in .env.local
```

### "spaCy model not found"

```bash
cd services/content-analyzer
python -m spacy download en_core_web_sm
python -m spacy download es_core_news_sm
```

### "Prisma Client not generated"

```bash
npm run db:generate
```

### Feed not loading

1. Check all services are running
2. Check browser console for errors
3. Check API endpoint: `curl http://localhost:3000/api/feed?userId=demo-user-id`
4. Check microservices: 
   - `curl http://localhost:8001/health`
   - `curl http://localhost:8002/health`

## Production Deployment

### Environment Variables

Required for production:
```bash
DATABASE_URL=          # Production PostgreSQL
REDIS_URL=             # Production Redis
NEXTAUTH_SECRET=       # Random secret
OPENAI_API_KEY=        # For AI features
CONTENT_ANALYZER_URL=  # Deployed analyzer service
RECOMMENDER_URL=       # Deployed recommender service
```

### Build

```bash
npm run build
npm start
```

### Deployment Platforms

**Recommended:**
- **Frontend**: Vercel (optimized for Next.js)
- **Database**: Supabase or Railway (PostgreSQL)
- **Cache**: Upstash (Redis)
- **Python Services**: Railway, Render, or Google Cloud Run

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Submit pull request

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [spaCy Documentation](https://spacy.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

**Questions?** Open an issue on GitHub or check the main README.md


