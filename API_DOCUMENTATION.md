# 📚 API Documentation

Complete API reference for the VIDA Language Learning Platform.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://your-domain.com`

## Authentication

Most endpoints require authentication via Supabase Auth. Include the access token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Anonymous users**: 100 requests per 15 minutes
- **Authenticated users**: 1000 requests per 15 minutes

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2025-10-15T12:00:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-15T12:00:00Z"
}
```

---

## Endpoints

### Health & Monitoring

#### GET /api/health/status

Get detailed system health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-15T12:00:00Z",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connected",
      "responseTime": 45
    },
    "apis": {
      "status": "healthy",
      "apis": {
        "transcription": "https://api.transcription.com",
        "translation": "Internal"
      },
      "responseTime": 12
    }
  },
  "metrics": {
    "memory": {
      "rss": "156 MB",
      "heapTotal": "89 MB",
      "heapUsed": "67 MB",
      "external": "4 MB"
    },
    "uptime": "3600 seconds",
    "nodeVersion": "v18.17.0",
    "platform": "darwin",
    "env": "production"
  },
  "responseTime": "58 ms"
}
```

---

### Analytics

#### POST /api/analytics

Track user events and analytics.

**Request Body:**
```json
{
  "events": [
    {
      "event_type": "article_read",
      "event_data": {
        "article_id": "123",
        "language": "es",
        "read_duration": 45
      },
      "timestamp": "2025-10-15T12:00:00Z",
      "session_id": "session_123",
      "user_agent": "Mozilla/5.0..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Events tracked successfully",
  "count": 1
}
```

**Event Types:**
- `article_read` - User read an article
- `video_view` - User watched a video
- `word_translation` - User translated a word
- `quiz_attempt` - User completed a quiz
- `vocabulary_save` - User saved a vocabulary word
- `page_view` - User viewed a page
- `user_interaction` - Generic user interaction

---

### Vocabulary

#### POST /api/vocabulary/save

Save a word to user's vocabulary.

**Authentication Required**: Yes

**Request Body:**
```json
{
  "word": "hola",
  "translation": "hello",
  "language": "es",
  "context": "Hola, ¿cómo estás?",
  "article_id": "123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "vocab_123",
    "word": "hola",
    "translation": "hello",
    "language": "es",
    "saved_at": "2025-10-15T12:00:00Z"
  }
}
```

#### GET /api/vocabulary/get

Get user's saved vocabulary.

**Authentication Required**: Yes

**Query Parameters:**
- `language` (optional) - Filter by language
- `limit` (optional, default: 50) - Number of words to return
- `offset` (optional, default: 0) - Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "vocabulary": [
      {
        "id": "vocab_123",
        "word": "hola",
        "translation": "hello",
        "language": "es",
        "context": "Hola, ¿cómo estás?",
        "saved_at": "2025-10-15T12:00:00Z",
        "review_count": 3,
        "last_reviewed": "2025-10-15T11:00:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pages": 3
  }
}
```

#### POST /api/vocabulary/click

Track word click (for analytics).

**Request Body:**
```json
{
  "word": "hola",
  "context": "Hola, ¿cómo estás?",
  "article_id": "123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Word click tracked"
}
```

#### POST /api/vocabulary/review

Review a vocabulary word (spaced repetition).

**Authentication Required**: Yes

**Request Body:**
```json
{
  "vocabulary_id": "vocab_123",
  "correct": true,
  "time_taken": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "next_review": "2025-10-17T12:00:00Z",
    "strength": 0.85,
    "review_count": 4
  }
}
```

#### PUT /api/vocabulary/update-review

Update review status for a word.

**Authentication Required**: Yes

**Request Body:**
```json
{
  "vocabulary_id": "vocab_123",
  "strength": 0.9,
  "next_review": "2025-10-20T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review status updated"
}
```

---

### News & Articles

#### GET /api/news/personalized/:userId

Get personalized news feed for user.

**Query Parameters:**
- `limit` (optional, default: 10) - Number of articles
- `language` (optional, default: 'es') - Content language
- `difficulty` (optional) - Filter by difficulty level

**Response:**
```json
{
  "success": true,
  "articles": [
    {
      "id": "article_123",
      "title": "El clima en España",
      "summary": "Las temperaturas suben en toda la península...",
      "content": "Full article content...",
      "language": "es",
      "difficulty": "intermediate",
      "category": "weather",
      "published_at": "2025-10-15T10:00:00Z",
      "image_url": "https://...",
      "source": "El País"
    }
  ],
  "total": 45,
  "page": 1
}
```

---

### Videos

#### GET /api/videos/feed

Get video feed with dual-language subtitles.

**Query Parameters:**
- `language` (optional, default: 'es') - Video language
- `category` (optional) - Filter by category
- `limit` (optional, default: 10) - Number of videos
- `offset` (optional, default: 0) - Pagination offset

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "video_123",
      "title": "Spanish Conversation",
      "url": "/videos/spanish-001.mp4",
      "thumbnail": "/videos/spanish-001-thumb.jpg",
      "duration": 120,
      "language": "es",
      "category": "conversation",
      "subtitles": {
        "es": "/subtitles/spanish-001-es.vtt",
        "en": "/subtitles/spanish-001-en.vtt"
      },
      "transcription": {
        "segments": [
          {
            "start": 0,
            "end": 2.5,
            "text": "Hola, ¿cómo estás?",
            "translation": "Hello, how are you?"
          }
        ]
      }
    }
  ],
  "total": 250
}
```

---

### User Progress

#### GET /api/user/progress/:userId

Get user's learning progress.

**Authentication Required**: Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user_123",
    "language": "es",
    "level": "intermediate",
    "xp": 1500,
    "streak_days": 15,
    "words_learned": 450,
    "articles_read": 78,
    "videos_watched": 123,
    "quizzes_completed": 34,
    "achievements": [
      {
        "id": "achievement_1",
        "name": "First Week Warrior",
        "description": "Completed 7 days in a row",
        "earned_at": "2025-10-08T12:00:00Z"
      }
    ],
    "stats": {
      "daily_goal": 50,
      "daily_progress": 35,
      "weekly_goal": 350,
      "weekly_progress": 280
    }
  }
}
```

#### POST /api/user/progress/:userId

Update user progress.

**Authentication Required**: Yes

**Request Body:**
```json
{
  "xp_earned": 10,
  "activity_type": "article_read",
  "metadata": {
    "article_id": "article_123",
    "time_spent": 45
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "new_xp": 1510,
    "level_up": false,
    "streak_maintained": true
  }
}
```

---

### Quizzes

#### GET /api/quiz/daily/:userId

Get daily quiz for user.

**Authentication Required**: Yes

**Response:**
```json
{
  "success": true,
  "quiz": {
    "id": "quiz_123",
    "title": "Daily Spanish Challenge",
    "questions": [
      {
        "id": "q1",
        "text": "What does 'hola' mean?",
        "type": "multiple_choice",
        "options": ["hello", "goodbye", "please", "thank you"],
        "correct_answer": "hello"
      }
    ],
    "time_limit": 300,
    "difficulty": "intermediate"
  }
}
```

#### POST /api/quiz/submit

Submit quiz answers.

**Authentication Required**: Yes

**Request Body:**
```json
{
  "quiz_id": "quiz_123",
  "answers": {
    "q1": "hello",
    "q2": "adiós"
  },
  "time_taken": 245
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "score": 85,
    "correct": 9,
    "total": 10,
    "xp_earned": 50,
    "feedback": [
      {
        "question_id": "q1",
        "correct": true,
        "explanation": "Great job!"
      }
    ]
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INVALID_INPUT` | Invalid request parameters |
| `NOT_FOUND` | Resource not found |
| `DATABASE_ERROR` | Database operation failed |
| `EXTERNAL_API_ERROR` | External API request failed |
| `INTERNAL_ERROR` | Internal server error |

---

## Webhooks

### Supabase Realtime

Subscribe to real-time updates for user progress:

```javascript
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const subscription = supabase
  .channel('user_progress')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'user_progress',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Progress updated:', payload.new);
  })
  .subscribe();
```

---

## SDKs & Libraries

### JavaScript/TypeScript

```javascript
// Initialize client
import { VidaClient } from '@vida/sdk';

const client = new VidaClient({
  apiUrl: 'https://api.vida-learning.com',
  apiKey: 'your_api_key'
});

// Track article read
await client.analytics.trackArticleRead({
  articleId: '123',
  language: 'es',
  readDuration: 45
});

// Get vocabulary
const vocab = await client.vocabulary.get({
  language: 'es',
  limit: 50
});
```

---

## Best Practices

1. **Rate Limiting**: Implement exponential backoff for retries
2. **Caching**: Cache responses where appropriate to reduce API calls
3. **Error Handling**: Always handle errors gracefully
4. **Authentication**: Store tokens securely, never in localStorage for sensitive data
5. **Pagination**: Use pagination for large datasets
6. **Timestamps**: All timestamps are in ISO 8601 format (UTC)

---

## Support

For API support, please contact:
- **Email**: api-support@vida-learning.com
- **Docs**: https://docs.vida-learning.com
- **Status**: https://status.vida-learning.com

