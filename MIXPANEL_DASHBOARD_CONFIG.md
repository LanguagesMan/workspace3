# 📊 Mixpanel Dashboard Configuration

## MVP Launch KPI Tracking Setup

This document provides step-by-step instructions for creating Mixpanel dashboards to track key metrics for the MVP launch.

---

## Quick Start Dashboard Setup

### 1. Access Mixpanel Dashboard
1. Go to [https://mixpanel.com](https://mixpanel.com)
2. Select your "Langflix Spanish Learning" project
3. Click **Dashboards** in left sidebar
4. Click **Create Dashboard** → Name it "MVP Launch Metrics"

---

## Week 1: Beta Launch Dashboard (100 Users, 60% D7 Retention)

### Report 1: Daily Active Users (DAU)
**Type:** Insights Report

1. Click **+ Add Report** → **Insights**
2. Configure:
   - **Event:** `Daily Active User`
   - **Calculation:** Total (Unique)
   - **Time Range:** Last 7 days
   - **Visualization:** Line Chart
3. **Breakdown by:**
   - `Spanish Level` (to see which levels are most active)
   - `Device Type` (mobile vs desktop usage)
4. **Save as:** "Daily Active Users - Week 1"

**Success Metric:** 100 unique users by end of week 1

---

### Report 2: User Signup Funnel
**Type:** Funnels Report

1. Click **+ Add Report** → **Funnels**
2. Add steps:
   - **Step 1:** `Page Viewed` (where `page_path` = `/`)
   - **Step 2:** `User Signed Up`
   - **Step 3:** `Onboarding Completed`
   - **Step 4:** `Video Started` (first video)
   - **Step 5:** `Video Completed` (first video)
3. **Time Window:** 1 hour
4. **Breakdown by:** `Device Type`
5. **Save as:** "Signup to First Video Funnel"

**Success Metric:** 80%+ activation (signup → first video)

---

### Report 3: Day 7 Retention
**Type:** Retention Report

1. Click **+ Add Report** → **Retention**
2. Configure:
   - **First Event:** `User Signed Up`
   - **Return Event:** `Daily Active User`
   - **Date Range:** Last 7 days
   - **Measure:** Day 7 (D7)
3. **Breakdown by:** `Spanish Level`
4. **Save as:** "D7 Retention - Beta Users"

**Success Metric:** 60%+ D7 retention

---

### Report 4: Video Engagement
**Type:** Insights Report

1. Click **+ Add Report** → **Insights**
2. Configure:
   - **Event:** `Video Completed`
   - **Calculation:** Total
   - **Time Range:** Last 7 days
   - **Visualization:** Bar Chart
3. **Breakdown by:** `video_difficulty`
4. **Formula:** Completion Rate = `Video Completed` / `Video Started` * 100
5. **Save as:** "Video Completion Rate by Difficulty"

**Success Metric:** 40%+ video completion rate

---

## Week 2: Soft Launch Dashboard (1,000 Users, 70% D7 Retention)

### Report 5: User Growth Curve
**Type:** Insights Report

1. Click **+ Add Report** → **Insights**
2. Configure:
   - **Event:** `User Signed Up`
   - **Calculation:** Total (Cumulative)
   - **Time Range:** Last 14 days
   - **Visualization:** Line Chart (Cumulative)
3. **Save as:** "Cumulative User Growth"

**Success Metric:** 1,000 total users by end of week 2

---

### Report 6: Learning Engagement Metrics
**Type:** Insights Report

1. Click **+ Add Report** → **Insights**
2. Add multiple events:
   - `Video Completed`
   - `Word Saved`
   - `Quiz Completed`
   - `Game Completed`
3. **Calculation:** Events per User (Average)
4. **Time Range:** Last 7 days
5. **Save as:** "Average Learning Actions per User"

**Success Metric:** 10+ learning actions per user per week

---

### Report 7: Word Learning Funnel
**Type:** Funnels Report

1. Click **+ Add Report** → **Funnels**
2. Add steps:
   - **Step 1:** `Word Clicked`
   - **Step 2:** `Word Saved`
   - **Step 3:** `Word Reviewed`
   - **Step 4:** `Word Mastered`
3. **Time Window:** 7 days
4. **Save as:** "Word Learning Journey"

**Success Metric:** 20%+ word mastery rate

---

## Week 3: Full Launch Dashboard (10K Users, $5K MRR)

### Report 8: Premium Conversion Funnel
**Type:** Funnels Report

1. Click **+ Add Report** → **Funnels**
2. Add steps:
   - **Step 1:** `Premium Upgrade Clicked`
   - **Step 2:** `Checkout Started`
   - **Step 3:** `Payment Completed`
3. **Time Window:** 24 hours
4. **Breakdown by:** `location` (where upgrade was clicked)
5. **Save as:** "Premium Conversion Funnel"

**Success Metric:** 10%+ conversion rate (upgrade click → payment)

---

### Report 9: Monthly Recurring Revenue (MRR)
**Type:** Insights Report

1. Click **+ Add Report** → **Insights**
2. Configure:
   - **Event:** `Payment Completed`
   - **Calculation:** Sum of `amount`
   - **Time Range:** Last 30 days
   - **Visualization:** Line Chart
3. **Formula:** MRR = Sum(amount) where `plan` = "premium_monthly"
4. **Save as:** "Monthly Recurring Revenue (MRR)"

**Success Metric:** $5,000 MRR by end of week 3

---

### Report 10: Premium User Retention
**Type:** Retention Report

1. Click **+ Add Report** → **Retention**
2. Configure:
   - **First Event:** `Payment Completed`
   - **Return Event:** `Daily Active User`
   - **Date Range:** Last 30 days
   - **Measure:** Day 30 (D30)
3. **Filter:** Where `Subscription Status` = "active"
4. **Save as:** "Premium D30 Retention"

**Success Metric:** 50%+ D30 retention for premium users

---

### Report 11: Customer Acquisition Cost (CAC)
**Type:** Insights Report

1. Click **+ Add Report** → **Insights**
2. Configure:
   - **Event:** `User Signed Up`
   - **Calculation:** Total
   - **Time Range:** Last 30 days
3. **External Data:** Add marketing spend manually
4. **Formula:** CAC = Total Marketing Spend / Total Signups
5. **Save as:** "Customer Acquisition Cost (CAC)"

**Success Metric:** CAC < $5 per user

---

## Week 4-6: Scale Dashboard (50K Users, $25K MRR, 40% D30 Retention)

### Report 12: User Cohort Analysis
**Type:** Retention Report

1. Click **+ Add Report** → **Retention**
2. Configure:
   - **First Event:** `User Signed Up`
   - **Return Event:** `Daily Active User`
   - **Date Range:** Last 60 days
   - **Group By:** Signup Week
3. **Save as:** "Weekly Cohort Retention"

**Success Metric:** 40%+ D30 retention across cohorts

---

### Report 13: Lifetime Value (LTV)
**Type:** Insights Report

1. Click **+ Add Report** → **Insights**
2. Configure:
   - **Event:** `Payment Completed`
   - **Calculation:** Sum of `amount` per User
   - **Time Range:** All time
   - **Visualization:** Distribution
3. **Breakdown by:** `Signup Date` (cohort analysis)
4. **Save as:** "Lifetime Value by Cohort"

**Success Metric:** LTV > $30 per user

---

### Report 14: Viral Coefficient
**Type:** Funnels Report

1. Click **+ Add Report** → **Funnels**
2. Add steps:
   - **Step 1:** `Content Shared`
   - **Step 2:** `Referral Link Clicked`
   - **Step 3:** `User Signed Up` (where `source` = "referral")
3. **Time Window:** 7 days
4. **Save as:** "Viral Referral Funnel"

**Success Metric:** Viral coefficient > 1.2 (each user brings 1.2 new users)

---

### Report 15: Churn Analysis
**Type:** Insights Report

1. Click **+ Add Report** → **Insights**
2. Configure:
   - **Event:** `Subscription Cancelled`
   - **Calculation:** Total
   - **Time Range:** Last 30 days
3. **Breakdown by:** `cancellation_reason`
4. **Formula:** Churn Rate = Cancellations / Active Subscriptions * 100
5. **Save as:** "Monthly Churn Rate"

**Success Metric:** < 5% monthly churn

---

## Custom User Properties to Set Up

### In Mixpanel People Profiles:
1. Go to **Project Settings** → **People Properties**
2. Add these custom properties:

```javascript
{
  "Spanish Level": ["A1", "A2", "B1", "B2", "C1", "C2"],
  "Premium Status": ["free", "trial", "active", "cancelled"],
  "Days Active": "number",
  "Current Streak": "number",
  "Longest Streak": "number",
  "Total Videos Watched": "number",
  "Total Words Learned": "number",
  "Total XP": "number",
  "Signup Date": "datetime",
  "Last Active Date": "datetime",
  "Device Type": ["mobile", "tablet", "desktop"],
  "Subscription Status": ["free", "active", "cancelled", "past_due"]
}
```

---

## Alerts to Set Up

### Critical Alerts (notify immediately)

1. **Signup Spike Alert**
   - Event: `User Signed Up`
   - Condition: > 200% of average (last 7 days)
   - Action: Email team

2. **Churn Alert**
   - Event: `Subscription Cancelled`
   - Condition: > 10 per day
   - Action: Email team + Slack

3. **Payment Failure Alert**
   - Event: `invoice.payment_failed` (webhook)
   - Condition: Any occurrence
   - Action: Email team

4. **Low Retention Alert**
   - Metric: D7 Retention
   - Condition: < 50%
   - Action: Email team weekly

---

## Recommended Monitoring Frequency

| Metric | Check Frequency | Owner |
|--------|----------------|-------|
| DAU | Daily | Product Manager |
| D7 Retention | Weekly | Product Manager |
| MRR | Daily | CEO/CFO |
| Churn Rate | Weekly | Customer Success |
| Video Completion Rate | Weekly | Content Team |
| Premium Conversion | Daily | Growth Team |
| CAC/LTV Ratio | Weekly | Marketing |

---

## Dashboard Best Practices

### 1. Daily Standup Dashboard
Create a dashboard with:
- DAU (last 24 hours)
- New signups (last 24 hours)
- MRR (current)
- Active premium users
- Top 5 most watched videos

### 2. Weekly Review Dashboard
Create a dashboard with:
- Weekly active users
- D7 retention
- Premium conversion rate
- Average session length
- Top performing content

### 3. Monthly Board Dashboard
Create a dashboard with:
- Total users (cumulative)
- MRR growth (month-over-month)
- D30 retention by cohort
- LTV/CAC ratio
- Viral coefficient

---

## Segmentation Strategies

### High-Value User Segment
- **Criteria:** Premium users with > 7 day streak
- **Track:** Engagement patterns, content preferences
- **Use for:** Product feedback, beta features

### At-Risk Users
- **Criteria:** Users who signed up but haven't completed first video
- **Track:** Drop-off points, last active date
- **Use for:** Onboarding email campaigns

### Power Users
- **Criteria:** > 50 videos watched, > 100 words saved
- **Track:** Advanced features used, referrals made
- **Use for:** Ambassador program, testimonials

---

## Data Export & Integrations

### Weekly CSV Exports
1. **User Growth Report**
   - Export: All `User Signed Up` events
   - Frequency: Every Monday
   - Recipient: Marketing team

2. **Premium Conversions**
   - Export: All `Payment Completed` events
   - Frequency: Every Friday
   - Recipient: Finance team

### Integrations to Set Up
1. **Slack Integration**
   - Daily DAU update at 9 AM
   - Premium signup notifications
   - Churn alerts

2. **Email Digest**
   - Weekly summary to team
   - Include: DAU, MRR, retention metrics

---

## Success Criteria Summary

### Week 1 (Beta)
- ✅ 100 users
- ✅ 80% activation rate
- ✅ 60% D7 retention

### Week 2 (Soft Launch)
- ✅ 1,000 users
- ✅ 70% D7 retention
- ✅ 10+ learning actions per user

### Week 3 (Full Launch)
- ✅ 10,000 users
- ✅ $5,000 MRR
- ✅ 10% premium conversion

### Week 4-6 (Scale)
- ✅ 50,000 users
- ✅ $25,000 MRR
- ✅ 40% D30 retention
- ✅ LTV/CAC > 6x

---

## Troubleshooting Common Issues

### Issue: Events not appearing
**Solution:**
1. Check Mixpanel token is correct
2. Verify events firing in browser console
3. Check "Live View" for real-time events
4. Wait 1-5 minutes (Mixpanel has delay)

### Issue: Retention report showing 0%
**Solution:**
1. Ensure return event is firing
2. Check date range is sufficient (need 7+ days for D7)
3. Verify users are being identified correctly

### Issue: Revenue metrics incorrect
**Solution:**
1. Verify `amount` property is numeric (not string)
2. Check currency conversion if needed
3. Ensure webhook events are firing from Stripe

---

## Next Steps

1. ✅ Create "MVP Launch Metrics" dashboard
2. ✅ Set up all 15 reports above
3. ✅ Configure alerts for critical metrics
4. ✅ Share dashboard with team
5. ✅ Set up daily/weekly review cadence
6. ✅ Train team on Mixpanel usage

---

**Last Updated:** 2025-10-17
**Version:** 1.0
**Maintained by:** Product Team

**Dashboard URL:** https://mixpanel.com/project/YOUR_PROJECT_ID/view/YOUR_DASHBOARD_ID
