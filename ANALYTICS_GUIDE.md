# 📊 ANALYTICS GUIDE

Complete guide to tracking events and analyzing user behavior in Langflix.

## Table of Contents
- [Overview](#overview)
- [Setup](#setup)
- [Event Tracking](#event-tracking)
- [User Properties](#user-properties)
- [API Usage](#api-usage)
- [Best Practices](#best-practices)

---

## Overview

Langflix uses two analytics platforms:
1. **Mixpanel** - Event tracking, user properties, funnels, and dashboards
2. **Sentry** - Error monitoring, performance tracking, and alerting

### Why Both?

- **Mixpanel**: Answers "what are users doing?" (product analytics)
- **Sentry**: Answers "what's broken?" (error monitoring)

---

## Setup

### 1. Mixpanel Setup

1. **Create Account**
   - Go to: https://mixpanel.com/
   - Sign up for free account (50K events/month)

2. **Create Project**
   - Name: "Langflix Production"
   - Timezone: Your timezone
   - Data Residency: US or EU

3. **Get API Token**
   - Go to: Project Settings > Project Token
   - Copy token
   - Add to `.env`: `MIXPANEL_TOKEN=your_token_here`

### 2. Sentry Setup

1. **Create Account**
   - Go to: https://sentry.io/
   - Sign up for free account

2. **Create Project**
   - Platform: Node.js
   - Name: "Langflix Production"
   - Alert frequency: Real-time

3. **Get DSN**
   - Go to: Settings > Client Keys (DSN)
   - Copy DSN
   - Add to `.env`: `SENTRY_DSN=your_dsn_here`

### 3. Restart Server

```bash
npm start
```

You should see:
```
✅ Mixpanel Analytics initialized
✅ Sentry initialized (environment: production)
```

---

## Event Tracking

### Critical Events

#### User Events

```javascript
const mixpanel = require('./lib/mixpanel-analytics');

// User signed up
mixpanel.trackUserSignup(userId, {
    method: 'email', // or 'google', 'facebook'
    targetLanguage: 'Spanish',
    nativeLanguage: 'English'
});

// User logged in
mixpanel.trackUserLogin(userId, {
    method: 'email'
});

// User completed onboarding
mixpanel.trackOnboardingComplete(userId, {
    languageLevel: 'A2',
    interests: ['travel', 'food', 'culture']
});
```

#### Video Events

```javascript
// Video started
mixpanel.trackVideoStarted(userId, videoId, {
    title: 'Spanish Conversation',
    difficulty: 'A2',
    category: 'conversation',
    duration: 120 // seconds
});

// Video completed
mixpanel.trackVideoCompleted(userId, videoId, {
    watchTime: 115, // seconds watched
    completionRate: 95.8, // percentage
    wordsClicked: 5
});

// Video skipped
mixpanel.trackVideoSkipped(userId, videoId, {
    watchTime: 15, // only watched 15 seconds
    skipReason: 'too_difficult'
});
```

#### Learning Events

```javascript
// Word clicked (to see definition)
mixpanel.trackWordClicked(userId, 'hola', {
    context: 'video',
    contentId: videoId,
    translationLanguage: 'en'
});

// Word saved to vocabulary
mixpanel.trackWordSaved(userId, 'hola', {
    difficulty: 'A1',
    context: 'greeting',
    sentence: 'Hola, ¿cómo estás?'
});

// Word reviewed (SRS)
mixpanel.trackWordReviewed(userId, 'hola', {
    quality: 5, // 1-5 rating
    interval: 7, // days since last review
    correct: true
});

// Word mastered
mixpanel.trackWordMastered(userId, 'hola', {
    totalReviews: 8,
    daysToMaster: 30
});
```

#### Game Events

```javascript
// Game started
mixpanel.trackGameStarted(userId, 'flashcards', {
    difficulty: 'A2',
    wordCount: 20
});

// Game completed
mixpanel.trackGameCompleted(userId, 'flashcards', {
    score: 18,
    totalQuestions: 20,
    accuracy: 90,
    duration: 120 // seconds
});

// Game score
mixpanel.trackGameScore(userId, 'flashcards', 18, {
    accuracy: 90,
    difficulty: 'A2'
});
```

#### Payment Events

```javascript
// Checkout started
mixpanel.trackCheckoutStarted(userId, {
    plan: 'premium_monthly',
    price: 9.99,
    currency: 'USD'
});

// Payment completed
mixpanel.trackPaymentCompleted(userId, 9.99, 'USD', {
    plan: 'premium_monthly',
    paymentMethod: 'card'
});

// Subscription cancelled
mixpanel.trackSubscriptionCancelled(userId, {
    plan: 'premium_monthly',
    reason: 'too_expensive',
    daysSinceSubscription: 45
});
```

#### Engagement Events

```javascript
// Daily active user (automatically tracked)
mixpanel.trackDailyActive(userId);

// Session started (automatically tracked)
mixpanel.trackSessionStarted(userId, {
    platform: 'web',
    deviceType: 'desktop'
});

// Session ended
mixpanel.trackSessionEnded(userId, 1800, { // 30 minutes
    videosWatched: 3,
    wordsLearned: 12,
    gamesPlayed: 1
});
```

### Frontend Integration

In your React/Vue/vanilla JS frontend:

```javascript
// Add to your API calls
async function watchVideo(videoId) {
    // Start video
    await fetch('/api/videos/watch', {
        method: 'POST',
        body: JSON.stringify({ videoId }),
        headers: { 'Content-Type': 'application/json' }
    });
    
    // Track event
    await fetch('/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({
            userId: currentUser.id,
            event: 'Video Started',
            properties: {
                videoId,
                title: video.title,
                difficulty: video.difficulty
            }
        }),
        headers: { 'Content-Type': 'application/json' }
    });
}
```

---

## User Properties

### Setting User Properties

```javascript
// Update complete profile
mixpanel.updateUserProfile(userId, {
    languageLevel: 'A2',
    targetLanguage: 'Spanish',
    nativeLanguage: 'English',
    streak: 5,
    longestStreak: 12,
    totalVideosWatched: 25,
    totalWordsLearned: 150,
    daysSinceSignup: 30,
    subscriptionStatus: 'premium',
    deviceType: 'mobile'
});

// Update streak
mixpanel.updateStreak(userId, 7, 15);

// Increment property
mixpanel.incrementUserProperty(userId, 'Total Videos Watched', 1);
```

### Standard User Properties

Track these properties for every user:

- `Language Level` - Current CEFR level (A1-C2)
- `Target Language` - Language learning (e.g., Spanish)
- `Native Language` - User's native language
- `Days Since Signup` - Days since registration
- `Total Videos Watched` - Lifetime video count
- `Total Words Learned` - Lifetime vocabulary
- `Current Streak` - Current daily streak
- `Longest Streak` - Best streak ever
- `Subscription Status` - free/premium/cancelled
- `Device Type` - mobile/tablet/desktop
- `Last Active` - Last activity timestamp

---

## API Usage

### Analytics Endpoints

#### Get User Dashboard Data

```bash
GET /api/analytics/dashboard/:userId
```

Response:
```json
{
  "success": true,
  "data": {
    "today": {
      "videosWatched": 3,
      "wordsLearned": 12,
      "timeSpentMins": 45
    },
    "week": {
      "totalVideosWatched": 15,
      "totalWordsLearned": 68,
      "activeDays": 5
    },
    "progress": {
      "totalWordsLearned": 250,
      "wordsLastWeek": 68,
      "weeklyChange": 15
    },
    "insights": {
      "insights": [
        {
          "type": "positive",
          "message": "You're strongest in vocabulary (+15% this week)"
        }
      ],
      "predictions": [
        {
          "type": "level",
          "message": "At this pace, B1 level in 45 days"
        }
      ]
    }
  }
}
```

#### Track Custom Event

```bash
POST /api/analytics/track
```

Body:
```json
{
  "userId": "user123",
  "event": "Video Started",
  "properties": {
    "videoId": "video456",
    "difficulty": "A2",
    "category": "conversation"
  }
}
```

#### Get Learning Progress

```bash
GET /api/analytics/user/:userId/progress?days=30
```

#### Get User Insights

```bash
GET /api/analytics/user/:userId/insights
```

#### Get System Metrics (Admin)

```bash
GET /api/analytics/system/metrics
GET /api/analytics/system/funnel
GET /api/analytics/system/performance
```

---

## Best Practices

### 1. Track Everything Important

**DO:**
- Track all user actions (clicks, views, completions)
- Track both successes AND failures
- Track performance metrics (load times, errors)

**DON'T:**
- Track PII (passwords, emails in events)
- Track too granularly (every mouse move)
- Track debugging events in production

### 2. Use Consistent Naming

```javascript
// Good - consistent, descriptive
'Video Started'
'Video Completed'
'Video Skipped'

// Bad - inconsistent, vague
'video_start'
'watched'
'skip video'
```

### 3. Add Context

```javascript
// Good - rich context
mixpanel.trackVideoStarted(userId, videoId, {
    title: 'Spanish Greetings',
    difficulty: 'A2',
    duration: 120,
    category: 'conversation',
    source: 'recommended_feed'
});

// Bad - no context
mixpanel.trackVideoStarted(userId, videoId);
```

### 4. Track User Properties

```javascript
// Update properties when they change
mixpanel.setUserProperties(userId, {
    'Language Level': 'B1', // Leveled up!
    'Total Words Learned': 1500
});
```

### 5. Use Funnels

Track complete user journeys:

```javascript
// Onboarding funnel
mixpanel.trackUserSignup(userId);
mixpanel.trackOnboardingComplete(userId);
mixpanel.trackVideoStarted(userId, firstVideoId);
mixpanel.trackWordSaved(userId, firstWord);
```

### 6. Monitor Errors

```javascript
const errorTracking = require('./lib/comprehensive-error-tracking');

try {
    await riskyOperation();
} catch (error) {
    errorTracking.captureAPIError(error, req, {
        operation: 'riskyOperation',
        userId
    });
    throw error;
}
```

### 7. Add Breadcrumbs

```javascript
errorTracking.addBreadcrumb(
    'Started video processing',
    'video',
    { videoId, userId }
);

// ... processing happens ...

errorTracking.addBreadcrumb(
    'Completed video processing',
    'video',
    { videoId, duration: 5000 }
);
```

---

## Common Questions

### How do I see events in Mixpanel?

1. Go to: https://mixpanel.com/
2. Select your project
3. Click "Events" in sidebar
4. Search for event name (e.g., "Video Started")

### How do I create a funnel?

1. Go to Mixpanel > Funnels
2. Click "Create Funnel"
3. Add steps:
   - User Signed Up
   - User Completed Onboarding
   - Video Started
   - Word Saved
4. Save and view conversion rates

### How do I set up alerts?

1. Go to Sentry > Alerts > Create Alert
2. Choose condition: "Errors in a project"
3. Set threshold: > 10 errors in 1 hour
4. Add actions: Email/Slack notification
5. Save alert

### How do I test analytics locally?

Set `NODE_ENV=development` and events will still be tracked but marked as development. Check Mixpanel with environment filter.

---

## Troubleshooting

### Events not showing in Mixpanel

1. Check token: `echo $MIXPANEL_TOKEN`
2. Check logs: Look for "Mixpanel Analytics initialized"
3. Check events: Call `/api/analytics/track` directly
4. Check Mixpanel: Events can take 1-2 minutes to appear

### Sentry not capturing errors

1. Check DSN: `echo $SENTRY_DSN`
2. Check initialization: Look for "Sentry initialized"
3. Test error: `throw new Error('Test error')`
4. Check Sentry dashboard: Issues tab

### High error rate alerts

1. Check Sentry dashboard for error details
2. Look at error trends (spike or sustained?)
3. Check recent deployments
4. Review stack traces
5. Check if it affects all users or specific ones

---

## Next Steps

1. ✅ Set up Mixpanel and Sentry accounts
2. ✅ Add tokens to `.env` file
3. ✅ Restart server
4. 📊 Check [METRICS_DASHBOARD.md](./METRICS_DASHBOARD.md) for key metrics
5. 🔍 Read [ERROR_MONITORING_GUIDE.md](./ERROR_MONITORING_GUIDE.md) for error tracking
6. 📈 Review [DATA_ANALYSIS_PLAYBOOK.md](./DATA_ANALYSIS_PLAYBOOK.md) for insights

---

**Questions?** Check our documentation or create an issue on GitHub.

