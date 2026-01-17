#!/usr/bin/env python3
"""Fetch Google Scholar citation count and update the badge in index.html."""

from __future__ import annotations

import random
import re
import sys
import time
from pathlib import Path

import requests

USER_ID = "vzCZaIwAAAAJ"
SCHOLAR_URL = f"https://scholar.google.com/citations?user={USER_ID}&hl=en"

MAX_RETRIES = 5
BASE_DELAY = 5.0
TIMEOUT_SECONDS = 15

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}


def _backoff_seconds(attempt: int) -> float:
    jitter = random.uniform(0.0, 2.0)
    return BASE_DELAY + (attempt - 1) * BASE_DELAY + jitter


def fetch_scholar_html() -> str | None:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.get(
                SCHOLAR_URL, headers=HEADERS, timeout=TIMEOUT_SECONDS
            )
            if response.status_code == 429:
                print(
                    f"Received 429 Too Many Requests (attempt {attempt}/{MAX_RETRIES})."
                )
                if attempt == MAX_RETRIES:
                    print("Max retries reached after repeated 429 responses.")
                    return None
                delay = _backoff_seconds(attempt)
                print(f"Backing off for {delay:.1f} seconds before retrying...")
                time.sleep(delay)
                continue
            response.raise_for_status()
            return response.text
        except requests.RequestException as exc:
            print(f"Request attempt {attempt}/{MAX_RETRIES} failed: {exc}")
            if attempt == MAX_RETRIES:
                print("All retry attempts failed.")
                return None
            delay = _backoff_seconds(attempt)
            print(f"Retrying after {delay:.1f} seconds...")
            time.sleep(delay)

    return None


def extract_citations(html: str) -> int | None:
    patterns = [
        r"Cited by</a></td><td class=\"gsc_rsb_std\">(\d+)</td>",
        r"Cited by</a></td><td class='gsc_rsb_std'>(\d+)</td>",
        r"Cited by</a></th><td class=\"gsc_rsb_std\">(\d+)</td>",
        r"Cited by</a></th><td class='gsc_rsb_std'>(\d+)</td>",
        r"Cited by</a></td>\s*<td class=\"gsc_rsb_std\">(\d+)</td>",
    ]
    for pattern in patterns:
        match = re.search(pattern, html)
        if match:
            return int(match.group(1))

    fallback = re.search(r"class=\"gsc_rsb_std\">(\d+)</td>", html)
    if fallback:
        return int(fallback.group(1))

    return None


def update_badge(index_path: Path, citations: int) -> bool:
    content = index_path.read_text(encoding="utf-8")
    pattern = r"(Google_Scholar-)(\d+)(_Citations)"
    match = re.search(pattern, content)
    if not match:
        raise RuntimeError("Could not find Google Scholar badge in index.html")

    current = int(match.group(2))
    if current == citations:
        return False

    updated = re.sub(pattern, rf"\g<1>{citations}\g<3>", content, count=1)
    index_path.write_text(updated, encoding="utf-8")
    return True


def main() -> int:
    print("Fetching Google Scholar citations...")
    html = fetch_scholar_html()
    if html is None:
        print("Warning: Failed to fetch citations from Google Scholar")
        print("This may happen if Google Scholar is blocking automated requests")
        print("The script will exit without updating to preserve the existing badge")
        return 1

    citations = extract_citations(html)
    if citations is None:
        print("Warning: Failed to parse citations from Google Scholar")
        print("The page layout may have changed or access is blocked")
        return 1

    index_path = Path(__file__).resolve().parent / "index.html"
    changed = update_badge(index_path, citations)
    if changed:
        print(f"Updated citation badge to {citations}.")
    else:
        print("Citation badge already up to date.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
