// utils/graphUtils.js
import { parse } from "papaparse";

export const processGraphData = (nodes, edges) => {
  // Prepare data for backend
  const graphData = {
    nodes: nodes.map(node => ({
      label: node.label
    })),
    edges: edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      weight: parseFloat(edge.label) || 1
    }))
  };

  // Send data to backend
  console.log("Sending graph data to backend:", graphData);

  try {
    fetch('http://127.0.0.1:5000/api/graph', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Success:', data);
        alert("Graph processing complete!");
      })
      .catch((error) => {
        console.error('Error:', error);
        alert(`Error processing graph: ${error.message}. Make sure the backend server is running at http://127.0.0.1:5000.`);
      });
  } catch (error) {
    console.error('Fetch error:', error);
    alert(`Failed to connect to backend server: ${error.message}`);
  }
};

export const importFromCSV = (file, networkNodes, networkEdges, networkInstance) => {
  parse(file, {
    header: true,
    complete: (results) => {
      const { data } = results;

      try {
        console.log("First row of CSV:", data[0]);

        // Clear existing nodes and edges
        networkNodes.clear();
        networkEdges.clear();

        // Track unique nodes and edges
        const nodeSet = new Set();
        const edgesToAdd = [];
        const edgeMap = new Map();

        // Process each row in the CSV
        data.forEach((row, index) => {
          const source = row["From"];
          const target = row["To"];
          const weight = row["Cost"];

          if (source && target) {
            // Add source and target to node set
            nodeSet.add(source);
            nodeSet.add(target);

            // Create unique edge key to avoid duplicates
            const edgeKey = `${source}-${target}`;

            // Only add if edge doesn't already exist
            if (!edgeMap.has(edgeKey)) {
              const edgeData = {
                from: source,
                to: target,
                label: weight !== undefined ? String(weight) : "1",
                id: edgeKey
              };

              edgesToAdd.push(edgeData);
              edgeMap.set(edgeKey, true);
            }
          } else {
            console.warn(`Row ${index} missing From or To:`, row);
          }
        });

        // Convert node set to array of node objects
        const nodesToAdd = Array.from(nodeSet).map(nodeId => ({
          id: nodeId,
          label: nodeId
        }));

        // Add nodes and edges to the network
        networkNodes.add(nodesToAdd);
        networkEdges.add(edgesToAdd);

        // Adjust view to fit all nodes
        if (networkInstance.current) {
          networkInstance.current.fit({ animation: true });
        }
      } catch (error) {
        console.error("Error processing CSV data:", error);
      }
    },
    skipEmptyLines: true,
    error: (error) => {
      console.error("Error parsing CSV:", error);
      alert("Error parsing CSV file. Please check the format.");
    }
  });
};