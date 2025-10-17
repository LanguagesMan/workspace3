#!/bin/bash

# Re-encode ALL videos to guaranteed web-compatible format
# H.264 High Profile, yuv420p, AAC audio, moov atom at beginning

echo "🎬 Re-encoding all videos for 100% browser compatibility..."
echo "   Target: H.264 High Profile, Level 4.0, yuv420p, AAC 128k"
echo ""

VIDEO_DIR="public/videos/reels"
BACKUP_DIR="public/videos/reels_backup"
TEMP_DIR="/tmp/video-reencodes"

# Create backup
if [ ! -d "$BACKUP_DIR" ]; then
    echo "📦 Creating backup..."
    cp -r "$VIDEO_DIR" "$BACKUP_DIR"
    echo "   ✅ Backup created at $BACKUP_DIR"
fi

mkdir -p "$TEMP_DIR"

total=$(ls -1 "$VIDEO_DIR"/*.mp4 2>/dev/null | wc -l | tr -d ' ')
current=0
success=0
failed=0

for video in "$VIDEO_DIR"/*.mp4; do
    current=$((current + 1))
    filename=$(basename "$video")
    echo "[$current/$total] Re-encoding: $filename"

    # Re-encode with guaranteed web compatibility settings
    ffmpeg -i "$video" \
        -c:v libx264 \
        -profile:v high \
        -level 4.0 \
        -pix_fmt yuv420p \
        -crf 23 \
        -preset medium \
        -c:a aac \
        -b:a 128k \
        -ar 48000 \
        -movflags +faststart \
        -y \
        "$TEMP_DIR/$filename" \
        2>&1 | grep -E "(error|Error|failed|Failed)" || true

    # Replace original only if successful
    if [ -f "$TEMP_DIR/$filename" ] && [ -s "$TEMP_DIR/$filename" ]; then
        mv "$TEMP_DIR/$filename" "$video"
        echo "   ✅ Success: $filename"
        success=$((success + 1))
    else
        echo "   ❌ Failed: $filename"
        failed=$((failed + 1))
    fi
done

echo ""
echo "✅ Re-encoding complete!"
echo "   Success: $success/$total"
echo "   Failed: $failed/$total"
echo "   Backup: $BACKUP_DIR"
