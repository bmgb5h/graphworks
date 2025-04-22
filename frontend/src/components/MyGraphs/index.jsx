import { useEffect, useState } from "react";

const MyGraphs = () => {
  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraphs = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://127.0.0.1:5000/api/graphs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { graph_ids } = await res.json();

        const graphDetails = await Promise.all(
          graph_ids.map(async (id) => {
            const detailRes = await fetch(`http://127.0.0.1:5000/api/graphs/${id}`, {
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

    fetchGraphs();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Graphs</h2>
      {loading ? (
        <p>Loading...</p>
      ) : graphs.length === 0 ? (
        <p>No graphs found.</p>
      ) : (
        <ul className="space-y-2">
          {graphs.map((graph) => (
            <li key={graph.id} className="bg-white p-4 rounded shadow">
              <p><strong>Name:</strong> {graph.name}</p>
              <p><strong>Nodes:</strong> {graph.num_nodes}</p>
              <p><strong>Edges:</strong> {graph.num_edges}</p>
              <p><strong>Created:</strong> {new Date(graph.created_at).toLocaleString()}</p>
              <p><strong>Updated:</strong> {new Date(graph.updated_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyGraphs;
