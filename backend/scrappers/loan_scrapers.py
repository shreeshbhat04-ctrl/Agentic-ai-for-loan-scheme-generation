from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import json
import os

# Path to chromedriver
chromedriver_path = r'C:\Users\shree\Downloads\chromedriver-win64\chromedriver-win64\chromedriver.exe'

# Check if chromedriver exists
if not os.path.exists(chromedriver_path):
    print(f"ERROR: ChromeDriver not found at {chromedriver_path}")
    exit(1)

print(f"✓ Using ChromeDriver: {chromedriver_path}")
print("✓ Starting JanSamarth scraper...\n")

# Create data folder
os.makedirs('data', exist_ok=True)

# Setup Chrome options
chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--start-maximized')
chrome_options.add_argument('--disable-blink-features=AutomationControlled')

# Create service
service = Service(chromedriver_path)

# Create driver
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    # Navigate to website
    print("Loading website...")
    driver.get("https://www.jansamarth.in/government-of-india-schemes")
    time.sleep(5)
    
    print(f"Page title: {driver.title}\n")
    
    # Find all tabs
    tabs = driver.find_elements(By.CSS_SELECTOR, "[role='tab']")
    print(f"Found {len(tabs)} tabs\n")
    
    if not tabs:
        print("No tabs found with [role='tab'], trying alternative...")
        tabs = driver.find_elements(By.XPATH, "//button[contains(@class, 'mat-mdc-tab')]")
        print(f"Found {len(tabs)} tabs with alternative selector\n")
    
    all_schemes = []
    
    # Get tab names
    tab_names = []
    for tab in tabs:
        try:
            tab_names.append(tab.text.strip())
        except:
            tab_names.append("Unknown")
    
    print(f"Tabs: {tab_names}\n")
    
    # Click each tab and scrape
    for tab_idx, tab_name in enumerate(tab_names):
        try:
            print(f"Processing tab {tab_idx + 1}: {tab_name}")
            
            # Re-find tabs
            tabs = driver.find_elements(By.CSS_SELECTOR, "[role='tab']")
            if not tabs:
                tabs = driver.find_elements(By.XPATH, "//button[contains(@class, 'mat-mdc-tab')]")
            
            if tab_idx < len(tabs):
                tab = tabs[tab_idx]
                
                # Scroll to tab
                driver.execute_script("arguments[0].scrollIntoView(true);", tab)
                time.sleep(1)
                
                # Use JavaScript click to avoid interception
                driver.execute_script("arguments[0].click();", tab)
                print(f"  ✓ Clicked tab")
                time.sleep(4)  # Wait for content to load
                
                # Scroll to top to see cards
                driver.execute_script("window.scrollTo(0, 200);")
                time.sleep(2)
                
                # Find all cards in this tab - try multiple selectors
                cards = driver.find_elements(By.CSS_SELECTOR, "mat-card")
                
                if not cards:
                    cards = driver.find_elements(By.XPATH, "//mat-card | //*[contains(@class, 'mat-mdc-card')] | //*[contains(@class, 'card-content')]")
                
                if not cards:
                    # Look for any div that might contain scheme info
                    all_divs = driver.find_elements(By.TAG_NAME, "div")
                    cards = [d for d in all_divs if len(d.find_elements(By.CSS_SELECTOR, "h1, h2, h3")) > 0]
                
                print(f"  ✓ Found {len(cards)} cards")
                
                # Scroll and scrape all cards
                for card_idx, card in enumerate(cards):
                    try:
                        # Scroll card into view
                        driver.execute_script("arguments[0].scrollIntoView(true);", card)
                        time.sleep(1)
                        
                        # Get card text
                        card_text = card.text.strip()
                        
                        if card_text:
                            # Split into lines
                            lines = [line.strip() for line in card_text.split('\n') if line.strip()]
                            
                            # First line is usually the heading
                            heading = lines[0] if lines else "N/A"
                            
                            scheme_data = {
                                "tab": tab_name,
                                "scheme_name": heading,
                                "content": card_text,
                                "lines": lines
                            }
                            
                            all_schemes.append(scheme_data)
                            print(f"    ✓ Scraped: {heading[:60]}...")
                    
                    except Exception as e:
                        print(f"    ✗ Error scraping card {card_idx}: {str(e)}")
                        continue
        
        except Exception as e:
            print(f"✗ Error processing tab {tab_idx}: {str(e)}")
            continue
    
    # Save to JSON
    output_file = 'data/jansamarth_schemes.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_schemes, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Scraping complete!")
    print(f"✓ Total schemes scraped: {len(all_schemes)}")
    print(f"✓ Data saved to: {output_file}")

except Exception as e:
    print(f"\n✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()

finally:
    driver.quit()
    print("\n✓ Browser closed")