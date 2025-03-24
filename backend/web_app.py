import os
import json
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
from dotenv import load_dotenv

from database import Session, Product, ProductSize, NotificationSettings, init_db
from monitor import SnidanMonitor

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.urandom(24)

# Initialize database
init_db()

# Initialize monitor
monitor = SnidanMonitor()

@app.route('/')
def index():
    """Render the main dashboard"""
    session = Session()
    products = session.query(Product).all()
    notification_settings = session.query(NotificationSettings).all()
    session.close()
    
    return render_template(
        'index.html',
        products=products,
        notification_settings=notification_settings,
        monitoring_status=monitor.scheduler_thread is not None and monitor.scheduler_thread.is_alive()
    )

@app.route('/products')
def products():
    """Render the products page"""
    session = Session()
    products = session.query(Product).all()
    session.close()
    
    return render_template('products.html', products=products)

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    """Render the product detail page"""
    session = Session()
    product = session.query(Product).filter_by(id=product_id).first()
    session.close()
    
    if not product:
        flash('Product not found', 'error')
        return redirect(url_for('products'))
    
    return render_template('product_detail.html', product=product)

@app.route('/add_product', methods=['GET', 'POST'])
def add_product():
    """Add a new product"""
    if request.method == 'POST':
        url = request.form.get('url')
        
        if not url:
            flash('URL is required', 'error')
            return redirect(url_for('add_product'))
        
        # Add product
        product = monitor.add_product(url)
        
        if product:
            flash('Product added successfully', 'success')
            return redirect(url_for('product_detail', product_id=product.id))
        else:
            flash('Failed to add product', 'error')
            return redirect(url_for('add_product'))
    
    return render_template('add_product.html')

@app.route('/update_thresholds/<int:product_id>', methods=['POST'])
def update_thresholds(product_id):
    """Update threshold prices for a product"""
    # Get form data
    sizes_thresholds = {}
    for key, value in request.form.items():
        if key.startswith('threshold_') and value:
            size = key.replace('threshold_', '')
            try:
                threshold_price = float(value)
                sizes_thresholds[size] = threshold_price
            except ValueError:
                flash(f'Invalid threshold price for size {size}', 'error')
                return redirect(url_for('product_detail', product_id=product_id))
    
    # Update thresholds
    if monitor.update_product_thresholds(product_id, sizes_thresholds):
        flash('Thresholds updated successfully', 'success')
    else:
        flash('Failed to update thresholds', 'error')
    
    return redirect(url_for('product_detail', product_id=product_id))

@app.route('/delete_product/<int:product_id>', methods=['POST'])
def delete_product(product_id):
    """Delete a product"""
    if monitor.delete_product(product_id):
        flash('Product deleted successfully', 'success')
    else:
        flash('Failed to delete product', 'error')
    
    return redirect(url_for('products'))

@app.route('/toggle_product/<int:product_id>', methods=['POST'])
def toggle_product(product_id):
    """Toggle product active status"""
    session = Session()
    product = session.query(Product).filter_by(id=product_id).first()
    
    if product:
        product.is_active = not product.is_active
        session.commit()
        flash(f'Product {"activated" if product.is_active else "deactivated"} successfully', 'success')
    else:
        flash('Product not found', 'error')
    
    session.close()
    return redirect(url_for('products'))

@app.route('/notification_settings', methods=['GET', 'POST'])
def notification_settings():
    """Manage notification settings"""
    session = Session()
    
    if request.method == 'POST':
        # Update LINE settings
        line_settings = session.query(NotificationSettings).filter_by(service='LINE').first()
        line_settings.is_active = 'line_active' in request.form
        line_settings.set_settings({
            'channel_access_token': request.form.get('line_channel_access_token', ''),
            'user_id': request.form.get('line_user_id', '')
        })
        
        # Update Discord settings
        discord_settings = session.query(NotificationSettings).filter_by(service='Discord').first()
        discord_settings.is_active = 'discord_active' in request.form
        discord_settings.set_settings({
            'webhook_url': request.form.get('discord_webhook_url', '')
        })
        
        # Update Chatwork settings
        chatwork_settings = session.query(NotificationSettings).filter_by(service='Chatwork').first()
        chatwork_settings.is_active = 'chatwork_active' in request.form
        chatwork_settings.set_settings({
            'api_token': request.form.get('chatwork_api_token', ''),
            'room_id': request.form.get('chatwork_room_id', '')
        })
        
        session.commit()
        flash('Notification settings updated successfully', 'success')
        
        # Update environment variables
        with open('.env', 'w') as f:
            f.write(f"# Notification Settings\n")
            
            # LINE
            line_settings_dict = line_settings.get_settings()
            f.write(f"LINE_CHANNEL_ACCESS_TOKEN={line_settings_dict.get('channel_access_token', '')}\n")
            f.write(f"LINE_USER_ID={line_settings_dict.get('user_id', '')}\n\n")
            
            # Discord
            discord_settings_dict = discord_settings.get_settings()
            f.write(f"DISCORD_WEBHOOK_URL={discord_settings_dict.get('webhook_url', '')}\n\n")
            
            # Chatwork
            chatwork_settings_dict = chatwork_settings.get_settings()
            f.write(f"CHATWORK_API_TOKEN={chatwork_settings_dict.get('api_token', '')}\n")
            f.write(f"CHATWORK_ROOM_ID={chatwork_settings_dict.get('room_id', '')}\n\n")
            
            # Snidan credentials
            f.write(f"# Snidan credentials\n")
            f.write(f"SNIDAN_USERNAME={os.getenv('SNIDAN_USERNAME', '')}\n")
            f.write(f"SNIDAN_PASSWORD={os.getenv('SNIDAN_PASSWORD', '')}\n\n")
            
            # Monitoring settings
            f.write(f"# Monitoring settings\n")
            f.write(f"MONITORING_INTERVAL={os.getenv('MONITORING_INTERVAL', '10')}\n")
        
        # Reload environment variables
        load_dotenv()
    
    notification_settings = session.query(NotificationSettings).all()
    session.close()
    
    return render_template('notification_settings.html', notification_settings=notification_settings)

@app.route('/snidan_settings', methods=['GET', 'POST'])
def snidan_settings():
    """Manage Snidan settings"""
    if request.method == 'POST':
        username = request.form.get('username', '')
        password = request.form.get('password', '')
        monitoring_interval = request.form.get('monitoring_interval', '10')
        
        # Update environment variables
        with open('.env', 'r') as f:
            env_lines = f.readlines()
        
        with open('.env', 'w') as f:
            for line in env_lines:
                if line.startswith('SNIDAN_USERNAME='):
                    f.write(f"SNIDAN_USERNAME={username}\n")
                elif line.startswith('SNIDAN_PASSWORD='):
                    f.write(f"SNIDAN_PASSWORD={password}\n")
                elif line.startswith('MONITORING_INTERVAL='):
                    f.write(f"MONITORING_INTERVAL={monitoring_interval}\n")
                else:
                    f.write(line)
        
        # Reload environment variables
        load_dotenv()
        
        # Update monitor settings
        monitor.username = username
        monitor.password = password
        monitor.monitoring_interval = int(monitoring_interval)
        
        flash('Snidan settings updated successfully', 'success')
    
    return render_template(
        'snidan_settings.html',
        username=os.getenv('SNIDAN_USERNAME', ''),
        password=os.getenv('SNIDAN_PASSWORD', ''),
        monitoring_interval=os.getenv('MONITORING_INTERVAL', '10')
    )

@app.route('/start_monitoring', methods=['POST'])
def start_monitoring():
    """Start monitoring"""
    if monitor.start_monitoring():
        flash('Monitoring started successfully', 'success')
    else:
        flash('Failed to start monitoring', 'error')
    
    return redirect(url_for('index'))

@app.route('/stop_monitoring', methods=['POST'])
def stop_monitoring():
    """Stop monitoring"""
    monitor.stop_monitoring()
    flash('Monitoring stopped successfully', 'success')
    
    return redirect(url_for('index'))

@app.route('/api/products', methods=['GET'])
def api_products():
    """API endpoint for getting all products"""
    products = monitor.get_all_products()
    return jsonify([product.to_dict() for product in products])

@app.route('/api/product/<int:product_id>', methods=['GET'])
def api_product(product_id):
    """API endpoint for getting a product"""
    product = monitor.get_product(product_id)
    
    if product:
        return jsonify(product.to_dict())
    else:
        return jsonify({'error': 'Product not found'}), 404

if __name__ == '__main__':
    app.run(debug=True) 