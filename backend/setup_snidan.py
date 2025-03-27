from models import db, SnidanSettings
from main import app

with app.app_context():
    # Check if settings already exist
    settings = SnidanSettings.query.first()
    if settings:
        print(f"Updating existing Snidan settings")
    else:
        print(f"Creating new Snidan settings")
        settings = SnidanSettings(
            username="",
            password="",
            monitoring_interval=10
        )
        db.session.add(settings)
    
    db.session.commit()
    print(f"Snidan settings updated successfully:")
    print(f"Username: {settings.username}")
    print(f"Password: {'*' * len(settings.password)}")
    print(f"Monitoring interval: {settings.monitoring_interval} minutes") 