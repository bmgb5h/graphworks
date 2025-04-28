const GraphControls = ({
    newNodeName,
    setNewNodeName,
    addNode,
    connectNodes,
    deleteSelected,
    undo,
    clearGraph,
    selectedItem,
    history
  }) => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter") addNode();
    };
  
    return (
      <div className="border p-6 rounded-lg bg-white shadow-md flex flex-wrap gap-4 items-center">
        <span className="font-semibold text-xl w-full mb-2">Build Your Own Graph</span>
        
        {/* Node Name Input */}
        <input
          type="text"
          placeholder="Node Name"
          value={newNodeName}
          onChange={(e) => setNewNodeName(e.target.value)}
          onKeyDown={handleKeyPress}
          className="border p-3 rounded-md w-48 text-base flex-shrink-0"
        />
  
        {/* Buttons */}
        <button
          onClick={addNode}
          className="px-5 py-2 bg-blue-500 text-white text-base rounded-md hover:bg-blue-600 transition"
        >
          Add Node
        </button>
        <button
          onClick={connectNodes}
          className="px-5 py-2 bg-green-500 text-white text-base rounded-md hover:bg-green-600 transition"
        >
          Connect Nodes
        </button>
        <button
          onClick={deleteSelected}
          disabled={!selectedItem}
          className={`px-5 py-2 text-base rounded-md transition ${
            selectedItem 
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Delete
        </button>
        <button
          onClick={undo}
          disabled={history.length === 0}
          className={`px-5 py-2 text-base rounded-md transition ${
            history.length > 0
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Undo
        </button>
        <button
          onClick={clearGraph}
          className="px-5 py-2 bg-orange-500 text-white text-base rounded-md hover:bg-orange-600 transition"
        >
          Clear
        </button>
      </div>
    );
  };
  
  export default GraphControls;
  