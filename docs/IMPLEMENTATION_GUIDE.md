# 🚀 Implementation Guide - Research-Backed Learning System

## Quick Start

### 1. Initialize the System

```javascript
const UnifiedLearningSystem = require('./lib/unified-learning-system');

const learningSystem = new UnifiedLearningSystem();
```

### 2. Generate Personalized Feed

```javascript
// Get user's personalized video/article feed
const feed = await learningSystem.generatePersonalizedFeed('user123', {
    feedType: 'videos',
    count: 20,
    availableContent: allVideos,
    userHistory: userWatchHistory
});

console.log(feed.feed);  // Ranked content
console.log(feed.userProfile);  // Personalization stage
console.log(feed.dueWords);  // Words due for review
```

### 3. Track User Interactions

```javascript
// User watched a video
const result = await learningSystem.trackInteraction('user123', {
    contentId: 'video_456',
    contentType: 'video',
    action: 'complete',
    watchTime: 28,
    videoDuration: 30,
    completed: true,
    words: [
        { 
            word: 'hablar', 
            correct: true, 
            frequency: 150,
            isCognate: false 
        }
    ]
});

console.log(result.xp);  // XP awarded
console.log(result.streak);  // Streak updated
console.log(result.wordUpdates);  // Memory states updated
```

### 4. Get User Dashboard

```javascript
const dashboard = await learningSystem.getUserDashboard('user123');

console.log(dashboard.user);  // Level, XP, streak
console.log(dashboard.learning);  // Weak words, recommendations
console.log(dashboard.streak);  // Streak risk analysis
```

---

## API Integration Examples

### Express.js Routes

```javascript
const express = require('express');
const UnifiedLearningSystem = require('./lib/unified-learning-system');

const app = express();
const learningSystem = new UnifiedLearningSystem();

// Get personalized feed
app.get('/api/feed/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { type = 'videos', count = 20 } = req.query;
        
        // Get user's watch history from database
        const userHistory = await db.getUserHistory(userId);
        
        // Get available content
        const availableContent = await db.getContent(type);
        
        // Generate personalized feed
        const feed = await learningSystem.generatePersonalizedFeed(userId, {
            feedType: type,
            count: parseInt(count),
            availableContent,
            userHistory
        });
        
        res.json(feed);
    } catch (error) {
        console.error('Feed error:', error);
        res.status(500).json({ error: 'Failed to generate feed' });
    }
});

// Track interaction
app.post('/api/track/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const interaction = req.body;
        
        const result = await learningSystem.trackInteraction(userId, interaction);
        
        // Save to database
        await db.saveInteraction(userId, interaction, result);
        
        res.json(result);
    } catch (error) {
        console.error('Track error:', error);
        res.status(500).json({ error: 'Failed to track interaction' });
    }
});

// Get user dashboard
app.get('/api/dashboard/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const dashboard = await learningSystem.getUserDashboard(userId);
        res.json(dashboard);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

// Generate practice session
app.get('/api/practice/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { duration = 10 } = req.query;
        
        const session = await learningSystem.generatePracticeSession(
            userId, 
            parseInt(duration)
        );
        
        res.json(session);
    } catch (error) {
        console.error('Practice error:', error);
        res.status(500).json({ error: 'Failed to generate practice' });
    }
});

// Check streak status
app.get('/api/streak/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const gamification = learningSystem.gamification;
        
        const streakRisk = gamification.checkStreakAtRisk(userId);
        const streakUpdate = gamification.updateStreak(userId);
        
        res.json({
            ...streakUpdate,
            risk: streakRisk
        });
    } catch (error) {
        console.error('Streak error:', error);
        res.status(500).json({ error: 'Failed to check streak' });
    }
});

app.listen(3001, () => {
    console.log('✅ Learning system running on port 3001');
});
```

---

## Frontend Integration

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function usePersonalizedFeed(userId, feedType = 'videos') {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    
    useEffect(() => {
        async function loadFeed() {
            try {
                const response = await fetch(`/api/feed/${userId}?type=${feedType}`);
                const data = await response.json();
                
                setFeed(data.feed);
                setUserProfile(data.userProfile);
            } catch (error) {
                console.error('Failed to load feed:', error);
            } finally {
                setLoading(false);
            }
        }
        
        loadFeed();
    }, [userId, feedType]);
    
    return { feed, userProfile, loading };
}

// Usage
function VideoFeed() {
    const userId = 'user123';
    const { feed, userProfile, loading } = usePersonalizedFeed(userId, 'videos');
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div>
            <h2>Your Feed ({userProfile.personalizationStage})</h2>
            {feed.map(video => (
                <VideoCard 
                    key={video.id} 
                    video={video}
                    onComplete={() => trackInteraction(video)}
                />
            ))}
        </div>
    );
}
```

### Track Interaction

```javascript
async function trackInteraction(video) {
    const interaction = {
        contentId: video.id,
        contentType: 'video',
        action: 'complete',
        watchTime: video.watchTime,
        videoDuration: video.duration,
        completed: true,
        words: extractWords(video.subtitles)
    };
    
    const response = await fetch(`/api/track/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interaction)
    });
    
    const result = await response.json();
    
    // Show XP reward animation
    if (result.xp?.bonusAwarded) {
        showBonusAnimation(result.xp.xpAwarded);
    }
    
    // Show level up
    if (result.xp?.levelUp) {
        showLevelUpModal(result.xp.level);
    }
    
    // Show streak milestone
    if (result.streak?.milestoneReached) {
        showStreakMilestone(result.streak.streakDays);
    }
}
```

### Dashboard Component

```javascript
function Dashboard({ userId }) {
    const [dashboard, setDashboard] = useState(null);
    
    useEffect(() => {
        async function loadDashboard() {
            const response = await fetch(`/api/dashboard/${userId}`);
            const data = await response.json();
            setDashboard(data);
        }
        loadDashboard();
    }, [userId]);
    
    if (!dashboard) return <div>Loading...</div>;
    
    return (
        <div className="dashboard">
            {/* User Stats */}
            <div className="stats">
                <h2>Level {dashboard.user.userLevel}</h2>
                <p>XP: {dashboard.user.xp}</p>
                <p>Streak: {dashboard.user.streakDays} days 🔥</p>
            </div>
            
            {/* Weak Words */}
            <div className="weak-words">
                <h3>Words to Practice</h3>
                {dashboard.learning.weakWords.map(word => (
                    <div key={word.word} className={`word ${word.urgency}`}>
                        <span>{word.word}</span>
                        <StrengthMeter bars={word.strengthBars} />
                        <span>{word.daysUntilReview.toFixed(1)} days</span>
                    </div>
                ))}
            </div>
            
            {/* Streak Risk Warning */}
            {dashboard.streak.atRisk && (
                <div className="streak-warning">
                    <h3>⚠️ Your {dashboard.streak.current}-day streak is at risk!</h3>
                    <p>{dashboard.streak.hoursRemaining} hours remaining</p>
                    <button onClick={() => startPractice()}>Save My Streak</button>
                </div>
            )}
            
            {/* Achievements */}
            <div className="achievements">
                <h3>Achievements</h3>
                {dashboard.achievements.map(achievementId => (
                    <AchievementBadge key={achievementId} id={achievementId} />
                ))}
            </div>
        </div>
    );
}
```

---

## Database Schema Recommendations

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    current_level VARCHAR(10) DEFAULT 'A2',
    xp INTEGER DEFAULT 0,
    user_level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Memory States (Spaced Repetition)
```sql
CREATE TABLE memory_states (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    word_id VARCHAR(255),
    total_exposures INTEGER DEFAULT 0,
    correct_recalls INTEGER DEFAULT 0,
    incorrect_recalls INTEGER DEFAULT 0,
    current_half_life FLOAT DEFAULT 1.0,
    last_review_date TIMESTAMP,
    next_review_date TIMESTAMP,
    strength_bars INTEGER DEFAULT 0,
    UNIQUE(user_id, word_id)
);
```

### Interactions Table
```sql
CREATE TABLE interactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    content_id VARCHAR(255),
    content_type VARCHAR(50),
    action VARCHAR(50),
    watch_time INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    xp_awarded INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Known Words Table
```sql
CREATE TABLE known_words (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    word VARCHAR(255),
    learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, word)
);
```

---

## Performance Optimization

### 1. Caching Strategy

```javascript
const NodeCache = require('node-cache');
const feedCache = new NodeCache({ stdTTL: 300 }); // 5 minutes

app.get('/api/feed/:userId', async (req, res) => {
    const { userId } = req.params;
    const cacheKey = `feed_${userId}`;
    
    // Check cache
    const cached = feedCache.get(cacheKey);
    if (cached) {
        return res.json(cached);
    }
    
    // Generate feed
    const feed = await learningSystem.generatePersonalizedFeed(userId, options);
    
    // Cache result
    feedCache.set(cacheKey, feed);
    
    res.json(feed);
});
```

### 2. Batch Processing

```javascript
// Process multiple interactions at once
app.post('/api/track-batch/:userId', async (req, res) => {
    const { userId } = req.params;
    const { interactions } = req.body;
    
    const results = await Promise.all(
        interactions.map(interaction => 
            learningSystem.trackInteraction(userId, interaction)
        )
    );
    
    res.json({ results });
});
```

### 3. Background Jobs

```javascript
const cron = require('node-cron');

// Send streak risk notifications every hour
cron.schedule('0 * * * *', async () => {
    const atRiskUsers = await db.getAtRiskStreaks();
    
    for (const user of atRiskUsers) {
        const notification = learningSystem.gamification.generateNotification(
            user.id, 
            'streak_risk'
        );
        
        await sendPushNotification(user.id, notification);
    }
});

// Update personalization models daily
cron.schedule('0 2 * * *', async () => {
    console.log('Updating ML models...');
    // Train models with latest data
});
```

---

## Testing

### Unit Tests

```javascript
const assert = require('assert');
const UnifiedLearningSystem = require('./lib/unified-learning-system');

describe('UnifiedLearningSystem', () => {
    let system;
    
    beforeEach(() => {
        system = new UnifiedLearningSystem();
    });
    
    it('should generate cold start feed', async () => {
        const feed = await system.generatePersonalizedFeed('new_user', {
            availableContent: mockVideos,
            userHistory: []
        });
        
        assert.equal(feed.userProfile.personalizationStage, 'cold_start');
        assert(feed.feed.length > 0);
    });
    
    it('should award XP with variable rewards', () => {
        const results = [];
        
        // Test variable rewards (should see variance)
        for (let i = 0; i < 100; i++) {
            const result = system.gamification.calculateXP('watchToCompletion');
            results.push(result);
        }
        
        const unique = [...new Set(results)];
        assert(unique.length > 1, 'XP should vary');
    });
    
    it('should calculate HLR half-life', () => {
        const features = {
            totalExposures: 5,
            correctRecalls: 4,
            incorrectRecalls: 1,
            wordLength: 6,
            wordFrequency: 500
        };
        
        const halfLife = system.spacedRepetition.estimateHalfLife(features);
        assert(halfLife > 0);
        assert(halfLife < 365);
    });
});
```

---

## Monitoring & Analytics

### Key Metrics to Track

```javascript
// Engagement metrics
const metrics = {
    dau: await countDailyActiveUsers(),
    avgSessionLength: await getAvgSessionLength(),
    videosPerSession: await getAvgVideosPerSession(),
    completionRate: await getCompletionRate(),
    rewatchRate: await getRewatchRate()
};

// Learning metrics
const learningMetrics = {
    day7Retention: await getRetention(7),
    day30Retention: await getRetention(30),
    wordsPerWeek: await getAvgWordsLearned('week'),
    quizCompletion: await getQuizCompletionRate(),
    streakMaintenance: await getStreakMaintenance()
};

// Monetization metrics
const revenue = {
    trialConversion: await getTrialConversion(),
    paidConversion: await getPaidConversion(),
    monthlyChurn: await getChurnRate('month'),
    ltv: await calculateLTV()
};
```

---

## Troubleshooting

### Common Issues

**1. Feed not personalizing**
- Check user has >15 videos watched (cold start threshold)
- Verify userHistory is being passed correctly
- Check personalizationStage in response

**2. XP not awarding**
- Verify action names match XP_VALUES keys
- Check streak is updating (affects XP multiplier)
- Confirm trackInteraction is called

**3. Memory states not updating**
- Check word IDs are consistent
- Verify correct/incorrect is boolean
- Ensure practiceResult has all required fields

**4. Streak keeps breaking**
- Check timezone alignment
- Verify lastActiveDate is ISO string
- Test streak freeze functionality

---

## Next Steps

1. **Week 1-2**: Integrate feed algorithm into existing video feed
2. **Week 3-4**: Implement HLR spaced repetition for vocabulary
3. **Week 5-6**: Add adaptive difficulty distribution
4. **Week 7-8**: Launch gamification (XP, streaks, achievements)
5. **Week 9-10**: A/B test and optimize
6. **Week 11-12**: Scale and monitor

---

## Support

For implementation help:
- See `/docs/ALGORITHM_SPECIFICATION.md` for detailed research
- Check `/lib/*.js` for algorithm source code
- Review test files in `/tests/` for usage examples

**Good luck building the world's best language learning app! 🚀**
