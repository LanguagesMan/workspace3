# 📊 Mixpanel Quick Reference Card

## 🚀 Quick Setup (5 Minutes)

```bash
# 1. Create account
https://mixpanel.com/register

# 2. Get token
Settings > Project Settings > Access Keys > Copy Token

# 3. Add to .env
MIXPANEL_TOKEN="your-token-here"

# 4. Restart
npm run dev

# 5. Test
Open http://localhost:3001/tiktok-video-feed.html
Check browser console for "✅ Mixpanel event tracked"
```

## 📋 Key Events Tracked

| Event | When | Location |
|-------|------|----------|
| `User Signed Up` | New registration | /api/auth |
| `User Logged In` | User login | /api/auth |
| `Video Started` | Video plays | Client-side |
| `Video Completed` | 80%+ watched | Client-side |
| `Word Saved` | Added to vocab | Client-side |
| `Premium Upgrade Clicked` | Upgrade button | premium.html |
| `Checkout Started` | Stripe checkout | /server.js |
| `Payment Completed` | Successful payment | Stripe webhook |

## 🎯 Success Metrics

### Week 1
- 100 users
- 80% activation
- 60% D7 retention

### Week 3
- 10K users
- $5K MRR
- 10% premium conversion

## 📊 Essential Dashboards

1. **DAU Dashboard**
   - Event: `Daily Active User`
   - Chart: Line (7 days)

2. **Signup Funnel**
   - Steps: Page View → Signup → Video → Completed
   - Goal: 80%+ completion

3. **Premium Conversion**
   - Steps: Upgrade Click → Checkout → Payment
   - Goal: 10%+ conversion

## 🔧 Tracking Functions

```javascript
// Video tracking
trackMixpanelVideoStarted('video-123', { title, difficulty });
trackMixpanelVideoCompleted('video-123', 95);

// Word tracking
trackMixpanelWordClicked('hola', { translation: 'hello' });
trackMixpanelWordSaved('hola', { translation: 'hello' });

// Premium tracking
trackMixpanelPremiumClicked('feed');

// User identity
identifyMixpanelUser('user-123');
```

## ⚡ Quick Checks

### Is it working?
```bash
# Browser console should show:
✅ Mixpanel client initialized
✅ Mixpanel event tracked: Page Viewed
```

### Where to look?
```
Mixpanel Dashboard → Live View → See events in real-time
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No events | Check MIXPANEL_TOKEN in .env |
| Events delayed | Normal (1-5 min), check Live View |
| 0% retention | Need 7+ days of data |

## 📞 Support

- Docs: `MIXPANEL_SETUP_GUIDE.md`
- Dashboard: `MIXPANEL_DASHBOARD_CONFIG.md`
- Tests: `tests/mixpanel-integration.spec.js`
- Mixpanel Help: https://mixpanel.com/get-support
