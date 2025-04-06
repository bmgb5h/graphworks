import { parse } from "papaparse";

/**
 * Process CSV data and update the network graph
 * @param {File} file - The CSV file to process
 * @param {DataSet} networkNodes - The vis.js nodes dataset
 * @param {DataSet} networkEdges - The vis.js edges dataset
 * @param {Object} networkInstance - Reference to the vis.js network instance
 */
export const processCSVData = (file, networkNodes, networkEdges, networkInstance) => {
  parse(file, {
    header: true,
    complete: results => {
      try {
        const { data } = results;
        
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
        alert(`Error processing CSV data: ${error.message}`);
      }
    },
    skipEmptyLines: true,
    error: error => {
      console.error("Error parsing CSV:", error);
      alert("Error parsing CSV file. Please check the format.");
    }
  });
};