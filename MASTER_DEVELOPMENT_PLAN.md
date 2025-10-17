# 🎯 WORKSPACE3 MASTER DEVELOPMENT PLAN
## TikTok-Style Entertainment Feed for Spanish Learning

### 🔥 VISION (from vision.md)
Endless dopamine scroll feed - TikTok quality for language learning. Simple, addictive, effective.

### 📋 CURRENT USER COMMANDS (HIGHEST PRIORITY)
1. **Fix reels section to be like TikTok** - full-screen vertical scroll + clickable word translations
2. **ENTERTAINMENT FEED** - Simple TikTok-style feed with Spanish learning videos, articles, music, stories

### 🎯 DYNAMIC COMPETITOR ROTATION
**DO NOT focus on one app!** Steal from ALL these top apps:

**Cycle 1: TikTok** (https://tiktok.com/@spanish.learning)
- Firecrawl scrape: Vertical scroll mechanics, swipe gestures
- Steal: Infinite scroll algorithm, video transitions
- Screenshot: Their full-screen video UI vs ours

**Cycle 2: Instagram Reels** (https://instagram.com/reels)
- Firecrawl scrape: Clickable word overlays, interactive elements
- Steal: Word translation popup mechanics
- Screenshot: Their interaction patterns vs ours

**Cycle 3: Duolingo** (https://duolingo.com/learn)
- Firecrawl scrape: Gamification without sparkles, progress tracking
- Steal: Word database structure, spaced repetition
- Screenshot: Their learning flow vs ours

**Cycle 4: YouTube Shorts** (https://youtube.com/shorts)
- Firecrawl scrape: Autoplay mechanics, gesture controls
- Steal: Smooth video loading, preloading next video
- Screenshot: Their UX patterns vs ours

**Cycle 5: Spotify** (https://spotify.com)
- Firecrawl scrape: Music integration, playlist UI
- Steal: Audio player controls, background music
- Screenshot: Their music UI vs ours

### 🛠️ COMPREHENSIVE FEATURE ROADMAP

#### PHASE 1: CORE FEED MECHANICS (Week 1-2)
**Top App References**: TikTok, Instagram Reels, YouTube Shorts

**Features to Build**:
1. ✅ Full-screen vertical scroll (TikTok quality)
2. ✅ Swipe gestures (up/down navigation)
3. ✅ Infinite scroll with smooth loading
4. ✅ Video preloading (next 3 videos)
5. ✅ Autoplay on scroll

**Firecrawl Targets**:
- `https://tiktok.com/@spanish.learning` → Scrape scroll mechanics code
- `https://instagram.com/reels` → Scrape gesture handling
- `https://youtube.com/shorts` → Scrape autoplay logic

**Playwright Tests (HEADLESS)**:
```javascript
test('Full-screen vertical scroll', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await page.screenshot({ path: 'screenshots/tiktok-scroll-before.png' });

  // Swipe down gesture
  await page.mouse.move(200, 300);
  await page.mouse.down();
  await page.mouse.move(200, 100);
  await page.mouse.up();

  await page.screenshot({ path: 'screenshots/tiktok-scroll-after.png' });
  // Compare with TikTok screenshot
});
```

**GitHub MCP Targets**:
- Search: `"infinite scroll" language:typescript stars:>1000`
- Search: `"vertical swipe" react`
- Steal code from top repos

#### PHASE 2: CLICKABLE WORD TRANSLATIONS (Week 3)
**Top App References**: Duolingo, Language Reactor, Toucan

**Features to Build**:
1. ✅ Click any Spanish word → instant translation popup
2. ✅ Save word to database (unified system)
3. ✅ Word difficulty tracking
4. ✅ Already-known words highlighted differently

**Firecrawl Targets**:
- `https://duolingo.com/learn` → Scrape word interaction UI
- `https://languagereactor.com` → Scrape translation popup code
- `https://jointoucan.com` → Scrape word highlighting

**Playwright Tests (HEADLESS)**:
```javascript
test('Clickable word translations', async ({ page }) => {
  await page.goto('http://localhost:3001');

  // Click Spanish word
  await page.click('text="hablar"');
  await page.screenshot({ path: 'screenshots/word-translation.png' });

  // Verify translation popup appears
  await expect(page.locator('.translation-popup')).toBeVisible();

  // Compare with Duolingo screenshot
});
```

#### PHASE 3: MUSIC INTEGRATION (Week 4)
**Top App References**: Spotify, Apple Music, YouTube Music

**Features to Build**:
1. ✅ Background Spanish music while scrolling
2. ✅ Pause music during video audio
3. ✅ Music player controls (bottom bar)
4. ✅ Playlist of Spanish learning songs

**Firecrawl Targets**:
- `https://spotify.com` → Scrape audio player UI
- `https://music.apple.com` → Scrape controls design
- `https://music.youtube.com` → Scrape playlist mechanics

#### PHASE 4: USER SYSTEM & LEVELS (Week 5-6)
**Top App References**: Duolingo, Babbel, Memrise

**Features to Build**:
1. ✅ User authentication (signup/login)
2. ✅ Unified language database (tracks all progress)
3. ✅ Multiple proficiency levels (A1, A2, B1, B2, C1, C2)
4. ✅ Content adapts to user's level
5. ✅ Cross-app progress sync

**Firecrawl Targets**:
- `https://duolingo.com/register` → Scrape auth flow
- `https://babbel.com/dashboard` → Scrape level system
- `https://memrise.com/user` → Scrape progress tracking

#### PHASE 5: 2000 WORD COVERAGE (Ongoing)
**Teaching the 2000 most common Spanish words through sentences**

**Strategy**:
1. ✅ Load 2000 word frequency list
2. ✅ Each video teaches 3-5 new words in context
3. ✅ Spaced repetition (review old words in new sentences)
4. ✅ Track which words user has seen/learned
5. ✅ Prioritize unknown words in new content

**Word Database Structure**:
```javascript
{
  word: "hablar",
  translation: "to speak",
  difficulty: "A1",
  timesSeenByUser: 5,
  lastSeen: "2025-10-04",
  masteryLevel: 0.7
}
```

### 🔄 SELF-UPDATING PLAN SYSTEM

**How This Plan Updates Itself**:
1. After each feature completion → Review vision.md
2. If vision.md changed → Update relevant phase
3. After user feedback → Add/modify features
4. After competitor research → Integrate new patterns
5. Every Friday → Comprehensive plan review

**Plan Update Triggers**:
- ✅ New manual command from user → Add to top priority
- ✅ Feature completed → Check next phase
- ✅ New competitor discovered → Add to rotation
- ✅ User feedback in human_feedback.md → Adjust roadmap
- ✅ Vision.md updated → Realign all phases

### 📊 TESTING REQUIREMENTS (EVERY COMMIT)

**Playwright Headless Tests**:
```bash
npx playwright test --headless --reporter=list
```

**Required Screenshots**:
1. `screenshots/workspace3-vs-tiktok.png` - Side-by-side comparison
2. `screenshots/scroll-mechanics.png` - Scroll behavior
3. `screenshots/word-translation.png` - Translation UI
4. `screenshots/music-player.png` - Audio controls
5. `screenshots/user-dashboard.png` - User profile

**Performance Tests**:
```bash
npx lighthouse http://localhost:3001 --output=json
```
- Target: 90+ performance score
- Must match TikTok smoothness

### 🎯 SUCCESS METRICS

**User Experience**:
- ✅ Browser opens every commit (show progress)
- ✅ Smooth 60fps scrolling (TikTok quality)
- ✅ <100ms word translation response
- ✅ Zero layout shift during scroll

**Learning Effectiveness**:
- ✅ All 2000 common words covered
- ✅ Spaced repetition algorithm working
- ✅ User progress tracked across sessions
- ✅ Content adapts to user level

**Technical Quality**:
- ✅ Lighthouse score 90+
- ✅ All Playwright tests passing
- ✅ Screenshots prove visual quality
- ✅ Code stolen from top apps (not reinvented)

### 🔥 ANTI-STAGNATION RULES

**If session is stagnant (no commit in 20 min)**:
1. Check: Is current feature too complex? Break it down.
2. Research: Firecrawl scrape competitor for that exact feature
3. Steal: Find GitHub repo implementing it
4. Test: Run Playwright to verify what's broken
5. Screenshot: Show current state vs target state
6. Iterate: Small commits, show progress frequently

**Continuous Work Loop**:
- Research competitor → Plan → Build → Test → Screenshot → Commit → Browser opens → Get feedback → REPEAT

### 📝 CURRENT STATUS (Auto-Updated)
- Last manual command: "Fix reels section to be like TikTok - full-screen vertical scroll + clickable word translations"
- Current phase: PHASE 1 (Core Feed Mechanics)
- Next competitor to scrape: TikTok (vertical scroll)
- Next Playwright test: Full-screen scroll mechanics
- Next feature: Swipe gestures matching TikTok

---
*This plan is ALIVE - it updates based on vision.md, user feedback, and competitor research*
*Last updated: 2025-10-04*
