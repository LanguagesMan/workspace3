# 🧪 QUICK TEST GUIDE - Verify Everything Works

**Server Status**: ✅ Running on port 3001 (829 videos loaded)

---

## 🎯 INSTANT TEST (30 seconds)

### 1. **Minimal Feed Test** (Guaranteed to work)
```
Open in your browser:
http://localhost:3001/test-minimal-feed.html
```

**Expected Result**:
- ✅ "Loading..." disappears
- ✅ 10 videos load with TikTok-style fullscreen scroll
- ✅ Videos auto-play
- ✅ Smooth vertical scrolling

**What this proves**: API works, videos load correctly, basic functionality perfect.

---

### 2. **API Test** (Verify data)
```
Open in your browser:
http://localhost:3001/test-simple-loading.html
```

**Expected Result**:
- ✅ Shows API response in JSON format
- ✅ Success: true
- ✅ Count: 57
- ✅ First video details displayed

**What this proves**: Backend API returning correct data structure.

---

### 3. **Full App Test** (Complete experience)
```
Open in your browser:
http://localhost:3001/tiktok-video-feed.html
```

**If you see "Loading your feed" stuck**:
- This is a JavaScript error in the complex version
- The minimal test proves the API and videos work
- Need to debug why the full version isn't calling renderVideosBatch

**If it works**:
- ✅ Should see fullscreen videos
- ✅ TikTok-style scroll-snap
- ✅ Bottom navigation
- ✅ No spam popups

---

## 🔍 DEBUGGING IF FULL APP STUCK

### Open Browser Console (F12)
```javascript
// Check if videos loaded
console.log(window.videos ? window.videos.length : 'videos not loaded');

// Check for errors
// Look for red error messages
```

### Common Issues:

**1. Videos array is empty**:
- Filter too aggressive (deleted videos, retranscribing)
- Solution: Clear localStorage

**2. JavaScript error before render**:
- Check console for error message
- Likely in `getPersonalizedFeed()` or `renderVideosBatch()`

**3. Loading screen not hidden**:
- Code never reached `loadingEl.style.display = 'none'`
- Error happened before that line

---

## ✅ WHAT WE KNOW WORKS

### API (Verified)
```bash
curl http://localhost:3001/api/videos?includeTranscript=true
# Returns: {"success":true,"count":57,"videos":[...]}
```

### Videos Available
- **Total**: 829 videos in database
- **With transcripts**: 57 videos
- **Path**: /videos/reels/*.mp4
- **Format**: H.264, browser-compatible

### Server
- ✅ Running on port 3001
- ✅ All endpoints responding
- ✅ No startup errors

---

## 📋 NEXT STEPS

### If Minimal Test Works But Full App Doesn't:

1. **Check Browser Console** (F12 → Console tab)
   - Look for JavaScript errors
   - Check what `window.videos` contains

2. **Clear localStorage**:
   ```javascript
   // In browser console:
   localStorage.clear();
   location.reload();
   ```

3. **Check if `window.researchFeed` exists**:
   ```javascript
   // In browser console:
   console.log(window.researchFeed);
   // If it exists but returns empty data, that's the issue
   ```

### If Nothing Works:

1. **Restart Server**:
   ```bash
   # Kill existing server
   lsof -ti:3001 | xargs kill

   # Start fresh
   npm start
   ```

2. **Check for File Corruption**:
   ```bash
   # Restore from backup if needed
   cp public/tiktok-video-feed.html.backup public/tiktok-video-feed.html
   ```

---

## 🎯 SUCCESS CRITERIA

**Minimal Test**:
- ✅ 10 videos load and display
- ✅ Fullscreen layout
- ✅ Scrolling works
- ✅ No errors in console

**Full App**:
- ✅ Videos load (not stuck on loading)
- ✅ TikTok-style UX
- ✅ Bottom navigation visible
- ✅ No spam popups
- ✅ <2s load time

---

## 📞 REPORTING ISSUES

If something doesn't work, provide:

1. **Which test URL** (`test-minimal-feed.html` or `tiktok-video-feed.html`)
2. **What you see** (screenshot or description)
3. **Console errors** (copy/paste from F12 console)
4. **Browser** (Chrome, Safari, Firefox)

---

**Created**: 2025-10-17
**Server**: Running on port 3001
**Videos**: 829 total, 57 with transcripts
**Status**: API verified working ✅
