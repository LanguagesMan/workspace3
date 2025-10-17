#!/bin/bash
# Monitor transcription progress in real-time

echo "🎙️  TRANSCRIPTION PROGRESS MONITOR"
echo "=================================="
echo ""

while true; do
    clear
    echo "🎙️  TRANSCRIPTION PROGRESS MONITOR"
    echo "=================================="
    echo ""
    
    # Check if process is running
    if ps aux | grep -q "[r]un-transcription.js"; then
        echo "✅ Process Status: RUNNING"
        PID=$(ps aux | grep "[r]un-transcription.js" | awk '{print $2}')
        echo "   PID: $PID"
    else
        echo "⚠️  Process Status: NOT RUNNING"
        echo ""
        echo "Process has completed or stopped."
        break
    fi
    
    echo ""
    
    # Count processed videos from progress file
    if [ -f "transcription-progress.json" ]; then
        PROCESSED=$(grep -o "langfeed" transcription-progress.json | wc -l | tr -d ' ')
        echo "📊 Videos Processed: $PROCESSED"
    else
        echo "📊 Videos Processed: 0"
    fi
    
    # Count total .srt files
    SRT_COUNT=$(find public/videos/langfeed -name "*.srt" ! -name "*.en.srt" ! -name "*.es.srt" 2>/dev/null | wc -l | tr -d ' ')
    echo "📁 Total .srt files: $SRT_COUNT"
    
    # Calculate remaining
    TOTAL=835
    REMAINING=$((TOTAL - PROCESSED))
    PERCENT=$((PROCESSED * 100 / TOTAL))
    
    echo "⏳ Remaining: $REMAINING videos"
    echo "📈 Progress: $PERCENT%"
    
    # Progress bar
    BARS=$((PERCENT / 2))
    printf "   ["
    for i in $(seq 1 50); do
        if [ $i -le $BARS ]; then
            printf "█"
        else
            printf "░"
        fi
    done
    printf "] $PERCENT%%\n"
    
    echo ""
    
    # Estimate time remaining (if we have processed at least 20 videos)
    if [ $PROCESSED -gt 20 ]; then
        # Rough estimate: ~5 seconds per video
        SECONDS_REMAINING=$((REMAINING * 5))
        MINUTES_REMAINING=$((SECONDS_REMAINING / 60))
        HOURS_REMAINING=$((MINUTES_REMAINING / 60))
        MINS_REMAINING=$((MINUTES_REMAINING % 60))
        
        if [ $HOURS_REMAINING -gt 0 ]; then
            echo "⏱️  Estimated time: ${HOURS_REMAINING}h ${MINS_REMAINING}m"
        else
            echo "⏱️  Estimated time: ${MINS_REMAINING}m"
        fi
    fi
    
    echo ""
    echo "📝 Last 5 processed videos:"
    if [ -f "transcription-progress.json" ]; then
        grep "langfeed" transcription-progress.json | tail -5 | sed 's/.*"\(.*\)".*/   - \1/'
    fi
    
    echo ""
    echo "Press Ctrl+C to stop monitoring (transcription will continue)"
    echo "Last updated: $(date '+%H:%M:%S')"
    
    sleep 10
done

