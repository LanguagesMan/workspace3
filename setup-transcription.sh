#!/bin/bash

# 🎙️ TRANSCRIPTION SYSTEM SETUP SCRIPT
# Quick setup for Whisper transcription system

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "🎙️  WHISPER TRANSCRIPTION SYSTEM - SETUP"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "   Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo ""
    echo "Creating .env file..."
    
    cat > .env << 'EOF'
# OpenAI API Key for Whisper Transcription
# Get your key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=

# Optional: Supabase Configuration
SUPABASE_URL=
SUPABASE_KEY=

# Optional: Server Configuration
PORT=3000
NODE_ENV=development
EOF
    
    echo "✅ Created .env file"
    echo ""
fi

# Check if API key is set
if grep -q "^OPENAI_API_KEY=$" .env || ! grep -q "^OPENAI_API_KEY=" .env; then
    echo "⚠️  OpenAI API key not set in .env file"
    echo ""
    echo "Please add your OpenAI API key to the .env file:"
    echo ""
    echo "  1. Get your API key from: https://platform.openai.com/api-keys"
    echo "  2. Open .env file"
    echo "  3. Add: OPENAI_API_KEY=sk-your-api-key-here"
    echo ""
    read -p "Press Enter to open .env file (or Ctrl+C to exit)..."
    
    # Try to open in editor
    if command -v code &> /dev/null; then
        code .env
    elif command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    else
        echo "Please edit .env file manually"
    fi
    
    echo ""
    echo "After setting your API key, run this script again."
    exit 0
fi

echo "✅ OpenAI API key is set in .env"
echo ""

# Install dependencies
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Check for videos
VIDEO_COUNT=$(find public/videos -type f \( -name "*.mp4" -o -name "*.mov" \) 2>/dev/null | wc -l)
SRT_COUNT=$(find public/videos -type f -name "*.srt" 2>/dev/null | wc -l)

echo "📊 Video Statistics:"
echo "   Total videos: $VIDEO_COUNT"
echo "   Existing SRT files: $SRT_COUNT"
echo "   Videos needing transcription: $((VIDEO_COUNT - SRT_COUNT))"
echo ""

# Setup complete
echo "═══════════════════════════════════════════════════════════════════"
echo "✅ SETUP COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "📚 What's next?"
echo ""
echo "1. Transcribe all existing videos:"
echo "   npm run transcribe"
echo ""
echo "2. Watch for new videos (auto-transcribe):"
echo "   npm run transcribe:watch"
echo ""
echo "3. Do both (transcribe all + watch for new):"
echo "   npm run transcribe:all"
echo ""
echo "📖 For more details, see: TRANSCRIPTION_SETUP_GUIDE.md"
echo ""

