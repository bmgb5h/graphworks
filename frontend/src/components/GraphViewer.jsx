import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const GraphViewer = () => {
    const { graphId } = useParams();
    const [graphData, setGraphData] = useState(null);
    const [tspPath, setTspPath] = useState([]);
    const navigate = useNavigate

    const fetchGraph = async () => {
        try {
            const response = await fetch(`/api/graph/${graphId}`);
            const data = await response.json();
            setGraphData(data);
        } catch (error) {
            console.error("Error fetching graph:", error);
        }
    };

    const solveTSP = async () => {
        try {
            const response = await fetch(`/api/graph/${graphId}/tsp`);
            const data = await response.json();
            setTspPath(data.path);
        } catch (error) {
            console.error("Error solving TSP:", error);
        }
    };

    const downloadCSV = () => {
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

    const goBack = () => {
        navigate("/");
    }

    return (
        <div>
            <h2>Graph Viewer</h2>
            <button onClick={fetchGraph}>Load Graph</button>
            {graphData && (
                <>
                    <Graph nodes={graphData.nodes} edges={graphData.edges} />
                    <button onClick={solveTSP}>Solve TSP</button>
                    <button onClick={downloadCSV}>Download CSV</button>
                </>
            )}
            <button onClick={goBack}>Back to Graph Builder</button>
        </div>
    );
};

export default GraphViewer;
