import { useState, useEffect, useRef } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import { parse } from "papaparse";
import "vis-network/dist/dist/vis-network.css";

const GraphBuilder = () => {
  const [algorithm, setAlgorithm] = useState("dijkstra");
  const [newNodeName, setNewNodeName] = useState("");
  const [networkNodes] = useState(new DataSet([]));
  const [networkEdges] = useState(new DataSet([]));
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);

  const networkContainer = useRef(null);
  const networkInstance = useRef(null);

  useEffect(() => {
    if (networkContainer.current) {
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
            to: {enabled: true, scaleFactor: 1}
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

            // Check if this exact edge already exists
            const existingEdges = networkEdges.get().filter(edge =>
                edge.from === from && edge.to === to
            );

            if (existingEdges.length > 0) {
              alert("This edge already exists!");
              callback(null);
              return;
            }

            const weight = prompt("Enter edge weight (non-negative number):", "1");

            if (weight !== null && !isNaN(Number(weight)) && Number(weight) >= 0) {
              edgeData.label = weight;
              callback(edgeData);
            } else {
              callback(null);
            }
          }
        },
        interaction: {
          hover: true,
          multiselect: false,
          dragNodes: true
        }
      };

      networkInstance.current = new Network(
          networkContainer.current,
          {nodes: networkNodes, edges: networkEdges},
          options
      );

      networkInstance.current.on("click", function (params) {
        if (params.nodes.length > 0) {
          setSelectedItem(params.nodes[0]);
          setSelectedItemType("node");
        } else if (params.edges.length > 0) {
          const edge = networkEdges.get(params.edges[0]);
          setSelectedItem(edge);
          setSelectedItemType("edge");
        } else {
          setSelectedItem(null);
          setSelectedItemType(null);
        }
      });

      return () => {
        networkInstance.current.destroy();
      };
    }
  }, [networkNodes, networkEdges]);

  const addNode = () => {
    if (newNodeName.trim() === "") {
      alert("Node name cannot be empty!");
      return;
    }

    if (networkNodes.get(newNodeName)) {
      alert("Node with this name already exists!");
      return;
    }

    networkNodes.add({
      id: newNodeName,
      label: newNodeName
    });

    setNewNodeName("");
  };

  const connectNodes = () => {
    if (!networkInstance.current) return;
    networkInstance.current.addEdgeMode();
  };

  const deleteSelected = () => {
    if (selectedItem) {
      if (selectedItemType === "node") {
        const connectedEdges = networkEdges.get({
          filter: (edge) =>
              edge.from === selectedItem || edge.to === selectedItem
        });
        networkEdges.remove(connectedEdges);
        networkNodes.remove(selectedItem);
      } else if (selectedItemType === "edge") {
        networkEdges.remove(selectedItem.id);
      }
      setSelectedItem(null);
      setSelectedItemType(null);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    parse(file, {
      header: true,
      complete: (results) => {
        const { data } = results;
        const nodes = new Set();
        const edges = [];

        data.forEach((row) => {
          const { source, target, weight } = row;
          nodes.add(source);
          nodes.add(target);
          edges.push({ from: source, to: target, label: weight });
        });

        nodes.forEach((node) => {
          networkNodes.add({ id: node, label: node });
        });
        networkEdges.add(edges);
      }
    });
  };

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
            <li>Add nodes using "Add Node"</li>
            <li>Click "Connect Nodes" to create an edge between two nodes</li>
            <li>Enter a weight when prompted for each edge</li>
            <li>Select a node or edge to delete it</li>
            <li>Directed edges have arrows</li>
            <li>Drag nodes to reposition them</li>
          </ul>
        </div>

        <div
            ref={networkContainer}
            style={{width: "100%", height: "70vh", border: "1px solid #ddd"}}
        />
      </div>
  );
}

export default GraphBuilder;