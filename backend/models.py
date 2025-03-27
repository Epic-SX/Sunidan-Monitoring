import datetime
from database import db

class Settings(db.Model):
    """Application settings"""
    __tablename__ = 'settings'
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(50), unique=True, nullable=False)
    value = db.Column(db.String(255))
    
    def __repr__(self):
        return f"<Setting {self.key}={self.value}>"
        
    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'value': self.value
        }

class NotificationSettings(db.Model):
    """Notification settings"""
    __tablename__ = 'notification_settings'
    id = db.Column(db.Integer, primary_key=True)
    line_enabled = db.Column(db.Boolean, default=False)
    line_token = db.Column(db.String(255))
    line_user_id = db.Column(db.String(255))
    discord_enabled = db.Column(db.Boolean, default=False)
    discord_webhook = db.Column(db.String(255))
    chatwork_enabled = db.Column(db.Boolean, default=False)
    chatwork_token = db.Column(db.String(255))
    chatwork_room_id = db.Column(db.String(255))
    
    def __repr__(self):
        return f"<NotificationSettings id={self.id}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'line_enabled': self.line_enabled,
            'line_token': self.line_token,
            'line_user_id': self.line_user_id,
            'discord_enabled': self.discord_enabled,
            'discord_webhook': self.discord_webhook,
            'chatwork_enabled': self.chatwork_enabled,
            'chatwork_token': self.chatwork_token,
            'chatwork_room_id': self.chatwork_room_id
        }

class SnidanSettings(db.Model):
    """Snidan account settings"""
    __tablename__ = 'snidan_settings'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255))
    password = db.Column(db.String(255))
    monitoring_interval = db.Column(db.Integer, default=10)
    
    def __repr__(self):
        return f"<SnidanSettings id={self.id}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'password': self.password,
            'monitoring_interval': self.monitoring_interval
        }
    
    @classmethod
    def create_default_settings(cls):
        """Create default Snidan settings if they do not exist."""
        if not cls.query.first():
            default_settings = cls(username='default_user', password='default_pass', monitoring_interval=10)
            db.session.add(default_settings)
            db.session.commit()

class Product(db.Model):
    """Product model"""
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(255), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(255))
    added_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    last_checked = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    sizes = db.relationship('Size', backref='product', lazy=True, cascade="all, delete-orphan")
    notifications = db.relationship('NotificationHistory', backref='product', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Product {self.name}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'url': self.url,
            'name': self.name,
            'image_url': self.image_url,
            'added_at': self.added_at.isoformat() if self.added_at else None,
            'last_checked': self.last_checked.isoformat() if self.last_checked else None,
            'is_active': self.is_active,
            'sizes': [size.to_dict() for size in self.sizes]
        }

class Size(db.Model):
    """Size model for products"""
    __tablename__ = 'sizes'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    size = db.Column(db.String(50), nullable=False)
    current_price = db.Column(db.Integer)
    previous_price = db.Column(db.Integer)
    lowest_price = db.Column(db.Integer)
    highest_price = db.Column(db.Integer)
    notify_below = db.Column(db.Integer)
    notify_above = db.Column(db.Integer)
    notify_on_any_change = db.Column(db.Boolean, default=False)
    last_updated = db.Column(db.DateTime)
    
    # Relationships
    price_history = db.relationship('PriceHistory', backref='size', lazy=True, cascade="all, delete-orphan")
    notifications = db.relationship('NotificationHistory', backref='size', lazy=True, cascade="all, delete-orphan")
    
    __table_args__ = (db.UniqueConstraint('product_id', 'size', name='_product_size_uc'),)
    
    def __repr__(self):
        return f"<Size {self.size} for Product {self.product_id}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'size': self.size,
            'current_price': self.current_price,
            'previous_price': self.previous_price,
            'lowest_price': self.lowest_price,
            'highest_price': self.highest_price,
            'notify_below': self.notify_below,
            'notify_above': self.notify_above,
            'notify_on_any_change': self.notify_on_any_change,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }

class PriceHistory(db.Model):
    """Price history for product sizes"""
    __tablename__ = 'price_history'
    id = db.Column(db.Integer, primary_key=True)
    size_id = db.Column(db.Integer, db.ForeignKey('sizes.id'), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def __repr__(self):
        return f"<PriceHistory {self.price} for Size {self.size_id}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'size_id': self.size_id,
            'price': self.price,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class NotificationHistory(db.Model):
    """Notification history"""
    __tablename__ = 'notification_history'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    size_id = db.Column(db.Integer, db.ForeignKey('sizes.id'), nullable=False)
    old_price = db.Column(db.Integer)
    new_price = db.Column(db.Integer)
    notification_type = db.Column(db.String(50))  # 'below', 'above', 'change'
    sent_to = db.Column(db.String(50))  # 'line', 'discord', 'chatwork'
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def __repr__(self):
        return f"<NotificationHistory {self.notification_type} for Product {self.product_id}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'size_id': self.size_id,
            'old_price': self.old_price,
            'new_price': self.new_price,
            'notification_type': self.notification_type,
            'sent_to': self.sent_to,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        } 