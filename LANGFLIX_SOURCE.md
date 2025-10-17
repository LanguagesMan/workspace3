# 🎬 LANGFLIX - Complete Language Learning Platform
## Source of Truth Documentation

**Version:** 1.0.0  
**Last Updated:** October 16, 2025  
**Status:** In Development - Core Features Implemented  

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Environment Variables](#environment-variables)
6. [Content Strategy](#content-strategy)
7. [A1 Translation Constraints](#a1-translation-constraints)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)
10. [Implementation Status](#implementation-status)

---

## 🎯 System Overview

Langflix is a TikTok-style language learning platform that provides personalized, engaging Spanish content through:
- **Video Feed**: 825+ videos with dual-language transcriptions
- **Articles Feed**: Curated Spanish articles with clickable translations
- **🎙️ AI Voice Conversation Partner** (GENIUS FEATURE): Talk with an AI that uses YOUR vocabulary
- **Podcasts**: Segmented podcast clips with transcripts (planned)
- **Music**: Spanish songs with synchronized lyrics (planned)
- **AI-Generated Content**: Personalized stories, conversations, and lessons
- **Quizzes & Games**: Interactive learning activities
- **Spaced Repetition**: SM-2 algorithm for vocabulary retention
- **Adaptive Learning**: Content matched to user's exact CEFR level

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL (Neon) - Primary database
- Prisma ORM - Database management
- Supabase - Authentication & real-time features

**Frontend:**
- Vanilla JavaScript (no framework)
- HTML5 + CSS3
- Service Worker for offline support (planned)

**AI/ML Services:**
- OpenAI GPT-4 - Content generation, translations
- OpenAI Whisper - Transcription
- OpenAI TTS - Text-to-speech
- DeepL - Primary translation service
- Google Cloud - Fallback translation & TTS

**Content Services:**
- Firecrawl - Article scraping
- Spotify API - Music integration (planned)
- Genius API - Lyrics (planned)

###Directory Structure

```
langflix/
├── api/                    # API route handlers
│   ├── adaptive/          # Adaptive learning endpoints
│   ├── analytics/         # Analytics endpoints
│   ├── articles/          # Article management
│   ├── beginner/          # Beginner mode features
│   ├── content/           # Content management
│   ├── games/             # Game endpoints
│   └── vocabulary/        # Vocabulary tracking
├── lib/                    # Core business logic
│   ├── content-difficulty-analyzer.js    # CEFR level detection
│   ├── frequency-lookup.js               # 10K Spanish word frequency
│   ├── unified-feed-algorithm.js         # Smart feed ranking (planned)
│   ├── podcast-feed-aggregator.js        # Podcast integration (planned)
│   ├── music-feed-aggregator.js          # Music integration (planned)
│   ├── ai-story-generator-personalized.js # AI content generation (planned)
│   ├── auth-service.js                   # Authentication
│   ├── error-tracking.js                 # Sentry integration
│   └── [100+ other services]
├── public/                 # Frontend HTML/CSS/JS
│   ├── *.html             # 36 HTML pages
│   ├── videos/            # Video library
│   └── components/        # Reusable UI components
├── prisma/                # Database schema
│   └── schema.prisma      # PostgreSQL schema
├── scripts/               # Utility scripts
│   ├── transcribe-all-videos.js
│   ├── test-server.js
│   └── [deployment scripts]
├── tests/                 # Test suites
│   ├── user-scenarios.test.js
│   ├── *.spec.js          # Playwright E2E tests
│   └── unit/              # Unit tests
├── server.js              # Main server entry point
└── package.json           # Dependencies

```

---

## 🗄️ Database Schema

### Core Models

#### User
```prisma
model User {
  id              String   @id @default(uuid())
  email           String?  @unique
  username        String?  @unique
  currentLevel    String   @default("A1")  // CEFR level
  streak          Int      @default(0)
  totalXP         Int      @default(0)
  
  words           Word[]
  articles        SavedArticle[]
  achievements    Achievement[]
  progress        Progress[]
}
```

#### Word (Vocabulary with Spaced Repetition)
```prisma
model Word {
  id            String   @id @default(uuid())
  word          String
  translation   String
  level         String   // A1, A2, B1, B2, C1, C2
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  // SM-2 Spaced Repetition
  masteryLevel  Int      @default(0)  // 0-5
  easiness      Float    @default(2.5)
  interval      Int      @default(0)
  nextReview    DateTime?
  
  @@unique([userId, word])
}
```

#### UserInteraction (for Smart Recommendations)
```prisma
model UserInteraction {
  id            String   @id @default(uuid())
  userId        String
  type          String   // word_click, article_read, video_watched
  contentId     String?
  difficulty    String?  // A1-C2
  timeSpent     Int?     // seconds
  createdAt     DateTime @default(now())
}
```

#### SkillAssessment (Adaptive Level Testing)
```prisma
model SkillAssessment {
  id                String   @id @default(uuid())
  userId            String   @unique
  vocabularyScore   Float    @default(0)  // 0-100
  grammarScore      Float    @default(0)
  readingScore      Float    @default(0)
  listeningScore    Float    @default(0)
  overallLevel      String   @default("A2")
  confidence        Float    @default(50)  // 0-100
}
```

**See `prisma/schema.prisma` for complete schema (28 models)**

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/signup          - Create account
POST   /api/auth/login           - Login
POST   /api/auth/logout          - Logout
POST   /api/auth/reset-password  - Password reset
GET    /api/auth/me              - Get current user
```

### AI Voice Conversation (GENIUS FEATURE)
```
POST   /api/conversation/message     - Send text message, get AI response
POST   /api/conversation/voice       - Send voice (Whisper transcription)
POST   /api/conversation/tts         - Generate TTS audio for response
POST   /api/conversation/start       - Start conversation with topic
GET    /api/conversation/topics/:userId  - Get suggested topics
DELETE /api/conversation/history/:userId - Clear conversation history
GET    /api/conversation/stats/:userId   - Get conversation statistics
```

### Vocabulary
```
GET    /api/vocabulary/:userId           - Get all saved words
POST   /api/vocabulary/save              - Save new word
POST   /api/vocabulary/review            - Update spaced repetition
GET    /api/vocabulary/due/:userId       - Words due for review
GET    /api/vocabulary/stats/:userId     - Progress statistics
DELETE /api/vocabulary/:wordId           - Remove word
```

### Content
```
GET    /api/content/videos               - Get videos (with filters)
GET    /api/content/articles             - Get articles
GET    /api/content/podcasts             - Get podcasts (planned)
GET    /api/content/music                - Get music (planned)
POST   /api/content/story/generate       - Generate AI story
```

### Recommendations
```
GET    /api/feed/unified?userId=X        - Unified smart feed
GET    /api/recommendations/videos       - Recommended videos
GET    /api/recommendations/articles     - Recommended articles
GET    /api/feed/similar/:contentId      - Similar content
```

### Assessment
```
POST   /api/assessment/track             - Track user interaction
GET    /api/assessment/level/:userId     - Get user level
POST   /api/assessment/update-level      - Update user level
GET    /api/assessment/skills/:userId    - Get skill breakdown
```

### Analytics
```
POST   /api/analytics/track              - Track event
GET    /api/analytics/daily/:userId      - Daily stats
GET    /api/analytics/weekly/:userId     - Weekly stats
GET    /api/analytics/progress/:userId   - Learning progress
```

### AI Generation
```
POST   /api/ai/generate/story            - Generate personalized story
POST   /api/ai/generate/conversation     - Generate dialogue
POST   /api/ai/generate/lesson           - Generate grammar lesson
POST   /api/ai/generate/news             - Simplified news summary
POST   /api/ai/generate/cultural         - Cultural lesson
```

**Total:** 50+ API endpoints (see `server.js` for complete list)

---

## 🔐 Environment Variables

**Required:**
```bash
# Database (PostgreSQL/Neon)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Supabase
SUPABASE_URL="https://project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# OpenAI (Required for core features)
OPENAI_API_KEY="sk-proj-..."
```

**Optional but Recommended:**
```bash
# Translation Services
DEEPL_API_KEY="..."
GOOGLE_TRANSLATE_API_KEY="..."

# Content Scraping
FIRECRAWL_API_KEY="fc-..."

# TTS
GOOGLE_TTS_API_KEY="..."
ELEVENLABS_API_KEY="..."

# Payments
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."

# Music & Podcasts
SPOTIFY_CLIENT_ID="..."
GENIUS_API_KEY="..."
```

**See `ENV_TEMPLATE.txt` for complete list with descriptions**

---

## 🎙️ AI Voice Conversation Partner (GENIUS FEATURE)

### Overview

The **AI Voice Conversation Partner** is the killer feature that sets Langflix apart. It's an AI chatbot you can **talk to with your voice** that:

1. **Uses YOUR learned vocabulary** (95% known words, 5% new)
2. **Adapts to YOUR CEFR level** (A1-C2)
3. **Talks about any topic** you choose
4. **Provides voice output** (OpenAI TTS)
5. **Accepts voice input** (Whisper API)
6. **Shows text alongside audio** for reading practice
7. **Gives gentle corrections** without interrupting flow

### How It Works

**Inspired by:** Duolingo Max, Babbel Live, Mondly

**Core Technology:**
- **GPT-4** for conversation generation
- **Whisper** for speech-to-text
- **OpenAI TTS** for text-to-speech
- **Comprehensible Input Theory** (Krashen's i+1)

**Implementation:**

```javascript
// 1. Load user's vocabulary and level
const profile = await loadUserProfile(userId);
// { level: 'B1', knownWords: [500 words], interests: ['travel', 'food'] }

// 2. Build GPT-4 prompt with constraints
const systemPrompt = `
You are a Spanish conversation partner for a ${level} learner.

CONSTRAINTS:
- Use ONLY these ${vocabularySize} known words: ${knownWords.join(', ')}
- Introduce maximum 1-2 NEW words per response (5% new content)
- ${levelInstructions[level]} // e.g., "Present tense only" for A1
- Be conversational, not like a teacher
- Ask questions to keep conversation going

Your goal: 95% comprehensible, 5% challenging
`;

// 3. Generate response
const aiResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage }
    ]
});

// 4. Analyze comprehensibility
const analysis = analyzeResponse(aiResponse, profile);
// { comprehensibility: 94%, newWords: ['restaurante'], optimal: true }

// 5. Generate TTS audio
const audio = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: aiResponse,
    speed: 0.9 // Slightly slower for learners
});

// 6. Track interaction for adaptive learning
await trackInteraction(userId, userMessage, aiResponse, analysis);
```

### Voice Input Flow

```
User speaks Spanish → Browser captures audio → Send to /api/conversation/voice
→ Whisper transcribes → GPT-4 responds → OpenAI TTS → User hears response
```

### Comprehensible Input (i+1)

**Krashen's Theory:** Learners acquire language when they understand messages slightly above their current level.

**Our Implementation:**
- **i (current level):** 95% of words are known
- **+1 (challenge):** 5% are new but understandable from context

**Example for A2 learner:**

```javascript
Known words (95%): hola, me, gusta, comer, comida, buena
New words (5%): restaurante (inferable from context)

AI Response:
"¡Hola! ¿Te gusta comer comida italiana? Hay un restaurante muy bueno cerca."
// User can guess "restaurante" = restaurant from context
```

### Level-Appropriate Responses

```javascript
A1: "Hola. ¿Cómo estás? Yo estoy bien." (5-8 words, present tense)
A2: "¡Hola! ¿Qué hiciste ayer? Yo fui al parque." (8-12 words, past tense)
B1: "Me encantaría visitar España. ¿Has estado allí?" (12-15 words, perfect tense)
B2: "Si tuviera tiempo, viajaría por toda América Latina." (complex sentences, subjunctive)
C1: "La globalización ha transformado profundamente nuestra sociedad." (native-level)
```

### Features

**1. Topic Selection**
- Suggested topics based on user interests and level
- Dynamic topic list per CEFR level
- Can discuss ANY topic in free conversation mode

**2. Gentle Corrections**
- AI models correct usage instead of explicitly correcting
- Optional feedback panel shows better phrasing
- Never interrupts conversational flow

**3. Real-Time Analytics**
- Tracks comprehensibility % per message
- Counts new words introduced
- Monitors conversation turns
- Saves to database for adaptive learning

**4. Voice Quality**
- OpenAI TTS with 'nova' voice (female, clear Spanish)
- Speed: 0.9x (slightly slower for learners)
- High-quality audio streaming

**5. Multimodal Learning**
- See text (reading practice)
- Hear audio (listening practice)  
- Speak (pronunciation practice)
- Get feedback (error correction)

### User Experience

**Page:** `/public/ai-voice-chat.html`

1. **Choose topic or start talking**
2. **Click microphone** 🎙️ to record voice
3. **AI responds** with text + audio
4. **See new words** highlighted
5. **Track stats**: comprehensibility, new words, turns

### Technical Details

**Files:**
- `lib/ai-conversation-partner.js` - Core conversation engine
- `api/ai-conversation.js` - Express API endpoints
- `public/ai-voice-chat.html` - Frontend interface

**Database:**
- Stores conversation in `UserInteraction` model
- Tracks new words in `Word` model
- Updates user level in `SkillAssessment` model

**API Keys Required:**
- `OPENAI_API_KEY` - For GPT-4, Whisper, and TTS

---

## 📚 Content Strategy

### Unified Feed Algorithm

The Netflix-style feed mixes all content types with intelligent ranking:

```javascript
Score Calculation (0-100):
- Level Match (30%):      How well content matches user's CEFR level
- Interest Match (25%):   Alignment with user's topics
- Vocabulary Match (20%): 70-85% known words is optimal
- Novelty (15%):          Fresh, unseen content
- Engagement (10%):       Predicted user engagement

Content Rotation:
video → article → video → music → video → podcast → article → story
(prevents showing 10 videos in a row)
```

### Content Types

1. **Videos** (825 existing)
   - Langfeed: 687 videos
   - Reels: 138 videos
   - All with dual-language SRT transcriptions

2. **Articles** (implemented)
   - Scraped via Firecrawl
   - Analyzed for CEFR level
   - Clickable word translations

3. **Podcasts** (planned - Phase 7)
   - RSS feed aggregation
   - Whisper transcription
   - Segmented into 2-3 min clips
   - TikTok-style presentation

4. **Music** (planned - Phase 7)
   - Spotify API integration
   - Genius API for lyrics
   - Synchronized LRC lyrics
   - Karaoke-style interface

5. **AI-Generated** (partial - Phase 7)
   - Personalized stories (basic implementation exists)
   - Simulated conversations
   - News summaries
   - Cultural lessons
   - Grammar explanations

### CEFR Level Detection

Uses 10K Spanish frequency list to analyze content:

```javascript
A1: 80%+ words in top 500,  avgRank < 600
A2: 75%+ words in top 1000, avgRank < 1200
B1: 60%+ words in top 1000, avgRank < 2000
B2: 60%+ words in top 3000, avgRank < 3500
C1: 50%+ words in top 5000, avgRank < 6000
C2: Everything else
```

---

## 🎯 A1 Translation Constraints

**Critical:** When generating content for A1 learners:

1. **Target Length:** 3-5 words per translation/phrase
2. **Known Vocabulary:** 90-95% of words must be in user's known vocabulary
3. **New Words:** Maximum 1 new word per content piece
4. **Sentence Structure:** Simple subject-verb-object
5. **Verb Tenses:** Present tense only (no subjunctive, conditional)

**Implementation:**
```javascript
// In AI content generation
const A1_CONSTRAINTS = {
  MAX_NEW_WORDS: 1,
  MIN_KNOWN_PERCENTAGE: 90,
  TARGET_WORDS_PER_TRANSLATION: [3, 4, 5],
  ALLOWED_TENSES: ['present'],
  MAX_SENTENCE_LENGTH: 8
};
```

**Validation:**
- Pre-generation: Load user's known words
- Generation: Constrain GPT-4 prompt with vocabulary list
- Post-generation: Analyze generated content, regenerate if constraints violated

---

## 🧪 Testing Strategy

### Unit Tests (Jest)
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

**Test Files:**
- `tests/user-scenarios.test.js` - Difficulty analyzer (26 tests)
- `tests/word-frequency-analyzer.test.js` - Frequency lookup
- `tests/research-algorithms.test.js` - Smart algorithms

**Current Status:** 26/39 passing (67%)

### E2E Tests (Playwright)
```bash
npm run test:playwright                      # All E2E tests
npm run test:playwright:smoke                # Smoke tests
npm run test:playwright:update-snapshots     # Update visual snapshots
```

**Test Files:**
- `tests/visual-regression.spec.js` - Visual regression
- `tests/mvp-integration.test.js` - Critical user flows
- `tests/persona-based-comprehensive.test.js` - User personas

**Setup:**
- Test server runs on port 3002
- See `scripts/test-server.js`

### MCP Testing (Planned - Phase 5)

**MCP Playwright:**
- Navigate app as real user
- Test: Signup → Onboarding → Watch video → Save word → Quiz
- Screenshot each step
- Verify database persistence

**MCP Memory:**
- Create knowledge graph of users, words, relationships
- Query graph for recommendation logic validation
- Test spaced repetition scheduling

**MCP Filesystem:**
- Verify all HTML files have required components
- Check API endpoints exist in server.js
- Validate test coverage

---

## 🚀 Deployment

### Database Migration

**Step 1:** Set up Neon PostgreSQL
```bash
# 1. Create Neon account: https://console.neon.tech/
# 2. Create new project
# 3. Copy connection string
# 4. Add to .env as DATABASE_URL
```

**Step 2:** Run Prisma migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db push  # For production
```

**Step 3:** Verify connection
```bash
npx prisma studio  # Open database browser
```

### Production Deployment

**Supported Platforms:**
- Vercel (recommended for frontend)
- Railway (recommended for backend + database)
- Render
- Fly.io

**Environment Setup:**
```bash
# Development
NODE_ENV=development
DATABASE_URL=postgresql://localhost/langflix

# Staging
NODE_ENV=staging
DATABASE_URL=postgresql://staging.neon.tech/langflix

# Production
NODE_ENV=production
DATABASE_URL=postgresql://prod.neon.tech/langflix
SENTRY_DSN=...  # Enable error tracking
```

**CI/CD Pipeline (Planned - Phase 13):**
```yaml
# .github/workflows/deploy.yml
1. Install dependencies
2. Run tests (Jest + Playwright)
3. Build assets
4. Run database migrations
5. Deploy to platform
6. Health check
7. Notify team
```

---

## 📊 Implementation Status

### ✅ Phase 1: Infrastructure & Database (COMPLETE)

- [x] Create ENV_TEMPLATE.txt with all required variables
- [x] Migrate Prisma schema to PostgreSQL
- [x] Install @sentry/profiling-node
- [x] Fix Sentry integration (already had graceful handling)

### ✅ Phase 2: Test Fixes (PARTIAL - 67% passing)

- [x] Fix content-difficulty-analyzer.js
  - [x] Store actual unique words in analysis
  - [x] Do precise calculation vs user vocabulary
  - [x] Add getWordAtRank() to frequency-lookup
- [x] Fix tests/user-scenarios.test.js
  - [x] Load real words from frequency list
  - [x] Proper user profiles with actual vocabulary
- [x] Create scripts/test-server.js
  - [x] Test server for Playwright on port 3002
  - [x] Graceful startup/shutdown
- [ ] Get all tests passing (currently 26/39)

### ⏳ Phase 3: API Integration (TODO)

- [ ] Complete Vocabulary API (`api/vocabulary/index.js`)
  - [ ] GET /api/vocabulary/:userId
  - [ ] POST /api/vocabulary/save
  - [ ] POST /api/vocabulary/review
  - [ ] GET /api/vocabulary/due/:userId
- [ ] Implement Smart Recommendations API
  - [ ] Calculate user proficiency
  - [ ] Filter by CEFR level ±1
  - [ ] Score content (level 40%, interest 30%, vocab 30%)
- [ ] Implement Assessment Tracking API
  - [ ] Track all interactions
  - [ ] Calculate skill scores
  - [ ] Auto-update level at 85% confidence

### ⏳ Phase 4: Frontend Integration (TODO)

- [ ] Integrate Progress Dashboard (`public/profile.html`)
  - [ ] Show frequency list position
  - [ ] CEFR level breakdown chart
  - [ ] Next 10 words to learn
- [ ] Connect Quizzes to User Vocabulary
  - [ ] Load from API, not hardcoded
  - [ ] Prioritize due-for-review words
- [ ] Connect Games to User Vocabulary
  - [ ] All 5 games use saved words
- [ ] Fix Subtitle Timing (adjust -4 seconds)
- [ ] Implement Smart Content Filtering
  - [ ] Call recommendations API
  - [ ] Filter by user level
  - [ ] Infinite scroll with batching

### ⏳ Phase 5: MCP Testing (TODO)

- [ ] MCP Playwright user flows
- [ ] MCP Memory knowledge graph
- [ ] MCP Filesystem validation
- [ ] Full test suite passing

### ⏳ Phase 6: Production Readiness (TODO)

- [x] Create LANGFLIX_SOURCE.md (this file)
- [ ] Security audit
- [ ] Performance optimization
- [ ] Deployment prep
- [ ] Final validation

### ⏳ Phase 7: Content Ecosystem (TODO)

- [ ] Podcast integration (2h)
- [ ] Music integration (2h)
- [ ] AI story generation (3h)
- [ ] Unified feed algorithm (2h)
- [ ] Content scheduling (1h)

### ⏳ Phase 8: Auth & Premium (TODO)

- [ ] Complete auth flow (2h)
- [ ] Stripe integration (3h)

### ⏳ Phase 9-13: UX, Legal, PWA, Analytics, Deployment (TODO)

See full plan in `/langflix-complete-implementation.plan.md`

---

## 🎓 Key Principles

1. **User Level is Sacred:** Never show content more than ±1 CEFR level from user
2. **90/10 Rule (Krashen):** 90% comprehensible, 10% challenge
3. **Spaced Repetition:** Review words at optimal intervals (SM-2 algorithm)
4. **Engagement First:** TikTok-style addictive UX, learning second
5. **Mobile-First:** 80% of users on mobile
6. **Offline-Capable:** PWA with service worker
7. **AI-Enhanced:** Generate personalized content on-demand
8. **Data-Driven:** Track everything, optimize continuously

---

## 📞 Support & Resources

**Documentation:**
- This file: `LANGFLIX_SOURCE.md`
- Environment setup: `ENV_TEMPLATE.txt`
- Implementation plan: `/langflix-complete-implementation.plan.md`
- API docs: Check server.js route comments

**External Resources:**
- Prisma docs: https://www.prisma.io/docs
- Neon docs: https://neon.tech/docs
- OpenAI API: https://platform.openai.com/docs
- Supabase docs: https://supabase.com/docs

---

**Last Updated:** October 16, 2025  
**Maintained By:** Development Team  
**License:** Proprietary  

