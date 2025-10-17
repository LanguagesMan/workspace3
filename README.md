# 🎬 LANGFLIX - Language Learning Platform

**TikTok-Style Spanish Learning with AI Personalization**

Langflix is a language learning platform with 814 videos, 13 REST APIs, and AI-powered personalization. Learn Spanish through engaging content, spaced repetition, and adaptive difficulty matching your CEFR level.

## ⚠️ SETUP REQUIRED BEFORE USE

**Server Status:** ⏸️ Won't start (needs .env configuration)  
**Time to fix:** 1 hour  
**Cost:** $50 (OpenAI credits)  
**→ Start here:** `START_HERE_NOW.md`

## ✨ Features

### 📱 TikTok-Style Feed
- **Vertical video scrolling** with dual-language subtitles
- **Tap-to-translate** any word in real-time
- **Progress tracking** with personalized content recommendations
- **Save vocabulary** for later review

### 📰 Personalized News Feed
- Daily news articles adapted to your language level
- Click any word for instant translation and pronunciation
- AI-powered content simplification
- Track reading progress and comprehension

### 🎵 Music & Entertainment
- Learn through songs with synced lyrics
- Karaoke mode for pronunciation practice
- Entertainment news and celebrity content
- Cultural immersion through music

### 🎮 Interactive Learning
- **Daily quizzes** based on your learning history
- **Vocabulary review system** with spaced repetition
- **Progress milestones** and achievement badges
- **Adaptive difficulty** that grows with you

### 🤖 AI Chat Tutor
- Practice conversations with AI
- Get instant feedback on grammar and vocabulary
- Context-aware language assistance
- Available 24/7 for unlimited practice

### 🧭 Guided Mode Journeys
- Turn any article into a curated read → watch → practice flow
- Highlight focus vocabulary with definitions and sentence context
- Auto-suggest short-form videos that reinforce each word
- Finish with micro-quizzes and game prompts to lock in retention

## 🚀 Quick Start (1 Hour Setup)

**→ IMPORTANT:** Follow `DAY_1_CHECKLIST.md` for detailed step-by-step instructions.

### Quick Version

1. **Check current status**
   ```bash
   npm run setup:check
   ```
   This will show you what's missing (red ❌) and what's configured (green ✅)

2. **Create .env file** (5 minutes)
   - Copy template from `DAY_1_CHECKLIST.md`
   - Add generated secrets (provided in docs)

3. **Sign up for 4 services** (40 minutes)
   - Neon PostgreSQL: https://console.neon.tech/ (15 min)
   - Supabase: https://supabase.com/dashboard (10 min)
   - OpenAI: https://platform.openai.com/api-keys (5 min + $50 credit)
   - Stripe: https://dashboard.stripe.com/ (10 min)

4. **Initialize database** (5 minutes)
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Verify setup** (2 minutes)
   ```bash
   npm run setup:check  # Should be all green ✅
   ```

6. **Start the server** (1 minute)
   ```bash
   npm run start:server
   ```

7. **Open your browser**
   Navigate to `http://localhost:3001`  
   You should see 814 videos loading! 🎉

**Total time:** 1 hour  
**Total cost:** $50  
**Result:** Working MVP!

## 📖 Usage

### For Learners

1. **Choose your language level** - Beginner, Intermediate, or Advanced
2. **Start watching videos** - Scroll through engaging content
3. **Tap any word** to see translation and save to vocabulary
4. **Complete daily quizzes** to reinforce learning
5. **Launch guided journeys** at `/guided-mode.html` to read an article, watch targeted clips, and practice new vocabulary in one flow
5. **Track your progress** in the profile section

### For Developers

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🏗️ Architecture

```
workspace3/
├── api/                  # Backend API endpoints
│   ├── analytics.js      # Analytics tracking
│   ├── health/           # Health monitoring
│   ├── vocabulary/       # Vocabulary management
│   └── index.js          # API router
├── lib/                  # Core libraries
│   ├── error-tracking.js # Sentry integration
│   └── usage-analytics.js # Analytics system
├── public/               # Static assets
│   ├── videos/           # Video content
│   ├── articles/         # Article content
│   └── analytics-client.js # Client-side analytics
├── supabase/             # Database migrations
│   └── migrations/       # SQL migration files
├── server.js             # Express server
└── index.html            # Main application
```

## 🎯 Core Technologies

- **Frontend**: Vanilla JavaScript (no framework overhead)
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Analytics**: Vercel Analytics + Custom tracking
- **Monitoring**: Sentry for error tracking
- **APIs**: OpenAI, Translation services

## 📊 Monitoring & Analytics

### Health Checks
Check system health at any time:
```bash
curl http://localhost:3001/api/health/status
```

### Analytics Dashboard
- Track user engagement in real-time
- Monitor API usage and response times
- View learning progress analytics
- Generate daily/weekly reports

### Error Tracking
Errors are automatically captured and reported to Sentry with full context including:
- User information
- API endpoints
- Database queries
- Frontend errors

## 🔒 Security

- Row-level security (RLS) on all database tables
- API rate limiting to prevent abuse
- Secure authentication with Supabase Auth
- CORS protection
- Helmet.js for security headers
- Input validation and sanitization

## 🧪 Testing

Run the test suite:
```bash
npm test
```

### Playwright MCP persona tests
Playwright MCP should be configured to launch dedicated persona projects (beginner, intermediate, power-user), seed data via Supabase REST, and record traces/screenshots for CI review. See `docs/playwright-mcp-personas.md` for the testing matrix and setup notes.

## 📈 Performance

- **Lazy loading** for images and videos
- **Virtual scrolling** for infinite feeds
- **Edge caching** with Vercel
- **Optimized assets** (minified, compressed)
- **CDN delivery** for static content

## 🌐 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set environment variables** in Vercel dashboard

### Environment Variables (Production)
Make sure to set all required environment variables in your hosting platform:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENTRY_DSN` (optional but recommended)
- `NODE_ENV=production`

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Setup Help
- **Quick Start**: `START_HERE_NOW.md` - Get running in 1 hour
- **Detailed Guide**: `DAY_1_CHECKLIST.md` - Step-by-step with troubleshooting
- **Validation**: Run `npm run setup:check` to see what's missing

### Strategic Planning
- **8-Week Roadmap**: `MASTER_LAUNCH_PLAN.md` - MVP to $2M seed funding
- **Team Strategy**: `EXTERNAL_RESOURCES_PLAN.md` - Who to hire when
- **Testing Suite**: `mvp-launch-master-plan.plan.md` - MCP Playwright automation

### Documentation
- **Navigation**: `📖_READ_ME_FIRST.md` - Find any document quickly
- **Technical**: `LANGFLIX_SOURCE.md` - Source of truth
- **API Reference**: `API_DOCUMENTATION.md` - All endpoints

## 🎯 Roadmap

- [ ] More language support (French, German, Mandarin)
- [ ] Mobile apps (iOS & Android)
- [ ] Offline mode
- [ ] Social features (friends, leaderboards)
- [ ] Live tutoring sessions
- [ ] Speech recognition for pronunciation
- [ ] AR/VR immersive experiences

## 🙏 Acknowledgments

- Thanks to all contributors and language learners
- Inspired by successful language learning apps worldwide
- Built with love for the language learning community

---

**Made with ❤️ by the VIDA team**

*Start your language learning journey today!* 🚀

=======
Learn languages naturally through engaging content.

## Features
- TikTok-style video feed with dual subtitles
- Personalized news articles  
- Interactive quizzes & games
- AI chat tutor
- Progress tracking

## Quick Start
\`\`\`bash
npm install
npm run dev
\`\`\`

See USER_GUIDE.md and API_DOCUMENTATION.md for details.
>>>>>>> agent-6-deployment
