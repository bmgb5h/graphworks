import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";

const GraphViewer = () => {
  const { graphId } = useParams();
  const [graph, setGraph] = useState(null);
  const [tspResults, setTspResults] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const networkContainerRef = useRef(null);
  const networkRef = useRef(null);
  const networkOptions = {
    layout: {
      improvedLayout: true,
      randomSeed: 1,
      hierarchical: false, // keep it natural layout
    },
    physics: {
      enabled: true,
      solver: "forceAtlas2Based",
      forceAtlas2Based: {
        gravitationalConstant: -120, // stronger repulsion
        centralGravity: 0.005,
        springLength: 400, // longer spring = more distance
        springConstant: 0.02,
        avoidOverlap: 1, // avoid node collisions
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
      font: { size: 14, color: "#000000" },
      borderWidth: 2,
      shadow: true
    },
    edges: {
      width: 2,
      shadow: true,
      font: { size: 14, align: "middle" },
      arrows: {
        to: { enabled: true, scaleFactor: 1.5, type: "arrow" }
      },
      color: "#333",
      smooth: { type: "curvedCW", roundness: 0.2 }
    },
    manipulation: { enabled: false },
    interaction: {
      hover: true,
      multiselect: false,
      dragNodes: true
    }
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
    

  useEffect(() => {
    if (!graph || !networkRef.current) return;

    // Generate the base edges with original styling
    const baseEdges = graph.graph.edges.map((edge) => ({
      id: `${edge.from}-${edge.to}`,
      from: edge.from,
      to: edge.to,
      label: edge.weight?.toString() ?? "",
      // No custom styling here - let the network options handle it
    }));

    // If a run is selected, create the highlighted edges
    if (selectedRun?.path) {
      const highlightedEdges = [];
      for (let i = 0; i < selectedRun.path.length - 1; i++) {
        const from = selectedRun.path[i];
        const to = selectedRun.path[i + 1];
        
        // Find the matching edge in baseEdges to preserve its label
        const matchingEdge = graph.graph.edges.find(e => 
          e.from === from && e.to === to
        );
        
        highlightedEdges.push({
          id: `${from}-${to}`,
          from: from,
          to: to,
          label: matchingEdge?.weight?.toString() ?? "",
          arrows: { to: { enabled: true, scaleFactor: 1.5 } },
          color: "#ff0000",
          width: 4,
          font: { size: 14, align: "middle", color: "#000000" },
        });
      }

      // Override base edges with highlighted ones
      for (const highlight of highlightedEdges) {
        const idx = baseEdges.findIndex(
          (e) => e.from === highlight.from && e.to === highlight.to
        );
        if (idx !== -1) {
          baseEdges[idx] = highlight;
        } else {
          baseEdges.push(highlight);
        }
      }
    }

    // Update the network with the current edges
    networkRef.current.setData({
      nodes: networkRef.current.body.data.nodes.get(),
      edges: baseEdges,
    });
  }, [selectedRun, graph]);

  // Handle TSP run selection/deselection
  const handleTspRunClick = (result) => {
    // If the clicked run is already selected, deselect it
    if (selectedRun?.id === result.id) {
      setSelectedRun(null);
    } else {
      // Otherwise, select the run
      setSelectedRun(result);
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
      <div className="w-80 flex-shrink-0 overflow-y-auto h-full">
        <h3 className="text-xl font-semibold mb-2">TSP Runs</h3>
        {tspResults.length === 0 ? (
          <p>No TSP results found for this graph.</p>
        ) : (
          <ul className="space-y-2">
            {tspResults.map((result) => (
              <li
                key={result.id}
                className={`p-4 rounded shadow cursor-pointer ${
                  selectedRun?.id === result.id ? "bg-red-100" : "bg-white"
                }`}
                onClick={() => handleTspRunClick(result)}
              >
                <p><strong>Algorithm:</strong> {result.algorithm}</p>
                <p><strong>Cost:</strong> {result.cost}</p>
                <p><strong>Duration:</strong> {result.time_to_calculate.toFixed(2)} seconds</p>
                <p><strong>Created:</strong> {new Date(result.created_at).toLocaleDateString()}</p>
                <p><strong>Path:</strong> {result.path.join(" → ")}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

  );  
};

export default GraphViewer;