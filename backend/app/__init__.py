import os
import time
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_caching import Cache
from werkzeug.exceptions import HTTPException
from marshmallow import ValidationError
from app.config import Config
from app.database import db

cache = Cache()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 1. Setup Logging
    if not os.path.exists('logs'):
        os.makedirs('logs')
        
    log_formatter = logging.Formatter(
        '%(asctime)s %(levelname)s [%(pathname)s:%(lineno)d]: %(message)s'
    )
    
    file_handler = RotatingFileHandler(
        'logs/app.log', maxBytes=10*1024*1024, backupCount=5
    )
    file_handler.setFormatter(log_formatter)
    file_handler.setLevel(logging.INFO)
    
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(log_formatter)
    stream_handler.setLevel(logging.INFO)
    
    # Avoid duplicate handlers if app.logger is reused
    if not app.logger.handlers:
        app.logger.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.addHandler(stream_handler)
    
    app.logger.info("Vyana API starting up...")

    # Initialize Extensions
    db.init_app(app)
    CORS(app)
    cache.init_app(app, config={'CACHE_TYPE': 'SimpleCache'})

    # 2. Import and register Blueprints
    from app.routes.partners import partners_bp
    from app.routes.leads import leads_bp
    from app.routes.uploads import uploads_bp
    from app.routes.analytics import analytics_bp
    from app.routes.predictions import predictions_bp
    from app.routes.auth import auth_bp

    app.register_blueprint(partners_bp, url_prefix='/api/partners')
    app.register_blueprint(leads_bp, url_prefix='/api/leads')
    app.register_blueprint(uploads_bp, url_prefix='/api/upload')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(predictions_bp, url_prefix='/api/predict')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    with app.app_context():
        # Create database tables if they do not exist
        db.create_all()
        
        # Check if users are empty and seed default admin
        try:
            from app.models.user import User
            if db.session.query(User).count() == 0:
                app.logger.info("No users found. Seeding default administrator...")
                admin = User(
                    name="Alex Chen",
                    role="Sales Operations Director",
                    email="alex.chen@vyana.ai",
                    avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80"
                )
                admin.set_password("password123")
                db.session.add(admin)
                db.session.commit()
                app.logger.info("Default administrator seeded successfully.")
        except Exception as e:
            app.logger.error(f"Failed to auto-seed default administrator at startup: {str(e)}")

        # Check if the database is empty and auto-seed if needed
        try:
            from app.models.partner import Partner
            if db.session.query(Partner).count() == 0:
                app.logger.info("Database is empty. Running auto-seeding...")
                from data.seed_db import seed_db_core
                seed_db_core()
                app.logger.info("Database auto-seeded successfully.")
        except Exception as e:
            app.logger.error(f"Failed to auto-seed database at startup: {str(e)}")
            
        # Pre-load ML models at startup to ensure service readiness
        try:
            from app.services.prediction_service import load_artifacts
            load_artifacts()
            app.logger.info("ML prediction models loaded successfully at startup.")
        except Exception as e:
            app.logger.error(f"Failed to load ML models at startup: {str(e)}")

    # 3. Request Logging Middleware
    @app.before_request
    def start_timer():
        request.start_time = time.time()

    @app.after_request
    def log_request(response):
        if request.path == '/api/status':
            return response
            
        latency = (time.time() - request.start_time) * 1000
        app.logger.info(
            f"IP: {request.remote_addr} | Route: {request.method} {request.path} | "
            f"Status: {response.status_code} | Latency: {latency:.2f}ms"
        )
        return response

    # 4. Global Error Handlers
    @app.errorhandler(ValidationError)
    def handle_validation_error(err):
        app.logger.warning(f"Validation failure: {err.messages}")
        return jsonify({
            "success": False,
            "error": "ValidationError",
            "message": "Input validation failed",
            "details": err.messages
        }), 400

    @app.errorhandler(HTTPException)
    def handle_http_exception(err):
        return jsonify({
            "success": False,
            "error": err.name,
            "message": err.description
        }), err.code

    @app.errorhandler(Exception)
    def handle_general_exception(err):
        app.logger.error(f"Unhandled Exception: {str(err)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "InternalServerError",
            "message": "An unexpected server error occurred."
        }), 500

    # Simple health check / status route
    @app.route('/api/status', methods=['GET'])
    def status():
        return {
            "status": "healthy",
            "message": "AI-Powered Channel Partner & Lead Intelligence API is running."
        }

    return app
