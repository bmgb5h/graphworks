import networkx as nx

def find_shortest_path(graph, source, target, algorithm='dijkstra'):
  
    if algorithm == 'dijkstra':
        return nx.shortest_path(graph, source=source, target=target, weight='weight')
    elif algorithm == 'astar':
        return nx.astar_path(graph, source=source, target=target, weight='weight')
    elif algorithm == 'bidirectional':
        return nx.bidirectional_dijkstra(graph, source, target, weight='weight')[1]
    else:
        raise ValueError("Invalid algorithm. Choose 'dijkstra', 'astar', or 'bidirectional'.")
#Link for traveling_salesman_problem function in NetworkX: https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.approximation.traveling_salesman.traveling_salesman_problem.html#networkx.algorithms.approximation.traveling_salesman.traveling_salesman_problem
def traveling_salesman_path(graph):
	tsp_path = nx.approximation.traveling_salesman_problem(graph, weight='weight',cycle=True)
	return tsp_path
