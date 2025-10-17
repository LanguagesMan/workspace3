# 📰 Articles Feed - Quick Reference

## 🚀 Access

**URL:** `http://localhost:3001/articles-feed.html`  
**Navigation:** Click "📰 Articles" in bottom nav  

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **7 Categories** | For You, News, Culture, Sports, Technology, Entertainment, Science |
| **Multi-Source** | 7 Spanish news sources (El País, BBC Mundo, etc.) |
| **FireCrawl** | Deep article scraping when RSS insufficient |
| **Personalized** | Sorted by level match, comprehension, recency |
| **Clickable Words** | Instant translation tooltip |
| **TTS Audio** | Listen to any article |
| **Save Words** | One-click vocabulary saving |
| **Reader Mode** | Distraction-free full-screen reading |

---

## 📡 API Endpoints

```bash
# Get articles
GET /api/articles/feed?category=news&level=A2&limit=24

# Translate word
GET /api/articles/translate/word?word=perro

# Generate audio
POST /api/articles/tts
Body: { "text": "Hola", "voice": "nova" }
```

---

## 🔧 Configuration

**Environment Variables** (`.env`):
```bash
OPENAI_API_KEY="sk-proj-..."     # Required (TTS + Translation)
FIRECRAWL_API_KEY="fc-..."       # Required (Article scraping)
DEEPL_API_KEY="..."              # Optional (Best translation)
GOOGLE_TTS_API_KEY="..."         # Optional (TTS fallback)
```

---

## 🎨 Data Sources

| Source | Difficulty | Category |
|--------|-----------|----------|
| El País | B2 | News |
| BBC Mundo | B1 | News |
| El Mundo | B2 | News |
| 20 Minutos | A2 | News |
| Hola | A2 | Entertainment |
| Marca | B1 | Sports |
| Nat Geo ES | B2 | Science |

---

## 📊 Personalization Algorithm

```
Score = 40% Level Match
      + 30% Comprehension
      + 20% Recency
      + 10% Category Match
```

**Optimal:** 85-95% comprehension (i+1 learning)

---

## 🎮 User Actions

1. **Browse** - Scroll through personalized feed
2. **Filter** - Click category tabs
3. **Read** - Click article card
4. **Translate** - Click any word in reader
5. **Listen** - Click 🔊 button
6. **Save** - Click 💾 on word tooltip

---

## 🔄 Cache

- **Duration:** 30 minutes
- **Per:** Category + Level
- **Clear:** `POST /api/articles/clear-cache`

---

## ⚡ Performance

| Metric | Value |
|--------|-------|
| Load Time | <5s |
| RSS Fetch | 2-5s |
| FireCrawl | 10-15s |
| Cache Hit | 90% |
| TTS Gen | 3-5s |

---

## 🐛 Troubleshooting

**No articles showing?**
1. Check `.env` has `FIRECRAWL_API_KEY`
2. Check internet connection
3. Check server logs for errors
4. Try clearing cache: `POST /api/articles/clear-cache`

**Translation not working?**
1. Check `OPENAI_API_KEY` or `DEEPL_API_KEY`
2. Check API key credits
3. Check network requests in DevTools

**Audio not playing?**
1. Check `OPENAI_API_KEY`
2. Check browser audio permissions
3. Try Web Speech fallback

---

## 📱 Mobile Experience

✅ **Fully Responsive**
- 1 column on mobile
- Touch-friendly buttons
- Swipe-friendly cards
- Sticky audio player above nav

---

## 🎯 Learning Flow

```
Browse Articles (For You)
    ↓
Find interesting article (~85% match)
    ↓
Read in full screen
    ↓
Click unknown words → Translate
    ↓
Save words to vocabulary
    ↓
Listen with audio
    ↓
Practice saved words in Review
```

---

## 📚 Documentation

- **Full Details:** `ARTICLES_FEED_COMPLETE_IMPLEMENTATION.md`
- **Transformation:** `DISCOVER_TO_ARTICLES_TRANSFORMATION.md`
- **Source Truth:** `LANGFLIX_SOURCE.md`

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** October 17, 2025

