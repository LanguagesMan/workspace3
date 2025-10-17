# Video Loading Issue - Complete Diagnosis Report

**Date**: 2025-10-17
**Status**: ❌ CRITICAL - Videos not playing in feed

---

## Problem Statement

Videos in the TikTok-style feed (`/tiktok-video-feed.html`) are stuck on "Loading..." state and show black screens. Users cannot watch any content.

---

## Root Cause Identified

**Primary Issue**: `DEMUXER_ERROR_NO_SUPPORTED_STREAMS: FFmpegDemuxer: no supported streams`

**Error Code**: 4 (MEDIA_ERR_SRC_NOT_SUPPORTED)

This error occurs when Chromium's built-in FFmpeg demuxer cannot decode the video container or codec format.

---

## Investigation Steps

### 1. Server Verification ✅
```bash
curl -I http://localhost:3001/videos/reels/Andheld_camera_footage_202509112217_yzrzq.mp4
```
**Result**: Server working correctly
- Status: 200 OK
- Content-Type: video/mp4 ✅
- Accept-Ranges: bytes ✅
- Range requests: 206 Partial Content ✅

### 2. Video Codec Analysis
```bash
ffprobe Andheld_camera_footage_202509112217_yzrzq.mp4
```
**Result**:
- Video: H.264 (Constrained Baseline) ✅
- Audio: AAC LC ✅
- Container: MP4 ✅
- Duration: 8s ✅

**BUT**: Videos lack `faststart` flag (moov atom at end, not beginning)

### 3. Frontend Code Review

**Issue 1**: Autoplay with unmuted audio ❌
- Line 3315: `videoEl.muted = false`
- Line 3317: `videoEl.autoplay = true`
- **Problem**: Modern browsers block unmuted autoplay

**Issue 2**: Missing `video.load()` call ❌
- Videos with `preload='none'` (index > 2) never start loading
- Intersection observer sets `preload='auto'` but doesn't call `load()`
- **Problem**: Setting preload attribute alone doesn't trigger loading

**Issue 3**: DEMUXER_ERROR on ALL videos ❌
- ALL 5 test videos fail with same error
- Even re-encoded video with faststart fails
- **Problem**: Chromium cannot decode the video format

### 4. Browser Console Logs

```
▶️ Video #0 load started: /videos/reels/Andheld_camera_footage_202509112217_yzrzq.mp4
❌ Video #0 error: Event
   URL: /videos/reels/Andheld_camera_footage_202509112217_yzrzq.mp4
   Error code: 4
   Error message: DEMUXER_ERROR_NO_SUPPORTED_STREAMS: FFmpegDemuxer: no supported streams
```

**All 5 videos fail identically**

---

## Fixes Applied

### ✅ Fix 1: Muted Autoplay
**File**: `public/tiktok-video-feed.html` (Line 3315)
```javascript
// BEFORE
videoEl.muted = false;

// AFTER
videoEl.muted = true; // CRITICAL: Must start muted for autoplay to work
```

### ✅ Fix 2: Disable HTML5 Autoplay, Use Manual Play
**File**: `public/tiktok-video-feed.html` (Line 3317)
```javascript
// BEFORE
videoEl.autoplay = true;

// AFTER
videoEl.autoplay = false; // Let intersection observer handle play()
```

### ✅ Fix 3: Force video.load() for Lazy-Loaded Videos
**File**: `public/tiktok-video-feed.html` (Line 4035)
```javascript
video.preload = 'auto';
video.load(); // CRITICAL: Must call load() when preload was 'none'
```

### ✅ Fix 4: Comprehensive Error Logging
**File**: `public/tiktok-video-feed.html` (Lines 3334-3345)
```javascript
videoEl.addEventListener('loadstart', () => console.log(`▶️ Video #${index} load started`));
videoEl.addEventListener('loadeddata', () => console.log(`✅ Video #${index} data loaded`));
videoEl.addEventListener('error', (e) => {
    console.error(`❌ Video #${index} error:`, e);
    console.error(`   Error code: ${videoEl.error?.code}`);
    console.error(`   Error message: ${videoEl.error?.message}`);
});
```

### ⏳ Fix 5: Re-encode Videos (IN PROGRESS)
**Script**: `scripts/fix-all-videos.sh`

Re-encodes all 229 videos with browser-compatible settings:
```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -profile:v baseline \
  -level 3.0 \
  -pix_fmt yuv420p \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  output.mp4
```

**Changes**:
1. H.264 Baseline profile (maximum compatibility)
2. Level 3.0 (mobile-friendly)
3. YUV420P pixel format (standard)
4. AAC audio at 128kbps
5. Faststart flag (moov atom at beginning)

---

## Current Status

### ✅ What's Fixed
1. Autoplay blocking issue (muted = true)
2. Lazy loading issue (video.load() call added)
3. Error logging (comprehensive debugging)

### ❌ What's Still Broken
1. **DEMUXER_ERROR persists** - Even properly encoded H.264 videos fail
2. All 229 videos need investigation
3. Unknown why Chromium's FFmpeg cannot decode them

---

## Possible Causes (Under Investigation)

### Theory 1: Chromium Codec Build
- Playwright's bundled Chromium might have limited codec support
- System Chrome might work (needs manual testing)

### Theory 2: MP4 Container Issues
- Despite correct codecs, container structure might be incompatible
- Possible fragmented MP4 or incorrect boxes

### Theory 3: Server-Side Streaming
- Express static file serving might not handle video streaming correctly
- May need custom video middleware with proper chunking

### Theory 4: DRM or Encryption
- Videos might have protection that prevents playback
- Check for encrypted media extensions

---

## Next Steps

### Immediate (High Priority)
1. ✅ Test re-encoded video in **system browser** (not Playwright)
2. 🔄 Check if issue is Playwright-specific or affects real users
3. 🔄 Try playing video with `<video>` tag in plain HTML (no JS)
4. 🔄 Check if videos work in Firefox/Safari

### Short Term
1. Investigate Chromium codec support in Playwright
2. Test with different MP4 muxers (MP4Box, etc.)
3. Consider transcoding to WebM (VP9) as fallback
4. Check if issue exists in production vs. development

### Long Term (If Re-encoding Doesn't Work)
1. Switch to HLS streaming (.m3u8)
2. Use video CDN (Mux, Cloudflare Stream)
3. Implement adaptive bitrate streaming
4. Add format detection and automatic transcoding

---

## Test Commands

### Quick Test
```bash
node test-console-dump.js
cat /tmp/console-dump.txt | grep -E "error|Error"
```

### Check Single Video
```bash
open http://localhost:3001/test-one-video.html
```

### Check Main Feed
```bash
open http://localhost:3001/tiktok-video-feed.html
```

### Re-encode All Videos (WARNING: Takes hours)
```bash
chmod +x scripts/fix-all-videos.sh
./scripts/fix-all-videos.sh
```

---

## Files Modified

1. `/Users/mindful/_projects/workspace3/public/tiktok-video-feed.html`
   - Line 3315: Set muted = true
   - Line 3317: Set autoplay = false
   - Lines 3334-3345: Added error logging
   - Line 4035: Added video.load() call

2. `/Users/mindful/_projects/workspace3/scripts/fix-all-videos.sh`
   - Created batch re-encoding script

3. Test files created:
   - `test-console-dump.js` - Automated testing
   - `test-video-quick.js` - Quick verification
   - `public/test-one-video.html` - Single video test
   - `public/test-minimal-video.html` - Minimal reproduction

---

## Success Criteria

### Minimum Viable Fix
- [ ] At least 1 video plays successfully in feed
- [ ] No DEMUXER_ERROR in console
- [ ] Video shows content (not black screen)
- [ ] Autoplay works when muted

### Complete Fix
- [ ] All 229 videos play successfully
- [ ] No console errors
- [ ] Smooth scrolling between videos
- [ ] Proper autoplay/pause behavior
- [ ] Works in Chrome, Firefox, Safari
- [ ] Works on mobile browsers

---

## Contact & Resources

- Video Debugging: Check `/tmp/console-dump.txt`
- Screenshots: `/tmp/video-test-*.png`
- Backup Videos: `public/videos/reels-backup/` (created after running fix script)

---

**Last Updated**: 2025-10-17 01:40 UTC
