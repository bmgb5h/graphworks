/**
 * GraphBuilder Component
 *
 * A React component that creates an interactive graph visualization using vis-network library.
 * Allows users to create nodes, connect them with weighted edges, and manipulate the graph.
 * Supports graph algorithm selection and CSV import functionality.
 */
import { useState, useEffect, useRef } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import { parse } from "papaparse";
import "vis-network/dist/dist/vis-network.css";

const GraphBuilder = () => {
  // Algorithm selection state
  const [algorithm, setAlgorithm] = useState("dijkstra");
  // State for the new node name input field
  const [newNodeName, setNewNodeName] = useState("");
  // DataSet to store graph nodes - using vis-network's DataSet for efficient updates
  const [networkNodes] = useState(new DataSet([]));
  // DataSet to store graph edges with weight information
  const [networkEdges] = useState(new DataSet([]));
  // Currently selected node or edge
  const [selectedItem, setSelectedItem] = useState(null);
  // Type of the selected item ('node' or 'edge')
  const [selectedItemType, setSelectedItemType] = useState(null);
  // Debug information to display network status
  const [debugInfo, setDebugInfo] = useState({nodesCount: 0, edgesCount: 0, lastAction: "None"});

  // Reference to the DOM element where the network will be rendered
  const networkContainer = useRef(null);
  // Reference to the vis-network instance
  const networkInstance = useRef(null);

  /**
   * Initialize the network visualization with configuration options
   * Sets up event listeners for handling node/edge selection
   */
  useEffect(() => {
    if (networkContainer.current) {
      try {
        const options = {
          nodes: {
            shape: "circle",
            size: 30,
            font: {
              size: 14,
              color: "#000000"
            },
            borderWidth: 2,
            shadow: true
          },
          edges: {
            width: 2,
            shadow: true,
            font: {
              size: 14,
              align: "middle"
            },
            arrows: {
              to: {
                enabled: true,
                scaleFactor: 1.5,  // Larger arrows for better visibility
                type: 'arrow',
                width: 2,
                color: '#333'
              }
            },
            smooth: {
              type: "curvedCW",
              roundness: 0.2
            }
          },
          physics: {
            enabled: true,
            barnesHut: {
              gravitationalConstant: -3000,
              centralGravity: 0.3,
              springLength: 150,
              springConstant: 0.04,
              damping: 0.09
            }
          },
          manipulation: {
            enabled: false,
            addEdge: function(edgeData, callback) {
              const { from, to } = edgeData;

              // Check for duplicate edges
              const existingEdges = networkEdges.get().filter(edge =>
                  edge.from === from && edge.to === to
              );

              if (existingEdges.length > 0) {
                alert("This edge already exists!");
                callback(null);
                return;
              }

              // Prompt for edge weight
              const weight = prompt("Enter edge weight (non-negative number):", "1");

              if (weight !== null && !isNaN(Number(weight)) && Number(weight) >= 0) {
                edgeData.label = weight;  // Set the weight as the edge label
                callback(edgeData);       // Accept the edge with the weight
              } else {
                callback(null);           // Cancel edge creation if invalid weight
              }
            }
          },
          interaction: {
            hover: true,
            multiselect: false,
            dragNodes: true
          }
        };

        // Create network with empty datasets first
        networkInstance.current = new Network(
            networkContainer.current,
            {nodes: networkNodes, edges: networkEdges},
            options
        );

        // Update debug info after initialization
        setDebugInfo(prev => ({
          ...prev,
          lastAction: "Network initialized",
          containerSize: `${networkContainer.current.clientWidth}x${networkContainer.current.clientHeight}`
        }));

        // Handle click events for node/edge selection
        networkInstance.current.on("click", function (params) {
          if (params.nodes.length > 0) {
            // Node clicked - set as selected item
            setSelectedItem(params.nodes[0]);
            setSelectedItemType("node");
          } else if (params.edges.length > 0) {
            // Edge clicked - get edge data and set as selected item
            const edge = networkEdges.get(params.edges[0]);
            setSelectedItem(edge);
            setSelectedItemType("edge");
          } else {
            // Background clicked - clear selection
            setSelectedItem(null);
            setSelectedItemType(null);
          }
        });

        // Clean up network on unmount
        return () => {
          if (networkInstance.current) {
            networkInstance.current.destroy();
          }
        };
      } catch (error) {
        console.error("Error initializing network:", error);
        setDebugInfo(prev => ({
          ...prev,
          lastAction: `Network initialization error: ${error.message}`
        }));
      }
    }
  }, []);  // Only run on component mount

  /**
   * Update debug counters whenever nodes or edges change
   */
  useEffect(() => {
    setDebugInfo(prev => ({
      ...prev,
      nodesCount: networkNodes.length,
      edgesCount: networkEdges.length
    }));
  }, [networkNodes, networkEdges]);

  /**
   * Add a new node to the graph
   * Validates that the node name is unique and not empty
   */
  const addNode = () => {
    if (newNodeName.trim() === "") {
      alert("Node name cannot be empty!");
      return;
    }

    if (networkNodes.get(newNodeName)) {
      alert("Node with this name already exists!");
      return;
    }

    try {
      // Add the node to the network
      networkNodes.add({
        id: newNodeName,
        label: newNodeName
      });
      setDebugInfo(prev => ({...prev, lastAction: `Added node: ${newNodeName}`}));
    } catch (error) {
      console.error("Error adding node:", error);
      setDebugInfo(prev => ({...prev, lastAction: `Node add error: ${error.message}`}));
    }

    setNewNodeName("");  // Clear the input field after adding
  };

  /**
   * Enter edge creation mode
   * Allows the user to connect two nodes by clicking on them
   */
  const connectNodes = () => {
    if (!networkInstance.current) {
      setDebugInfo(prev => ({...prev, lastAction: "Connect failed: Network not initialized"}));
      return;
    }
    networkInstance.current.addEdgeMode();
    setDebugInfo(prev => ({...prev, lastAction: "Connect mode activated"}));
  };

  /**
   * Delete the currently selected node or edge
   * When deleting a node, also removes all connected edges
   */
  const deleteSelected = () => {
    if (selectedItem) {
      try {
        if (selectedItemType === "node") {
          // Find and remove all edges connected to this node
          const connectedEdges = networkEdges.get({
            filter: (edge) =>
                edge.from === selectedItem || edge.to === selectedItem
          });
          networkEdges.remove(connectedEdges);

          // Then remove the node itself
          networkNodes.remove(selectedItem);
          setDebugInfo(prev => ({...prev, lastAction: `Deleted node: ${selectedItem}`}));
        } else if (selectedItemType === "edge") {
          // Remove the selected edge
          networkEdges.remove(selectedItem.id);
          setDebugInfo(prev => ({...prev, lastAction: `Deleted edge: ${selectedItem.id}`}));
        }
        setSelectedItem(null);
        setSelectedItemType(null);
      } catch (error) {
        console.error("Error deleting item:", error);
        setDebugInfo(prev => ({...prev, lastAction: `Delete error: ${error.message}`}));
      }
    }
  };

  /**
   * Import graph data from a CSV file
   * Expected CSV format has columns: From, To, Cost
   * @param {Event} event - The file input change event
   */
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setDebugInfo(prev => ({...prev, lastAction: `Parsing file: ${file.name}`}));

    parse(file, {
      header: true,  // Assume CSV has header row
      complete: (results) => {
        const { data } = results;

        try {
          console.log("First row of CSV:", data[0]);
          setDebugInfo(prev => ({...prev, rowsInCSV: data.length, csvSample: JSON.stringify(data[0])}));

          // Clear existing nodes and edges
          networkNodes.clear();
          networkEdges.clear();

          // Track unique nodes and edges
          const nodeSet = new Set();
          const edgesToAdd = [];
          const edgeMap = new Map();

          // Process each row in the CSV - use the exact column names you specified
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

          setDebugInfo(prev => ({
            ...prev,
            lastAction: `CSV processed: ${nodesToAdd.length} nodes, ${edgesToAdd.length} edges`,
            uniqueNodes: nodesToAdd.length,
            uniqueEdges: edgesToAdd.length
          }));

          // Adjust view to fit all nodes
          if (networkInstance.current) {
            networkInstance.current.fit({ animation: true });
          }
        } catch (error) {
          console.error("Error processing CSV data:", error);
          setDebugInfo(prev => ({...prev, lastAction: `CSV processing error: ${error.message}`}));
        }
      },
      skipEmptyLines: true,
      error: (error) => {
        console.error("Error parsing CSV:", error);
        alert("Error parsing CSV file. Please check the format.");
      }
    });
  };

  /**
   * Set up keyboard event listeners for deletion shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.key === "Delete" || event.key === "Backspace") && selectedItem) {
        deleteSelected();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem]);

  return (
      <div className="flex flex-col gap-4 p-4">
        {/* Node creation interface */}
        <div className="flex flex-col gap-4 border p-4 rounded bg-gray-100">
          <h2 className="text-lg font-semibold">Add Node</h2>
          <div className="flex gap-2">
            <input
                type="text"
                placeholder="Node Name"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                className="border p-2 rounded"
                onKeyPress={(e) => e.key === "Enter" && addNode()}
            />
            <button
                onClick={addNode}
                className="p-2 bg-blue-500 text-white rounded"
            >
              Add Node
            </button>
            <button
                onClick={connectNodes}
                className="p-2 bg-green-500 text-white rounded"
            >
              Connect Nodes
            </button>
          </div>
        </div>

        {/* Algorithm selection controls */}
        <div className="flex flex-col gap-4 border p-4 rounded bg-gray-100">
          <h2 className="text-lg font-semibold">Graph Settings</h2>
          <div className="flex gap-4 items-center">
            <label>Algorithm:</label>
            <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="border p-2 rounded w-48"
            >
              <option value="dijkstra">Dijkstra&#39;s</option>
              <option value="astar">A*</option>
              <option value="bidirectional">Bidirectional</option>
            </select>
          </div>
        </div>

        {/* File import and deletion controls */}
        <div className="flex flex-col gap-4 border p-4 rounded bg-gray-100">
          <h2 className="text-lg font-semibold">Import/Export</h2>
          <div className="flex gap-2">
            <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="p-2 border rounded"
            />
            <button
                onClick={deleteSelected}
                disabled={!selectedItem}
                className={`p-2 rounded ${
                    selectedItem ? "bg-red-500 text-white" : "bg-gray-300"
                }`}
            >
              Delete Selected
            </button>
          </div>
        </div>

        {/* User instructions and selection information */}
        <div className="mt-4 p-2 bg-gray-200 rounded text-sm">
          <p>
            <strong>Selected: </strong>
            {selectedItem
                ? selectedItemType === "node"
                    ? `Node: ${selectedItem}`
                    : `Edge: (${selectedItem.from}, ${selectedItem.to})`
                : "Nothing selected"}
          </p>
          <p className="mt-2"><strong>Instructions:</strong></p>
          <ul className="list-disc pl-5">
            <li>Add nodes using &ldquo;Add Node&ldquo;</li>
            <li>Click &ldquo;Connect Nodes&ldquo; to create an edge between two nodes</li>
            <li>Enter a weight when prompted for each edge</li>
            <li>Select a node or edge to delete it</li>
            <li>Drag nodes to reposition them</li>
            <li>Upload a CSV with columns: From, To, Cost</li>
          </ul>
        </div>

        {/* Graph visualization container */}
        <div
            ref={networkContainer}
            style={{width: "100%", height: "70vh", border: "1px solid #ddd"}}
            className="bg-white"
        />
      </div>
  );
}

export default GraphBuilder;