# 🚀 ARTICLES FEED - QUICK START GUIDE

## ⚡ Get Started in 2 Minutes

### 1. **Start the Server**

```bash
npm start
```

Server runs on `http://localhost:3001`

### 2. **Open the Articles Feed**

```bash
# In your browser:
http://localhost:3001/discover-articles.html
```

### 3. **Enjoy!**

That's it! You now have:
- ✅ Real-time Spanish news articles
- ✅ AI-powered difficulty analysis
- ✅ Personalized recommendations
- ✅ Word-level translations
- ✅ Reading progress tracking

---

## 🎯 Quick Features Overview

### For Users

**🌐 Browse Articles**
- Choose from 7 categories
- See comprehension score for each article
- Save articles for later
- Share with friends

**📖 Read & Learn**
- Click any word for instant translation
- Save words to your vocabulary
- Listen to articles with TTS
- Toggle side-by-side translation

**📊 Track Progress**
- See articles read today
- Monitor words learned
- Check comprehension average
- Maintain reading streak

### For Developers

**📡 Use the API**

```javascript
// Get personalized feed
fetch('/api/articles/feed?userId=user123&category=news&limit=20')
  .then(res => res.json())
  .then(data => console.log(data.articles));

// Analyze article difficulty
fetch('/api/articles/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    articleText: 'Your Spanish text here...'
  })
}).then(res => res.json());
```

---

## 🎨 Customize Your Experience

### Change User Level

Edit in browser console:
```javascript
const user = JSON.parse(localStorage.getItem('articles_user'));
user.level = 'B2';  // A1, A2, B1, B2, C1, C2
localStorage.setItem('articles_user', JSON.stringify(user));
location.reload();
```

### Add Custom Categories

Edit `/lib/articles-feed-api.js`:
```javascript
const ARTICLE_SOURCES = {
  topics: {
    yourCategory: [
      { url: 'https://your-source.com', difficulty: 'B1' }
    ]
  }
};
```

---

## 🧪 Test the System

```bash
node test-articles-feed.js
```

This will:
- ✅ Test article fetching
- ✅ Test difficulty analysis
- ✅ Test comprehension calculation
- ✅ Test content cleaning
- ✅ Test cache system
- ✅ Generate test report

---

## 📱 Mobile Testing

```bash
# Find your local IP
ipconfig getifaddr en0  # Mac
ipconfig                # Windows

# Access from phone:
http://YOUR-IP:3001/discover-articles.html
```

---

## 🔧 Troubleshooting

### No Articles Loading?

1. **Check RSS feeds** - Some sources may be temporarily down
2. **Use fallback content** - System automatically loads `/content/articles.json`
3. **Clear cache** - `POST /api/articles/clear-cache`

### Translations Not Working?

1. **Simple translations** - Currently using mock translations
2. **Upgrade to LibreTranslate** - See `ARTICLES_FEED_COMPLETE.md` for integration
3. **Custom dictionary** - Edit `translateWord()` function in HTML

### Difficulty Analysis Off?

1. **Calibrate thresholds** - Edit `article-difficulty-analyzer.js`
2. **Add custom words** - Update `spanish-frequency-words.js`
3. **Adjust weights** - Modify `calculateCEFRLevel()` function

---

## 🎓 Learn More

- **Full Documentation**: `ARTICLES_FEED_COMPLETE.md`
- **API Reference**: See "API Endpoints" section in docs
- **Architecture**: See "File Structure" section in docs

---

## 🌟 What's Next?

### Recommended Enhancements

1. **Add More Sources**
   - Latin American news outlets
   - Specialized topics (tech, sports, culture)
   - Different difficulty levels

2. **Improve Translations**
   - Integrate LibreTranslate API
   - Add contextual translations
   - Support multiple target languages

3. **Add Quizzes**
   - Comprehension questions
   - Vocabulary exercises
   - Grammar practice

4. **Social Features**
   - Share articles
   - Reading groups
   - Achievements

---

## 💡 Pro Tips

### Maximize Learning

1. **Start with "For You" category** - AI picks best articles for your level
2. **Click unknown words** - Build vocabulary as you read
3. **Read daily** - Maintain your streak for motivation
4. **Use side-by-side mode** - Compare Spanish with English
5. **Listen while reading** - Improve pronunciation with TTS

### Optimize Performance

1. **Categories load faster** - More focused content
2. **Cache works for 15 minutes** - Instant reloads
3. **Mobile is optimized** - Responsive grid adapts to screen
4. **Infinite scroll ready** - Just keep scrolling

---

## 🎉 You're All Set!

The articles feed is now running and ready to help you learn Spanish through real news content.

**Happy Learning!** 📰🌍📚

---

## 📞 Need Help?

See the full documentation in `ARTICLES_FEED_COMPLETE.md` for:
- Complete API documentation
- Advanced configuration
- Architecture details
- Future enhancements
- Performance metrics

