import os
import datetime
import json
from flask import render_template, request, redirect, url_for, flash, jsonify
from models import Product, Size, PriceHistory, NotificationHistory, Settings, NotificationSettings, SnidanSettings
from scraper import get_product_info, setup_driver
import logging
import scraper
import monitor

logger = logging.getLogger(__name__)

def register_routes(app, db):
    """Register all routes with the Flask app"""
    
    # Add a route handler for OPTIONS requests to handle preflight requests
    @app.route('/api/<path:path>', methods=['OPTIONS'])
    def handle_options(path):
        return '', 200
    
    # @app.route('/api/products')
    # def product_list():
    #     """Product list page"""
    #     products = Product.query.all()
    #     return products
    
    # @app.route('/api/products/add', methods=['GET', 'POST'])
    # def add_product():
    #     """Add product page"""
    #     if request.method == 'POST':
    #         url = request.form.get('url')
            
    #         # Check if product already exists
    #         existing_product = Product.query.filter_by(url=url).first()
    #         if existing_product:
    #             flash('この商品は既に追加されています', 'warning')
    #             return redirect(url_for('product_list'))
            
    #         try:
    #             # Get product info from Snidan
    #             username = SnidanSettings.query.first().username
    #             password = SnidanSettings.query.first().password
    #             driver = setup_driver()
    #             product_info = get_product_info(driver, url, username, password)
                
    #             if not product_info:
    #                 flash('商品情報の取得に失敗しました。URLが正しいか、スニダンにログインしているか確認してください。', 'danger')
    #                 return redirect(url_for('add_product'))
                
    #             # Create new product
    #             product = Product(
    #                 url=url,
    #                 name=product_info['name'],
    #                 image_url=product_info['image_url'],
    #                 added_at=datetime.datetime.now(),
    #                 is_active=True
    #             )
    #             db.session.add(product)
    #             db.session.flush()  # Get product ID
                
    #             # Add sizes
    #             for size_info in product_info['sizes']:
    #                 size = Size(
    #                     product_id=product.id,
    #                     size=size_info['size'],
    #                     current_price=size_info['price'],
    #                     previous_price=size_info['price'],
    #                     lowest_price=size_info['price'],
    #                     highest_price=size_info['price'],
    #                     last_updated=datetime.datetime.now()
    #                 )
    #                 db.session.add(size)
                    
    #                 # Add initial price history
    #                 price_history = PriceHistory(
    #                     size_id=size.id,
    #                     price=size_info['price'],
    #                     timestamp=datetime.datetime.now()
    #                 )
    #                 db.session.add(price_history)
                
    #             db.session.commit()
    #             flash('商品を追加しました', 'success')
    #             return redirect(url_for('product_list'))
            
    #         except Exception as e:
    #             db.session.rollback()
    #             flash(f'エラーが発生しました: {str(e)}', 'danger')
    #             return redirect(url_for('add_product'))
        
    #     return render_template('add_product.html')
    
    # @app.route('/api/products/<int:product_id>')
    # def product_detail(product_id):
    #     """Product detail page"""
    #     product = Product.query.get_or_404(product_id)
    #     return render_template('product_detail.html', product=product)
    
    @app.route('/api/products/<int:product_id>/edit', methods=['GET'])
    def get_edit_product(product_id):
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
    
    @app.route('/api/products/<int:product_id>/edit', methods=['POST'])
    def edit_product(product_id):
        """Edit product API endpoint"""
        product = Product.query.get_or_404(product_id)
        
        try:
            data = request.get_json()  # Get JSON data instead of form data
            
            # Update product status
            product.is_active = data.get('is_active', False)
            
            # Update size notification settings
            received_sizes = {size['id']: size for size in data.get('sizes', [])}
            
            for size in product.sizes:
                if size.id in received_sizes:
                    size_data = received_sizes[size.id]
                    size.notify_below = size_data.get('notify_below')
                    size.notify_above = size_data.get('notify_above')
                    size.notify_on_any_change = size_data.get('notify_on_any_change', False)
            
            db.session.commit()
            return jsonify({'message': '商品設定を更新しました'}), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400
    
    
    @app.route('/api/products/<int:product_id>/delete', methods=['POST'])
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
    
    @app.route('/api/products/<int:product_id>/history')
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
    
    @app.route('/api/settings/snidan', methods=['GET'])
    def get_snidan_settings():
        """Get Snidan settings page"""
        settings = SnidanSettings.query.first()
        return render_template('snidan_settings.html', settings=settings)

    @app.route('/api/settings/snidan', methods=['POST'])
    def update_snidan_settings():
        """Update Snidan settings page"""
        settings = SnidanSettings.query.first()
        
        try:
            data = request.get_json()  # Get JSON data instead of form data
            settings.username = data.get('username', settings.username)
            settings.password = data.get('password', settings.password)
            settings.monitoring_interval = int(data.get('monitoring_interval', 10))
            
            db.session.commit()
            return jsonify({'message': 'スニダン設定を更新しました'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/notifications')
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
        try:
            product = Product.query.get_or_404(product_id)
            if product:
                product.sizes = Size.query.filter_by(product_id=product_id).all()
            return jsonify(product.to_dict()), 200  # Explicitly return 200 OK status
        except Exception as e:
            return jsonify({'error': str(e)}), 500  # Handle unexpected errors gracefully
    
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
            if not snidan_settings:
                logger.error("Snidan settings not found in the database.")
                return jsonify({'error': 'Snidan settings not found.'}), 404
            
            # Get product info from Snidan
            try:
                driver = setup_driver()
                product_info = get_product_info(driver, url, snidan_settings.username, snidan_settings.password)
                driver.quit()
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
                driver.quit()
                
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
    
    @app.route('/api/notifications/settings', methods=['GET'])
    def get_notification_settings():
        """API endpoint for getting notification settings"""
        try:
            setting = NotificationSettings.query.first()
            if setting:
                # Convert the setting object to a dictionary
                return jsonify({
                    'line_enabled': setting.line_enabled,
                    'line_token': setting.line_token,
                    'line_user_id': setting.line_user_id,
                    'discord_enabled': setting.discord_enabled,
                    'discord_webhook': setting.discord_webhook,
                    'chatwork_enabled': setting.chatwork_enabled,
                    'chatwork_token': setting.chatwork_token,
                    'chatwork_room_id': setting.chatwork_room_id
                }), 200
            else:
                return jsonify({
                    'line_enabled': False,
                    'line_token': '',
                    'line_user_id': '',
                    'discord_enabled': False,
                    'discord_webhook': '',
                    'chatwork_enabled': False,
                    'chatwork_token': '',
                    'chatwork_room_id': ''
                }), 200
        except Exception as e:
            logger.error(f"Error getting notificationSetting: {str(e)}")
            return jsonify({
                'line_enabled': False,
                'line_token': '',
                'line_user_id': '',
                'discord_enabled': False,
                'discord_webhook': '',
                'chatwork_enabled': False,
                'chatwork_token': '',
                'chatwork_room_id': ''
            }), 500

    @app.route('/api/notifications/settings', methods=['POST'])
    def update_notification_settings():
        """API endpoint for updating notification settings"""
        data = request.json
        
        try:
            settings = NotificationSettings.query.first()
            if not settings:
                # Insert new settings if none exist
                settings = NotificationSettings()
                db.session.add(settings)
            
            settings.line_enabled = data.get('line_enabled', settings.line_enabled)
            settings.line_token = data.get('line_token', settings.line_token)
            settings.line_user_id = data.get('line_user_id', settings.line_user_id)
            settings.discord_enabled = data.get('discord_enabled', settings.discord_enabled)
            settings.discord_webhook = data.get('discord_webhook', settings.discord_webhook)
            settings.chatwork_enabled = data.get('chatwork_enabled', settings.chatwork_enabled)
            settings.chatwork_token = data.get('chatwork_token', settings.chatwork_token)
            settings.chatwork_room_id = data.get('chatwork_room_id', settings.chatwork_room_id)
            
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
    
    @app.route('/api/system/loginstatus')
    def api_system_loginstatus():
        """API endpoint for system loginstatus"""
        # Get last startup time
        login_info = SnidanSettings.query.first()
        username = login_info.username
        password = login_info.password
        driver = scraper.setup_driver()
        login_res = scraper.login_to_snidan(driver, username, password)
        driver.quit()
        if login_res:
            return jsonify({'success': 'ログインに成功しました。'}), 200
        else:
            return jsonify({'error' : 'ログインに失敗しました。'}), 503
        
    @app.route('/api/system/monitoring')
    def api_system_toggleMonitor():
        """API endpoint for system loginstatus"""
        # Get last startup time
        active = request.json.active
        if active:
            monitor.start_monitoring()
        else:
            monitor.stop_monitoring()
        login_info = SnidanSettings.query.first()
        username = login_info.username
        password = login_info.password
        driver = scraper.setup_driver()
        login_res = scraper.login_to_snidan(driver, username, password)
        driver.quit()
        if login_res:
            return jsonify({'success': 'ログインに成功しました。'}), 200
        else:
            return jsonify({'error' : 'ログインに失敗しました。'}), 503