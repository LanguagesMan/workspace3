# 📊 DATA ANALYSIS PLAYBOOK

How to analyze data, identify opportunities, and make data-driven decisions for Langflix.

## Table of Contents
- [Weekly Analysis Routine](#weekly-analysis-routine)
- [Common Analysis Patterns](#common-analysis-patterns)
- [A/B Testing](#ab-testing)
- [Cohort Analysis](#cohort-analysis)
- [User Segmentation](#user-segmentation)
- [Content Analysis](#content-analysis)
- [Growth Opportunities](#growth-opportunities)

---

## Weekly Analysis Routine

### Monday Morning Review (30 min)

**Goal:** Understand last week's performance

#### Step 1: Check Key Metrics (10 min)

```
Mixpanel > Dashboard > Overview

Questions to answer:
- What was DAU last week vs. previous week?
- What was Day 7 retention for last week's cohort?
- How many new signups?
- How many free → paid conversions?
```

**Record in spreadsheet:**
| Week | DAU | New Signups | D7 Retention | F→P Conv | MRR |
|------|-----|-------------|--------------|----------|-----|
| W1   | 45  | 120         | 28%          | 4%       | $200|
| W2   | 52  | 135         | 30%          | 5%       | $380|

#### Step 2: Identify Anomalies (10 min)

Look for:
- ✅ **Big increases** (>20%) - What caused it? Can we repeat?
- ⚠️ **Big decreases** (>20%) - What broke? How to fix?
- 📊 **Trends** (3+ weeks same direction) - Is this sustainable?

**Example:**
```
DAU dropped 30% on Thursday
→ Check Sentry: Database timeout at 2pm
→ Action: Add database index, monitor
```

#### Step 3: Review Top Content (10 min)

```
Mixpanel > Insights > "Video Started" > Group by Video ID

Questions:
- Which 10 videos were most watched?
- Which videos had highest completion rate?
- Which videos led to most word saves?
```

**Action Items:**
- Create more content like top performers
- Remove or improve bottom performers
- Feature top content in recommendations

---

## Common Analysis Patterns

### Pattern 1: Declining Retention

**Symptoms:**
- Day 7 retention dropping week over week
- Users watching fewer videos per session
- Increased churn rate

**Analysis Steps:**

1. **Segment by cohort:**
```
Mixpanel > Retention > Group by Signup Week
Compare: Week 1 vs Week 2 vs Week 3
```

2. **Find drop-off point:**
```
Mixpanel > Funnels > Onboarding Funnel
Where are users leaving?
```

3. **Compare high vs low retention users:**
```
Mixpanel > Users > Segment by D7 Retention
High retention: What did they do in first week?
Low retention: What did they NOT do?
```

**Common Findings:**
- Users who watch 3+ videos in Day 1 have 2x retention
- Users who save 5+ words in first week have 3x retention
- Users who set language goal have 1.5x retention

**Actions:**
- Push users to complete 3 videos on Day 1
- Gamify: "Save your first 5 words to unlock badges"
- Make language goal selection mandatory in onboarding

### Pattern 2: Low Engagement

**Symptoms:**
- Low videos per session (<2)
- Short session duration (<10 min)
- Low word save rate

**Analysis Steps:**

1. **Check content difficulty:**
```
API: GET /api/analytics/content/video/:id
Check: Completion rate by difficulty level
```

Expected:
- A1: 80%+ completion
- A2: 70%+ completion
- B1: 60%+ completion

If lower: Content too difficult

2. **Check personalization:**
```
Mixpanel > Users > Sample 10 low-engagement users
Review: What videos were they shown?
Question: Were videos matched to their level?
```

3. **Check UI/UX issues:**
```
Sentry > Search: "Video playback"
Check: Any technical errors?
```

**Actions:**
- Improve difficulty matching
- Add "Too easy/hard?" feedback button
- Fix video playback issues

### Pattern 3: High Churn

**Symptoms:**
- Cancellation rate >10%/month
- Users leaving after first payment

**Analysis Steps:**

1. **Analyze cancellation reasons:**
```
Mixpanel > Events > "Subscription Cancelled"
Property: cancellation_reason
Group by reason
```

Common reasons:
- Too expensive (40%)
- Not using enough (30%)
- Missing features (20%)
- Technical issues (10%)

2. **Compare churned vs retained:**
```
Cohort: Users who subscribed Month 1
Segment: Churned vs Still Active
Compare: Usage patterns
```

Findings might show:
- Churned users: 2 sessions/week
- Retained users: 5+ sessions/week

3. **Identify at-risk users:**
```
Criteria: Paid user with <3 sessions last 2 weeks
Action: Send re-engagement email
```

**Actions:**
- Add value-based pricing ($4.99/month option)
- Send usage tips email ("Get more from Langflix")
- Add requested features
- Offer "pause subscription" instead of cancel

---

## A/B Testing

### How to Run an A/B Test

#### Step 1: Hypothesis

```
Hypothesis: Adding a daily goal will increase Day 7 retention

Control: No daily goal
Variant: Show daily goal (e.g., "Learn 10 words today")

Metric: Day 7 retention
Sample size: 200 users per group
Duration: 2 weeks
```

#### Step 2: Implement

```javascript
// Randomly assign users
const variant = Math.random() < 0.5 ? 'control' : 'goal';

// Track assignment
mixpanel.track(userId, 'AB Test Assignment', {
    experiment: 'daily_goal',
    variant
});

// Show appropriate UI
if (variant === 'goal') {
    showDailyGoal();
}
```

#### Step 3: Analyze

```
Mixpanel > Funnels > "User Signed Up" → "Daily Active User" (Day 7)
Segment by: AB Test = daily_goal
Compare: control vs goal
```

**Results example:**
- Control: 25% Day 7 retention
- Goal: 32% Day 7 retention
- Lift: +28% (statistically significant)

**Decision:** Ship daily goal to all users!

### Test Ideas

**High Impact Tests:**
1. Onboarding flow (long vs short)
2. Video recommendations (algorithm A vs B)
3. Pricing ($9.99 vs $7.99 vs $4.99)
4. Paywall timing (Day 1 vs Day 7)
5. Push notification copy

**Medium Impact Tests:**
1. Daily goal amount (5 vs 10 vs 15 words)
2. Game difficulty (easy vs adaptive)
3. Streak reminder time (8am vs 8pm)
4. Email frequency (daily vs weekly)

---

## Cohort Analysis

### What is Cohort Analysis?

**Definition:** Group users by signup date, analyze behavior over time

**Why:** Identifies if product is improving (later cohorts should perform better)

### How to Create Cohort Chart

```
Mixpanel > Retention > Create Report

Settings:
- First event: "User Signed Up"
- Return event: "Daily Active User"
- Group by: Week
- Show: 12 weeks
```

**Example Output:**

| Signup Week | W0 | W1 | W2 | W3 | W4 |
|-------------|----|----|----|----|-----|
| Jan 1       |100%| 40%| 28%| 22%| 18% |
| Jan 8       |100%| 42%| 30%| 24%| 20% |
| Jan 15      |100%| 45%| 32%| 26%| 22% |
| Jan 22      |100%| 48%| 35%| 28%| --  |

**Interpretation:**
- ✅ Retention improving each week (good!)
- ✅ Jan 22 cohort has best retention
- 📊 Jan 1 → Jan 22: +20% improvement

**Questions to ask:**
- What changed between Jan 1 and Jan 22?
- Can we apply those learnings to future cohorts?

### Cohort Analysis by Feature

```
Compare:
- Users who completed onboarding vs didn't
- Users who set daily goal vs didn't
- Users who connected Facebook vs didn't
```

**Finding example:**
- Onboarding completed: 35% D30 retention
- Onboarding skipped: 12% D30 retention
- **Action:** Make onboarding mandatory

---

## User Segmentation

### Segment by Engagement Level

**Power Users (Top 10%)**
- 5+ sessions/week
- 20+ videos/week
- 50+ words/week

**Casual Users (Middle 60%)**
- 2-4 sessions/week
- 5-15 videos/week
- 10-30 words/week

**At-Risk Users (Bottom 30%)**
- <2 sessions/week
- <5 videos/week
- <10 words/week

### Analysis by Segment

```
Mixpanel > Users > Create Segment

Power Users:
- What features do they use most?
- What content do they prefer?
- How can we convert casual → power?

At-Risk Users:
- Why aren't they engaging?
- What barriers exist?
- What re-engagement tactics work?
```

**Actions by Segment:**

**Power Users:**
- Invite to beta features
- Ask for testimonials
- Referral program (give 1 month, get 1 month)

**Casual Users:**
- Send weekly digest ("Your progress this week")
- Personalized recommendations
- Streak reminders

**At-Risk Users:**
- Re-engagement campaign
- Survey: "What would make Langflix better?"
- Special offer (1 month free)

### Segment by Learning Goal

**Travelers (30%)**
- Want conversational fluency
- Prefer short videos
- Focus on practical phrases

**Students (40%)**
- Want academic proficiency
- Prefer grammar content
- Focus on reading/writing

**Heritage Learners (20%)**
- Want to reconnect with roots
- Prefer culture content
- Focus on speaking

**Career (10%)**
- Want business fluency
- Prefer professional content
- Focus on formal language

**Personalization:**
- Show relevant content to each segment
- Different onboarding flows
- Segment-specific email campaigns

---

## Content Analysis

### Identify Top Performing Content

```
Mixpanel > Insights > "Video Completed"
Group by: Video ID
Sort by: Count (descending)
Date range: Last 30 days
```

**Metrics to track:**
- Views
- Completion rate
- Words saved per video
- Shares
- Ratings

**Analysis:**

| Video | Views | Completion | Words/Video | Rating |
|-------|-------|------------|-------------|--------|
| A     | 1000  | 85%        | 8.5         | 4.8    |
| B     | 800   | 65%        | 5.2         | 4.2    |
| C     | 600   | 45%        | 3.1         | 3.5    |

**Insights:**
- Video A: High completion + high engagement = GREAT
- Video B: Moderate performance = OKAY
- Video C: Low completion + low engagement = POOR

**Actions:**
- Create more content like Video A
- Analyze why Video A performs well (topic? difficulty? length?)
- Improve or replace Video C

### Content Gap Analysis

```
Question: What content are users asking for but we don't have?

Sources:
1. User feedback/surveys
2. Search queries (if search feature exists)
3. Support tickets
4. Social media comments
```

**Common gaps:**
- Business Spanish
- Slang/colloquial phrases
- Regional accents (Mexican vs Spanish)
- Kids content
- Music/song videos

**Prioritization:**
- High demand + Easy to create = Do first
- High demand + Hard to create = Do eventually
- Low demand = Don't do

---

## Growth Opportunities

### Opportunity 1: Improve Onboarding

**Current state:**
- 85% complete onboarding
- 70% watch first video
- 50% save first word

**Opportunity:**
- If we increase onboarding → first video to 85%
- And first video → word save to 70%
- We get 50% more engaged users

**Actions:**
1. Shorten onboarding (5 steps → 3 steps)
2. Auto-play first video after onboarding
3. Highlight clickable words in first video

**Expected impact:** +20% Day 1 retention

### Opportunity 2: Win Back Churned Users

**Current state:**
- 300 churned users (paid, then cancelled)
- Churn reason: "Not using enough"

**Opportunity:**
- These users already paid once
- They want to learn Spanish
- They just need a reason to come back

**Actions:**
1. Email campaign: "We miss you! Here's what's new"
2. Offer: 1 month free if they resubscribe
3. Showcase new features/content

**Expected impact:** 15% reactivation rate = 45 users = $450 MRR

### Opportunity 3: Increase Videos Per Session

**Current state:**
- Average 2.5 videos/session
- Session ends after 2nd video

**Opportunity:**
- If we increase to 3.5 videos/session
- That's +40% more engagement
- More engagement = better retention

**Actions:**
1. Autoplay next video
2. Show "Up next" preview during credits
3. Create playlists ("Learn Spanish greetings: 5 videos")

**Expected impact:** +25% time spent, +15% retention

### Opportunity 4: Viral Growth

**Current state:**
- 0 viral coefficient (no referrals)
- Users don't share content

**Opportunity:**
- Language learning is inherently social
- People want to show off progress

**Actions:**
1. Add "Share my streak" button
2. Create shareable "Word of the Day" graphics
3. Referral program (give 1 month, get 1 month)
4. Social proof ("Join 10,000 learners")

**Expected impact:** 0.3 viral coefficient = 30% organic growth

---

## Data-Driven Decision Framework

### Step 1: Identify Problem

```
Symptom: Day 7 retention dropping
Data: 30% → 25% over 3 weeks
Impact: Losing 50 users/week
```

### Step 2: Form Hypothesis

```
Hypothesis: Users leaving because videos too difficult
Evidence:
- Completion rate dropped from 70% → 55%
- User feedback mentions "too hard"
- A2 users watching B1 content
```

### Step 3: Validate Hypothesis

```
Analysis:
- Segment users by level
- Check if content matches level
- Compare completion rates A2 vs B1

Finding: 40% of A2 users shown B1 content
Those users have 15% lower retention
```

### Step 4: Propose Solution

```
Solution: Improve content matching algorithm

Implementation:
- Only show A2 content to A2 users
- Add "Too easy/hard" feedback
- Adjust difficulty over time

Expected impact: +8% Day 7 retention
Cost: 2 weeks dev time
```

### Step 5: Test & Measure

```
A/B Test:
- Control: Current algorithm
- Variant: Improved algorithm
- Duration: 2 weeks
- Success metric: Day 7 retention

Results:
- Control: 25%
- Variant: 28%
- Lift: +12% ✅

Decision: Ship to all users!
```

### Step 6: Monitor & Iterate

```
Post-launch monitoring:
- Week 1: 26% retention (good!)
- Week 2: 27% retention (improving)
- Week 3: 28% retention (stable)

Next iteration:
- Can we get to 30%?
- Test: Personalized video recommendations
```

---

## Tools & Resources

### Mixpanel Shortcuts

```
# Daily active users (30 days)
Insights > "Daily Active User" > Line chart > 30 days

# Retention curve
Retention > "User Signed Up" → "Daily Active User" > 12 weeks

# Conversion funnel
Funnels > Add steps > Save

# Cohort analysis
Retention > Group by Week > 12 weeks
```

### SQL Queries (Postgres)

```sql
-- Active users today
SELECT COUNT(DISTINCT userId)
FROM user_interactions
WHERE createdAt >= CURRENT_DATE;

-- Top 10 videos by views
SELECT contentId, COUNT(*) as views
FROM user_interactions
WHERE type = 'video_view'
  AND createdAt >= NOW() - INTERVAL '30 days'
GROUP BY contentId
ORDER BY views DESC
LIMIT 10;

-- User retention by cohort
SELECT
  DATE_TRUNC('week', createdAt) as signup_week,
  COUNT(*) as users,
  COUNT(CASE WHEN lastActivity >= createdAt + INTERVAL '7 days' THEN 1 END) as retained
FROM users
WHERE createdAt >= NOW() - INTERVAL '90 days'
GROUP BY signup_week
ORDER BY signup_week;
```

### API Endpoints

```bash
# User analytics
GET /api/analytics/dashboard/:userId

# System metrics
GET /api/analytics/system/metrics

# Content performance
GET /api/analytics/content/video/:videoId

# Funnel metrics
GET /api/analytics/system/funnel
```

---

## Next Steps

1. ✅ Complete Monday morning review this week
2. 📊 Identify one growth opportunity
3. 🧪 Design and run one A/B test
4. 📈 Create cohort retention chart
5. 🎯 Set data-driven goals for next month

---

**Remember:** Data shows you what's happening, but you need to understand WHY. Always combine quantitative data with qualitative user feedback!

