# 🚀 AGENT 6 - QUICK START GUIDE

## Getting Started with AI Tutor & Engagement Features

This guide will help you quickly integrate and use all the new Agent 6 features in your Langflix application.

---

## 📦 Prerequisites

1. **Node.js** v18+ installed
2. **OpenAI API Key** (for pronunciation scoring)
3. **Running Langflix server** on port 3001

---

## ⚡ Installation

No additional installation required! All Agent 6 features are already included in the codebase.

Just make sure you have your `.env` file configured:

```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

---

## 🎯 Quick Access

### UI Pages

1. **Quests & Challenges**  
   👉 http://localhost:3001/quests-challenges.html

2. **Scenario Practice**  
   👉 http://localhost:3001/scenario-practice.html

3. **AI Voice Chat** (Enhanced)  
   👉 http://localhost:3001/ai-voice-chat.html

4. **Leaderboard** (Enhanced)  
   👉 http://localhost:3001/leaderboard.html

### API Base URL

All Agent 6 endpoints start with:
```
http://localhost:3001/api/agent6/
```

---

## 🎮 Feature Overview

### 1. Daily Quests

**Access**: Quests & Challenges page → Daily Quests tab

**What it does**:
- Shows 6 daily quests (reset every 24h)
- Track progress in real-time
- Earn XP and rewards
- Build daily streaks

**Try it**:
```javascript
// Track a quest action
fetch('/api/agent6/quests/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userId: 'demo_user',
        action: 'watch_video'
    })
});
```

### 2. Weekly Challenges

**Access**: Quests & Challenges page → Weekly Challenges tab

**What it does**:
- 7 week-long challenges
- Bigger rewards (1000-2500 XP)
- Badge unlocks
- Progress tracking

### 3. Friend Challenges

**Access**: Quests & Challenges page → Challenges tab

**What it does**:
- Challenge friends to compete
- 5 challenge types (Words, Videos, Quizzes, Streaks, XP)
- Real-time progress comparison
- Winner rewards

**Try it**:
```javascript
// Create a challenge
fetch('/api/agent6/challenges/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        challengerId: 'user1',
        challengedId: 'user2',
        challengeType: 'xp_race',
        duration: 7
    })
});
```

### 4. Leaderboards

**Access**: Quests & Challenges page → Leaderboard tab

**What it does**:
- Weekly/monthly/all-time rankings
- League system (Bronze → Legend)
- Top 50 display
- Your rank & position

### 5. Pronunciation Scoring

**Access**: Integrated in AI Voice Chat + Scenario Practice

**What it does**:
- Real-time pronunciation analysis
- Score 0-100 with letter grades
- Specific feedback on mistakes
- Progress tracking

**Try it**:
```javascript
// Score pronunciation
const formData = new FormData();
formData.append('audio', audioBlob);
formData.append('userId', 'demo_user');
formData.append('targetText', 'Hola, ¿cómo estás?');

fetch('/api/agent6/pronunciation/score', {
    method: 'POST',
    body: formData
});
```

### 6. Scenario Practice

**Access**: Scenario Practice page

**What it does**:
- 8 real-world scenarios
- Level-appropriate (A1-C2)
- AI conversation partner
- Objective-based practice
- Performance scoring

**Scenarios**:
- 🍽️ Restaurant ordering
- 🛒 Market shopping
- 🗺️ Asking directions
- 💼 Job interview
- 🏥 Doctor appointment
- 🏨 Hotel check-in
- 📊 Business meeting
- 👋 Making friends

**Try it**:
```javascript
// Start scenario
fetch('/api/agent6/scenarios/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userId: 'demo_user',
        scenarioId: 'restaurant_ordering',
        userLevel: 'A2'
    })
});
```

### 7. Social Sharing

**What it does**:
- Generate beautiful share cards
- 7 share types (streak, achievement, level-up, etc.)
- Social media integration
- Referral tracking

**Try it**:
```javascript
// Generate share card
fetch('/api/agent6/share/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userId: 'demo_user',
        shareType: 'streak',
        data: {
            days: 30,
            xp: 5000,
            wordsLearned: 250
        }
    })
});
```

### 8. Study Together

**What it does**:
- Create collaborative study rooms
- Real-time progress sharing
- Group chat
- Shared milestones
- Group challenges

**Try it**:
```javascript
// Create study room
fetch('/api/agent6/study-rooms/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        hostUserId: 'demo_user',
        roomConfig: {
            name: 'Spanish Study Group',
            maxMembers: 10,
            isPublic: true
        }
    })
});
```

### 9. Streak Insurance

**What it does**:
- Protect your learning streak
- Automatic freeze (1 free)
- Buy insurance (7 days)
- Repair broken streaks (24h)
- Milestone rewards

**Try it**:
```javascript
// Check streak status
fetch('/api/agent6/streak/demo_user')
    .then(r => r.json())
    .then(data => console.log(data));

// Update streak (call on activity)
fetch('/api/agent6/streak/demo_user/update', {
    method: 'POST'
});
```

---

## 🧪 Testing

### Manual Testing

1. **Test Quests**:
   - Open `/quests-challenges.html`
   - Watch a video → see quest progress update
   - Complete 5 videos → see "Video Enthusiast" complete

2. **Test Scenarios**:
   - Open `/scenario-practice.html`
   - Click "Restaurant Ordering"
   - Have a conversation
   - Complete scenario → see score

3. **Test Pronunciation**:
   - Open `/ai-voice-chat.html`
   - Record yourself saying "Hola"
   - See pronunciation score

4. **Test Challenges**:
   - Create a challenge between two users
   - Track actions for both users
   - See progress update
   - Check winner after duration

### API Testing (with curl)

```bash
# Get user's quests
curl http://localhost:3001/api/agent6/quests/demo_user

# Track quest action
curl -X POST http://localhost:3001/api/agent6/quests/track \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo_user","action":"watch_video"}'

# Get leaderboard
curl http://localhost:3001/api/agent6/leaderboard/weekly

# Get scenarios
curl http://localhost:3001/api/agent6/scenarios

# Check streak
curl http://localhost:3001/api/agent6/streak/demo_user
```

---

## 🔌 Integration Examples

### Track User Activity

Whenever a user completes an action, track it for quests:

```javascript
// After video watch
await fetch('/api/agent6/quests/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userId: currentUser.id,
        action: 'watch_video',
        metadata: { videoId: video.id }
    })
});

// After word save
await fetch('/api/agent6/quests/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userId: currentUser.id,
        action: 'save_word',
        metadata: { word: 'hola' }
    })
});

// After quiz completion
await fetch('/api/agent6/quests/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userId: currentUser.id,
        action: 'complete_quiz',
        metadata: { score: 85 }
    })
});
```

### Update Streak Daily

Call this whenever user logs in or completes any activity:

```javascript
async function checkStreakStatus() {
    const response = await fetch(`/api/agent6/streak/${userId}/update`, {
        method: 'POST'
    });
    const result = await response.json();
    
    if (result.data.status === 'continued') {
        showNotification(`🔥 ${result.data.streak} day streak!`);
    } else if (result.data.status === 'freeze_used') {
        showNotification('🛡️ Streak protected!');
    }
}
```

### Show Quest Progress

Display quest progress in your main UI:

```javascript
async function loadQuestProgress() {
    const response = await fetch(`/api/agent6/quests/${userId}`);
    const result = await response.json();
    
    // Show daily quest completion
    const dailyCompleted = result.data.summary.dailyCompleted;
    const dailyTotal = result.data.summary.dailyTotal;
    
    document.getElementById('questProgress').textContent = 
        `${dailyCompleted}/${dailyTotal} Daily Quests`;
}
```

---

## 🎨 Customization

### Change Quest Targets

Edit `lib/quest-system.js`:

```javascript
// Change daily quest target
daily_watch_videos: {
    target: 5,  // Change to 10 for harder quest
    xpReward: 100  // Adjust rewards
}
```

### Add New Scenarios

Edit `lib/scenario-practice-system.js`:

```javascript
// Add new scenario
your_new_scenario: {
    id: 'your_new_scenario',
    name: 'Your Scenario Name',
    description: '...',
    level: 'A2',
    difficulty: 'easy',
    vocabulary: [...],
    objectives: [...],
    startingPrompt: '...'
}
```

### Customize Share Templates

Edit `lib/social-sharing-system.js`:

```javascript
// Add new share template
your_template: {
    id: 'your_template',
    name: 'Your Share Type',
    gradient: ['#FF6B6B', '#FFE66D'],
    icon: '🎉',
    template: (data) => ({...})
}
```

---

## 🐛 Troubleshooting

### Quest Progress Not Updating

**Problem**: Quests don't update when completing actions  
**Solution**: Make sure you're calling `/api/agent6/quests/track` with correct action type

Supported actions:
- `watch_video`
- `save_word`
- `complete_quiz`
- `ai_turn`
- `perfect_quiz`
- `play_listening_game`
- `share_content`
- `daily_login`

### Pronunciation Scoring Fails

**Problem**: Getting errors when scoring pronunciation  
**Solution**: 
1. Check OpenAI API key is set in `.env`
2. Verify audio file is under 10MB
3. Make sure audio format is supported (webm, mp3, wav)

### Scenarios Not Loading

**Problem**: Scenario list is empty  
**Solution**: Check user level is set correctly (A1, A2, B1, B2, C1, C2)

### Streak Not Updating

**Problem**: Streak stays at 0  
**Solution**: Call `/api/agent6/streak/:userId/update` after any user activity

---

## 📊 Monitoring & Analytics

Check these endpoints for insights:

```javascript
// Quest stats
GET /api/agent6/quests/:userId/stats

// Quest history
GET /api/agent6/quests/:userId/history

// Challenge stats
GET /api/agent6/challenges/user/:userId

// Pronunciation progress
GET /api/agent6/pronunciation/:userId/progress

// Share analytics
GET /api/agent6/share/user/:userId/stats

// Streak history
GET /api/agent6/streak/:userId
```

---

## 🚀 Next Steps

1. ✅ Test all features manually
2. ✅ Integrate quest tracking in main app
3. ✅ Add streak notifications
4. ✅ Customize quest targets
5. ✅ Add new scenarios
6. ✅ Deploy to production

---

## 💡 Tips for Best Results

1. **Quests**: Call track action immediately after user completes activity
2. **Streaks**: Update streak on every login and activity
3. **Pronunciation**: Use high-quality audio recordings
4. **Scenarios**: Start with easier scenarios (A2) before harder ones (B2+)
5. **Challenges**: Notify users when challenged via email/push
6. **Sharing**: Add social proof ("100 people shared this today!")
7. **Study Rooms**: Promote during peak hours for better engagement

---

## 📞 Need Help?

Check out:
- Full documentation: `AGENT_6_IMPLEMENTATION_COMPLETE.md`
- API reference: All endpoints in `api/agent6-features.js`
- System code: All logic in `lib/*-system.js` files

---

**Built with ❤️ for Langflix - Making Spanish learning addictive!** 🚀


