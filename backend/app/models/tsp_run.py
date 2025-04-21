from .base import BaseModel
from app.extensions import db

class TSPRun(BaseModel):
    __tablename__ = 'tspruns'

    graph_id = db.Column(db.Integer, db.ForeignKey('graphs.id'), nullable=False)
    algorithm = db.Column(db.String(50), nullable=False)
    path = db.Column(db.JSON, nullable=False)
    cost = db.Column(db.Float, nullable=False)
    time_to_calculate = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f'<TSPRun {self.id} for Graph {self.graph_id} using {self.algorithm}>'
