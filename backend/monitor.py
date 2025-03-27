import os
import time
import logging
import datetime
import threading
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from models import Product, Size, PriceHistory, NotificationHistory, SnidanSettings, NotificationSettings
from scraper import setup_driver, login_to_snidan, get_current_prices
from notifier import send_notification

# Configure logging
logger = logging.getLogger("snidan_monitor")

def start_monitoring(app, db, stop_event):
    """Start the monitoring process in a separate thread"""
    logger.info("Starting monitoring process")
    
    with app.app_context():
        # Get Snidan settings
        snidan_settings = SnidanSettings.query.first()
        if not snidan_settings or not snidan_settings.username or not snidan_settings.password:
            logger.error("Snidan settings not configured")
            return
        
        # Get monitoring interval
        monitoring_interval = snidan_settings.monitoring_interval
        if monitoring_interval < 5:
            logger.warning("Monitoring interval too short, setting to 5 seconds")
            monitoring_interval = 5
        
        # Set up Chrome WebDriver
        driver = None
        
        try:
            driver = setup_driver()
            
            # Log in to Snidan
            if not login_to_snidan(driver, snidan_settings.username, snidan_settings.password):
                logger.error("Failed to log in to Snidan")
                return
            
            # Main monitoring loop
            while not stop_event.is_set():
                try:
                    # Get active products
                    products = Product.query.filter_by(is_active=True).all()
                    logger.info(f"Monitoring {len(products)} active products")
                    for product in products:
                        if stop_event.is_set():
                            break
                        
                        try:
                            # Get current prices
                            current_prices = get_current_prices(driver, product)
                            
                            if not current_prices:
                                logger.warning(f"No prices found for product: {product.name}")
                                continue
                            
                            # Update product last checked time
                            product.last_checked = datetime.datetime.now()
                            db.session.commit()
                            
                            # Check each size
                            sizes = Size.query.filter_by(product_id=product.id).all()
                            for size in sizes:
                                if size.size in current_prices:
                                    current_price = current_prices[size.size]
                                    
                                    # Check if price has changed
                                    if size.current_price != current_price:
                                        logger.info(f"Price changed for {product.name} size {size.size}: {size.current_price} -> {current_price}")
                                        
                                        # Update price history
                                        price_history = PriceHistory(
                                            size_id=size.id,
                                            price=current_price,
                                            timestamp=datetime.datetime.now()
                                        )
                                        db.session.add(price_history)
                                        
                                        # Update size information
                                        old_price = size.current_price
                                        size.previous_price = old_price
                                        size.current_price = current_price
                                        
                                        # Update lowest/highest price
                                        if size.lowest_price is None or current_price < size.lowest_price:
                                            size.lowest_price = current_price
                                        if size.highest_price is None or current_price > size.highest_price:
                                            size.highest_price = current_price
                                        
                                        size.last_updated = datetime.datetime.now()
                                        db.session.commit()
                                        
                                        # Check notification conditions
                                        notification_sent = False
                                        
                                        # Notify on any change
                                        if size.notify_on_any_change:
                                            logger.info(f"Sending notification for any change: {product.name} size {size.size}")
                                            send_price_change_notification(db, product, size, old_price, current_price, "change")
                                            notification_sent = True
                                        
                                        # Notify if price drops below threshold
                                        elif size.notify_below and current_price <= size.notify_below and old_price > size.notify_below:
                                            logger.info(f"Sending notification for price below threshold: {product.name} size {size.size}")
                                            send_price_change_notification(db, product, size, old_price, current_price, "below")
                                            notification_sent = True
                                        
                                        # Notify if price rises above threshold
                                        elif size.notify_above and current_price >= size.notify_above and old_price < size.notify_above:
                                            logger.info(f"Sending notification for price above threshold: {product.name} size {size.size}")
                                            send_price_change_notification(db, product, size, old_price, current_price, "above")
                                            notification_sent = True
                                        
                                        if not notification_sent:
                                            logger.info(f"No notification conditions met for {product.name} size {size.size}")
                        
                        except Exception as e:
                            logger.error(f"Error monitoring product {product.name}: {str(e)}")
                            continue
                    
                    # Sleep for the monitoring interval
                    logger.info(f"Sleeping for {monitoring_interval} seconds")
                    for _ in range(1):
                        if stop_event.is_set():
                            break
                        time.sleep(1)
                
                except Exception as e:
                    logger.error(f"Error in monitoring loop: {str(e)}")
                    time.sleep(1)
        
        except Exception as e:
            logger.error(f"Error in monitoring process: {str(e)}")
        
        finally:
            if driver:
                driver.quit()
            logger.info("Monitoring process stopped")

def send_price_change_notification(db, product, size, old_price, new_price, notification_type):
    """Send notification for price change"""
    try:
        # Get notification settings
        notification_settings = NotificationSettings.query.first()
        if not notification_settings:
            logger.error("Notification settings not found")
            return
        
        # Prepare notification message
        message = f"価格変動通知: {product.name}\n"
        message += f"サイズ: {size.size}\n"
        message += f"旧価格: ¥{old_price:,}\n"
        message += f"新価格: ¥{new_price:,}\n"
        
        price_diff = new_price - old_price
        if price_diff < 0:
            message += f"差額: ¥{abs(price_diff):,} 値下がり\n"
        else:
            message += f"差額: ¥{price_diff:,} 値上がり\n"
        
        message += f"商品URL: {product.url}"
        
        # Send notifications based on enabled services
        notification_services = []
        
        if notification_settings.line_enabled and notification_settings.line_token and notification_settings.line_user_id:
            logger.info("Sending LINE notification")
            success = send_notification(
                "line",
                message,
                {
                    "token": notification_settings.line_token,
                    "user_id": notification_settings.line_user_id
                }
            )
            if success:
                notification_services.append("line")
        
        if notification_settings.discord_enabled and notification_settings.discord_webhook:
            logger.info("Sending Discord notification")
            success = send_notification(
                "discord",
                message,
                {
                    "webhook_url": notification_settings.discord_webhook
                }
            )
            if success:
                notification_services.append("discord")
        
        if notification_settings.chatwork_enabled and notification_settings.chatwork_token and notification_settings.chatwork_room_id:
            logger.info("Sending Chatwork notification")
            success = send_notification(
                "chatwork",
                message,
                {
                    "token": notification_settings.chatwork_token,
                    "room_id": notification_settings.chatwork_room_id
                }
            )
            if success:
                notification_services.append("chatwork")
        
        # Record notification in history
        for service in notification_services:
            notification_history = NotificationHistory(
                product_id=product.id,
                size_id=size.id,
                old_price=old_price,
                new_price=new_price,
                notification_type=notification_type,
                sent_to=service,
                timestamp=datetime.datetime.now()
            )
            db.session.add(notification_history)
        
        db.session.commit()
        logger.info(f"Notification sent to {', '.join(notification_services)}")
    
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")

def stop_monitoring(stop_event):
    """Stop the monitoring process"""
    logger.info("Stopping monitoring process")
    stop_event.set() 