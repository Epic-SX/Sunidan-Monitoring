import os
import logging
import sqlite3
from pathlib import Path
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("setup.log"),
    ]
)
logger = logging.getLogger("setup")

# Create data directory if it doesn't exist
data_dir = Path("backend/data")
data_dir.mkdir(exist_ok=True)

# Database file path
db_path = data_dir / "snidan_monitor.db"

# SQL to create tables
create_tables_sql = """
-- Settings table for application configuration
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT
);

-- Notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    id INTEGER PRIMARY KEY,
    line_enabled INTEGER DEFAULT 0,
    line_token TEXT,
    line_user_id TEXT,
    discord_enabled INTEGER DEFAULT 0,
    discord_webhook TEXT,
    chatwork_enabled INTEGER DEFAULT 0,
    chatwork_token TEXT,
    chatwork_room_id TEXT
);

-- Snidan account settings
CREATE TABLE IF NOT EXISTS snidan_settings (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT,
    monitoring_interval INTEGER DEFAULT 10
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_checked TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

-- Sizes table
CREATE TABLE IF NOT EXISTS sizes (
    id INTEGER PRIMARY KEY,
    product_id INTEGER,
    size TEXT NOT NULL,
    current_price INTEGER,
    previous_price INTEGER,
    lowest_price INTEGER,
    highest_price INTEGER,
    notify_below INTEGER,
    notify_above INTEGER,
    notify_on_any_change INTEGER DEFAULT 0,
    last_updated TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(product_id, size)
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY,
    size_id INTEGER,
    price INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE CASCADE
);

-- Notification history table
CREATE TABLE IF NOT EXISTS notification_history (
    id INTEGER PRIMARY KEY,
    product_id INTEGER,
    size_id INTEGER,
    old_price INTEGER,
    new_price INTEGER,
    notification_type TEXT,
    sent_to TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE CASCADE
);
"""

# Initialize default settings
default_settings = [
    ("app_name", "スニダン価格監視"),
    ("version", "1.0.0"),
    ("last_startup", ""),
]

# Initialize default notification settings
default_notification_settings = [
    (0, 0, "", "", 0, "", 0, "", "")
]

# Initialize default Snidan settings
default_snidan_settings = [
    ("", "", 10)
]

def create_env_file():
    """Create a .env file if it doesn't exist"""
    if not os.path.exists(".env"):
        logger.info("Creating .env file")
        with open(".env", "w") as f:
            f.write("# Notification Settings\n")
            f.write("# LINE\n")
            f.write("LINE_CHANNEL_ACCESS_TOKEN=\n")
            f.write("LINE_USER_ID=\n\n")
            f.write("# Discord\n")
            f.write("DISCORD_WEBHOOK_URL=\n\n")
            f.write("# Chatwork\n")
            f.write("CHATWORK_API_TOKEN=\n")
            f.write("CHATWORK_ROOM_ID=\n\n")
            f.write("# Snidan credentials\n")
            f.write("SNIDAN_USERNAME=\n")
            f.write("SNIDAN_PASSWORD=\n\n")
            f.write("# Monitoring settings\n")
            f.write("MONITORING_INTERVAL=10\n")
        logger.info(".env file created successfully")
    else:
        logger.info(".env file already exists")

def initialize_database():
    """Initialize the SQLite database with required tables and default settings."""
    logger.info("Initializing database")
    print("データベースを初期化しています...")
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create tables
    cursor.executescript(create_tables_sql)
    
    # Check if settings table is empty
    cursor.execute("SELECT COUNT(*) FROM settings")
    if cursor.fetchone()[0] == 0:
        # Insert default settings
        cursor.executemany(
            "INSERT INTO settings (key, value) VALUES (?, ?)",
            default_settings
        )
        logger.info("Default settings added")
        print("デフォルト設定を追加しました")
    
    # Check if notification_settings table is empty
    cursor.execute("SELECT COUNT(*) FROM notification_settings")
    if cursor.fetchone()[0] == 0:
        # Insert default notification settings
        cursor.executemany(
            "INSERT INTO notification_settings (id, line_enabled, line_token, line_user_id, discord_enabled, discord_webhook, chatwork_enabled, chatwork_token, chatwork_room_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            default_notification_settings
        )
        logger.info("Default notification settings added")
        print("デフォルト通知設定を追加しました")
    
    # Check if snidan_settings table is empty
    cursor.execute("SELECT COUNT(*) FROM snidan_settings")
    if cursor.fetchone()[0] == 0:
        # Insert default Snidan settings
        cursor.executemany(
            "INSERT INTO snidan_settings (username, password, monitoring_interval) VALUES (?, ?, ?)",
            default_snidan_settings
        )
        logger.info("Default Snidan settings added")
        print("デフォルトスニダン設定を追加しました")
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    logger.info("Database initialized successfully")
    print("データベースの初期化が完了しました")

def main():
    """Main setup function"""
    logger.info("Starting setup")
    
    # Load environment variables
    load_dotenv()
    
    # Create .env file if it doesn't exist
    create_env_file()
    
    # Initialize database
    initialize_database()
    
    logger.info("Setup completed successfully")

if __name__ == "__main__":
    main() 