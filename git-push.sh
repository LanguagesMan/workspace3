#!/bin/bash
# Quick Git Push Script
# Usage: ./git-push.sh "commit message"

# Check if commit message provided
if [ -z "$1" ]; then
    echo "Error: Please provide a commit message"
    echo "Usage: ./git-push.sh \"your commit message\""
    exit 1
fi

# Add all changes
git add .

# Commit with provided message
git commit -m "$1"

# Push to GitHub
git push origin master

echo "✅ Successfully pushed to GitHub!"
