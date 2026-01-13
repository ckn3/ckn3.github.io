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

MAX_RETRIES=5
SLEEP_SECONDS=600
attempt=1
success=0

while [ $attempt -le $MAX_RETRIES ]; do
    echo "Running citation update script (attempt $attempt/$MAX_RETRIES)..."
    python3 update_citations.py
    status=$?
    if [ $status -eq 0 ]; then
        success=1
        break
    fi

    if [ $attempt -lt $MAX_RETRIES ]; then
        echo "Attempt $attempt failed. Retrying in $SLEEP_SECONDS seconds..."
        sleep $SLEEP_SECONDS
    fi
    attempt=$((attempt + 1))
done

if [ $success -ne 1 ]; then
    echo "All $MAX_RETRIES attempts failed. Please check the logs."
    exit 1
fi

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
