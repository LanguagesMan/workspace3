# 📊 Analytics System - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Apply Database Migration
```bash
# Run the migration script
./scripts/apply-analytics-migration.sh

# OR manually
npx prisma migrate dev --name add_analytics_tables
npx prisma generate
```

### Step 2: Start the Server
```bash
npm start
# Server will run on http://localhost:3000
```

### Step 3: View the Dashboard
Open your browser:
```
http://localhost:3000/progress-dashboard.html
```

## 📊 What's Included

### 7 API Endpoints
1. **POST /api/analytics/track** - Track any action
2. **GET /api/analytics/:userId/daily** - Daily stats
3. **GET /api/analytics/:userId/weekly** - Weekly summary
4. **GET /api/analytics/:userId/progress** - Learning progress
5. **GET /api/analytics/:userId/interests** - Interest breakdown
6. **GET /api/analytics/:userId/insights** - AI insights
7. **GET /api/analytics/:userId/engagement** - Engagement history

### Dashboard Features
- 📚 Words Learned (line chart)
- ⏰ Daily Study Time (bar chart)
- 🎯 Skill Assessment (radar chart)
- 💡 Interest Distribution (doughnut chart)
- 🔥 Activity Streak (heatmap calendar)
- ✨ AI Insights & Predictions
- 📈 Progress Stats Cards

### Interest Categories
- 📰 News
- ⚽ Sports
- 🎬 Entertainment
- 💻 Technology
- 🍽️ Food
- ✈️ Travel
- 🎨 Culture

## 🧪 Run Tests
```bash
# Run all analytics tests
npx playwright test tests/analytics-complete.spec.js

# With UI mode
npx playwright test tests/analytics-complete.spec.js --ui

# Generate HTML report
npx playwright test tests/analytics-complete.spec.js --reporter=html
```

## 📝 Track User Actions

### JavaScript Example
```javascript
// Track a video watch
await fetch('/api/analytics/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: localStorage.getItem('userId') || 'demo-user',
    action: {
      type: 'video',
      contentType: 'video',
      contentId: 'video-123',
      duration: 120,
      category: 'Sports',
      action: 'completed'
    }
  })
});

// Get weekly progress
const response = await fetch('/api/analytics/user-123/weekly');
const data = await response.json();
console.log('Weekly Stats:', data.summary);
```

## 🎯 Integrate into Your App

### 1. Track Video Watches
```javascript
// In your video player
videoPlayer.on('ended', async () => {
  await fetch('/api/analytics/track', {
    method: 'POST',
    body: JSON.stringify({
      userId: currentUserId,
      action: {
        type: 'video',
        contentType: 'video',
        contentId: currentVideo.id,
        duration: videoPlayer.duration,
        category: currentVideo.category
      }
    })
  });
});
```

### 2. Track Article Reads
```javascript
// When user finishes reading
const timeSpent = Date.now() - articleStartTime;
await fetch('/api/analytics/track', {
  method: 'POST',
  body: JSON.stringify({
    userId: currentUserId,
    action: {
      type: 'article',
      contentType: 'article',
      contentId: article.id,
      timeSpent: Math.floor(timeSpent / 1000),
      category: article.category,
      action: 'completed'
    }
  })
});
```

### 3. Track Word Learning
```javascript
// When user saves a word
await fetch('/api/analytics/track', {
  method: 'POST',
  body: JSON.stringify({
    userId: currentUserId,
    action: {
      type: 'word',
      contentType: 'vocabulary',
      contentId: `word-${word.spanish}`
    }
  })
});
```

## 🎨 Customize the Dashboard

Edit `public/progress-dashboard.html` to:
- Change chart colors
- Add new visualizations
- Customize insights
- Modify layout

## 📊 Database Schema

### DailyActivity
```prisma
model DailyActivity {
  userId            String
  date              DateTime
  videosWatched     Int
  articlesRead      Int
  wordsLearned      Int
  wordsReviewed     Int
  gamesPlayed       Int
  quizzesCompleted  Int
  timeSpentMins     Int
  streakMaintained  Boolean
}
```

### UserInterestCategory
```prisma
model UserInterestCategory {
  userId      String
  category    String  // News, Sports, Entertainment, etc.
  weight      Float   // 0-10 scale
  lastUpdated DateTime
}
```

### ContentEngagement
```prisma
model ContentEngagement {
  userId      String
  contentType String  // video, article, game, quiz
  contentId   String
  action      String  // viewed, completed, saved, shared
  timeSpent   Int?
  createdAt   DateTime
}
```

## 🐛 Troubleshooting

### Migration Issues
```bash
# If migration fails, reset database
npx prisma migrate reset --force
npx prisma generate
```

### Dashboard Not Loading
1. Check browser console for errors
2. Verify server is running on port 3000
3. Check userId is set: `localStorage.getItem('userId')`
4. Verify API endpoints: `curl http://localhost:3000/api/analytics/demo-user/weekly`

### No Data Showing
1. Track some test actions first
2. Check database: `npx prisma studio`
3. Verify userId matches in requests
4. Check server logs for errors

## 📚 Full Documentation

See [ANALYTICS_SYSTEM_IMPLEMENTATION.md](ANALYTICS_SYSTEM_IMPLEMENTATION.md) for complete documentation including:
- Detailed architecture
- All API endpoints with examples
- Test coverage details
- Future enhancement ideas
- Advanced customization

## 🎉 Success!

Once setup is complete:
1. ✅ Database tables created
2. ✅ API endpoints available
3. ✅ Dashboard accessible
4. ✅ Tests passing
5. ✅ Ready for production!

Visit the dashboard and start tracking learning progress! 🚀


