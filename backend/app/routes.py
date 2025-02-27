import networkx as nx
import pandas as pd
from uuid import uuid4
from flask import Blueprint, jsonify, request, current_app

api_bp = Blueprint('api', __name__)

# route to receive and parse the uploaded CSV file
# TODO: add an option for a undirected graph
@api_bp.route('/api/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.csv'):
        # generate a unique ID for the graph
        graph_id = str(uuid4())

        try:
            df = pd.read_csv(file)

            G = nx.DiGraph()

            for _, row in df.iterrows():
                source = row['From']
                target = row['To']
                cost = row['Cost']

                G.add_edge(source, target, weight=cost)

            current_app.user_graphs[graph_id] = G

            return jsonify({
                'graph_id': graph_id,
                'nodes': len(G.nodes),
                'edges': len(G.edges)
            }), 200
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
    return jsonify({'error': 'Invalid file format. Please upload a csv file'}), 400

# route to get the graph data
@api_bp.route('/api/graph/<graph_id>', methods=['GET'])
def get_graph(graph_id):
    G = current_app.user_graphs.get(graph_id)

    if not G:
        return jsonify({'error': 'Graph not found'}), 404
    
    nodes = [{'id': node} for node in G.nodes]
    edges = [{'source': u, 'target': v, 'weight': d['weight']} for u, v, d in G.edges(data=True)]

    return jsonify({
        'nodes': nodes,
        'edges': edges
    }), 200

# route to get all graphs
@api_bp.route('/api/graphs', methods=['GET'])
def get_graphs():
    graphs = []

    for graph_id, G in current_app.user_graphs.items():
        graphs.append({
            'id': graph_id,
            'nodes': len(G.nodes),
            'edges': len(G.edges)
        })

    return jsonify(graphs), 200
