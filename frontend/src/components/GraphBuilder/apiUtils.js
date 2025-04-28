/**
 * Prepares and sends the graph data to the backend API
 * @param {Array} nodes - The nodes to send
 * @param {Array} edges - The edges to send
 * @returns {Promise} - Promise that resolves with the response data including graph_id
 */
export const sendGraphToBackend = (nodes, edges, graphTitle) => {
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
    fetch('http://127.0.0.1:5000/api/graphs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        name: graphTitle,
        data: graphData
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      resolve(data);
    })
    .catch((error) => {
      console.error('Error:', error);
      reject(error);
    });
  });
};