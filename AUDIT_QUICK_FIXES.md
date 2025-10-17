# 🚀 QUICK FIXES TO LAUNCH MVP

**Priority Order - Do These First**

---

## ✅ TIER 1: FIX TODAY (4 hours) → Launch Ready

### 1. Add Bottom Nav to Missing Pages (2 hours)

**Files to edit:**
- `/Users/mindful/_projects/workspace3/public/profile.html`
- `/Users/mindful/_projects/workspace3/public/discover-articles.html`
- `/Users/mindful/_projects/workspace3/public/review-queue.html`
- `/Users/mindful/_projects/workspace3/public/preference-setup.html`

**Add before `</body>`:**
```html
<script>
  fetch('/components/unified-bottom-nav.html')
    .then(r => r.text())
    .then(html => document.body.insertAdjacentHTML('beforeend', html));
</script>
```

---

### 2. Remove Placeholder Content (1 hour)

**Find all placeholders:**
```bash
grep -r "placeholder\|coming soon\|lorem ipsum" public/*.html
```

**Action:** Replace with real content or hide incomplete features

---

### 3. Add Data Persistence to Quiz (1 hour)

**File:** `/Users/mindful/_projects/workspace3/lib/gamification-system.js`

**Add:**
```javascript
// Save progress to localStorage
saveProgress() {
  localStorage.setItem('userProgress', JSON.stringify({
    xp: this.xp,
    level: this.level,
    streak: this.streak,
    achievements: this.achievements
  }));
}

// Load progress on init
loadProgress() {
  const saved = localStorage.getItem('userProgress');
  if (saved) {
    const data = JSON.parse(saved);
    this.xp = data.xp || 0;
    this.level = data.level || 1;
    this.streak = data.streak || 0;
    this.achievements = data.achievements || [];
  }
}
```

---

## 🔥 TIER 2: FIX TOMORROW (6 hours) → Production Ready

### 4. Add Swipe Gestures (3 hours)

**File:** `/Users/mindful/_projects/workspace3/public/tiktok-video-feed.html`

**Add to existing feed code:**
```javascript
// Touch gesture support
let touchStartY = 0;
let touchStartTime = 0;

feedContainer.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
  touchStartTime = Date.now();
}, { passive: true });

feedContainer.addEventListener('touchend', (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  const touchEndTime = Date.now();
  const swipeDistance = touchStartY - touchEndY;
  const swipeTime = touchEndTime - touchStartTime;

  // Only if quick swipe (< 500ms) and far enough (> 50px)
  if (swipeTime < 500 && Math.abs(swipeDistance) > 50) {
    if (swipeDistance > 0) {
      // Swipe up - next video
      scrollToNextVideo();
    } else {
      // Swipe down - previous video
      scrollToPrevVideo();
    }
  }
});
```

---

### 5. Add Leaderboards (2 hours)

**Create:** `/Users/mindful/_projects/workspace3/public/leaderboard.html`

**Key features:**
- Weekly XP rankings
- Friends tab + Global tab
- Top 10 users
- Your rank always visible

**Add to bottom nav:**
```html
<a href="/leaderboard.html" class="nav-item">
  <div class="nav-icon">🏆</div>
  <div class="nav-label">Rank</div>
</a>
```

---

### 6. Add Streak Freeze (1 hour)

**File:** `/Users/mindful/_projects/workspace3/lib/gamification-system.js`

**Add:**
```javascript
useStreakFreeze() {
  const lastFreezeUsed = localStorage.getItem('lastStreakFreeze');
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  if (!lastFreezeUsed || parseInt(lastFreezeUsed) < oneWeekAgo) {
    localStorage.setItem('lastStreakFreeze', Date.now().toString());
    this.showNotification('🔥 Streak Freeze activated! Your streak is safe today.');
    return true;
  } else {
    this.showNotification('⏳ Streak Freeze available in ' + this.getTimeUntilNextFreeze());
    return false;
  }
}
```

---

## 📋 DONE CHECKLIST

After fixes, verify:
- [ ] All pages have bottom nav
- [ ] No placeholder text visible
- [ ] Quiz saves progress (test: refresh page, check XP persists)
- [ ] Swipe up/down works on mobile (test on real device)
- [ ] Leaderboard shows rankings
- [ ] Streak freeze works once per week

---

## 🎯 LAUNCH!

After Tier 1+2 fixes:
1. Test on real iOS device
2. Test on real Android device
3. Run Lighthouse audit (target: >90 score)
4. Deploy to production
5. Monitor analytics

**Estimated Time to Launch:** 2-3 days with these fixes

---

**See full audit:** `MVP_LAUNCH_AUDIT_REPORT.md`
