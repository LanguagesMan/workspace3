# 🔍 ERROR MONITORING GUIDE

Complete guide to error tracking, debugging, and alerting with Sentry.

## Table of Contents
- [Overview](#overview)
- [Setup](#setup)
- [Error Types](#error-types)
- [Debugging Errors](#debugging-errors)
- [Alerts & Notifications](#alerts--notifications)
- [Performance Monitoring](#performance-monitoring)
- [Best Practices](#best-practices)

---

## Overview

Sentry automatically captures:
- ✅ JavaScript errors (frontend)
- ✅ API errors (backend)
- ✅ Database errors
- ✅ Payment errors
- ✅ Unhandled exceptions
- ✅ Performance issues

---

## Setup

### Initial Setup (Already Done)

Sentry is pre-configured in the codebase. Just add your DSN:

```bash
# .env
SENTRY_DSN=https://your_key@sentry.io/your_project
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions
SENTRY_PROFILES_SAMPLE_RATE=0.1  # 10% profiling
```

### Verify Setup

```bash
npm start
```

You should see:
```
✅ Sentry initialized (environment: production)
```

### Test Error Capture

```bash
curl http://localhost:3001/api/test-error
```

Check Sentry dashboard - error should appear within 30 seconds.

---

## Error Types

### 1. JavaScript Errors

**What they are:** Frontend errors (React, vanilla JS)

**Example:**
```javascript
// This will be captured automatically
function processVideo(video) {
    const title = video.metadata.title; // Error if metadata is null
}
```

**How to capture manually:**
```javascript
const errorTracking = require('./lib/comprehensive-error-tracking');

try {
    riskyOperation();
} catch (error) {
    errorTracking.captureJavaScriptError(error, {
        component: 'VideoPlayer',
        userId: currentUser.id,
        videoId: video.id
    });
}
```

**Where to find:**
- Sentry > Issues > Filter by Tag: `type:javascript`

### 2. API Errors

**What they are:** Backend API endpoint errors

**Example:**
```javascript
app.get('/api/videos/:id', async (req, res) => {
    try {
        const video = await getVideo(req.params.id);
        res.json(video);
    } catch (error) {
        // Automatically captured by middleware
        res.status(500).json({ error: error.message });
    }
});
```

**How to capture manually:**
```javascript
errorTracking.captureAPIError(error, req, {
    endpoint: '/api/videos/:id',
    videoId: req.params.id,
    userId: req.user?.id
});
```

**Where to find:**
- Sentry > Issues > Filter by Tag: `type:api`

### 3. Database Errors

**What they are:** Prisma/PostgreSQL errors

**Example:**
```javascript
try {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
} catch (error) {
    errorTracking.captureDatabaseError(error, 'findUnique user', {
        userId,
        table: 'users'
    });
}
```

**Common database errors:**
- `P2002`: Unique constraint violation
- `P2025`: Record not found
- `P2024`: Connection timeout
- `P1001`: Can't reach database

**Where to find:**
- Sentry > Issues > Filter by Tag: `type:database`

### 4. Payment Errors

**What they are:** Stripe payment failures (CRITICAL)

**Example:**
```javascript
try {
    const charge = await stripe.charges.create({
        amount: 999,
        currency: 'usd',
        customer: customerId
    });
} catch (error) {
    errorTracking.capturePaymentError(error, {
        userId,
        amount: 999,
        customerId
    });
    // Payment errors trigger immediate alert
}
```

**Where to find:**
- Sentry > Issues > Filter by Tag: `type:payment`
- Check email/Slack - payment errors send instant alerts

---

## Debugging Errors

### Reading an Error in Sentry

#### 1. Error Message
```
Error: Cannot read property 'title' of undefined
```
**What it means:** Tried to access `title` on a null/undefined object

#### 2. Stack Trace
```
at processVideo (video-processor.js:45:30)
at handleRequest (api-handler.js:120:15)
at Router.handle (express.js:234:3)
```
**What it means:** Shows the call stack - where error originated

#### 3. Breadcrumbs
```
[HTTP] GET /api/videos/123
[Database] Query: SELECT * FROM videos WHERE id = 123
[Error] Video not found in database
```
**What it means:** Events leading up to the error

#### 4. Context
```
User: user-abc-123
Video ID: video-456
Environment: production
Release: abc123def
```

### Common Errors & Solutions

#### "Cannot read property 'X' of undefined"

**Cause:** Trying to access property on null/undefined object

**Solution:**
```javascript
// Bad
const title = video.metadata.title;

// Good
const title = video?.metadata?.title || 'Unknown';
```

#### "Unique constraint violation (P2002)"

**Cause:** Trying to insert duplicate record

**Solution:**
```javascript
// Use upsert instead
await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name }
});
```

#### "Network request failed"

**Cause:** External API down or timeout

**Solution:**
```javascript
// Add retries
async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fetch(url);
        } catch (error) {
            if (i === retries - 1) throw error;
            await sleep(1000 * (i + 1)); // Exponential backoff
        }
    }
}
```

#### "Too Many Requests (429)"

**Cause:** Rate limit exceeded

**Solution:**
```javascript
// Add rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

---

## Alerts & Notifications

### Alert Types

#### 1. Critical Alerts (Immediate)

**Trigger:** High-priority errors requiring immediate action

**Configured:**
- Payment errors (any)
- Error rate >10/hour
- Database connection lost
- API response time >2s for 5 minutes

**Delivery:** Email + Slack

**Example Alert:**
```
🚨 CRITICAL: Payment Error
10 payment errors in the last 5 minutes
Error: Card declined
Affected users: 8
View in Sentry: [Link]
```

#### 2. Warning Alerts

**Trigger:** Issues to investigate soon

**Configured:**
- Error rate >5/hour
- Slow database queries (>1s)
- High memory usage

**Delivery:** Email

#### 3. Daily Digest

**Trigger:** Summary of yesterday's activity

**Configured:**
- Total errors
- New error types
- Most frequent errors
- Performance summary

**Delivery:** Email (8 AM)

### Setting Up Email Alerts

1. Go to Sentry > Settings > Notifications
2. Add email address
3. Choose alert types:
   - ✅ Issues
   - ✅ Workflow (resolved, assigned)
   - ✅ Deploy
4. Save

### Setting Up Slack Alerts

1. Go to Sentry > Settings > Integrations
2. Click "Slack"
3. Click "Add to Slack"
4. Choose channel: #engineering-alerts
5. Configure alerts:
   - All issues (Critical projects)
   - Errors only (Other projects)
6. Save

### Alert Configuration

```javascript
// In Sentry dashboard:
Settings > Alerts > Create Alert

// Example: High Error Rate Alert
Condition: "Error count" > 10 in 1 hour
Filter: Environment = production
Action: Send Slack notification to #engineering-alerts
```

---

## Performance Monitoring

### API Response Times

**What it measures:** How long API endpoints take to respond

**Where to find:**
- Sentry > Performance > Transactions
- Sort by: p95 (slowest 5%)

**Target:**
- p50 (median): <200ms
- p95: <1s
- p99: <2s

**Alert if:** p95 >2s for 10 minutes

### Example:
```
GET /api/videos/:id
p50: 120ms ✅
p95: 450ms ✅
p99: 890ms ✅
Count: 1,250 requests
```

### Database Query Performance

**What it measures:** How long database queries take

**Where to find:**
- Sentry > Performance > Database

**Target:** <100ms average

**Alert if:** Any query >1s

**Example:**
```
SELECT * FROM videos WHERE difficulty = 'A2'
Average: 45ms ✅
Slowest: 230ms ✅
Count: 450 queries
```

### Slow Queries

**How to fix:**
1. Add database index
2. Optimize query (remove unnecessary joins)
3. Add caching
4. Paginate results

```sql
-- Before (slow)
SELECT * FROM words WHERE userId = '123';

-- After (fast with index)
CREATE INDEX idx_words_userId ON words(userId);
SELECT * FROM words WHERE userId = '123';
```

### Video Playback Performance

**What it measures:** Video loading and buffering issues

**Where to find:**
- Sentry > Search "Video playback issue"

**Common issues:**
1. **Failed to load**
   - Check CDN status
   - Check video file exists
   - Check CORS headers

2. **Slow buffering**
   - Check video encoding (use H.264)
   - Check file size (compress if >50MB)
   - Check CDN cache hit rate

3. **Subtitle sync issues**
   - Check SRT file format
   - Check timing offsets
   - Re-generate subtitles if needed

---

## Best Practices

### 1. Add Context to Errors

```javascript
// Bad - no context
throw new Error('Video not found');

// Good - rich context
errorTracking.captureAPIError(error, req, {
    videoId: req.params.id,
    userId: req.user?.id,
    operation: 'fetchVideo',
    attemptedSource: 'database'
});
```

### 2. Use Breadcrumbs

```javascript
errorTracking.addBreadcrumb('Starting video upload', 'video', {
    videoId,
    fileSize: file.size
});

// ... upload process ...

errorTracking.addBreadcrumb('Upload completed', 'video', {
    videoId,
    duration: Date.now() - startTime
});
```

**Why:** Breadcrumbs show what happened before the error, making debugging easier.

### 3. Set User Context

```javascript
// Set when user logs in
errorTracking.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    level: user.currentLevel
});

// Clear when user logs out
errorTracking.clearUser();
```

**Why:** See which user experienced the error.

### 4. Filter Sensitive Data

```javascript
// Sentry automatically removes:
- Passwords
- API keys
- Authorization headers
- Cookie values

// But double-check sensitive data:
errorTracking.captureAPIError(error, req, {
    userData: {
        id: user.id,
        // Don't include: email, password, payment info
    }
});
```

### 5. Group Related Errors

```javascript
// Use fingerprinting to group similar errors
Sentry.captureException(error, {
    fingerprint: ['database-timeout', table, operation]
});
```

**Why:** Prevents 100 instances of the same error cluttering dashboard.

### 6. Set Error Levels

```javascript
// Critical - needs immediate attention
Sentry.captureException(error, { level: 'fatal' });

// Error - should be fixed soon
Sentry.captureException(error, { level: 'error' });

// Warning - informational
Sentry.captureMessage('Slow query detected', {
    level: 'warning',
    extra: { query, duration }
});
```

### 7. Monitor Performance

```javascript
// Track slow operations
const transaction = errorTracking.startTransaction(
    'video-processing',
    'task'
);

try {
    await processVideo(videoId);
    transaction.setStatus('ok');
} catch (error) {
    transaction.setStatus('internal_error');
    throw error;
} finally {
    transaction.finish();
}
```

### 8. Ignore Expected Errors

```javascript
// In sentry-config.js
ignoreErrors: [
    'ResizeObserver loop limit exceeded', // Browser quirk
    'Network request failed', // User's network issue
    'Too Many Requests', // Expected rate limiting
]
```

**Why:** Focus on actual bugs, not noise.

---

## Troubleshooting

### Errors Not Showing in Sentry

**Check:**
1. ✅ DSN configured: `echo $SENTRY_DSN`
2. ✅ Initialization: Look for "Sentry initialized" in logs
3. ✅ Environment: Check `SENTRY_ENVIRONMENT` matches filter
4. ✅ Sample rate: Set to 1.0 for testing

**Test:**
```bash
curl http://localhost:3001/api/test-error
```

### Too Many Errors

**Solutions:**
1. **Ignore noise:**
   - Add to `ignoreErrors` in config
   - Use error grouping/fingerprints

2. **Fix the root cause:**
   - Sort by frequency
   - Fix top 3 errors first
   - Deploy fix
   - Mark as resolved

3. **Adjust sampling:**
   - Reduce `tracesSampleRate` to 0.05 (5%)
   - Focus on errors, not all transactions

### Alert Fatigue

**Solutions:**
1. **Increase thresholds:**
   - >5 errors/hour → >10 errors/hour
   - Only critical errors go to Slack

2. **Add filters:**
   - Only production environment
   - Exclude specific error types
   - Only errors affecting >5 users

3. **Use digests:**
   - Daily summary instead of immediate alerts
   - Group similar errors

---

## Maintenance Tasks

### Daily
- [ ] Check Sentry for new critical errors
- [ ] Review performance dashboard
- [ ] Check alert email

### Weekly
- [ ] Review top 10 errors
- [ ] Check if fixed errors are still occurring
- [ ] Update ignore list if needed
- [ ] Review slow database queries

### Monthly
- [ ] Analyze error trends
- [ ] Review alert thresholds
- [ ] Clean up resolved issues
- [ ] Update error handling in code

---

## Error Response Checklist

When an error alert comes in:

1. **Assess severity**
   - [ ] How many users affected?
   - [ ] Is it still happening?
   - [ ] Does it block critical functionality?

2. **Investigate**
   - [ ] Read error message
   - [ ] Check stack trace
   - [ ] Review breadcrumbs
   - [ ] Check if recent deploy

3. **Fix**
   - [ ] Identify root cause
   - [ ] Write fix
   - [ ] Test locally
   - [ ] Deploy

4. **Verify**
   - [ ] Error stopped occurring?
   - [ ] Check affected users
   - [ ] Mark as resolved in Sentry

5. **Prevent**
   - [ ] Add test case
   - [ ] Add error handling
   - [ ] Update documentation

---

## Next Steps

1. ✅ Verify Sentry is capturing errors
2. ✅ Set up email alerts
3. ✅ Set up Slack integration
4. 📊 Review [METRICS_DASHBOARD.md](./METRICS_DASHBOARD.md)
5. 📈 Read [DATA_ANALYSIS_PLAYBOOK.md](./DATA_ANALYSIS_PLAYBOOK.md)

---

**Remember:** Errors are opportunities to improve. Every error fixed makes the product better!

