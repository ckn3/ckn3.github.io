#!/bin/bash

# Update Google Scholar citations and push to GitHub if changed

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Working directory: $SCRIPT_DIR"
echo "Activating virtual environment..."
source venv/bin/activate

echo "Running citation update script..."
python3 update_citations.py

if [ $? -eq 0 ]; then
    # Check if index.html was modified
    if git diff --quiet index.html; then
        echo "No changes to citations. Everything is up to date."
    else
        echo "Citations updated! Committing and pushing..."
        git add index.html
        git commit -m "Updates"
        git push
        echo "Done! Changes pushed to GitHub."
    fi
else
    echo "Script failed. Check the error messages above."
    exit 1
fi

