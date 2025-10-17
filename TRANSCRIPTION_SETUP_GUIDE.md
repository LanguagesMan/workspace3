# 🎙️ Whisper Transcription System - Complete Guide

## Overview

Automatic video transcription and translation system using OpenAI's Whisper large model.

### ✨ Features

- **Proper Punctuation**: Whisper automatically adds correct punctuation and capitalization
- **Dual Language**: Spanish transcription + English translation in one SRT file
- **Auto-Watch**: Automatically transcribes new videos as they're added
- **Batch Processing**: Process multiple videos concurrently with rate limiting
- **Smart Formatting**: Professional SRT format with accurate timestamps

## 🚀 Quick Start

### 1. Get Your OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it (starts with `sk-`)

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# .env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

Or export it in your terminal:

```bash
export OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Choose Your Method

#### Option A: Transcribe All Existing Videos (One-Time)

```bash
node scripts/transcribe-all-videos.js
```

This will:
- Scan all video directories
- Find videos without SRT files
- Transcribe them with proper punctuation
- Add English translations
- Save dual-language SRT files

#### Option B: Start Auto-Watcher (Continuous)

```bash
node scripts/start-auto-watcher.js
```

This will:
- Watch video directories in real-time
- Auto-transcribe new videos when added
- Keep running until you stop it (Ctrl+C)

#### Option C: Both (Process Existing + Watch for New)

```bash
node scripts/start-auto-watcher.js --initial-scan
```

This combines both: processes all existing videos, then starts watching.

## 📁 File Structure

```
public/videos/
├── langfeed/
│   ├── video1.mp4
│   ├── video1.srt          ← Generated (Spanish + English)
│   ├── video2.mp4
│   └── video2.srt          ← Generated (Spanish + English)
├── reels/
│   └── ...
└── ...
```

## 📝 SRT File Format

Each SRT file contains dual-language subtitles:

```srt
1
00:00:00,000 --> 00:00:03,500
Hola, ¿cómo estás?
Hello, how are you?

2
00:00:03,500 --> 00:00:06,200
Estoy muy bien, gracias.
I'm very well, thank you.
```

## 💰 Pricing

OpenAI Whisper API pricing: **$0.006 per minute** of audio

### Estimates

| Videos | Avg Length | Total Time | Est. Cost |
|--------|-----------|------------|-----------|
| 10 | 30 sec | 5 min | $0.03 |
| 50 | 30 sec | 25 min | $0.15 |
| 100 | 1 min | 100 min | $0.60 |
| 500 | 1 min | 500 min | $3.00 |
| 1000 | 1 min | 1000 min | $6.00 |

**Note**: The system shows estimated cost before starting.

## 🔧 Advanced Usage

### Process Specific Directory

```javascript
const WhisperLargeTranscriber = require('./lib/whisper-large-transcriber');

const transcriber = new WhisperLargeTranscriber({
    videosDir: './public/videos/specific-folder',
    concurrent: 3,
    maxFileSizeMB: 24
});

await transcriber.start();
```

### Watch Specific Directory

```javascript
const AutoTranscribeWatcher = require('./lib/auto-transcribe-watcher');

const watcher = new AutoTranscribeWatcher({
    videosDir: './public/videos/specific-folder'
});

await watcher.start();
```

### Programmatic Usage

```javascript
const WhisperLargeTranscriber = require('./lib/whisper-large-transcriber');

const transcriber = new WhisperLargeTranscriber();

// Process single video
await transcriber.processVideo({
    videoPath: '/path/to/video.mp4',
    srtPath: '/path/to/video.srt',
    baseName: 'video',
    directory: 'videos'
});
```

## 🎯 NPM Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "transcribe": "node scripts/transcribe-all-videos.js",
    "transcribe:watch": "node scripts/start-auto-watcher.js",
    "transcribe:all": "node scripts/start-auto-watcher.js --initial-scan"
  }
}
```

Then use:

```bash
npm run transcribe          # Transcribe all existing videos
npm run transcribe:watch    # Watch for new videos only
npm run transcribe:all      # Process all + watch for new
```

## ⚙️ Configuration

Edit `config/openai-config.js` for advanced settings:

```javascript
module.exports = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    WHISPER_MODEL: 'whisper-1',           // OpenAI's Whisper model
    SOURCE_LANGUAGE: 'es',                 // Spanish
    TARGET_LANGUAGE: 'en',                 // English
    CONCURRENT_TRANSCRIPTIONS: 3,          // Parallel processing
    MAX_FILE_SIZE_MB: 24,                  // API limit
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 2000,
};
```

## 🚨 Troubleshooting

### Error: "OPENAI_API_KEY not found"

**Solution**: Set your API key in `.env` file or environment variable.

```bash
# In .env file
OPENAI_API_KEY=sk-your-key-here

# Or export in terminal
export OPENAI_API_KEY=sk-your-key-here
```

### Error: "File too large"

**Solution**: OpenAI Whisper API has a 25MB limit. Compress your video:

```bash
ffmpeg -i input.mp4 -vcodec h264 -acodec aac output.mp4
```

### Videos Not Being Detected

**Solution**: 
- Ensure videos are `.mp4` or `.mov` format
- Check file permissions
- Restart the watcher

### Rate Limit Errors

**Solution**: The system automatically handles rate limits with delays between batches. If you hit limits:
- Reduce `concurrent` setting (default: 3)
- Increase delay between batches

### Poor Transcription Quality

**Tips for better results**:
- Ensure clear audio (no background noise)
- Videos should be in Spanish
- Audio should be audible (not too quiet)

## 📊 Output Examples

### Console Output (During Processing)

```
═══════════════════════════════════════════════════════════════════
🎙️  WHISPER LARGE MODEL TRANSCRIPTION SYSTEM
═══════════════════════════════════════════════════════════════════
✨ Features:
   • Proper punctuation and capitalization
   • Spanish transcription + English translation
   • Dual-language SRT files
   • Batch processing with rate limiting
═══════════════════════════════════════════════════════════════════

🔍 Scanning for videos without transcriptions...

📊 TRANSCRIPTION SUMMARY:
   Videos found: 150
   Concurrent processes: 3
   Estimated time: ~50 minutes
   Estimated cost: ~$0.90 USD
   API: OpenAI Whisper (whisper-1)

⏳ Starting in 5 seconds... Press Ctrl+C to cancel

═══════════════════════════════════════════════════════════════════
📦 BATCH 1/50 (3 videos)
═══════════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────────
🎥 Video: mi_video.mp4
📁 Location: langfeed
──────────────────────────────────────────────────────────────────
📊 Size: 2.34MB
🇪🇸 Transcribing Spanish...
🇬🇧 Translating to English...
💾 Creating SRT file...
✅ Success!
📈 Progress: 1/150 (0.7%)
```

### Auto-Watcher Output

```
═══════════════════════════════════════════════════════════════════
🔄 AUTO-TRANSCRIBE WATCHER STARTING
═══════════════════════════════════════════════════════════════════
✨ Features:
   • Real-time monitoring of video directories
   • Automatic transcription of new videos
   • Spanish → English translation
   • Dual-language SRT files with punctuation
═══════════════════════════════════════════════════════════════════

📁 Watching: /Users/mindful/_projects/workspace3/public/videos
🎙️  Using: OpenAI Whisper API (whisper-1)

👀 Monitoring for new .mp4 and .mov files...
⚡ Will auto-transcribe when detected

✅ Watching 247 directories

🟢 Auto-transcribe watcher is running...
   Press Ctrl+C to stop

🆕 New video detected: new_video.mp4

➕ Added to queue: new_video.mp4

═══════════════════════════════════════════════════════════════════
🎬 Processing: new_video
📁 Queue remaining: 0
═══════════════════════════════════════════════════════════════════
```

## 🎯 Best Practices

### For One-Time Transcription
1. Run `node scripts/transcribe-all-videos.js`
2. Monitor progress
3. Check for errors
4. Verify SRT files are created

### For Continuous Operation
1. Run `node scripts/start-auto-watcher.js` in background
2. Use process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start scripts/start-auto-watcher.js --name "transcribe-watcher"
   pm2 logs transcribe-watcher
   ```
3. Auto-starts on system reboot with PM2

### For Development
1. Process small batch first to test
2. Check SRT quality
3. Adjust settings if needed
4. Then process all videos

## 🔐 Security

**Never commit `.env` file to git!**

The `.env` file is already in `.gitignore`. Keep your API keys secure.

## 📚 API Documentation

- [OpenAI Whisper API Docs](https://platform.openai.com/docs/guides/speech-to-text)
- [Whisper Model Details](https://openai.com/research/whisper)

## 🆘 Support

If you encounter issues:

1. Check API key is set correctly
2. Verify videos are in supported format
3. Check file sizes (< 25MB)
4. Review error messages
5. Check OpenAI API status

## 🎉 Success Indicators

✅ You'll know it's working when:
- SRT files appear next to video files
- Console shows progress updates
- No error messages
- SRT files contain Spanish + English text
- Punctuation is properly formatted

## 📈 Monitoring Progress

The system provides detailed progress:
- Current video being processed
- Batch progress (e.g., 15/50)
- Overall progress (e.g., 127/500 videos)
- Estimated time remaining
- Estimated cost

## 🔄 Updating

To update the system:

```bash
git pull
npm install
```

System is designed to be maintenance-free once set up!

