import os
import logging
import datetime
import threading
import time
import sqlite3
from pathlib import Path
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from dotenv import load_dotenv
from flask_cors import CORS  # Import CORS

# Import database
from database import db, init_app

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("app.log"),
    ]
)
logger = logging.getLogger("snidan_monitor")

# Create Flask app
app = Flask(__name__)
# Enable CORS for all routes with all origins
CORS(app, 
     resources={r"/*": {"origins": "*"}}, 
     supports_credentials=True,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"])

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Get the absolute path to the data directory
data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
# Create the data directory if it doesn't exist
os.makedirs(data_dir, exist_ok=True)
# Set the database URI
db_path = os.path.join(data_dir, 'snidan_monitor.db')

app.secret_key = os.urandom(24)
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize database with app
init_app(app)

# Import models (after db initialization)
from models import Product, Size, PriceHistory, NotificationHistory, Settings, NotificationSettings, SnidanSettings

# Import routes (will be defined in routes.py)
from routes import register_routes

# Import monitoring functionality (will be defined in monitor.py)
from monitor import start_monitoring, stop_monitoring

# Register routes
register_routes(app, db)

# Monitoring thread
monitoring_thread = None
stop_event = threading.Event()

def update_last_startup():
    """Update the last startup time in the database"""
    with app.app_context():
        setting = Settings.query.filter_by(key="last_startup").first()
        if setting:
            setting.value = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            db.session.commit()

# Use a function to initialize the app
def init_app_startup():
    """Initialize the app on startup"""
    update_last_startup()
    
    # Start monitoring in a separate thread
    global monitoring_thread, stop_event
    if monitoring_thread is None or not monitoring_thread.is_alive():
        stop_event.clear()
        monitoring_thread = threading.Thread(
            target=start_monitoring,
            args=(app, db, stop_event),
            daemon=True
        )
        monitoring_thread.start()
        logger.info("Monitoring thread started")

# Call the initialization function when the app starts
with app.app_context():
    init_app_startup()

@app.route('/')
def index():
    """Home page"""
    return redirect(url_for('product_list'))

if __name__ == "__main__":
    # Check if database exists, if not run setup
    if not os.path.exists("data/snidan_monitor.db"):
        logger.info("Database not found, running setup")
        import setup
        setup.initialize_database()
    
    # Start the Flask app
    logger.info("Starting Snidan Price Monitor")
    app.run(debug=True, use_reloader=False)
    
    # Stop the monitoring thread when the app is stopped
    if monitoring_thread and monitoring_thread.is_alive():
        logger.info("Stopping monitoring thread")
        stop_event.set()
        monitoring_thread.join(timeout=5)
        logger.info("Monitoring thread stopped") 