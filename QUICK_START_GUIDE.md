# 🚀 Quick Start Guide - Smart Video Recommendations

## ✨ What You Got

A **genius-level video recommendation system** that:
- ✅ Never shows the same video twice
- ✅ Automatically detects user interests from behavior
- ✅ Matches perfect difficulty level (A1-C2)
- ✅ Works like TikTok's algorithm but for language learning

---

## 🎯 Quick Test (5 Minutes)

### 1. Start the Server

```bash
cd /Users/mindful/_projects/workspace3
npm start
```

Server will start on `http://localhost:3000`

### 2. Test with curl

**Get recommendations for a new user:**
```bash
curl "http://localhost:3000/api/videos/smart-recommendations?userId=testuser1&level=B1&count=10" | jq
```

**Watch a video (track it):**
```bash
curl -X POST http://localhost:3000/api/video-interactions/track \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "testuser1",
    "videoId": "video_1",
    "interactionType": "complete",
    "completionRate": 1.0,
    "watchTime": 45,
    "videoDuration": 45,
    "videoMetadata": {
      "category": "food",
      "level": "B1",
      "title": "Spanish Cooking"
    }
  }'
```

**Get new recommendations (won't include video_1):**
```bash
curl "http://localhost:3000/api/videos/smart-recommendations?userId=testuser1&level=B1&count=10" | jq
```

**Check detected interests:**
```bash
curl "http://localhost:3000/api/video-interactions/interests/testuser1" | jq
```

### 3. Test Different User Behaviors

**User who loves food videos (high completion):**
```bash
# Watch 3 food videos with high completion
for i in {1..3}; do
  curl -X POST http://localhost:3000/api/video-interactions/track \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "foodlover",
      "videoId": "food_'$i'",
      "interactionType": "complete",
      "completionRate": 1.0,
      "watchTime": 30,
      "videoDuration": 30,
      "videoMetadata": {"category": "food", "level": "A2"}
    }'
done

# Check interests (should show "food" with high weight)
curl "http://localhost:3000/api/video-interactions/interests/foodlover" | jq
```

**User who skips sports videos:**
```bash
# Skip 3 sports videos
for i in {1..3}; do
  curl -X POST http://localhost:3000/api/video-interactions/track \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "nosports",
      "videoId": "sports_'$i'",
      "interactionType": "skip",
      "completionRate": 0.1,
      "watchTime": 3,
      "videoDuration": 30,
      "videoMetadata": {"category": "sports", "level": "A2"}
    }'
done

# Recommendations will avoid sports content
curl "http://localhost:3000/api/videos/smart-recommendations?userId=nosports&level=A2&count=10" | jq
```

---

## 🎮 Frontend Integration

### Replace Your Current Video Feed

**Old Code:**
```javascript
// ❌ Shows random or all videos
const videos = await fetch('/api/videos');
```

**New Code:**
```javascript
// ✅ Smart personalized recommendations
const userId = getCurrentUserId();
const userLevel = getUserLevel(); // A1, A2, B1, B2, C1, or C2

const response = await fetch(
  `/api/videos/smart-recommendations?userId=${userId}&level=${userLevel}&count=20`
);
const { videos } = await response.json();

// Display videos - they're already perfectly matched!
displayVideos(videos);
```

### Track Every Video Interaction

```javascript
// When video ends
video.addEventListener('ended', async () => {
  const completionRate = video.currentTime / video.duration;
  
  await fetch('/api/video-interactions/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: getCurrentUserId(),
      videoId: currentVideo.id,
      interactionType: completionRate > 0.9 ? 'complete' : 'view',
      completionRate,
      watchTime: video.currentTime,
      videoDuration: video.duration,
      wordClicks: getWordClickCount(), // How many words user clicked
      videoMetadata: {
        title: currentVideo.title,
        category: currentVideo.category,
        theme: currentVideo.theme,
        level: currentVideo.level
      }
    })
  });
});

// When user skips
function onSkipVideo() {
  await fetch('/api/video-interactions/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: getCurrentUserId(),
      videoId: currentVideo.id,
      interactionType: 'skip',
      completionRate: video.currentTime / video.duration,
      watchTime: video.currentTime,
      videoDuration: video.duration,
      videoMetadata: {
        category: currentVideo.category,
        level: currentVideo.level
      }
    })
  });
}

// When user replays
function onReplayVideo() {
  await fetch('/api/video-interactions/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: getCurrentUserId(),
      videoId: currentVideo.id,
      interactionType: 'rewatch',
      completionRate: 1.0,
      watchTime: video.duration,
      videoDuration: video.duration,
      rewatch: true, // Strong positive signal!
      videoMetadata: {
        category: currentVideo.category,
        level: currentVideo.level
      }
    })
  });
}
```

### Add Onboarding for New Users

```javascript
async function onboardNewUser(userId) {
  // Start assessment
  const startResponse = await fetch('/api/onboarding-assessment/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  const { sessionId, nextVideo, progress } = await startResponse.json();
  
  // Show first assessment video
  showAssessmentVideo(nextVideo);
  
  // After user watches, submit response
  async function submitAssessmentResponse(videoId, completionRate, wordClicks) {
    const response = await fetch('/api/onboarding-assessment/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        videoId,
        level: nextVideo.level,
        completionRate,
        watchTime: video.currentTime,
        videoDuration: video.duration,
        wordClicks,
        totalWords: 100, // Estimate from transcription
        skipped: completionRate < 0.3
      })
    });
    
    const data = await response.json();
    
    if (data.completed) {
      // Assessment complete!
      const { estimatedLevel, confidence, recommendation } = data.results;
      showResults(estimatedLevel, recommendation);
      
      // Start regular browsing
      startBrowsing(userId, estimatedLevel);
    } else {
      // Show next assessment video
      showAssessmentVideo(data.nextVideo);
    }
  }
}
```

---

## 📊 Monitor User Behavior

### Check User Stats

```bash
curl "http://localhost:3000/api/video-interactions/stats/testuser1" | jq
```

**Returns:**
```json
{
  "success": true,
  "stats": {
    "userId": "testuser1",
    "level": "B1",
    "totalWatched": 25,
    "topInterests": [
      { "interest": "food", "weight": 0.8 },
      { "interest": "travel", "weight": 0.6 }
    ],
    "topThemes": [
      { "theme": "cooking", "count": 12 },
      { "theme": "tourism", "count": 8 }
    ],
    "behaviorPatterns": {
      "avgCompletionRate": 85,
      "avgWatchTime": 35,
      "skipRate": 15,
      "rewatchRate": 5
    },
    "knownWordsCount": 450
  }
}
```

### View Watch History

```bash
curl "http://localhost:3000/api/video-interactions/history/testuser1?limit=10" | jq
```

---

## 🧪 Run Tests

```bash
# Install Playwright if needed
npx playwright install

# Run tests
npx playwright test tests/smart-recommendations.spec.js --reporter=list
```

**Test Coverage:**
- ✅ New user recommendations
- ✅ No duplicate videos
- ✅ Interest detection
- ✅ Level matching
- ✅ Behavior tracking
- ✅ Performance (<1s)
- ✅ Multi-user scenarios
- ✅ Onboarding assessment

---

## 🎯 Real-World Usage Patterns

### Pattern 1: New User Journey

1. User signs up → **Onboarding assessment** (5 videos, ~2 min)
2. System detects level (e.g., B1) with 85% confidence
3. User starts browsing → Gets **20 B1-level videos** (70% B1, 20% A2, 10% B2)
4. User watches 3 food videos → System detects **food interest**
5. Next batch → More food videos, still B1 level
6. User skips travel video → System **reduces travel recommendations**
7. User rewatches cooking video → System **boosts cooking content**

### Pattern 2: Active User (Day 30)

- Watched: 150 videos
- Interests detected: Food (0.9), Travel (0.7), Music (0.5)
- Level progressed: B1 → B2
- Behavior: 90% completion rate, 8% skip rate
- **Result:** Highly personalized feed, perfect difficulty, no repeats!

### Pattern 3: Returning User (3 months later)

- System remembers ALL 500+ watched videos
- Interests still preserved (food, travel)
- Level updated to C1
- **Never shows old videos** - Fresh content only!

---

## ⚙️ Configuration Options

### Adjust Recommendation Weights

Edit `lib/smart-video-recommender.js`:

```javascript
// Line ~70: Score calculation
const total = (
    breakdown.levelMatch * 0.35 +       // Adjust these weights
    breakdown.interestMatch * 0.30 +
    breakdown.vocabularyMatch * 0.20 +
    breakdown.novelty * 0.10 +
    breakdown.engagement * 0.05
);
```

### Change Diversity Factor

```javascript
// More exploration (less personalized)
diversityFactor: 0.5  // 50% random

// Less exploration (more personalized)
diversityFactor: 0.1  // 10% random
```

### Adjust Level Distribution

Edit `lib/adaptive-difficulty-engine.js`:

```javascript
// Line ~30: Distribution
this.DISTRIBUTION = {
    atLevel: 0.70,  // 70% at user level
    easier: 0.20,   // 20% easier
    harder: 0.10    // 10% harder
};
```

---

## 🐛 Troubleshooting

### Issue: Recommendations show repeats

**Cause:** Interactions not being tracked

**Fix:** Make sure you call `/api/video-interactions/track` after every video

### Issue: Interests not detected

**Cause:** Need more data or missing metadata

**Fix:** Track at least 5-10 videos with rich metadata:
```javascript
videoMetadata: {
  title: "Spanish Cooking Basics",  // Important!
  category: "food",
  theme: "cooking",
  tags: ["recipe", "ingredients"]
}
```

### Issue: All videos same level

**Cause:** Video catalog doesn't have level diversity

**Fix:** Ensure your videos have proper CEFR levels assigned

---

## 📚 Additional Resources

- **Full API Documentation:** `SMART_VIDEO_RECOMMENDATIONS_GUIDE.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **Source Code:** `LANGFLIX_SOURCE.md`

---

## 🎉 You're Ready!

You now have a **world-class recommendation system** that rivals TikTok and Netflix! 

**What happens when user opens app:**
1. System loads user profile (watch history, interests, level)
2. Filters out ALL watched videos
3. Scores remaining videos based on level, interests, vocabulary
4. Returns top 20 perfectly-matched videos
5. User watches, system learns, cycle repeats
6. **Result: Infinite feed of fresh, perfectly-leveled, interesting content!** 🚀

---

**Need Help?**
- Check `SMART_VIDEO_RECOMMENDATIONS_GUIDE.md` for details
- Run tests: `npx playwright test tests/smart-recommendations.spec.js`
- View logs: `data/interaction-logs/`

**Have questions?** Just ask! 😊

