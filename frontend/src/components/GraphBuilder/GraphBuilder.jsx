// GraphBuilder.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataSet } from "vis-data";
import NetworkVisualization from "./components/NetworkVisualization";
import GraphControls from "./components/GraphControls";
import InstructionsPanel from "./components/InstructionsPanel";
import SelectedItemInfo from "./components/SelectedItemInfo";
import { processGraphData, importFromCSV } from "./utils/GraphUtils";

const GraphBuilder = () => {
  // Core state management
  const [newNodeName, setNewNodeName] = useState("");
  const [networkNodes] = useState(new DataSet([]));
  const [networkEdges] = useState(new DataSet([]));
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const navigate = useNavigate();
  
  // Network ref will be passed to child component but managed here
  const networkInstance = { current: null };
  
  // Handler functions
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
      networkNodes.add({
        id: newNodeName,
        label: newNodeName
      });
      setNewNodeName("");
    } catch (error) {
      console.error("Error adding node:", error);
    }
  };

  const connectNodes = () => {
    if (!networkInstance.current) return;
    networkInstance.current.addEdgeMode();
  };

  const deleteSelected = () => {
    if (selectedItem) {
      try {
        if (selectedItemType === "node") {
          const connectedEdges = networkEdges.get({
            filter: (edge) => edge.from === selectedItem || edge.to === selectedItem
          });
          networkEdges.remove(connectedEdges);
          networkNodes.remove(selectedItem);
        } else if (selectedItemType === "edge") {
          networkEdges.remove(selectedItem.id);
        }
        setSelectedItem(null);
        setSelectedItemType(null);
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    importFromCSV(file, networkNodes, networkEdges, networkInstance);
  };

  const processGraph = () => {
    if (networkNodes.length === 0) {
      alert("Please create a graph first!");
      return;
    }

    const nodes = networkNodes.get();
    const edges = networkEdges.get();
    processGraphData(nodes, edges);
  };

  const goToGraphViewer = () => {
    navigate("/graph/${graphId}");
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <InstructionsPanel />
      
      <NetworkVisualization 
        networkNodes={networkNodes}
        networkEdges={networkEdges}
        networkInstance={networkInstance}
        setSelectedItem={setSelectedItem}
        setSelectedItemType={setSelectedItemType}
      />
      
      <GraphControls
        newNodeName={newNodeName}
        setNewNodeName={setNewNodeName}
        addNode={addNode}
        connectNodes={connectNodes}
        deleteSelected={deleteSelected}
        selectedItem={selectedItem}
        handleFileUpload={handleFileUpload}
        processGraph={processGraph}
      />
      
      <SelectedItemInfo 
        selectedItem={selectedItem}
        selectedItemType={selectedItemType}
      />
      
      <button
        onClick={goToGraphViewer}
        className="p-2 bg-yellow-500 text-white rounded mt-3"
      >
        Go to Graph Viewer
      </button>
    </div>
  );
};

export default GraphBuilder;