# ⚡ Quick Start Guide - 5 Minutes to Running

Get LangFlow running locally in under 5 minutes!

## Prerequisites Check

Make sure you have:
- ✅ Node.js 18+ (`node --version`)
- ✅ Docker & Docker Compose (`docker --version`)
- ✅ Python 3.11+ (`python3 --version`)

## Step 1: Clone & Install (1 min)

```bash
cd /Users/mindful/_projects/workspace3/language-learning-feed

# Install Node dependencies
npm install
```

## Step 2: Start Services (1 min)

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Wait 10 seconds for services to be ready
sleep 10

# Verify services are running
docker-compose ps
```

You should see postgres and redis both "Up" and "healthy".

## Step 3: Setup Database (1 min)

```bash
# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:migrate

# Seed with demo data
npm run db:seed
```

## Step 4: Start Python Services (1 min)

Open two new terminal windows:

**Terminal 2:**
```bash
cd services/content-analyzer
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m spacy download es_core_news_sm
python analyzer.py
```

**Terminal 3:**
```bash
cd services/recommender
pip install -r requirements.txt
python feed_algorithm.py
```

## Step 5: Start Next.js (1 min)

Back in your first terminal:

```bash
npm run dev
```

## 🎉 Done!

Open your browser to:
- **Main App**: http://localhost:3000
- **Feed Page**: http://localhost:3000/feed
- **Onboarding**: http://localhost:3000/onboarding

### Demo User
Use this user ID for API testing: `demo-user-id`

### Test the Feed
```bash
curl "http://localhost:3000/api/feed?userId=demo-user-id&limit=5" | jq
```

## 🚨 Troubleshooting

### "Cannot connect to database"
```bash
# Check if postgres is running
docker-compose ps postgres

# If not running, start it
docker-compose up -d postgres

# Check logs
docker-compose logs postgres
```

### "Redis connection failed"
```bash
# Check if redis is running
docker-compose ps redis

# Start if needed
docker-compose up -d redis
```

### "spaCy model not found"
```bash
cd services/content-analyzer
python -m spacy download en_core_web_sm
python -m spacy download es_core_news_sm
```

### Python dependencies issues
```bash
# Use virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 🎮 What to Try

1. **Landing Page** (http://localhost:3000)
   - See the beautiful hero section
   - Click "Start Learning" or "View Demo"

2. **Onboarding Flow** (http://localhost:3000/onboarding)
   - Select a language
   - Choose your level
   - Experience visual learning for beginners

3. **Feed Experience** (http://localhost:3000/feed)
   - Swipe up/down to navigate
   - Swipe left: "Too hard"
   - Swipe right: "Save words"
   - Double tap: "Like"
   - Tap words for translations
   - Watch progress dashboard update

4. **API Testing**
   ```bash
   # Get feed
   curl "http://localhost:3000/api/feed?userId=demo-user-id" | jq
   
   # Analyze content
   curl -X POST "http://localhost:8001/analyze" \
     -H "Content-Type: application/json" \
     -d '{"text": "Hola mundo", "language": "es"}' | jq
   ```

## 📊 View Your Data

```bash
# Open Prisma Studio
npm run db:studio
```

Browse all your data at http://localhost:5555

## 🛑 Stop Everything

```bash
# Stop Next.js (Ctrl+C in terminal)

# Stop Python services (Ctrl+C in each terminal)

# Stop Docker services
docker-compose down

# Or stop without removing volumes
docker-compose stop
```

## 🔄 Reset Everything

```bash
# Stop and remove all data
docker-compose down -v

# Restart from Step 2
```

## 📚 Next Steps

- Read [README.md](README.md) for full overview
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for detailed guide
- See [API.md](API.md) for API documentation
- Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for architecture

## 💬 Need Help?

Common issues and solutions in [DEVELOPMENT.md](DEVELOPMENT.md#troubleshooting)

---

**You're ready to revolutionize language learning! 🚀**


