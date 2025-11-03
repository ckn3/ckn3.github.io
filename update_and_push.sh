#!/bin/bash

# Update Google Scholar citations and push to GitHub if changed

# Set PATH for launchd - include common locations
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$HOME/miniconda3/bin:$HOME/miniconda3/condabin:$PATH"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Working directory: $SCRIPT_DIR"
echo "Python path: $(which python3)"
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
        git push origin main
        echo "Done! Changes pushed to GitHub (origin/main)."
    fi
else
    echo "Script failed. Check the error messages above."
    exit 1
fi

