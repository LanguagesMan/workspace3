#!/bin/bash

###########################################
# WHISPER VIDEO TRANSCRIPTION SCRIPT
# Transcribes all MP4 videos in /public/videos/reels/
# Generates SRT files with:
# - Accurate Spanish transcription
# - Proper punctuation marks
# - Word-level timestamps (when possible)
###########################################

VIDEOS_DIR="/Users/mindful/_projects/workspace3/public/videos/reels"
OUTPUT_DIR="/Users/mindful/_projects/workspace3/public/videos/reels"

echo "🎙️  Starting Whisper transcription for all videos..."
echo "📁 Videos directory: $VIDEOS_DIR"
echo "📁 Output directory: $OUTPUT_DIR"
echo ""

# Counter for progress
TOTAL_FILES=$(find "$VIDEOS_DIR" -name "*.mp4" | wc -l | tr -d ' ')
CURRENT=0

# Process each MP4 file
find "$VIDEOS_DIR" -name "*.mp4" | while read video_file; do
    CURRENT=$((CURRENT + 1))
    VIDEO_NAME=$(basename "$video_file" .mp4)
    SRT_FILE="$OUTPUT_DIR/${VIDEO_NAME}.srt"

    # Skip if SRT already exists
    if [ -f "$SRT_FILE" ]; then
        echo "⏭️  [$CURRENT/$TOTAL_FILES] Skipping $VIDEO_NAME (SRT exists)"
        continue
    fi

    echo "🎬 [$CURRENT/$TOTAL_FILES] Transcribing: $VIDEO_NAME"

    # Run Whisper transcription
    # --language Spanish: Force Spanish detection
    # --model small: Balance between speed and accuracy
    # --output_format srt: Generate SubRip subtitle format
    # --fp16 False: CPU compatibility
    whisper "$video_file" \
        --language Spanish \
        --model small \
        --output_format srt \
        --output_dir "$OUTPUT_DIR" \
        --fp16 False \
        2>&1 | grep -E "Detected|100%|\["

    if [ -f "$SRT_FILE" ]; then
        echo "✅ Generated: ${VIDEO_NAME}.srt"
    else
        echo "❌ Failed to generate SRT for: $VIDEO_NAME"
    fi

    echo ""
done

echo "🎉 Transcription complete!"
echo "📊 Check $OUTPUT_DIR for SRT files"
