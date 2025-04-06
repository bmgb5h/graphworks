import { useState, useEffect, useRef } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import "vis-network/dist/dist/vis-network.css";
import { networkOptions } from "../GraphBuilder/networkConfig";

const TSPResult = () => {
  // State for graph ID input and results
  const [graphId, setGraphId] = useState("");
  const [resultPath, setResultPath] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pathDistance, setPathDistance] = useState(null);

  // Refs for network visualization
  const networkContainer = useRef(null);
  const networkInstance = useRef(null);
  const networkNodes = useRef(new DataSet([]));
  const networkEdges = useRef(new DataSet([]));

  // Initialize or update the network visualization when graph data changes
  useEffect(() => {
    if (!networkContainer.current || !graphData || !resultPath) return;

    try {
      // If we already have a network instance, destroy it first
      if (networkInstance.current) {
        networkInstance.current.destroy();
      }

      // Clear existing data
      networkNodes.current.clear();
      networkEdges.current.clear();

      // Add all nodes from graphData
      networkNodes.current.add(graphData.nodes);
      
      // Only add edges that are in the TSP path
      const tspEdges = createTSPPathEdges(resultPath, graphData.edgeMap);
      networkEdges.current.add(tspEdges);

      // Create modified options that disable editing
      const viewOptions = {
        ...networkOptions,
        manipulation: {
          enabled: false
        },
        physics: {
          ...networkOptions.physics,
          enabled: false // Disable physics for stable display
        },
        edges: {
          ...networkOptions.edges,
          arrows: {
            to: { enabled: true, scaleFactor: 1 }
          },
          color: { color: "#FF0000", highlight: "#FF0000" },
          width: 3
        }
      };

      // Create network with the datasets
      networkInstance.current = new Network(
        networkContainer.current,
        { nodes: networkNodes.current, edges: networkEdges.current },
        viewOptions
      );

      // Fit the network view to show all nodes
      networkInstance.current.fit();
    } catch (error) {
      console.error("Error initializing network:", error);
      setError("Failed to initialize network visualization.");
    }
  }, [graphData, resultPath]);

  // Function to create edges only for the TSP path
  const createTSPPathEdges = (path, edgeMap) => {
    const edges = [];
    
    if (!path || path.length <= 1) return edges;
    
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      
      // Find edge data for this segment
      const edgeData = edgeMap[`${from}-${to}`] || edgeMap[`${to}-${from}`];
      
      if (edgeData) {
        edges.push({
          id: `tsp-${i}`,
          from: from,
          to: to,
          label: edgeData.weight.toString(),
          weight: edgeData.weight,
          title: `Weight: ${edgeData.weight}`
        });
      }
    }
    
    return edges;
  };

  // Function to fetch the TSP result and convert adjacency list to nodes/edges
  const fetchTSPResult = async () => {
    if (!graphId.trim()) {
      setError("Please enter a graph ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, fetch the graph structure
      const graphResponse = await fetch(`http://127.0.0.1:5000/api/graph/${graphId.trim()}`);
      
      if (!graphResponse.ok) {
        throw new Error(graphResponse.status === 404 
          ? "Graph not found" 
          : "Failed to fetch graph data");
      }

      const graphResponseData = await graphResponse.json();
      
      if (graphResponseData.error) {
        throw new Error(graphResponseData.error);
      }

      const adjacencyList = graphResponseData.graph;
      
      // Then, fetch the TSP solution
      const tspResponse = await fetch(`http://127.0.0.1:5000/api/graph/${graphId.trim()}/tsp`);
      
      if (!tspResponse.ok) {
        throw new Error(tspResponse.status === 404 
          ? "TSP solution not found" 
          : "Failed to calculate TSP path");
      }

      const tspData = await tspResponse.json();
      
      if (tspData.error) {
        throw new Error(tspData.error);
      }

      // Check if we have a valid TSP path
      if (!tspData.tsp_path || tspData.tsp_path.length <= 1) {
        setError("No valid TSP path exists for this graph");
        setResultPath(null);
        setPathDistance(null);
      } else {
        setResultPath(tspData.tsp_path);
        setPathDistance(calculatePathDistance(tspData.tsp_path, adjacencyList));
      }

      // Convert adjacency list to nodes and edges for vis-network
      const { nodes, edges, edgeMap } = convertAdjacencyListToGraph(adjacencyList);
      
      // Set graph data for visualization
      setGraphData({
        nodes,
        edges,
        edgeMap
      });
    } catch (error) {
      console.error("Error fetching TSP result:", error);
      setError(error.message || "An error occurred while fetching the TSP result");
    } finally {
      setLoading(false);
    }
  };

  // Convert adjacency list format to vis-network compatible format
  const convertAdjacencyListToGraph = (adjacencyList) => {
    const nodes = [];
    const edges = [];
    const edgeMap = {}; // Map to store edge data for easy lookup
    
    // Create nodes
    Object.keys(adjacencyList).forEach(node => {
      nodes.push({
        id: node,
        label: `${node}`
      });
    });

    // Create edges
    Object.entries(adjacencyList).forEach(([from, connections]) => {
      Object.entries(connections).forEach(([to, data]) => {
        const edgeId = `${from}-${to}`;
        
        // Store edge data in the map
        edgeMap[edgeId] = {
          from,
          to,
          weight: data.weight
        };
        
        // Add edge to the collection
        edges.push({
          id: edgeId,
          from,
          to,
          label: data.weight.toString(),
          weight: data.weight,
          title: `Weight: ${data.weight}`
        });
      });
    });

    return { nodes, edges, edgeMap };
  };

  // Calculate total distance of the path
  const calculatePathDistance = (path, adjacencyList) => {
    let totalDistance = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];
      
      if (adjacencyList[from] && adjacencyList[from][to]) {
        totalDistance += adjacencyList[from][to].weight;
      } else if (adjacencyList[to] && adjacencyList[to][from]) {
        // Check the reverse direction if the graph is not fully bidirectional
        totalDistance += adjacencyList[to][from].weight;
      }
    }
    
    return totalDistance;
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="bg-white shadow-md rounded p-6">
        <h1 className="text-2xl font-bold mb-4">TSP Path Finder</h1>
        <p className="mb-4">
          Enter your graph ID to find the optimal TSP path. The system will calculate
          the shortest possible route that visits each node exactly once and returns to the origin.
        </p>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={graphId}
            onChange={(e) => setGraphId(e.target.value)}
            placeholder="Enter Graph ID"
            className="flex-1 p-2 border border-gray-300 rounded"
          />
          <button
            onClick={fetchTSPResult}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:bg-blue-300"
          >
            {loading ? "Loading..." : "Find Path"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {resultPath && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Optimal TSP Path Found:</p>
            <p>{resultPath.join(" → ")}</p>
            {pathDistance !== null && (
              <p className="mt-2">Total distance: {pathDistance.toFixed(2)}</p>
            )}
            <p className="mt-2">
              Total nodes visited: {resultPath.length}
            </p>
          </div>
        )}
      </div>

      {/* Graph visualization container */}
      <div
        ref={networkContainer}
        style={{ width: "100%", height: "60vh", border: "1px solid #ddd" }}
        className="bg-white shadow-md rounded"
      />

      {graphData && (
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-bold mb-2">Graph Details</h2>
          <p>Nodes: {graphData.nodes.length}</p>
          <p>Total edges in graph: {graphData.edges.length}</p>
          <p>Edges in TSP path: {resultPath ? resultPath.length - 1 : 0}</p>
        </div>
      )}
    </div>
  );
};

export default TSPResult;