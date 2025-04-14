from uuid import uuid4
import networkx as nx
from flask import Blueprint, jsonify, request, current_app

from app.models import User, Graph
from app.extensions import db
import app.utils as utils


api_bp = Blueprint('api', __name__)


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
            id=1,
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


@api_bp.route('/api/graph/', methods=['GET'])
def get_all_graphs():
    graphs = Graph.query.with_entities(Graph.id).all()
    graph_ids = [graph.id for graph in graphs]
    return jsonify({'graph_ids': graph_ids}), 200


@api_bp.route('/api/graph/', methods=['POST'])
def create_graph():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        new_graph = Graph(
            id=1,
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


@api_bp.route('/api/graph/<graph_id>', methods=['GET'])
def get_graph(graph_id):
    graph = current_app.user_graphs.get(graph_id)

    if graph is None:
        return jsonify({'error': 'Graph not found'}), 404

    return jsonify({'graph': nx.to_dict_of_dicts(graph)}), 200


@api_bp.route('/api/graph/<graph_id>', methods=['DELETE'])
def delete_graph(graph_id):
    graph = current_app.user_graphs.pop(graph_id, None)

    if graph is None:
        return jsonify({'error': 'Graph not found'}), 404

    return '', 204


@api_bp.route('/api/graph/<graph_id>/tsp', methods=['GET'])
def get_tsp(graph_id):
    graph = current_app.user_graphs.get(graph_id)

    if graph is None:
        return jsonify({'error': 'Graph not found'}), 404

    try:
        tsp_path = utils.traveling_salesman_path(graph)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    return jsonify({'tsp_path': tsp_path}), 200

# TODO: eventually the graphs should be stored in a database