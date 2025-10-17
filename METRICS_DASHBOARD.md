# 📈 METRICS DASHBOARD

Key metrics, where to find them, and what they mean for Langflix.

## Table of Contents
- [Daily Metrics (DAU/MAU)](#daily-metrics-daumau)
- [Retention Metrics](#retention-metrics)
- [Conversion Metrics](#conversion-metrics)
- [Engagement Metrics](#engagement-metrics)
- [Learning Effectiveness](#learning-effectiveness)
- [Business Metrics](#business-metrics)
- [Technical Metrics](#technical-metrics)

---

## Daily Metrics (DAU/MAU)

### Daily Active Users (DAU)

**What it measures:** Users who performed any action today

**Where to find it:**
- Mixpanel: Insights > "Daily Active User" event
- API: `GET /api/analytics/system/metrics`

**Target:** 100+ DAU by Week 4

**How to improve:**
- Send push notifications
- Email reminders for streak
- Highlight new content
- Gamification (streaks, achievements)

### Monthly Active Users (MAU)

**What it measures:** Users active in last 30 days

**Where to find it:**
- Mixpanel: Insights > "Daily Active User" event (30 day range)
- API: `GET /api/analytics/system/metrics`

**Target:** 500+ MAU by Month 3

**Formula:**
```
MAU = Unique users with any activity in last 30 days
```

### DAU/MAU Ratio

**What it measures:** Stickiness - how often users return

**Target:** 20%+ (users return ~6 days/month)

**Formula:**
```
DAU/MAU Ratio = (DAU / MAU) × 100
```

**Interpretation:**
- <10%: Low engagement, users don't return
- 10-20%: Moderate engagement
- 20-30%: Good engagement
- 30%+: Excellent engagement (daily habit)

---

## Retention Metrics

### Day 1 Retention

**What it measures:** % of users who return the day after signup

**Where to find it:**
- Mixpanel: Retention > New report
- Cohort: Users who signed up
- Return event: Any activity
- Time: Day 1

**Target:** 40%+ Day 1

**How to improve:**
- Better onboarding
- Send welcome email with first video
- Set daily goal during signup
- Show quick wins (easy words)

### Day 7 Retention

**What it measures:** % of users who return 7 days after signup

**Target:** 25%+ Day 7

**How to improve:**
- Weekly email with progress
- Streak reminders
- Personalized content recommendations
- Social features (compare with friends)

### Day 14 Retention

**What it measures:** % of users still active after 2 weeks

**Target:** 18%+ Day 14

### Day 30 Retention

**What it measures:** % of users still active after 1 month

**Target:** 15%+ Day 30

**This is the most important metric!**
Users who stay 30 days typically stay forever.

### Cohort Retention Table

**Where to find it:**
- Mixpanel: Retention > Create cohort report
- Group by: Signup week
- Return event: Daily Active User
- Timeframe: 12 weeks

**Example:**

| Signup Week | Day 1 | Day 7 | Day 14 | Day 30 |
|-------------|-------|-------|--------|--------|
| Week 1      | 45%   | 28%   | 20%    | 16%    |
| Week 2      | 42%   | 25%   | 18%    | 14%    |
| Week 3      | 48%   | 30%   | 22%    | --     |
| Week 4      | 50%   | 32%   | --     | --     |

---

## Conversion Metrics

### Funnel: Signup → First Video

**Steps:**
1. User Signed Up (100%)
2. User Completed Onboarding (85%)
3. Video Started (70%)
4. Word Saved (50%)

**Where to find it:**
- Mixpanel: Funnels > "Onboarding Funnel"

**Target conversion rates:**
- Signup → Onboarding: 85%+
- Onboarding → First Video: 80%+
- First Video → Word Saved: 60%+

**Overall target:** 40%+ complete all steps

### Funnel: Video Started → Completed

**Steps:**
1. Video Started (100%)
2. Video Completed (65%)

**Target:** 65%+ completion rate

**Interpretation:**
- <40%: Videos too long/difficult
- 40-60%: Room for improvement
- 60-80%: Good engagement
- 80%+: Excellent (may be too easy)

### Funnel: Checkout → Payment

**Steps:**
1. Checkout Started (100%)
2. Payment Completed (60%)

**Target:** 60%+ checkout conversion

**Where to find it:**
- Mixpanel: Funnels > "Payment Funnel"
- Stripe Dashboard

**How to improve:**
- Simplify checkout (fewer steps)
- Add trust badges
- Show money-back guarantee
- A/B test pricing

### Free → Paid Conversion

**What it measures:** % of users who become paying customers

**Target:** 5%+ within 30 days

**Where to find it:**
- API: `GET /api/analytics/system/funnel`
- Mixpanel: Users with "Subscription Status" = "active"

**Formula:**
```
Conversion Rate = (Paid Users / Total Users) × 100
```

**Benchmark:**
- 2-3%: Average for freemium apps
- 5-7%: Good conversion
- 10%+: Excellent (Duolingo is ~8%)

---

## Engagement Metrics

### Videos Per Session

**What it measures:** How many videos users watch per visit

**Target:** 3+ videos/session

**Where to find it:**
- Mixpanel: Insights > Average "Video Started" per session
- API: `GET /api/analytics/user/:userId/summary`

**Formula:**
```
Videos/Session = Total "Video Started" events / Total sessions
```

### Words Per Session

**What it measures:** How many words users learn per visit

**Target:** 8-12 words/session

**Formula:**
```
Words/Session = Total "Word Saved" events / Total sessions
```

### Session Duration

**What it measures:** How long users stay in one visit

**Target:** 15-20 minutes

**Where to find it:**
- Mixpanel: "Session Ended" event > Property: sessionDuration
- API: `GET /api/analytics/user/:userId/engagement`

**Interpretation:**
- <5 min: Low engagement (bouncing)
- 5-15 min: Moderate (completing 1-2 activities)
- 15-30 min: Good (multiple videos/games)
- 30+ min: Excellent (flow state)

### Streak Metrics

**Current Streak Distribution:**
- 1 day: 40% of users
- 2-6 days: 30%
- 7-13 days: 15%
- 14-29 days: 10%
- 30+ days: 5%

**Target:** 20%+ of users with 7+ day streak

**Where to find it:**
- API: `GET /api/analytics/system/metrics`
- Mixpanel: User property "Current Streak"

---

## Learning Effectiveness

### Words Learned Per Week

**What it measures:** Weekly vocabulary growth

**Target:** 30-50 new words/week

**Where to find it:**
- API: `GET /api/analytics/user/:userId/effectiveness`

**Interpretation:**
- <20: Too slow (adjust difficulty)
- 20-50: Good pace
- 50-100: Fast learner
- 100+: Possibly too easy

### Mastery Rate

**What it measures:** % of words that become mastered

**Target:** 70%+ mastery rate

**Formula:**
```
Mastery Rate = (Mastered Words / Total Words Saved) × 100
```

**Interpretation:**
- <50%: Poor retention (SRS not working)
- 50-70%: Moderate retention
- 70-85%: Good retention
- 85%+: Excellent retention

### Review Completion Rate

**What it measures:** % of due reviews completed

**Target:** 80%+ reviews completed daily

**Formula:**
```
Completion Rate = (Completed Reviews / Due Reviews) × 100
```

### Average Quality Score

**What it measures:** How well users remember words (1-5 scale)

**Target:** 3.5+ average quality

**Where to find it:**
- API: `GET /api/analytics/user/:userId/effectiveness`

**Interpretation:**
- <2.5: Words too difficult
- 2.5-3.5: Appropriate difficulty
- 3.5-4.5: Good retention
- 4.5+: May be too easy

---

## Business Metrics

### Monthly Recurring Revenue (MRR)

**Formula:**
```
MRR = Active Subscriptions × Monthly Price
```

**Target:** $1,000 MRR by Month 3

### Customer Lifetime Value (LTV)

**Formula:**
```
LTV = Average Revenue Per User × Average Lifetime (months)
```

**Target:** $50+ LTV

**Example:**
- $9.99/month subscription
- 6 month average lifetime
- LTV = $59.94

### Customer Acquisition Cost (CAC)

**Formula:**
```
CAC = Marketing Spend / New Customers
```

**Target:** CAC < LTV / 3

**Example:**
- $500 marketing spend
- 100 new customers
- CAC = $5

### LTV:CAC Ratio

**Target:** 3:1 or higher

**Formula:**
```
LTV:CAC = LTV / CAC
```

**Interpretation:**
- <1:1 - Losing money on customers
- 1:1 - Breaking even
- 3:1 - Good business
- 5:1 - Excellent business

### Churn Rate

**What it measures:** % of customers who cancel

**Target:** <5% monthly churn

**Formula:**
```
Churn Rate = (Cancelled Subscriptions / Total Subscriptions) × 100
```

**Interpretation:**
- <5%: Excellent retention
- 5-10%: Good retention
- 10-15%: Moderate retention
- >15%: High churn (fix product)

---

## Technical Metrics

### API Response Time

**Target:** <200ms average, <1s p95

**Where to find it:**
- API: `GET /api/analytics/system/performance`
- Sentry: Performance tab

**Alert if:** Average >500ms or p95 >2s

### Error Rate

**Target:** <0.1% of requests

**Where to find it:**
- Sentry: Issues dashboard
- API: `GET /api/analytics/system/performance`

**Alert if:** >10 errors/hour

### Database Query Time

**Target:** <100ms average

**Where to find it:**
- Sentry: Performance > Database queries

**Alert if:** Any query >1s

### Video Playback Issues

**Target:** <2% of videos have issues

**Where to find it:**
- Sentry: Search "Video playback issue"

**Common issues:**
- Failed to load (check CDN)
- Buffering (check video encoding)
- No subtitles (check transcription service)

### Uptime

**Target:** 99.9% uptime

**Where to find it:**
- Vercel Dashboard
- External monitoring (UptimeRobot, Pingdom)

---

## Dashboard Setup

### Mixpanel Dashboards

**Create these 3 dashboards:**

#### 1. Overview Dashboard
- DAU/MAU chart (30 days)
- New signups (weekly)
- Retention curves (cohorts)
- Top events (today)

#### 2. Engagement Dashboard
- Videos watched (daily)
- Words learned (daily)
- Session duration (histogram)
- Streak distribution

#### 3. Business Dashboard
- Free → Paid conversion
- MRR trend
- Churn rate
- LTV:CAC ratio

### How to Create Dashboard in Mixpanel

1. Go to Mixpanel > Boards
2. Click "Create Board"
3. Name: "Overview Dashboard"
4. Add insights:
   - Click "Add Report"
   - Choose metric (e.g., "Daily Active User")
   - Choose visualization (line chart)
   - Set date range (30 days)
   - Save

### Sentry Dashboards

**Create these 2 dashboards:**

#### 1. Errors Dashboard
- Error count (24h)
- Error rate trend
- Top errors by frequency
- Affected users

#### 2. Performance Dashboard
- API response time (p50, p95)
- Slow database queries
- Transaction throughput
- Apdex score

---

## Monitoring & Alerts

### Set Up These Alerts

#### Critical Alerts (Immediate action)
- Error rate >10/hour → Slack
- Payment errors → Email + Slack
- API response time >2s → Slack
- Database down → Email + Slack + SMS

#### Warning Alerts (Check within 1 hour)
- Error rate >5/hour → Email
- Slow queries >1s → Email
- Churn spike → Email

#### Daily Digests (Review each morning)
- Yesterday's key metrics
- Error summary
- Performance summary

### How to Set Up Alert in Sentry

1. Go to Sentry > Alerts
2. Click "Create Alert"
3. Choose "Errors in a project"
4. Set condition: "10 events in 1 hour"
5. Add action: "Send Slack notification"
6. Save alert

### How to Set Up Alert in Mixpanel

1. Go to Mixpanel > Insights
2. Create metric (e.g., DAU)
3. Click "..." > "Set Alert"
4. Choose condition: "Drops below 50"
5. Add email
6. Save

---

## Weekly Review Checklist

Every Monday, review these metrics:

- [ ] DAU/MAU from last week
- [ ] Day 7 retention for last week's cohort
- [ ] Top 10 most-watched videos
- [ ] Top 10 errors from Sentry
- [ ] Average session duration
- [ ] New signups
- [ ] Free → Paid conversions
- [ ] MRR growth
- [ ] Churn rate
- [ ] Customer feedback themes

---

## Answering Common Questions

### "How many users watched >3 videos today?"

**Mixpanel Query:**
1. Go to Insights
2. Event: "Video Started"
3. Filter: Date = Today
4. Breakdown: User ID
5. Filter: Count >= 3

**API Query:**
```bash
GET /api/analytics/system/metrics?metric=active_users&videos_min=3
```

### "What's our Day 7 retention?"

**Mixpanel:**
1. Go to Retention
2. Cohort: User Signed Up
3. Return: Daily Active User
4. Look at Day 7 column

**API:**
```bash
GET /api/analytics/system/funnel
```

### "Which videos have highest completion rate?"

**Mixpanel:**
1. Funnels > "Video Completion"
2. Breakdown by: Video ID
3. Sort by: Completion rate

### "Why did user X cancel their subscription?"

**Mixpanel:**
1. Users > Search user ID
2. View activity stream
3. Find "Subscription Cancelled" event
4. Check properties: reason, feedback

---

## Next Steps

1. ✅ Set up Mixpanel dashboards (3 dashboards)
2. ✅ Set up Sentry alerts (4 critical alerts)
3. 📊 Review metrics daily for first week
4. 📈 Adjust targets based on actual data
5. 🔍 Read [DATA_ANALYSIS_PLAYBOOK.md](./DATA_ANALYSIS_PLAYBOOK.md)

---

**Pro tip:** Set aside 30 minutes every Monday to review these metrics. Consistent monitoring catches issues early!

