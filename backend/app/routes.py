import networkx as nx
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

from app.models import User, Graph
from app.extensions import db
import app.utils as utils


api_bp = Blueprint('api', __name__)


@api_bp.route('/api/register/', methods=['POST'])
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        new_user = User(
            username=data['username'],
            email=data['email']
        )
        new_user.set_password(data['password'])

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "User created successfully",
            "user_id": new_user.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

@api_bp.route('/api/login/', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()

    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token), 200

    return jsonify({"error": "Invalid credentials"}), 401

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


@api_bp.route('/api/graph', methods=['GET'])
@jwt_required()
def get_user_graphs():
    user_id = get_jwt_identity()
    graphs = Graph.query.filter_by(user_id=user_id).all()
    graph_ids = [graph.id for graph in graphs]
    return jsonify({'graph_ids': graph_ids}), 200


@api_bp.route('/api/user/<int:user_id>/graph', methods=['POST'])
def create_user_graph(user_id):
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        new_graph = Graph(
            name=data['name'],
            user_id=user_id,
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
    

@api_bp.route('/api/user/<int:user_id>/graph/<int:graph_id>/', methods=['DELETE'])
@jwt_required()
def delete_user_graph(user_id, graph_id):
    graph = Graph.query.filter_by(user_id=user_id, id=graph_id).first()
    if not graph:
        return jsonify({"error": "Graph not found"}), 404

    try:
        db.session.delete(graph)
        db.session.commit()
        return jsonify({"message": "Graph deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


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


@api_bp.route('/api/user/<int:user_id>/graph/<int:graph_id>/tsp', methods=['GET'])
def get_user_graph_tsp(user_id, graph_id):
    graph = Graph.query.filter_by(user_id=user_id, id=graph_id).first()
    if not graph:
        return jsonify({"error": "Graph not found"}), 404

    try:
        G = nx.DiGraph()
        G.add_weighted_edges_from(
            [(edge['from'], edge['to'], edge['weight']) for edge in graph.data['edges']]
        )
        if len(G.nodes) < 3:
            return jsonify({"error": "Graph must have at least 3 nodes"}), 400
        if not nx.is_strongly_connected(G):
            return jsonify({"error": "Graph must be strongly connected"}), 400
        
        tsp_path = utils.traveling_salesman_path(G)
        return jsonify({"tsp_path": tsp_path}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
# graph routes

@api_bp.route('/api/graph/', methods=['GET'])
def get_all_graphs():
    graphs = Graph.query.with_entities(Graph.id).all()
    graph_ids = [graph.id for graph in graphs]
    return jsonify({'graph_ids': graph_ids}), 200
