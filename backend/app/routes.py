import csv
import networkx as nx
import pandas as pd
from flask import Blueprint, jsonify, request

api_bp = Blueprint('api', __name__)

# test route
@api_bp.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello, World!'})
