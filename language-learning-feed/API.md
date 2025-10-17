# API Documentation

## Next.js API Routes

### Feed API

#### Get Personalized Feed

```http
GET /api/feed?userId={userId}&limit={limit}&offset={offset}
```

**Parameters:**
- `userId` (required): User ID
- `limit` (optional): Number of items to return (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "items": [
    {
      "id": "content-id",
      "type": "VIDEO",
      "title": "Content title",
      "contentUrl": "https://...",
      "thumbnailUrl": "https://...",
      "transcription": "Full text...",
      "durationSeconds": 300,
      "newWords": ["word1", "word2"],
      "knownWordsPercentage": 0.96,
      "cefrLevel": "A2"
    }
  ],
  "cached": false,
  "total": 50
}
```

**Caching:**
- Redis cache for 1 hour
- Invalidated on user interactions

---

### Interaction API

#### Track User Interaction

```http
POST /api/interaction
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "user-id",
  "contentId": "content-id",
  "interactionType": "SWIPE_UP | SWIPE_DOWN | SWIPE_LEFT | SWIPE_RIGHT | DOUBLE_TAP | SKIP | REPLAY | COMPLETED",
  "timeSpentSeconds": 45.5,
  "completionRate": 0.85,
  "wordsLookedUp": 3,
  "replayCount": 1
}
```

**Response:**
```json
{
  "success": true,
  "interactionId": "interaction-id",
  "xpEarned": 10,
  "inferredComprehension": 0.82
}
```

**Side Effects:**
- Updates content engagement metrics
- Adjusts user comprehension/engagement scores
- Updates word exposure counts
- Invalidates feed cache
- Awards XP

---

### SRS API

#### Get Due Reviews

```http
GET /api/srs?userId={userId}&limit={limit}
```

**Parameters:**
- `userId` (required): User ID
- `limit` (optional): Max cards to return (default: 20)

**Response:**
```json
{
  "cards": [
    {
      "id": "card-id",
      "word": "hacer",
      "lemma": "hacer",
      "language": "es",
      "frontText": "¿Qué significa 'hacer'?",
      "backText": "to make, to do",
      "exampleSentence": "Voy a hacer tacos",
      "nextReviewAt": "2024-10-17T09:00:00Z",
      "status": "LEARNING"
    }
  ],
  "cached": true
}
```

#### Submit Review

```http
POST /api/srs
Content-Type: application/json
```

**Body:**
```json
{
  "cardId": "card-id",
  "correct": true,
  "responseTimeMs": 1500
}
```

**Response:**
```json
{
  "success": true,
  "nextReviewAt": "2024-10-20T09:00:00Z",
  "interval": 3,
  "xpEarned": 15,
  "quality": 5
}
```

**Algorithm:**
- Uses SuperMemo SM-2
- Quality rating inferred from response time
- Intervals: 1d, 3d, 7d, 14d, 30d, 90d (exponential)

#### Create SRS Card

```http
PUT /api/srs
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "user-id",
  "word": "hacer",
  "lemma": "hacer",
  "language": "es",
  "contentId": "optional-content-id"
}
```

---

### Progress API

#### Get User Progress

```http
GET /api/progress?userId={userId}
```

**Response:**
```json
{
  "currentStreak": 7,
  "longestStreak": 15,
  "totalXP": 1450,
  "currentLevel": "A2",
  "wordsLearnedToday": 12,
  "minutesImmersedToday": 45,
  "wordsLearned": 234,
  "minutesImmersed": 1580,
  "contentConsumed": 87
}
```

#### Update Progress

```http
POST /api/progress
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "user-id",
  "xpEarned": 50,
  "wordsLearned": 5,
  "sessionDuration": 30
}
```

**Response:**
```json
{
  "success": true,
  "currentStreak": 8,
  "totalXP": 1500,
  "leveledUp": true,
  "newLevel": 2
}
```

---

## Python Microservices

### Content Analyzer

Base URL: `http://localhost:8001`

#### Analyze Content

```http
POST /analyze
Content-Type: application/json
```

**Body:**
```json
{
  "text": "Hola, ¿cómo estás? Me gusta aprender español con videos interesantes.",
  "language": "es",
  "content_type": "article"
}
```

**Response:**
```json
{
  "difficulty_score": 0.35,
  "cefr_level": "A2",
  "unique_word_count": 150,
  "total_word_count": 500,
  "comprehensibility_score": 0.75,
  "words": [
    {
      "word": "hola",
      "lemma": "hola",
      "frequency": 5,
      "cefrLevel": "A1",
      "position": 0,
      "context": "Hola, ¿cómo estás?"
    }
  ],
  "topics": ["greeting", "learning", "video"]
}
```

#### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": ["en", "es"]
}
```

---

### Recommender

Base URL: `http://localhost:8002`

#### Generate Recommendations

```http
POST /recommend
Content-Type: application/json
```

**Body:**
```json
{
  "user": {
    "userId": "user-id",
    "targetLanguage": "es",
    "currentLevel": "A2",
    "comprehensionScore": 0.75,
    "engagementScore": 0.8,
    "preferredDifficulty": 0.96,
    "knownWords": ["el", "la", "de", "que"],
    "dueForReview": ["hacer", "aprender"]
  },
  "candidates": [
    {
      "contentId": "content-1",
      "type": "VIDEO",
      "cefrLevel": "A2",
      "difficultyScore": 0.35,
      "dopamineScore": 0.85,
      "words": ["hacer", "tacos", "cocina"],
      "topics": ["food", "cooking"],
      "viewCount": 1000,
      "likeCount": 150,
      "averageTimeSpent": 240
    }
  ],
  "limit": 10
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "contentId": "content-1",
      "score": 0.87,
      "reasons": [
        "Perfect difficulty for you",
        "Contains words you're learning",
        "Highly engaging content"
      ],
      "knownPercentage": 0.96,
      "difficulty": "perfect"
    }
  ]
}
```

**Scoring Weights:**
- Difficulty matching: 40%
- Interest alignment: 30%
- Variety optimization: 15%
- SRS reinforcement: 15%

#### Health Check

```http
GET /health
```

---

## Error Responses

All endpoints follow this error format:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (user/content doesn't exist)
- `500` - Internal Server Error

---

## Rate Limiting

**Development:** No rate limiting

**Production (recommended):**
- Feed API: 100 requests/minute per user
- Interaction API: 1000 requests/minute per user
- SRS API: 200 requests/minute per user
- Progress API: 100 requests/minute per user

---

## Authentication

**Current:** None (demo mode)

**Production:** Add JWT-based authentication:

```http
Authorization: Bearer {token}
```

Use NextAuth.js or similar for implementation.

---

## Webhooks (Future)

Notify external services of user milestones:

```http
POST {webhook_url}
Content-Type: application/json

{
  "event": "level_up",
  "userId": "user-id",
  "data": {
    "newLevel": 2,
    "totalXP": 1500
  }
}
```

---

## SDK / Client Libraries

### JavaScript/TypeScript

```typescript
import { LangFlowClient } from '@langflow/sdk'

const client = new LangFlowClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.langflow.app'
})

// Get feed
const feed = await client.feed.get({
  userId: 'user-id',
  limit: 10
})

// Track interaction
await client.interactions.track({
  userId: 'user-id',
  contentId: 'content-id',
  type: 'SWIPE_UP',
  timeSpent: 45.5
})
```

### Python

```python
from langflow import LangFlowClient

client = LangFlowClient(
    api_key='your-api-key',
    base_url='https://api.langflow.app'
)

# Get feed
feed = client.feed.get(user_id='user-id', limit=10)

# Track interaction
client.interactions.track(
    user_id='user-id',
    content_id='content-id',
    type='SWIPE_UP',
    time_spent=45.5
)
```

---

## Testing

### Sample cURL Commands

**Get Feed:**
```bash
curl "http://localhost:3000/api/feed?userId=demo-user-id&limit=5" | jq
```

**Track Interaction:**
```bash
curl -X POST "http://localhost:3000/api/interaction" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user-id",
    "contentId": "content-id",
    "interactionType": "SWIPE_UP",
    "timeSpentSeconds": 45.5,
    "completionRate": 0.9
  }' | jq
```

**Analyze Content:**
```bash
curl -X POST "http://localhost:8001/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hola mundo",
    "language": "es"
  }' | jq
```

---

## GraphQL (Future Enhancement)

Consider migrating to GraphQL for more flexible querying:

```graphql
query GetFeed($userId: ID!, $limit: Int) {
  feed(userId: $userId, limit: $limit) {
    items {
      id
      title
      type
      contentUrl
      newWords
      knownPercentage
    }
  }
}

mutation TrackInteraction($input: InteractionInput!) {
  trackInteraction(input: $input) {
    success
    xpEarned
  }
}
```

---

For more details, see the [Development Guide](DEVELOPMENT.md) and [README](README.md).


