from models import db, SnidanSettings
from main import app

with app.app_context():
    settings = SnidanSettings.query.first()
    if settings:
        print(f"Snidan settings found:")
        print(f"Username: {settings.username}")
        print(f"Password: {'*' * len(settings.password) if settings.password else 'Not set'}")
        print(f"Monitoring interval: {settings.monitoring_interval}")
    else:
        print("No Snidan settings found in the database.") 