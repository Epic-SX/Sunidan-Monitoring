import os
import logging
import json
import requests
from linebot import LineBotApi
from linebot.models import TextSendMessage
from linebot.exceptions import LineBotApiError

# Configure logging
logger = logging.getLogger("snidan_notifier")

def send_notification(service, message, config):
    """Send notification using the specified service"""
    if service == "line":
        return send_line_notification(message, config)
    elif service == "discord":
        return send_discord_notification(message, config)
    elif service == "chatwork":
        return send_chatwork_notification(message, config)
    else:
        logger.error(f"Unknown notification service: {service}")
        return False

def send_line_notification(message, config):
    """Send notification via LINE"""
    try:
        token = config.get("token")
        user_id = config.get("user_id")
        
        if not token or not user_id:
            logger.error("LINE token or user ID not provided")
            return False
        
        line_bot_api = LineBotApi(token)
        line_bot_api.push_message(user_id, TextSendMessage(text=message))
        
        logger.info("LINE notification sent successfully")
        return True
    
    except LineBotApiError as e:
        logger.error(f"Error sending LINE notification: {str(e)}")
        return False
    
    except Exception as e:
        logger.error(f"Unexpected error sending LINE notification: {str(e)}")
        return False

def send_discord_notification(message, config):
    """Send notification via Discord webhook"""
    try:
        webhook_url = config.get("webhook_url")
        
        if not webhook_url:
            logger.error("Discord webhook URL not provided")
            return False
        
        data = {
            "content": message,
            "username": "スニダン価格監視"
        }
        
        response = requests.post(
            webhook_url,
            data=json.dumps(data),
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 204:
            logger.info("Discord notification sent successfully")
            return True
        else:
            logger.error(f"Error sending Discord notification: {response.status_code} {response.text}")
            return False
    
    except Exception as e:
        logger.error(f"Error sending Discord notification: {str(e)}")
        return False

def send_chatwork_notification(message, config):
    """Send notification via Chatwork"""
    try:
        token = config.get("token")
        room_id = config.get("room_id")
        
        if not token or not room_id:
            logger.error("Chatwork token or room ID not provided")
            return False
        
        headers = {
            "X-ChatWorkToken": token,
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "body": message
        }
        
        response = requests.post(
            f"https://api.chatwork.com/v2/rooms/{room_id}/messages",
            headers=headers,
            data=data
        )
        
        if response.status_code == 200:
            logger.info("Chatwork notification sent successfully")
            return True
        else:
            logger.error(f"Error sending Chatwork notification: {response.status_code} {response.text}")
            return False
    
    except Exception as e:
        logger.error(f"Error sending Chatwork notification: {str(e)}")
        return False 