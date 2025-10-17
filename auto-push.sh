#!/bin/bash
# Auto-push script for workspace3
# Runs every 30 minutes via launchd

# DISABLED: Auto-push causing authentication errors
# To re-enable: Remove this exit or configure SSH keys
echo "Auto-push disabled. Configure SSH keys or use manual push."
exit 0

# Change to project directory
cd /Users/mindful/_projects/workspace3

# Get current timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Check if there are any changes
if [[ -n $(git status -s) ]]; then
    # Add all changes
    git add .
    
    # Commit with timestamp
    git commit -m "🤖 Auto-backup: $TIMESTAMP"
    
    # Push to GitHub (requires SSH key or credential helper)
    git push origin master 2>> auto-push-error.log
    
    if [ $? -eq 0 ]; then
        echo "[$TIMESTAMP] Changes pushed to GitHub"
    else
        echo "[$TIMESTAMP] Push failed. Check auto-push-error.log"
    fi
else
    echo "[$TIMESTAMP] No changes to push"
fi
