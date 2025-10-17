# 🎯 AGENT 11: Analytics & User Profiler

**Branch:** `agent-11-analytics-system`  
**Estimated Time:** 2-3 hours  
**Priority:** HIGH - Enables data-driven decisions

---

## 🎯 MISSION

Build a comprehensive analytics system to track learning progress and enable data-driven personalization. Track everything, visualize beautifully, predict progress.

---

## 📋 CRITICAL TASKS

### Task 1: Database Schema (15 minutes)

**Add to `/prisma/schema.prisma`:**
```prisma
model DailyActivity {
  id                String   @id @default(cuid())
  userId            String
  date              DateTime @db.Date
  
  videosWatched     Int      @default(0)
  articlesRead      Int      @default(0)
  wordsLearned      Int      @default(0)
  wordsReviewed     Int      @default(0)
  gamesPlayed       Int      @default(0)
  quizzesCompleted  Int      @default(0)
  timeSpentMins     Int      @default(0)
  streakMaintained  Boolean  @default(false)
  
  createdAt         DateTime @default(now())
  
  user              User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, date])
  @@index([userId, date])
}

model UserInterest {
  id            String   @id @default(cuid())
  userId        String
  category      String   // Sports, Technology, News, Food, etc.
  weight        Float    @default(0.5)  // 0-1, higher = stronger interest
  lastUpdated   DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, category])
  @@index([userId, weight])
}

model ContentEngagement {
  id            String   @id @default(cuid())
  userId        String
  contentType   String   // video, article, game, quiz
  contentId     String
  action        String   // viewed, completed, saved, shared
  timeSpent     Int      // seconds
  createdAt     DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
  @@index([userId, contentType])
}
```

---

### Task 2: Analytics Engine (1 hour)
**File:** `/lib/analytics-engine.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AnalyticsEngine {
  
  /**
   * Track user activity
   */
  async trackActivity(data) {
    const { userId, activityType, value = 1, timeSpent = 0 } = data;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get or create today's activity record
    const activity = await prisma.dailyActivity.upsert({
      where: {
        userId_date: { userId, date: today }
      },
      update: this.getUpdateData(activityType, value, timeSpent),
      create: {
        userId,
        date: today,
        ...this.getUpdateData(activityType, value, timeSpent)
      }
    });
    
    // Check and update streak
    await this.updateStreak(userId);
    
    return activity;
  }
  
  getUpdateData(activityType, value, timeSpent) {
    const updates = { timeSpentMins: { increment: Math.round(timeSpent / 60) } };
    
    switch (activityType) {
      case 'video_watched':
        updates.videosWatched = { increment: value };
        break;
      case 'article_read':
        updates.articlesRead = { increment: value };
        break;
      case 'word_learned':
        updates.wordsLearned = { increment: value };
        break;
      case 'word_reviewed':
        updates.wordsReviewed = { increment: value };
        break;
      case 'game_played':
        updates.gamesPlayed = { increment: value };
        break;
      case 'quiz_completed':
        updates.quizzesCompleted = { increment: value };
        break;
    }
    
    return updates;
  }
  
  /**
   * Update user's streak
   */
  async updateStreak(userId) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [yesterdayActivity, todayActivity] = await Promise.all([
      prisma.dailyActivity.findUnique({
        where: { userId_date: { userId, date: yesterday } }
      }),
      prisma.dailyActivity.findUnique({
        where: { userId_date: { userId, date: today } }
      })
    ]);
    
    // Streak maintained if active yesterday and today
    const streakMaintained = yesterdayActivity && todayActivity;
    
    if (todayActivity) {
      await prisma.dailyActivity.update({
        where: { id: todayActivity.id },
        data: { streakMaintained }
      });
    }
    
    return streakMaintained;
  }
  
  /**
   * Get daily stats
   */
  async getDailyStats(userId, date = new Date()) {
    date.setHours(0, 0, 0, 0);
    
    const activity = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: { userId, date }
      }
    });
    
    return activity || this.getEmptyActivity();
  }
  
  /**
   * Get weekly summary
   */
  async getWeeklyStats(userId) {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    
    const activities = await prisma.dailyActivity.findMany({
      where: {
        userId,
        date: { gte: weekAgo }
      },
      orderBy: { date: 'asc' }
    });
    
    const summary = {
      totalVideos: 0,
      totalArticles: 0,
      totalWords: 0,
      totalReviews: 0,
      totalGames: 0,
      totalQuizzes: 0,
      totalTimeMins: 0,
      currentStreak: this.calculateStreak(activities),
      dailyAverage: {},
      mostActiveDay: null,
      leastActiveDay: null
    };
    
    activities.forEach(day => {
      summary.totalVideos += day.videosWatched;
      summary.totalArticles += day.articlesRead;
      summary.totalWords += day.wordsLearned;
      summary.totalReviews += day.wordsReviewed;
      summary.totalGames += day.gamesPlayed;
      summary.totalQuizzes += day.quizzesCompleted;
      summary.totalTimeMins += day.timeSpentMins;
    });
    
    const days = activities.length || 1;
    summary.dailyAverage = {
      videos: Math.round(summary.totalVideos / days),
      articles: Math.round(summary.totalArticles / days),
      words: Math.round(summary.totalWords / days),
      timeMins: Math.round(summary.totalTimeMins / days)
    };
    
    return summary;
  }
  
  /**
   * Calculate current streak
   */
  calculateStreak(activities) {
    if (activities.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Count backwards from today
    for (let i = activities.length - 1; i >= 0; i--) {
      const activityDate = new Date(activities[i].date);
      activityDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.round((currentDate - activityDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0 || (daysDiff === 1 && activities[i].streakMaintained)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  /**
   * Get learning progress over time
   */
  async getProgressCurve(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const activities = await prisma.dailyActivity.findMany({
      where: {
        userId,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });
    
    // Calculate cumulative progress
    let cumulativeWords = 0;
    const curve = activities.map(day => {
      cumulativeWords += day.wordsLearned;
      return {
        date: day.date,
        wordsLearned: cumulativeWords,
        articlesRead: day.articlesRead,
        videosWatched: day.videosWatched,
        timeSpent: day.timeSpentMins
      };
    });
    
    return curve;
  }
  
  /**
   * Track content engagement
   */
  async trackEngagement(data) {
    const { userId, contentType, contentId, action, timeSpent = 0 } = data;
    
    await prisma.contentEngagement.create({
      data: {
        userId,
        contentType,
        contentId,
        action,
        timeSpent,
        createdAt: new Date()
      }
    });
    
    // Update daily activity
    if (action === 'completed') {
      await this.trackActivity({
        userId,
        activityType: contentType === 'video' ? 'video_watched' : 'article_read',
        value: 1,
        timeSpent
      });
    }
  }
  
  getEmptyActivity() {
    return {
      videosWatched: 0,
      articlesRead: 0,
      wordsLearned: 0,
      wordsReviewed: 0,
      gamesPlayed: 0,
      quizzesCompleted: 0,
      timeSpentMins: 0,
      streakMaintained: false
    };
  }
}

module.exports = new AnalyticsEngine();
```

---

### Task 3: User Profiler (45 minutes)
**File:** `/lib/user-profiler.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserProfiler {
  
  /**
   * Build/update user interest profile from behavior
   */
  async updateInterests(userId, contentTopics, timeSpent, action) {
    // Weight based on engagement
    const engagementWeight = this.getEngagementWeight(action, timeSpent);
    
    for (const topic of contentTopics) {
      const current = await prisma.userInterest.findUnique({
        where: {
          userId_category: { userId, category: topic }
        }
      });
      
      const currentWeight = current?.weight || 0.5;
      const newWeight = this.calculateNewWeight(currentWeight, engagementWeight);
      
      await prisma.userInterest.upsert({
        where: {
          userId_category: { userId, category: topic }
        },
        update: {
          weight: newWeight,
          lastUpdated: new Date()
        },
        create: {
          userId,
          category: topic,
          weight: newWeight
        }
      });
    }
  }
  
  getEngagementWeight(action, timeSpent) {
    let weight = 0;
    
    switch (action) {
      case 'completed':
        weight = 0.3;
        break;
      case 'saved':
        weight = 0.2;
        break;
      case 'shared':
        weight = 0.4;
        break;
      case 'viewed':
        weight = 0.1;
        break;
      default:
        weight = 0.05;
    }
    
    // Time spent bonus (max 5 minutes = max bonus)
    const timeBonus = Math.min(timeSpent / 300, 0.2);
    
    return weight + timeBonus;
  }
  
  calculateNewWeight(current, delta) {
    // Moving average with decay
    const decayFactor = 0.95;
    const newWeight = (current * decayFactor) + (delta * (1 - decayFactor));
    
    // Keep in range [0, 1]
    return Math.max(0, Math.min(1, newWeight));
  }
  
  /**
   * Get user's interest profile
   */
  async getInterests(userId) {
    const interests = await prisma.userInterest.findMany({
      where: { userId },
      orderBy: { weight: 'desc' }
    });
    
    return interests.reduce((acc, interest) => {
      acc[interest.category] = interest.weight;
      return acc;
    }, {});
  }
  
  /**
   * Get complete user profile
   */
  async getProfile(userId) {
    const [assessment, interests, recentActivity] = await Promise.all([
      prisma.userAssessment.findUnique({ where: { userId } }),
      this.getInterests(userId),
      prisma.dailyActivity.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 7
      })
    ]);
    
    return {
      userId,
      level: assessment?.currentLevel || 'A2',
      interests,
      learningStyle: this.determineLearningStyle(recentActivity),
      engagement: this.calculateEngagement(recentActivity)
    };
  }
  
  determineLearningStyle(activities) {
    const totals = activities.reduce((acc, day) => {
      acc.videos += day.videosWatched;
      acc.articles += day.articlesRead;
      acc.games += day.gamesPlayed;
      return acc;
    }, { videos: 0, articles: 0, games: 0 });
    
    const total = totals.videos + totals.articles + totals.games;
    
    return {
      prefersVideos: totals.videos / total > 0.5,
      prefersReading: totals.articles / total > 0.4,
      prefersGames: totals.games / total > 0.3,
      avgSessionMins: activities.reduce((sum, day) => sum + day.timeSpentMins, 0) / activities.length || 15
    };
  }
  
  calculateEngagement(activities) {
    const totalDays = activities.length;
    const activeDays = activities.filter(day => day.timeSpentMins > 0).length;
    const avgTime = activities.reduce((sum, day) => sum + day.timeSpentMins, 0) / totalDays || 0;
    
    return {
      consistencyRate: activeDays / totalDays,
      avgDailyMins: Math.round(avgTime),
      engagementLevel: avgTime > 20 ? 'high' : avgTime > 10 ? 'medium' : 'low'
    };
  }
}

module.exports = new UserProfiler();
```

---

### Task 4: Analytics API (20 minutes)
**File:** `/api/analytics/index.js`

```javascript
const express = require('express');
const router = express.Router();
const analyticsEngine = require('../../lib/analytics-engine');
const userProfiler = require('../../lib/user-profiler');

// POST /api/analytics/track - Track user action
router.post('/track', async (req, res) => {
  try {
    const result = await analyticsEngine.trackActivity(req.body);
    res.json({ success: true, activity: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analytics/engagement - Track content engagement
router.post('/engagement', async (req, res) => {
  try {
    await analyticsEngine.trackEngagement(req.body);
    
    // Update user interests
    if (req.body.topics) {
      await userProfiler.updateInterests(
        req.body.userId,
        req.body.topics,
        req.body.timeSpent,
        req.body.action
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/:userId/daily - Daily stats
router.get('/:userId/daily', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    const stats = await analyticsEngine.getDailyStats(userId, date ? new Date(date) : undefined);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/:userId/weekly - Weekly summary
router.get('/:userId/weekly', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await analyticsEngine.getWeeklyStats(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/:userId/progress - Learning curve
router.get('/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days } = req.query;
    const curve = await analyticsEngine.getProgressCurve(userId, parseInt(days) || 30);
    res.json(curve);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/:userId/interests - Interest breakdown
router.get('/:userId/interests', async (req, res) => {
  try {
    const { userId } = req.params;
    const interests = await userProfiler.getInterests(userId);
    res.json(interests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/:userId/profile - Complete profile
router.get('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await userProfiler.getProfile(userId);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

### Task 5: Progress Dashboard UI (45 minutes)
**File:** `/public/progress-dashboard.html`

Create beautiful data visualization dashboard.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Your Progress</title>
  <link rel="stylesheet" href="/css/tiktok-theme.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
</head>
<body>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>📊 Your Learning Journey</h1>
      <p>Track your Spanish progress</p>
    </header>
    
    <!-- Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-value" id="streakDays">0</div>
        <div class="stat-label">Day Streak</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-value" id="totalWords">0</div>
        <div class="stat-label">Words Learned</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-value" id="totalTime">0</div>
        <div class="stat-label">Minutes This Week</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-value" id="currentLevel">B1</div>
        <div class="stat-label">Current Level</div>
      </div>
    </div>
    
    <!-- Charts -->
    <div class="charts-container">
      <!-- Words Learned Over Time -->
      <div class="chart-card">
        <h3>Words Learned Over Time</h3>
        <canvas id="wordsChart"></canvas>
      </div>
      
      <!-- Time Spent Per Day -->
      <div class="chart-card">
        <h3>Daily Activity (Minutes)</h3>
        <canvas id="timeChart"></canvas>
      </div>
      
      <!-- Content Mix -->
      <div class="chart-card">
        <h3>Content Mix This Week</h3>
        <canvas id="contentChart"></canvas>
      </div>
      
      <!-- Skills Radar -->
      <div class="chart-card">
        <h3>Skill Breakdown</h3>
        <canvas id="skillsChart"></canvas>
      </div>
    </div>
    
    <!-- Streak Calendar -->
    <div class="streak-calendar">
      <h3>Activity Heatmap</h3>
      <div id="calendar" class="calendar-grid"></div>
    </div>
    
    <!-- Insights -->
    <div class="insights-section">
      <h3>📈 Insights & Predictions</h3>
      <div class="insight-card">
        <h4>Your Strength</h4>
        <p id="strengthInsight">You're strongest in vocabulary (+23% this week)</p>
      </div>
      <div class="insight-card">
        <h4>Prediction</h4>
        <p id="predictionInsight">At this pace, you'll reach B2 in 47 days! 🎉</p>
      </div>
      <div class="insight-card">
        <h4>Recommendation</h4>
        <p id="recommendationInsight">Try reading more articles to improve grammar skills</p>
      </div>
    </div>
  </div>
  
  <script src="/js/progress-dashboard.js"></script>
</body>
</html>
```

**JavaScript** (`/public/js/progress-dashboard.js`):
```javascript
async function loadDashboard() {
  const userId = getUserId();
  
  // Load all data
  const [weekly, progress, profile] = await Promise.all([
    fetch(`/api/analytics/${userId}/weekly`).then(r => r.json()),
    fetch(`/api/analytics/${userId}/progress?days=30`).then(r => r.json()),
    fetch(`/api/analytics/${userId}/profile`).then(r => r.json())
  ]);
  
  // Update summary cards
  document.getElementById('streakDays').textContent = weekly.currentStreak;
  document.getElementById('totalWords').textContent = weekly.totalWords;
  document.getElementById('totalTime').textContent = weekly.totalTimeMins;
  document.getElementById('currentLevel').textContent = profile.level;
  
  // Create charts
  createWordsChart(progress);
  createTimeChart(progress);
  createContentChart(weekly);
  createSkillsChart(profile);
  createStreakCalendar(progress);
  
  // Generate insights
  generateInsights(weekly, profile);
}

function createWordsChart(data) {
  const ctx = document.getElementById('wordsChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [{
        label: 'Words Learned',
        data: data.map(d => d.wordsLearned),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// Similar functions for other charts...

loadDashboard();
```

---

### Task 6: Playwright Tests (15 minutes)
**File:** `/tests/analytics-complete.spec.js`

```javascript
test.describe('Analytics System', () => {
  test('Dashboard loads with charts', async ({ page }) => {
    await page.goto('http://localhost:3001/progress-dashboard.html');
    
    await expect(page.locator('.stat-card')).toHaveCount(4);
    await expect(page.locator('canvas')).toHaveCount.greaterThanOrEqual(4);
    
    await page.screenshot({ path: 'screenshots/progress-dashboard.png', fullPage: true });
  });
  
  test('Analytics tracking works', async ({ page }) => {
    // Track an activity
    const response = await page.request.post('/api/analytics/track', {
      data: {
        userId: 'test-user',
        activityType: 'video_watched',
        value: 1,
        timeSpent: 180
      }
    });
    
    expect(response.ok()).toBeTruthy();
  });
});
```

---

## 🎯 SUCCESS CRITERIA

- ✅ All user activities tracked
- ✅ Beautiful dashboard with charts
- ✅ Insights generated automatically
- ✅ Interest profiling works
- ✅ Streak calculations accurate
- ✅ All tests pass

**GO BUILD THE BEST ANALYTICS! 🚀**

