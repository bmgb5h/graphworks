import networkx as nx
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
import time

from app.models import User, Graph, TSPRun
from app.extensions import db
import app.utils as utils


api_bp = Blueprint('api', __name__)

# TODO: Organize routes into separate files for

@api_bp.route('/api/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        new_user = User(username=data['username'])
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
    

@api_bp.route('/api/login', methods=['POST'])
def login():
    """Login a user and return an access token."""
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not user.check_password(data['password']):
        return jsonify({"error": "Invalid password"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": access_token,
        "user_id": user.id
    }), 200


@api_bp.route('/api/users', methods=['DELETE'])
@jwt_required()
def delete_user():
    """Delete a user."""
    user_id = get_jwt_identity()
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


@api_bp.route('/api/graphs', methods=['GET'])
@jwt_required()
def get_user_graphs():
    """Get all graphs for the logged-in user."""
    user_id = get_jwt_identity()
    graphs = Graph.query.filter_by(user_id=user_id).all()
    graph_ids = [graph.id for graph in graphs]
    return jsonify({'graph_ids': graph_ids}), 200


@api_bp.route('/api/graphs', methods=['POST'])
@jwt_required()
def create_user_graph():
    """Create a new graph for the logged-in user."""
    user_id = get_jwt_identity()
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


@api_bp.route('/api/graphs/<int:graph_id>', methods=['GET'])
@jwt_required()
def get_user_graph(graph_id):
    """Get a specific graph for the logged-in user."""
    user_id = get_jwt_identity()
    graph = Graph.query.filter_by(user_id=user_id, id=graph_id).first()

    if not graph:
        return jsonify({"error": "Graph not found"}), 404

    try:
        graph_data = {
            "id": graph.id,
            "name": graph.name,
            "user_id": graph.user_id,
            "graph": graph.data,
            "created_at": graph.created_at,
            "updated_at": graph.updated_at
        }
        return jsonify(graph_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@api_bp.route('/api/graphs/<int:graph_id>', methods=['PUT'])
@jwt_required()
def update_user_graph(graph_id):
    """Update a specific graph for the logged-in user, and delete all associated TSP runs."""
    user_id = get_jwt_identity()
    graph = Graph.query.filter_by(user_id=user_id, id=graph_id).first()

    if not graph:
        return jsonify({"error": "Graph not found"}), 404

    data = request.get_json()
    if not data or "data" not in data:
        return jsonify({"error": "Missing 'data' field"}), 400

    try:
        # Delete all associated TSP results before updating the graph
        TSPRun.query.filter_by(graph_id=graph_id).delete()

        # Update the name field if present in the request
        if 'name' in data['data']:
            graph.name = data['data']['name']
        
        # Update other graph data (nodes and edges)
        graph.data = data['data']

        # Update timestamp
        graph.updated_at = db.func.now()

        db.session.commit()
        return jsonify({"message": "Graph and associated TSP runs updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api_bp.route('/api/graphs/<int:graph_id>', methods=['DELETE'])
@jwt_required()
def delete_user_graph(graph_id):
    """Delete a specific graph for the logged-in user."""
    user_id = get_jwt_identity()
    graph = Graph.query.filter_by(user_id=user_id, id=graph_id).first()

    if not graph:
        return jsonify({"error": "Graph not found"}), 404

    try:
        db.session.delete(graph)
        # Delete all associated TSP runs
        TSPRun.query.filter_by(graph_id=graph_id).delete()
        db.session.commit()

        return jsonify({"message": "Graph deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api_bp.route('/api/graphs/<int:graph_id>/tsp', methods=['GET'])
@jwt_required()
def get_graph_tsp(graph_id):
    """Get the Traveling Salesman Path for a specific graph."""
    user_id = get_jwt_identity()
    graph = Graph.query.filter_by(user_id=user_id, id=graph_id).first()

    if not graph:
        return jsonify({"error": "Graph not found"}), 404

    algo = request.args.get('algo', 'asadpour')

    try:
        G = nx.DiGraph()
        G.add_weighted_edges_from(
            [(edge['from'], edge['to'], edge['weight']) for edge in graph.data['edges']]
        )
        if len(G.nodes) < 3:
            return jsonify({"error": "Graph must have at least 3 nodes"}), 400
        if not nx.is_strongly_connected(G):
            return jsonify({"error": "Graph must be strongly connected"}), 400

        start_time = time.time()
        tsp_path = utils.traveling_salesman_path(G, algo)
        end_time = time.time()
        cost = utils.get_path_cost(G, tsp_path)

        tsp_run = TSPRun(
            graph_id=graph.id,
            algorithm=algo,
            path=tsp_path,
            cost=cost,
            time_to_calculate=end_time - start_time
        )
        db.session.add(tsp_run)
        db.session.commit()

        return jsonify({
            "tsp_path": tsp_path,
            "cost": cost,
            "time_to_calculate": end_time - start_time
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api_bp.route('/api/graphs/<int:graph_id>/tsp/runs', methods=['GET'])
@jwt_required()
def get_graph_tsp_runs(graph_id):
    """Get all TSP runs for a specific graph."""
    user_id = get_jwt_identity()
    graph = Graph.query.filter_by(user_id=user_id, id=graph_id).first()

    if not graph:
        return jsonify({"error": "Graph not found"}), 404

    try:
        tsp_runs = TSPRun.query.filter_by(graph_id=graph.id).all()
        runs_data = [{
            "id": run.id,
            "algorithm": run.algorithm,
            "path": run.path,
            "cost": run.cost,
            "time_to_calculate": run.time_to_calculate,
            "created_at": run.created_at
        } for run in tsp_runs]
        return jsonify(runs_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@api_bp.route('/api/graphs/<int:graph_id>/tsp/runs', methods=['DELETE'])
@jwt_required()
def delete_all_graph_tsp_runs(graph_id):
    """Delete all TSP runs for a specific graph."""
    user_id = get_jwt_identity()
    graph = Graph.query.filter_by(user_id=user_id, id=graph_id).first()

    if not graph:
        return jsonify({"error": "Graph not found"}), 404

    try:
        TSPRun.query.filter_by(graph_id=graph.id).delete(synchronize_session=False)
        db.session.commit()
        return jsonify({"message": "All TSP runs deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api_bp.route('/api/graphs/<int:graph_id>/tsp/runs/<int:run_id>', methods=['DELETE'])
@jwt_required()
def delete_graph_tsp_run(graph_id, run_id):
    """Delete a specific TSP run for a specific graph."""
    user_id = get_jwt_identity()
    graph = Graph.query.filter_by(user_id=user_id, id=graph_id).first()

    if not graph:
        return jsonify({"error": "Graph not found"}), 404

    tsp_run = TSPRun.query.filter_by(graph_id=graph.id, id=run_id).first()

    if not tsp_run:
        return jsonify({"error": "TSP run not found"}), 404

    try:
        db.session.delete(tsp_run)
        db.session.commit()
        return jsonify({"message": "TSP run deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api_bp.route('/api/graphs/<int:graph_id>/tsp/runs/<int:run_id>', methods=['GET'])
@jwt_required()
def get_graph_tsp_run(graph_id, run_id):
    """Get a specific TSP run for a specific graph."""
    user_id = get_jwt_identity()
    graph = Graph.query.filter_by(user_id=user_id, id=graph_id).first()

    if not graph:
        return jsonify({"error": "Graph not found"}), 404

    tsp_run = TSPRun.query.filter_by(graph_id=graph.id, id=run_id).first()

    if not tsp_run:
        return jsonify({"error": "TSP run not found"}), 404

    try:
        run_data = {
            "id": tsp_run.id,
            "algorithm": tsp_run.algorithm,
            "path": tsp_run.path,
            "cost": tsp_run.cost,
            "time_to_calculate": tsp_run.time_to_calculate,
            "created_at": tsp_run.created_at
        }
        return jsonify(run_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

############################
#     DEBUGGING ROUTES     #
############################

@api_bp.route('/api/debug/users', methods=['GET'])
def get_all_users():
    """Get all users."""
    users = User.query.with_entities(User.id).all()
    user_ids = [user.id for user in users]
    return jsonify({'user_ids': user_ids}), 200
 

@api_bp.route('/api/debug/graphs', methods=['GET'])
def get_all_graphs():
    """Get all graphs."""
    graphs = Graph.query.with_entities(Graph.id).all()
    graph_ids = [graph.id for graph in graphs]
    return jsonify({'graph_ids': graph_ids}), 200


@api_bp.route('/api/debug/users/<int:user_id>', methods=['DELETE'])
def delete_any_user(user_id):
    """Delete a user by ID."""
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
