from uuid import uuid4
import networkx as nx
from flask import Blueprint, jsonify, request, current_app


api_bp = Blueprint('api', __name__)


@api_bp.route('/api/graph', methods=['POST'])
def create_graph():
    data = request.json

    graph = nx.DiGraph()
    graph.add_weighted_edges_from(
        [(edge['from'], edge['to'], edge['weight']) for edge in data['edges']]
    )

    graph_id = str(uuid4())

    current_app.user_graphs[graph_id] = graph

    return jsonify({'graph_id': graph_id}), 201


@api_bp.route('/api/graph/<graph_id>', methods=['GET'])
def get_graph(graph_id):
    graph = current_app.user_graphs.get(graph_id)

    if graph is None:
        return jsonify({'error': 'Graph not found'}), 404

    return jsonify({'graph': nx.to_dict_of_dicts(graph)}), 200


@api_bp.route('/api/graph/', methods=['GET'])
def get_all_graphs():
    return jsonify({'graph_ids': list(current_app.user_graphs.keys())}), 200


@api_bp.route('/api/graph/<graph_id>', methods=['DELETE'])
def delete_graph(graph_id):
    graph = current_app.user_graphs.pop(graph_id, None)

    if graph is None:
        return jsonify({'error': 'Graph not found'}), 404

    return '', 204


# TODO: eventually the graphs should be stored in a database
# TODO: add