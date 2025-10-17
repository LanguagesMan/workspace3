# 📊 Analytics Integration Example

Quick guide to integrate analytics into your existing server.js

## Step 1: Add to server.js (Top of file)

```javascript
// Add this near the top, after dotenv config
const { setupAnalytics, track, captureError, user, performance } = require('./lib/analytics-integration');

// Initialize analytics (BEFORE routes)
const analytics = setupAnalytics(app);
```

## Step 2: Track Events in Your Routes

### Example: Video API

```javascript
// Video watch endpoint
app.post('/api/videos/watch', async (req, res) => {
    try {
        const { videoId } = req.body;
        const userId = req.user?.id || req.session?.userId;

        // Get video details
        const video = await prisma.video.findUnique({
            where: { id: videoId }
        });

        // Track event
        track.videoStarted(userId, videoId, {
            title: video.title,
            difficulty: video.difficulty,
            category: video.category,
            duration: video.duration
        });

        res.json({ success: true, video });
    } catch (error) {
        captureError.api(error, req, { videoId: req.body.videoId });
        res.status(500).json({ error: error.message });
    }
});

// Video completion endpoint
app.post('/api/videos/complete', async (req, res) => {
    try {
        const { videoId, watchTime, wordsClicked } = req.body;
        const userId = req.user?.id || req.session?.userId;

        // Track completion
        track.videoCompleted(userId, videoId, {
            watchTime,
            wordsClicked,
            completionRate: (watchTime / video.duration) * 100
        });

        res.json({ success: true });
    } catch (error) {
        captureError.api(error, req);
        res.status(500).json({ error: error.message });
    }
});
```

### Example: Word/Vocabulary API

```javascript
// Save word endpoint
app.post('/api/words/save', async (req, res) => {
    try {
        const { word, translation, context } = req.body;
        const userId = req.user?.id;

        // Save to database
        const savedWord = await prisma.word.create({
            data: {
                userId,
                word,
                translation,
                context,
                saved: true
            }
        });

        // Track event
        track.wordSaved(userId, word, {
            translation,
            context,
            difficulty: savedWord.difficulty
        });

        res.json({ success: true, word: savedWord });
    } catch (error) {
        captureError.api(error, req, { word: req.body.word });
        res.status(500).json({ error: error.message });
    }
});

// Review word endpoint
app.post('/api/words/review', async (req, res) => {
    try {
        const { wordId, quality } = req.body;
        const userId = req.user?.id;

        // Get word
        const word = await prisma.word.findUnique({
            where: { id: wordId }
        });

        // Track review
        track.wordReviewed(userId, word.word, {
            quality,
            interval: word.interval,
            correct: quality >= 3
        });

        res.json({ success: true });
    } catch (error) {
        captureError.api(error, req);
        res.status(500).json({ error: error.message });
    }
});
```

### Example: User Authentication

```javascript
// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, targetLanguage, nativeLanguage } = req.body;

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: await bcrypt.hash(password, 10),
                targetLanguage,
                nativeLanguage
            }
        });

        // Track signup
        track.userSignup(user.id, {
            method: 'email',
            targetLanguage,
            nativeLanguage
        });

        res.json({ success: true, userId: user.id });
    } catch (error) {
        captureError.api(error, req, { email: req.body.email });
        res.status(500).json({ error: error.message });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Authenticate user
        const user = await authenticateUser(email, password);

        // Set user context for error tracking
        user.set({
            id: user.id,
            email: user.email,
            username: user.username,
            level: user.currentLevel
        });

        // Track login
        track.userLogin(user.id, { method: 'email' });

        res.json({ success: true, user });
    } catch (error) {
        captureError.api(error, req);
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    // Clear user context
    user.clear();
    
    req.session.destroy();
    res.json({ success: true });
});
```

### Example: Payment/Stripe

```javascript
// Checkout endpoint
app.post('/api/payment/checkout', async (req, res) => {
    try {
        const { plan, priceId } = req.body;
        const userId = req.user?.id;

        // Track checkout started
        track.checkoutStarted(userId, {
            plan,
            price: planPrices[plan],
            currency: 'USD'
        });

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            customer: user.stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`
        });

        res.json({ success: true, sessionId: session.id });
    } catch (error) {
        // Payment errors are critical!
        captureError.payment(error, {
            userId,
            plan: req.body.plan
        });
        res.status(500).json({ error: error.message });
    }
});

// Stripe webhook (payment completed)
app.post('/api/payment/webhook', async (req, res) => {
    try {
        const event = req.body;

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.client_reference_id;

            // Update user subscription
            await prisma.user.update({
                where: { id: userId },
                data: { subscriptionStatus: 'active' }
            });

            // Track payment completed
            track.paymentCompleted(userId, session.amount_total / 100, 'USD', {
                plan: session.metadata.plan,
                paymentMethod: 'card'
            });
        }

        res.json({ received: true });
    } catch (error) {
        captureError.payment(error, { event: req.body.type });
        res.status(500).json({ error: error.message });
    }
});
```

### Example: Game Events

```javascript
// Start game endpoint
app.post('/api/games/start', async (req, res) => {
    try {
        const { gameType, difficulty } = req.body;
        const userId = req.user?.id;

        // Track game started
        track.gameStarted(userId, gameType, {
            difficulty,
            wordCount: 20
        });

        res.json({ success: true });
    } catch (error) {
        captureError.api(error, req);
        res.status(500).json({ error: error.message });
    }
});

// Complete game endpoint
app.post('/api/games/complete', async (req, res) => {
    try {
        const { gameType, score, totalQuestions, duration } = req.body;
        const userId = req.user?.id;

        const accuracy = (score / totalQuestions) * 100;

        // Track game completed
        track.gameCompleted(userId, gameType, {
            score,
            totalQuestions,
            accuracy,
            duration
        });

        // Also track score
        track.gameScore(userId, gameType, score, {
            accuracy,
            difficulty: req.body.difficulty
        });

        res.json({ success: true });
    } catch (error) {
        captureError.api(error, req);
        res.status(500).json({ error: error.message });
    }
});
```

## Step 3: Add Performance Tracking (Optional)

```javascript
// Track slow database queries
app.get('/api/videos', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const videos = await prisma.video.findMany({
            where: { difficulty: req.query.difficulty }
        });
        
        // Track query performance
        const duration = Date.now() - startTime;
        performance.trackDatabase('findMany videos', duration);
        
        res.json(videos);
    } catch (error) {
        captureError.database(error, 'findMany videos');
        res.status(500).json({ error: error.message });
    }
});

// Track API performance with transaction
app.post('/api/process-video', async (req, res) => {
    const transaction = performance.startTransaction('process-video', 'task');
    
    try {
        await processVideoFile(req.body.videoId);
        transaction.setStatus('ok');
        res.json({ success: true });
    } catch (error) {
        transaction.setStatus('internal_error');
        captureError.api(error, req);
        res.status(500).json({ error: error.message });
    } finally {
        transaction.finish();
    }
});
```

## Step 4: Add Error Handler (End of file)

```javascript
// Add this AFTER all your routes
analytics.addErrorHandler();

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log('📊 Analytics and monitoring active');
});
```

## Complete Example: Minimal server.js Integration

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { setupAnalytics, track, captureError, user } = require('./lib/analytics-integration');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🚀 Initialize Analytics (BEFORE routes)
const analytics = setupAnalytics(app);

// ==================== ROUTES ====================

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Video endpoints
app.post('/api/videos/watch', async (req, res) => {
    try {
        const { videoId } = req.body;
        const userId = req.user?.id;

        // Your logic here
        
        // Track event
        track.videoStarted(userId, videoId);
        
        res.json({ success: true });
    } catch (error) {
        captureError.api(error, req);
        res.status(500).json({ error: error.message });
    }
});

// More routes...

// ==================== ERROR HANDLER ====================

// 🚨 Add error handler (AFTER routes)
analytics.addErrorHandler();

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
```

## Quick Reference

### Track User Events

```javascript
track.userSignup(userId, { method: 'email' });
track.userLogin(userId, { method: 'google' });
track.onboardingComplete(userId, { level: 'A2' });
```

### Track Video Events

```javascript
track.videoStarted(userId, videoId, { title: 'Spanish 101' });
track.videoCompleted(userId, videoId, { watchTime: 120 });
track.videoSkipped(userId, videoId, { watchTime: 15 });
```

### Track Learning Events

```javascript
track.wordClicked(userId, 'hola', { context: 'video' });
track.wordSaved(userId, 'hola', { translation: 'hello' });
track.wordReviewed(userId, 'hola', { quality: 5 });
track.wordMastered(userId, 'hola', { totalReviews: 8 });
```

### Track Game Events

```javascript
track.gameStarted(userId, 'flashcards', { difficulty: 'A2' });
track.gameCompleted(userId, 'flashcards', { score: 18 });
track.gameScore(userId, 'flashcards', 18, { accuracy: 90 });
```

### Track Payment Events

```javascript
track.checkoutStarted(userId, { plan: 'premium' });
track.paymentCompleted(userId, 9.99, 'USD', { plan: 'premium' });
track.subscriptionCancelled(userId, { reason: 'too_expensive' });
```

### Capture Errors

```javascript
captureError.javascript(error, { component: 'VideoPlayer' });
captureError.api(error, req, { videoId });
captureError.database(error, 'SELECT * FROM users', { userId });
captureError.payment(error, { customerId, amount });
```

### User Context

```javascript
// Set user (on login)
user.set({
    id: user.id,
    email: user.email,
    username: user.username,
    level: user.currentLevel
});

// Clear user (on logout)
user.clear();

// Update profile
user.updateProfile(userId, {
    languageLevel: 'B1',
    totalWordsLearned: 500
});
```

### Performance Tracking

```javascript
performance.trackAPI('/api/videos', 'GET', 150);
performance.trackDatabase('SELECT * FROM videos', 45);
performance.trackVideo(videoId, 'buffering', { browser: 'Chrome' });

const transaction = performance.startTransaction('video-upload');
// ... do work ...
transaction.finish();
```

## Testing

```bash
# Test analytics integration
curl -X POST http://localhost:3001/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "event": "Test Event",
    "properties": { "test": true }
  }'

# Test error capture (will appear in Sentry)
curl http://localhost:3001/api/test-error

# Check if analytics is working
curl http://localhost:3001/api/analytics/system/metrics
```

## Common Patterns

### Pattern 1: Track User Journey

```javascript
// Signup
track.userSignup(userId, data);

// Onboarding
track.onboardingComplete(userId, data);

// First video
track.videoStarted(userId, videoId, data);

// First word
track.wordSaved(userId, word, data);
```

### Pattern 2: Error Recovery

```javascript
try {
    await riskyOperation();
} catch (error) {
    // Log error
    captureError.api(error, req, { operation: 'riskyOperation' });
    
    // Try fallback
    try {
        await fallbackOperation();
    } catch (fallbackError) {
        captureError.api(fallbackError, req, { operation: 'fallback' });
        throw fallbackError;
    }
}
```

### Pattern 3: Performance Monitoring

```javascript
const transaction = performance.startTransaction('batch-process');

try {
    for (const item of items) {
        const span = transaction.startChild({ op: 'process-item' });
        await processItem(item);
        span.finish();
    }
    transaction.setStatus('ok');
} catch (error) {
    transaction.setStatus('internal_error');
    throw error;
} finally {
    transaction.finish();
}
```

---

That's it! Your analytics integration is complete. 🎉

For more details, see:
- [ANALYTICS_GUIDE.md](./ANALYTICS_GUIDE.md)
- [ERROR_MONITORING_GUIDE.md](./ERROR_MONITORING_GUIDE.md)
- [AGENT_5_IMPLEMENTATION_COMPLETE.md](./AGENT_5_IMPLEMENTATION_COMPLETE.md)

