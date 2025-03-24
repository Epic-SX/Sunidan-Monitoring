import os
import datetime
import json
from flask import render_template, request, redirect, url_for, flash, jsonify
from models import Product, Size, PriceHistory, NotificationHistory, Settings, NotificationSettings, SnidanSettings
from scraper import get_product_info
import logging

logger = logging.getLogger(__name__)

def register_routes(app, db):
    """Register all routes with the Flask app"""
    
    # Add a route handler for OPTIONS requests to handle preflight requests
    @app.route('/api/<path:path>', methods=['OPTIONS'])
    def handle_options(path):
        return '', 200
    
    @app.route('/products')
    def product_list():
        """Product list page"""
        products = Product.query.all()
        return render_template('product_list.html', products=products)
    
    @app.route('/products/add', methods=['GET', 'POST'])
    def add_product():
        """Add product page"""
        if request.method == 'POST':
            url = request.form.get('url')
            
            # Check if product already exists
            existing_product = Product.query.filter_by(url=url).first()
            if existing_product:
                flash('この商品は既に追加されています', 'warning')
                return redirect(url_for('product_list'))
            
            try:
                # Get product info from Snidan
                product_info = get_product_info(url)
                
                if not product_info:
                    flash('商品情報の取得に失敗しました。URLが正しいか、スニダンにログインしているか確認してください。', 'danger')
                    return redirect(url_for('add_product'))
                
                # Create new product
                product = Product(
                    url=url,
                    name=product_info['name'],
                    image_url=product_info['image_url'],
                    added_at=datetime.datetime.now(),
                    is_active=True
                )
                db.session.add(product)
                db.session.flush()  # Get product ID
                
                # Add sizes
                for size_info in product_info['sizes']:
                    size = Size(
                        product_id=product.id,
                        size=size_info['size'],
                        current_price=size_info['price'],
                        previous_price=size_info['price'],
                        lowest_price=size_info['price'],
                        highest_price=size_info['price'],
                        last_updated=datetime.datetime.now()
                    )
                    db.session.add(size)
                    
                    # Add initial price history
                    price_history = PriceHistory(
                        size_id=size.id,
                        price=size_info['price'],
                        timestamp=datetime.datetime.now()
                    )
                    db.session.add(price_history)
                
                db.session.commit()
                flash('商品を追加しました', 'success')
                return redirect(url_for('product_list'))
            
            except Exception as e:
                db.session.rollback()
                flash(f'エラーが発生しました: {str(e)}', 'danger')
                return redirect(url_for('add_product'))
        
        return render_template('add_product.html')
    
    @app.route('/products/<int:product_id>')
    def product_detail(product_id):
        """Product detail page"""
        product = Product.query.get_or_404(product_id)
        return render_template('product_detail.html', product=product)
    
    @app.route('/products/<int:product_id>/edit', methods=['GET', 'POST'])
    def edit_product(product_id):
        """Edit product page"""
        product = Product.query.get_or_404(product_id)
        
        if request.method == 'POST':
            # Update product status
            product.is_active = 'is_active' in request.form
            
            # Update size notification settings
            for size in product.sizes:
                size_id = str(size.id)
                if size_id in request.form:
                    size.notify_below = request.form.get(f'notify_below_{size_id}') or None
                    size.notify_above = request.form.get(f'notify_above_{size_id}') or None
                    size.notify_on_any_change = f'notify_on_any_change_{size_id}' in request.form
            
            db.session.commit()
            flash('商品設定を更新しました', 'success')
            return redirect(url_for('product_list'))
        
        return render_template('edit_product.html', product=product)
    
    @app.route('/products/<int:product_id>/delete', methods=['POST'])
    def delete_product(product_id):
        """Delete product"""
        product = Product.query.get_or_404(product_id)
        
        try:
            db.session.delete(product)
            db.session.commit()
            flash('商品を削除しました', 'success')
        except Exception as e:
            db.session.rollback()
            flash(f'削除中にエラーが発生しました: {str(e)}', 'danger')
        
        return redirect(url_for('product_list'))
    
    @app.route('/products/<int:product_id>/history')
    def product_history(product_id):
        """Product price history page"""
        product = Product.query.get_or_404(product_id)
        
        # Get price history for each size
        history_data = {}
        for size in product.sizes:
            history = PriceHistory.query.filter_by(size_id=size.id).order_by(PriceHistory.timestamp).all()
            history_data[size.size] = [
                {'date': h.timestamp.strftime('%Y-%m-%d %H:%M'), 'price': h.price}
                for h in history
            ]
        
        return render_template('product_history.html', product=product, history_data=json.dumps(history_data))
    
    @app.route('/settings/notification', methods=['GET', 'POST'])
    def notification_settings():
        """Notification settings page"""
        settings = NotificationSettings.query.first()
        
        if request.method == 'POST':
            settings.line_enabled = 'line_enabled' in request.form
            settings.line_token = request.form.get('line_token')
            settings.line_user_id = request.form.get('line_user_id')
            
            settings.discord_enabled = 'discord_enabled' in request.form
            settings.discord_webhook = request.form.get('discord_webhook')
            
            settings.chatwork_enabled = 'chatwork_enabled' in request.form
            settings.chatwork_token = request.form.get('chatwork_token')
            settings.chatwork_room_id = request.form.get('chatwork_room_id')
            
            db.session.commit()
            flash('通知設定を更新しました', 'success')
            return redirect(url_for('notification_settings'))
        
        return render_template('notification_settings.html', settings=settings)
    
    @app.route('/settings/snidan', methods=['GET', 'POST'])
    def snidan_settings():
        """Snidan settings page"""
        settings = SnidanSettings.query.first()
        
        if request.method == 'POST':
            settings.username = request.form.get('username')
            settings.password = request.form.get('password')
            settings.monitoring_interval = int(request.form.get('monitoring_interval', 10))
            
            db.session.commit()
            flash('スニダン設定を更新しました', 'success')
            return redirect(url_for('snidan_settings'))
        
        return render_template('snidan_settings.html', settings=settings)
    
    @app.route('/notifications')
    def notification_history():
        """Notification history page"""
        notifications = NotificationHistory.query.order_by(NotificationHistory.timestamp.desc()).limit(100).all()
        return render_template('notification_history.html', notifications=notifications)
    
    @app.route('/api/products')
    def api_products():
        """API endpoint for products"""
        products = Product.query.all()
        return jsonify([product.to_dict() for product in products])
    
    @app.route('/api/products/<int:product_id>')
    def api_product(product_id):
        """API endpoint for a single product"""
        product = Product.query.get_or_404(product_id)
        return jsonify(product.to_dict())
    
    @app.route('/api/products/<int:product_id>/history')
    def api_product_history(product_id):
        """API endpoint for product price history"""
        product = Product.query.get_or_404(product_id)
        
        history_data = {}
        for size in product.sizes:
            history = PriceHistory.query.filter_by(size_id=size.id).order_by(PriceHistory.timestamp).all()
            history_data[size.size] = [h.to_dict() for h in history]
        
        return jsonify(history_data)
    
    @app.route('/api/products/add', methods=['POST'])
    def api_add_product():
        """API endpoint for adding a product"""
        data = request.json
        url = data.get('url')
        force_update = data.get('force_update', False)
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Check if product already exists
        existing_product = Product.query.filter_by(url=url).first()
        if existing_product and not force_update:
            # Return the existing product with a more helpful message
            return jsonify({
                'error': 'Product already exists. You can view it on the home page.',
                'product': existing_product.to_dict()
            }), 400
        
        try:
            # Get Snidan settings
            snidan_settings = SnidanSettings.query.first()
            if not snidan_settings or not snidan_settings.username or not snidan_settings.password:
                return jsonify({'error': 'Snidan credentials are not configured. Please set them up in the settings.'}), 400
            
            # Get product info from Snidan
            try:
                product_info = get_product_info(url, snidan_settings.username, snidan_settings.password)
            except Exception as scraper_error:
                logger.error(f"Error scraping product info: {str(scraper_error)}")
                # For testing/development, create a mock product
                if app.config.get('DEBUG', False):
                    product_id = url.split('/')[-1] if '/' in url else url
                    product_info = {
                        'name': 'Test Product - ' + product_id,
                        'image_url': 'https://placehold.co/300x300',
                        'sizes': [
                            {'size': '26.0cm', 'price': 10000},
                            {'size': '27.0cm', 'price': 12000},
                            {'size': '28.0cm', 'price': 15000},
                        ]
                    }
                else:
                    return jsonify({'error': f'Failed to scrape product information: {str(scraper_error)}'}), 500
            
            if not product_info:
                return jsonify({'error': 'Failed to get product information. Check the URL and make sure you are logged into Snidan.'}), 400
            
            # Create new product
            product = Product(
                url=url,
                name=product_info['name'],
                image_url=product_info['image_url'],
                added_at=datetime.datetime.now(),
                is_active=True
            )
            db.session.add(product)
            db.session.flush()  # Get product ID
            
            # Add sizes
            for size_info in product_info['sizes']:
                size = Size(
                    product_id=product.id,
                    size=size_info['size'],
                    current_price=size_info['price'],
                    previous_price=size_info['price'],
                    last_updated=datetime.datetime.now()
                )
                db.session.add(size)
                
                # Add initial price history
                price_history = PriceHistory(
                    size_id=size.id,
                    price=size_info['price'],
                    timestamp=datetime.datetime.now()
                )
                db.session.add(price_history)
            
            db.session.commit()
            return jsonify({'success': True, 'product': product.to_dict()}), 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error adding product: {str(e)}")
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/products/<int:product_id>', methods=['DELETE'])
    def api_delete_product(product_id):
        """API endpoint for deleting a product"""
        product = Product.query.get_or_404(product_id)
        
        try:
            # Delete associated sizes and price history
            for size in product.sizes:
                PriceHistory.query.filter_by(size_id=size.id).delete()
            
            Size.query.filter_by(product_id=product.id).delete()
            
            # Delete the product
            db.session.delete(product)
            db.session.commit()
            
            return jsonify({'success': True}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/notifications/settings', methods=['GET', 'POST'])
    def api_notification_settings():
        """API endpoint for notification settings"""
        if request.method == 'GET':
            # Get all notification settings
            settings = {}
            for setting in NotificationSettings.query.all():
                settings[setting.service] = {
                    'enabled': setting.enabled,
                    'token': setting.token,
                    'user_id': setting.user_id
                }
            return jsonify(settings)
        else:
            # Update notification settings
            data = request.json
            
            try:
                for service, settings in data.items():
                    setting = NotificationSettings.query.filter_by(service=service).first()
                    
                    if not setting:
                        setting = NotificationSettings(service=service)
                        db.session.add(setting)
                    
                    setting.enabled = settings.get('enabled', False)
                    setting.token = settings.get('token', '')
                    setting.user_id = settings.get('user_id', '')
                
                db.session.commit()
                return jsonify({'success': True}), 200
            except Exception as e:
                db.session.rollback()
                return jsonify({'error': str(e)}), 500
    
    @app.route('/api/snidan/settings', methods=['GET', 'POST'])
    def api_snidan_settings():
        """API endpoint for Snidan settings"""
        if request.method == 'GET':
            # Get Snidan settings
            settings = SnidanSettings.query.first()
            if settings:
                return jsonify({
                    'username': settings.username,
                    'password': settings.password,
                    'interval': settings.interval
                })
            return jsonify({
                'username': '',
                'password': '',
                'interval': 10
            })
        else:
            # Update Snidan settings
            data = request.json
            
            try:
                settings = SnidanSettings.query.first()
                
                if not settings:
                    settings = SnidanSettings()
                    db.session.add(settings)
                
                settings.username = data.get('username', '')
                settings.password = data.get('password', '')
                settings.interval = data.get('interval', 10)
                
                db.session.commit()
                return jsonify({'success': True}), 200
            except Exception as e:
                db.session.rollback()
                return jsonify({'error': str(e)}), 500
    
    @app.route('/api/notifications/history')
    def api_notification_history():
        """API endpoint for notification history"""
        notifications = NotificationHistory.query.order_by(NotificationHistory.timestamp.desc()).limit(100).all()
        return jsonify([notification.to_dict() for notification in notifications])
    
    @app.route('/api/system/status')
    def api_system_status():
        """API endpoint for system status"""
        # Get last startup time
        last_startup = Settings.query.filter_by(key="last_startup").first()
        
        # Get product and notification counts
        product_count = Product.query.count()
        active_product_count = Product.query.filter_by(is_active=True).count()
        notification_count = NotificationHistory.query.count()
        
        return jsonify({
            'last_startup': last_startup.value if last_startup else None,
            'product_count': product_count,
            'active_product_count': active_product_count,
            'notification_count': notification_count,
            'monitoring_active': True  # This should be updated to reflect the actual status
        }) 