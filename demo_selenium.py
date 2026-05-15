#from selenium import webdriver
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
import time

# Launch Chrome browser
driver = webdriver.Chrome()

# Open website
driver.get("https://www.google.com")

# Maximize window
driver.maximize_window()

# Wait for 5 seconds
time.sleep(50)

# Close browser
driver.quit()
