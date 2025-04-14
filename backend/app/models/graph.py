from .base import BaseModel
from app.extensions import db

class Graph(BaseModel):
    __tablename__ = 'graphs'

    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    data = db.Column(db.JSON, nullable=False)

    def __repr__(self):
        return f'<Graph {self.name}>'
    