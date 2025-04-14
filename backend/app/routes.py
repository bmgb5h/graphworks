from uuid import uuid4
import networkx as nx
from flask import Blueprint, jsonify, request, current_app

from app.models import User, Graph
from app.extensions import db
import app.utils as utils


api_bp = Blueprint('api', __name__)

# user routes

@api_bp.route('/api/user/', methods=['GET'])
def get_all_users():
    users = User.query.with_entities(User.id).all()
    user_ids = [user.id for user in users]
    return jsonify({'user_ids': user_ids}), 200


@api_bp.route('/api/user/', methods=['POST'])
def create_user():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        new_user = User(
            id=2,  # TODO: swap to UUID
            username=data['username'],
            email=data['email'],
            password_hash=data['password']  # TODO: hash the password
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "User created successfully",
            "user_id": new_user.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api_bp.route('/api/user/<int:user_id>/', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api_bp.route('/api/user/<int:user_id>/graph', methods=['GET'])
def get_user_graphs(user_id):
    graphs = Graph.query.filter_by(user_id=user_id).all()
    graph_ids = [graph.id for graph in graphs]
    return jsonify({'graph_ids': graph_ids}), 200


@api_bp.route('/api/user/<int:user_id>/graph/<int:graph_id>/', methods=['GET'])
def get_user_graph(user_id, graph_id):
    graph = Graph.query.filter_by(user_id=user_id, id=graph_id).first()
    if not graph:
        return jsonify({"error": "Graph not found"}), 404

    try:
        graph_data = {
            "id": graph.id,
            "name": graph.name,
            "user_id": graph.user_id,
            "data": graph.data
        }
        return jsonify(graph_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
# graph routes

@api_bp.route('/api/graph/', methods=['GET'])
def get_all_graphs():
    graphs = Graph.query.with_entities(Graph.id).all()
    graph_ids = [graph.id for graph in graphs]
    return jsonify({'graph_ids': graph_ids}), 200


@api_bp.route('/api/graph/<int:graph_id>/', methods=['GET'])
def get_graph(graph_id):
    graph = Graph.query.get(graph_id)
    if not graph:
        return jsonify({"error": "Graph not found"}), 404

    try:
        graph_data = {
            "id": graph.id,
            "name": graph.name,
            "user_id": graph.user_id,
            "data": graph.data
        }
        return jsonify(graph_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api_bp.route('/api/graph/', methods=['POST'])
def create_graph():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        new_graph = Graph(
            id=2,  # TODO: swap to UUID
            name=data['name'],
            user_id=data['user_id'],
            data=data['data']
        )

        db.session.add(new_graph)
        db.session.commit()

        return jsonify({
            "message": "Graph created successfully",
            "graph_id": new_graph.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
