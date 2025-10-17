# 📊 Mixpanel Analytics Setup Guide

## Overview
This guide walks you through setting up Mixpanel analytics for the Spanish learning app to track user behavior, engagement metrics, and business KPIs.

## Quick Start (5 minutes)

### 1. Create Mixpanel Account
1. Go to [https://mixpanel.com/register](https://mixpanel.com/register)
2. Sign up for free account (100K events/month free tier)
3. Create new project named "Langflix Spanish Learning"
4. Select "Web" as your platform

### 2. Get Your Project Token
1. Click the **Settings gear** icon (top right)
2. Select **Project Settings**
3. Scroll to **Access Keys** section
4. Copy your **Project Token** (alphanumeric string)

### 3. Add Token to Environment Variables

**In `.env` file:**
```bash
# Mixpanel Analytics
MIXPANEL_TOKEN="your-project-token-here"
```

**In `.env.example` file (for reference):**
```bash
# Mixpanel Analytics (get from https://mixpanel.com/settings/project)
MIXPANEL_TOKEN="your-project-token-here"
```

### 4. Install Mixpanel SDK (if not already installed)
```bash
npm install mixpanel mixpanel-browser --save
```

### 5. Restart Your Server
```bash
npm run dev
```

## Architecture Overview

### Two-Layer Tracking System

**1. Server-Side Tracking** (`lib/mixpanel-analytics.js`)
- User authentication events (signup, login)
- Subscription payments
- Server-side operations
- Sensitive operations

**2. Client-Side Tracking** (`public/js/mixpanel-client.js`)
- Video watching behavior
- UI interactions
- Game completions
- Word clicks
- Real-time engagement

## Events Being Tracked

### Core User Events
- ✅ `User Signed Up` - New user registration
- ✅ `User Logged In` - User login
- ✅ `User Completed Onboarding` - Finished onboarding flow

### Video Events
- ✅ `Video Started` - User starts watching video
- ✅ `Video Completed` - User watches ≥80% of video
- ✅ `Video Skipped` - User skips to next video

### Learning Events
- ✅ `Word Clicked` - User clicks word for translation
- ✅ `Word Saved` - User saves word to vocabulary
- ✅ `Word Reviewed` - User reviews saved word
- ✅ `Word Mastered` - User masters word (100% correct 3x)

### Game Events
- ✅ `Game Started` - User starts any game
- ✅ `Game Completed` - User finishes game
- ✅ `Game Score` - Game score achieved

### Premium/Payment Events
- ✅ `Premium Upgrade Clicked` - User clicks upgrade button
- ✅ `Checkout Started` - User enters checkout flow
- ✅ `Payment Completed` - Successful payment
- ✅ `Subscription Cancelled` - User cancels subscription

### Engagement Events
- ✅ `Session Started` - User session begins
- ✅ `Session Ended` - User session ends (track duration)
- ✅ `Daily Active User` - User active on day
- ✅ `Streak Milestone` - Achieves 3, 7, 14, 30+ day streak

### Content Events
- ✅ `Article Read` - User reads article
- ✅ `Podcast Listened` - User listens to podcast

## User Properties Tracked

### Profile Properties
- `User ID` - Unique identifier
- `Spanish Level` - A1, A2, B1, B2, C1, C2
- `Premium Status` - true/false
- `Signup Date` - ISO timestamp
- `Last Active Date` - ISO timestamp

### Learning Progress
- `Days Active` - Total days user has been active
- `Current Streak` - Consecutive days active
- `Longest Streak` - Best streak achieved
- `Total Videos Watched` - Count
- `Total Words Learned` - Count
- `Total XP` - Gamification points

### Engagement Metrics
- `Days Since Signup` - Account age
- `Subscription Status` - free/active/cancelled
- `Device Type` - mobile/tablet/desktop
- `Target Language` - Spanish
- `Native Language` - English

## Implementation Locations

### Server-Side (`server.js`)
```javascript
const mixpanel = require('./lib/mixpanel-analytics');

// On user signup
mixpanel.trackUserSignup(userId, {
  source: 'web',
  languageLevel: 'A1'
});

// On payment
mixpanel.trackPaymentCompleted(userId, 4.99, 'USD', {
  plan: 'premium_monthly'
});
```

### Client-Side (HTML pages)
```html
<!-- Load Mixpanel client -->
<script src="/js/mixpanel-client.js"></script>

<script>
// Track video view
MixpanelClient.trackVideoStarted('video-123', {
  title: 'Spanish Conversation',
  difficulty: 'B1',
  duration: 180
});

// Track word click
MixpanelClient.trackWordClicked('hola', {
  translation: 'hello',
  context: 'greeting'
});
</script>
```

## Testing Your Implementation

### 1. Check Events Are Firing
```bash
# Open browser console
# Watch for: "✅ Mixpanel event tracked: Video Started"
```

### 2. Verify in Mixpanel Dashboard
1. Go to [https://mixpanel.com](https://mixpanel.com)
2. Click **Events** in left sidebar
3. Should see events appearing in real-time
4. Check **Live View** for immediate verification

### 3. Run Automated Tests
```bash
npx playwright test tests/mixpanel-integration.spec.js
```

## Key Metrics Dashboard Setup

### Week 1 (Beta Launch)
- **Goal:** 100 users
- **Track:** Daily Active Users, Signup Funnel
- **Retention:** D7 = 60%+

### Week 2 (Soft Launch)
- **Goal:** 1,000 users
- **Track:** Video Completion Rate, Word Saves
- **Retention:** D7 = 70%+

### Week 3 (Full Launch)
- **Goal:** 10,000 users, $5K MRR
- **Track:** Premium Conversion, Payment Success Rate
- **Conversion:** 10%+ to premium

### Week 4-6 (Scale)
- **Goal:** 50,000 users, $25K MRR
- **Track:** D30 Retention, LTV, CAC
- **Retention:** D30 = 40%+

## Recommended Mixpanel Reports

### 1. Insights Report: Daily Active Users
- Event: `Daily Active User`
- Segment by: `Spanish Level`, `Premium Status`
- Chart: Line (7 days)

### 2. Funnels Report: Signup → Premium
- Step 1: `User Signed Up`
- Step 2: `Video Completed`
- Step 3: `Word Saved`
- Step 4: `Premium Upgrade Clicked`
- Step 5: `Payment Completed`

### 3. Retention Report: Cohort Analysis
- Event: `User Signed Up`
- Return Event: `Daily Active User`
- Group by: `Signup Date`
- Time range: 30 days

### 4. Insights Report: Video Engagement
- Event: `Video Completed`
- Segment by: `Difficulty`, `Category`
- Chart: Bar (Top 10 videos)

### 5. Funnels Report: Premium Conversion
- Step 1: `Premium Upgrade Clicked`
- Step 2: `Checkout Started`
- Step 3: `Payment Completed`
- Drop-off analysis enabled

## Privacy & GDPR Compliance

### DO NOT Track:
- ❌ Email addresses (use hashed User ID)
- ❌ Real names
- ❌ IP addresses
- ❌ Credit card numbers
- ❌ Any PII (Personally Identifiable Information)

### DO Track:
- ✅ Anonymous User IDs (e.g., `user_abc123`)
- ✅ Behavioral data (videos watched, words learned)
- ✅ Aggregate metrics
- ✅ Device/browser info (non-identifying)

### GDPR Requirements:
- Provide opt-out mechanism
- Include in privacy policy
- Allow data deletion requests
- Cookie consent banner (required for EU users)

## Troubleshooting

### Events Not Appearing
1. Check `MIXPANEL_TOKEN` is set in `.env`
2. Verify server restarted after adding token
3. Check browser console for errors
4. Verify Mixpanel SDK loaded (check Network tab)

### "Mixpanel not configured" Warning
```bash
⚠️  Mixpanel not configured (MIXPANEL_TOKEN not set)
```
**Solution:** Add `MIXPANEL_TOKEN` to `.env` and restart server

### Events Delayed
- Mixpanel can have 1-5 minute delay for events to appear
- Check **Live View** for real-time events
- Normal behavior, not a bug

### Wrong User Properties
- User properties persist across events
- Use `mixpanel.people.set()` to update
- Call `updateUserProfile()` on login to sync

## Performance Optimization

### Async Loading
- Mixpanel SDK loads asynchronously (non-blocking)
- Events queued if SDK not loaded yet
- No impact on page load time

### Event Batching
- Client queues events and flushes every 10s
- Reduces server load
- Automatic on page unload

### Sampling (For Scale)
```javascript
// Track 10% of events at high scale
if (Math.random() < 0.1) {
  mixpanel.track('High Volume Event', {...});
}
```

## Cost Management

### Free Tier Limits
- **100,000 events/month** (free)
- Unlimited users
- 5 team members
- 90 days data retention

### Exceeding Free Tier?
- Reduce low-value events
- Sample high-frequency events
- Upgrade to paid plan ($25/mo for 1M events)

### Event Priority
**High Priority (Always Track):**
- User signup, login
- Video completed
- Payment completed
- Premium upgrade

**Low Priority (Consider Sampling):**
- Word clicked (high frequency)
- Video progress (every 5%)
- Mouse movements

## Next Steps

1. ✅ Set up Mixpanel account
2. ✅ Add token to `.env`
3. ✅ Test events firing
4. ✅ Create key dashboards
5. ✅ Set up alerts for critical metrics
6. ✅ Train team on Mixpanel usage

## Support

- **Mixpanel Docs:** [https://docs.mixpanel.com](https://docs.mixpanel.com)
- **Community:** [https://community.mixpanel.com](https://community.mixpanel.com)
- **Support:** [https://mixpanel.com/get-support](https://mixpanel.com/get-support)

---

**Last Updated:** 2025-10-17
**Version:** 1.0
**Maintained by:** Development Team
