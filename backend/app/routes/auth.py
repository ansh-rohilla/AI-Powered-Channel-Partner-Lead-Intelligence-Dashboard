from flask import Blueprint, request, jsonify, g
from app.database import db
from app.models.user import User
from app.utils.auth import generate_auth_token, token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required"}), 400
        
    user = User.query.filter_by(email=email.strip().lower()).first()
    if not user or not user.check_password(password):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401
        
    token = generate_auth_token(user.id)
    return jsonify({
        "success": True,
        "token": token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def me():
    return jsonify({
        "success": True,
        "user": g.current_user.to_dict()
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({
        "success": True,
        "message": "Logged out successfully"
    }), 200
