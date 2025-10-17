# 🎙️ Audio Narration Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Server
```bash
cd /Users/mindful/_projects/workspace3
npm start
```

### Step 2: Open Articles Page
```
http://localhost:3000/discover-articles.html
```

### Step 3: Test Audio Features

1. **Click any article card** to open the reader
2. **Audio player appears** at the top automatically
3. **Click the play button** ▶️ to start narration
4. **Watch sentences highlight** as audio plays
5. **Click unknown words** (red dotted underline) for instant translation
6. **See your comprehension** percentage at the top

---

## 🎛️ Audio Player Controls

### Basic Controls
- **▶️/⏸️** - Play/Pause
- **Progress Bar** - Click to seek
- **Speed** - 0.5x, 0.75x, 1x, 1.25x, 1.5x
- **Voice** - 6 voices (Spain, Mexico, Argentina)
- **📜 Auto-Scroll** - Scroll to current sentence
- **⬇️ Download** - Save MP3 for offline

### Keyboard Shortcuts
- **Space** - Play/Pause (when audio player focused)
- **Escape** - Close reader
- **Arrow Keys** - Navigate articles (in feed)

---

## 🎯 Smart Filters

### Enable Filters
1. Click **"Show Filters"** button
2. Adjust level range (A1-C2)
3. Set comprehension target (70-90%)
4. Select interest tags

### Example Use Cases

**Beginner (A1-A2):**
- Set level to A1-A2
- Comprehension: 80-95%
- Tags: Culture, Food

**Intermediate (B1-B2):**
- Set level to B1-B2
- Comprehension: 70-85%
- Tags: News, Technology

**Advanced (C1-C2):**
- Set level to C1-C2
- Comprehension: 60-80%
- Tags: All topics

---

## 🎨 Comprehension Banner

Shows at top of each article:
- **87%** - Your comprehension percentage
- **"You know 145 of 167 words"**
- **"23 unknown words"**
- **"Click highlighted words to learn"**

---

## 📝 Word Features

### Unknown Words (Red Underline)
- Click → instant translation
- Save to vocabulary
- Track learning progress

### Saved Words (Orange Background)
- Previously saved words
- Build your vocabulary
- Review later

### Sentence Highlighting (Yellow)
- Highlights during audio playback
- Shows current position
- Auto-scrolls if enabled

---

## 🧪 Run Tests

```bash
# Run all Playwright tests
npm run test:playwright

# Run specific test
npx playwright test tests/articles-audio-enhanced.spec.js

# Run with UI
npx playwright test --ui

# Generate screenshots
npx playwright test --grep "screenshot"
```

---

## 🔑 Optional: Premium Audio Setup

### ElevenLabs (Best Quality)
```bash
# Add to .env
ELEVENLABS_API_KEY=sk_your_key_here
```

Get key: https://elevenlabs.io/

### Google Cloud TTS (Good Quality)
```bash
# Add to .env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GOOGLE_CLOUD_PROJECT=your-project-id
```

Setup: https://cloud.google.com/text-to-speech/docs/quickstart

**Note:** Browser TTS works without any setup!

---

## 📊 API Testing

### Test Audio Generation
```bash
# Basic test
curl "http://localhost:3000/api/articles/audio?text=Hola%20mundo"

# With voice and speed
curl "http://localhost:3000/api/articles/audio?text=Buenos%20días&voice=mexico_female&speed=1.5"
```

### Expected Response
```json
{
  "success": true,
  "audio": {
    "provider": "browser",
    "duration": 2000,
    "sentences": [...],
    "voice": "spain_female",
    "speed": 1.0
  }
}
```

---

## 🐛 Troubleshooting

### Audio Not Playing
1. Check browser console for errors
2. Try different browser
3. Check audio permissions
4. Clear browser cache

### Highlighting Not Working
1. Refresh page
2. Check if audio is actually playing
3. Try browser TTS (always works)

### Filters Not Working
1. Clear filters and try again
2. Check if articles exist for criteria
3. Reload articles

---

## 📱 Mobile Testing

Open on mobile:
```
http://YOUR_IP:3000/discover-articles.html
```

Test:
- ✅ Touch controls
- ✅ Responsive layout
- ✅ Audio player
- ✅ Word highlighting
- ✅ Filters

---

## 🎯 Demo Script

Perfect for showing off the features:

1. **Open articles page**
2. **Show filters** - "We have smart filtering"
3. **Select B1 level** and **Sports tag**
4. **Open an article**
5. **Point to comprehension banner** - "87% comprehension"
6. **Click play** - "Professional audio narration"
7. **Show sentence highlighting** - "Synchronized highlighting"
8. **Click unknown word** - "Instant translations"
9. **Change speed to 1.5x** - "Variable playback speed"
10. **Toggle auto-scroll** - "Auto-scrolling"
11. **Open voice selector** - "6 different voices"

---

## 🎉 Success!

You now have:
- ✅ Professional audio narration
- ✅ Real-time comprehension tracking
- ✅ Smart article filtering
- ✅ Interactive word learning
- ✅ Beautiful UX

**Enjoy your enhanced learning experience!** 🚀

---

## 📚 Next Steps

1. **Add API keys** for premium audio (optional)
2. **Customize voices** in code
3. **Adjust comprehension thresholds**
4. **Add more interest tags**
5. **Deploy to production**

---

**Questions? Check:** `AUDIO_NARRATION_IMPLEMENTATION_COMPLETE.md`

