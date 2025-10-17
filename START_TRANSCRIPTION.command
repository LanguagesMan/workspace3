#!/bin/bash

# 🎙️ BATCH TRANSCRIPTION STARTER
# Double-click this file in Finder to start transcribing all videos

clear

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          🎙️  BATCH VIDEO TRANSCRIPTION  🎙️                  ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo "Please install Node.js from https://nodejs.org"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# Check for API key
if [ ! -f ".env" ] || ! grep -q "OPENAI_API_KEY" .env; then
    echo "❌ OpenAI API key not configured!"
    echo ""
    echo "Please add your API key to .env file:"
    echo "OPENAI_API_KEY=sk-your-key-here"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# Show menu
echo "What would you like to do?"
echo ""
echo "1. Process ALL remaining videos (full run)"
echo "2. Process first 10 videos (test)"
echo "3. Process first 50 videos (partial)"
echo "4. Check current status"
echo "5. Cancel"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "Starting FULL transcription of all remaining videos..."
        echo "This will create .es.srt (Spanish) and .en.srt (English) files"
        echo ""
        node scripts/run-transcription.js
        ;;
    2)
        echo ""
        echo "Processing first 10 videos (test mode)..."
        echo ""
        node scripts/run-transcription.js --limit 10
        ;;
    3)
        echo ""
        echo "Processing first 50 videos..."
        echo ""
        node scripts/run-transcription.js --limit 50
        ;;
    4)
        echo ""
        node scripts/run-transcription.js --status
        ;;
    5)
        echo ""
        echo "Cancelled."
        ;;
    *)
        echo ""
        echo "Invalid choice. Exiting."
        ;;
esac

echo ""
echo "Press Enter to close this window..."
read

