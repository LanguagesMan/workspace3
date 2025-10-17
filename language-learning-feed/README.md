# LangFlow - Revolutionary Language Learning Feed

> Learn languages through content you actually enjoy. No boring lessons. Just swipe, watch, and become fluent naturally.

## 🚀 The Vision

LangFlow transforms language learning from a chore into an addiction by hijacking the same dopamine loops as TikTok/Instagram, but every swipe advances your language proficiency. Users don't "study" - they consume content they actually want to see, algorithmically calibrated to their exact comprehension level.

### Core Innovation

- **i+1 Principle**: Content is automatically matched to 96% known words, 4% new words
- **Invisible SRS**: Spaced repetition disguised as engaging content
- **Zero Cognitive Load**: Just swipe - no decisions, no planning
- **Natural Acquisition**: Learn like a baby - through context, not translation
- **Adaptive Difficulty**: AI secretly adjusts as you improve

## 📊 Expected Results

- **40%+ Daily retention** (vs. Duolingo's ~15%)
- **20+ minute sessions** (vs. traditional apps ~5 min)
- **80% word retention** after 30 days (vs. typical ~30%)
- **6 months to fluency** (vs. traditional 2-3 years)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + PostgreSQL + Redis
- **Microservices**: Python (FastAPI) for NLP and recommendations
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis

### System Components

1. **Feed Engine** - TikTok-style infinite scroll with gesture controls
2. **Content Analyzer** - spaCy-based difficulty analysis and CEFR classification
3. **Recommendation System** - Multi-factor ranking algorithm
4. **SRS Integration** - SuperMemo SM-2 algorithm
5. **Progress Tracking** - Gamification with streaks, XP, and celebrations

## 🎯 Key Features

### Feed Interface
- Vertical swipe navigation (TikTok-style)
- Interactive word tooltips (tap for instant translation)
- Auto-difficulty matching
- Preloading for instant content switching
- Support for videos, articles, podcasts, music

### Learning Mechanics
- **Comprehensible Input**: Always at perfect difficulty level
- **Contextual Learning**: Words learned in meaningful context
- **Forgiveness Curve**: Mistakes don't reset progress
- **Natural Immersion**: No explicit "lessons"

### Gamification
- Streak tracking with freeze power-ups
- XP system with level progression
- Celebration animations for milestones
- "Minutes immersed" instead of "minutes studied"

### Content Types
- YouTube videos with subtitles
- News articles (simplified to user level)
- Music with synchronized lyrics
- Podcasts (chunked into segments)
- Social media posts
- AI-generated personalized content

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- Redis 7+
- Python 3.11+
- Docker & Docker Compose (optional)

### Quick Start with Docker

```bash
# Clone the repository
git clone <repo-url>
cd language-learning-feed

# Start all services
docker-compose up -d

# Install Node dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your API keys

# Run database migrations
npx prisma migrate dev

# Seed initial data
npx prisma db seed

# Start Next.js dev server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Manual Setup

```bash
# Install Node dependencies
npm install

# Start PostgreSQL and Redis
# (Use your preferred method)

# Set up Prisma
npx prisma generate
npx prisma migrate dev

# Install Python dependencies for microservices
cd services/content-analyzer
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m spacy download es_core_news_sm

cd ../recommender
pip install -r requirements.txt

# Start microservices (in separate terminals)
cd services/content-analyzer
python analyzer.py

cd services/recommender
python feed_algorithm.py

# Start Next.js (in main directory)
npm run dev
```

## 📁 Project Structure

```
language-learning-feed/
├── app/
│   ├── api/
│   │   ├── feed/          # Feed generation endpoint
│   │   ├── interaction/   # Interaction tracking
│   │   └── srs/          # SRS review system
│   ├── feed/             # Main feed page
│   ├── onboarding/       # First-time user experience
│   └── page.tsx          # Landing page
├── components/
│   ├── FeedCard.tsx      # Content card with gestures
│   ├── VideoPlayer.tsx   # Optimized video playback
│   ├── WordTooltip.tsx   # Interactive translations
│   └── ProgressDashboard.tsx  # Gamification UI
├── lib/
│   ├── prisma.ts         # Database client
│   ├── redis.ts          # Cache client
│   ├── srs-algorithm.ts  # SM-2 implementation
│   └── store.ts          # Global state management
├── services/
│   ├── content-analyzer/ # Python NLP service
│   └── recommender/      # Python recommendation engine
├── prisma/
│   └── schema.prisma     # Database schema
└── docker-compose.yml    # Local development stack
```

## 🎮 How It Works

### For Users

1. **Onboarding**: Select language and level (or start from scratch)
2. **Feed**: Swipe through content perfectly matched to your level
3. **Interaction**: 
   - Swipe up: Next (mark as seen)
   - Swipe down: Previous
   - Swipe left: Too hard (adjust algorithm)
   - Swipe right: Save words to learn
   - Double tap: Like
4. **Learning**: Words are learned naturally through context
5. **Review**: SRS reviews appear as regular content (invisible)

### Under the Hood

1. **Content Ingestion**: 
   - Videos, articles, podcasts pulled from various sources
   - Transcribed and analyzed for difficulty
   - Tagged with CEFR level and topics

2. **User Profiling**:
   - Track every interaction (time spent, lookups, completion)
   - Build word knowledge map (confidence scores)
   - Infer comprehension from behavior

3. **Feed Generation**:
   - Multi-factor ranking (difficulty, interest, variety, SRS)
   - Real-time adaptation based on performance
   - Cache personalized queue in Redis

4. **SRS Integration**:
   - Words due for review trigger matching content
   - Post-content quiz (feels like TikTok sticker)
   - SM-2 algorithm with forgiveness curve

## 🧠 The Science

### Comprehensible Input Theory (Krashen)
Content is calibrated to i+1: just beyond current level, but still comprehensible.

### Spaced Repetition (SuperMemo SM-2)
Optimal review intervals for long-term retention.

### Natural Language Acquisition
Mimics how children learn: context over translation, immersion over study.

### Dopamine-Driven Engagement
Same psychological hooks as social media, but productive.

## 🔮 Future Enhancements

- [ ] AI content generation (custom videos at your level)
- [ ] Live conversation practice with AI
- [ ] Community features (guilds, challenges)
- [ ] Speech recognition for pronunciation practice
- [ ] Offline mode with downloaded content
- [ ] Multi-language support (polyglot mode)
- [ ] Integration with actual language teachers
- [ ] Browser extension for learning on any site

## 📊 API Documentation

### Feed API
```typescript
GET /api/feed?userId=xxx&limit=10&offset=0
// Returns personalized content feed
```

### Interaction API
```typescript
POST /api/interaction
{
  userId, contentId, interactionType,
  timeSpentSeconds, completionRate, wordsLookedUp
}
// Tracks user interaction and updates algorithm
```

### SRS API
```typescript
GET /api/srs?userId=xxx
// Returns cards due for review

POST /api/srs
{ cardId, correct, responseTimeMs }
// Processes review and schedules next
```

## 🤝 Contributing

This is a revolutionary approach to language learning. Contributions welcome!

Areas needing work:
- Content ingestion pipelines (YouTube, Spotify, news APIs)
- CEFR word frequency databases (comprehensive lists)
- UI/UX improvements for mobile
- Performance optimizations
- Additional language support

## 📄 License

MIT License - Build amazing things!

## 🌟 Why This Will Succeed

1. **Removes Friction**: No lesson planning - just open and swipe
2. **Leverages Addiction**: Same dopamine hits as social media
3. **Scientifically Grounded**: SRS + comprehensible input + immersion
4. **Personalized at Scale**: AI creates unique learning path
5. **Content Abundance**: Never runs out of interesting material
6. **Natural Acquisition**: Context over translation

---

**Built with 💜 by developers who believe language learning should be addictive, not tedious.**
