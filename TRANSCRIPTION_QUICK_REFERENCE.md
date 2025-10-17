# 🎙️ Whisper Transcription - Quick Reference Card

## Setup (One Time)

```bash
# 1. Create .env file with your API key
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# 2. Install dependencies
npm install

# 3. Test setup
node scripts/test-transcription-setup.js
```

## Usage

### Transcribe All Videos (One-Time)
```bash
npm run transcribe
```

### Auto-Watch for New Videos
```bash
npm run transcribe:watch
```

### Both (Process All + Watch)
```bash
npm run transcribe:all
```

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm run transcribe` | Process all existing videos |
| `npm run transcribe:watch` | Watch for new videos only |
| `npm run transcribe:all` | Process all + watch for new |
| `node scripts/test-transcription-setup.js` | Verify setup |

## Output Format

```
video.mp4  →  video.srt (Spanish + English, with punctuation)
```

## Example SRT

```srt
1
00:00:00,000 --> 00:00:03,500
Hola, ¿cómo estás?
Hello, how are you?
```

## Pricing

**$0.006 per minute** of audio

| Videos | Time | Cost |
|--------|------|------|
| 100 × 30s | 50 min | ~$0.30 |
| 500 × 1m | 500 min | ~$3.00 |
| 1000 × 1m | 1000 min | ~$6.00 |

## Common Issues

| Issue | Fix |
|-------|-----|
| API key not found | Set `OPENAI_API_KEY` in `.env` |
| File too large | Compress to <25MB |
| Missing deps | Run `npm install` |

## File Locations

- **Transcriber**: `lib/whisper-large-transcriber.js`
- **Watcher**: `lib/auto-transcribe-watcher.js`
- **Scripts**: `scripts/transcribe-all-videos.js`
- **Config**: `config/openai-config.js`
- **Full Guide**: `TRANSCRIPTION_SETUP_GUIDE.md`

## Quick Test

```bash
# Test without processing videos
node scripts/test-transcription-setup.js
```

## Get API Key

https://platform.openai.com/api-keys

## Support

See `TRANSCRIPTION_SETUP_GUIDE.md` for detailed documentation.

