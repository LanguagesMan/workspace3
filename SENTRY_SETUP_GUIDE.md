# Sentry Error Tracking Setup Guide

Complete guide to set up Sentry error monitoring for the Spanish learning app before beta launch.

## Overview

Sentry provides real-time error tracking, performance monitoring, and alerting for both frontend and backend. This ensures you catch and fix issues before they impact users during the beta launch.

## Step 1: Create Sentry Account (5 minutes)

### 1.1 Sign Up

1. Go to [https://sentry.io/signup/](https://sentry.io/signup/)
2. Sign up with GitHub, Google, or email
3. Choose the **Free Plan** (10,000 errors/month - perfect for beta)

### 1.2 Create Project

1. After signup, click **"Create Project"**
2. Select platform: **JavaScript**
3. Set alert frequency: **Alert me on every new issue**
4. Project name: `langflix-spanish-app`
5. Team: Default (or create `langflix-team`)

### 1.3 Get Your DSN

After creating the project, you'll see your **DSN** (Data Source Name):

```
https://abc123def456@o123456.ingest.sentry.io/7891011
```

**Copy this DSN** - you'll need it in the next step.

---

## Step 2: Configure Environment Variables (2 minutes)

### 2.1 Update `.env` File

Add your Sentry DSN to `.env`:

```bash
# Sentry Configuration
SENTRY_DSN="https://abc123def456@o123456.ingest.sentry.io/7891011"
SENTRY_ENVIRONMENT="production"
SENTRY_TRACES_SAMPLE_RATE="0.1"
SENTRY_PROFILES_SAMPLE_RATE="0.1"
```

### 2.2 Environment Explanations

- **SENTRY_DSN**: Your unique project DSN (from Step 1.3)
- **SENTRY_ENVIRONMENT**: `production`, `staging`, or `development`
- **SENTRY_TRACES_SAMPLE_RATE**: `0.1` = capture 10% of transactions (reduces quota usage)
- **SENTRY_PROFILES_SAMPLE_RATE**: `0.1` = profile 10% of transactions

### 2.3 Update HTML Meta Tags (IMPORTANT)

The frontend also needs the DSN configured. Update all HTML pages:

**Find this in each HTML file:**
```html
<meta name="sentry-dsn" content="">
```

**Update to:**
```html
<meta name="sentry-dsn" content="https://abc123def456@o123456.ingest.sentry.io/7891011">
```

**Quick way to update all pages:**

```bash
# Use sed to replace empty DSN with your actual DSN
find public -name "*.html" -type f -exec sed -i '' 's/sentry-dsn" content=""/sentry-dsn" content="YOUR_DSN_HERE"/g' {} \;
```

---

## Step 3: Verify Installation (3 minutes)

### 3.1 Start Server

```bash
npm start
```

You should see in the logs:
```
✅ Sentry error tracking initialized
✅ Sentry initialized (environment: production)
```

### 3.2 Test Backend Error Tracking

**Trigger a test error:**

```bash
# Trigger a 404 error (Sentry should capture it)
curl http://localhost:3001/api/test-sentry-error
```

**Check Sentry Dashboard:**

1. Go to [https://sentry.io/](https://sentry.io/)
2. Select your project: `langflix-spanish-app`
3. Click **Issues** in sidebar
4. You should see the 404 error appear within 10 seconds

### 3.3 Test Frontend Error Tracking

1. Open browser: `http://localhost:3001/tiktok-video-feed.html`
2. Open **DevTools Console** (F12)
3. Type and execute:

```javascript
// Trigger intentional error
throw new Error('Test Sentry Frontend Error');
```

4. Check Sentry Dashboard - you should see this error appear

---

## Step 4: Configure Alerts (10 minutes)

### 4.1 Email Alerts

1. Go to **Settings** > **Alerts**
2. Click **Create Alert Rule**
3. Configure:
   - **When**: A new issue is created
   - **If**: None (all errors)
   - **Then**: Send a notification via email
   - **To**: Your email address

### 4.2 Critical Error Alerts

Create additional alert for critical errors:

1. Click **Create Alert Rule**
2. Configure:
   - **When**: A new issue is created
   - **If**: `event.level` equals `fatal` OR `event.level` equals `error`
   - **AND**: `event.tags.error_type` equals `payment_error`
   - **Then**: Send a notification via email
   - **To**: Your email + team members

### 4.3 Spike Alerts

Alert when error rate spikes:

1. Click **Create Alert Rule**
2. Configure:
   - **When**: The issue is seen more than 10 times in 1 minute
   - **If**: None
   - **Then**: Send a notification via email

### 4.4 Slack Integration (Optional)

For real-time team notifications:

1. Go to **Settings** > **Integrations**
2. Find **Slack** and click **Add to Slack**
3. Authorize Sentry to access your Slack workspace
4. Choose channel: `#langflix-errors`
5. Configure notifications: **All new issues**

---

## Step 5: Test Error Tracking (5 minutes)

### 5.1 Test Video Loading Error

```javascript
// In browser console on /tiktok-video-feed.html
if (window.SentryHelpers) {
    window.SentryHelpers.captureVideoError('test-video-123',
        new Error('Video failed to load'),
        { url: 'https://example.com/video.mp4', status: 'failed' }
    );
}
```

### 5.2 Test API Error

```javascript
// In browser console
if (window.SentryHelpers) {
    window.SentryHelpers.captureAPIError('/api/content/feed',
        new Error('API request failed'),
        { status: 500, method: 'GET' }
    );
}
```

### 5.3 Test Payment Error

```javascript
// In browser console on /premium.html
if (window.SentryHelpers) {
    window.SentryHelpers.capturePaymentError(
        new Error('Payment processing failed'),
        { amount: 4.99, currency: 'USD', provider: 'stripe' }
    );
}
```

### 5.4 Verify in Sentry Dashboard

All three errors should appear in Sentry with proper tagging:
- Video error: `error_type: video_loading`
- API error: `error_type: api_error`
- Payment error: `error_type: payment_error` (should trigger critical alert)

---

## Step 6: Run Integration Tests (5 minutes)

### 6.1 Run Playwright Tests

```bash
npx playwright test tests/sentry-integration.spec.js
```

**Expected output:**
```
✓ should load Sentry client script on all pages
✓ should NOT initialize Sentry on localhost
✓ should capture unhandled JavaScript errors
✓ should track video loading errors
✓ should track API errors
✓ should filter passwords from error data
...

20 tests passed
```

### 6.2 Run with UI Mode (Optional)

```bash
npx playwright test tests/sentry-integration.spec.js --ui
```

---

## Step 7: Set Up User Context (3 minutes)

User context helps you know **which user** experienced an error.

### 7.1 Set User on Login

Add to your login logic (`/api/auth/login` success handler):

```javascript
// After successful login
const user = response.data.user;

if (window.SentryHelpers) {
    window.SentryHelpers.setUser(user.id, {
        email: user.email,
        username: user.username,
        level: user.level,
        isPremium: user.isPremium
    });
}
```

### 7.2 Clear User on Logout

Add to your logout logic:

```javascript
// On logout
if (window.SentryHelpers) {
    window.SentryHelpers.clearUser();
}
```

---

## Step 8: Configure Source Maps (Optional - 10 minutes)

Source maps make stack traces readable in production.

### 8.1 Install Sentry CLI

```bash
npm install --save-dev @sentry/cli
```

### 8.2 Create `.sentryclirc` Config

Create `/Users/mindful/_projects/workspace3/.sentryclirc`:

```ini
[auth]
token=YOUR_SENTRY_AUTH_TOKEN

[defaults]
url=https://sentry.io/
org=your-org-slug
project=langflix-spanish-app
```

### 8.3 Get Auth Token

1. Go to **Settings** > **Auth Tokens**
2. Click **Create New Token**
3. Scopes: `project:releases`, `project:write`
4. Copy token and add to `.sentryclirc`

### 8.4 Upload Source Maps on Deploy

Add to `scripts/deploy.sh`:

```bash
# Upload source maps to Sentry
export SENTRY_AUTH_TOKEN="your-token"
npx sentry-cli releases new "$GIT_COMMIT"
npx sentry-cli releases files "$GIT_COMMIT" upload-sourcemaps ./public/js
npx sentry-cli releases finalize "$GIT_COMMIT"
```

---

## Step 9: Production Deployment (5 minutes)

### 9.1 Environment Variables on Vercel/Heroku

Add Sentry environment variables to your hosting provider:

**Vercel:**
```bash
vercel env add SENTRY_DSN
vercel env add SENTRY_ENVIRONMENT production
```

**Heroku:**
```bash
heroku config:set SENTRY_DSN="https://..."
heroku config:set SENTRY_ENVIRONMENT="production"
```

### 9.2 Update HTML Meta Tags for Production

Ensure production deployment updates meta tags with actual DSN:

**Option 1: Environment variable replacement (recommended)**

Use a build script to replace placeholders:

```bash
# scripts/build.sh
SENTRY_DSN=${SENTRY_DSN} node scripts/inject-sentry-dsn.js
```

**Option 2: Manual replacement**

Before deploying, update all HTML files with production DSN.

---

## Step 10: Monitor Beta Launch (Continuous)

### 10.1 Dashboard Monitoring

Check Sentry daily during beta launch:

1. **Issues**: [https://sentry.io/organizations/.../issues/](https://sentry.io/organizations/.../issues/)
   - Sort by: **First Seen** (new errors)
   - Priority: P0 (payment errors), P1 (critical UX), P2 (minor bugs)

2. **Performance**: [https://sentry.io/organizations/.../performance/](https://sentry.io/organizations/.../performance/)
   - Monitor slow API endpoints
   - Check page load times

3. **Releases**: Track errors by deployment version

### 10.2 Triaging Errors

**Priority Matrix:**

| Priority | Error Type | Response Time |
|----------|-----------|--------------|
| P0 - Critical | Payment failures, auth errors | **Immediate** (< 1 hour) |
| P1 - High | Video loading, API failures | **Same day** (< 8 hours) |
| P2 - Medium | UI bugs, tracking issues | **Next sprint** (< 1 week) |
| P3 - Low | Minor cosmetic issues | **Backlog** |

### 10.3 Weekly Error Reports

Set up weekly email digest:

1. Go to **Settings** > **Notifications**
2. Enable **Weekly Report**
3. Configure: Send every Monday at 9 AM

---

## Troubleshooting

### Issue: "Sentry not initialized"

**Cause**: DSN not configured or invalid

**Fix:**
1. Check `.env` has valid `SENTRY_DSN`
2. Restart server: `npm start`
3. Verify in logs: `✅ Sentry initialized`

### Issue: "Errors not appearing in Sentry dashboard"

**Cause**: Development environment, or DSN mismatch

**Fix:**
1. Check environment: Localhost is skipped by default
2. Deploy to staging/production to test
3. Or temporarily remove localhost check in `lib/sentry-client.js`

### Issue: "Too many errors captured (quota exceeded)"

**Cause**: Sample rates too high or noisy errors

**Fix:**
1. Reduce sample rates in `.env`:
   ```bash
   SENTRY_TRACES_SAMPLE_RATE="0.05"  # 5% instead of 10%
   ```
2. Add more `ignoreErrors` in `lib/sentry-client.js`
3. Filter ad blocker/extension errors

### Issue: "Sensitive data in error reports"

**Cause**: `beforeSend` filter not working

**Fix:**
1. Check `lib/sentry-client.js` has `beforeSend` filter
2. Add additional sensitive fields to filter list
3. Test with sensitive data and verify in dashboard

---

## Success Checklist

Before beta launch, verify:

- [ ] Sentry account created and DSN obtained
- [ ] `.env` configured with SENTRY_DSN
- [ ] All HTML pages have Sentry meta tags
- [ ] Backend Sentry initialized (check server logs)
- [ ] Frontend Sentry loaded (check browser console)
- [ ] Test errors appear in Sentry dashboard
- [ ] Alerts configured (email + Slack)
- [ ] User context tracked (login/logout)
- [ ] Integration tests passing (`npx playwright test tests/sentry-integration.spec.js`)
- [ ] Production environment variables set
- [ ] Team has access to Sentry dashboard

---

## Resources

- **Sentry Dashboard**: [https://sentry.io/](https://sentry.io/)
- **Sentry Docs**: [https://docs.sentry.io/](https://docs.sentry.io/)
- **JavaScript SDK**: [https://docs.sentry.io/platforms/javascript/](https://docs.sentry.io/platforms/javascript/)
- **Node.js SDK**: [https://docs.sentry.io/platforms/node/](https://docs.sentry.io/platforms/node/)
- **Sentry CLI**: [https://docs.sentry.io/product/cli/](https://docs.sentry.io/product/cli/)

---

## Quick Reference

### Test Error Capture

```javascript
// Frontend (browser console)
throw new Error('Test error');

// Or use helpers
window.SentryHelpers.captureError(new Error('Test'), { context: 'test' });
```

### Backend Error Capture

```javascript
const { captureAPIError } = require('./lib/error-tracking');

try {
    // risky operation
} catch (error) {
    captureAPIError(error, {
        endpoint: '/api/endpoint',
        method: 'POST',
        statusCode: 500
    });
}
```

### Check Sentry Status

```bash
# Backend initialized?
npm start | grep "Sentry"

# Frontend loaded?
curl http://localhost:3001/lib/sentry-client.js
```

---

## Support

Need help?

- **Sentry Support**: [https://sentry.io/support/](https://sentry.io/support/)
- **Community Forum**: [https://forum.sentry.io/](https://forum.sentry.io/)
- **Discord**: [https://discord.gg/sentry](https://discord.gg/sentry)

---

**Status**: ✅ Setup Complete
**Last Updated**: 2025-10-17
**Beta Launch**: Ready for 100 users
