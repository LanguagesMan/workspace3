# Deployment Checklist - Langflix Production Launch

## CRITICAL: Pre-Deployment Blockers

### BLOCKER #1: Video Loading Failure ❌
**Status**: CRITICAL - App cannot load videos
**Issue**: The app is stuck on "Loading Spanish videos..." spinner
**Root Cause**: Unknown - requires immediate investigation
- API endpoint `/api/videos` works correctly (returns 106 videos)
- Express server `/lib/` route has been fixed
- Module import order has been fixed
- Issue is in `loadVideos()` or `getPersonalizedFeed()` function

**Action Required**: Debug `loadVideos()` function in tiktok-video-feed.html (line 1732)

---

## Pre-Deployment Checklist

### Environment Setup
- [ ] SUPABASE_URL configured
- [ ] SUPABASE_ANON_KEY configured
- [ ] OPENAI_API_KEY configured (for transcription)
- [ ] Node.js version 18+ installed
- [ ] All npm packages installed (`npm install`)
- [ ] Videos exist in `/public/videos/reels/` (106 videos confirmed present)

### Code Quality
- [ ] ❌ All Playwright tests pass (21/37 failing due to video loading issue)
- [ ] No console errors (needs verification after video fix)
- [ ] All videos load correctly
- [ ] All features tested manually
- [ ] Mobile testing complete (375x812 viewport)
- [ ] Database connected and working
- [ ] Authentication working

### Performance
- [ ] Lighthouse score >90 (not tested due to blocker)
- [ ] Page load time <3 seconds (achieved: ~2.3s to DOM load)
- [ ] First Contentful Paint <1.5s
- [ ] No memory leaks on tab switching (passed)

### Security
- [ ] Environment variables secured
- [ ] API keys not exposed in client code
- [ ] CORS properly configured
- [ ] Input sanitization implemented
- [ ] Rate limiting configured (if applicable)

---

## Deployment Steps

### 1. Install Dependencies
```bash
cd /Users/mindful/_projects/workspace3
npm install
```

### 2. Configure Environment Variables
Create `.env` file with:
```
SUPABASE_URL=https://bsayrshgplgfrxonmreo.supabase.co
SUPABASE_ANON_KEY=your_key_here
OPENAI_API_KEY=your_key_here
PORT=3001
```

### 3. Run Tests
```bash
# Run comprehensive test suite
npx playwright test tests/production-ready.spec.js

# Expected: All 37 tests should pass
# Actual: 16 passed, 21 failed (due to video loading blocker)
```

### 4. Build (if applicable)
```bash
# Currently no build step required (pure HTML/JS)
# In future, may add:
# npm run build
```

### 5. Start Server
```bash
# Production mode
npm start

# Development mode (with auto-restart)
npm run dev
```

### 6. Verify Deployment
- [ ] Open http://localhost:3001
- [ ] Videos load and play automatically
- [ ] Subtitles display correctly (Spanish white, English yellow)
- [ ] Click word → shows translation tooltip
- [ ] All navigation tabs work (Home, Discover, Quiz, Profile)
- [ ] Authentication signup/login works
- [ ] Word saving to database works
- [ ] Mobile responsive (test on real device)

---

## Post-Deployment Verification

### Smoke Tests
1. **Homepage loads**: Visit http://localhost:3001/tiktok-video-feed.html
2. **Videos play**: First video should auto-play within 2 seconds
3. **Subtitles work**: Spanish and English subtitles visible
4. **Navigation works**: Click through all 4 tabs
5. **Authentication works**: Sign up / Log in flow
6. **Database works**: Save a word, check if it persists

### Health Checks
```bash
# API endpoint health
curl http://localhost:3001/api/videos

# Should return JSON array of 106 videos
```

### Monitor Logs
```bash
# View server logs
tail -f /tmp/server.log

# Look for:
# - ✅ Server running on http://localhost:3001
# - Any error messages
# - API request logs
```

---

## Rollback Plan

If deployment fails:

1. **Stop server**:
   ```bash
   pkill -f "node server.js"
   ```

2. **Restore from git**:
   ```bash
   git reset --hard HEAD^
   ```

3. **Restart server**:
   ```bash
   npm start
   ```

4. **Notify team**: Document issue and timeline for fix

---

## Known Issues

### Critical
1. **Video Loading Failure**: App stuck on loading spinner
   - Affects all users
   - Blocks production launch
   - Fix priority: P0 (immediate)

### Non-Critical (Can Ship With)
None identified (besides main blocker)

---

## Support & Maintenance

### Monitoring
- Server uptime: Check http://localhost:3001/stats
- Error tracking: Review `/tmp/server.log`
- User analytics: Supabase dashboard

### Common Issues

#### Videos won't load
```bash
# Check if videos exist
ls -la /Users/mindful/_projects/workspace3/public/videos/reels/

# Check API response
curl http://localhost:3001/api/videos

# Check server logs
tail -f /tmp/server.log
```

#### Port already in use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Restart server
npm start
```

#### Database connection fails
- Verify SUPABASE_URL and SUPABASE_ANON_KEY in `.env`
- Check Supabase dashboard for API status
- Test connection: `curl https://bsayrshgplgfrxonmreo.supabase.co`

---

## Scaling Considerations

### Current Limitations
- **Video Storage**: 106 videos (~200MB total)
- **Concurrent Users**: Tested for 1-10 users
- **Database**: Supabase free tier

### Scaling Path
1. **CDN for videos**: Move to AWS S3 + CloudFront
2. **Database**: Upgrade Supabase tier or migrate to dedicated PostgreSQL
3. **Server**: Deploy to multiple instances with load balancer
4. **Caching**: Implement Redis for API responses

---

## Emergency Contacts

- **Developer**: Claude AI (Autonomous)
- **Server Admin**: Check process manager logs
- **Database**: Supabase support
- **Hosting**: (To be determined)

---

**Last Updated**: 2025-10-09
**Version**: 1.0.0
**Status**: ⚠️ BLOCKED - Critical video loading issue must be resolved before production launch
