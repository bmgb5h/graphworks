import os
from datetime import timedelta


class Config:
    FLASK_APP = os.getenv('FLASK_APP', 'run.py')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')

    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')  # Need to set up a postgres database
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Put your own secret keys in a .flaskenv file
    SECRET_KEY = os.getenv('SECRET_KEY', 'secret_key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt_secret_key')

    expires_in = os.getenv('JWT_ACCESS_TOKEN_EXPIRES')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(expires_in)) if expires_in else timedelta(hours=1)  # Default to 1 hour
    