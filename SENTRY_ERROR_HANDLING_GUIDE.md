# Sentry Error Handling Workflow Guide

Complete workflow for triaging, prioritizing, and resolving errors captured by Sentry during beta launch.

## Table of Contents

1. [Daily Error Review Workflow](#daily-error-review-workflow)
2. [Error Priority System](#error-priority-system)
3. [Triaging New Errors](#triaging-new-errors)
4. [Resolving Errors](#resolving-errors)
5. [Linear Integration](#linear-integration)
6. [Common Error Patterns](#common-error-patterns)
7. [Response Time SLAs](#response-time-slas)
8. [Weekly Review Process](#weekly-review-process)

---

## Daily Error Review Workflow

### Morning Check (9:00 AM - 15 minutes)

**Step 1: Open Sentry Dashboard**

Visit: [https://sentry.io/organizations/YOUR_ORG/issues/](https://sentry.io/organizations/YOUR_ORG/issues/)

**Step 2: Check New Issues (Last 24 Hours)**

Filter by:
- **Status**: Unresolved
- **First Seen**: Last 24 hours
- **Sort by**: First Seen (Descending)

**Step 3: Quick Triage**

For each new error:

1. **Read error message** - What broke?
2. **Check error tags** - What type? (payment, video, API)
3. **View stack trace** - Where did it break?
4. **Check affected users** - How many users impacted?
5. **Assign priority** - P0, P1, P2, or P3?

**Step 4: Assign Errors**

- **P0 (Critical)**: Assign to yourself immediately
- **P1 (High)**: Assign to team member
- **P2/P3**: Add to backlog (create Linear issue)

---

## Error Priority System

### Priority Matrix

| Priority | Severity | Impact | Examples | Response Time |
|----------|----------|--------|----------|---------------|
| **P0 - Critical** | App-breaking | All users | Payment failures, auth errors, app crashes | **< 1 hour** |
| **P1 - High** | Feature-breaking | Many users | Video loading, API failures, feed not loading | **< 8 hours** |
| **P2 - Medium** | Partial functionality | Some users | UI bugs, slow performance, tracking issues | **< 3 days** |
| **P3 - Low** | Minor issue | Few users | Cosmetic bugs, console warnings, edge cases | **Next sprint** |

### Priority Decision Tree

```
Error occurs
    ↓
Does it affect payments or auth? → YES → P0 (Critical)
    ↓ NO
Does it break core features for >10% users? → YES → P1 (High)
    ↓ NO
Does it impact user experience? → YES → P2 (Medium)
    ↓ NO
Is it a minor bug or cosmetic issue? → YES → P3 (Low)
```

---

## Triaging New Errors

### 1. Assess Error Severity

**Key Questions:**

- How many users are affected?
- What feature is broken?
- Is there a workaround?
- Is it a regression (new deployment)?

**Example Triage:**

```
Error: "Video failed to load (403 Forbidden)"
- Users affected: 15 users (out of 100 beta users) = 15%
- Feature: Video feed (core feature)
- Workaround: None
- Regression: No (ongoing issue)
→ Priority: P1 (High)
```

### 2. Add Context

In Sentry, add comments with:

- **Root cause hypothesis**: "Likely CDN auth token expired"
- **Impact assessment**: "Affects 15% of users, video feed unusable"
- **Next steps**: "Check CDN credentials, test video URLs"

### 3. Assign Owner

- **P0**: Assign to on-call developer immediately
- **P1**: Assign to team member with relevant expertise
- **P2/P3**: Assign to yourself or create Linear issue

### 4. Set Tags

Add custom tags for filtering:

- `component:video-feed`
- `feature:payment`
- `priority:p1`
- `sprint:beta-launch`

---

## Resolving Errors

### Error Resolution Workflow

**Step 1: Reproduce Error**

```bash
# Get error details from Sentry
1. Click on error in dashboard
2. Copy stack trace
3. Note user context (user ID, level, premium status)
4. Note breadcrumbs (what user did before error)

# Reproduce locally
1. Set up same user context in localStorage
2. Follow breadcrumbs to trigger error
3. Verify error occurs in DevTools console
```

**Step 2: Debug and Fix**

```bash
# Standard debugging flow
1. Add console.logs around suspected code
2. Check API responses (Network tab)
3. Verify environment variables
4. Test edge cases

# Common fixes
- API endpoint: Check authentication, validate input
- Video loading: Verify URLs, check CORS headers
- Payment: Test Stripe keys, verify webhook signature
```

**Step 3: Write Test**

Create a test case to prevent regression:

```javascript
// tests/video-loading.spec.js
test('should load video without 403 error', async ({ page }) => {
    await page.goto('/tiktok-video-feed.html');
    const video = await page.locator('video').first();
    await video.waitFor({ state: 'visible' });

    // Verify video loaded successfully
    const videoSrc = await video.getAttribute('src');
    const response = await page.request.get(videoSrc);
    expect(response.status()).toBe(200);
});
```

**Step 4: Deploy Fix**

```bash
# Commit with Sentry issue reference
git add .
git commit -m "Fix video loading 403 error (Sentry-123)

- Updated CDN authentication logic
- Added token refresh mechanism
- Fixes error affecting 15% of users

Sentry Issue: https://sentry.io/issues/123456"

# Deploy to production
npm run deploy
```

**Step 5: Verify Fix in Sentry**

1. Mark issue as **Resolved in Next Release**
2. Add release version: `1.0.1`
3. Monitor for 24 hours to ensure no recurrence
4. If no new occurrences, mark as **Archived**

---

## Linear Integration

### Create Linear Issue from Sentry Error

**Step 1: Export Error to Linear**

1. Open error in Sentry
2. Click **Integrations** > **Create Linear Issue**
3. Fill in details:

```
Title: [Sentry] Video loading 403 error

Description:
**Sentry Issue**: https://sentry.io/issues/123456
**Error**: Video failed to load (403 Forbidden)
**Users Affected**: 15 (15% of beta users)
**Priority**: High (P1)

**Stack Trace**:
```
[paste stack trace]
```

**User Context**:
- User ID: user-123
- Level: A2
- Premium: false

**Breadcrumbs**:
1. User opened video feed
2. Scrolled to video #3
3. Video failed to load with 403 error

**Next Steps**:
- [ ] Check CDN authentication
- [ ] Verify video URLs
- [ ] Test with affected user account
```

Priority: High
Labels: `sentry`, `bug`, `video`, `p1`
Assignee: @team-member
Sprint: Current sprint
```

**Step 2: Link Sentry to Linear**

In Sentry issue:
1. Click **Add Link**
2. Select **Linear**
3. Paste Linear issue URL
4. Click **Link Issue**

**Step 3: Track Progress**

- Update Linear issue as you debug
- Add comments with findings
- Move issue through workflow: To Do → In Progress → In Review → Done

---

## Common Error Patterns

### 1. Video Loading Errors

**Error Type**: `video_loading`

**Common Causes**:
- CDN authentication expired
- Invalid video URL
- CORS policy blocking request
- Video file deleted/moved

**Debugging Steps**:
```bash
# Check video URL
curl -I https://cdn.example.com/video.mp4

# Check response headers
# Expected: 200 OK
# If 403: Authentication issue
# If 404: Video not found
```

**Fix**:
- Refresh CDN tokens
- Update video URLs in database
- Configure CORS headers on CDN

---

### 2. API Request Failures

**Error Type**: `api_error`

**Common Causes**:
- Rate limiting (429 Too Many Requests)
- Authentication token expired
- Server overload (503 Service Unavailable)
- Invalid request parameters

**Debugging Steps**:
```bash
# Check API endpoint
curl -X GET http://localhost:3001/api/content/feed \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check server logs
npm start | grep ERROR
```

**Fix**:
- Implement retry logic with exponential backoff
- Refresh auth tokens before expiration
- Scale server resources
- Validate input parameters

---

### 3. Payment Processing Errors

**Error Type**: `payment_error`

**Common Causes**:
- Stripe API key invalid
- Webhook signature mismatch
- Card declined by bank
- Network timeout during payment

**Debugging Steps**:
```bash
# Check Stripe logs
https://dashboard.stripe.com/logs

# Verify webhook signature
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sig = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
```

**Fix**:
- Verify Stripe keys in `.env`
- Update webhook endpoint URL in Stripe dashboard
- Add user-friendly error messages
- Implement payment retry flow

---

### 4. Authentication Errors

**Error Type**: `auth_error`

**Common Causes**:
- JWT token expired
- Invalid credentials
- Supabase session expired
- CSRF token mismatch

**Debugging Steps**:
```javascript
// Check token validity
const jwt = require('jsonwebtoken');
const token = localStorage.getItem('access_token');
const decoded = jwt.decode(token);
console.log('Token expires:', new Date(decoded.exp * 1000));
```

**Fix**:
- Implement token refresh flow
- Extend token expiration time
- Clear invalid tokens on error
- Redirect to login page

---

## Response Time SLAs

### P0 - Critical (< 1 Hour)

**Timeline:**

- **0-15 min**: Acknowledge error, notify team
- **15-30 min**: Reproduce and identify root cause
- **30-45 min**: Implement hotfix
- **45-60 min**: Deploy fix, verify resolution

**Communication:**

- Post in `#langflix-incidents` Slack channel
- Update Sentry issue every 15 minutes
- Notify affected users if necessary

---

### P1 - High (< 8 Hours)

**Timeline:**

- **0-1 hour**: Triage and assign owner
- **1-4 hours**: Debug and implement fix
- **4-6 hours**: Test fix thoroughly
- **6-8 hours**: Deploy and monitor

**Communication:**

- Update Sentry issue with progress
- Create Linear issue for tracking
- Post summary in daily standup

---

### P2 - Medium (< 3 Days)

**Timeline:**

- **Day 1**: Triage and add to sprint backlog
- **Day 2**: Debug and implement fix
- **Day 3**: Code review, test, and deploy

**Communication:**

- Create Linear issue
- Discuss in sprint planning
- Include in release notes

---

### P3 - Low (Next Sprint)

**Timeline:**

- **Week 1**: Triage and add to backlog
- **Week 2+**: Schedule in upcoming sprint
- **Fix when capacity available**

**Communication:**

- Create Linear issue with `priority:low` label
- Group with similar issues
- Address in batch

---

## Weekly Review Process

### Friday Review (4:00 PM - 30 minutes)

**Step 1: Generate Weekly Report**

In Sentry:
1. Go to **Stats** > **Issues**
2. Select **Last 7 Days**
3. Export data or screenshot

**Key Metrics:**

- Total errors: 147
- New errors: 12
- Resolved errors: 8
- Recurring errors: 4
- Users affected: 23 (23% of beta users)

**Step 2: Identify Trends**

- What errors are most common?
- What features have most errors?
- Are errors increasing or decreasing?
- Which errors are recurring?

**Step 3: Action Items**

Create action items for next week:

```
Weekly Sentry Review - 2025-10-17

Top 3 Issues:
1. Video loading 403 errors (15 occurrences) → P1, assigned to @dev1
2. API rate limiting (10 occurrences) → P2, assigned to @dev2
3. Payment webhook failures (3 occurrences) → P0, assigned to @dev3

Trends:
- Video errors decreased 20% (good!)
- API errors increased 30% (investigate server load)
- Payment errors stable (monitor closely)

Action Items:
- [ ] Implement CDN token refresh (video errors)
- [ ] Scale API server resources (rate limiting)
- [ ] Add Stripe webhook retry logic (payment)
- [ ] Review error alert thresholds (too noisy?)

Next Review: 2025-10-24
```

**Step 4: Team Retrospective**

Discuss in team meeting:

- What went well this week?
- What could be improved?
- Any process changes needed?
- Should we adjust error priorities?

---

## Best Practices

### 1. Act Fast on P0 Errors

- Set up mobile push notifications for critical errors
- Have on-call rotation for off-hours
- Keep hotfix deployment process simple

### 2. Batch Similar Errors

- Don't fix errors one-by-one
- Group related errors and fix root cause
- Example: 10 video errors → Fix CDN auth once

### 3. Communicate Proactively

- Update users if error affects them
- Post status updates in Slack
- Share weekly error reports with team

### 4. Learn from Errors

- Conduct post-mortems for P0 incidents
- Document solutions in wiki
- Add tests to prevent regressions

### 5. Reduce Noise

- Filter out non-actionable errors
- Adjust `ignoreErrors` in Sentry config
- Focus on errors that impact users

---

## Sentry Dashboard Quick Links

- **Issues**: [https://sentry.io/organizations/YOUR_ORG/issues/](https://sentry.io/organizations/YOUR_ORG/issues/)
- **Performance**: [https://sentry.io/organizations/YOUR_ORG/performance/](https://sentry.io/organizations/YOUR_ORG/performance/)
- **Alerts**: [https://sentry.io/settings/YOUR_ORG/alerts/](https://sentry.io/settings/YOUR_ORG/alerts/)
- **Releases**: [https://sentry.io/organizations/YOUR_ORG/releases/](https://sentry.io/organizations/YOUR_ORG/releases/)

---

## Support & Escalation

### When to Escalate

- P0 error not resolved within 1 hour
- Error affecting >50% of users
- Security vulnerability discovered
- Data loss or corruption risk

### Escalation Contacts

- **Technical Lead**: @tech-lead (Slack, phone)
- **Product Manager**: @product-manager (Slack)
- **On-Call Engineer**: @on-call (PagerDuty)

---

## Success Metrics

Track these KPIs weekly:

- **Error Resolution Time**: Average time to resolve errors by priority
- **Mean Time to Detect (MTTD)**: How quickly errors are discovered
- **Mean Time to Resolve (MTTR)**: How quickly errors are fixed
- **Error Rate**: Errors per 1000 user sessions
- **User Impact**: % of users affected by errors

**Goal for Beta Launch:**

- P0 MTTR: < 1 hour
- P1 MTTR: < 8 hours
- Error Rate: < 1% of sessions
- User Impact: < 5% of users

---

**Last Updated**: 2025-10-17
**Owner**: Development Team
**Status**: ✅ Ready for Beta Launch
