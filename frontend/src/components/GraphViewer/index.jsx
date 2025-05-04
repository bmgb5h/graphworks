import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";

// TODO: GraphBuilder, GraphViewer, and GraphEditor need to be refactored

const GraphViewer = () => {
  const { graphId } = useParams();
  const [graph, setGraph] = useState(null);
  const [tspResults, setTspResults] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [algorithm, setAlgorithm] = useState("simulated_annealing");
  const [runningTsp, setRunningTsp] = useState(false);
  const networkContainerRef = useRef(null);
  const networkRef = useRef(null);

  const networkOptions = {
    layout: {
      improvedLayout: true,
      randomSeed: 1,
      hierarchical: false,
    },
    physics: {
      enabled: true,
      solver: "forceAtlas2Based",
      forceAtlas2Based: {
        gravitationalConstant: -120,
        centralGravity: 0.005,
        springLength: 400,
        springConstant: 0.02,
        avoidOverlap: 1,
      },
      maxVelocity: 50,
      stabilization: {
        iterations: 200,
        fit: true,
      },
    },
    nodes: {
      shape: "circle",
      size: 30,
      font: { size: 14, color: "#000000", align: "middle" },
      borderWidth: 2,
      shadow: true,
    },
    edges: {
      width: 2,
      shadow: true,
      font: { size: 20, align: "middle" },
      arrows: {
        to: { enabled: true, scaleFactor: 1.5, type: "arrow" },
      },
      color: "#333",
      smooth: { type: "curvedCW", roundness: 0.2 },
    },
    manipulation: { 
      enabled: false
    },
    interaction: {
      hover: true,
      multiselect: false,
      dragNodes: true
    },
  };

  useEffect(() => {
    const fetchGraphData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/graphs/${graphId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setGraph(data);

        const tspRes = await fetch(`http://127.0.0.1:5000/api/graphs/${graphId}/tsp/runs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tspData = await tspRes.json();
        setTspResults(tspData);
      } catch (err) {
        console.error("Error fetching graph data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [graphId]);

  useEffect(() => {
    if (!graph || loading || !networkContainerRef.current) return;

    const nodes = graph.graph.nodes.map((node) => ({
      id: node.label,
      label: node.label,
    }));

    const edges = graph.graph.edges.map((edge) => ({
      id: `${edge.from}-${edge.to}`,
      from: edge.from,
      to: edge.to,
      label: edge.weight?.toString() ?? "",
    }));

    networkRef.current = new Network(
      networkContainerRef.current,
      { nodes, edges },
      networkOptions
    );
  }, [graph, loading]);

  // Only update edge styles when selectedRun changes, not the entire network
  useEffect(() => {
    if (!graph || !networkRef.current) return;

    // Get the edges dataset from the network
    const edgesDataset = networkRef.current.body.data.edges;
    
    // First, reset all edges to default style
    graph.graph.edges.forEach(edge => {
      const edgeId = `${edge.from}-${edge.to}`;
      if (edgesDataset.get(edgeId)) {
        edgesDataset.update({
          id: edgeId,
          color: "#333",
          width: 2
        });
      }
    });

    // Then highlight the path edges if a run is selected
    if (selectedRun?.path) {
      for (let i = 0; i < selectedRun.path.length - 1; i++) {
        const from = selectedRun.path[i];
        const to = selectedRun.path[i + 1];
        const edgeId = `${from}-${to}`;
        
        // Check if this edge exists in our dataset
        if (edgesDataset.get(edgeId)) {
          edgesDataset.update({
            id: edgeId,
            color: "#ff0000",
            width: 4
          });
        } else {
          // If edge doesn't exist in the current direction, it might be a directed graph
          // We need to add this edge to visualize the complete path
          const matchingEdge = graph.graph.edges.find(
            (e) => e.from === from && e.to === to
          );
          
          edgesDataset.add({
            id: edgeId,
            from: from,
            to: to,
            label: matchingEdge?.weight?.toString() ?? "",
            arrows: { to: { enabled: true, scaleFactor: 1.5 } },
            color: "#ff0000",
            width: 4,
            font: { size: 14, align: "middle", color: "#000000" },
          });
        }
      }
    }
  }, [selectedRun, graph]);

  const handleTspRunClick = (result) => {
    if (selectedRun?.id === result.id) {
      setSelectedRun(null);
    } else {
      setSelectedRun(result);
    }
  };

  const handleRunTsp = async () => {
    const token = localStorage.getItem("token");
    setRunningTsp(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/graphs/${graphId}/tsp?algo=${algorithm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
  
      if (res.ok) {
        // After running TSP, fetch updated TSP results with real IDs
        const tspRes = await fetch(`http://127.0.0.1:5000/api/graphs/${graphId}/tsp/runs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tspData = await tspRes.json();
        setTspResults(tspData);
      } else {
        alert(data.error || "Failed to run TSP.");
      }
    } catch (err) {
      console.error("Error running TSP:", err);
    } finally {
      setRunningTsp(false);
    }
  };

  const handleDeleteTspRun = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this TSP run?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/graphs/${graphId}/tsp/runs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTspResults((prev) => prev.filter((run) => run.id !== id));
        if (selectedRun?.id === id) {
          setSelectedRun(null);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete TSP run.");
      }
    } catch (err) {
      console.error("Error deleting TSP run:", err);
    }
  };  

  if (loading) return <p>Loading...</p>;
  if (!graph) return <p>Graph not found.</p>;

  return (
    <div className="flex flex-row gap-8 h-[90vh]">
      {/* Graph Area */}
      <div className="flex-grow">
        <div
          ref={networkContainerRef}
          className="bg-white shadow-md rounded w-full h-full border border-gray-300"
        />
      </div>

      {/* TSP Results Panel */}
      <div className="w-96 flex-shrink-0 overflow-y-auto h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Run New TSP</h3>
          <div className="flex flex-col gap-2">
            <select
              className="border rounded p-2"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              <option value="simulated_annealing">Simulated Annealing</option>
              <option value="threshold_accepting">Threshold Accepting</option>
              <option value="greedy">Greedy</option>
              <option value="asadpour">Asadpour (Very slow, but more accurate)</option>
            </select>
            <button
              onClick={handleRunTsp}
              disabled={runningTsp}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded disabled:opacity-50"
            >
              {runningTsp ? "Running..." : "Run TSP"}
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">TSP Runs</h3>
          {tspResults.length === 0 ? (
            <p>No TSP results found for this graph.</p>
          ) : (
            <ul className="space-y-2">
              {[...tspResults].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((result) => (
                <li
                  key={result.id}
                  className={`p-4 rounded shadow cursor-pointer relative ${
                    selectedRun?.id === result.id ? "bg-red-100" : "bg-white"
                  }`}
                  onClick={() => handleTspRunClick(result)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent selecting when clicking delete
                      handleDeleteTspRun(result.id);
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                  <p><strong>Algorithm:</strong> {result.algorithm}</p>
                  <p><strong>Cost:</strong> {result.cost.toFixed(2)}</p>
                  <p><strong>Duration:</strong> {result.time_to_calculate.toFixed(2)}s</p>
                  <p><strong>Created:</strong> {new Date(result.created_at).toLocaleDateString()}</p>
                  <p><strong>Path Length:</strong> {result.path.length - 1}</p>
                  <p><strong>Path:</strong> {result.path.join(" → ")}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphViewer;