# 🚀 AGENT 5: ANALYTICS - QUICK START

Get analytics and monitoring up and running in 10 minutes.

## ⚡ Step 1: Get API Tokens (5 min)

### Mixpanel Token

1. Go to **https://mixpanel.com/**
2. Click "**Sign up**" (free account)
3. Create project: "**Langflix Production**"
4. Go to **Settings** > **Project Settings**
5. Copy **Project Token** (looks like: `abc123def456...`)

### Sentry DSN

1. Go to **https://sentry.io/**
2. Click "**Sign up**" (free account)
3. Choose platform: "**Node.js**"
4. Create project: "**Langflix Production**"
5. Copy **DSN** (looks like: `https://abc@123.ingest.sentry.io/456`)

---

## ⚙️ Step 2: Configure Environment (2 min)

Add to your `.env` file:

```bash
# Analytics
MIXPANEL_TOKEN=paste_your_token_here
SENTRY_DSN=paste_your_dsn_here
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
```

---

## 🔧 Step 3: Integrate (3 min)

### Option A: Automatic Integration (Recommended)

Add this to your `server.js`:

```javascript
// At the top, after dotenv
const { setupAnalytics } = require('./lib/analytics-integration');

// After middleware, BEFORE routes
const analytics = setupAnalytics(app);

// Your routes here...

// After routes, BEFORE app.listen()
analytics.addErrorHandler();
```

### Option B: Manual Integration

```javascript
const { track, captureError } = require('./lib/analytics-integration');

// Track events in your routes
app.post('/api/videos/watch', (req, res) => {
    track.videoStarted(userId, videoId);
    res.json({ success: true });
});

// Capture errors
app.get('/api/videos/:id', async (req, res) => {
    try {
        const video = await getVideo(req.params.id);
        res.json(video);
    } catch (error) {
        captureError.api(error, req);
        res.status(500).json({ error: error.message });
    }
});
```

---

## ✅ Step 4: Test (1 min)

Restart server:
```bash
npm start
```

You should see:
```
✅ Mixpanel Analytics initialized
✅ Sentry initialized (environment: production)
📊 Analytics middleware initialized
✅ Analytics API mounted at /api/analytics
```

Test tracking:
```bash
curl -X POST http://localhost:3001/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","event":"Test Event","properties":{}}'
```

---

## 📊 Step 5: View Data (1 min)

### Mixpanel
1. Go to https://mixpanel.com/
2. Select your project
3. Click "**Events**" in sidebar
4. You should see "Test Event" appear (takes ~1 min)

### Sentry
1. Go to https://sentry.io/
2. Select your project
3. Click "**Issues**" in sidebar
4. Errors will appear here automatically

---

## 🎯 What's Tracked Automatically

Once integrated, these are tracked automatically:

✅ **All API requests** (endpoint, method, response time, status code)
✅ **All errors** (with stack traces, user context, breadcrumbs)
✅ **User sessions** (start, duration, daily active)
✅ **Performance metrics** (API response times, database queries)

---

## 📝 Track Custom Events

### Videos

```javascript
const { track } = require('./lib/analytics-integration');

// Video started
track.videoStarted(userId, videoId, {
    title: 'Spanish Greetings',
    difficulty: 'A2',
    duration: 120
});

// Video completed
track.videoCompleted(userId, videoId, {
    watchTime: 115,
    completionRate: 95.8
});
```

### Words/Vocabulary

```javascript
// Word saved
track.wordSaved(userId, 'hola', {
    translation: 'hello',
    difficulty: 'A1'
});

// Word reviewed
track.wordReviewed(userId, 'hola', {
    quality: 5,  // 1-5 rating
    interval: 7  // days since last review
});
```

### Games

```javascript
// Game started
track.gameStarted(userId, 'flashcards', {
    difficulty: 'A2',
    wordCount: 20
});

// Game completed
track.gameCompleted(userId, 'flashcards', {
    score: 18,
    totalQuestions: 20,
    accuracy: 90
});
```

### Payments

```javascript
// Checkout started
track.checkoutStarted(userId, {
    plan: 'premium_monthly',
    price: 9.99
});

// Payment completed
track.paymentCompleted(userId, 9.99, 'USD', {
    plan: 'premium_monthly'
});
```

---

## 🔍 Capture Errors

```javascript
const { captureError } = require('./lib/analytics-integration');

// API errors
try {
    await fetchVideo(videoId);
} catch (error) {
    captureError.api(error, req, { videoId });
}

// Database errors
try {
    await prisma.user.findUnique({ where: { id: userId } });
} catch (error) {
    captureError.database(error, 'findUnique user', { userId });
}

// Payment errors (critical!)
try {
    await stripe.charges.create({ amount: 999 });
} catch (error) {
    captureError.payment(error, { userId, amount: 999 });
}
```

---

## 📈 View Analytics

### Via API

```bash
# User dashboard
curl http://localhost:3001/api/analytics/dashboard/USER_ID

# System metrics
curl http://localhost:3001/api/analytics/system/metrics

# Content performance
curl http://localhost:3001/api/analytics/content/video/VIDEO_ID
```

### Via Mixpanel Dashboard

1. **DAU/MAU:** Insights > "Daily Active User" > Line chart
2. **Retention:** Retention > "User Signed Up" → "Daily Active User"
3. **Funnels:** Funnels > Create funnel with your events

### Via Sentry Dashboard

1. **Errors:** Issues tab (see all errors)
2. **Performance:** Performance tab (see slow endpoints)
3. **Releases:** Releases tab (track deployments)

---

## 🎯 Key Metrics to Watch

### Daily
- **DAU** (Daily Active Users) - Target: 100+
- **New signups** - Target: 10+
- **Errors** - Target: <5/hour

### Weekly
- **Day 7 retention** - Target: 25%+
- **Videos/session** - Target: 3+
- **Words/week** - Target: 30-50

### Monthly
- **MAU** (Monthly Active Users) - Target: 500+
- **Free → Paid conversion** - Target: 5%+
- **Churn rate** - Target: <5%

---

## 🚨 Set Up Alerts (Optional)

### Sentry Alerts

1. Go to Sentry > **Settings** > **Alerts**
2. Click "**Create Alert**"
3. Choose "**Issues**"
4. Set condition: "**10 events in 1 hour**"
5. Add action: "**Send email**" to your email
6. Save alert

### Email Notifications

Add to `.env`:
```bash
ALERT_EMAIL=your-email@gmail.com
```

Alerts will be sent for:
- Critical errors (>10/hour)
- Payment errors (any)
- Slow APIs (>2s)
- Database issues

---

## 📚 Full Documentation

For detailed guides, see:

1. **[ANALYTICS_GUIDE.md](./ANALYTICS_GUIDE.md)** - Complete tracking guide
2. **[METRICS_DASHBOARD.md](./METRICS_DASHBOARD.md)** - Dashboard setup
3. **[ERROR_MONITORING_GUIDE.md](./ERROR_MONITORING_GUIDE.md)** - Error tracking
4. **[DATA_ANALYSIS_PLAYBOOK.md](./DATA_ANALYSIS_PLAYBOOK.md)** - Data analysis
5. **[ANALYTICS_INTEGRATION_EXAMPLE.md](./ANALYTICS_INTEGRATION_EXAMPLE.md)** - Code examples
6. **[AGENT_5_IMPLEMENTATION_COMPLETE.md](./AGENT_5_IMPLEMENTATION_COMPLETE.md)** - Full details

---

## 🆘 Troubleshooting

### "Events not showing in Mixpanel"

**Check:**
1. Token in `.env`: `echo $MIXPANEL_TOKEN`
2. Server logs: Look for "Mixpanel Analytics initialized"
3. Wait 1-2 minutes (Mixpanel has slight delay)

**Fix:**
- Copy token again from Mixpanel
- Restart server: `npm start`

### "Errors not in Sentry"

**Check:**
1. DSN in `.env`: `echo $SENTRY_DSN`
2. Server logs: Look for "Sentry initialized"
3. Try throwing test error

**Fix:**
- Copy DSN again from Sentry
- Restart server: `npm start`

### "Server won't start"

**Check:**
- Dependencies installed: `npm install`
- No syntax errors in server.js
- Port not in use: `lsof -i :3001`

**Fix:**
```bash
npm install
npm start
```

---

## 🎉 You're Done!

Analytics is now tracking:
- ✅ All user events
- ✅ All errors
- ✅ Performance metrics
- ✅ User properties

**Next steps:**
1. Browse to Mixpanel to see events
2. Check Sentry for any errors
3. Set up dashboards (see METRICS_DASHBOARD.md)
4. Start making data-driven decisions!

---

## 📞 Need Help?

- **Documentation:** Check the 6 guide files in `/docs`
- **Mixpanel Docs:** https://docs.mixpanel.com/
- **Sentry Docs:** https://docs.sentry.io/
- **Create Issue:** GitHub issues

---

**Total setup time: ~10 minutes ⚡**
**Lifetime value: Immeasurable 💎**

