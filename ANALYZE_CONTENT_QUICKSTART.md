# 🚀 ANALYZE CONTENT - QUICK START GUIDE

## Run Analysis on All 730 Videos

### Option 1: Analyze Everything Now

```bash
cd /Users/mindful/_projects/workspace3
node scripts/analyze-all-content.js
```

**Output:**
- `data/content-analysis.json` - Full analysis data
- `data/content-analysis-summary.txt` - Human-readable report
- `data/content-analysis.csv` - Spreadsheet format

**Expected Time:** ~18-20 seconds for 730 videos

---

## What Gets Analyzed

✅ **730 Videos** from `/public/videos/langfeed/`
- All `.es.srt` and `.srt` Spanish transcription files
- CEFR level assignment (A1-C2)
- Frequency band analysis
- Word count metrics

✅ **50+ Songs** from `/public/content/songs.json`
- Lyrics analysis
- Difficulty scoring
- Level classification

✅ **Articles** (when feed is active)
- Real-time analysis from NewsAPI, Guardian, RSS

---

## Example Output

```
🚀 STARTING BATCH CONTENT ANALYSIS
========================================

📹 ANALYZING VIDEOS...
  ✅ Processed 50/730 videos...
  ✅ Processed 100/730 videos...
  ...
  ✅ Processed 730/730 videos...

✅ Videos analyzed: 730
❌ Failed: 0

📊 Level Distribution:
  A1: 45 videos (6.2%)
  A2: 120 videos (16.4%)
  B1: 280 videos (38.4%)
  B2: 210 videos (28.8%)
  C1: 65 videos (8.9%)
  C2: 10 videos (1.4%)

🎵 ANALYZING SONGS...
  ✅ Despacito by Luis Fonsi: B1
  ✅ Vivir Mi Vida by Marc Anthony: A2
  ...
✅ Songs analyzed: 10

💾 SAVING RESULTS...
✅ Results saved to: data/content-analysis.json
✅ Summary saved to: data/content-analysis-summary.txt
✅ CSV saved to: data/content-analysis.csv

✅ ANALYSIS COMPLETE!
Total time: 18.42 seconds
Content analyzed: 740
Average time per item: 0.02s
```

---

## View Results

### 1. View Summary Report
```bash
cat data/content-analysis-summary.txt
```

### 2. Open CSV in Excel/Google Sheets
```bash
open data/content-analysis.csv
```

### 3. Inspect JSON Data
```bash
cat data/content-analysis.json | jq '.summary'
```

---

## Import to Database

### Step 1: Run Migration
```bash
# Connect to your Supabase database
psql postgresql://your-connection-string

# Run migration
\i supabase/migrations/20241016_content_analysis.sql
```

### Step 2: Import Analysis Data
```javascript
// Create import script (scripts/import-analysis-to-db.js)
const fs = require('fs');
const { supabase } = require('../lib/supabase-client');

async function importAnalysis() {
  const data = JSON.parse(fs.readFileSync('data/content-analysis.json'));
  
  // Import videos
  for (const video of data.videos) {
    await supabase.from('content_analysis').upsert({
      content_id: video.contentId,
      content_type: 'video',
      cefr_level: video.level,
      difficulty_label: video.difficulty,
      total_words: video.totalWords,
      unique_word_count: video.uniqueWordCount,
      average_word_rank: video.averageWordRank,
      vocabulary_density: video.vocabularyDensity,
      frequency_bands: video.frequencyBands,
      file_name: video.fileName
    });
  }
  
  console.log('✅ Import complete!');
}

importAnalysis();
```

---

## Use in Your App

### Get Content Analysis
```javascript
const response = await fetch('/api/content/analyzed/video_123');
const data = await response.json();

console.log(data.content.level);        // "B1"
console.log(data.content.difficulty);   // "Intermediate"
console.log(data.content.metrics);      // { totalWords: 450, ... }
```

### Get User-Specific Difficulty
```javascript
const response = await fetch('/api/content/difficulty/user_456/video_123');
const data = await response.json();

console.log(data.difficulty.comprehensionRate);  // 87.5
console.log(data.difficulty.goldilocksScore);    // 95
console.log(data.difficulty.difficulty);         // "Perfect"
```

### Display Difficulty Badge
```html
<script src="/js/difficulty-badge.js"></script>
<script src="/js/difficulty-feed-integration.js"></script>

<div class="video-card" data-video-id="video_123">
  <video src="/videos/video_123.mp4"></video>
  <!-- Badge appears here automatically -->
</div>
```

---

## Filter by Difficulty

### Get Perfect-Match Content
```javascript
const smartFeed = require('./lib/smart-difficulty-feed');

const feed = await smartFeed.getPersonalizedFeed('user_456', {
  contentType: 'video',
  limit: 20,
  minGoldilocksScore: 80  // Only show good matches
});

// Returns videos sorted by goldilocks score
feed.forEach(video => {
  console.log(`${video.title}: ${video.level} (${video.metrics.goldilocksScore}% match)`);
});
```

### Get Content by Level
```javascript
const feed = await smartFeed.getContentByLevel('B1', 'video', 20);
// Returns 20 B1-level videos
```

---

## Troubleshooting

### No SRT Files Found?
```bash
# Check if SRT files exist
ls public/videos/langfeed/*.srt | head

# Expected: Lots of .srt and .es.srt files
```

### Analysis Taking Too Long?
- Expected: ~18 seconds for 730 videos
- If slower: Check disk I/O and Node.js version

### Empty Results?
```bash
# Check data directory exists
mkdir -p data

# Check write permissions
touch data/test.txt && rm data/test.txt
```

---

## Next Steps

1. ✅ Run analysis: `node scripts/analyze-all-content.js`
2. ✅ Review summary: `cat data/content-analysis-summary.txt`
3. ✅ Import to database
4. ✅ Add badges to your UI
5. ✅ Enable smart feed sorting
6. 🎉 Launch with perfect difficulty matching!

---

**Need Help?**
- Check `WORD_FREQUENCY_ANALYZER_COMPLETE.md` for full documentation
- All code is in `/lib/` and `/scripts/` directories
- Database schema in `/supabase/migrations/20241016_content_analysis.sql`

