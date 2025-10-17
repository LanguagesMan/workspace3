# Beta Tracking Dashboards & Metrics

## Daily Dashboard

Create a Google Sheet: `BETA_DAILY_DASHBOARD.xlsx`

### Tab 1: Daily Metrics

| Date | Day # | Active Users | Videos Watched | Words Saved | AI Chats | Avg Session (min) | Avg NPS | Survey Response Rate | Critical Bugs | Notes |
|------|-------|--------------|----------------|-------------|----------|-------------------|---------|---------------------|---------------|-------|
| 12/1 | 1 | 82 | 347 | 156 | 23 | 12.3 | 7.8 | 68% | 2 | Launch day! |
| 12/2 | 2 | 76 | 412 | 203 | 31 | 14.2 | 8.1 | 61% | 1 | Fixed video bug |
| | | | | | | | | | | |

**Formulas:**
```
Activation Rate = (Users who watched ≥1 video) / (Total signups) * 100
Retention (Day N) = (Active users on Day N) / (Active users on Day 1) * 100
Avg Videos per Active User = Total videos / Active users
Engagement Rate = (Users who saved words OR used AI) / Active users * 100
```

---

### Tab 2: User Cohort Analysis

Track retention by signup date:

| Signup Date | Users | Day 1 | Day 2 | Day 3 | Day 7 | Day 14 | D1→D7 | D1→D14 |
|-------------|-------|-------|-------|-------|-------|--------|-------|--------|
| 12/1 | 100 | 82 | 76 | 71 | 58 | 47 | 71% | 57% |
| 12/2 | 0 | | | | | | | |

**Formulas:**
```
Day N Retention = (Active on Day N) / (Active on Day 1) * 100
```

**Target Metrics:**
- Day 1 Activation: >80%
- Day 7 Retention: >60%
- Day 14 Retention: >40%

---

### Tab 3: Feature Usage

| Feature | Users Who Tried | % of Total | Daily Active Users | Avg Uses per User | Satisfaction (1-5) |
|---------|-----------------|------------|--------------------|--------------------|-------------------|
| Video Feed | 95 | 95% | 65 | 4.2 | 4.3 |
| Tap-to-Translate | 88 | 88% | 58 | 12.6 | 4.5 |
| Save Words | 72 | 72% | 42 | 3.8 | 4.1 |
| AI Chat | 45 | 45% | 18 | 2.1 | 3.7 |
| Spaced Rep | 38 | 38% | 22 | 1.5 | 3.9 |

---

### Tab 4: Engagement Tiers

Segment users by engagement level:

| Tier | Definition | Count | % of Total | Avg Videos/Day | Avg Words/Day | NPS |
|------|------------|-------|------------|----------------|---------------|-----|
| Power Users | 10+ videos/day | 12 | 12% | 15.3 | 8.2 | 9.2 |
| Active Users | 4-9 videos/day | 34 | 34% | 6.1 | 4.1 | 8.1 |
| Casual Users | 1-3 videos/day | 38 | 38% | 1.8 | 1.2 | 7.3 |
| Inactive | 0 videos in 3+ days | 16 | 16% | 0 | 0 | 6.1 |

**Action items per tier:**
- **Power Users:** Interview them! What makes them love it?
- **Active Users:** Keep them engaged with new content
- **Casual Users:** Increase frequency with notifications
- **Inactive:** Send re-engagement email, understand why they dropped off

---

### Tab 5: NPS Tracking

| Date | Responses | Promoters (9-10) | Passives (7-8) | Detractors (0-6) | NPS Score | Change |
|------|-----------|------------------|----------------|------------------|-----------|--------|
| 12/1 | 56 | 28 (50%) | 22 (39%) | 6 (11%) | +39 | - |
| 12/2 | 48 | 26 (54%) | 18 (38%) | 4 (8%) | +46 | +7 |

**NPS Formula:**
```
NPS = (% Promoters - % Detractors)
```

**NPS Benchmarks:**
- <0: Major problems
- 0-30: Needs improvement
- 30-50: Good
- 50-70: Great
- 70+: Excellent

**Target:** >50 by end of beta

---

### Tab 6: Bug Tracker Summary

| Date | New Bugs | Fixed Bugs | Open P0 | Open P1 | Open P2 | Total Open |
|------|----------|------------|---------|---------|---------|------------|
| 12/1 | 15 | 0 | 2 | 6 | 7 | 15 |
| 12/2 | 8 | 5 | 1 | 7 | 10 | 18 |

**Target:** <5 P0 bugs by end of beta

---

## Weekly Summary Dashboard

### Tab 1: Week Overview

**Week 1 Summary (Days 1-7)**

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Activation Rate | >80% | 82% | ✅ |
| Day 7 Retention | >60% | 58% | ⚠️ |
| Avg Videos/User/Day | >3 | 4.2 | ✅ |
| Avg NPS | >7 | 7.9 | ✅ |
| Survey Response Rate | >50% | 65% | ✅ |
| P0 Bugs Remaining | <5 | 1 | ✅ |
| User Interviews | 5 | 3 | ⚠️ |

**Status Legend:**
- ✅ On track
- ⚠️ Needs attention
- ❌ Behind

---

### Tab 2: User Feedback Themes

Track common themes from surveys and interviews:

| Theme | Mentions | Type | Priority | Action |
|-------|----------|------|----------|--------|
| "Love the tap-to-translate" | 42 | Positive | - | Keep it! |
| "AI chat is confusing" | 28 | Negative | P1 | Improve onboarding |
| "Need more beginner content" | 19 | Request | P2 | Add to roadmap |
| "App feels slow" | 15 | Negative | P1 | Optimize performance |
| "Want offline mode" | 12 | Request | P3 | Post-launch |

---

### Tab 3: Content Performance

Track which videos/content types perform best:

| Content Type | Videos | Views | Avg Watch Time | Completion Rate | Words Saved | Rating |
|--------------|--------|-------|----------------|-----------------|-------------|--------|
| Movie Clips | 324 | 1,247 | 45s | 78% | 487 | 4.3 |
| Street Interviews | 198 | 892 | 38s | 82% | 312 | 4.5 |
| TV Shows | 189 | 743 | 42s | 71% | 289 | 4.1 |
| Music Videos | 114 | 521 | 33s | 65% | 156 | 3.9 |

**Insights:**
- Street interviews have highest completion rate
- Movie clips generate most word saves
- Music videos underperforming

---

## Real-Time Monitoring (with Agent 5)

### Mixpanel Events to Track

**Critical Events:**
- `user_signed_up`
- `first_video_watched`
- `video_watched`
- `word_translated`
- `word_saved`
- `ai_chat_started`
- `ai_chat_message_sent`
- `spaced_rep_session`
- `user_session_start`
- `user_session_end`
- `error_occurred`
- `app_crash`

**Track these metrics in real-time:**
1. Current active users (live)
2. Videos being watched (live)
3. Error rate (last hour)
4. Crash rate (last hour)

**Alert thresholds:**
- 🚨 Error rate >5% in last hour
- 🚨 Crash rate >2% in last hour
- 🚨 <10 active users during peak hours (8-10pm)
- 🚨 No videos watched in last 30 min during peak

---

## User Interview Tracking

Create: `USER_INTERVIEW_TRACKER.xlsx`

| Name | Email | Spanish Level | Device | Days Active | NPS | Interview Date | Status | Gift Card Sent | Notes |
|------|-------|---------------|--------|-------------|-----|----------------|--------|----------------|-------|
| John D | john@ex.com | A2 | iOS | 12 | 9 | 12/18 | Completed | ✅ | Loved tap-to-translate |
| Sarah M | sarah@ex.com | B1 | Android | 8 | 7 | 12/19 | Scheduled | ❌ | Wants more content |

**Target:** 10-20 interviews

**Selection criteria:**
- Mix of power users and casual users
- Mix of Spanish levels
- Mix of devices
- Diverse use cases

---

## Testimonial Tracking

Create: `TESTIMONIAL_TRACKER.xlsx`

| Name | Email | Type | Status | Use in Launch? | Quote/Link | Notes |
|------|-------|------|--------|----------------|------------|-------|
| Maria L | maria@ex.com | Video | Received | Yes | [link] | Great energy! |
| Chris P | chris@ex.com | Text | Requested | - | - | Will send by 12/20 |

**Types:**
- Video testimonial (preferred)
- Text testimonial
- Screenshot testimonial (app store review style)

**Target:** 10+ video testimonials

---

## Beta User List

Create: `BETA_USER_LIST.xlsx`

### Columns:

| User ID | Name | Email | Spanish Level | Device | Signup Date | Activation Date | Days Active | Videos Watched | Words Saved | Last Active | Status | Segment | Notes |
|---------|------|-------|---------------|--------|-------------|-----------------|-------------|----------------|-------------|-------------|--------|---------|-------|
| U001 | John D | john@ex.com | A2 | iOS | 12/1 | 12/1 | 14 | 67 | 34 | 12/14 | Active | Power User | Great engagement |
| U002 | Sarah M | sarah@ex.com | B1 | Android | 12/1 | 12/1 | 8 | 23 | 12 | 12/10 | Churned | Casual | Stopped after week 1 |

**Segments:**
- Power User (10+ days active, 50+ videos)
- Active User (7+ days active, 20+ videos)
- Casual User (3-6 days active)
- Low Engagement (1-2 days active)
- Churned (no activity in 5+ days)
- Never Activated (signed up but never watched video)

**Status:**
- Active
- Churned
- Never Activated

---

## Communication Log

Track all outbound communications:

| Date | Type | Subject | Recipients | Open Rate | Click Rate | Response Rate | Notes |
|------|------|---------|------------|-----------|------------|---------------|-------|
| 12/1 | Email | Beta Invite | 100 | 96% | 82% | - | Launch day |
| 12/1 | Email | Day 1 Survey | 100 | 72% | 65% | 65% | High response! |
| 12/5 | Discord | Bug Fix Update | 100 | - | - | - | Video loading fixed |

---

## Daily Checklist for Program Manager

### Morning (9am)
- [ ] Review yesterday's metrics
- [ ] Check overnight bug reports
- [ ] Respond to Discord messages
- [ ] Update daily dashboard
- [ ] Identify any red flags

### Midday (12pm)
- [ ] Bug triage meeting with team
- [ ] Respond to user emails
- [ ] Schedule user interviews
- [ ] Update team on key insights

### Evening (6pm)
- [ ] Prepare end-of-day Discord update
- [ ] Queue tonight's survey email (8pm)
- [ ] Review survey responses
- [ ] Plan tomorrow's priorities

### Weekly (Fridays)
- [ ] Complete weekly summary report
- [ ] Share insights with full team
- [ ] Update feature prioritization
- [ ] Plan next week's focus

---

## Key Metrics Summary

### North Star Metrics
1. **Day 7 Retention:** >60%
2. **NPS Score:** >50
3. **Videos per User per Day:** >3

### Supporting Metrics
- Activation Rate: >80%
- Day 14 Retention: >40%
- Survey Response Rate: >50%
- Feature Usage: Tap-to-translate >80%, AI Chat >40%
- Bug Resolution: <5 P0 bugs remaining

### Qualitative Metrics
- User Interview Insights (10+ interviews)
- Testimonial Collection (10+ videos)
- Feature Satisfaction Scores (>4/5 for core features)
- Common Pain Points Identified
- Unique Value Props Discovered

---

## Red Flags & Escalation

### 🚨 Immediate Action Required:
- Activation rate <70%
- Day 7 retention <50%
- NPS dropping by >10 points
- >5 P0 bugs open
- Multiple users reporting same critical bug
- <30% survey response rate

### ⚠️ Needs Attention:
- Retention declining week-over-week
- NPS <40
- Feature usage <expected (e.g., AI chat <30%)
- Survey response rate declining
- Same pain point mentioned by >20% of users

### 📊 Monitor Closely:
- Power users churning
- Specific features underperforming
- Engagement dropping on specific days
- Content types not resonating

---

## Visualization Recommendations

Create charts in Google Sheets:

1. **Line Chart:** Daily active users over time
2. **Line Chart:** NPS score over time
3. **Bar Chart:** Videos watched per day
4. **Pie Chart:** User segments (Power/Active/Casual/Inactive)
5. **Bar Chart:** Feature usage comparison
6. **Funnel Chart:** Signup → Activation → Day 7 → Day 14
7. **Line Chart:** Bug count over time (by priority)
8. **Bar Chart:** User feedback themes (positive vs negative)

These visualizations make it easy to spot trends and share with team.

