from functools import wraps
from flask import request, jsonify
import jwt
import os
from datetime import datetime, timedelta

# Secret key for JWT - in production, this should be stored in environment variables
SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-here')

def generate_token(user_id: str) -> str:
    """Generate a JWT token for a user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=1)  # Token expires in 1 day
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token: str) -> dict:
    """Verify a JWT token and return the payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def require_auth(f):
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        # Skip authentication for login route
        if request.path.endswith('/login'):
            return f(*args, **kwargs)
            
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No token provided'}), 401
            
        token = auth_header.split(' ')[1]
        payload = verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
            
        # Add user_id to request context
        request.user_id = payload['user_id']
        return f(*args, **kwargs)
    return decorated 