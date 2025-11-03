#!/usr/bin/env python3

import re
import sys
import time
from pathlib import Path
from bs4 import BeautifulSoup
import requests

SCHOLAR_USER_ID = 'vzCZaIwAAAAJ'
SCHOLAR_URL = f'https://scholar.google.com/citations?user={SCHOLAR_USER_ID}&hl=en'

def get_citations():
    """Get citation count from Google Scholar page"""
    try:
        session = requests.Session()
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
        }
        
        # Try direct access first
        response = session.get(SCHOLAR_URL, headers=headers, timeout=15, allow_redirects=True)
        
        # If 403, try accessing main page first to establish session
        if response.status_code == 403:
            print("403 Forbidden detected, trying to establish session...")
            session.get('https://scholar.google.com', headers=headers, timeout=15)
            time.sleep(2)
            response = session.get(SCHOLAR_URL, headers=headers, timeout=15, allow_redirects=True)
        
        if response.status_code == 403:
            print("Error: 403 Forbidden - Google Scholar is blocking automated requests")
            print("This is common with GitHub Actions due to IP-based restrictions")
            return None
            
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Method 1: Find table with id="gsc_rsb_st"
        stats_table = soup.find('table', {'id': 'gsc_rsb_st'})
        if stats_table:
            rows = stats_table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 2:
                    label = cells[0].get_text(strip=True)
                    if 'Cited by' in label or '被引用次数' in label or 'Citations' in label:
                        value_text = cells[1].get_text(strip=True)
                        numbers = re.findall(r'\d+', value_text.replace(',', '').replace('.', ''))
                        if numbers:
                            return int(numbers[0])
        
        # Method 2: Search in page text
        page_text = soup.get_text()
        patterns = [
            r'Cited by[:\s]+(\d+(?:[,\.]\d+)*)',
            r'Citations[:\s]+(\d+(?:[,\.]\d+)*)',
            r'"citedByCount":(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, page_text, re.IGNORECASE)
            if match:
                number_str = match.group(1).replace(',', '').replace('.', '')
                if number_str.isdigit():
                    num = int(number_str)
                    if 0 < num < 1000000:
                        return num
        
        # Method 3: Find JSON data in script tags
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string:
                match = re.search(r'"citedByCount":\s*(\d+)', script.string)
                if match:
                    return int(match.group(1))
        
        return None
        
    except Exception as e:
        print(f"Error: {e}")
        return None

def update_html(citations):
    """Update citation count in index.html"""
    html_file = Path(__file__).parent / 'index.html'
    
    if not html_file.exists():
        print(f"Error: {html_file} not found")
        return False
    
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        formatted_citations = f"{citations:,}" if citations else "N/A"
        
        # Update badge URL
        pattern = r'(<img[^>]*id=["\']scholar-citations-badge["\'][^>]*src=["\'])([^"\']+)(["\'])'
        
        def replace_badge(match):
            badge_url = f"https://img.shields.io/badge/Google_Scholar-{formatted_citations}_Citations-blue?logo=google+scholar"
            return f"{match.group(1)}{badge_url}{match.group(3)}"
        
        new_content = re.sub(pattern, replace_badge, content)
        
        # If not found, try another pattern
        if new_content == content:
            pattern2 = r'(src=["\']https://img\.shields\.io/badge/Google_Scholar-)([^"\']+)(-blue\?logo=google\+scholar["\'])'
            def replace_badge2(match):
                return f"{match.group(1)}{formatted_citations}_Citations{match.group(3)}"
            new_content = re.sub(pattern2, replace_badge2, content)
        
        if new_content != content:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated citations to {formatted_citations}")
            return True
        else:
            print(f"Citations already up to date: {formatted_citations}")
            return False
            
    except Exception as e:
        print(f"Error updating HTML: {e}")
        return False

def main():
    print("Fetching Google Scholar citations...")
    citations = get_citations()
    
    if citations is None:
        print("Warning: Failed to fetch citations from Google Scholar")
        print("This may happen if Google Scholar is blocking automated requests")
        print("The script will exit without updating to preserve the existing badge")
        sys.exit(0)  # Exit with 0 to not fail the workflow
    
    print(f"Found {citations} citations")
    success = update_html(citations)
    
    if success:
        print("HTML file updated successfully")
    else:
        print("No changes needed")
    
    sys.exit(0)

if __name__ == '__main__':
    main()
