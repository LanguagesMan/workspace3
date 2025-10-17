#!/bin/bash

# Fix all MP4 videos for web streaming by moving moov atom to beginning
# This is CRITICAL for browser playback

echo "🔧 Fixing all videos for web streaming..."

VIDEO_DIR="public/videos/reels"
TEMP_DIR="/tmp/video-fixes"
mkdir -p "$TEMP_DIR"

total=$(ls -1 "$VIDEO_DIR"/*.mp4 2>/dev/null | wc -l | tr -d ' ')
current=0

for video in "$VIDEO_DIR"/*.mp4; do
    current=$((current + 1))
    filename=$(basename "$video")
    echo "[$current/$total] Processing: $filename"

    # Create web-optimized version with moov atom at beginning
    ffmpeg -i "$video" \
        -c copy \
        -movflags +faststart \
        -y \
        "$TEMP_DIR/$filename" \
        2>&1 | grep -v "frame=" | grep -v "time=" | tail -5

    # Replace original only if successful
    if [ -f "$TEMP_DIR/$filename" ]; then
        mv "$TEMP_DIR/$filename" "$video"
        echo "   ✅ Fixed: $filename"
    else
        echo "   ❌ Failed: $filename"
    fi
done

echo ""
echo "✅ All videos optimized for web streaming!"
echo "   moov atom moved to beginning for instant playback"
