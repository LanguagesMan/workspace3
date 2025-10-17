# 🎯 WORKSPACE3 - 4-Hour Autonomous Work Plan

**Goal:** TikTok-quality entertainment feed for Spanish learning

## ✅ TASK 1: Fix Word Translation Speed (<100ms like Duolingo)
**Reference:** duolingo.com/stories
**Steps:**
1. Firecrawl scrape Duolingo Stories - how they do instant translations
2. Test current translation speed (measure with console.time())
3. Optimize to <100ms for ANY word click
4. Playwright test: Click 20 random words, measure each
5. Screenshot comparison: Ours vs Duolingo speed
6. Commit when ALL <100ms

**Success Criteria:** ALL word translations <100ms (measured)

---

## ✅ TASK 2: Infinite Scroll (TikTok-smooth)
**Reference:** tiktok.com/@spanish.learning
**Steps:**
1. Firecrawl TikTok - study their infinite scroll implementation
2. Check current scroll: Does it load more content automatically?
3. Implement smooth loading (no jumps/flickers)
4. Playwright test: Scroll through 50 articles, verify smooth
5. Screenshot: Record scroll behavior (like TikTok)
6. Commit when scroll matches TikTok quality

**Success Criteria:** Smooth infinite scroll, no loading screens

---

## ✅ TASK 3: Video Auto-Play (Instagram Reels style)
**Reference:** instagram.com/reels
**Steps:**
1. Firecrawl Instagram Reels - how videos auto-play
2. Implement auto-play when video scrolls into view
3. Implement pause when scrolled out of view
4. Swipe gestures (optional but nice)
5. Playwright test: Scroll through 10 videos, verify auto-play
6. Screenshot comparison: Ours vs Instagram

**Success Criteria:** Videos auto-play/pause like Instagram

---

## ✅ TASK 4: Professional Button Gradients (NOT default purple)
**Reference:** instagram.com/reels
**Steps:**
1. Firecrawl Instagram - extract their button gradient CSS
2. Remove ALL default purple buttons: grep -i "purple|#6b46c1" *.css
3. Apply Instagram gradient colors EXACTLY
4. Playwright visual test: Screenshot all buttons
5. Compare: Ours vs Instagram side-by-side
6. Commit when buttons match Instagram quality

**Success Criteria:** Zero purple buttons, Instagram-quality gradients

---

## ✅ TASK 5: Audio Pronunciation (Click word → Hear it)
**Reference:** duolingo.com/stories
**Steps:**
1. Firecrawl Duolingo - how they do audio pronunciation
2. Implement text-to-speech API (Web Speech API or Google TTS)
3. Click word → Translation appears + Audio plays
4. Test with 20 Spanish words
5. Screenshot: Show audio icon/indication
6. Commit when audio works for all words

**Success Criteria:** Click any word → Hear Spanish pronunciation

---

## ✅ TASK 6: Save Article Feature (Like Netflix "My List")
**Reference:** netflix.com
**Steps:**
1. Firecrawl Netflix - study "My List" UI/UX
2. Implement bookmark/save button on articles
3. Create "Saved Articles" page
4. Playwright test: Save 5 articles, navigate to Saved page
5. Screenshot: Saved list UI
6. Commit when save/unsave works perfectly

**Success Criteria:** Users can save articles and see them later

---

## ✅ TASK 7: Progress Tracking (Duolingo-style stats)
**Reference:** duolingo.com
**Steps:**
1. Firecrawl Duolingo - study their stats/progress UI
2. Track: Articles read, words learned, streak days
3. Display stats banner: "Day 7 | 450 words | 🔥 Streak"
4. Playwright test: Read 3 articles, verify stats update
5. Screenshot comparison: Ours vs Duolingo stats
6. Commit when stats work correctly

**Success Criteria:** Stats update in real-time, look professional

---

## 🔄 REPEAT CYCLE:
After Task 7 complete → Read vision.md → Find next most important feature → Repeat

## 🧠 SELF-AWARENESS (Check BEFORE each commit):
1. npx playwright test --headed (SEE the app visually)
2. Count menus: `grep -c "<nav"` → Must be 1!
3. Count spam: `grep -c "popup|modal|achievement"` → Must be 0!
4. Screenshot: Does it look BETTER than last commit?
5. User flow: Click through entire app start-to-finish

**IF ANY FAIL → FIX BEFORE COMMIT!**
