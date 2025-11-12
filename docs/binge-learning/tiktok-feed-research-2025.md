# TikTok Feed Algorithm & Scroll Mechanics Research Report (2025)

**Research Date:** November 12, 2025
**Purpose:** Technical implementation guide for building TikTok-quality vertical video feeds
**Focus Areas:** Scroll mechanics, video preloading, engagement tracking, recommendation algorithms, UX patterns

---

## Table of Contents

1. [Vertical Scroll/Snap Implementation](#1-vertical-scrollsnap-implementation)
2. [Video Preloading Strategies](#2-video-preloading-strategies)
3. [Engagement Tracking](#3-engagement-tracking)
4. [Content Recommendation Algorithm](#4-content-recommendation-algorithm)
5. [UI/UX Patterns](#5-uiux-patterns)
6. [GitHub Reference Implementations](#6-github-reference-implementations)
7. [Implementation Checklist](#7-implementation-checklist)

---

## 1. Vertical Scroll/Snap Implementation

### CSS-Based Approach (Modern Standard)

**Core CSS Properties:**

```css
/* Container (scroll parent) */
.feed-container {
  scroll-snap-type: y mandatory;
  overflow-y: auto;
  height: 100vh;
  scroll-behavior: smooth;
}

/* Individual video cards */
.video-card {
  scroll-snap-align: start; /* or 'center' for centered snapping */
  scroll-snap-stop: always; /* prevents skipping items on fast swipes */
  height: 100vh;
  width: 100vw;
}
```

**Key Implementation Details:**

- **`scroll-snap-type: y mandatory`**: Forces snapping to nearest snap point. The "y" indicates vertical direction, "mandatory" prevents users from staying between pages
- **`scroll-snap-align: start`**: Aligns the start of each element to the container's start edge (can use `center` or `end`)
- **`scroll-snap-stop: always`**: Critical for TikTok-style feeds - prevents users from scrolling past multiple items with a single powerful swipe

**Browser Support (2025):**
- ✅ Excellent support across all modern browsers
- ✅ CSS Scroll Snap is handled by compositor thread = smooth performance even on mobile
- ⚠️ iOS Safari has specific quirks (see iOS Safari section below)

**Sources:**
- [Stack Overflow: TikTok-like scrolling with CSS](https://stackoverflow.com/questions/75340067/tiktok-like-scrolling-with-css)
- [CSS-Tricks: Practical CSS Scroll Snapping](https://css-tricks.com/practical-css-scroll-snapping/)
- [web.dev: CSS Scroll Snap](https://web.dev/css-scroll-snap/)

---

### JavaScript Enhancement (2025)

**New JavaScript Scroll Snap Events:**

```javascript
// scrollsnapchanging event - fires during snap transition
element.addEventListener('scrollsnapchanging', (event) => {
  console.log('Snapping to:', event.snapTargetBlock);
  // Preload next video
  preloadNextVideo();
});

// scrollsnapchange event - fires when snap completes
element.addEventListener('scrollsnapchange', (event) => {
  const currentVideo = event.snapTargetBlock;
  // Start playing current video
  currentVideo.play();
  // Pause previous video
  pausePreviousVideo();
});
```

**Benefits of JavaScript Events:**
- Real-time predictions and dynamic interactions
- Precise control over video playback (play when snapped, pause when transitioning)
- Enable custom behaviors beyond CSS-only solutions
- Allow for analytics tracking at snap points

**Sources:**
- [LogRocket: JavaScript scroll snap events](https://blog.logrocket.com/javascript-scroll-snap-events-scroll-triggered-animations/)

---

### iOS Safari Implementation Issues & Solutions

**Problem 1: 100vh Viewport Height**
- Mobile Safari's UI chrome (address bar, toolbar) shrinks/expands when scrolling
- `100vh` is set to the height with address bar hidden, causing content to be partially hidden behind browser chrome
- When content is taller than viewport + scroll-snap, Safari immediately snap-scrolls to next item (impossible to read long content)

**Solution:**
```css
.video-card {
  /* Use calc with safe-area-inset for floating elements */
  height: calc(100vh - env(safe-area-inset-bottom));

  /* Alternative: Use dvh (dynamic viewport height) unit */
  height: 100dvh; /* Adjusts as UI chrome appears/disappears */
}
```

**Problem 2: Scroll Snap Requires Full Swipe**
- iOS Safari scroll-snap requires a "full" swipe (large majority of screen) to work
- Small swipes jump the screen back to the top of current section
- Scrolling up can stop mid-way, resulting in choppy scrolling

**Solution:**
```css
.feed-container {
  scroll-snap-type: y mandatory;
  scroll-snap-stop: always; /* Stricter behavior */
  -webkit-overflow-scrolling: touch; /* Smooth momentum scrolling on iOS */
}
```

**Problem 3: iOS 15+ URL Bar Calculations**
- Safari doesn't correctly calculate new position considering final state of URL bar during snap scrolling

**Solution:**
- Test extensively on iOS devices
- Consider using `scroll-snap-align: center` instead of `start` for more consistent behavior
- Add extra padding/margin to account for UI chrome

**Sources:**
- [Stack Overflow: CSS3 100vh not constant in mobile browser](https://stackoverflow.com/questions/37112218/css3-100vh-not-constant-in-mobile-browser)
- [DEV Community: 100vh problem with iOS Safari](https://dev.to/maciejtrzcinski/100vh-problem-with-ios-safari-3ge9)
- [Stack Overflow: Safari/Webkit CSS scroll-snap bug](https://stackoverflow.com/questions/64317214/safari-webkit-css-scroll-snap-bug)

---

## 2. Video Preloading Strategies

### TikTok's Preloading Architecture

**Key Strategy:** Predictive prefetching - loading just enough, just in time

**Implementation Details:**

1. **Viewport Prediction:**
   - Preload first frame and key metadata for 1-2 videos ahead of current one
   - Apps implementing viewport-based preload see **30-40% reduction in black frame time** during fast scrolls

2. **Scroll-Aware Rendering:**
   - Leverages viewport thresholds to start preloading before user stops scrolling
   - Treats scrolling itself as a playback trigger
   - Pre-renders first frame so next video is ready instantly

3. **Adaptive Buffer Optimization:**
   - Algorithms adjust buffer sizes based on user's network connection
   - Dynamically tweaks buffer length for slower internet speeds
   - Reduces lag and interruptions

4. **Multi-CDN Strategy:**
   - Dynamically selects best network path based on:
     - User location
     - Traffic load
     - Real-time network conditions
   - Prevents bottlenecks during traffic surges

5. **Edge Caching:**
   - Strategically caches frequently watched videos at edge locations
   - Reduces distance between users and content
   - Popular videos load instantly without fetching from centralized servers

**Performance Target:**
- In TikTok-style feeds, you have **barely 500 milliseconds** to capture user attention
- Make these optimizations critical for performance

**Sources:**
- [Fastpix: Optimize Short Video App Performance 2025](https://www.fastpix.io/blog/strategies-to-optimize-performance-of-short-video-apps)
- [Glich: How TikTok Optimizes Video Streaming](https://hw.glich.co/p/how-tiktok-optimizes-video-streaming)

---

### Intersection Observer Implementation

**Basic Video Lazy Loading:**

```javascript
// Initialize observer with rootMargin for preloading
const videoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;

      if (entry.isIntersecting) {
        // Video entering viewport
        if (video.dataset.src) {
          // Load video source from data attribute
          video.src = video.dataset.src;
          video.load();
        }

        // Play when fully visible
        if (entry.intersectionRatio > 0.75) {
          video.play().catch(err => console.log('Autoplay prevented:', err));
        }

        // Stop observing once loaded
        videoObserver.unobserve(video);
      } else {
        // Video leaving viewport - pause
        video.pause();
      }
    });
  },
  {
    root: null, // viewport
    rootMargin: '200px', // Preload 200px before entering viewport
    threshold: [0, 0.25, 0.5, 0.75, 1.0] // Multiple thresholds for granular control
  }
);

// Observe all video elements
document.querySelectorAll('video[data-src]').forEach(video => {
  videoObserver.observe(video);
});
```

**Advanced: Preload Next Video Pattern:**

```javascript
const feedObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const currentIndex = parseInt(entry.target.dataset.index);
        const nextVideo = document.querySelector(`[data-index="${currentIndex + 1}"] video`);

        // Preload next video
        if (nextVideo && !nextVideo.src) {
          nextVideo.src = nextVideo.dataset.src;
          nextVideo.load();
          nextVideo.preload = 'auto';
        }

        // Optional: Preload video after next (n+2)
        const nextNextVideo = document.querySelector(`[data-index="${currentIndex + 2}"] video`);
        if (nextNextVideo && !nextNextVideo.src) {
          nextNextVideo.preload = 'metadata'; // Load only metadata, not full video
        }
      }
    });
  },
  {
    rootMargin: '100% 0px', // Trigger when 1 viewport height away
    threshold: 0.5
  }
);
```

**HTML Structure:**

```html
<div class="feed-container">
  <div class="video-card" data-index="0">
    <video
      data-src="/videos/video-1.mp4"
      poster="/thumbnails/video-1.jpg"
      preload="none"
      muted
      playsinline
      loop
    ></video>
  </div>

  <div class="video-card" data-index="1">
    <video
      data-src="/videos/video-2.mp4"
      poster="/thumbnails/video-2.jpg"
      preload="none"
      muted
      playsinline
      loop
    ></video>
  </div>
</div>
```

**Key Configuration:**

- **`rootMargin: '200px'`**: Preload 200px before element enters viewport (like Next.js default)
- **`threshold: [0.75]`**: Start playing when 75% visible
- **`preload="none"`**: Don't preload until Intersection Observer triggers
- **Chrome lazy loading**: In scrollable regions, images only load when scrolled into view; in main document, has ~1000px buffer

**Sources:**
- [Fastpix: Guide to Lazy Loading HTML Videos](https://www.fastpix.io/blog/guide-to-lazy-loading-html-videos-for-your-website)
- [ImageKit: Comprehensive Guide to Lazy Loading HTML Videos](https://imagekit.io/blog/lazy-loading-html-videos/)
- [LogRocket: Build custom TikTok autoplay React Hook](https://blog.logrocket.com/build-custom-tiktok-autoplay-react-hook-intersection-observer/)

---

## 3. Engagement Tracking

### Key Metrics TikTok Tracks (2025)

**Priority Order (Algorithmic Weight):**

1. **Watch Time & Completion Rate** (Highest Priority)
   - Completion rates determine **74% of For You Page placements**
   - Videos achieving **>70% completion rate** receive significant algorithmic boost
   - Full video watches: **5 algorithm points**

2. **Rewatches** (Strongest Signal)
   - Rewatches are the **strongest engagement signal** in 2025
   - Indicates genuine interest vs. passive scrolling
   - **15-20% rewatch rate** = strong positive signal
   - TikTok views count from the second video starts playing, **including replays**

3. **Likes, Comments, Shares**
   - Comments: **2 algorithm points** (vs. 5 for full watch)
   - Shares weighted heavily (viral potential)
   - Comments with replies weighted higher

4. **Skip Rate / Early Exits**
   - Scrolling away within first 3 seconds = negative signal
   - Algorithm heavily weights **first-second retention**

**2025 Benchmarks:**

- **Average engagement rate by view:** 4%
- **Good engagement rate:** 4-8%
- **Very strong engagement rate:** >10%
- **Average watch time:** 15-20 seconds optimal
- **Completion rate target:** >70% for FYP boost
- **Rewatch rate target:** >15-20%

**Sources:**
- [Brand24: 12 Key TikTok Metrics 2025](https://brand24.com/blog/tiktok-metrics/)
- [Shortimize: What Is A Good View Rate For TikTok 2025](https://www.shortimize.com/blog/what-is-a-good-view-rate-for-tiktok)
- [Planable: 12 TikTok Metrics To Measure Content Performance](https://planable.io/blog/tiktok-metrics/)

---

### JavaScript Implementation: Watch Time Tracking

**Using Page Visibility API + Video Events:**

```javascript
class VideoEngagementTracker {
  constructor(videoElement, videoId) {
    this.video = videoElement;
    this.videoId = videoId;
    this.startTime = null;
    this.totalWatchTime = 0;
    this.watchedSegments = []; // Track which parts watched
    this.replayCount = 0;
    this.completionCount = 0;
    this.pageVisible = !document.hidden;

    this.init();
  }

  init() {
    // Video event listeners
    this.video.addEventListener('play', () => this.onPlay());
    this.video.addEventListener('pause', () => this.onPause());
    this.video.addEventListener('ended', () => this.onEnded());
    this.video.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.video.addEventListener('seeked', () => this.onSeeked());

    // Page visibility
    document.addEventListener('visibilitychange', () => this.onVisibilityChange());

    // Track when user leaves (send final metrics)
    window.addEventListener('beforeunload', () => this.sendMetrics());
  }

  onPlay() {
    if (this.startTime === null) {
      // First play
      this.startTime = Date.now();
    } else {
      // Replay detected
      this.replayCount++;
    }
  }

  onPause() {
    if (this.pageVisible) {
      this.calculateWatchTime();
    }
  }

  onEnded() {
    this.completionCount++;
    this.calculateWatchTime();

    // Send metrics on completion
    this.sendMetrics({
      event: 'video_completed',
      completionCount: this.completionCount
    });
  }

  onTimeUpdate() {
    // Track continuous watched segments
    const currentTime = Math.floor(this.video.currentTime);
    const duration = Math.floor(this.video.duration);

    if (!this.watchedSegments[currentTime]) {
      this.watchedSegments[currentTime] = true;
    }

    // Calculate completion percentage
    const watchedSeconds = this.watchedSegments.filter(Boolean).length;
    const completionPercentage = (watchedSeconds / duration) * 100;

    // Trigger events at milestones
    if (completionPercentage >= 25 && !this.milestone25) {
      this.milestone25 = true;
      this.sendMetrics({ event: 'video_25_percent' });
    }
    if (completionPercentage >= 50 && !this.milestone50) {
      this.milestone50 = true;
      this.sendMetrics({ event: 'video_50_percent' });
    }
    if (completionPercentage >= 75 && !this.milestone75) {
      this.milestone75 = true;
      this.sendMetrics({ event: 'video_75_percent' });
    }
  }

  onSeeked() {
    // User skipped forward/backward
    this.sendMetrics({
      event: 'video_seeked',
      fromTime: this.video.currentTime,
      toTime: this.video.currentTime
    });
  }

  onVisibilityChange() {
    this.pageVisible = !document.hidden;

    if (document.hidden) {
      // Tab hidden - pause video and calculate watch time
      if (!this.video.paused) {
        this.video.pause();
      }
      this.calculateWatchTime();
    }
  }

  calculateWatchTime() {
    if (this.startTime) {
      const sessionTime = Date.now() - this.startTime;
      this.totalWatchTime += sessionTime;
      this.startTime = null;
    }
  }

  sendMetrics(additionalData = {}) {
    const watchedSeconds = this.watchedSegments.filter(Boolean).length;
    const duration = Math.floor(this.video.duration);
    const completionPercentage = (watchedSeconds / duration) * 100;

    const metrics = {
      videoId: this.videoId,
      totalWatchTime: this.totalWatchTime / 1000, // Convert to seconds
      watchedSeconds: watchedSeconds,
      completionPercentage: completionPercentage,
      replayCount: this.replayCount,
      completionCount: this.completionCount,
      videoDuration: duration,
      timestamp: Date.now(),
      ...additionalData
    };

    // Send to analytics endpoint
    fetch('/api/engagement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    }).catch(err => console.error('Failed to send metrics:', err));

    // Also log locally
    console.log('Video Engagement Metrics:', metrics);
  }

  // Calculate engagement score (0-100)
  getEngagementScore() {
    const watchedSeconds = this.watchedSegments.filter(Boolean).length;
    const duration = Math.floor(this.video.duration);
    const completionPercentage = (watchedSeconds / duration) * 100;

    // Weighted scoring
    let score = 0;
    score += completionPercentage * 0.5; // 50% weight on completion
    score += Math.min(this.replayCount * 15, 30); // Up to 30 points for replays
    score += Math.min(this.completionCount * 20, 20); // Up to 20 points for full completions

    return Math.min(Math.round(score), 100);
  }
}

// Usage
document.querySelectorAll('video').forEach((video, index) => {
  const tracker = new VideoEngagementTracker(video, `video-${index}`);
});
```

**What This Tracks:**

- ✅ Total watch time (accounting for page visibility)
- ✅ Completion percentage (which segments watched, not just currentTime)
- ✅ Replay count (strong engagement signal)
- ✅ Completion count (watched to end)
- ✅ Milestone events (25%, 50%, 75%, 100%)
- ✅ Seek behavior (skipping content)
- ✅ Tab visibility (pause when hidden)

**Sources:**
- [Stack Overflow: Track how long a user has watched a video](https://stackoverflow.com/questions/12753185/track-how-long-a-user-has-watched-a-video)
- [MDN: Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [DEV Community: Tracking Video Watch Progress with JavaScript](https://dev.to/coaste/tracking-video-watch-progress-with-javascript-2j5j)

---

## 4. Content Recommendation Algorithm

### TikTok's Algorithm Architecture (2025)

**Hybrid Approach:** Collaborative Filtering + Content-Based Filtering + Deep Learning

**Three Main Signal Categories:**

1. **User Interactions (Highest Priority)**
   - What you watch, like, share, comment on, or skip
   - Watch time and completion rates
   - Rewatches
   - Interaction speed (how fast you engage)

2. **Video Information**
   - Captions (analyzed by AI for keywords)
   - Hashtags
   - Sounds/music
   - Effects
   - Text overlays (OCR analyzed)
   - Video views
   - Video quality (AI quality detection)

3. **User/Device Information (Lowest Priority)**
   - Language preference
   - Country/region
   - Device type and settings
   - Categories of interest (from onboarding)

**Algorithm Flow:**

```
New Video Upload
    ↓
Initial Moderation Check
    ↓
Distribute to Small Test Group (100-1000 users)
    ↓
Measure Initial Response:
  - Watch time
  - Completion rate
  - Engagement (likes, comments, shares)
  - Rewatches
    ↓
IF positive signals (>70% completion, high engagement in first hour):
    ↓
    Expand to Wider Audience (10,000-100,000 users)
        ↓
        Continue measuring...
        ↓
        IF still positive:
            ↓
            Push to For You Page (Millions of users)
ELSE:
    ↓
    Limited distribution
```

**Sources:**
- [Hootsuite: How TikTok Algorithm Works 2025](https://blog.hootsuite.com/tiktok-algorithm/)
- [Sprout Social: How the TikTok Algorithm Works 2025](https://sproutsocial.com/insights/tiktok-algorithm/)
- [UseVisuals: TikTok Algorithm 2025 Explained](https://usevisuals.com/blog/tiktok-algorithm-explained)

---

### Collaborative Filtering Implementation

**Concept:** If User A and User B have similar viewing patterns, recommend videos liked by User A to User B

**User-User Collaborative Filtering:**

```javascript
// Simplified example structure
class CollaborativeFilter {
  constructor() {
    this.userInteractions = new Map(); // userId -> Set of videoIds
    this.videoInteractions = new Map(); // videoId -> Set of userIds
  }

  // Record interaction
  recordInteraction(userId, videoId, interactionType, score) {
    // interactionType: 'view', 'like', 'share', 'complete', 'replay'
    const weights = {
      view: 1,
      like: 2,
      share: 3,
      complete: 5,
      replay: 4
    };

    if (!this.userInteractions.has(userId)) {
      this.userInteractions.set(userId, new Map());
    }

    const userVideos = this.userInteractions.get(userId);
    const currentScore = userVideos.get(videoId) || 0;
    userVideos.set(videoId, currentScore + weights[interactionType]);

    // Also track reverse mapping
    if (!this.videoInteractions.has(videoId)) {
      this.videoInteractions.set(videoId, new Map());
    }
    this.videoInteractions.get(videoId).set(userId, currentScore + weights[interactionType]);
  }

  // Find similar users (cosine similarity)
  findSimilarUsers(userId, topN = 10) {
    const targetUserVideos = this.userInteractions.get(userId);
    if (!targetUserVideos) return [];

    const similarities = [];

    for (const [otherUserId, otherUserVideos] of this.userInteractions.entries()) {
      if (otherUserId === userId) continue;

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(targetUserVideos, otherUserVideos);
      similarities.push({ userId: otherUserId, similarity });
    }

    // Sort by similarity and return top N
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN);
  }

  cosineSimilarity(userA, userB) {
    // Get common videos
    const commonVideos = [...userA.keys()].filter(videoId => userB.has(videoId));

    if (commonVideos.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    commonVideos.forEach(videoId => {
      const scoreA = userA.get(videoId);
      const scoreB = userB.get(videoId);
      dotProduct += scoreA * scoreB;
      normA += scoreA * scoreA;
      normB += scoreB * scoreB;
    });

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Recommend videos based on similar users
  recommendVideos(userId, limit = 20) {
    const similarUsers = this.findSimilarUsers(userId, 50);
    const targetUserVideos = this.userInteractions.get(userId) || new Map();
    const recommendations = new Map(); // videoId -> score

    similarUsers.forEach(({ userId: similarUserId, similarity }) => {
      const similarUserVideos = this.userInteractions.get(similarUserId);

      similarUserVideos.forEach((score, videoId) => {
        // Skip videos user already interacted with
        if (targetUserVideos.has(videoId)) return;

        // Weight by similarity
        const weightedScore = score * similarity;
        const currentScore = recommendations.get(videoId) || 0;
        recommendations.set(videoId, currentScore + weightedScore);
      });
    });

    // Sort by score and return top recommendations
    return [...recommendations.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([videoId, score]) => ({ videoId, score }));
  }
}

// Usage
const filter = new CollaborativeFilter();

// Record user interactions
filter.recordInteraction('user123', 'video456', 'complete', 5);
filter.recordInteraction('user123', 'video789', 'replay', 4);

// Get recommendations
const recommendations = filter.recommendVideos('user123', 20);
```

**TikTok's Actual Implementation:**
- Uses **Matrix Factorization** or **Deep Collaborative Filtering** (neural networks)
- Processes **>1 billion video views per day**
- Learns user and item representations (embeddings)
- Combines with content-based signals for hybrid approach

**Sources:**
- [Medium: Building a TikTok-like recommender](https://medium.com/data-science-collective/1-building-a-tiktok-like-recommender-a64563262c1a)
- [DEV Community: How does TikTok use machine learning](https://dev.to/mage_ai/how-does-tiktok-use-machine-learning-5b7i)
- [GitHub Gist: TikTok-like recommender Algorithm](https://gist.github.com/ruvnet/6217ea3bd75cc0c27522965965e7383b)

---

### Cold Start Problem & Solutions

**Problem:** New users or new videos with limited interaction data cannot be effectively recommended

**TikTok's Solutions (2025):**

1. **Interest-Based Onboarding**
   - When creating account, users select categories of interest
   - Initial selections help algorithm understand preferences
   - Reduces cold start problem significantly

2. **Democratic Distribution**
   - Unlike chronological/follower-based feeds, TikTok prioritizes **content relevance over creator popularity**
   - Even new users with **zero followers** can have content pushed to large audiences
   - Every video gets initial test distribution (100-1000 users)

3. **Content-Based Fallback**
   - For new videos, algorithm analyzes:
     - Video captions and text overlays (NLP/OCR)
     - Audio/music (matching to popular sounds)
     - Visual content (computer vision)
     - Hashtags
   - Matches to users interested in similar content

4. **Micro-Interactions & Implicit Signals**
   - Algorithm monitors subtle behaviors:
     - How fast you scroll past certain content
     - Which thumbnails you pause on
     - Hover time over videos
     - Screen touches/taps
   - These **micro-interactions** significantly shape FYP even without explicit engagement

5. **Exploration vs. Exploitation Balance**
   - Algorithm balances showing known-good content with exploring new content
   - Periodically introduces diverse content to discover new preferences
   - Prevents filter bubbles while maximizing engagement

**Sources:**
- [Social Champ: TikTok Algorithm 2025](https://www.socialchamp.com/blog/tiktok-algorithm/)
- [Buffer: TikTok Algorithm Guide 2026](https://buffer.com/resources/tiktok-algorithm/)

---

### 2025 Algorithm Updates

**Key Changes from Previous Years:**

1. **Longer Video Preference**
   - Platform now prioritizes videos **>30 seconds**, especially with high completion rates
   - Longer videos keep users engaged for more time = higher platform metrics

2. **AI Quality Detection**
   - TikTok AI scans every video for quality, tone, and originality
   - Content that feels **repetitive, misleading, or spammy** not promoted even if engagement is high
   - Detects editing patterns, unique audio, user-made visuals

3. **Originality Rewards**
   - Algorithm built to detect and reward fresh, original content
   - Duplicate/reposted content penalized
   - Encourages creator innovation

4. **Community Building Focus**
   - Algorithm built around **communities**, not random viral hits
   - **"Micro-virality"** - content goes viral within specific interest communities first
   - Sustained audience relationships > quick viral moments

**Sources:**
- [QuickFrame: How TikTok Algorithm Works 2025](https://quickframe.com/blog/how-does-the-tiktok-algorithm-work/)
- [Napolify: TikTok Algorithm Signals June 2025](https://napolify.com/blogs/news/tiktok-algorithm-signals-today)

---

## 5. UI/UX Patterns

### Video Autoplay Requirements (2025)

**Browser Autoplay Policies:**

All modern browsers (Chrome, Safari, Firefox, Edge) only allow autoplay under these conditions:

1. **Video is muted** (`muted` attribute)
2. **User has interacted** with the domain (click, tap)
3. **On desktop:** User's Media Engagement Index threshold crossed (previously played video with sound)

**Mobile-Specific Requirements:**

iOS and Android restrict autoplay further due to:
- Mobile data usage concerns
- Battery drain
- User experience

**Required HTML Attributes for Mobile Autoplay:**

```html
<video
  autoplay
  muted
  loop
  playsinline
  preload="none"
  poster="/thumbnails/thumbnail.jpg"
>
  <source src="/videos/video.mp4" type="video/mp4">
</video>
```

**Attribute Breakdown:**

- **`autoplay`**: Enable automatic playback
- **`muted`**: Required for autoplay (unmute after user interaction)
- **`loop`**: Auto-replay video (increases replay count engagement metric)
- **`playsinline`**: **Critical for iOS** - allows video to play inline instead of forcing fullscreen
- **`preload="none"`**: Don't preload until needed (use with Intersection Observer)
- **`poster`**: Thumbnail image shown before video loads

**Important Caveats:**

- **iOS Low Power Mode:** Videos won't autoplay even with correct attributes
- **Safari Unmute Policy:** Video automatically pauses if unmuted without user interaction
- **Data Saver Mode:** Browsers may prevent autoplay to save data

**Unmute After User Interaction:**

```javascript
// After user taps/clicks video
video.addEventListener('click', () => {
  if (video.muted) {
    video.muted = false;
    video.play(); // Restart with sound
    showUnmuteIcon(); // Visual feedback
  }
});
```

**Sources:**
- [Chrome Blog: Autoplay policy in Chrome](https://developer.chrome.com/blog/autoplay)
- [MDN: Autoplay guide for media and Web Audio APIs](https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide)
- [Medium: Autoplay muted HTML5 video Safari iOS 10+ in React](https://medium.com/@BoltAssaults/autoplay-muted-html5-video-safari-ios-10-in-react-673ae50ba1f5)

---

### Progress Indicators & UI Feedback

**Types of Progress Indicators:**

1. **Spinners:** 1-3 second waits
2. **Skeleton Loaders:** Initial page load, showing content structure
3. **Progress Circles:** Determinate tasks (e.g., video buffering percentage)
4. **Progress Bars:** 3-10 second waits
5. **Percentage Indicators:** 10+ second waits

**Video Progress Circle (TikTok Style):**

```html
<div class="progress-circle-container">
  <svg class="progress-circle" width="60" height="60">
    <circle
      class="progress-circle-bg"
      cx="30"
      cy="30"
      r="25"
      stroke="#ffffff33"
      stroke-width="3"
      fill="none"
    />
    <circle
      class="progress-circle-fill"
      cx="30"
      cy="30"
      r="25"
      stroke="#ffffff"
      stroke-width="3"
      fill="none"
      stroke-dasharray="157"
      stroke-dashoffset="157"
      transform="rotate(-90 30 30)"
    />
  </svg>
  <div class="progress-icon">▶</div>
</div>
```

```css
.progress-circle-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
}

.progress-circle-fill {
  transition: stroke-dashoffset 0.3s ease;
}

/* Animate progress */
.progress-circle-fill[data-progress="50"] {
  stroke-dashoffset: calc(157 - (157 * 0.5)); /* 50% progress */
}
```

```javascript
// Update progress circle
function updateProgress(video, circleElement) {
  const percentage = (video.currentTime / video.duration) * 100;
  const circumference = 157; // 2 * π * r (where r=25)
  const offset = circumference - (percentage / 100) * circumference;

  circleElement.style.strokeDashoffset = offset;
}

video.addEventListener('timeupdate', () => {
  const circle = document.querySelector('.progress-circle-fill');
  updateProgress(video, circle);
});
```

**Research Findings:**
- Users who view animated progress indicators wait **3x longer** before clicking away vs. no indicator
- Progress circles effective for compact spaces (mobile feeds)
- Skeleton loaders reduce perceived wait time by showing structure

**Sources:**
- [Usersnap: Progress Bar Indicator UX/UI Design](https://usersnap.com/blog/progress-indicators/)
- [Smashing Magazine: Best Practices For Animated Progress Indicators](https://www.smashingmagazine.com/2016/12/best-practices-for-animated-progress-indicators/)
- [UX Collective: Loading & progress indicators](https://uxdesign.cc/loading-progress-indicators-ui-components-series-f4b1fc35339a)

---

### Muted Start with Tap-to-Unmute

**Standard Pattern (Instagram Reels, TikTok):**

1. Video starts muted with autoplay
2. Show mute icon (🔇) in corner
3. User taps anywhere on video to unmute
4. Show unmute icon (🔊) briefly
5. Remember preference for session (next videos start with sound)

**Implementation:**

```javascript
class VideoPlayer {
  constructor(videoElement) {
    this.video = videoElement;
    this.isMuted = true;
    this.sessionUnmuted = false; // Track if user unmuted this session

    this.init();
  }

  init() {
    // Start muted
    this.video.muted = true;

    // Tap to unmute
    this.video.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMute();
    });

    // Auto-unmute next videos if user unmuted once
    if (this.sessionUnmuted) {
      // Wait for video to start playing
      this.video.addEventListener('playing', () => {
        setTimeout(() => {
          this.video.muted = false;
          this.isMuted = false;
        }, 100);
      }, { once: true });
    }

    // Show/hide mute icon based on state
    this.updateMuteIcon();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.video.muted = this.isMuted;

    if (!this.isMuted) {
      // User unmuted - remember for session
      this.sessionUnmuted = true;
      sessionStorage.setItem('videoUnmuted', 'true');
    }

    this.updateMuteIcon();
    this.showFeedback();
  }

  updateMuteIcon() {
    const icon = this.video.parentElement.querySelector('.mute-icon');
    icon.textContent = this.isMuted ? '🔇' : '🔊';
  }

  showFeedback() {
    // Show brief animation when toggling
    const feedback = this.video.parentElement.querySelector('.mute-feedback');
    feedback.classList.add('show');
    feedback.textContent = this.isMuted ? 'Muted' : 'Unmuted';

    setTimeout(() => {
      feedback.classList.remove('show');
    }, 1000);
  }
}

// Check session preference on page load
const wasUnmuted = sessionStorage.getItem('videoUnmuted') === 'true';

document.querySelectorAll('video').forEach(video => {
  const player = new VideoPlayer(video);
  if (wasUnmuted) {
    player.sessionUnmuted = true;
  }
});
```

```html
<div class="video-container">
  <video autoplay muted loop playsinline></video>
  <div class="mute-icon">🔇</div>
  <div class="mute-feedback"></div>
</div>
```

```css
.video-container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.mute-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  cursor: pointer;
  z-index: 10;
}

.mute-feedback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 16px 32px;
  border-radius: 24px;
  font-size: 18px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.mute-feedback.show {
  opacity: 1;
}
```

**Sources:**
- [Stack Overflow: TikTok playing video without muted](https://stackoverflow.com/questions/78157610/tiktok-is-playing-video-without-muted-when-i-open-the-page-how-do-they-do-tha)
- Social media best practices: Facebook, Instagram default to mute, then remember preference

---

## 6. GitHub Reference Implementations

### Top Repositories (2025)

**1. reinaldosimoes/react-vertical-feed**
- **Description:** Performant React component for TikTok-style vertical feeds using Intersection Observer
- **Tech:** React, Intersection Observer API
- **Features:** Auto play/pause, efficient rendering
- **URL:** https://github.com/reinaldosimoes/react-vertical-feed

**2. wolz-CODElife/Build-a-Custom-TikTok-Autoplay-Hook-with-Intersection-Observer**
- **Description:** Tutorial on creating custom React Hook for TikTok autoplay
- **Tech:** React, Custom Hooks, Intersection Observer
- **Features:** Reusable hook pattern, autoplay/pause based on visibility
- **URL:** https://github.com/wolz-CODElife/Build-a-Custom-TikTok-Autoplay-Hook-with-Intersection-Observer

**3. OkiemuteGold/react-tiktok-clone**
- **Description:** Full-stack TikTok clone with theme switcher
- **Tech:** React.js, Next.js, TypeScript, Zustand (state management), Sanity (CMS)
- **Features:** OAuth, theme switching, content management
- **URL:** https://github.com/OkiemuteGold/react-tiktok-clone

**4. s-shemmee/TikTok-UI-Clone**
- **Description:** TikTok UI Clone with smooth video scrolling
- **Tech:** React.js, CSS, JSX
- **Features:** Infinite scrolling, seamless browsing experience
- **URL:** https://github.com/s-shemmee/TikTok-UI-Clone

**5. SashenJayathilaka/TIK-TOK-Clone**
- **Description:** Full Stack TikTok Clone
- **Tech:** React.js, Next.js, Tailwind CSS
- **Features:** Video uploading, Google Authentication, TikTok profile pages
- **URL:** https://github.com/SashenJayathilaka/TIK-TOK-Clone

**6. HenryBalassiano/Tik-Tok-Clone**
- **Description:** TikTok clone using Reddit API
- **Tech:** React, Intersection Observer API
- **Features:** Autoplay based on viewport visibility, Reddit content integration
- **URL:** https://github.com/HenryBalassiano/Tik-Tok-Clone

**Additional Resources:**

- **LogRocket Tutorial:** [Build a custom TikTok autoplay React Hook](https://blog.logrocket.com/build-custom-tiktok-autoplay-react-hook-intersection-observer/)
- **CoderPad Tutorial:** [How to Implement Infinite Scroll in React.js by Building a TikTok Clone](https://coderpad.io/blog/development/how-to-implement-infinite-scroll-in-react-js/)
- **DEV Community:** [Create Tik-Tok/Youtube Shorts like snap infinite scroll](https://dev.to/biomathcode/create-tik-tokyoutube-shorts-like-snap-infinite-scroll-react-1mca)

**CodePen Examples:**

- **CSS Scroll Snap - Tik Tok Example:** https://codepen.io/ellie_html/pen/dyYjZyB
- **"TikTok-likish" Scroll behavior:** https://codepen.io/DanielPelz/pen/GRPgaXr

---

## 7. Implementation Checklist

### Phase 1: Core Scroll Mechanics

- [ ] Implement CSS scroll-snap on container
  - [ ] `scroll-snap-type: y mandatory`
  - [ ] `scroll-snap-align: start` on video cards
  - [ ] `scroll-snap-stop: always` to prevent skipping
  - [ ] Handle 100vh viewport height issues on iOS

- [ ] Add JavaScript scroll snap events
  - [ ] `scrollsnapchanging` for preloading
  - [ ] `scrollsnapchange` for play/pause control

- [ ] Test across devices
  - [ ] Chrome desktop
  - [ ] Safari desktop
  - [ ] Chrome mobile (Android)
  - [ ] Safari mobile (iOS)
  - [ ] Test with different viewport sizes

### Phase 2: Video Preloading

- [ ] Set up Intersection Observer
  - [ ] Configure rootMargin for preloading buffer (200px+)
  - [ ] Set multiple thresholds [0, 0.25, 0.5, 0.75, 1.0]
  - [ ] Implement lazy loading with `data-src` pattern

- [ ] Preload next video (n+1)
  - [ ] Load full video when approaching viewport
  - [ ] Use `preload="auto"` on next video

- [ ] Optional: Preload video after next (n+2)
  - [ ] Load metadata only (`preload="metadata"`)

- [ ] Add poster images for all videos
  - [ ] Create thumbnail images
  - [ ] Optimize for fast loading (<50KB)

### Phase 3: Autoplay & Controls

- [ ] Configure video attributes
  - [ ] `autoplay` attribute
  - [ ] `muted` attribute (required for mobile)
  - [ ] `playsinline` attribute (required for iOS)
  - [ ] `loop` attribute (increases engagement)

- [ ] Implement play/pause based on visibility
  - [ ] Play when >75% visible
  - [ ] Pause when leaving viewport
  - [ ] Pause when tab hidden (Page Visibility API)

- [ ] Add tap-to-unmute functionality
  - [ ] Unmute on video tap/click
  - [ ] Show visual feedback (icon + toast)
  - [ ] Remember preference for session

### Phase 4: Engagement Tracking

- [ ] Set up video event listeners
  - [ ] `play`, `pause`, `ended` events
  - [ ] `timeupdate` for progress tracking
  - [ ] `seeked` for skip detection

- [ ] Track key metrics
  - [ ] Total watch time (accounting for page visibility)
  - [ ] Completion percentage (segments watched)
  - [ ] Replay count
  - [ ] Completion count (watched to end)
  - [ ] Milestone events (25%, 50%, 75%, 100%)

- [ ] Create analytics endpoint
  - [ ] POST /api/engagement
  - [ ] Store metrics in database
  - [ ] Calculate engagement scores

### Phase 5: Content Recommendation

- [ ] Build collaborative filtering system
  - [ ] Track user interactions with weights
  - [ ] Calculate user similarity (cosine similarity)
  - [ ] Generate recommendations from similar users

- [ ] Add content-based filtering
  - [ ] Analyze video captions/tags
  - [ ] Category-based matching
  - [ ] User interest profiles

- [ ] Handle cold start problem
  - [ ] Interest selection on onboarding
  - [ ] Give every video initial test distribution
  - [ ] Use content-based fallback for new users/videos

- [ ] Implement ranking algorithm
  - [ ] Weight signals (watch time > likes > views)
  - [ ] Combine collaborative + content-based scores
  - [ ] Add diversity/exploration factor

### Phase 6: UI/UX Polish

- [ ] Add progress indicators
  - [ ] Circle progress for video playback
  - [ ] Skeleton loaders for initial load
  - [ ] Buffering indicators

- [ ] Implement mute/unmute UI
  - [ ] Mute icon in corner
  - [ ] Animated feedback on toggle
  - [ ] Session preference memory

- [ ] Add interaction overlays
  - [ ] Like/share/comment buttons
  - [ ] Creator profile link
  - [ ] Video description/caption

- [ ] Optimize for mobile
  - [ ] Touch gestures (swipe up/down)
  - [ ] Prevent horizontal scroll
  - [ ] Handle safe area insets (iOS notch)

### Phase 7: Performance Optimization

- [ ] Optimize video delivery
  - [ ] Use CDN for video hosting
  - [ ] Implement adaptive bitrate streaming (HLS/DASH)
  - [ ] Compress videos (H.264/H.265)

- [ ] Minimize initial bundle size
  - [ ] Code splitting
  - [ ] Lazy load non-critical components
  - [ ] Tree shaking

- [ ] Performance monitoring
  - [ ] Lighthouse audit (target >95)
  - [ ] Real User Monitoring (RUM)
  - [ ] Track Time to Interactive (TTI)

- [ ] Performance targets
  - [ ] Initial load: <2s
  - [ ] Interaction response: <100ms
  - [ ] Video start: <500ms

### Phase 8: Testing & Quality Assurance

- [ ] Unit tests
  - [ ] Engagement tracker
  - [ ] Recommendation algorithm
  - [ ] Utility functions

- [ ] Integration tests
  - [ ] Video loading pipeline
  - [ ] Analytics flow
  - [ ] API endpoints

- [ ] E2E tests (Playwright)
  - [ ] Scroll through feed
  - [ ] Video autoplay/pause
  - [ ] Engagement interactions (like, share)
  - [ ] Cross-browser compatibility

- [ ] Performance tests
  - [ ] Load testing (1000+ concurrent users)
  - [ ] Memory leak detection
  - [ ] Network throttling simulation

---

## Key Takeaways

### Critical Success Factors

1. **CSS Scroll Snap is performant** - Handled by compositor thread, smooth on mobile
2. **Intersection Observer for preloading** - Load n+1 video before it's needed
3. **Watch time > all other metrics** - Focus on completion rate and rewatches
4. **Muted autoplay is mandatory** - Required by browsers, tap to unmute
5. **Test extensively on iOS Safari** - Has unique bugs with 100vh and scroll-snap
6. **Collaborative filtering works** - Even simple implementations boost engagement
7. **Cold start is solvable** - Interest onboarding + democratic distribution

### Performance Targets

- **Video start:** <500ms (you have barely 500ms to capture attention)
- **Preload buffer:** 200-400px before viewport (balance bandwidth vs. smoothness)
- **Completion rate goal:** >70% for FYP boost
- **Engagement rate goal:** >4% average, >10% excellent
- **Lighthouse score:** >95

### Common Pitfalls to Avoid

- ❌ Don't use `body` selector for scroll-snap (use `html` or container)
- ❌ Don't forget `playsinline` on iOS (videos will force fullscreen)
- ❌ Don't preload all videos (bandwidth waste, use Intersection Observer)
- ❌ Don't innovate on core UX (copy TikTok's proven patterns exactly)
- ❌ Don't track only likes/views (watch time is 74% of algorithm)
- ❌ Don't forget Page Visibility API (pause when tab hidden)

### 2025 Trends

- **Longer videos preferred:** >30 seconds with high completion rates
- **AI quality detection:** Spammy/repetitive content not promoted
- **Originality rewarded:** Duplicate content penalized
- **Community-first:** Micro-virality in interest communities > random viral hits
- **Micro-interactions matter:** Scroll speed, hover time, pause on thumbnails

---

## Appendix: All Sources

### CSS Scroll Snap
- https://stackoverflow.com/questions/75340067/tiktok-like-scrolling-with-css
- https://css-tricks.com/practical-css-scroll-snapping/
- https://web.dev/css-scroll-snap/
- https://blog.logrocket.com/javascript-scroll-snap-events-scroll-triggered-animations/
- https://codepen.io/ellie_html/pen/dyYjZyB
- https://codepen.io/DanielPelz/pen/GRPgaXr

### iOS Safari Issues
- https://stackoverflow.com/questions/37112218/css3-100vh-not-constant-in-mobile-browser
- https://dev.to/maciejtrzcinski/100vh-problem-with-ios-safari-3ge9
- https://stackoverflow.com/questions/64317214/safari-webkit-css-scroll-snap-bug
- https://lukechannings.com/blog/2021-06-09-does-safari-15-fix-the-vh-bug/

### Video Preloading
- https://www.fastpix.io/blog/strategies-to-optimize-performance-of-short-video-apps
- https://hw.glich.co/p/how-tiktok-optimizes-video-streaming
- https://www.fastpix.io/blog/guide-to-lazy-loading-html-videos-for-your-website
- https://imagekit.io/blog/lazy-loading-html-videos/

### Intersection Observer
- https://blog.logrocket.com/build-custom-tiktok-autoplay-react-hook-intersection-observer/
- https://medium.com/walmartglobaltech/lazy-loading-using-intersection-observer-6764ab32e776
- https://web.dev/articles/lazy-loading-video

### Engagement Tracking
- https://brand24.com/blog/tiktok-metrics/
- https://www.shortimize.com/blog/what-is-a-good-view-rate-for-tiktok
- https://planable.io/blog/tiktok-metrics/
- https://stackoverflow.com/questions/12753185/track-how-long-a-user-has-watched-a-video
- https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API

### TikTok Algorithm
- https://blog.hootsuite.com/tiktok-algorithm/
- https://sproutsocial.com/insights/tiktok-algorithm/
- https://usevisuals.com/blog/tiktok-algorithm-explained
- https://medium.com/data-science-collective/1-building-a-tiktok-like-recommender-a64563262c1a
- https://dev.to/mage_ai/how-does-tiktok-use-machine-learning-5b7i
- https://gist.github.com/ruvnet/6217ea3bd75cc0c27522965965e7383b

### Autoplay Policies
- https://developer.chrome.com/blog/autoplay
- https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
- https://medium.com/@BoltAssaults/autoplay-muted-html5-video-safari-ios-10-in-react-673ae50ba1f5

### Progress Indicators
- https://usersnap.com/blog/progress-indicators/
- https://www.smashingmagazine.com/2016/12/best-practices-for-animated-progress-indicators/
- https://uxdesign.cc/loading-progress-indicators-ui-components-series-f4b1fc35339a

### GitHub Repositories
- https://github.com/reinaldosimoes/react-vertical-feed
- https://github.com/wolz-CODElife/Build-a-Custom-TikTok-Autoplay-Hook-with-Intersection-Observer
- https://github.com/OkiemuteGold/react-tiktok-clone
- https://github.com/s-shemmee/TikTok-UI-Clone
- https://github.com/SashenJayathilaka/TIK-TOK-Clone
- https://github.com/HenryBalassiano/Tik-Tok-Clone

### Tutorials
- https://coderpad.io/blog/development/how-to-implement-infinite-scroll-in-react-js/
- https://dev.to/biomathcode/create-tik-tokyoutube-shorts-like-snap-infinite-scroll-react-1mca
- https://dev.to/coaste/tracking-video-watch-progress-with-javascript-2j5j

---

**End of Report**

*Last Updated: November 12, 2025*
