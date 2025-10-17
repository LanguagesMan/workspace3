# 🚀 Personalization System - Quick Start Guide

## What Was Built

A complete personalization system that learns from user behavior and optimizes ALL content (videos, articles, music) for each user based on:

- **Favorite artists** (music personalization)
- **Favorite genres** (music discovery)
- **Favorite topics** (article personalization)
- **Favorite categories** (video personalization)
- **Learning level** (adaptive difficulty)
- **Behavioral patterns** (automatic learning)

---

## 🎯 Key Features

### 1. Smart Recommendations
- Music personalized by artist and genre preferences
- Articles personalized by topic interests
- Videos personalized by category preferences
- All content matched to user's learning level

### 2. Automatic Learning
- System learns from watch time and completion rates
- Identifies favorites from repeated interactions
- Detects dislikes from skip behavior
- Adjusts difficulty based on success patterns

### 3. Personalized Collections
- "Your Daily Mix" - curated music playlist
- "Recommended Reading" - article list
- "Discover New Artists" - exploration playlist
- Auto-updates based on preferences

---

## 🏃 Quick Start

### 1. Start the Server

```bash
npm start
# Server runs on http://localhost:3001
```

### 2. Test the System

```bash
# Run automated tests
node test-personalization.js
```

Expected output:
```
✅ ALL TESTS PASSED!
Personalization system is working correctly.
```

### 3. Use the APIs

#### Get User Preferences
```bash
curl http://localhost:3001/api/preferences \
  -H "x-user-id: my_user_123"
```

#### Update Preferences
```bash
curl -X PATCH http://localhost:3001/api/preferences \
  -H "Content-Type: application/json" \
  -H "x-user-id: my_user_123" \
  -d '{
    "favorite_artists": ["Bad Bunny", "Shakira", "J Balvin"],
    "favorite_topics": ["technology", "sports", "culture"],
    "favorite_music_genres": ["reggaeton", "pop", "rock"]
  }'
```

#### Get Personalized Music
```bash
curl http://localhost:3001/api/music/personalized?limit=20 \
  -H "x-user-id: my_user_123"
```

#### Track User Interaction
```bash
curl -X POST http://localhost:3001/api/personalization/track-interaction \
  -H "Content-Type: application/json" \
  -H "x-user-id: my_user_123" \
  -d '{
    "userId": "my_user_123",
    "contentId": "song_despacito",
    "contentType": "music",
    "interactionType": "complete",
    "watchTime": 230,
    "completionPercentage": 98,
    "artist": "Luis Fonsi",
    "genre": "reggaeton",
    "difficulty": "B1"
  }'
```

#### Generate Collections
```bash
curl -X POST http://localhost:3001/api/collections/generate \
  -H "Content-Type: application/json" \
  -H "x-user-id: my_user_123" \
  -d '{"userId": "my_user_123"}'
```

---

## 📱 Frontend Integration

### 1. Include Preference Manager

```html
<script src="/js/preference-manager.js"></script>
```

### 2. Initialize and Load Preferences

```javascript
// On page load
window.addEventListener('load', async () => {
    await prefManager.fetchPreferences();
    console.log('User preferences:', prefManager.preferences);
    
    // Display personalized content
    loadPersonalizedFeed();
});
```

### 3. Track User Actions

```javascript
// When user likes content
async function onLike(content) {
    await prefManager.likeContent({
        id: content.id,
        type: 'music', // or 'article', 'video'
        artist: content.artist,
        genre: content.genre,
        difficulty: content.level
    });
    
    showNotification('Added to favorites!');
}

// When user watches content
async function onVideoEnd(videoId, watchTime, duration) {
    await prefManager.trackWatchTime(
        videoId,
        'video',
        watchTime,
        duration,
        { category: 'cooking', difficulty: 'B1' }
    );
}

// When user marks "not interested"
async function onNotInterested(content) {
    await prefManager.notInterested(content, 'artist');
    hideContentCard(content.id);
}
```

### 4. Display Personalized Content

```javascript
// Load personalized music feed
async function loadMusicFeed() {
    const response = await fetch('/api/music/personalized?limit=20', {
        headers: { 'x-user-id': prefManager.userId }
    });
    
    const data = await response.json();
    
    if (data.success) {
        displayMusicCards(data.music);
    }
}

// Load personalized articles
async function loadArticlesFeed() {
    const response = await fetch('/api/articles/personalized?limit=20', {
        headers: { 'x-user-id': prefManager.userId }
    });
    
    const data = await response.json();
    
    if (data.success) {
        displayArticleCards(data.articles);
    }
}
```

---

## 🗄️ Database Setup

### 1. Run Migration

```bash
# Connect to your Supabase project
# Then run the migration SQL file
```

In Supabase Dashboard:
1. Go to SQL Editor
2. Open `/supabase/migrations/add_user_preferences.sql`
3. Run the migration
4. Verify tables were created:
   - `user_preferences`
   - `user_content_interactions`
   - `user_collections`

### 2. Migrate Existing Users

```bash
# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-key"

# Preview migration (dry run)
node scripts/migrate-user-preferences.js --dry-run

# Run actual migration
node scripts/migrate-user-preferences.js
```

---

## 📊 How Personalization Works

### Scoring System

Each piece of content gets a personalization score:

```
Total Score = 
  Artist Match     × 25% +  // Favorite artist
  Genre Match      × 15% +  // Favorite genre
  Topic Match      × 20% +  // Favorite topic
  Category Match   × 15% +  // Favorite category
  Level Match      × 15% +  // Appropriate difficulty
  Freshness        × 8%  +  // Recent content
  Diversity        × 2%     // Variety
```

**Score Meanings:**
- 1.0 = Perfect match (favorite artist/topic)
- 0.7 = Good match (favorite genre, similar level)
- 0.5 = Neutral (no preference data)
- 0.0 = Disliked (filtered out)

### Automatic Learning

The system learns automatically when:

1. **High Completion** (80%+ watched/read)
   - Adds artist/topic to implicit favorites
   - Boosts genre/category preference
   - Identifies preferred difficulty level

2. **Skip Behavior** (<10 seconds)
   - Counts as negative signal
   - 3 skips of same artist = add to dislikes
   - Reduces future recommendations

3. **Engagement Patterns**
   - Most watched artists → favorite artists
   - Most read topics → favorite topics
   - Success rate by level → preferred difficulty

---

## 🎨 UI Components to Add

While the backend is complete, create these UI components:

### 1. Preference Setup Wizard (`/public/preference-setup.html`)

```html
<!-- Step 1: Choose favorite artists -->
<div class="artist-selector">
  <h2>What Spanish artists do you like?</h2>
  <div class="artist-grid">
    <!-- Show 20+ popular artists -->
    <!-- User selects 3-5 favorites -->
  </div>
</div>

<!-- Step 2: Choose topics -->
<div class="topic-selector">
  <h2>What topics interest you?</h2>
  <div class="topic-grid">
    <!-- Technology, Sports, Culture, etc. -->
  </div>
</div>

<!-- Step 3: Set learning goals -->
<!-- Step 4: Choose content mix -->
```

### 2. Preference Management (add to `/public/profile.html`)

```html
<div class="preferences-section">
  <h3>Your Music Preferences</h3>
  <div id="favorite-artists"></div>
  <button onclick="addArtist()">+ Add Artist</button>
  
  <h3>Your Topics</h3>
  <div id="favorite-topics"></div>
  <button onclick="addTopic()">+ Add Topic</button>
  
  <h3>Content Mix</h3>
  <input type="range" id="video-percentage" value="40" />
  <input type="range" id="article-percentage" value="40" />
  <input type="range" id="music-percentage" value="20" />
</div>
```

### 3. Content Action Buttons (add to cards)

```html
<div class="content-card">
  <h4>Song Title</h4>
  <p>Artist Name</p>
  
  <div class="actions">
    <button onclick="likeContent(content)">❤️ Like</button>
    <button onclick="saveToPlaylist(content)">💾 Save</button>
    <button onclick="notInterested(content)">🚫 Not Interested</button>
  </div>
</div>
```

---

## 🧪 Testing Checklist

- [ ] Server starts without errors
- [ ] Can fetch default preferences
- [ ] Can update preferences
- [ ] Can add/remove from preference lists
- [ ] Can track interactions
- [ ] Can get personalized music
- [ ] Can get personalized articles
- [ ] Can get personalized videos
- [ ] Can generate collections
- [ ] Can get user collections
- [ ] Preference learning runs without errors
- [ ] Migration script works

Run: `node test-personalization.js` to verify all.

---

## 📚 API Reference

### Preferences

- `GET /api/preferences` - Get user preferences
- `PATCH /api/preferences` - Update preferences
- `POST /api/preferences/add` - Add to list (artist, topic, etc.)
- `POST /api/preferences/remove` - Remove from list

### Personalized Feeds

- `GET /api/music/personalized` - Personalized music feed
- `GET /api/articles/personalized` - Personalized articles feed
- `GET /api/videos/personalized` - Personalized videos feed

### Collections

- `GET /api/collections` - Get user collections
- `POST /api/collections` - Create collection
- `POST /api/collections/generate` - Auto-generate all collections
- `POST /api/collections/daily-mix` - Generate Daily Mix
- `POST /api/collections/:id/items` - Add item to collection
- `DELETE /api/collections/:id/items/:itemId` - Remove item

### Tracking & Learning

- `POST /api/personalization/track-interaction` - Track interaction
- `POST /api/personalization/learn-preferences` - Run preference learning

---

## ✅ Success Criteria

The system is working correctly when:

1. ✅ New users get default preferences
2. ✅ Users can set explicit preferences
3. ✅ System tracks all interactions
4. ✅ Personalized feeds return scored content
5. ✅ High completion triggers automatic learning
6. ✅ Collections auto-generate based on preferences
7. ✅ Dislikes are filtered from feeds
8. ✅ Content mix respects user percentages

---

## 🎯 Next Actions

1. **Test the system**: Run `node test-personalization.js`
2. **Migrate existing users**: Run migration script
3. **Create UI components**: Build preference wizard and management UI
4. **Integrate into app**: Add personalized feeds to main pages
5. **Monitor performance**: Watch for user engagement improvements

---

## 📞 Support

If you encounter issues:

1. Check server logs for errors
2. Verify Supabase connection
3. Confirm all migrations ran successfully
4. Test API endpoints with curl
5. Check browser console for frontend errors

---

**Status: Backend Implementation Complete ✅**

All personalization logic is operational. The system will learn from user behavior and deliver increasingly personalized recommendations over time.

