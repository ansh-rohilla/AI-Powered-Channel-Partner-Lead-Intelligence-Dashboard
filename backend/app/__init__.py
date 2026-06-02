import os
from flask import Flask
from flask_cors import CORS
from flask_caching import Cache
from app.config import Config
from app.database import db

cache = Cache()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Extensions
    db.init_app(app)
    CORS(app)
    cache.init_app(app, config={'CACHE_TYPE': 'SimpleCache'})

    # Import models to ensure they are registered with SQLAlchemy
    from app.models.partner import Partner
    from app.models.lead import Lead

    with app.app_context():
        # Create database tables if they do not exist
        db.create_all()

    # Simple health check / status route
    @app.route('/api/status', methods=['GET'])
    def status():
        return {
            "status": "healthy",
            "message": "AI-Powered Channel Partner & Lead Intelligence API is running."
        }

    return app
