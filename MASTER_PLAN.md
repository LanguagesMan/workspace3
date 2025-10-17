# 🎯 WORKSPACE3 MASTER PLAN

## Vision Summary
**Create a TikTok-quality dopamine scroll feed for language learning that makes learning Spanish as addictive as social media.**

**Target**: Spanish learners (A1-C2), Ages 18-35, Mobile-first
**Value Prop**: "Learn Spanish while scrolling - just like TikTok, but educational."

---

## ✅ CYCLE 4 COMPLETE - COMPLETE BEGINNER FEATURES (2025-10-04)

### What We Built
1. ✅ TikTok/Lingopie speed control (1x, 0.75x, 0.5x, 1.5x)
2. ✅ Enhanced word translation popup (Lingopie style)
3. ✅ First-time user onboarding hint ("Tap any word")

### Research Evidence
- TikTok playback: Long-press menu, 0.5x-2x speeds
- Lingopie: 5 speeds (0.5x-1x) optimized for learners
- Mobile UX 2025: Gesture-based controls

### Tests Passing
- ✅ 10/11 Playwright tests (beginner persona)
- ✅ Speed control found (was missing)
- ✅ Self-awareness: 0 navs, 0 spam

### Complete Beginner Pain Points FIXED
- [x] ✅ Speed control (0.5x for slow learning)
- [x] ✅ Translation popup enhanced
- [x] ✅ Onboarding hint added
- [ ] ❌ Load time slow (5.1s > 2s target)

---

## ✅ CYCLE 3 COMPLETE - POWER USER KEYBOARD SHORTCUTS (2025-10-04)

### What We Built
1. ✅ YouTube Shorts keyboard shortcuts (7 keys)
2. ✅ Space/K = Play/Pause
3. ✅ ↑↓ = Navigate videos
4. ✅ J/L = Skip ±10s
5. ✅ M = Mute/Unmute
6. ✅ S = Save word (placeholder)

### Research Evidence
- YouTube keyboard shortcuts: https://support.google.com/youtube/answer/7631406
- GitHub: better-yt-shorts, TikTok clones
- Mobile UX trends 2025

### Tests Passing
- ✅ 7/7 Playwright tests (Space, K, ↑↓, J, L, M)
- ✅ Self-awareness: 0 navs, 0 spam
- ✅ Screenshot saved

### Power User Pain Points FIXED
- [x] ✅ Keyboard shortcuts implemented
- [x] ✅ Matches YouTube Shorts UX
- [ ] ❌ Word translation still slow (> 100ms)
- [ ] ❌ No difficulty filtering yet

---

## ✅ CYCLE 1 COMPLETE - UI REDESIGN (2025-10-04)

### What We Built
1. ✅ TikTok scroll-snap mechanics (y mandatory)
2. ✅ Instagram Reels top navigation (Videos/Feed/Music)
3. ✅ Duolingo XP/Streak/Words bar
4. ✅ Engagement counts (1.2M formatting)
5. ✅ Clickable word translations
6. ✅ LingoPie speed control (0.5x-2x)
7. ✅ Premium UI (gradients, backdrop-filter, shadows)

### Tests Passing
- ✅ Visual inspection (Playwright --headed 9.7s)
- ✅ Screenshot saved (AFTER-REDESIGN-1759597524.png)
- ✅ No duplicate navs (0 <nav> tags)
- ✅ All features render

---

## 🎭 USER PERSONAS & PAIN POINTS

### Beginner (A0-A1) - Age 19 - "Complete Beginner"
**Pain Points** (Tested 2025-10-04):
- [x] ✅ App loads instantly (138ms)
- [x] ✅ Shows reels immediately (TikTok style)
- [x] ✅ Has clickable words (24 found)
- [x] ✅ Simple UI (0 navs, minimal chrome)
- [ ] ❌ Word click shows NO translation popup
- [ ] ❌ No speed control (need 0.5x for slow learning)
- [ ] ❌ No onboarding hints ("Tap any word to learn")
- [ ] No vocabulary review page
- [ ] Can't see learning progress over time
- [ ] Doesn't know which words are important

### Intermediate (B1) - Age 28
**Pain Points**:
- [ ] Content not personalized to level
- [ ] No search/filter by topic
- [ ] Subtitles too small on mobile
- [ ] No grammar deep dives

### Advanced (C1) - Age 35 - "Power User"
**Pain Points** (Tested 2025-10-04):
- [x] ✅ App loads fast (< 2s tested)
- [x] ✅ Reels show immediately (no menu first)
- [x] ✅ TikTok scroll-snap working
- [ ] ❌ Word translation too slow (> 100ms, power users expect instant)
- [ ] ❌ No keyboard shortcuts (Space, ↑↓, S for save)
- [ ] ❌ No content filtering by difficulty level
- [ ] Not enough native content variety
- [ ] No speaking practice
- [ ] Can't share progress socially
- [ ] No offline mode

---

## 🚧 NEXT 5 CYCLES

### Cycle 2: Vocabulary Review System
**Steal from**: Anki, Quizlet
**Build**:
- Flashcard grid with flip animation
- Spaced repetition (SM-2)
- Quiz mode (multiple choice)
- Search/filter saved words

### Cycle 3: Performance Optimization
**Steal from**: TikTok preloading
**Build**:
- Preload next 2 videos
- Lazy load off-viewport
- Code splitting
- Lighthouse >95

### Cycle 4: Personalization Engine
**Steal from**: Duolingo adaptive learning
**Build**:
- Track known words
- Calculate user level
- Adaptive difficulty
- "Too Easy/Hard" buttons

### Cycle 5: Content Variety
**Steal from**: Babbel, Lingopie
**Build**:
- News articles
- Music lyrics
- Podcast transcripts
- Topic filtering

### Cycle 6: Social Features
**Steal from**: Duolingo leaderboards
**Build**:
- Comments
- Share to Instagram
- Leaderboards
- Achievement badges

---

## 📊 SUCCESS METRICS

**Phase 1** (Cycles 1-3): Core Experience
- Page load <2s
- 60fps scroll
- 100% Lighthouse
- Works iPhone SE → Pro Max

**Phase 2** (Cycles 4-6): Engagement
- 10+ videos/session
- 5+ words saved/session  
- 3+ day streaks
- <10s first interaction

**Phase 3** (Cycles 7+): Growth
- 1000+ DAU
- 40% D7 retention
- 8+ min sessions
- 1.2+ viral coefficient

---

**Last Updated**: 2025-10-04 20:05
**Current**: Cycle 1 ✅ COMPLETE
**Next**: Cycle 2 - Vocabulary Review
