# 🏗️ Genius Adaptive System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  (Video Feed, Articles, Quiz, Word Translation)                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UI COMPONENTS                                │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  Difficulty      │  │  Beginner Mode   │                   │
│  │  Controls        │  │  Helper          │                   │
│  │  • Too Hard      │  │  • Tips          │                   │
│  │  • Perfect       │  │  • Milestones    │                   │
│  │  • Too Easy      │  │  • Extra Hints   │                   │
│  └──────────────────┘  └──────────────────┘                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  POST /api/adaptive/adjust-level                       │   │
│  │  GET  /api/adaptive/perfect-content/:userId            │   │
│  │  POST /api/adaptive/simplify                           │   │
│  │  POST /api/adaptive/track-interaction                  │   │
│  │  GET  /api/adaptive/user-profile/:userId               │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Genius Adaptive System                                  │ │
│  │  • assessInitialLevel()                                  │ │
│  │  • calculateDynamicLevel()                               │ │
│  │  • scoreContentForUser() [GOLDILOCKS]                    │ │
│  │  • adjustDifficultyInRealTime()                          │ │
│  │  • simplifyContent()                                     │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Behavioral Tracker                                      │ │
│  │  • trackWordClick()                                      │ │
│  │  • trackCompletionRate()                                 │ │
│  │  • trackButtonClick()                                    │ │
│  │  • trackQuizPerformance()                                │ │
│  │  • calculateUserSignals()                                │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Adaptive Learning Engine                                │ │
│  │  • calculateUserLevel()                                  │ │
│  │  • recommendContent()                                    │ │
│  │  • adaptInRealTime()                                     │ │
│  │  • simplifyWithGPT4()                                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Frequency Word System                                   │ │
│  │  • getWordsByLevel()                                     │ │
│  │  • getWordsByRank()                                      │ │
│  │  • calculateLevelByWordCount()                           │ │
│  │  • 1000+ words (A1-C2)                                   │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (Supabase)                    │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  user_adaptive_  │  │  behavioral_     │                   │
│  │  profile         │  │  interactions    │                   │
│  │  • level         │  │  • type          │                   │
│  │  • word_count    │  │  • data          │                   │
│  │  • metrics       │  │  • signal        │                   │
│  └──────────────────┘  └──────────────────┘                   │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  content_        │  │  user_word_      │                   │
│  │  difficulty_     │  │  knowledge       │                   │
│  │  cache           │  │  • word          │                   │
│  │  • scores        │  │  • status        │                   │
│  │  • goldilocks    │  │  • srs_data      │                   │
│  └──────────────────┘  └──────────────────┘                   │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  level_change_   │  │  user_milestones │                   │
│  │  history         │  │  • milestone     │                   │
│  │  • old_level     │  │  • achieved      │                   │
│  │  • new_level     │  │  • celebrated    │                   │
│  │  • reason        │  │  • reward        │                   │
│  └──────────────────┘  └──────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. User Interaction → Signal Tracking

```
User Action (click word, complete video, take quiz)
           ↓
Behavioral Tracker captures interaction
           ↓
Signal generated (fast_learner, struggling, perfect, etc.)
           ↓
Stored in behavioral_interactions table
```

### 2. Content Recommendation Flow

```
User requests content
           ↓
Genius Adaptive System loads user profile
           ↓
Goldilocks algorithm scores all content
  • 3-7 new words = 85-100 score (PERFECT)
  • <3 new words = too_easy
  • >7 new words = too_hard/challenging
           ↓
Content sorted by score (best matches first)
           ↓
Filtered by beginner mode (if active)
           ↓
Returned to user
```

### 3. Real-Time Level Adjustment

```
User clicks "Too Hard" button
           ↓
API: /api/adaptive/track-interaction
           ↓
Behavioral Tracker: trackButtonClick()
           ↓
Genius Adaptive: adjustDifficultyInRealTime()
  • Calculate adjustment factor
  • Consider all signals (click speed, completion, quiz, etc.)
  • Apply weighted formula
           ↓
Level changed (e.g., B1 → A2)
           ↓
Stored in level_change_history
           ↓
User profile updated
           ↓
Response sent with new level + recommended content
           ↓
UI updates immediately
```

### 4. Milestone Celebration Flow

```
User saves a new word
           ↓
API: /api/adaptive/track-interaction (word_save)
           ↓
Word count incremented
           ↓
Genius Adaptive: checkMilestone()
           ↓
If milestone reached (10, 20, 50, 100, etc.):
  • Create milestone record
  • Generate celebration message
  • Return milestone data
           ↓
UI shows celebration popup 🎉
           ↓
User clicks "Continue Learning"
           ↓
Milestone marked as celebrated
```

---

## Key Algorithms

### 1. Goldilocks Algorithm

```javascript
function scoreContent(userId, content) {
  // Extract words from content
  const words = extractWords(content.text);
  
  // Count unknown words
  const unknownWords = words.filter(w => !user.knowsWord(w));
  const count = unknownWords.length;
  
  // Score based on count
  if (count >= 3 && count <= 7) {
    // GOLDILOCKS ZONE - Perfect!
    return 100 - Math.abs(count - 5) * 5; // 85-100 score
  } else if (count < 3) {
    // Too easy
    return 40 + (count * 10); // 40-60 score
  } else if (count <= 15) {
    // Challenging but manageable
    return 100 - (count - 7) * 5; // 30-65 score
  } else {
    // Too hard
    return Math.max(0, 20 - (count - 15) * 2); // 0-20 score
  }
}
```

### 2. Real-Time Adjustment Formula

```javascript
function calculateAdjustment(userId, signals) {
  let factor = 0;
  
  // Click speed (fast = increase, slow = decrease)
  if (signals.clickSpeed < 2000) factor += 0.2;
  if (signals.clickSpeed > 7000) factor -= 0.3;
  
  // Completion rate
  if (signals.completionRate > 90) factor += 0.2;
  if (signals.completionRate < 30) factor -= 0.5;
  
  // Quiz performance
  if (signals.quizScore > 80) factor += 0.3;
  if (signals.quizScore < 50) factor -= 0.4;
  
  // Direct feedback (weighted heavily!)
  factor += signals.tooEasyClicks * 0.3;
  factor -= signals.tooHardClicks * 0.5;
  
  // Apply adjustment
  if (factor >= 0.5) return increaseLevel();
  if (factor <= -0.5) return decreaseLevel();
  return maintainLevel();
}
```

---

## Signal Detection System

### Input Signals

| Signal | Threshold | Action |
|--------|-----------|--------|
| **Click Speed** | <2s | User knows words → Increase level |
| | >5s | User struggling → Decrease level |
| **Completion** | >90% | Too easy → Increase level |
| | <30% | Too hard → Decrease level |
| **Quiz Score** | >80% | Mastery → Increase level |
| | <50% | Difficulty → Decrease level |
| **Too Hard Button** | 1 click | Immediate decrease |
| | 3 clicks | Urgent adjustment |
| **Too Easy Button** | 1 click | Immediate increase |
| | 3 clicks | Major increase |

### Signal Processing

```
Multiple signals collected
           ↓
Weighted by reliability:
  • Button clicks: Weight 4 (most reliable)
  • Quiz scores: Weight 3
  • Click speed: Weight 2
  • Completion: Weight 2
           ↓
Calculate total adjustment factor
           ↓
Apply threshold (±0.5 for level change)
           ↓
Level adjusted (or maintained)
```

---

## Beginner Protection System

### Activation Criteria

```
IF user.wordCount < 100:
  ▶ Activate Beginner Mode
  
Restrictions:
  • Frequency range: 1-500 only
  • Max new words: 3 (not 7)
  • Show extra hints: YES
  • Slower progression: YES
  • Celebration frequency: HIGHER
```

### Content Filtering

```
Normal mode: 3-7 new words optimal
           ↓
Beginner mode: 1-3 new words optimal
           ↓
Content scored with beginner boost:
  IF newWords <= 3: score += 20
           ↓
Only ultra-high frequency words shown (rank 1-500)
           ↓
Milestones every 10 words (vs 50 for advanced)
```

---

## Integration Points

### Frontend Integration

```javascript
// 1. On page load
const profile = await fetch(`/api/adaptive/user-profile/${userId}`);
displayLevel(profile.currentLevel);
displayProgress(profile.nextMilestone);

// 2. On content view
const content = await fetch(`/api/adaptive/perfect-content/${userId}`);
renderVideos(content.recommended); // Goldilocks zone only

// 3. On word click
await fetch('/api/adaptive/track-interaction', {
  method: 'POST',
  body: JSON.stringify({
    userId,
    interactionType: 'word_click',
    data: { word, timestamp }
  })
});

// 4. On video complete
await fetch('/api/adaptive/track-interaction', {
  method: 'POST',
  body: JSON.stringify({
    userId,
    interactionType: 'completion',
    data: { contentId, percentage: 85 }
  })
});

// 5. On difficulty button click
await fetch('/api/adaptive/track-interaction', {
  method: 'POST',
  body: JSON.stringify({
    userId,
    interactionType: 'button_click',
    data: { buttonType: 'too_hard', contentId }
  })
});
```

---

## Performance Considerations

### Caching Strategy

```
1. Content Difficulty Cache
   • Pre-calculate Goldilocks scores for all content
   • Cache in content_difficulty_cache table
   • Refresh when content updated

2. User Profile Cache
   • Store in memory (Map) for session
   • Sync to database periodically
   • Invalidate on level change

3. Simplification Cache
   • Cache GPT-4 simplifications
   • Key: text + targetLevel
   • Expire after 1 hour
```

### Database Indexes

```sql
-- Fast user profile lookups
CREATE INDEX idx_user_adaptive_profile_user_id 
  ON user_adaptive_profile(user_id);

-- Fast interaction queries
CREATE INDEX idx_behavioral_interactions_user_id 
  ON behavioral_interactions(user_id);

-- Fast content lookups
CREATE INDEX idx_content_difficulty_content_id 
  ON content_difficulty_cache(content_id);
```

---

## Monitoring & Analytics

### Key Metrics to Track

```
1. Level Adjustment Accuracy
   • How often do users click "Perfect" vs "Too Hard/Easy"?
   • Target: >70% "Perfect" clicks

2. Goldilocks Zone Hit Rate
   • % of content in goldilocks zone (3-7 new words)
   • Target: >60%

3. Completion Rate Improvement
   • Compare completion rates before/after system
   • Target: +20% improvement

4. Learning Velocity
   • Words learned per day
   • Track by level (A1, A2, B1, etc.)
   • Target: 5-10 words/day for active users

5. Time to Milestone
   • Days to reach 100, 300, 500, 1000 words
   • Compare to baseline
   • Target: 20% faster than manual progression
```

### Dashboard Queries

```sql
-- Level distribution
SELECT current_level, COUNT(*) 
FROM user_adaptive_profile 
GROUP BY current_level;

-- Average adjustment frequency
SELECT AVG(adjustment_count) 
FROM (
  SELECT user_id, COUNT(*) as adjustment_count
  FROM level_change_history
  GROUP BY user_id
);

-- Most common signals
SELECT interaction_type, COUNT(*) 
FROM behavioral_interactions 
GROUP BY interaction_type 
ORDER BY COUNT(*) DESC;
```

---

## Security & Privacy

### Row Level Security (RLS)

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile"
  ON user_adaptive_profile FOR SELECT
  USING (auth.uid() = user_id);

-- No access to other users' data
CREATE POLICY "Users can view own interactions"
  ON behavioral_interactions FOR SELECT
  USING (auth.uid() = user_id);
```

### Data Privacy

```
• All user data encrypted at rest
• No PII stored in behavioral_interactions
• Content cache is public (no user data)
• Level history is private (RLS enforced)
• Milestones are private (RLS enforced)
```

---

## Scalability

### Current Design

```
✅ In-memory caching for active users
✅ Database for persistence
✅ Indexed queries for fast lookups
✅ Stateless API endpoints
```

### Future Optimizations

```
1. Redis for session caching
2. CDN for content difficulty cache
3. Background jobs for heavy calculations
4. Sharding for large user bases
5. ML model for prediction (optional)
```

---

## Error Handling

### Graceful Degradation

```
IF API call fails:
  ▶ Use last known level
  ▶ Log error for monitoring
  ▶ Continue showing content

IF database unavailable:
  ▶ Use in-memory cache
  ▶ Queue writes for later
  ▶ Notify user if critical

IF GPT-4 API fails:
  ▶ Fall back to rule-based simplification
  ▶ Log warning
  ▶ Continue operation
```

---

## Summary

This architecture provides:

✅ **Modularity** - Each component has single responsibility  
✅ **Scalability** - Caching + indexes for performance  
✅ **Security** - RLS policies protect user data  
✅ **Reliability** - Graceful degradation on failures  
✅ **Testability** - Comprehensive test suite  
✅ **Maintainability** - Clear separation of concerns  

**Result: A production-ready adaptive learning system that rivals industry leaders!**

---

*Architecture Documentation - October 16, 2025*

