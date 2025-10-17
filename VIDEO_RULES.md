# 🎥 VIDEO FEED RULES & STANDARDS

## Critical Rules for Langflix Video Feed

### 1. **NO BLOCKING MODALS ON LOAD**
- ❌ **NEVER** show onboarding/welcome modals that block video viewing
- ✅ Videos must load and be visible within 2 seconds
- ✅ Onboarding should be optional and skippable
- **Reason:** User feedback - "basic things don't work. Even the videos don't load"

### 2. **Professional Loading States**
- ✅ Use TikTok/Instagram-style loading indicators
  - Cyan spinner (#00F5FF) with pulse animation
  - Clean, minimal design
  - No blue gradients or default progress bars
- ❌ **NEVER** show "Loading..." text without visual indicator
- ✅ Loading should be <1.5 seconds for initial batch

### 3. **Theme Consistency**
- ✅ Pure black background (#000000) - TikTok/Spotify style
- ✅ Cyan accents (#00F5FF) for CTAs and highlights
- ❌ **NO PURPLE COLORS** - User explicitly requested removal
  - No #667eea, #764ba2, #6366f1, #8b5cf6
- ✅ White text (#FFFFFF) for primary content
- ✅ Gray (#999999) for secondary text

### 4. **Video Loading Strategy**
- ✅ Initial batch: 3 videos (reduced from 15)
- ✅ Subsequent batches: 5 videos
- ✅ Preload strategy:
  - First video: `preload="auto"` (instant play)
  - Next 2 videos: `preload="metadata"` (fast start)
  - Rest: `preload="none"` (load on demand)
- ✅ Use Intersection Observer for lazy loading

### 5. **Performance Targets**
- ✅ Page load: <1.5 seconds
- ✅ API response: <100ms
- ✅ Video start: Instant (first video)
- ✅ Scroll response: <16ms (60fps)
- ✅ Interaction response: <100ms

### 6. **User Experience**
- ✅ TikTok-style vertical scroll with snap-scroll
- ✅ Tap to pause/play
- ✅ Swipe up for next video
- ✅ Tap words for instant translation
- ✅ No forced tutorials - let users explore

### 7. **Error Handling**
- ✅ Graceful degradation for missing services
- ✅ Clear error messages (not technical jargon)
- ✅ Retry buttons for failed loads
- ❌ **NEVER** leave users on blank/frozen screens

### 8. **Mobile-First**
- ✅ Touch-optimized controls
- ✅ Viewport-safe tooltips and modals
- ✅ Responsive design (< 768px)
- ✅ Portrait orientation default

### 9. **Testing Standards**
- ✅ 100% Playwright test pass rate required
- ✅ Test all user types: new, beginner, intermediate, advanced
- ✅ Screenshot comparison to TikTok/Instagram
- ✅ Performance audits (Lighthouse >90)

### 10. **API Requirements**
- ✅ Mock data available for testing
- ✅ Fallback to static JSON if API fails
- ✅ Videos must have transcriptions
- ✅ Filter out broken/incomplete videos

## Anti-Patterns (NEVER DO)

1. ❌ Show modal that blocks video viewing on first load
2. ❌ Use blue/purple gradients for primary UI
3. ❌ Load 15+ videos initially (kills performance)
4. ❌ Show "Loading..." without visual feedback
5. ❌ Force users through multi-step onboarding
6. ❌ Use alerts/confirms that interrupt flow
7. ❌ Leave tooltips outside viewport bounds
8. ❌ Show technical error messages to users
9. ❌ Deploy without 100% critical test coverage
10. ❌ Ship features that don't match top app quality

## Success Criteria

**A video feed is considered production-ready when:**
- [ ] Loads in <1.5 seconds
- [ ] No blocking modals on initial load
- [ ] Pure black + cyan theme throughout
- [ ] TikTok-style scroll mechanics work
- [ ] 100% Playwright tests passing
- [ ] Professional loading states
- [ ] Videos actually play and are visible
- [ ] Mobile responsive
- [ ] Error handling in place
- [ ] Matches TikTok/Instagram quality

## Current Status

### ✅ Completed
- Purple theme removed (19 instances fixed)
- Professional cyan loading spinner
- Onboarding modals disabled
- Theme consistency achieved
- 28/28 auth tests passing

### ⚠️ In Progress
- Video loading/feed integration
- API endpoint connections
- Initial video rendering

### 🔴 Blockers
- Videos not rendering after onboarding removal
- Need to debug feed loading logic
- Research feed integration may be broken

---

**Last Updated:** October 16, 2025
**Maintained By:** Development Team
