from flask import Flask 
from playwright.sync_api import sync_playwright

app = Flask(__name__)


@app.route("/search", methods=["GET"])
def google_search():
    try:
        with sync_playwright() as p:
            # Launch browser
            browser = p.chromium.launch(
                headless=False
            )

            # Create new page
            page = browser.new_page()

            # Open Google
            page.goto("https://www.google.com")

            # Type search query
            page.fill('textarea[name="q"]', "best brand watches")

            # Press Enter
            page.keyboard.press("Enter")

            # Wait for results
            page.wait_for_timeout(5000)

            # Optional: Get page title
            title = page.title()

            # Close browser
            browser.close()

            return jsonify({
                "status": "success",
                "message": "Search completed",
                "page_title": title
            })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })


if __name__ == "__main__":
    app.run(debug=True)