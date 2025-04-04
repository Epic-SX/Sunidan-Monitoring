import os
import time
import logging
import re
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import requests
from database import db
from models import SnidanSettings
from datetime import datetime  # Add this import at the top of your file

# Configure logging
logger = logging.getLogger("snidan_scraper")


def setup_driver():
    """Set up and return a Chrome WebDriver instance"""
    chrome_options = Options()
    # chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")

    chrome_options.add_argument(f"--user-data-dir=/tmp/chrome-profile-{str(hash(str(id(chrome_options))))}")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    return driver

def login_to_snidan(driver, username, password):
    """Log in to Snidan using the provided credentials"""
    try:
        logger.info("Logging in to Snidan")
        
        # Navigate to login page
        driver.get("https://snkrdunk.com/accounts/login")
        
        # Check for and close bcIntro modal if present
        try:
            WebDriverWait(driver, 13).until(
                EC.presence_of_element_located((By.ID, "buyee-bcFrame"))
            )
            iframe = driver.find_element(By.ID, "buyee-bcFrame")
            if iframe:
                driver.switch_to.frame(iframe)
                try:
                    close_button = WebDriverWait(driver, 7).until(
                        EC.element_to_be_clickable((By.CLASS_NAME, "bcIntro__closeBtn"))
                    )
                    close_button.click()
                    logger.info("Closed bcIntro modal")
                except Exception as e:
                    logger.warning(f"Error closing bcIntro modal: {str(e)}")
            driver.switch_to.default_content()
        except TimeoutException:
            logger.debug("No bcIntro modal found")
            driver.switch_to.default_content()
        except Exception as e:
            logger.warning(f"Error handling bcIntro modal: {str(e)}")
            driver.switch_to.default_content()

        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "buyee-bcCookieFrame"))
            )
            iframe = driver.find_element(By.ID, "buyee-bcCookieFrame")
            if iframe:
                driver.switch_to.frame(iframe)
                try:
                    close_button1 = WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable((By.CLASS_NAME, "bcCookiePopupBtnClose"))
                    )
                    close_button1.click()
                    logger.info("Closed bcCookie modal")
                except Exception as e:
                    logger.warning(f"Error closing bcCookie modal: {str(e)}")
            driver.switch_to.default_content()
        except TimeoutException:
            logger.debug("No bcCookie modal found")
            driver.switch_to.default_content()
        except Exception as e:
            logger.warning(f"Error handling bcCookie modal: {str(e)}")
            driver.switch_to.default_content()


        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "email"))
        )
        
        # Enter credentials
        email_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "email"))
        )
        email_field.send_keys(username)
        
        password_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "password"))
        )
        password_field.send_keys(password)
        
        # Wait for the login button to be clickable
        login_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@type='submit'][contains(text(), 'ログイン')]"))
        )
        
        # Scroll to 150px above the button
        driver.execute_script("window.scrollTo(0, arguments[0].getBoundingClientRect().top + window.scrollY - 150);", login_button)
        
        login_button.click()
        
        logger.info("Successfully logged in to Snidan")
        return True
    
    except TimeoutException:
        logger.error("Timeout while logging in to Snidan")
        return False
    
    except Exception as e:
        logger.error(f"Error logging in to Snidan: {str(e)}")
        return False

def get_product_info(driver, url, username=None, password=None):
    """Get product information from Snidan"""
    # record = SnidanSettings.query.filter_by(username=username).first()
    # # For test credentials, return mock data
    # if record and password == record.password:
    #     logger.info(f"Using mock data for test credentials")
    #     product_id = url.split('/')[-1] if '/' in url else url
    #     return {
    #         'name': 'Test Product - ' + product_id,
    #         'image_url': 'https://placehold.co/300x300',
    #         'sizes': [
    #             {'size': '26.0cm', 'price': 10000},
    #             {'size': '27.0cm', 'price': 12000},
    #             {'size': '28.0cm', 'price': 15000},
    #         ]
    #     }
    
    try:
        logger.info(f"Getting product info for URL: {url}")
        
        # Log in if credentials are provided
        # if username and password:
        #     if not login_to_snidan(driver, username, password):
        #         logger.error("Failed to log in to Snidan")
        #         return None
        
        # Navigate to product page
        driver.get(url)
        
        # Check if login button exists (not logged in)
        try:
            # Wait for login button to appear
            login_btn = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//a[contains(@class, 'login-btn') and contains(text(), 'ログイン')]"))
            )
            if login_btn:
                if username and password:
                    if not login_to_snidan(driver, username, password):
                        logger.error("Failed to log in to Snidan")
                        return None
                else:
                    logger.error("Login required but no credentials provided")
                    return None
                # Reload page after login
                driver.get(url)
        except TimeoutException:
            logger.debug("No login button found")
            # Already logged in, continue

        try:
            close_button2 = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CLASS_NAME, "fc-cta-consent"))
            )
            close_button2.click()
            logger.info("Closed fc-consent-root modal")
        except Exception as e:
            logger.warning(f"Error closing fc-consent-root modal: {str(e)}")

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "product-detail-info-table"))
        )

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".product-name-jp"))
        )

        product_name = driver.find_element(By.CSS_SELECTOR, ".product-name-jp").text.strip()
        image_url = driver.find_element(By.CSS_SELECTOR, ".product-img img").get_attribute("src")


        size_link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "a.new-buy-button"))
        )
        size_link.click()

        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "buy-size-select-box"))
            )
            size_elements = driver.find_elements(By.CSS_SELECTOR, "ul.buy-size-select-box li.list")
            size_price_info = []
            for element in size_elements:
                try:
                    # Wait for size element to be present within the current element
                    size = WebDriverWait(element, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".size-num .num"))
                    ).text.strip()
                    
                    # Wait for price element to be present within the current element
                    price_text = WebDriverWait(element, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, ".size-price"))
                    ).text.strip()
                    
                    # Check if price_text is empty or not a valid number
                    if price_text and price_text.replace('¥', '').replace(',', '').strip().isdigit():
                        price = int(price_text.replace('¥', '').replace(',', '').strip())
                    else:
                        price = 0  # Set price to 0 if not a valid number
                    size_price_info.append({'size': size, 'price': price})
                except NoSuchElementException as e:
                    logger.warning(f"Error extracting size or price: {str(e)}")
                    continue
            logger.info(f"Extracted size and price information: {size_price_info}")
        except TimeoutException:
            logger.error("Timeout while waiting for size selection box")
        except Exception as e:
            logger.error(f"Error extracting size and price information: {str(e)}")
        
        product_info = {
            'name': product_name,
            'image_url': image_url,
            'sizes': size_price_info
        }
        
        logger.info(f"Successfully retrieved product info: {product_name}")
        return product_info
    
    except TimeoutException:
        logger.error("Timeout while getting product info")
        return None
    
    except Exception as e:
        logger.error(f"Error getting product info: {str(e)}")
        return None
    

def get_current_prices(driver, product):
    """Get current prices for a product"""
    try:
        logger.info(f"Getting current prices for product: {product.name}")
        # Convert URL to Snidan API format
        url = product.url.replace('products', 'v1/sneakers') + "/size/list"
        
        # Make request to Snidan API with browser-like headers
        headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'max-age=0',
            'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            logger.error(f"Failed to get size list. Status code: {response.status_code}")
            return None

        data = response.json()
        if not data or 'data' not in data or 'minPriceOfSizeList' not in data['data']:
            logger.error("Invalid response format")
            return None

        # Process the minPriceOfSizeList into a dictionary
        size_prices = {}
        for item in data['data']['minPriceOfSizeList']:
            if item['price'] > 0:  # Only include sizes with prices
                # Calculate size using the formula
                calculated_size = 20 + (item['size'] - 12) * 0.5
                size_str = f"{calculated_size:.1f}"
                if size_str.endswith('.0'):
                    size_str = size_str[:-2]
                size_prices[f"{size_str}cm"] = item['price']

        if size_prices:
            logger.info(f"Successfully retrieved current prices for {len(size_prices)} sizes")
            return size_prices
        
        logger.warning("No prices were extracted for the product.")
        return None

    except Exception as e:
        logger.error(f"Error getting current prices: {str(e)}")
        return None