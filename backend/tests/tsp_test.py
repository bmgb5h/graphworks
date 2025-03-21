"""
Reproducible bug with networkx 3.4.2. The function should return a
hamiltonian cycle, but an error is raised instead. The error states
that the digraph needs to have 2 or more nodes, but the digraph has 2 nodes.
The function works for any other strongly connected digraph with 2 or more
nodes as long as scipy is installed as well.
"""

import networkx as nx

G = nx.DiGraph()
G.add_edge(0, 1, weight=1)
G.add_edge(1, 0, weight=1)

try:
    tsp = nx.approximation.traveling_salesman_problem(G)
except Exception as e:
    print(e)

G.add_edge(0, 2, weight=1)
G.add_edge(2, 1, weight=1)

tsp = nx.approximation.traveling_salesman_problem(G)
print(tsp)
