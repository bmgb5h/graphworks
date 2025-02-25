from flask import Flask
from flask_cors import CORS
from app.routes import api_bp

def create_app(test_config=None):
    app = Flask(__name__)

    # load default config
    app.config.from_mapping(
        SECRET_KEY='dev',
    )

    # override default config with test config if provided
    if test_config:
        app.config.from_mapping(test_config)

    # enable CORS for frontend requests
    CORS(app, resources={r'/api/*': {'origins': 'http://localhost:5173'}})

    # register blueprints
    app.register_blueprint(api_bp)

    return app
