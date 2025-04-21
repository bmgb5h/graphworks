from flask import Flask
from flask_cors import CORS

from app.routes import api_bp
from app.extensions import db, migrate, jwt


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    # set up app configuration
    app.config.from_object('config.Config')
    app.config.from_pyfile('config.py', silent=True)

    # override config with test config if provided
    if test_config:
        app.config.from_mapping(test_config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # enable CORS for frontend requests
    CORS(app)

    # register blueprints
    app.register_blueprint(api_bp)

    from app.models import User, Graph, TSPRun

    return app
