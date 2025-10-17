#!/bin/bash
#
# Fix all videos for browser compatibility
# Issues fixed:
# 1. Move moov atom to beginning (faststart) for streaming
# 2. Ensure H.264 baseline profile for maximum compatibility
# 3. Ensure AAC audio codec
# 4. Proper pixel format (yuv420p)
#

set -e

SOURCE_DIR="/Users/mindful/_projects/workspace3/public/videos/reels"
BACKUP_DIR="/Users/mindful/_projects/workspace3/public/videos/reels-backup"
TEMP_DIR="/tmp/video-fixes"

echo "🎬 Video Compatibility Fix Script"
echo "=================================="
echo ""
echo "Source: $SOURCE_DIR"
echo "Backup: $BACKUP_DIR"
echo ""

# Create backup
if [ ! -d "$BACKUP_DIR" ]; then
    echo "📦 Creating backup..."
    mkdir -p "$BACKUP_DIR"
    cp "$SOURCE_DIR"/*.mp4 "$BACKUP_DIR/" 2>/dev/null || true
    echo "✅ Backup created"
else
    echo "⚠️  Backup already exists, skipping..."
fi

# Create temp directory
mkdir -p "$TEMP_DIR"

# Count videos
total=$(ls "$SOURCE_DIR"/*.mp4 2>/dev/null | wc -l | tr -d ' ')
echo "📊 Found $total videos to process"
echo ""

if [ "$total" -eq 0 ]; then
    echo "❌ No videos found!"
    exit 1
fi

# Process each video
count=0
success=0
failed=0

for video in "$SOURCE_DIR"/*.mp4; do
    count=$((count + 1))
    filename=$(basename "$video")
    temp_output="$TEMP_DIR/$filename"

    echo "[$count/$total] Processing: $filename"

    # Re-encode with browser-compatible settings
    if ffmpeg -i "$video" \
        -c:v libx264 \
        -profile:v baseline \
        -level 3.0 \
        -pix_fmt yuv420p \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        -y \
        "$temp_output" 2>&1 | grep -q "muxing overhead"; then

        # Replace original with fixed version
        mv "$temp_output" "$video"
        success=$((success + 1))
        echo "  ✅ Fixed"
    else
        failed=$((failed + 1))
        echo "  ❌ Failed"
    fi

    echo ""
done

# Cleanup
rm -rf "$TEMP_DIR"

echo "=================================="
echo "📊 Summary:"
echo "  Total: $total"
echo "  Success: $success"
echo "  Failed: $failed"
echo ""
echo "✅ Done! Videos are now browser-compatible."
echo ""
echo "🔍 Test with: node test-console-dump.js"
