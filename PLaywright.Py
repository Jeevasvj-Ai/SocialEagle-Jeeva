from playwright.async_api import async_playwright
import asyncio
async def playwright():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        #navigation to google
        await page.goto('https://www.google.com')
        await page.wait_for_timeout(5000)
        #await page.screenshot(path='screenshot.png')
        await browser.close()
# CSS selector
        




if __name__ == "__main__":
            
    asyncio.run(playwright())