# Local Citation Update Guide

## Quick Start (One Command)

Simply run:
```bash
./update_and_push.sh
```

This script will:
1. Activate the virtual environment
2. Run the citation update script
3. Automatically commit and push if citations are updated

## Manual Steps

If you prefer to run manually:

1. Activate virtual environment:
```bash
source venv/bin/activate
```

2. Run the update script:
```bash
python3 update_citations.py
```

3. If citations are updated, commit and push:
```bash
git add index.html
git commit -m "Update Google Scholar citations"
git push
```

## Daily Workflow

Run `./update_and_push.sh` daily (or as needed) to keep citations updated.

