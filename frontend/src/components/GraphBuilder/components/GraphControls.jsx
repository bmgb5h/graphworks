const GraphControls = ({
  newNodeName,
  setNewNodeName,
  addNode,
  connectNodes,
  deleteSelected,
  selectedItem,
  handleFileUpload,
  processGraph
}) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addNode();
    }
  };

  return (
    <div className="flex flex-col gap-3 border p-3 rounded bg-gray-50 mt-2">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Node Name"
          value={newNodeName}
          onChange={(e) => setNewNodeName(e.target.value)}
          className="border p-2 rounded"
          onKeyPress={handleKeyPress}
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
        <button
          onClick={deleteSelected}
          disabled={!selectedItem}
          className={`p-2 rounded ${
            selectedItem ? "bg-red-500 text-white" : "bg-gray-300"
          }`}
        >
          Delete Selected
        </button>

        <div className="flex items-center ml-auto">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="p-1 border rounded"
          />
          <button
            onClick={processGraph}
            className="p-2 bg-purple-600 text-white rounded ml-2"
          >
            Process Graph
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphControls;