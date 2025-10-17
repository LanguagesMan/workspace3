# 🎯 GENIUS Multi-Signal Level Detection System

## Overview

This system uses **7 different signals** to accurately detect and dynamically adjust a user's Spanish level (A1-C2). It combines explicit user feedback (Hard/Easy buttons) with implicit behavioral signals (watch patterns, word interactions) to create the most accurate level detection possible.

## System Architecture

### 1. Signal Types & Weights

The system weighs different signals based on reliability:

| Signal | Weight | Description | Why This Weight? |
|--------|--------|-------------|-----------------|
| **marked_hard** | 50 | User clicks "Too Hard" button | User explicitly says content is too hard - STRONGEST negative signal |
| **marked_easy** | 50 | User clicks "Too Easy" button | User explicitly says content is too easy - STRONGEST positive signal |
| **assessment** | 30 | Initial assessment test result | Good starting point but fades over time as behavior matters more |
| **completion** | 15 | User watches 70%+ of video | Good engagement signal - user is comfortable |
| **skip** | 10 | User skips video (<30% watched) | Might indicate difficulty or just lack of interest |
| **word_save** | 8 | User saves word to vocabulary | Shows engagement with that difficulty level |
| **word_click** | 3 | User clicks word to see translation | Curiosity click - weakest signal |

### 2. Level Detection Algorithm

```javascript
For each signal:
  1. Apply time decay (recent signals matter more)
  2. Multiply by signal weight
  3. Vote for appropriate level:
     - marked_easy → promote user ABOVE this level
     - marked_hard → demote user BELOW this level
     - completion → user is comfortable AT this level
     - skip → user might struggle AT this level

Calculate net scores for all levels (A1-C2)
Find level with highest score
Require 20+ point difference to change
Only move 1 level at a time (prevents over-promotion)
```

### 3. Time Decay

**Recent behavior matters more than old behavior:**
- Last 10 signals: 100% weight
- Older signals (11-30): 50% weight
- Signals older than 30: Discarded

This ensures the system adapts quickly to user progress.

### 4. Safety Mechanisms

**Prevent erratic changes:**
- Minimum 5 signals required before first adjustment
- Require 20+ point difference to change levels
- Maximum 1 level change at a time
- Show notification to user when level changes

## User Experience

### Hard/Easy Buttons

**Location**: Right sidebar on every video (green "Easy" arrow up, red "Hard" arrow down)

**When to use:**
- **Too Easy**: Video feels way too simple → System will show harder content
- **Too Hard**: Can't understand video → System will show easier content
- **Just Right**: Don't click anything → Watching means it's appropriate

**Visual Feedback:**
- Button animates when clicked (scales up 1.3x)
- Background changes to solid color momentarily
- Console logs the feedback

### Level Change Notifications

When your level changes, you'll see a black toast notification at the top:
- **🎉 Level Up!** - When promoted (e.g., A2 → B1)
- **📚 Level adjusted** - When demoted for better learning

Notification disappears after 3 seconds.

### Profile Integration

Your current level is:
- Saved to `localStorage['userLevel']`
- Synced to Supabase `user_metadata.level` (if logged in)
- Visible in profile page (coming soon)
- Updates feed algorithm immediately

## Technical Implementation

### Files Modified

**`/public/tiktok-video-feed.html`:**

**CSS Styles (Lines 314-378):**
- `.too-easy-btn` - Green button with hover/active states
- `.too-hard-btn` - Red button with hover/active states
- `@keyframes feedbackAnimation` - Button press animation
- `@keyframes slideDown/slideUp` - Notification animations

**Button HTML (Lines 2469-2482):**
```html
<button class="sidebar-button too-easy-btn" onclick="markVideoEasy(...)">
  <svg>...</svg>
  <span>Easy</span>
</button>

<button class="sidebar-button too-hard-btn" onclick="markVideoHard(...)">
  <svg>...</svg>
  <span>Hard</span>
</button>
```

**Tracking Functions (Lines 3241-3290):**
- `markVideoEasy()` - Handles "Too Easy" clicks
- `markVideoHard()` - Handles "Too Hard" clicks
- Both call `updateGeniusLevelDetection()` immediately

**Genius Algorithm (Lines 3165-3333):**
- `updateGeniusLevelDetection()` - Main algorithm (168 lines)
- `showLevelChangeNotification()` - Toast notification
- `updateDynamicUserLevel` - Backward compatibility alias

### Data Storage

All behavioral data stored in `localStorage['behaviorTracker']`:

```javascript
{
  // Hard/Easy button clicks
  easyMarked: [
    { videoId, level, difficulty, timestamp }
  ],
  hardMarked: [
    { videoId, level, difficulty, timestamp }
  ],

  // All signals for level detection
  levelSignals: [
    {
      level: "B1",
      difficulty: 45,
      signalType: "marked_easy", // or marked_hard, completion, skip, etc.
      timestamp: 1728518500000
    }
  ],

  // Video watch patterns
  skipPatterns: [...],
  completionPatterns: [...],

  // Interest tracking per level
  interests: {
    "B1": { completions: 12, skips: 3, engagementScore: 105 }
  }
}
```

User level stored in:
- `localStorage['userLevel']` - "A1", "A2", "B1", etc.
- Supabase `auth.users.user_metadata.level` - Synced if logged in

### Supabase Integration

When level changes and user is logged in:

```javascript
supabase.auth.updateUser({
  data: { level: newLevel }
})
```

This ensures level persists across devices.

## Example Scenarios

### Scenario 1: New User

1. Takes assessment test → Placed at A2
2. Watches first video (A2) → Completes it ✅
3. Clicks "Too Easy" on second video (A2)
4. System detects: `marked_easy` (weight 50) + `completion` (weight 15)
5. **Result**: Promoted to B1 after just 2 interactions

### Scenario 2: Struggling Learner

1. Current level: B1
2. Skips 3 B1 videos in a row (each is `skip` signal, weight 10)
3. Clicks "Too Hard" on 4th B1 video (weight 50)
4. System detects: Strong evidence user is struggling
5. **Result**: Demoted to A2 for better learning experience

### Scenario 3: Consistent Progress

1. Current level: A2
2. Over 2 weeks:
   - Completes 20 A2 videos
   - Saves 15 A2-level words
   - Never clicks "Too Hard"
3. System accumulates positive signals
4. **Result**: Gradually promoted to B1

## Console Logging

Watch Chrome DevTools Console for real-time tracking:

```
✅ User marked video as TOO EASY: video_123 (B1, difficulty 45)
🎯 LEVEL ADJUSTED: B1 → B2
📊 Scores: {"A1":0,"A2":10,"B1":-25,"B2":75,"C1":20,"C2":0}
💡 Based on 15 recent signals
✅ Level synced to Supabase: B2
```

## Testing the System

### Manual Test:
1. Open http://localhost:3001
2. Watch a few videos
3. Click "Too Easy" or "Too Hard" buttons
4. Check console for level adjustments
5. Verify notification appears

### Check Current Level:
```javascript
// In Chrome DevTools Console:
localStorage.getItem('userLevel')
```

### Check All Signals:
```javascript
JSON.parse(localStorage.getItem('behaviorTracker')).levelSignals
```

### Simulate Level Change:
```javascript
// Force a level change to test notification
showLevelChangeNotification('A2', 'B1')
```

## Advantages Over Traditional Systems

### Traditional Approach:
- ❌ One-time assessment test only
- ❌ Level never changes
- ❌ No adaptation to user progress
- ❌ Ignores user behavior

### Our Genius System:
- ✅ Continuous monitoring of 7 signals
- ✅ Dynamic level adjustment
- ✅ Adapts to user progress in real-time
- ✅ User has explicit control (Hard/Easy buttons)
- ✅ Weighs recent behavior more heavily
- ✅ Prevents erratic changes (safety mechanisms)
- ✅ Syncs across devices (Supabase)

## Success Metrics

**Target Accuracy**: 95%+ (user should feel content is "just right")

**How to measure**:
- Track Hard/Easy button click rate (should be <5%)
- Track completion rate (should be >70%)
- Track session length (should increase over time)
- User surveys ("Is the content difficulty appropriate?")

**Expected Behavior**:
- New users: 2-3 interactions to find right level
- Established users: Level changes every 2-4 weeks as they progress
- Advanced users: Level stabilizes at B2/C1

## Future Enhancements

1. **Topic-specific levels** - "You're B1 in conversation but A2 in business Spanish"
2. **Confidence scoring** - Show how confident the system is about your level
3. **A/B testing** - Test different weight configurations
4. **ML model** - Train on thousands of users to optimize weights
5. **Predictive analytics** - "You'll reach B2 in 3 weeks at this pace"
6. **Social features** - "95% of B1 users completed this video"

## Maintenance

**When to adjust weights**:
- If users are promoted too quickly → Increase change threshold
- If Hard/Easy buttons are overused → Decrease their weight
- If completions don't correlate with level → Adjust completion weight

**How to debug**:
1. Check console logs for signal tracking
2. Inspect `behaviorTracker` in localStorage
3. Verify Supabase sync is working
4. Test with different user scenarios

---

**Last Updated:** 2025-10-10
**Status:** ✅ Production Ready
**Algorithm Version:** 1.0
**Tested:** Manual testing complete, awaiting user feedback
