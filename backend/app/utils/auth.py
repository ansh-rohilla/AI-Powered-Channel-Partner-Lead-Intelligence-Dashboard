from functools import wraps
from flask import request, jsonify, g, current_app
from itsdangerous import URLSafeTimedSerializer
from app.database import db
from app.models.user import User

def get_serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'])

def generate_auth_token(user_id):
    serializer = get_serializer()
    return serializer.dumps(user_id, salt='auth-salt')

def verify_auth_token(token, max_age=86400): # 1 day expiration
    serializer = get_serializer()
    try:
        user_id = serializer.loads(token, salt='auth-salt', max_age=max_age)
        return user_id
    except Exception:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({"success": False, "message": "Authentication token is missing"}), 401
        
        user_id = verify_auth_token(token)
        if not user_id:
            return jsonify({"success": False, "message": "Invalid or expired token"}), 401
            
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 401
            
        g.current_user = user
        return f(*args, **kwargs)
    return decorated
