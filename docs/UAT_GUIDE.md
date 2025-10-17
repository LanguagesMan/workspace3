# User Acceptance Testing (UAT) Guide
## Langflix - TikTok-Style Spanish Learning App

**Version**: 1.0.0
**Last Updated**: 2025-10-09
**Test Environment**: http://localhost:3001/tiktok-video-feed.html

---

## ⚠️ PRE-TESTING NOTICE

**CRITICAL BLOCKER**: The app currently has a video loading failure that prevents testing.
- Videos do not load (stuck on "Loading Spanish videos..." spinner)
- This blocks all subsequent testing scenarios
- **Priority**: Fix video loading before conducting UAT

---

## Overview

This guide outlines test scenarios for first-time users to validate the Langflix app is production-ready. Each scenario includes:
- Prerequisites
- Step-by-step instructions
- Expected behavior
- Pass/Fail criteria

---

## Test Environment Setup

### Requirements
- Modern web browser (Chrome, Safari, Firefox, Edge)
- Internet connection
- Audio enabled (for video sound and word pronunciation)
- Screen resolution: 375x812+ (mobile) or 1280x720+ (desktop)

### Access
- **URL**: http://localhost:3001/tiktok-video-feed.html
- **Test Account**: Create new account during testing
- **No pre-configuration required**

---

## Test Scenarios

### Scenario 1: New User Onboarding (First Launch)

**Objective**: Verify a new user can immediately start learning

**Steps**:
1. Open http://localhost:3001/tiktok-video-feed.html in browser
2. Wait for page to load (should take <3 seconds)
3. Observe initial screen

**Expected Behavior**:
- ✅ Video feed loads automatically
- ✅ First video starts playing within 2 seconds
- ✅ Spanish subtitles appear in white at bottom
- ✅ English translation appears in yellow below Spanish
- ✅ Video is fullscreen (no black bars)
- ✅ Sound plays clearly
- ✅ Bottom navigation shows 4 tabs: Home, Discover, Quiz, Profile
- ✅ Top bar shows: "0 words • 0 day streak"

**Pass Criteria**:
- All expected behaviors occur within 5 seconds of page load
- No errors visible on screen
- Video plays smoothly without buffering

**Fail Criteria**:
- Black screen or loading spinner for >5 seconds
- No subtitles visible
- Video doesn't play
- JavaScript errors in console

---

### Scenario 2: Interactive Learning (Word Click)

**Objective**: Verify word translation feature works

**Prerequisites**: Scenario 1 passed

**Steps**:
1. Wait for video to play for 2-3 seconds
2. Tap/click on any Spanish word in the subtitle
3. Observe what happens

**Expected Behavior**:
- ✅ Video pauses immediately
- ✅ Tooltip/popup appears with:
  - Spanish word
  - English translation
  - "Save Word" button
  - "Play Audio" button
- ✅ Tapping outside tooltip closes it
- ✅ Video resumes playing when tooltip closes
- ✅ Word counter in top bar increases by 1 (if word saved)

**Pass Criteria**:
- Tooltip appears within 300ms of click
- Translation is accurate and readable
- Video pause/resume works smoothly
- Save functionality works (word counter updates)

**Fail Criteria**:
- Tooltip doesn't appear
- Video doesn't pause
- No translation shown
- Save button doesn't work

---

### Scenario 3: Video Navigation (Scrolling)

**Objective**: Verify smooth video transitions

**Prerequisites**: Scenario 1 passed

**Steps**:
1. Let first video play for 5 seconds
2. Swipe up (mobile) or scroll down (desktop)
3. Observe transition to next video

**Expected Behavior**:
- ✅ Smooth scroll animation (no jarring jumps)
- ✅ Previous video pauses automatically
- ✅ Next video starts playing automatically
- ✅ New subtitles load for new video
- ✅ No black screen during transition (<500ms)
- ✅ Snap to fullscreen (no half-videos visible)

**Pass Criteria**:
- Transition is smooth (60 FPS)
- Next video starts within 1 second
- No buffering or black screens
- Subtitles sync with new video

**Fail Criteria**:
- Black screen during transition
- Videos overlap (both playing at once)
- Scroll doesn't snap correctly
- Lag or stuttering

---

### Scenario 4: Speed Control

**Objective**: Verify playback speed adjustment

**Prerequisites**: Scenario 1 passed

**Steps**:
1. Locate speed button (should show "1x")
2. Tap/click speed button
3. Select "0.5x" speed
4. Observe video playback

**Expected Behavior**:
- ✅ Speed menu appears with options: 0.5x, 0.75x, 1x, 1.25x, 1.5x
- ✅ Video slows down to 0.5x speed
- ✅ Button updates to show "0.5x"
- ✅ Audio pitch remains normal (not distorted)
- ✅ Speed persists when scrolling to next video

**Pass Criteria**:
- Speed change is immediate (<500ms)
- Audio quality remains good
- Speed selection is persistent

**Fail Criteria**:
- Speed doesn't change
- Audio becomes distorted
- Button doesn't update
- Speed resets on next video

---

### Scenario 5: Tab Navigation

**Objective**: Verify all app sections are accessible

**Prerequisites**: Scenario 1 passed

**Steps**:
1. Tap "Discover" tab at bottom
2. Observe content change
3. Tap "Quiz" tab
4. Observe quiz interface
5. Tap "Profile" tab
6. Observe profile/settings
7. Tap "Home" tab to return

**Expected Behavior**:
- ✅ Each tab loads within 1 second
- ✅ Active tab is highlighted visually
- ✅ Content changes appropriately for each tab
- ✅ "Discover" shows different video categories
- ✅ "Quiz" shows quiz/flashcard options
- ✅ "Profile" shows authentication or user stats
- ✅ "Home" returns to main video feed

**Pass Criteria**:
- All 4 tabs are clickable
- Content loads without errors
- Tab switching is smooth (<1 second)
- Active tab is visually clear

**Fail Criteria**:
- Tab doesn't respond to click
- Content doesn't change
- Errors appear
- Slow loading (>3 seconds)

---

### Scenario 6: Authentication Flow

**Objective**: Verify user can create account and log in

**Prerequisites**: Scenario 1 passed

**Steps**:
1. Tap "Profile" tab
2. Find "Sign Up" button
3. Enter email: test@langflix.com
4. Enter password: TestPassword123!
5. Tap "Sign Up"
6. Observe result

**Expected Behavior**:
- ✅ Sign up form appears
- ✅ Email and password fields are clear
- ✅ Password is masked (hidden)
- ✅ Sign up succeeds within 3 seconds
- ✅ User is logged in automatically
- ✅ Profile shows user email
- ✅ "Sign Out" button appears

**Pass Criteria**:
- Account creation succeeds
- User is logged in
- No error messages
- Profile updates with user info

**Fail Criteria**:
- Sign up fails
- Error messages appear
- Password is visible
- User remains logged out

---

### Scenario 7: Word Persistence (Database)

**Objective**: Verify saved words persist across sessions

**Prerequisites**: Scenario 6 passed (user logged in)

**Steps**:
1. Return to "Home" tab
2. Click on a Spanish word
3. Click "Save Word" in tooltip
4. Note the word
5. Refresh the browser page (F5)
6. Navigate to "Profile" tab
7. Find saved words section

**Expected Behavior**:
- ✅ Word counter increases when word saved
- ✅ Saved word persists after page refresh
- ✅ "Profile" or "Discover" shows saved words list
- ✅ Saved word appears in list with translation

**Pass Criteria**:
- Word counter updates immediately
- Word still saved after refresh
- Word appears in saved words list

**Fail Criteria**:
- Word counter doesn't update
- Saved word disappears after refresh
- Can't find saved words list

---

### Scenario 8: Quiz/Practice Mode

**Objective**: Verify learning reinforcement tools work

**Prerequisites**: Scenario 7 passed (some words saved)

**Steps**:
1. Tap "Quiz" tab
2. Select "Flashcards" option
3. Observe flashcard interface
4. Tap card to flip it
5. Swipe/navigate to next card

**Expected Behavior**:
- ✅ Quiz tab shows learning options
- ✅ Flashcards load with saved words
- ✅ Card shows Spanish word on front
- ✅ Flipping reveals English translation
- ✅ Navigation between cards is smooth
- ✅ Progress indicator shows (e.g., "3/10")

**Pass Criteria**:
- Flashcards display correctly
- Flip animation is smooth
- Navigation works
- Uses previously saved words

**Fail Criteria**:
- No flashcards appear
- Cards don't flip
- Navigation broken
- Shows random words (not saved ones)

---

### Scenario 9: Mobile Responsiveness

**Objective**: Verify app works on mobile devices

**Prerequisites**: None (fresh start)

**Steps**:
1. Open app on mobile device (or resize browser to 375x812)
2. Complete Scenario 1 (onboarding)
3. Test all gestures:
   - Swipe up (next video)
   - Swipe down (previous video)
   - Tap word
   - Pinch to zoom (should be disabled)
   - Rotate device (test both orientations)

**Expected Behavior**:
- ✅ App fills entire screen (no browser chrome)
- ✅ Subtitles are large enough to read (>16px)
- ✅ All buttons are touchable (>44px tap target)
- ✅ Swipe gestures work smoothly
- ✅ No horizontal scrolling
- ✅ Rotation adjusts layout appropriately
- ✅ Virtual keyboard doesn't break layout

**Pass Criteria**:
- All touch interactions work
- Text is readable
- No layout issues
- Performs well (60 FPS)

**Fail Criteria**:
- UI elements too small
- Gestures don't work
- Layout breaks
- Laggy performance

---

### Scenario 10: Performance Under Load

**Objective**: Verify app handles extended usage

**Prerequisites**: Scenario 1 passed

**Steps**:
1. Watch 20 videos in a row (scroll through)
2. Click 10-15 different words
3. Save 5 words
4. Switch between all 4 tabs multiple times
5. Leave app open for 5 minutes
6. Interact again

**Expected Behavior**:
- ✅ No slowdowns after 20 videos
- ✅ Memory usage stays stable (<500MB)
- ✅ No crashes or freezes
- ✅ Videos continue loading smoothly
- ✅ App responds after idle period
- ✅ No error messages

**Pass Criteria**:
- Performance remains consistent
- No memory leaks detected
- App remains responsive

**Fail Criteria**:
- App becomes slow/laggy
- Crashes or freezes
- Memory usage keeps growing
- Videos stop loading

---

## Bug Reporting Template

If you find an issue during testing, report it using this format:

```
**Bug ID**: [Unique identifier]
**Severity**: Critical / High / Medium / Low
**Scenario**: [Which test scenario]
**Step**: [Which step in scenario]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Screenshot/Video**: [Attach if possible]
**Browser**: [Chrome 120, Safari 17, etc.]
**Device**: [iPhone 14, MacBook Pro, etc.]
**Screen Size**: [375x812, 1920x1080, etc.]
```

---

## Test Sign-Off

### Test Summary

| Scenario | Status | Tester | Date | Notes |
|----------|--------|--------|------|-------|
| 1. Onboarding | ❌ BLOCKED | - | - | Video loading failure |
| 2. Word Click | ⏸️ PENDING | - | - | Blocked by Scenario 1 |
| 3. Scrolling | ⏸️ PENDING | - | - | Blocked by Scenario 1 |
| 4. Speed Control | ⏸️ PENDING | - | - | Blocked by Scenario 1 |
| 5. Tab Navigation | ⏸️ PENDING | - | - | Blocked by Scenario 1 |
| 6. Authentication | ⏸️ PENDING | - | - | Blocked by Scenario 1 |
| 7. Word Persistence | ⏸️ PENDING | - | - | Blocked by Scenario 1 |
| 8. Quiz Mode | ⏸️ PENDING | - | - | Blocked by Scenario 1 |
| 9. Mobile | ⏸️ PENDING | - | - | Blocked by Scenario 1 |
| 10. Performance | ⏸️ PENDING | - | - | Blocked by Scenario 1 |

### Overall Status: ⚠️ BLOCKED

**Blocker**: Critical video loading failure prevents all testing
**Action Required**: Fix `loadVideos()` function in tiktok-video-feed.html
**Estimated Fix Time**: 1-2 hours (requires debugging)
**Re-test Required**: Full UAT suite after fix

---

## Approval

- [ ] All scenarios passed
- [ ] No critical or high severity bugs
- [ ] Performance is acceptable
- [ ] Mobile experience is smooth
- [ ] Ready for production launch

**Tester Name**: ___________________
**Tester Signature**: ___________________
**Date**: ___________________

**Product Owner Name**: ___________________
**Product Owner Signature**: ___________________
**Date**: ___________________

---

**Last Updated**: 2025-10-09
**Document Version**: 1.0.0
**Status**: ⚠️ Testing blocked pending video loading fix
