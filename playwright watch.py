from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    # Launch browser
    browser = p.chromium.launch(
        headless=False  # Opens visible browser
    )

    # Create new page
    page = browser.new_page()

    # Open Google
    page.goto("https://www.google.com")

    # Type search query
    page.fill('textarea[name="q"]', "best brand watches")

    # Press Enter
    page.keyboard.press("Enter")

    # Wait for search results
    page.wait_for_timeout(5000)

    # Keep browser open
    input("Press Enter to close browser...")

    # Close browser
    browser.close()