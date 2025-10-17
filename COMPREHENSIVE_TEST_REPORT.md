# 🧪 Comprehensive App Test Report

**Generated**: 2025-10-16T23:30:09.765Z

## 📊 Summary

- **Total Pages**: 8
- **Passed**: ✅ 2
- **Failed**: ❌ 6
- **Critical Failures**: 🚨 3

## 🚨 CRITICAL FAILURES (Must Fix Immediately)

### Home - `/`
- **Load Time**: 537ms
- **Screenshot**: `screenshots/comprehensive-test/home.png`

**Console Errors**:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
Error loading articles: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

### TikTok Video Feed - `/tiktok-video-feed.html`
- **Load Time**: 5601ms
- **Screenshot**: `screenshots/comprehensive-test/tiktok-video-feed.png`

**Errors**:
- ❌ Video 0: Error 4 - DEMUXER_ERROR_NO_SUPPORTED_STREAMS: FFmpegDemuxer: no supported streams
- ❌ Video 1: Error 4 - DEMUXER_ERROR_NO_SUPPORTED_STREAMS: FFmpegDemuxer: no supported streams
- ❌ Video 2: Error 4 - DEMUXER_ERROR_NO_SUPPORTED_STREAMS: FFmpegDemuxer: no supported streams

**Console Errors**:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 400 (Bad Request)
❌ Video #3 error: Event
   URL: /videos/reels/Breaking_news_report_202509130021_xb6vv.mp4
   Error code: 4
... and 5 more
```

**Network Errors**:
- http://localhost:3001/videos/reels/Andheld_camera_footage_202509112217_yzrzq.mp4: net::ERR_ABORTED
- http://localhost:3001/videos/reels/Back_to_what_202509101756_fhb2f.mp4: net::ERR_ABORTED
- http://localhost:3001/videos/reels/Back_to_what_202509101758_ab6bz.mp4: net::ERR_ABORTED
- http://localhost:3001/videos/reels/Breaking_news_report_202509130021_xb6vv.mp4: net::ERR_ABORTED
- http://localhost:3001/videos/reels/Breaking_news_report_202509130021_xb6vv.mp4: net::ERR_ABORTED
- ... and 5 more

### Premium - `/premium.html`
- **Load Time**: 6267ms
- **Screenshot**: `screenshots/comprehensive-test/premium.png`

**Console Errors**:
```
Mixpanel error: "mixpanel" object not initialized. Ensure you are using the latest version of the Mixpanel JS Library along with the snippet we provide.
```

## ❌ Other Failures

### AI Discover
- **URL**: /discover-ai-feed.html
- **Errors**: 0 console, 1 network
- **Screenshot**: `screenshots/comprehensive-test/ai-discover.png`

### Sign In
- **URL**: /sign-in.html
- **Errors**: 0 console, 1 network
- **Screenshot**: `screenshots/comprehensive-test/sign-in.png`

### Sign Up
- **URL**: /sign-up.html
- **Errors**: 0 console, 1 network
- **Screenshot**: `screenshots/comprehensive-test/sign-up.png`

## ✅ Passed Pages

- **Langflix** (54ms)
- **Test Re-encoded Video** (9ms)

## ⏱️  Performance Analysis

**Slow Pages** (>3s):
- Premium: 6267ms
- TikTok Video Feed: 5601ms
