import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Network } from "vis-network";
import { DataSet } from "vis-data";

const GraphViewer = () => {
    const { graphId } = useParams();
    const navigate = useNavigate();
    const [graphData, setGraphData] = useState(null);
    const [tspPath, setTspPath] = useState([]);
    const graphContainer = useRef(null); // Reference for the graph div

    useEffect(() => {
        if (graphData && graphContainer.current) {
            const nodes = new DataSet(graphData.nodes);
            const edges = new DataSet(graphData.edges);
            const network = new Network(graphContainer.current, { nodes, edges }, {});

            return () => network.destroy(); // Cleanup on unmount
        }
    }, [graphData]); // Re-run when graphData changes

    const fetchGraph = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/graph/${graphId}`);
            const data = await response.json();
            setGraphData(data);
        } catch (error) {
            console.error("Error fetching graph:", error);
        }
    };

    const solveTSP = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/graph/${graphId}/tsp`);
            const data = await response.json();
            setTspPath(data.path);
        } catch (error) {
            console.error("Error solving TSP:", error);
        }
    };

    const downloadCSV = () => {
        if (!graphData || !graphData.edges) {
            console.error("Graph data is missing or not loaded.");
            return;
        }
    
        const csvContent = "data:text/csv;charset=utf-8," +
            "From,To,Cost\n" +
            graphData.edges.map(edge => `${edge.source},${edge.target},${edge.weight}`).join("\n");
    
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "graph.csv");
        document.body.appendChild(link);
        link.click();
    };
    

    const goBack = () => navigate("/");

    return (
        <div>
            <h2>Graph Viewer</h2>
            <button onClick={fetchGraph}>Load Graph</button>
            {graphData && (
                <>
                    <div ref={graphContainer} style={{ width: "600px", height: "400px", border: "1px solid black" }} />
                    <button onClick={solveTSP}>Solve TSP</button>
                    <button onClick={downloadCSV}>Download CSV</button>
                </>
            )}
            <button onClick={goBack}>Back to Graph Builder</button>
        </div>
    );
};

export default GraphViewer;
