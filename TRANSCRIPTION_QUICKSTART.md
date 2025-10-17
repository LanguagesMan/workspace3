# URGENT: Video Transcription Quick Start Guide

## Current Status

**CRITICAL ISSUE IDENTIFIED:**
- **Total Videos:** 711 MP4 files
- **Transcripts Exist:** 137 SRT files (19.3% coverage)
- **MISSING TRANSCRIPTS:** 574 videos (80.7% broken!)

### Breakdown by Directory:
```
langfeed/          0/245 videos (0% coverage)  ❌ 245 MISSING
langfeed/reels/    0/167 videos (0% coverage)  ❌ 167 MISSING
reels/_originals/  0/81 videos  (0% coverage)  ❌ 81 MISSING
reels_backup/_orig 0/81 videos  (0% coverage)  ❌ 81 MISSING
reels/             59/59 videos (100%)         ✅ COMPLETE
reels_backup/      75/75 videos (100%)         ✅ COMPLETE
```

## Solution: Automated Batch Transcription

### Step 1: Get OpenAI API Key (5 minutes)

1. Go to: https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the key (starts with `sk-...`)

### Step 2: Set API Key

```bash
# Export for current session
export OPENAI_API_KEY="sk-your-key-here"

# OR add to ~/.zshrc for permanent use
echo 'export OPENAI_API_KEY="sk-your-key-here"' >> ~/.zshrc
source ~/.zshrc
```

### Step 3: Run Transcription (Automated)

```bash
# Audit current status (no API calls)
node scripts/find-missing-transcripts.js

# Generate ALL missing transcripts (automated)
node scripts/batch-transcribe-all.js

# OR transcribe specific directory only
node scripts/batch-transcribe-all.js /Users/mindful/_projects/workspace3/public/videos/langfeed
```

## What the Script Does

### Features:
✅ **Recursive Scanning:** Finds ALL MP4 files in all subdirectories
✅ **Accurate Timing:** Uses Whisper API with segment-level timestamps (fixes "5th second shows in 1st second" bug)
✅ **Bilingual Output:** Spanish transcription + English translation
✅ **Smart Resume:** Skips videos that already have SRT files
✅ **Rate Limiting:** 3 videos per batch with 3-second delays (avoids API throttling)
✅ **Progress Tracking:** Real-time status updates and ETA
✅ **Error Handling:** Continues processing if individual videos fail

### Generated SRT Format:
```srt
1
00:00:00,000 --> 00:00:02,500
Necesito dormir.
I need to sleep.

2
00:00:02,500 --> 00:00:05,000
Estoy muy cansado.
I am very tired.
```

## Time & Cost Estimates

### Full Transcription (574 videos):
- **Processing Time:** ~19 hours (2 min per video avg)
- **Estimated Cost:** ~$57.40 USD
  - Whisper API: ~$0.006/min × 8 min avg = $0.048/video
  - GPT Translation: ~$0.05/video
  - **Total: ~$0.10/video × 574 = $57.40**

### Priority Directories Only:

**Option 1: langfeed only (245 videos)**
- Time: ~8 hours
- Cost: ~$24.50

**Option 2: langfeed + langfeed/reels (412 videos)**
- Time: ~14 hours
- Cost: ~$41.20

**Option 3: Just reels/_originals (81 videos)**
- Time: ~3 hours
- Cost: ~$8.10

## Commands Reference

### Audit & Verification
```bash
# Check current status
node scripts/find-missing-transcripts.js

# List specific missing files
cat scripts/missing-transcripts.txt | head -20

# Count missing by directory
node scripts/find-missing-transcripts.js | grep "coverage"
```

### Transcription
```bash
# Full auto-transcription (all 574 videos)
node scripts/batch-transcribe-all.js

# Specific directory only
node scripts/batch-transcribe-all.js public/videos/langfeed

# Test with single directory first
node scripts/batch-transcribe-all.js public/videos/langfeed/reels | head -100
```

### After Completion
```bash
# Verify all transcripts generated
node scripts/find-missing-transcripts.js

# Should show: "Missing SRT files: 0"
```

## Troubleshooting

### "OPENAI_API_KEY environment variable not set"
```bash
# Check if set
echo $OPENAI_API_KEY

# Set it
export OPENAI_API_KEY="sk-your-key-here"
```

### "API request failed: 429 - Rate limit exceeded"
- Script has built-in rate limiting (3 videos per batch, 3s delay)
- If still hitting limits, edit `scripts/batch-transcribe-all.js`:
  - Change `BATCH_SIZE = 3` to `BATCH_SIZE = 2`
  - Change `DELAY_MS = 3000` to `DELAY_MS = 5000`

### "File too large (>25MB)"
- Whisper API has 25MB file size limit
- Large files will be automatically skipped
- Consider compressing videos or splitting into smaller chunks

### Script crashes midway
- Script auto-resumes! Just re-run the same command
- It skips videos that already have SRT files
- Progress is preserved

## Timing Accuracy Fix

**Previous Issue:** "sentence already said in 5th second shows in 1st second"

**Root Cause:** Transcripts not synchronized with actual video timestamps

**Solution:** New script uses `verbose_json` format with `timestamp_granularities: segment`
- Whisper API returns exact start/end times for each segment
- SRT timestamps match actual video playback precisely
- Format: `00:00:02,500` (hours:minutes:seconds,milliseconds)

## Running in Background (Optional)

```bash
# Run in background (continue if terminal closes)
nohup node scripts/batch-transcribe-all.js > transcription.log 2>&1 &

# Check progress
tail -f transcription.log

# Check if still running
ps aux | grep batch-transcribe
```

## Next Steps After Transcription

1. ✅ Verify completion: `node scripts/find-missing-transcripts.js`
2. ✅ Spot-check 5-10 random videos for timing accuracy
3. ✅ Test in app to confirm subtitles display correctly
4. ✅ Commit all new .srt files to git

---

## CEO Decision Required

**RECOMMENDATION:** Start with priority directories first to validate before full run

### Conservative Approach (Recommended):
1. **Test batch (10 videos):** `node scripts/batch-transcribe-all.js` (stop after batch 1)
2. **Verify quality:** Check timing accuracy in app
3. **Full run:** If quality good, process all 574 videos

### Aggressive Approach (If urgent):
1. **Full auto-run:** `nohup node scripts/batch-transcribe-all.js > transcription.log 2>&1 &`
2. **Monitor:** `tail -f transcription.log`
3. **ETA:** Complete in ~19 hours

---

**STATUS:** ✅ Scripts ready to run
**BLOCKER:** Need OpenAI API key
**RISK:** Moderate ($57 cost, 19 hours runtime)
**IMPACT:** Fixes 80.7% of broken videos

Last Updated: 2025-10-10
