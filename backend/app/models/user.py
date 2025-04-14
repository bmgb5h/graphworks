from .base import BaseModel
from app.extensions import db

class User(BaseModel):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    graphs = db.relationship('Graph', backref='owner', lazy='dynamic', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'
    