#!/bin/bash

# 🔄 INSTALL AUTO-WATCHER AS BACKGROUND SERVICE
# This will make the auto-watcher run at all times, even after terminal closes

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          🔄  AUTO-WATCHER INSTALLATION                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

PLIST_NAME="com.langflix.transcription-watcher.plist"
PLIST_SOURCE="$PWD/$PLIST_NAME"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"

# Create LaunchAgents directory if it doesn't exist
mkdir -p "$HOME/Library/LaunchAgents"

# Copy plist file
echo "📋 Installing service configuration..."
cp "$PLIST_SOURCE" "$PLIST_DEST"

# Load the service
echo "🚀 Starting auto-watcher service..."
launchctl unload "$PLIST_DEST" 2>/dev/null
launchctl load "$PLIST_DEST"

echo ""
echo "✅ AUTO-WATCHER INSTALLED!"
echo ""
echo "The watcher will now:"
echo "  ✅ Run automatically on startup"
echo "  ✅ Keep running in background"
echo "  ✅ Auto-transcribe new videos when added"
echo "  ✅ Create .es.srt and .en.srt files"
echo ""
echo "📁 Logs:"
echo "  • Output: auto-watcher.log"
echo "  • Errors: auto-watcher-error.log"
echo ""
echo "To stop the service:"
echo "  launchctl unload ~/Library/LaunchAgents/$PLIST_NAME"
echo ""
echo "To start again:"
echo "  launchctl load ~/Library/LaunchAgents/$PLIST_NAME"
echo ""
echo "To check if running:"
echo "  launchctl list | grep transcription"
echo ""

