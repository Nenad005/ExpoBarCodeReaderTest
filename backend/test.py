import requests
from bs4 import BeautifulSoup
import json

# 1. SETUP THE SESSION
# We use a session to persist cookies if needed, though here we force the cookie.
session = requests.Session()

# 2. DEFINE THE URL AND HEADERS
url = "https://nonstopfitness.upfit.cloud/reception/dashboard"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    # You might need to copy the full 'Cookie' string from your browser if PHPSESSID alone isn't enough
    "Cookie": "PHPSESSID=5oi2aae277n6qfd62pb50e6tr4" 
}

# 3. MAKE THE REQUEST
print("Fetching page...")
response = session.get(url, headers=headers)

# Check if login was successful (usually redirects to /login if failed)
if response.url != url:
    print("Warning: URL changed! You might be redirected to login page.")

# 4. PARSE DATA
soup = BeautifulSoup(response.text, 'html.parser')

print(soup.css.select_one(".page-title").find("strong").text)

# DEBUG: Save the HTML to a file so you can inspect it manually if it fails
with open("debug_page.html", "w", encoding="utf-8") as f:
    f.write(response.text)

# Example: Extracting the "Members in club" number
# You need to find the specific HTML tag that holds the number "3".
# Based on standard Bootstrap/admin themes, it might look like this:
# <div class="number">3</div> or <span data-counter="counterup" data-value="3">3</span>
# You will need to Inspect Element on the "3" in your browser to get the exact class name.

# Hypothetical example (Update 'div.desc' based on actual Inspection):
# member_count = soup.select_one("div.details .number").text.strip()
# print(f"Members in club: {member_count}")

print("Done! Check 'debug_page.html' to see if the number '3' is inside.")