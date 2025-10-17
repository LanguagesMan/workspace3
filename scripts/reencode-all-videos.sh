#!/bin/bash

# 🎬 COMPREHENSIVE VIDEO RE-ENCODING SCRIPT
# Re-encodes all videos with browser-compatible H.264 Baseline profile
# Runtime: ~3-4 hours for 140 videos

VIDEOS_DIR="public/videos/reels"
BACKUP_DIR="${VIDEOS_DIR}-original-backup-$(date +%Y%m%d-%H%M%S)"
TEMP_DIR="${VIDEOS_DIR}-reencoding-temp"
LOG_FILE="video-reencoding-$(date +%Y%m%d-%H%M%S).log"

echo "🎬 COMPREHENSIVE VIDEO RE-ENCODING" | tee -a "$LOG_FILE"
echo "================================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "This will re-encode ALL videos with browser-compatible settings:" | tee -a "$LOG_FILE"
echo "  - H.264 Baseline profile (maximum compatibility)" | tee -a "$LOG_FILE"
echo "  - Level 3.0 (mobile-friendly)" | tee -a "$LOG_FILE"
echo "  - AAC audio (128kbps)" | tee -a "$LOG_FILE"
echo "  - Faststart flag (streaming-optimized)" | tee -a "$LOG_FILE"
echo "  - YUV420P pixel format" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ERROR: ffmpeg not installed" | tee -a "$LOG_FILE"
    echo "Install with: brew install ffmpeg" | tee -a "$LOG_FILE"
    exit 1
fi

# Check if videos directory exists
if [ ! -d "$VIDEOS_DIR" ]; then
    echo "❌ ERROR: Videos directory not found: $VIDEOS_DIR" | tee -a "$LOG_FILE"
    exit 1
fi

# Count total videos
TOTAL=$(find "$VIDEOS_DIR" -name "*.mp4" -type f | wc -l | tr -d ' ')
echo "📊 Found $TOTAL videos to re-encode" | tee -a "$LOG_FILE"

if [ "$TOTAL" -eq 0 ]; then
    echo "❌ ERROR: No videos found in $VIDEOS_DIR" | tee -a "$LOG_FILE"
    exit 1
fi

# Estimate time
MINS_PER_VIDEO=2
TOTAL_MINS=$((TOTAL * MINS_PER_VIDEO))
TOTAL_HOURS=$((TOTAL_MINS / 60))
echo "⏱️  Estimated time: ~${TOTAL_HOURS} hours (${TOTAL_MINS} minutes)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Auto-confirm for autonomous mode
echo "Auto-confirming for autonomous execution..." | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "Starting re-encoding..." | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Create backup directory
echo "📦 Creating backup..." | tee -a "$LOG_FILE"
mkdir -p "$BACKUP_DIR"
# Use find instead of glob to handle large number of files
find "$VIDEOS_DIR" -name "*.mp4" -type f -exec cp {} "$BACKUP_DIR/" \;
BACKED_UP=$(find "$BACKUP_DIR" -name "*.mp4" -type f | wc -l | tr -d ' ')
echo "✅ Backup created: $BACKUP_DIR ($BACKED_UP files)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Create temp directory
mkdir -p "$TEMP_DIR"

# Re-encode each video
CURRENT=0
SUCCEEDED=0
FAILED=0
START_TIME=$(date +%s)

# Use process substitution with find to avoid glob limits
while IFS= read -r -d '' video; do
    CURRENT=$((CURRENT + 1))
    BASENAME=$(basename "$video")
    TEMP_FILE="$TEMP_DIR/$BASENAME"

    # Calculate progress
    PERCENT=$((CURRENT * 100 / TOTAL))
    ELAPSED=$(($(date +%s) - START_TIME))
    if [ $CURRENT -gt 1 ]; then
        AVG_TIME=$((ELAPSED / (CURRENT - 1)))
        REMAINING=$(( (TOTAL - CURRENT) * AVG_TIME ))
        REMAINING_MINS=$((REMAINING / 60))
    else
        REMAINING_MINS="calculating..."
    fi

    echo "[$CURRENT/$TOTAL - ${PERCENT}%] Re-encoding: $BASENAME" | tee -a "$LOG_FILE"
    echo "  ⏱️  Elapsed: $((ELAPSED / 60))m | Remaining: ~${REMAINING_MINS}m" | tee -a "$LOG_FILE"

    # Re-encode with browser-compatible settings (Level 4.0 for 720p support)
    ffmpeg -i "$video" \
        -c:v libx264 -profile:v baseline -level 4.0 \
        -pix_fmt yuv420p \
        -c:a aac -b:a 128k \
        -movflags +faststart \
        -y "$TEMP_FILE" \
        >> "$LOG_FILE" 2>&1

    # Check if re-encoding succeeded
    if [ -f "$TEMP_FILE" ] && [ -s "$TEMP_FILE" ]; then
        # Get file sizes
        ORIGINAL_SIZE=$(stat -f%z "$video" 2>/dev/null || stat -c%s "$video" 2>/dev/null)
        NEW_SIZE=$(stat -f%z "$TEMP_FILE" 2>/dev/null || stat -c%s "$TEMP_FILE" 2>/dev/null)
        ORIGINAL_MB=$((ORIGINAL_SIZE / 1024 / 1024))
        NEW_MB=$((NEW_SIZE / 1024 / 1024))

        # Replace original with re-encoded version
        mv "$TEMP_FILE" "$video"
        SUCCEEDED=$((SUCCEEDED + 1))
        echo "  ✅ Success ($ORIGINAL_MB MB → $NEW_MB MB)" | tee -a "$LOG_FILE"
    else
        FAILED=$((FAILED + 1))
        echo "  ❌ Failed to re-encode" | tee -a "$LOG_FILE"
    fi

    echo "" | tee -a "$LOG_FILE"
done < <(find "$VIDEOS_DIR" -name "*.mp4" -type f -print0)

# Cleanup temp directory
rm -rf "$TEMP_DIR"

# Final summary
TOTAL_TIME=$(($(date +%s) - START_TIME))
TOTAL_MINS=$((TOTAL_TIME / 60))

echo "==================================================" | tee -a "$LOG_FILE"
echo "🎉 RE-ENCODING COMPLETE!" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Results:" | tee -a "$LOG_FILE"
echo "  ✅ Succeeded: $SUCCEEDED" | tee -a "$LOG_FILE"
echo "  ❌ Failed: $FAILED" | tee -a "$LOG_FILE"
echo "  ⏱️  Total time: ${TOTAL_MINS} minutes" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Backup:" | tee -a "$LOG_FILE"
echo "  📦 $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Next steps:" | tee -a "$LOG_FILE"
echo "  1. Test videos: open http://localhost:3001/tiktok-video-feed.html" | tee -a "$LOG_FILE"
echo "  2. Run test: node test-video-detailed.js" | tee -a "$LOG_FILE"
echo "  3. If working: delete backup folder to save space" | tee -a "$LOG_FILE"
echo "  4. If broken: restore from $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "==================================================" | tee -a "$LOG_FILE"
