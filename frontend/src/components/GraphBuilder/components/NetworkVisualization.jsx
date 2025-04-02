import { useEffect, useRef } from "react";
import { Network } from "vis-network";
import "vis-network/dist/dist/vis-network.css";

const NetworkVisualization = ({ 
  networkNodes, 
  networkEdges, 
  networkInstance, 
  setSelectedItem, 
  setSelectedItemType 
}) => {
  const networkContainer = useRef(null);

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
                scaleFactor: 1.5,
                type: 'arrow'
              }
            },
            color: "#333",
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

        // Create network with empty datasets first
        networkInstance.current = new Network(
          networkContainer.current,
          { nodes: networkNodes, edges: networkEdges },
          options
        );

        // Handle click events for node/edge selection
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
          if (networkInstance.current) {
            networkInstance.current.destroy();
          }
        };
      } catch (error) {
        console.error("Error initializing network:", error);
      }
    }
  }, [networkEdges, networkNodes, setSelectedItem, setSelectedItemType, networkInstance]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      const deleteKeys = ["Delete", "Backspace"];
      if (deleteKeys.includes(event.key)) {
        // We need to dispatch an event or use a callback to parent
        document.dispatchEvent(new CustomEvent('deleteSelectedItem'));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={networkContainer}
      style={{ width: "100%", height: "75vh", border: "1px solid #ddd" }}
      className="bg-white"
    />
  );
};

export default NetworkVisualization;