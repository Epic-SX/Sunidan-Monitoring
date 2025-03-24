from models import db, SnidanSettings
from main import app

with app.app_context():
    # Check if settings already exist
    settings = SnidanSettings.query.first()
    
    if settings:
        print(f"Updating existing Snidan settings")
        settings.username = "test@example.com"
        settings.password = "password123"
        settings.monitoring_interval = 60
    else:
        print(f"Creating new Snidan settings")
        settings = SnidanSettings(
            username="test@example.com",
            password="password123",
            monitoring_interval=60
        )
        db.session.add(settings)
    
    db.session.commit()
    print(f"Snidan settings updated successfully:")
    print(f"Username: {settings.username}")
    print(f"Password: {'*' * len(settings.password)}")
    print(f"Monitoring interval: {settings.monitoring_interval} minutes") 