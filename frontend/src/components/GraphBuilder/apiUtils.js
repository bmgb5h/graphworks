/**
 * Prepares and sends the graph data to the backend API
 * @param {Array} nodes - The nodes to send
 * @param {Array} edges - The edges to send
 * @returns {Promise} - Promise that resolves with the response data including graph_id
 */
export const sendGraphToBackend = (nodes, edges) => {
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
    
  console.log("Sending graph data to backend:", graphData);
    
  return new Promise((resolve, reject) => {
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
      // No alert here, we'll handle UI feedback in the component
      resolve(data); // Return the data to the calling function
    })
    .catch((error) => {
      console.error('Error:', error);
      reject(error); // Return the error to the calling function
    });
  });
};