import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyGraphs = () => {
  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchGraphs = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://graphworks-production.up.railway.app/api/graphs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { graph_ids } = await res.json();

      const graphDetails = await Promise.all(
        graph_ids.map(async (id) => {
          const detailRes = await fetch(`https://graphworks-production.up.railway.app/api/graphs/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await detailRes.json();
          return {
            id: data.id,
            name: data.name,
            num_nodes: data.graph.nodes.length,
            num_edges: data.graph.edges.length,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
        })
      );

      setGraphs(graphDetails);
    } catch (err) {
      console.error("Failed to fetch graphs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphs();
  }, []);

  const handleView = (id) => {
    navigate(`/graphs/${id}`);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this graph?")) return;
    try {
      await fetch(`https://graphworks-production.up.railway.app/api/graphs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGraphs(graphs.filter((g) => g.id !== id));
    } catch (err) {
      console.error("Failed to delete graph:", err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Graphs</h2>
      {loading ? (
        <p>Loading...</p>
      ) : graphs.length === 0 ? (
        <p>No graphs found.</p>
      ) : (
        <ul className="space-y-4">
          {graphs.map((graph) => (
            <li key={graph.id} className="bg-white p-4 rounded shadow">
              <p><strong>Name:</strong> {graph.name}</p>
              <p><strong>Nodes:</strong> {graph.num_nodes}</p>
              <p><strong>Edges:</strong> {graph.num_edges}</p>
              <p><strong>Created:</strong> {new Date(graph.created_at).toLocaleDateString()}</p>
              <p><strong>Updated:</strong> {new Date(graph.updated_at).toLocaleDateString()}</p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleView(graph.id)}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(graph.id)}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => navigate(`/graphs/${graph.id}/edit`)}
                  className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyGraphs;
