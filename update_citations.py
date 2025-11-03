#!/usr/bin/env python3

import re
import sys
import json
from pathlib import Path
import requests

# Try to import BeautifulSoup (optional, only used when needed)
try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False
    print("Warning: beautifulsoup4 not available, will use API only")

# Google Scholar User ID
SCHOLAR_USER_ID = 'vzCZaIwAAAAJ'
SCHOLAR_URL = f'https://scholar.google.com/citations?user={SCHOLAR_USER_ID}&hl=en'

def get_citations_from_api():
    """Try to use the public API service to get the citation count"""
    # Try multiple API services
    api_services = [
        f'https://scholar-badge.vercel.app/api/scholar?user={SCHOLAR_USER_ID}',
        # Can add more API services
    ]
    
    for api_url in api_services:
        try:
            response = requests.get(api_url, timeout=10)
            if response.ok:
                data = response.json()
                citations = data.get('citations') or data.get('count') or data.get('totalCitations') or data.get('citation_count')
                if citations:
                    return int(citations)
        except:
            continue
    return None

def get_citations():
    """Get the citation count from the Google Scholar page"""
    # First try to use the API (no extra dependencies needed)
    api_result = get_citations_from_api()
    if api_result:
        print(f"Using API service to get citations: {api_result}")
        return api_result
    
    print("API service not available")
    
    # If the API is not available and BeautifulSoup is installed, try to scrape the page directly
    if not HAS_BS4:
        print("BeautifulSoup not available, cannot scrape page directly")
        print("Please install: pip install beautifulsoup4 requests lxml")
        return None
    
    # If the API is not available, try to scrape the page directly
    try:
        # Set the request headers, simulate browser access
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
        
        session = requests.Session()
        response = session.get(SCHOLAR_URL, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Debug: Save the page content for inspection
        debug = True  # Set to True to view the page content
        
        if debug:
            with open('scholar_page_debug.html', 'w', encoding='utf-8') as f:
                f.write(response.text)
            print("Saved page content to scholar_page_debug.html")
        
        # Method 1: Find the table with id="gsc_rsb_st" (the most common statistics table)
        stats_table = soup.find('table', {'id': 'gsc_rsb_st'})
        if stats_table:
            rows = stats_table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 2:
                    label = cells[0].get_text(strip=True)
                    if 'Cited by' in label or 'Citations' in label:
                        value_text = cells[1].get_text(strip=True)
                        # Extract numbers (handle thousands separator)
                        numbers = re.findall(r'\d+', value_text.replace(',', '').replace('.', ''))
                        if numbers:
                            return int(numbers[0])
        
        # Method 2: Find all div or span related to "gsc_rsb_st"
        stat_elements = soup.find_all(['div', 'span'], string=re.compile(r'Cited by|Citations|被引用', re.IGNORECASE))
        for elem in stat_elements:
            # Find the adjacent numbers
            parent = elem.parent
            if parent:
                text = parent.get_text()
                # Try to match "Cited by 123" or similar format
                match = re.search(r'(?:Cited by|Citations)[:\s]*(\d+(?:[,\.]\d+)*)', text, re.IGNORECASE)
                if match:
                    number_str = match.group(1).replace(',', '').replace('.', '')
                    if number_str.isdigit():
                        return int(number_str)
        
        # Method 3: Find elements with class "gsc_a_c" or "gsc_rsb" (可能是总引用数)
        citation_elements = soup.find_all(['div', 'td', 'span'], class_=re.compile(r'gsc_a_c|gsc_rsb'))
        for elem in citation_elements:
            text = elem.get_text(strip=True)
            # If the text looks like a number
            match = re.search(r'^(\d+(?:[,\.]\d+)*)$', text)
            if match:
                number_str = match.group(1).replace(',', '').replace('.', '')
                if number_str.isdigit():
                    num = int(number_str)
                    # If the number looks reasonable (greater than 0 and less than 1000000)
                    if 0 < num < 1000000:
                        return num
        
        # Method 4: Search the entire page text
        page_text = soup.get_text()
        # Try multiple patterns
        patterns = [
            r'Cited by[:\s]+(\d+(?:[,\.]\d+)*)',
            r'Citations[:\s]+(\d+(?:[,\.]\d+)*)',
            r'Total citations[:\s]+(\d+(?:[,\.]\d+)*)',
            r'"citedByCount":(\d+)',  # JSON data
        ]
        
        for pattern in patterns:
            match = re.search(pattern, page_text, re.IGNORECASE)
            if match:
                number_str = match.group(1).replace(',', '').replace('.', '')
                if number_str.isdigit():
                    num = int(number_str)
                    if 0 < num < 1000000:
                        return num
        
        # Method 5: Find JSON data in script tags
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string:
                # Find "citedByCount" in JSON
                match = re.search(r'"citedByCount":\s*(\d+)', script.string)
                if match:
                    return int(match.group(1))
        
        print("Warning: Could not find citation count in Google Scholar page")
        print("Tried multiple methods but couldn't extract the number")
        print("You may need to check the page structure or use a different method")
        
        # If debug mode is enabled, save the page for inspection
        if debug:
            print(f"Page saved to scholar_page_debug.html")
            print("You can inspect it to see the actual page structure")
        
        return None
        
    except requests.RequestException as e:
        print(f"Error fetching Google Scholar page: {e}")
        return None
    except Exception as e:
        print(f"Error parsing citation count: {e}")
        return None

def update_html(citations):
    """Update the citation count in the index.html file"""
    html_file = Path(__file__).parent / 'index.html'
    
    if not html_file.exists():
        print(f"Error: {html_file} not found")
        return False
    
    try:
        # 读取 HTML 文件
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Format the citation count (add thousands separator)
        formatted_citations = f"{citations:,}" if citations else "N/A"
        
        # Update the badge URL
        # Method 1: Find the img tag containing "scholar-citations-badge"
        pattern1 = r'(<img[^>]*id=["\']scholar-citations-badge["\'][^>]*src=["\'])([^"\']+)(["\'])'
        
        def replace_badge1(match):
            badge_url = f"https://img.shields.io/badge/Google_Scholar-{formatted_citations}_Citations-blue?logo=google+scholar"
            return f"{match.group(1)}{badge_url}{match.group(3)}"
        
        new_content = re.sub(pattern1, replace_badge1, content)
        
        # Method 2: If not found, find the badge URL containing "Google_Scholar"
        if new_content == content:
            pattern2 = r'(src=["\']https://img\.shields\.io/badge/Google_Scholar-)([^"\']+)(-blue\?logo=google\+scholar["\'])'
            def replace_badge2(match):
                return f"{match.group(1)}{formatted_citations}_Citations{match.group(3)}"
            new_content = re.sub(pattern2, replace_badge2, content)
        
        # Method 3: If still not found, find any link containing "Google_Scholar" and "scholar.google.com"
        if new_content == content:
            pattern3 = r'(<a[^>]*href=["\']https://scholar\.google\.com/citations\?user=vzCZaIwAAAAJ[^"\']*["\'][^>]*><img[^>]*src=["\']https://img\.shields\.io/badge/Google_Scholar-)([^"\']+)(-blue\?logo=google\+scholar["\'])'
            def replace_badge3(match):
                return f"{match.group(1)}{formatted_citations}_Citations{match.group(3)}"
            new_content = re.sub(pattern3, replace_badge3, content)
        
        # If the content has changed, write to the file
        if new_content != content:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Successfully updated citations to {formatted_citations}")
            return True
        else:
            print(f"Citations already up to date: {formatted_citations}")
            return False
            
    except Exception as e:
        print(f"Error updating HTML file: {e}")
        return False

def main():
    print("Fetching Google Scholar citations...")
    citations = get_citations()
    
    if citations is None:
        print("\n" + "="*60)
        print("Failed to fetch citations automatically")
        print("="*60)
        print("\nAlternative options:")
        print("1. Manually update the badge URL in index.html")
        print("2. Check if Google Scholar page structure changed")
        print("3. Try running again later")
        print("\nManual update format:")
        print('  <img src="https://img.shields.io/badge/Google_Scholar-你的引用次数_Citations-blue?logo=google+scholar">')
        print("\nExample:")
        print('  <img src="https://img.shields.io/badge/Google_Scholar-123_Citations-blue?logo=google+scholar">')
        sys.exit(1)
    
    print(f"Found {citations} citations")
    success = update_html(citations)
    
    if success:
        print("HTML file updated successfully")
        print(f"Badge URL updated to show {citations:,} citations")
    else:
        print("No changes needed or update failed")
    
    sys.exit(0 if citations is not None else 1)

if __name__ == '__main__':
    main()

