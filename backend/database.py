import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from flask_sqlalchemy import SQLAlchemy

# Create database directory if it doesn't exist
os.makedirs('data', exist_ok=True)

# Create SQLite database engine
engine = create_engine('sqlite:///data/snidan_monitor.db')
Base = declarative_base()
Session = sessionmaker(bind=engine)

# Initialize SQLAlchemy
db = SQLAlchemy()

class Product(Base):
    """Model for storing product information"""
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True)
    url = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    brand = Column(String(255))
    image_url = Column(String(255))
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    is_active = Column(Boolean, default=True)
    
    # Relationship with ProductSize
    sizes = relationship("ProductSize", back_populates="product", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}')>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'url': self.url,
            'name': self.name,
            'brand': self.brand,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active,
            'sizes': [size.to_dict() for size in self.sizes]
        }

class ProductSize(Base):
    """Model for storing product size information and price thresholds"""
    __tablename__ = 'product_sizes'
    
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    size = Column(String(50), nullable=False)
    current_price = Column(Float)
    threshold_price = Column(Float, nullable=False)
    last_notified_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationship with Product
    product = relationship("Product", back_populates="sizes")
    
    # Relationship with PriceHistory
    price_history = relationship("PriceHistory", back_populates="product_size", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ProductSize(id={self.id}, size='{self.size}', current_price={self.current_price}, threshold_price={self.threshold_price})>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'size': self.size,
            'current_price': self.current_price,
            'threshold_price': self.threshold_price,
            'last_notified_at': self.last_notified_at.isoformat() if self.last_notified_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class PriceHistory(Base):
    """Model for storing price history"""
    __tablename__ = 'price_history'
    
    id = Column(Integer, primary_key=True)
    product_size_id = Column(Integer, ForeignKey('product_sizes.id'), nullable=False)
    price = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.now)
    
    # Relationship with ProductSize
    product_size = relationship("ProductSize", back_populates="price_history")
    
    def __repr__(self):
        return f"<PriceHistory(id={self.id}, product_size_id={self.product_size_id}, price={self.price})>"

class NotificationSettings(Base):
    """Model for storing notification settings"""
    __tablename__ = 'notification_settings'
    
    id = Column(Integer, primary_key=True)
    service = Column(String(50), nullable=False)  # LINE, Discord, Chatwork
    is_active = Column(Boolean, default=True)
    settings = Column(Text)  # JSON string of settings
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    def __repr__(self):
        return f"<NotificationSettings(id={self.id}, service='{self.service}', is_active={self.is_active})>"
    
    def get_settings(self):
        """Parse JSON settings"""
        if self.settings:
            return json.loads(self.settings)
        return {}
    
    def set_settings(self, settings_dict):
        """Convert settings dict to JSON string"""
        self.settings = json.dumps(settings_dict)

def init_db():
    """Initialize the database by creating all tables"""
    Base.metadata.create_all(engine)
    
    # Create default notification settings if they don't exist
    session = Session()
    for service in ['LINE', 'Discord', 'Chatwork']:
        if not session.query(NotificationSettings).filter_by(service=service).first():
            settings = NotificationSettings(service=service, is_active=False)
            session.add(settings)
    session.commit()
    session.close()

def init_app(app):
    """Initialize the database with the Flask app"""
    db.init_app(app)

if __name__ == "__main__":
    init_db() 