# VIDA - Language Learning Platform

## 🎯 Core Philosophy

**Learn any language from scratch through an immersive, addictive feed experience.**

Users should be able to:
- Start from **complete beginner (A0)** with zero knowledge
- Learn purely through consuming content (videos, articles, stories)
- Progress naturally from simple sentences to advanced content
- Feel engaged through smart gamification (not spam)

## 🌟 Key Principles

### 1. **Target Language ONLY**
- Content must be **exclusively in the target language** (e.g., Spanish for Spanish learners)
- No English mixing in articles
- Translations available on demand, but hidden by default
- Immersive learning: force pattern recognition

### 2. **Interesting Content Only**
- **Quality over quantity** - only show engaging, relevant content
- Filter by user interests (news, culture, food, travel, etc.)
- Level-appropriate: beginners get simple sentences, advanced get complex articles
- Real-world content: news, videos, social media style

### 3. **Smart Gamification (Not Spam)**
- **XP rewards for real learning:**
  - ✅ +10 XP: Save a word to vocabulary
  - ✅ +15 XP: Complete an article (read with translation)
  - ✅ +50 XP: Milestone (every 10 words learned)
  - ❌ NO XP for just clicking words (too spammy)

- **Level progression:**
  - 100 XP = 1 level
  - Level 5: Unlock intermediate content
  - Level 10: Unlock advanced content
  - Level-up celebrations with 🎉 animations

- **Unlockable content:**
  - "This article is too advanced - complete 3 easier articles first"
  - "🔓 Unlocked: Intermediate articles!"
  - Voluntary level test to assess progress

### 4. **For ALL Levels**
- **A0 (Complete Beginner):**
  - Start with simplest sentences: "Hola. Buenos días. ¿Cómo estás?"
  - Very slow audio playback
  - Word-by-word translations
  - Unlock first simple article after learning 10 words

- **A1-A2 (Beginner/Elementary):**
  - Simple conversations and stories
  - Normal speed audio with slow option
  - Common vocabulary focus

- **B1-B2 (Intermediate):**
  - News articles, cultural content
  - Faster audio, less hand-holding
  - Complex grammar structures

- **C1-C2 (Advanced/Mastery):**
  - Literature, advanced topics
  - Native-speed content
  - Idioms and specialized vocabulary

### 5. **Two Main Experiences**

#### 📹 Video Feed (TikTok-style)
- **Full-screen vertical scroll** with scroll-snap
- Tap to play/pause videos
- **Word-by-word transcriptions** overlaid on video
- Tap words to see English translation
- Side action buttons: like, save, share
- Auto-play next video on swipe
- Slow down video for beginners
- Videos from `/Langsalot feed/` folder

#### 📰 Article Feed (Instagram-style)
- Infinite scroll feed of articles, news, stories
- Only in target language by default
- "👁️ Show Translation" toggle for full article
- Click words for inline translation tooltip
- Save words to vocabulary (Anki-style spaced repetition)
- Filter by content type: Articles, Videos, All

## 🎮 Engagement Mechanics

1. **Daily Streaks** - Maintain learning habit
2. **XP & Levels** - Progress visualization
3. **Word Counter** - Track vocabulary growth
4. **Achievements** - Badges for milestones
5. **Leaderboards** - (Optional) Compete with friends

## 🎨 Design Standards

- **Minimalistic** - Instagram/TikTok level polish
- **Clean** - No clutter, no spam
- **Fast** - Instant interactions, smooth animations
- **Intuitive** - No learning curve, just start scrolling
- **Beautiful** - Gradients, frosted glass, modern iOS/Android style

## 🚀 User Journey

1. **New User:** Select level (A0-C2) → Choose interests → Start scrolling feed
2. **First Content:** See simple article in Spanish → Click words to learn → Save favorites
3. **Complete Article:** Read full translation → Earn 15 XP → Progress toward level 2
4. **Level Up:** Hit 100 XP → 🎉 Celebration → Unlock new content tier
5. **Habit:** Daily streak reminder → Daily goal (5 articles, 10 words) → Return tomorrow

## 📝 Content Strategy

- **Source:** Real Spanish content (news APIs, curated videos, social media)
- **Filter:** Only interesting, relevant topics based on user interests
- **Adapt:** Adjust difficulty to user level
- **Refresh:** New content daily to maintain engagement

## 🔧 Technical Notes

- **localStorage:** User level, XP, saved words, streak data
- **No backend required:** Client-side learning progress
- **Anki integration:** Export saved words to Anki for spaced repetition
- **TTS:** Text-to-speech for articles (slow/normal/fast speeds)
- **Video player:** Custom controls for speed, subtitles, transcriptions

---

**Goal:** Make language learning as addictive as TikTok, as polished as Instagram, as effective as immersion.


## 🧪 Testing Standard

**ALWAYS use Playwright (NOT Puppeteer)**

✅ Playwright:
- Multi-browser support
- Better API
- Auto-waits for elements  
- Modern, actively maintained by Microsoft

❌ Puppeteer:
- Only Chrome/Chromium
- Older API
- More manual waits needed

**Use Playwright for ALL testing:**
```bash
npx playwright test --headless
npx playwright codegen  # Record tests
```
