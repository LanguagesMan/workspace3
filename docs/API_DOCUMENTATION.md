# 📚 COMPLETE API DOCUMENTATION

## Base URL
```
Production: https://your-domain.com
Development: http://localhost:3001
```

## Authentication
Most endpoints require a `userId`. In production, this would be obtained from JWT tokens.

---

## Integration API

### POST `/api/integration/first-visit`
Initialize first-time user journey.

**Request Body:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "journey": {
    "userId": "user_123",
    "stage": "first_visit",
    "startTime": 1697456789000,
    "completedSteps": [],
    "currentLevel": null,
    "knownWords": []
  },
  "nextStep": "placement_test",
  "redirectTo": "/components/swipe-placement-test.html",
  "message": "Welcome! Let's find your perfect level."
}
```

---

### POST `/api/integration/placement-complete`
Submit placement test results and get level assessment.

**Request Body:**
```json
{
  "userId": "user_123",
  "testResults": {
    "knownWords": [
      { "word": "hola", "rank": 1 },
      { "word": "sí", "rank": 2 }
    ],
    "accuracy": 0.7,
    "totalWords": 20,
    "duration": 30000
  }
}
```

**Response:**
```json
{
  "success": true,
  "assessment": {
    "level": "A2",
    "estimatedWordCount": 400,
    "confidence": "high",
    "reasoning": "You knew 4/5 ultra-high frequency words but struggled with mid-frequency. Starting at elementary level."
  },
  "journey": {
    "userId": "user_123",
    "stage": "placement_complete",
    "currentLevel": "A2",
    "estimatedWordCount": 400,
    "completedSteps": ["placement_test"]
  },
  "firstFeed": {
    "items": [...],
    "metadata": {...}
  },
  "nextStep": "first_session",
  "redirectTo": "/tiktok-video-feed.html",
  "message": "Great! You're at A2 level. Let's start learning!"
}
```

---

### POST `/api/integration/beginner-skip`
Handle "I'm a beginner" button click (skip placement test).

**Request Body:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "journey": {
    "userId": "user_123",
    "stage": "beginner_mode",
    "currentLevel": "A1",
    "completedSteps": ["skipped_test"]
  },
  "beginnerMode": true,
  "firstFeed": {
    "items": [...],
    "metadata": {...}
  },
  "nextStep": "first_session",
  "redirectTo": "/tiktok-video-feed.html",
  "message": "Perfect! We'll start with the basics."
}
```

---

### POST `/api/integration/action`
**MOST IMPORTANT ENDPOINT** - Track any user action and adjust in real-time.

**Request Body:**
```json
{
  "userId": "user_123",
  "action": {
    "type": "word_click | video_watch | too_hard | too_easy | word_save | quiz_complete",
    "timestamp": 1697456789000,
    // Additional fields based on type:
    
    // For word_click:
    "word": "casa",
    "context": { "videoId": "video_123" },
    
    // For video_watch:
    "contentId": "video_123",
    "percentage": 95,
    "duration": 120,
    
    // For too_hard/too_easy:
    "contentId": "video_123",
    
    // For word_save:
    "word": "amigo",
    "wordRank": 89,
    "level": "A2",
    "totalWords": 50,
    
    // For quiz_complete:
    "quizId": "quiz_123",
    "score": 8,
    "totalQuestions": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "tracked": true,
  "result": {
    "clickSpeed": 2500,
    "avgClickSpeed": 3000,
    "signal": "comfortable",
    "milestone": {
      "milestone": 50,
      "message": "Wow! 50 words - you're a fast learner!",
      "emoji": "🌿",
      "reward": "learner_badge"
    }
  },
  "signals": {
    "clickSpeed": {
      "avg": 3000,
      "interpretation": "comfortable",
      "confidence": "high"
    },
    "completionRate": {
      "avg": 85,
      "interpretation": "perfect",
      "confidence": "high"
    },
    "recommendation": {
      "action": "maintain_level",
      "confidence": "medium",
      "reasons": ["Performance indicators are balanced"]
    }
  },
  "adjustment": {
    "oldLevel": "A2",
    "newLevel": "A2",
    "changed": false,
    "action": "Level maintained",
    "message": "Level remains A2"
  },
  "updatedFeed": {
    "items": [...],
    "metadata": {...}
  },
  "shouldRefreshFeed": false
}
```

---

### GET `/api/integration/feed/:userId`
Get personalized content feed sorted by goldilocks score.

**Query Parameters:**
- `topics` (optional): Comma-separated list of topics (e.g., "food,travel")
- `hideWatched` (optional): Boolean to hide already watched content
- `forceRefresh` (optional): Boolean to bypass cache

**Example:**
```
GET /api/integration/feed/user_123?topics=food,travel&hideWatched=true
```

**Response:**
```json
{
  "success": true,
  "feed": {
    "items": [
      {
        "id": "video_001",
        "type": "video",
        "title": "Spanish Basics",
        "transcription": "Hola me llamo María",
        "topics": ["introduction", "basics"],
        "duration": 120,
        "goldilocksScore": 95,
        "goldilocksZone": "goldilocks",
        "newWords": ["llamo", "María"],
        "newWordCount": 2,
        "difficulty": "A1"
      }
    ],
    "metadata": {
      "userId": "user_123",
      "currentLevel": "A2",
      "beginnerMode": false,
      "signals": {
        "action": "maintain_level",
        "confidence": "high"
      },
      "totalAvailable": 145,
      "averageGoldilocksScore": 87
    }
  }
}
```

---

### POST `/api/integration/refresh-feed`
Force refresh feed (after level adjustment).

**Request Body:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "feed": {
    "items": [...],
    "metadata": {...}
  },
  "refreshed": true,
  "timestamp": "2025-10-16T12:34:56.789Z"
}
```

---

### GET `/api/integration/profile/:userId`
Get complete user profile with all data.

**Response:**
```json
{
  "success": true,
  "userId": "user_123",
  "journey": {
    "userId": "user_123",
    "stage": "placement_complete",
    "currentLevel": "A2",
    "estimatedWordCount": 400,
    "completedSteps": ["placement_test"],
    "milestones": [
      {
        "milestone": 50,
        "timestamp": 1697456789000,
        "message": "Wow! 50 words - you're a fast learner!"
      }
    ]
  },
  "signals": {
    "clickSpeed": {
      "avg": 3000,
      "interpretation": "comfortable",
      "confidence": "high"
    },
    "completionRate": {
      "avg": 85,
      "interpretation": "perfect",
      "confidence": "high"
    },
    "quizPerformance": {
      "avg": 75,
      "interpretation": "good",
      "confidence": "medium"
    },
    "userFeedback": {
      "tooHardCount": 2,
      "tooEasyCount": 1,
      "balance": -1,
      "interpretation": "perfect_balance"
    },
    "recommendation": {
      "action": "maintain_level",
      "confidence": "medium",
      "reasons": ["Performance indicators are balanced"]
    }
  },
  "sessionStats": {
    "totalWordClicks": 45,
    "totalContentViewed": 12,
    "totalQuizzesTaken": 3,
    "totalWordsSaved": 50,
    "avgClickSpeed": 3000,
    "avgCompletionRate": 85,
    "tooHardClicks": 2,
    "tooEasyClicks": 1,
    "sessionStart": 1697456789000,
    "lastActivity": 1697460389000
  },
  "beginnerSettings": {
    "isBeginnerMode": false
  },
  "timestamp": "2025-10-16T12:34:56.789Z"
}
```

---

### POST `/api/integration/track-session`
Track complete user session.

**Request Body:**
```json
{
  "userId": "user_123",
  "sessionData": {
    "startTime": 1697456789000,
    "endTime": 1697460389000,
    "videosWatched": 3,
    "wordsClicked": 15,
    "wordsSaved": 5,
    "quizzesTaken": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "journey": {
    "userId": "user_123",
    "sessions": [...]
  },
  "sessionNumber": 5,
  "totalSessions": 5
}
```

---

### GET `/api/integration/progression/:userId`
Check if user is ready to progress to next level.

**Response:**
```json
{
  "success": true,
  "shouldProgress": true,
  "recommendation": "retest",
  "message": "You're doing great! Ready to test your progress?",
  "currentLevel": "A2",
  "estimatedNewLevel": "B1"
}
```

---

### POST `/api/integration/milestone`
Check and celebrate milestone achievement.

**Request Body:**
```json
{
  "userId": "user_123",
  "wordCount": 100
}
```

**Response:**
```json
{
  "success": true,
  "hasMilestone": true,
  "milestone": {
    "milestone": 100,
    "message": "Congratulations! 100 words - you've reached A1 level!",
    "emoji": "🌳",
    "reward": "learner_badge"
  }
}
```

---

## Adaptive API (Legacy - Use Integration API instead)

### GET `/api/adaptive/user-profile/:userId`
Get user adaptive profile.

### POST `/api/adaptive/adjust-level`
Adjust user level manually.

### POST `/api/adaptive/track-interaction`
Track individual interaction.

---

## Content API

### GET `/api/content/analyzed`
Get all analyzed content.

### POST `/api/content/batch-analyze`
Analyze multiple content items.

### GET `/api/content/difficulty/:contentId/:userId`
Get difficulty score for specific user.

---

## Assessment API

### GET `/api/swipe-assessment/words/:round`
Get words for placement test round.

**Query Parameters:**
- `results` (optional): JSON string of previous round results

**Response:**
```json
{
  "success": true,
  "round": 1,
  "words": [
    {
      "word": "hola",
      "rank": 1,
      "translation": "hello",
      "frequency": "ultra-high"
    }
  ],
  "totalWords": 5
}
```

---

### POST `/api/swipe-assessment/submit`
Submit test results and get level.

**Request Body:**
```json
{
  "wordResults": [
    {
      "word": "hola",
      "rank": 1,
      "known": true,
      "speed": 850,
      "round": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "level": "A2",
  "wordCount": 300,
  "frequencyRange": "1-1000",
  "description": "You know the basics! You can handle simple conversations.",
  "percentile": 40,
  "confidence": "High",
  "accuracy": 70,
  "avgSpeed": 1250,
  "totalWords": 20,
  "knownWords": 14
}
```

---

## Translation API

### GET `/api/translate/word`
Translate a single word.

**Query Parameters:**
- `word`: Word to translate
- `sourceLang`: Source language (default: 'es')
- `targetLang`: Target language (default: 'en')

**Example:**
```
GET /api/translate/word?word=hola&sourceLang=es&targetLang=en
```

**Response:**
```json
{
  "success": true,
  "word": "hola",
  "translation": "hello",
  "sourceLang": "es",
  "targetLang": "en"
}
```

---

## Health Check API

### GET `/api/health/status`
Check server health.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-16T12:34:56.789Z",
  "uptime": 86400,
  "version": "1.0.0"
}
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "error": "Error message here",
  "details": "Additional details if available"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (missing parameters)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General API**: 100 requests per 15 minutes per IP
- **User-specific**: 200 requests per 15 minutes per user
- **Transcription**: 50 requests per hour per user

Rate limit headers included in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1697457689
```

---

## WebSocket Support (Future)

Real-time updates will be available via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:3001/ws/feed-updates/user_123');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'feed_update') {
    // Update feed in real-time
    updateFeed(data.feed);
  }
  
  if (data.type === 'level_change') {
    // Show level change notification
    showNotification(data.adjustment);
  }
};
```

---

## Best Practices

### 1. Error Handling
Always wrap API calls in try-catch:

```javascript
try {
  const response = await fetch('/api/integration/action', {...});
  const data = await response.json();
  
  if (!data.success) {
    console.error('API error:', data.error);
    // Handle error gracefully
  }
} catch (error) {
  console.error('Network error:', error);
  // Retry or show offline message
}
```

### 2. Caching
Use feed cache when possible:

```javascript
// Check cache first
if (cachedFeed && !forceRefresh) {
  return cachedFeed;
}

// Only fetch if needed
const feed = await fetchFeed();
```

### 3. Batching
Batch multiple actions when possible:

```javascript
// Instead of multiple calls:
await trackAction('word_click', {word: 'hola'});
await trackAction('word_click', {word: 'casa'});

// Batch them:
await trackBatchActions([
  {type: 'word_click', word: 'hola'},
  {type: 'word_click', word: 'casa'}
]);
```

### 4. Debouncing
Debounce high-frequency events:

```javascript
const debouncedTrack = debounce(trackAction, 500);

// On every word click
debouncedTrack('word_click', {word});
```

---

## Testing

### cURL Examples

```bash
# First visit
curl -X POST http://localhost:3001/api/integration/first-visit \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_user"}'

# Track action
curl -X POST http://localhost:3001/api/integration/action \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"test_user",
    "action":{
      "type":"word_click",
      "word":"hola",
      "timestamp":1697456789000
    }
  }'

# Get feed
curl http://localhost:3001/api/integration/feed/test_user

# Get profile
curl http://localhost:3001/api/integration/profile/test_user
```

---

**Status**: ✅ Complete & Production Ready
**Version**: 1.0.0
**Last Updated**: October 16, 2025

