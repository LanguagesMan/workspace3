# 🎯 AGENT 7: Smart Recommendation & Difficulty Engine

**Branch:** `agent-7-smart-recommendations`  
**Estimated Time:** 3-4 hours  
**Priority:** CRITICAL - This enables true personalization

---

## 🎯 MISSION

Build a truly intelligent recommendation engine that rivals Duolingo's personalization. Transform the app from showing random content to delivering perfectly-matched content for each user's level and interests.

---

## 📋 CRITICAL TASKS

### Task 1: Article Difficulty Analyzer (1 hour)
**File:** `/lib/article-difficulty-analyzer.js`

Create a sophisticated Spanish text analyzer that determines CEFR level (A1-C2).

**Requirements:**
- Analyze word frequency using established Spanish word lists (top 5000 words)
- Calculate sentence complexity (avg words per sentence, clause depth)
- Detect verb tenses and moods (present, preterite, imperfect, subjunctive)
- Measure vocabulary diversity (unique words / total words)
- Calculate reading time based on level

**Input:** Spanish text (article content)

**Output:**
```javascript
{
  level: 'B1',           // A1, A2, B1, B2, C1, C2
  score: 75,             // 0-100 difficulty score
  readingTime: 8,        // minutes
  metrics: {
    avgWordsPerSentence: 15,
    uniqueWords: 234,
    commonWords: 180,     // % in top 1000
    uncommonWords: 54,
    verbTenses: ['present', 'preterite', 'imperfect'],
    subjectiveClause: true
  }
}
```

**Algorithm:**
```javascript
// Scoring formula
A1: 0-30 (top 500 words, simple present, 5-10 words/sentence)
A2: 31-45 (top 1000 words, simple past, 8-12 words/sentence)
B1: 46-60 (top 2000 words, multiple tenses, 10-15 words/sentence)
B2: 61-75 (top 3500 words, subjunctive, 12-18 words/sentence)
C1: 76-90 (top 5000 words, complex grammar, 15-25 words/sentence)
C2: 91-100 (advanced vocabulary, literary style, 20+ words/sentence)
```

---

### Task 2: Smart Recommendation Engine (1.5 hours)
**File:** `/lib/smart-recommendation-engine.js`

Build the core personalization algorithm that ranks content for each user.

**Scoring Algorithm:**
```javascript
For each piece of content:
  levelMatchScore = calculateLevelMatch(contentLevel, userLevel)
    // Perfect match (same level): 100
    // ±1 level: 80
    // ±2 levels: 50
    // >2 levels: 20
  
  interestScore = calculateInterestMatch(contentTopics, userInterests)
    // Match saved interests: 100
    // Related interests: 60
    // No match: 30
  
  vocabularyScore = calculateVocabMatch(contentWords, userKnownWords)
    // 70-85% known: 100 (optimal challenge)
    // 85-95% known: 80 (easy but useful)
    // 60-70% known: 70 (challenging)
    // <60% or >95%: 40 (too hard or too easy)
  
  engagementScore = calculateEngagement(userHistory, contentId)
    // User completed similar content: 100
    // User saved similar content: 80
    // User skipped similar: 20
    // Never seen: 60
  
  freshnessScore = calculateFreshness(contentDate, currentDate)
    // Last 24h: 100
    // Last week: 80
    // Last month: 60
    // Older: 40

  finalScore = (levelMatchScore * 0.40) +
               (interestScore * 0.25) +
               (vocabularyScore * 0.20) +
               (engagementScore * 0.10) +
               (freshnessScore * 0.05)

Sort by finalScore DESC
Return top 50 items
```

**Key Features:**
- Avoid showing already consumed content
- Ensure diversity (don't show 10 articles about same topic)
- Balance exploration (new topics) vs exploitation (known preferences)
- Cold start: Show popular content across all levels
- Learning phase: 70% personalized, 30% exploratory
- Stable phase: 90% personalized, 10% exploratory

---

### Task 3: User Profiler (45 minutes)
**File:** `/lib/user-profiler.js`

Build user profile from behavior and preferences.

**Profile Structure:**
```javascript
{
  userId: 'user123',
  level: 'B1',
  knownWords: ['hola', 'gracias', ...],  // from vocabulary database
  interests: {
    'Sports': 0.8,
    'Technology': 0.6,
    'Food': 0.4,
    'News': 0.3
  },
  learningStyle: {
    prefersVideos: true,
    avgSessionLength: 15,  // minutes
    bestTimeOfDay: '19:00',
    completionRate: 0.75
  },
  engagementHistory: {
    articlesRead: 45,
    videosWatched: 120,
    wordsLearned: 342,
    daysSinceStart: 30
  }
}
```

**Functions:**
- `getOrCreateProfile(userId)` - Get from DB or create new
- `updateInterests(userId, contentTopics, timeSpent)` - Weight by engagement
- `updateKnownWords(userId)` - Fetch from vocabulary API
- `updateLearningStyle(userId, sessionData)` - Track patterns
- `getPersonalizationStage(userId)` - cold_start / learning / stable

---

### Task 4: API Endpoints (1 hour)
**Directory:** `/api/recommendations/`

Create RESTful API for recommendations.

**Endpoints:**

**GET /api/recommendations/articles**
```javascript
Query params: userId, limit (default 50), offset
Response: {
  articles: [
    {
      id, title, excerpt, imageUrl,
      difficulty: { level: 'B1', score: 65 },
      comprehension: 82,  // % of words user knows
      topics: ['Sports', 'Health'],
      readingTime: 5,
      recommendationScore: 87
    }
  ],
  metadata: {
    totalAvailable: 500,
    userLevel: 'B1',
    personalizationStage: 'learning'
  }
}
```

**GET /api/recommendations/videos**
```javascript
Query params: userId, limit (default 20), offset
Response: {
  videos: [
    {
      id, title, thumbnailUrl, duration,
      difficulty: { level: 'A2', score: 45 },
      topics: ['Daily Life', 'Conversation'],
      subtitlesAvailable: true,
      recommendationScore: 92
    }
  ]
}
```

**POST /api/recommendations/feedback**
```javascript
Body: {
  userId, contentType, contentId,
  action: 'viewed' | 'completed' | 'saved' | 'skipped',
  timeSpent: 120  // seconds
}
Response: { success: true, profileUpdated: true }
```

---

### Task 5: Frontend Integration (45 minutes)

**Update `/public/discover-ai.html`:**
- Replace current article fetching with recommendation API
- Show difficulty badges (A1-C2) with color coding:
  - A1: 🟢 Green
  - A2: 🟢 Light Green
  - B1: 🟡 Yellow
  - B2: 🟠 Orange
  - C1: 🔴 Red
  - C2: 🔴 Dark Red
- Show comprehension percentage: "You know 87% of this article"
- Add filter UI: "Show only: [My Level] [All Levels] [Challenge Me]"

**Update `/public/tiktok-video-feed.html`:**
- Use video recommendation API
- Show difficulty indicator on each video
- Track video completions and send feedback
- Prioritize user's level ±1

**UI Components:**
```html
<!-- Difficulty Badge -->
<div class="difficulty-badge level-b1">
  <span class="level-text">B1</span>
  <span class="comprehension">85% known</span>
</div>

<!-- Filter Controls -->
<div class="recommendation-filters">
  <button class="filter-btn active">My Level</button>
  <button class="filter-btn">All Levels</button>
  <button class="filter-btn">Challenge Me</button>
</div>
```

---

### Task 6: Comprehensive Playwright Tests (45 minutes)
**File:** `/tests/smart-recommendations-visual.spec.js`

**Test Cases:**

```javascript
test('Article difficulty analyzer works correctly', async ({ page }) => {
  // Test various difficulty texts
  // Verify A1 text scores 0-30
  // Verify C2 text scores 90-100
  // Screenshot difficulty analysis
});

test('Recommendations are personalized for A1 user', async ({ page }) => {
  // Create mock A1 user
  // Fetch recommendations
  // Verify 80%+ are A1-A2 level
  // Screenshot recommended articles with badges
});

test('Recommendations are personalized for B2 user', async ({ page }) => {
  // Create mock B2 user
  // Fetch recommendations
  // Verify 80%+ are B1-C1 level
  // Screenshot results
});

test('Interest-based filtering works', async ({ page }) => {
  // User interested in Sports
  // Verify Sports articles ranked higher
  // Screenshot personalized feed
});

test('Comprehension percentage displays correctly', async ({ page }) => {
  // Navigate to article
  // Verify "You know X%" shows
  // Screenshot comprehension indicator
});

test('Difficulty badges render correctly', async ({ page }) => {
  // Navigate to articles page
  // Verify all difficulty badges visible
  // Check color coding
  // Screenshot badge variety
});

test('Recommendation quality over time', async ({ page }) => {
  // Simulate user engagement
  // Track recommendation scores
  // Verify improvement over 10 interactions
});
```

---

## 📁 FILES TO CREATE

```
/lib/article-difficulty-analyzer.js        (NEW - 250 lines)
/lib/smart-recommendation-engine.js        (NEW - 400 lines)
/lib/user-profiler.js                      (NEW - 200 lines)
/api/recommendations/index.js              (NEW - 300 lines)
/tests/smart-recommendations-visual.spec.js (NEW - 200 lines)
```

## 📁 FILES TO MODIFY

```
/public/discover-ai.html                   (UPDATE - add badges, filters)
/public/tiktok-video-feed.html            (UPDATE - use recommendation API)
/public/css/tiktok-theme.css              (UPDATE - badge styles)
```

---

## 🧪 TESTING CHECKLIST

- [ ] Difficulty analyzer correctly scores A1 content (0-30)
- [ ] Difficulty analyzer correctly scores C2 content (90-100)
- [ ] B1 user gets 80%+ B1-B2 content
- [ ] Recommendations avoid already-consumed content
- [ ] Interest matching works (Sports fan gets Sports articles)
- [ ] Comprehension percentage calculates correctly
- [ ] Difficulty badges render with correct colors
- [ ] Filter controls work (My Level / All / Challenge)
- [ ] API endpoints return valid data
- [ ] No console errors

---

## 💡 IMPLEMENTATION TIPS

1. **Use existing word frequency lists:** Download Real Academia Española top 5000 words
2. **Cache difficulty scores:** Store in database to avoid recalculation
3. **Optimize for speed:** Recommendation calculation should be <100ms
4. **Progressive enhancement:** If recommendation fails, fall back to simple sorting
5. **A/B testing ready:** Log all recommendations for future analysis

---

## 🎯 SUCCESS CRITERIA

- ✅ Articles show accurate CEFR levels
- ✅ User's level determines 80%+ of shown content
- ✅ Comprehension percentages are within 5% accuracy
- ✅ Recommendation API responds in <200ms
- ✅ UI clearly shows difficulty and personalization
- ✅ All Playwright tests pass with screenshots

---

## 🚀 START WORKING NOW

1. Create branch: `git checkout -b agent-7-smart-recommendations`
2. Start with difficulty analyzer (foundation for everything)
3. Build recommendation engine next
4. Create API endpoints
5. Update frontend
6. Write comprehensive tests
7. Take screenshots of every feature
8. Commit with detailed messages

**GO BUILD THE SMARTEST RECOMMENDATION SYSTEM! 🚀**

