# 🎙️ Video Transcription Guide

Complete guide for transcribing all videos with OpenAI Whisper Large model.

## ✨ Features

Your transcription system includes:

- **🎯 Whisper Large Model**: Uses OpenAI's `whisper-1` (large model) via API
- **📝 Natural Punctuation**: Automatic punctuation and capitalization
- **🌍 Dual Language**: Spanish transcription + English translation
- **📄 SRT Format**: Standard subtitle files with timestamps
- **⚡ Batch Processing**: 3 videos processed concurrently
- **🛡️ Rate Limiting**: Automatic pauses to respect API limits
- **💰 Cost Tracking**: Real-time cost estimation

## 📊 Current Status

- **Total Videos**: 970
- **Already Transcribed**: 160
- **Remaining**: 835
- **Estimated Time**: ~835 minutes (~14 hours)
- **Estimated Cost**: ~$15 USD

## 🚀 Quick Start

### Step 1: Set Your OpenAI API Key

You have three options:

#### Option A: Use the setup script (Recommended)
```bash
./setup-transcription-api-key.sh
```

#### Option B: Manually edit .env file
```bash
# Edit .env and add:
OPENAI_API_KEY=sk-your-actual-api-key-here
```

#### Option C: Run with environment variable
```bash
OPENAI_API_KEY=sk-xxx npm run transcribe
```

**Get your API key**: https://platform.openai.com/api-keys

### Step 2: Start Transcription

Choose one of these commands:

```bash
# Transcribe all videos without SRT files
npm run transcribe

# Watch for new videos and auto-transcribe
npm run transcribe:watch

# Transcribe all + watch for new videos
npm run transcribe:all
```

## 📝 Output Format

Each video gets a dual-language SRT file:

```srt
1
00:00:00,000 --> 00:00:03,500
Hola, ¿cómo estás?
Hello, how are you?

2
00:00:03,500 --> 00:00:07,200
Estoy muy bien, gracias.
I'm very well, thank you.
```

**Format Details**:
- Line 1: Subtitle number
- Line 2: Timestamp range
- Line 3: Spanish text (with natural punctuation)
- Line 4: English translation (with natural punctuation)
- Line 5: Empty separator

## 🎯 How It Works

1. **Scan**: Finds all `.mp4` and `.mov` files without `.srt` files
2. **Transcribe**: Sends audio to OpenAI Whisper API for Spanish transcription
3. **Translate**: Sends audio to OpenAI Whisper API for English translation
4. **Generate**: Creates dual-language SRT file with timestamps
5. **Save**: Writes SRT file next to the video file

## 💡 Technical Details

### API Endpoints Used

1. **Transcription** (Spanish with punctuation):
   ```
   POST https://api.openai.com/v1/audio/transcriptions
   - model: whisper-1
   - language: es
   - response_format: verbose_json
   - timestamp_granularities: segment
   ```

2. **Translation** (English with punctuation):
   ```
   POST https://api.openai.com/v1/audio/translations
   - model: whisper-1
   - response_format: verbose_json
   - timestamp_granularities: segment
   ```

### Processing Settings

- **Concurrent Videos**: 3 (configurable)
- **Max File Size**: 24 MB (OpenAI limit)
- **Timeout**: 5 minutes per video
- **Batch Pause**: 3 seconds between batches

### Cost Calculation

OpenAI Whisper API pricing:
- **$0.006 per minute** of audio
- Average video: ~3 minutes
- Cost per video: ~$0.018
- Total for 835 videos: ~$15.03

## 🔧 Configuration

Edit `lib/whisper-large-transcriber.js` to customize:

```javascript
const transcriber = new WhisperLargeTranscriber({
    concurrent: 3,           // Videos processed at once
    maxFileSizeMB: 24,      // Max file size
    videosDir: 'path/to/videos'  // Custom video directory
});
```

## 📂 File Structure

```
public/videos/
├── langfeed/
│   ├── video1.mp4
│   ├── video1.srt          ← Generated transcription
│   ├── video2.mp4
│   └── video2.srt          ← Generated transcription
└── other-folder/
    ├── video3.mp4
    └── video3.srt          ← Generated transcription
```

## ⚠️ Troubleshooting

### API Key Error
```
❌ Error: Incorrect API key provided
```
**Solution**: Update your API key in `.env` file or run `./setup-transcription-api-key.sh`

### File Too Large
```
⚠️ File too large: 25.3MB (limit: 24MB)
```
**Solution**: Videos over 24MB are automatically skipped. You can compress them or split them.

### Rate Limit Error
```
❌ Error: Rate limit exceeded
```
**Solution**: The system automatically pauses between batches. If you hit limits, reduce `concurrent` setting.

### No Videos Found
```
✅ All videos already have transcriptions!
```
**Solution**: All videos are already transcribed! Check `public/videos/**/*.srt`

## 📊 Monitoring Progress

### Real-time Progress
The script shows:
- Current batch number
- Video being processed
- File size
- Progress percentage
- Estimated cost

### Check Status Anytime
```bash
# Count videos
find public/videos -name "*.mp4" | wc -l

# Count transcriptions
find public/videos -name "*.srt" | wc -l

# Find videos without transcriptions
find public/videos -name "*.mp4" | while read f; do
    [ ! -f "${f%.mp4}.srt" ] && echo "$f"
done
```

## 🎉 After Transcription

Once complete, your videos will have:
- ✅ Natural punctuation in both languages
- ✅ Proper capitalization
- ✅ Accurate timestamps
- ✅ Dual-language subtitles (Spanish + English)

The subtitles will automatically appear in your video player!

## 🔄 Auto-Transcription

To automatically transcribe new videos as they're added:

```bash
npm run transcribe:watch
```

This will:
1. Transcribe all existing videos without SRT files
2. Watch for new videos
3. Automatically transcribe them when added

## 📚 Related Files

- `scripts/transcribe-all-videos.js` - Main transcription script
- `lib/whisper-large-transcriber.js` - Transcription engine
- `setup-transcription-api-key.sh` - API key setup helper
- `.env` - Environment variables (contains API key)

## 💬 Support

If you encounter issues:
1. Check your OpenAI API key is valid
2. Ensure you have API credits
3. Verify internet connection
4. Check the error messages in the output

## 🎯 Summary

Your transcription system is **production-ready** and will:
- Process 835 videos in ~14 hours
- Cost approximately $15 USD
- Generate dual-language SRT files
- Add natural punctuation automatically
- Provide English translations

**Ready to start?** Run: `./setup-transcription-api-key.sh`
