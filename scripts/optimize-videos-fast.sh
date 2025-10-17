#!/bin/bash

# 🚀 FAST Video Optimization - Fix Moov Atom Position
# This adds the 'faststart' flag to all videos without re-encoding
# Runtime: ~30 seconds for 229 videos (vs 4 hours for full re-encoding)

VIDEOS_DIR="public/videos/reels"
BACKUP_DIR="${VIDEOS_DIR}-backup-$(date +%Y%m%d-%H%M%S)"

echo "🎬 Fast Video Optimization for Browser Compatibility"
echo "=================================================="
echo ""
echo "This script will:"
echo "1. Move moov atom to start (for fast streaming)"
echo "2. Keep original video/audio encoding (no re-encoding)"
echo "3. Create backups before modifying"
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ERROR: ffmpeg not installed"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Create backup directory
echo "📦 Creating backup at: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Count total videos
TOTAL=$(find "$VIDEOS_DIR" -name "*.mp4" -type f | wc -l | tr -d ' ')
echo "📊 Found $TOTAL videos to optimize"
echo ""

CURRENT=0
SUCCEEDED=0
FAILED=0

# Process each video
for video in "$VIDEOS_DIR"/*.mp4; do
    CURRENT=$((CURRENT + 1))
    BASENAME=$(basename "$video")

    echo "[$CURRENT/$TOTAL] Processing: $BASENAME"

    # Backup original
    cp "$video" "$BACKUP_DIR/$BASENAME"

    # Optimize (move moov atom to start, no re-encoding)
    TEMP="${video}.temp.mp4"

    if ffmpeg -i "$video" -c copy -movflags +faststart -y "$TEMP" 2>/dev/null; then
        mv "$TEMP" "$video"
        SUCCEEDED=$((SUCCEEDED + 1))
        echo "  ✅ Optimized successfully"
    else
        rm -f "$TEMP"
        FAILED=$((FAILED + 1))
        echo "  ❌ Failed to optimize"
    fi
done

echo ""
echo "=================================================="
echo "🎉 Optimization Complete!"
echo ""
echo "Results:"
echo "  ✅ Succeeded: $SUCCEEDED"
echo "  ❌ Failed: $FAILED"
echo "  📦 Backups: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Test videos: open http://localhost:3001/tiktok-video-feed.html"
echo "2. If working: delete backup folder"
echo "3. If broken: restore from backup"
echo ""
