#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# 🔑 OPENAI API KEY SETUP FOR TRANSCRIPTION
# ═══════════════════════════════════════════════════════════════════
# This script helps you set up your OpenAI API key for video transcription
#
# Usage:
#   ./setup-transcription-api-key.sh
#
# Or directly:
#   ./setup-transcription-api-key.sh sk-your-api-key-here
# ═══════════════════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "🔑 OpenAI API Key Setup for Video Transcription"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Check if API key was provided as argument
if [ -n "$1" ]; then
    API_KEY="$1"
else
    echo "📝 Please enter your OpenAI API key:"
    echo "   (Get it from: https://platform.openai.com/api-keys)"
    echo ""
    read -p "API Key: " API_KEY
fi

# Validate API key format
if [[ ! "$API_KEY" =~ ^sk-[a-zA-Z0-9_-]+$ ]]; then
    echo ""
    echo "❌ Invalid API key format. OpenAI keys start with 'sk-'"
    echo ""
    exit 1
fi

echo ""
echo "🔍 Checking if .env file exists..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📄 Creating .env file from .env.example..."
    cp .env.example .env
fi

# Update or add OPENAI_API_KEY in .env
if grep -q "^OPENAI_API_KEY=" .env; then
    echo "🔄 Updating existing OPENAI_API_KEY in .env..."
    # Use sed to replace the line (Mac compatible)
    sed -i '' "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=$API_KEY|" .env
else
    echo "➕ Adding OPENAI_API_KEY to .env..."
    echo "" >> .env
    echo "# OpenAI API Key (for Whisper transcription)" >> .env
    echo "OPENAI_API_KEY=$API_KEY" >> .env
fi

echo ""
echo "✅ OpenAI API key has been set!"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "📊 TRANSCRIPTION SYSTEM STATUS"
echo "═══════════════════════════════════════════════════════════════════"

# Count videos
TOTAL_VIDEOS=$(find public/videos -name "*.mp4" 2>/dev/null | wc -l | tr -d ' ')
TRANSCRIBED=$(find public/videos -name "*.srt" 2>/dev/null | wc -l | tr -d ' ')
REMAINING=$((TOTAL_VIDEOS - TRANSCRIBED))

echo "📹 Total videos: $TOTAL_VIDEOS"
echo "✅ Already transcribed: $TRANSCRIBED"
echo "⏳ Remaining: $REMAINING"
echo ""

if [ $REMAINING -gt 0 ]; then
    # Calculate estimates
    AVG_MINUTES=3
    ESTIMATED_TIME=$((REMAINING * AVG_MINUTES / 3))
    ESTIMATED_COST=$(echo "scale=2; $REMAINING * $AVG_MINUTES * 0.006" | bc)
    
    echo "💡 Estimated transcription:"
    echo "   Time: ~$ESTIMATED_TIME minutes"
    echo "   Cost: ~\$$ESTIMATED_COST USD"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo "🚀 READY TO START TRANSCRIPTION"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
    echo "Run one of these commands to start:"
    echo ""
    echo "  npm run transcribe              # Transcribe all videos"
    echo "  npm run transcribe:watch        # Watch for new videos"
    echo "  npm run transcribe:all          # Transcribe all + watch"
    echo ""
else
    echo "🎉 All videos are already transcribed!"
    echo ""
fi
